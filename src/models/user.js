// Importa o Mongoose
const mongoose = require('../database');

// Defini os Schemas do usuário
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Define um User usando o Schema
const User = mongoose.model('User', UserSchema);

// Exporta o User
module.exports = User;