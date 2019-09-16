// Importa o Mongoose
const mongoose = require('../../database');

// Importa a biblioteca de encriptação
const bcrypt = require('bcryptjs');

// Defini os Schemas do Project
const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Define um Project usando o Schema
const User = mongoose.model('Project', ProjectSchema);

// Exporta o User
module.exports = User;