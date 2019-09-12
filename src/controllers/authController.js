// Importa o Express pra controle de rotas
const express = require('express');

// Importa o usuário
const User = require('../models/User');

// Buscar do express uma função que retona uma classe, pra definir as rotas só pra usuários
const router = express.Router();

// Rota de cadastro
router.post('/register', async (req, res) => {
    // Cria o usuário quando a rota for acessada
    try {
        const user = await User.create(req.body);
        // Retorna o usuário
        return res.send({ user });
        } catch (err) {
            return res.status(400).send({ error: 'Falha no Registro' });
        }
});

// Repassa a 'router' para o app, com o prefixo /auth.
module.exports = app => app.use('/auth', router);