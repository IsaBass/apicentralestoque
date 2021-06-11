/* eslint-disable consistent-return */
const functions = require('firebase-functions');

const express = require('express');
const app = express();

// usa body parser para converter tuudo body em json
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// fim body parser


//carrega rotas
const rotas = express.Router();
//
const rotaAuthentica = require('./rotas/ags_authentic');
app.use('/geretoken',rotaAuthentica.geretoken);
//
const rotaLoja = require('./rotas/loja-rota.js');
app.use('/loja' , rotaAuthentica.authorize,rotaLoja);
const rotaCentral = require('./rotas/central-rota');
app.use('/central',rotaCentral);
const rotaConfig = require('./rotas/configs-rota.js');
app.use('/configs', rotaAuthentica.authorize, rotaConfig);
const rotaLimbo = require('./rotas/limbo-rota');
app.use('/limbo', rotaAuthentica.authorize, rotaLimbo);
//fim rotas


const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore().collection("CNPJS");

//let FieldValue = admin.firestore.FieldValue;

app.get("/", (request, response) => {

    return response.status(200).send({ 
        message: "API Centralizador de Estoque",
        "versao": "0.0.40",
        "Responsavel":"AGSystem Aracaju",
         "telefone":"79-99155-9790",
         //"dataHora": FieldValue.serverTimestamp()  // serve apenas para tabela
         "dataHora": Date.now()
        });
});

/// para base e teste....traz todos de um cnpj
app.get("/listar",  rotaAuthentica.authorize, (request, response) => {

    //try {
       let CNPJ = '';
       CNPJ = request.header('CNPJ');
       
     /* } catch (err) {
        return response.status(400).send({message: "sem parametro necessario", "erro": err.message});    
      }  */
   
    if(CNPJ === '') 
       return response.status(400).send({message: "sem parametro necessario"});
       
    //esse retorna  QuerySnapchot...pode fazer loop em seus documentos
    //db.doc('00801558557').collection('configs').get() 

    //esse retorna  DocumentSnapchot...NÂO pode fazer loop em seus docume, pois recebe só 1 doc
    db.get()      //doc(CNPJ).collection('configs').doc(CNPJ).get()
        .then((docs) => {
            if (docs.empty) {  // usar esse para muitos
            //if (!docs.exists) {  // usar esse para registro unico    
                return response.status(204).send({message: "sem dados"});

            }
            let lista = [];
            docs.forEach((doc) => {
                lista.push(doc.data());
            });
            
            // return response.status(200).send(docs.data());
            return response.status(200).send(lista);
        }).catch((e) => {
            return response.status(400).send({ message: 'erro no get', erro: e.message })
        }
        );
});


exports.api = functions.https.onRequest(app);  /// importante PARA FIREBASE
exports.db = db; // para as rotas poderem usar