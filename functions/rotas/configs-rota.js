/* eslint-disable consistent-return */
'use strict';

const functions = require('firebase-functions');
const express = require('express');
const router = express.Router();
const indexP = require('../index.js');
const authentica = require('./ags_authentic');


/// COLETA O UNICO REGISTRO DA TABELA CONFIGS
// OBRIGATORIO: HEADER CNPJ ( = LOJA OU CENTRAL)
router.get("/", (request, response) => {

    let CNPJ = (request.header('CNPJ') || '');

    if (!(CNPJ > ''))
        return response.status(400).send({ message: "sem parametro necessario" });

    //esse retorna  DocumentSnapshot...NÂO pode fazer loop em seus docume, pois recebe só 1 doc
    indexP.db.doc(CNPJ)
     //.collection('configs').doc(CNPJ)
     .get()
        .then((docs) => {

            if (!docs.exists)  // usar esse para registro unico    
                return response.status(204).send({ message: "sem dados" });
            return response.status(200).send(docs.data());

        }).catch((e) => {
            return response.status(400).send({ message: 'erro no get', erro: e.message })
        });
});


// GRAVA INFORMAÇÕES DO CONFIG
// NAO CRIA TEBAELA CONFIG...ELA DEVE SER CRIADA DE OUTRA FORMA
router.put("/", (request, response) => {
    
    let CNPJ = (request.header('CNPJ') || '');

    if (!(CNPJ > ''))
        return response.status(400).send({ message: "sem parametro necessario" });

    // .update altera e cria campo igual a merge true, porem apenas .set cria o documento caso nao exista
    // vou deixar update por seguranca dessas configs, impedir que alguem crie todas cofigs de um novo cnpj
    indexP.db.doc(CNPJ)
    //.collection('configs').doc(CNPJ)
    .update(request.body)     //.set(request.body, {merge: true})
        .then((value) => {

            return response.status(200).json(value);

        }).catch((e) => {
            return response.status(400).send({ message: 'erro no PUT', erro: e.message })
        });
});


module.exports = router;