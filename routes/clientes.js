const express = require('express');
const path = require('path');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const passport = require('passport');
const bcrypt = require("bcryptjs");

// Rota de cadastro
router.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

router.post('/cadastro', (req, res) => {
    let erros = [];
    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido!" });
    }
    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "E-mail inválido!" });
    }
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha inválida!" });
    }
    if (req.body.senha.length < 4) {
        erros.push({ texto: "Senha muito curta!" });
    }
    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "Senhas diferentes, tente novamente!" });
    }

    if (erros.length > 0) {
        res.render('cadastro', { erros: erros });
    } else {
        // Verifica se já existe um cliente com o mesmo email no banco de dados
        prisma.clientes.findUnique({
            where: {
                email: req.body.email
            }
        })
        .then(clienteExistente => {
            if (clienteExistente) {
                // Cliente já existe
                erros.push({ texto: "E-mail já cadastrado!" });
                res.render('cadastro', { erros: erros });
            } else {
                // Hash da senha usando bcrypt
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(req.body.senha, salt, (err, hash) => {
                        if (err) {
                            console.error('Erro ao gerar hash da senha:', err);
                            res.render('error');
                        } else {
                            // Cria um novo cliente com a senha hasheada
                            prisma.clientes.create({
                                data: {
                                    nome: req.body.nome,
                                    email: req.body.email,
                                    senha: hash  // Salva a senha hasheada no banco de dados
                                }
                            })
                            .then(novoCliente => {
                                console.log('Novo cliente criado:', novoCliente);
                                req.flash("success_msg", "Cliente criado com sucesso!");
                                res.redirect("/clientes/login"); 
                            })
                            .catch(error => {
                                console.error('Erro ao criar cliente:', error);
                                req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente!");
                                res.redirect("/clientes/registrocliente");
                            });
                        }
                    });
                });
            }
        })
        .catch(error => {
            console.error('Erro ao verificar cliente existente:', error);
            res.render('error');
        });
    }
});

// Rota de login e autenticação
router.get('/login', (req, res) => {
    res.render('login')
});

router.post('/login/cliente', passport.authenticate('cliente-local', {
    successRedirect: '/clientes/dashboard',
    failureRedirect: '/clientes/login',
    failureFlash: true
}));


// Rota de dashboard
router.get('/dashboard', (req, res) => {
    res.render('dashboard', {isAuthenticated: req.isAuthenticated()});
});


/*--------------------------------------------------------------------------------------
FUNÇÕES NO DASHBOARD
........................................................................................*/

// Cadastrando Produto
router.get('/cadastrarproduto', (req, res) => {
    res.render('cadproduto')
});




/*---------------------------------------------------------------------------------------*/
// Rota de logout
router.get('/sair', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Erro ao deslogar:", err);
            req.flash('error_msg', 'Erro ao deslogar');
            return res.redirect('/');
        }
        req.flash('success_msg', 'Deslogado com sucesso!');
        res.redirect('/');
    });
});

module.exports = router;
