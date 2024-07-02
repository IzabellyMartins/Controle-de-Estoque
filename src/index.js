const { engine } = require('express-handlebars');
const path = require ('path');
const express = require ('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const bodyparser = require("body-parser");
const session = require('express-session');
const flash = require('connect-flash'); 
const passport = require("passport");
require('../config/auth')(passport);
const app = express();

// Middleware de Sessão
app.use(session({
    secret: 'controledeestoque',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Middleware global para mensagens flash e logs de depuração
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Configuração do body-parser
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());


// Servir arquivos estáticos (CSS, imagens, etc.)
app.use(express.static(path.join(__dirname, '../public')));

// Configurando o Handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '../views/layouts'),
    partialsDir: path.join(__dirname, '../views/partials'),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }
}));

app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../views'));

// Rotas de autenticação
const auth = require('../config/auth');
app.use("/auth", auth);

// Rota
app.get('/', (req, res) => {
    res.render('inicio');
});

// Rota de clientes
const clientes = require('../routes/clientes');
app.use("/clientes", clientes);

// Servidor
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Servidor rodando na url: http://localhost:${PORT}/`);
});
