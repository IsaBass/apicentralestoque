/* eslint-disable consistent-return */
'use strict';

const functions = require('firebase-functions');
const express = require('express');
const router = express.Router();
const indexP = require('../index.js');
const authentica = require('./ags_authentic');

router.get('/', async (req, res, next) => {
    res.status(200).send({ message: 'Rota LOJAS detectada com sucesso OK' });
});

// COLETA UNICO  PEDIDO INTEIRO 
router.get('/pedido/:idPedido', async (req, res) => {

    //let CNPJ = (req.header('PJCENTRAL') || req.body.PJCENTRAL || '');
    let PJLOJA = (req.header('PJLOJA') || req.body.PJLOJA || '');
    let nPedido = (req.param('idPedido') || '');

    if (nPedido === '' || PJLOJA === '')
        return res.status(400).send({ message: "sem parametro necessario" });

    // VERIFICA DADOS NO TOKEN --validacao ocorreu antes
    var token = (req.header('x-access-token') || req.body.token || req.query.token);
    //
    var PJCENTRAL = await authentica.getPJCENTRAL(token);  //ativar isso apenas para locais que neccessite do PJCENTRAL
    if (PJCENTRAL === false)
        return res.status(400).send({ message: "sem parametro necessario: PJC" });
    //
    var temFilial = await authentica.pjLojaNoToken( token, PJLOJA); /// teste de filial
    if (temFilial !== true)
        return res.status(400).send({ message: "parametro incorreto. não autorizado" });
    ////
    // //////////// FIM VALIDACOES E GET DE TOKEN        

    //esse retorna  DocumentSnapchot...NÂO pode fazer loop em seus docume, pois recebe só 1 doc
    indexP.db.doc(PJCENTRAL).collection('pedidos').doc(PJLOJA + nPedido).get()
        //.where('CodPedido','==',nPedido).get()
        .then((doc) => {
            // if (docs.empty) {  // usar esse para muitos
            if (!doc.exists)
                return res.status(204).send({ message: "sem dados" });

            return res.status(200).send(doc.data());

        }).catch((e) => {
            return res.status(400).send({ message: 'erro no get pedido unico ', erro: e.message })
        });

});


/// GRAVA PEDIDO -- GRAVA JSON INTEIRO -- SUBSTITUI TUDO
router.post("/pedido", async (req, res) => {

    //let CNPJ = (req.header('PJCENTRAL') || req.body.PJCENTRAL || '');
    let PJLOJA = (req.header('PJLOJA') || req.body.PJLOJA || '');
    let CODPEDIDO = (req.body['CodPedido'] || '');

    if (!(PJLOJA > '') || !(CODPEDIDO > ''))
        return res.status(400).send({ message: "sem parametro necessario" });

    // VERIFICA DADOS NO TOKEN --validacao ocorreu antes
    var token = (req.header('x-access-token') || req.body.token || req.query.token);
    //
    var PJCENTRAL = await authentica.getPJCENTRAL(token);  //ativar isso apenas para locais que neccessite do PJCENTRAL
    if (PJCENTRAL === false)
        return res.status(400).send({ message: "sem parametro necessario: PJC" });
    //
    var temFilial = await authentica.pjLojaNoToken(token, PJLOJA); /// teste de filial
    if (temFilial !== true)
        return res.status(400).send({ message: "parametro incorreto. não autorizado" });
    ////
    // //////////// FIM VALIDACOES E GET DE TOKEN                


    indexP.db.doc(PJCENTRAL).collection('pedidos').doc(PJLOJA + CODPEDIDO).set(req.body)
        .then((value) => {

            return res.sendStatus(200);

        }).catch((e) => {
            return res.status(400).send({ message: 'erro no POST Pedido', erro: e.message })
        });
});


/// GRAVA PEDIDO -- GRAVA partes dO PEDIDO -- USA MERGE
router.put("/pedido", async (req, res) => {

    let PJLOJA = (req.header('PJLOJA') || req.body.PJLOJA || '');
    let CODPEDIDO = (req.body['CodPedido'] || '');

    if (!(PJLOJA > '') || !(CODPEDIDO > '') )
        return res.status(400).send({ message: "sem parametro necessario" });
    // VERIFICA DADOS NO TOKEN --validacao ocorreu antes
    var token = (req.header('x-access-token') || req.body.token || req.query.token);
    //
    var PJCENTRAL = await authentica.getPJCENTRAL(token);  //ativar isso em locais que neccessite do PJCENTRAL
    if (PJCENTRAL === false)
        return res.status(400).send({ message: "sem parametro necessario: PJC" });
    //
    var temFilial = await authentica.pjLojaNoToken(token, PJLOJA); /// teste de filial
    if (temFilial !== true)
        return res.status(400).send({ message: "parametro incorreto. não autorizado" });
    ////
    // //////////// FIM VALIDACOES E GET DE TOKEN            


    indexP.db.doc(PJCENTRAL).collection('pedidos')
        .doc(PJLOJA + CODPEDIDO)
        .set(req.body, { merge: true })
        .then(() => {

            return res.sendStatus(200);

        }).catch((e) => {
            return res.status(400).send({ message: 'erro no POST Pedido', erro: e.message })
        });
});




// DELETA PEDIDO INTEIRO 
router.delete('/pedido/:idPedido', async (req, res) => {

    let PJLOJA = (req.header('PJLOJA') || req.body.PJLOJA || '');
    let nPedido = (req.param('idPedido') || '');

    if (nPedido === '' || PJLOJA === '')
        return res.status(400).send({ message: "sem parametro necessario" });

    // VERIFICA DADOS NO TOKEN --validacao ocorreu antes
    var token = (req.header('x-access-token') || req.body.token || req.query.token);
    //
    var PJCENTRAL = await authentica.getPJCENTRAL(token);  //ativar isso apenas para locais que neccessite do PJCENTRAL
    if (PJCENTRAL === false)
        return res.status(400).send({ message: "sem parametro necessario: PJC" });
    //
    var temFilial = await authentica.pjLojaNoToken(token, PJLOJA); /// teste de filial
    if (temFilial !== true)
        return res.status(400).send({ message: "parametro incorreto. não autorizado" });
    ////
    // //////////// FIM VALIDACOES E GET DE TOKEN        

    //esse retorna  DocumentSnapchot...NÂO pode fazer loop em seus docume, pois recebe só 1 doc
    indexP.db.doc(PJCENTRAL).collection('pedidos').doc(PJLOJA + nPedido)
         .delete()
        .then((doc) => {
            
            return res.sendStatus(200);

        }).catch((e) => {
            return res.status(400).send({ message: 'erro no delete pedido ', erro: e.message })
        });

});





/// GRAVA HISTORICO DE PEDIDO
router.post("/pedido/historico", async (req, res) => {

    let PJLOJA = (req.header('PJLOJA') || '');  // << apenas no header
    let CODPEDIDO = (req.header('CODPEDIDO') || ''); // << apenas no header

    if (!(PJLOJA > '') || !(CODPEDIDO > ''))
        return res.status(400).send({ message: "sem parametro necessario" });

    // VERIFICA DADOS NO TOKEN --validacao ocorreu antes
    var token = (req.header('x-access-token') || req.body.token || req.query.token);
    //
    var PJCENTRAL = await authentica.getPJCENTRAL(token);  //ativar isso apenas para locais que neccessite do PJCENTRAL
    if (PJCENTRAL === false)
        return res.status(400).send({ message: "sem parametro necessario: PJC" });
    //
    var temFilial = await authentica.pjLojaNoToken(token, PJLOJA); /// teste de filial
    if (temFilial !== true)
        return res.status(400).send({ message: "parametro incorreto. não autorizado" });
    ////
    // //////////// FIM VALIDACOES E GET DE TOKEN                


    indexP.db.doc(PJCENTRAL).collection('pedidos')
    .doc(PJLOJA + CODPEDIDO)
    .collection('historico').add(req.body)
        .then((value) => {

            return res.sendStatus(200);

        }).catch((e) => {
            return res.status(400).send({ message: 'erro no POST HISTORICO DE Pedido', erro: e.message })
        });
});










module.exports = router;