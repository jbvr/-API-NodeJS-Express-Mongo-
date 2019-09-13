// Importa o Express pra controle de rotas
const express = require('express');

// Importa o Bcrypt
const bcrypt = require('bcryptjs');

// Importa o Jason Web Token
const jwt = require('jsonwebtoken');

// Importa o Crypto pra gerar Tokens únicos
const crypto = require('crypto');

// Importa o Transporter
const mailer = require('../../modules/mailer');

// Importa o arquivo de configuração da autenticação
const authConfig = require('../../config/auth');

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

// Rota de "Esqueci a senha"
router.post('/forgot_password', async (req, res) => {
    // Recupera o e-mail
    const { email } = req.body;
    

    try {
        // Verificar se o e-mail está cadastrado na base de dados
        const user = await User.findOne({ email });

        // Se não encontrar retorna o erro
        if(!user)
        return res.status(400).send({ error: 'Usuário não encontrado' });

        // Gera um token aleatório em string hex
        const token = crypto.randomBytes(20).toString('hex');

        // Cria uma data de expiração pro token
        const now = new Date();
        now.setHours(now.getHours() + 1);

        // Procura o usuário e atualiza os dados de Reset
        await User.findByIdAndUpdate(user.id, {

            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now,
            }
        }, { new: true, useFindAndModify: false }
        );

        // Ativar nodemailer
        mailer.sendMail({
            to: email,
            from: 'diego@rocketseat.com.br',
            template: 'auth/forgot_password',
            context: { token },
        }, (err) => {
            // Envia uma mensagem de erro caso o e-mail não consiga ser enviado
            if (err)
            return res.status(400).send({ error: 'O e-mail de recuperação de senha não pôde ser enviado.'});

            // Caso funcione, retorna um status code 200 de sucesso
            return res.send();
        })

    } catch (err) {
        res.status(400).send({ error: 'Erro, tente novamente.' });
    }
});

// Rota de Resetar senha
router.post('/reset_password', async (req, res) => {
    // Recebo os dados
    const { email, token, password} = req.body;

    try {
        // Procura o usuário no Banco
        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpires');

        // Verifica se o usuário existe, caso não dá mensagem de erro
        if(!user)
            return res.status(400).send({ error: 'Usuário não encontrado.'});
            
        // Verifica se o Token recebido é igual o token no cadastro
        if(token !== user.passwordResetToken)
            return res.status(400).send({ error: 'Token inválido.'});

        // Pega a data atual 
        const now = new Date();

        // Verifica se o Token não está inspirado
        if (now > user.passwordResetExpires)
            return res.status(400).send({ error: 'Token expirado, você precisa gerar um novo.'});
            
        // Define o password do usuário com o novo password recebido    
        user.password = password;

        // Salva o usuário
        await user.save();

        // Envia uma confirmação com sucesso
        res.send();

    } catch (err) {
        res.status(400).send({ error: 'Não foi possível resetar a senha, tente novamente.'});
    }

});

// Repassa a 'router' para o app, com o prefixo /auth.
module.exports = app => app.use('/auth', router);