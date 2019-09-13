// Importa o express
const express = require('express');

// Importa o Middleware
const authMiddleware = require('../middlewares/auth');

// Importa o router
const router = express.Router();

// Faz as rotas utilizarem o Middleware
router.use(authMiddleware);

// Cria uma rota GET na raíz
router.get('/', (req, res) => {
    res.send({ ok: true, user: req.userId });
});

// Repassa a 'router' para o app, com o prefixo /projects.
module.exports = app => app.use('/projects', router);