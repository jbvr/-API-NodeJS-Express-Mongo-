// Importa o Path pra trabalhar com caminhos
const path = require ('path');

// Importa o Nodemailer
const nodemailer = require ('nodemailer');

// Importa o Template Handlebars (usado pra preencher variáveis num template html
const hbs = require('nodemailer-express-handlebars');

// Importa os dados de configuração
const { host, port, user, pass } = require('../config/mail.json');

// Código de transporte (criado pelo mailtrap)
const transport = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass },
});

//Configura o Handlebars
const handlebarOptions = {
    viewEngine: {
        extName: '.html',
        partialsDir: path.resolve('./src/resources/mail/'),
        layoutsDir: path.resolve('./src/resources/mail/'),
        defaultLayout:'',
    },
    viewPath: path.resolve('./src/resources/mail/'),
    extName: '.html',
}
transport.use('compile', hbs(handlebarOptions));

// Exporta o transporte
module.exports = transport;