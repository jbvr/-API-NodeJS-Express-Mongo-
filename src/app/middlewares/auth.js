// Importa o Json Web Token
const jwt = require('jsonwebtoken');

// Importa o arquivo de configuração de autenticação
const authConfig = require('../../config/auth');

// Interceptar o usuário antes de chegar no Controller usando o 'next'
module.exports = (req, res, next) => {
    // Busca a autorização enviada
    const authHeader = req.headers.authorization;

    // Verifica se o Token não foi informado
    if (!authHeader)
        // Mensagem avisando que o Token não foi informado
        return res.status(401).send({ error: 'Token não informado' });

    // Verifica se o Token está no formato correto: "Bearer ahalfk247aDUDASD2129as8dy"
    const parts = authHeader.split(' '); // Divide o Token em duas partes

    // Verifica se o Token está realmente em duas partes
    if(!parts.length === 2)
        return res.status(401).send({ error: 'Erro no Token.'});

    // Caso sim, Usa a desestruturação para receber as duas partes
    const [ scheme, token ] = parts;

    // Verifica se há a palavra Bearer no "scheme"
    if (!/^Bearer$/i.test(scheme))
        // Mensagem avisando que o Token está mal formatado
        return res.status(401).send({ error: 'Token mal formatado.'});

    // Verifica se o Token é igual à nossa chave de segurança
    jwt.verify(token, authConfig.secret, (err, decoded) => {
        // Se erro, retorna mensagem de Token inválido
        if (err) return res.status(401).send({ error: 'Token inválido.'});

        // Se validou, retorna o ID
        req.userId = decoded.id;

        // Confirma o avanço pra próxima etapa
        return next();
    });
};