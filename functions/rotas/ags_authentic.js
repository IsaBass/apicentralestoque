'use strict';
const MINHACHAVE = 'teste';
const QTDHORAS = 10;

const jwt = require('jsonwebtoken');
var dateFormat = require('dateformat');

const indexP = require('../index.js');


//esta nao está sendo  utilizada pois foi incorporada na POST geretoken
// exports.generateToken = async (data) => {
//     return jwt.sign(data, MINHACHAVE, { expiresIn: '1h' });
// }


// chamada pelas funcoes que querem alguma informacao de dentro do token
exports.decodeToken = async (token) => {
    var data = await jwt.decode(token, { complete: false, JSON: true });
    return data;
}

exports.pjLojaNoToken = async (token, pjLoja) => {
    var data = await jwt.decode(token, { complete: false, JSON: true });
    try {
        var list = data.filiais;
    } catch (error) {
        return false
    }
    if (list.indexOf(pjLoja) > -1) {
        return true
    } else {
        return false
    }
}


exports.getPJCENTRAL = async (token) => {
    var data = await jwt.decode(token, { complete: false, JSON: true });
    try {
        return data.PJCENTRAL;
    } catch (error) {
        return false
    }

}

// funcao principal chamada em todas as requisicoes
exports.authorize = function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if (!token) {
        res.status(401).json({ message: "Acesso restrito" });
    } else {
        // eslint-disable-next-line prefer-arrow-callback
        jwt.verify(token, MINHACHAVE, function (error, decoded) {
            if (error) {
                return res.status(401).json({ message: "Token Inválido" });
            } else {
                return next();
            }
        });
    }
}



// /gerartoken
//exports.post('/geretoken', async (req, res, next) => {
exports.geretoken = function (req, res, next) {

    // console.log('entrou no post de gere token ' + req.header('user') + ' ' + req.header('senha'));

    let PJCENTRAL = '';
    PJCENTRAL = (req.header('PJCENTRAL') || req.body.PJCENTRAL || '');
    if (!(PJCENTRAL > '')) {
        return res.status(401).send({ message: 'dados inválidos' });
    }
    let CCHAVE = '';
    CCHAVE = (req.header('CCHAVE') || req.body.CCHAVE || '');
    if (!(CCHAVE > '')) {
        return res.status(401).send({ message: 'dados inválidos' });
    }

    // console.log('entrou no post de gere token ' + PJCENTRAL + ' ' + CCHAVE);
    // aqui localiza e valida os dados do usuario na tabela atraves dos campos enviados
    // if (!(req.header('user') === 'fulano' && req.header('senha') === '1234')) {
    //     return res.status(401).send({ message: 'dados inválidos' });
    // }

    indexP.db.doc(PJCENTRAL).get().then(async (doc) => {
        if (!doc.exists)
            return res.status(401).send({ message: 'erro de credenciais: inexistente' });
        if (doc.data().ativo !== true)
            return res.status(401).send({ message: 'erro de credenciais: empresa inativa' });
        if (doc.data().tipo !== 'CENTRAL')
            return res.status(401).send({ message: 'erro de credenciais: empresa inválida' });
        if (doc.data().CCHAVE !== CCHAVE)
            return res.status(401).send({ message: 'erro de credenciais' });


        let filiais = [];
        var docFiliais = await indexP.db.doc(PJCENTRAL)
            .collection('filiais')
            .where('ativo', '==', true)
            .get();
        docFiliais.docs.forEach((fil, index) => {
           
            //var dd = fil.data();
            filiais.push( fil.data().cnpj);
        });

        // for (const key in docFiliais.docs) {
        //     if (object.hasOwnProperty(key)) {
        //         const element = docFiliais.docs[key];
                
        //     }
        // }

        // let filiais = doc.data().filiais;
        // dados que irao dentro do token
        const data = {
            PJCENTRAL: PJCENTRAL,
            filiais: filiais
        };

        const expiraInt = Date.now() + (QTDHORAS * 60 * 60 * 1000); // QTDhoras * 60 MIN * 60 SEG * 1000 MILISEGUNDOS
        // const expira = dateFormat(expiraInt, 'isoDateTime', false);

        const expStr = String(QTDHORAS) + 'h';
        const token = jwt.sign(data, MINHACHAVE, { expiresIn: expStr });

        // dados retornados junto com a requisicao   
        return res.status(200).send({
            token: token,
            expireDate: expiraInt
            //filiais: filiais
        });

    }).catch((e) => {
        return res.status(401).send({ message: 'erro ao pesquisar suas credenciais', erro: e.message });
    });



};



