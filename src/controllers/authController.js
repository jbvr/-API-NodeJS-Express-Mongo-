// Importa o Express pra controle de rotas
const express = require('express');

// Importa o Bcrypt
const bcrypt = require('bcryptjs');

// Importa o Jason Web Token
const jwt = require('jsonwebtoken');

// Importa o arquivo de configuração da autenticação
const authConfig = require('../config/auth');


// Importa o usuário
const User = require('../models/User');

// Buscar do express uma função que retona uma classe, pra definir as rotas só pra usuários
const router = express.Router();

// Função que gera o Token
function generateToken(params = {}) {
    //Gerar Token com ID + Hash único
return jwt.sign(params, authConfig.secret, {
    expiresIn: 86400,
});
}

// Rota de cadastro
router.post('/register', async (req, res) => {
    // Cria o usuário quando a rota for acessada
    
    // Pega o valor do e-mail
    const { email } = req.body;

    try {

        // Verifica se o usuário já existe
        if (await User.findOne({ email }))
        // Retorna o erro
        return res.status(400).send({ error: 'Usuário já existe.' });

        const user = await User.create(req.body);

        // Faz a senha não ser exibido como retorno
        user.password = undefined;

        // Retorna o usuário com Token
        return res.send({
            user,
            token: generateToken({ id: user.id }),       
        });
        } catch (err) {
            return res.status(400).send({ error: 'Falha no Registro' });
        }
});

// Rota de autenticação
router.post('/authenticate', async (req, res) => {
    // Campos enviados para autenticação
    const { email, password } = req.body;

    // Busca o e-mail para ver se existe e chama o password
    const user = await User.findOne({ email }).select('+password');

    // Verifica se o usuário não existe e envia um erro
    if (!user)
        return res.status(400).send({ error: 'Usuário não encontrado.' });

    // Compara o email digitado com o email de registro, usando o Bcrypt
    if (!await bcrypt.compare(password, user.password))
        // Retorna a mensagem de erro 'Senha inválida.'
        return res.status(400).send({ error: 'Senha inválida.'});
    
    // Remove a senha
    user.password = undefined;

    // Retorna o usuário caso tenha sucesso em logar + função de gerarToken
    res.send({
        user,
        token: generateToken({ id: user.id }),
    });
});

// Repassa a 'router' para o app, com o prefixo /auth.
module.exports = app => app.use('/auth', router);