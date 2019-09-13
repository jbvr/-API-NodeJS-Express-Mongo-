// Importa o Mongoose
const mongoose = require('../../database');

// Importa a biblioteca de encriptação
const bcrypt = require('bcryptjs');

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
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Função antes de salvar o usuário
UserSchema.pre('save', async function(next) {
    // Gera a encriptação na senha com "Força 10"
    const hash = await bcrypt.hash(this.password, 10);
    // Define a senha do usuário igual a senha encriptada
    this.password = hash;

    next();
});

// Define um User usando o Schema
const User = mongoose.model('User', UserSchema);

// Exporta o User
module.exports = User;