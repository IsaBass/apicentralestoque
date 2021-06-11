/* eslint-disable consistent-return */
'use strict';

const functions = require('firebase-functions');
const express = require('express');
const router = express.Router();
const indexP = require('../index.js');

router.get('/', (req, res, next) => {
   return res.status(200).send({ message: 'Rota CENTRAL detectada com sucesso' });
});





module.exports = router;