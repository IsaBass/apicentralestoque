/* eslint-disable consistent-return */
'use strict';

const functions = require('firebase-functions');
const express = require('express');
const router = express.Router();
const indexP = require('../index.js');
const authentica = require('./ags_authentic');

router.get('/', async (req, res, next) => {

    /////////////////////////////////////////////// verif inicial
    let PJLOJA = (req.header('PJLOJA') || req.body.PJLOJA || '');
    if (!(PJLOJA > ''))
        return res.status(400).send({ message: "sem parametro necessario" });
    // 
    var token = (req.header('x-access-token') || req.body.token || req.query.token);
    //
    var PJCENTRAL = await authentica.getPJCENTRAL(token);  //ativar isso apenas para locais que neccessite do PJCENTRAL
    if (PJCENTRAL === false)
        return res.status(400).send({ message: "sem parametro necessario: PJC" });
    //
    // var temFilial = await authentica.pjLojaNoToken(token, PJLOJA); /// teste de filial
    // if (temFilial !== true)
    //     return res.status(400).send({ message: "parametro incorreto. não autorizado" });
    ////
    // //////////// FIM VALIDACOES E GET DE TOKEN

    ///
    var dat = await authentica.decodeToken(req.header('x-access-token'));

    return res.status(200).send({
        message: 'Rota LIMBO detectada com sucesso',
        dataToken: dat
    });

});

// TODO AQUI SAO SEMPRE DENTRO DO COLLECTION DA CENTRAL
// , POR ISSO NECESSARIO PJCENTRAL
/// LIMBO = Tabela pedidos simples


// COLETAR LIMBO -- apenas CENTRAL    /// NAO USA...USARIA SE FOSSE CENTRAL DELPHI
// router.post('/central', (req, res) => {

//     let CNPJ = (req.header('PJCENTRAL') || req.body.PJCENTRAL || '');

//     if (!(CNPJ > ''))
//         return res.status(400).send({ message: "sem parametro necessario" });


//     indexP.db.doc(CNPJ).collection('limbo')
//         .where('sitcentral', '==', 'PEND')
//         .get().then((docs) => {
//             if (docs.empty) {  // usar esse para muitos
//                 //if (!docs.exists) {  // usar esse para registro unico    
//                 return res.status(204).send({ message: "sem dados" });
//             }
//             let lista = [];
//             docs.forEach((doc) => {
//                 lista.push(doc.data());
//             });
//             return res.status(200).send(lista);
//         }).catch((e) => {
//             return res.status(400).send({ message: 'erro no get', erro: e.message })
//         });
// });


// COLETAR LIMBO -- apenas do proprio cnpj   loja ou central = loja
router.post('/loja', async (req, res) => {

    let PJLOJA = (req.header('PJLOJA') || req.body.PJLOJA || '');
    if (!(PJLOJA > ''))
        return res.status(400).send({ message: "sem parametro necessario" });

    // 
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

    indexP.db.doc(PJCENTRAL).collection('filiais')
        .doc(PJLOJA).collection('limbo')
        .where('sitloja', '==', 'PEND')
        //.orderBy('ultAlteracao')
        //.where('PJLOJA', '==', PJLOJA)
        .get().then((docs) => {
            if (docs.empty) {  // usar esse para muitos
                //if (!docs.exists) {  // usar esse para registro unico    
                return res.status(204).send({ message: "sem dados" });
            }
            let lista = [];
            docs.forEach((doc) => {
                var obj = {};
                obj = doc.data();
                obj['idLimbo'] = doc.id;
                lista.push(obj);
            });
            return res.status(200).send(lista);
        }).catch((e) => {
            return res.status(400).send({ message: 'erro no get', erro: e.message })
        }
        );
});


// EXCLUIR LIMBO - para nao ficar grande na base  
router.post('/delete', async (req, res) => {

    let PJLOJA = (req.header('PJLOJA') || req.body.PJLOJA || '');
    let idLimbo = (req.header('IDLIMBO') || req.body.IDLIMBO || '');

    if (!(PJLOJA > '') || !(idLimbo > ''))
        return res.status(400).send({ message: "sem parametro necessario" });

    // 
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


    indexP.db.doc(PJCENTRAL).collection('filiais')
        .doc(PJLOJA).collection('limbo')
        .doc(idLimbo).delete()
        .then(() => {
            return res.sendStatus(200);
        }).catch((e) => {
            return res.status(400).send({ message: 'erro no DELETE', erro: e.message })
        }
        );
});


///- PARA SER USADO PELA LOJA E PELA CENTRAL  -- CENTRAL NAO USA...USARIA SE FOSSE DELPHI
// - GRAVA CRIANDO O DOCUMENTO , ATUALIZA SEM NECESSIDADE DE PASSAR TODOS OS CAMPOS no json
// - OBRIGATORIO JSON COM PJCENTRAL, PJLOJA , CODPEDIDO
// router.put('/', (req, res) => {

//     let CNPJ = (req.header('PJCENTRAL') || req.body.PJCENTRAL || '');
//     let CNPJLOJA = (req.header('PJLOJA') || req.body.PJLOJA || '');
//     let CODPEDIDO = (req.body.CODPEDIDO || '');

//     if (!(CNPJ > '') || !(CNPJLOJA > '') || !(CODPEDIDO > ''))
//         return res.status(400).send({ message: "sem parametro necessario" });


//     indexP.db.doc(CNPJ).collection('limbo').doc(CNPJLOJA + CODPEDIDO)
//         .set(req.body, { merge: true })
//         .then((value) => {

//             return res.sendStatus(200);
//         }).catch((e) => {
//             return res.status(400).send({ message: 'erro no PUT', erro: e.message })
//         });
// });


module.exports = router;