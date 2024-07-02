const localStrategy = require("passport-local").Strategy;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");

// Estratégia para Clientes
module.exports = function(passport) {

    passport.use('cliente-local', new localStrategy({ usernameField: 'email', passwordField: 'senha' }, (email, senha, done) => {
        prisma.clientes.findUnique({
            where: { email: email }
        })
        .then(cliente => {
            if (!cliente) {
                return done(null, false, { message: 'Esta conta não existe!' });
            }
            bcrypt.compare(senha, cliente.senha, (erro, batem) => {
                if (batem) {
                    return done(null, cliente);
                } else {
                    return done(null, false, { message: 'Senha incorreta!' });
                }
            });
        })
        .catch(err => {
            return done(err);
        });
    }));

    // Serialização do usuário
    passport.serializeUser((user, done) => {
        done(null, { id: user.id, type: 'Cliente' });
    });

    // Desserialização do usuário
    passport.deserializeUser((obj, done) => {
        prisma.clientes.findUnique({
            where: { id: obj.id }
        })
        .then(cliente => {
            done(null, cliente);
        })
        .catch(err => {
            done(err, false);
        });
    });
};
