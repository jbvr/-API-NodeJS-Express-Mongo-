// Importa o Mongoose
const mongoose = require('../../database');

// Importa a biblioteca de encriptação
const bcrypt = require('bcryptjs');

// Defini os Schemas das Tasks
const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true,
    }, 
    project: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project',
        require: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true,
    },
    completed: {
        type: Boolean,
        require: true,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Define uma Task usando o Schema
const User = mongoose.model('Task', TaskSchema);

// Exporta o User
module.exports = User;