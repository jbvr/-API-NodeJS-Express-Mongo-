// Importa o express
const express = require('express');

// Importa o Middleware
const authMiddleware = require('../middlewares/auth');

// Importa o Project 
const Project = require('../models/Project');

// Importa as Tasks
const Task = require('../models/Task');

// Importa o router
const router = express.Router();

// Faz as rotas utilizarem o Middleware
router.use(authMiddleware);

// Cria uma rota para listas todos os projects
router.get('/', async (req, res) => {
    try {
        // Lista todos os projects
        const projects = await Project.find().populate(['user', 'tasks']);

        // Retorna os projetos
        return res.send({ projects });

    } catch (err) {
        return res.status(400).send({ error: 'Erro ao carregar os projetos.'});
    }
});

// Cria uma rota para listar um project
router.get('/:projectId', async (req, res) => {
    try {
        // Lista todos os projects
        const project = await Project.findById(req.params.projectId).populate(['user', 'tasks']);

        // Retorna os projetos
        return res.send({ project });

    } catch (err) {
        return res.status(400).send({ error: 'Erro ao carregar o projeto.'});
    }
});

// Rota para criar
router.post('/', async (req, res) => {
    try {
        // Pega os dados
        const { title, description, tasks } = req.body;
        
        // Cria um novo project
        const project = await Project.create({ title, description, user: req.userId });

        // Percorre cada task fazendo a criação
        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id });

            // Salva a task
            await projectTask.save();
            project.tasks.push(projectTask);
        }));

        // Espera adicionar as tasks
        await project.save();


        // Retorna o projeto criado
        return res.send({ project });

    } catch (err) {
        return res.status(400).send({ error: 'Erro ao criar novo Projeto.'});
    }
});

// Rota para atualizar
router.put('/:projectId', async (req, res) => {
    try {
        // Pega os dados
        const { title, description, tasks } = req.body;
        
        // Cria um novo project
        const project = await Project.findByIdAndUpdate(req.params.projectId, 
            { title, description}, { new: true, useFindAndModify: false });

        // Deleta as Tasks antes de criar novamente
        project.tasks = [];
        await Task.deleteOne({ project: project._id });

        // Percorre cada task fazendo a criação
        await Promise.all(tasks.map(async task => {
            const projectTask = new Task({ ...task, project: project._id });

            // Salva a task
            await projectTask.save();
            project.tasks.push(projectTask);
        }));

        // Espera adicionar as tasks
        await project.save();


        // Retorna o projeto criado
        return res.send({ project });

    } catch (err) {
        return res.status(400).send({ error: 'Erro ao atualizar Projeto.'});
    }
});

// Rota para deletar
router.delete('/:projectId', async (req, res) => {
    try {
        // Lista todos os projects
        const project = await Project.findByIdAndRemove(req.params.projectId, { new: true, useFindAndModify: false });

        // Retoran status Ok
        return res.send();

    } catch (err) {
        return res.status(400).send({ error: 'Erro ao apagar o projeto.'});
    }
});

// Repassa a 'router' para o app, com o prefixo /projects.
module.exports = app => app.use('/projects', router);