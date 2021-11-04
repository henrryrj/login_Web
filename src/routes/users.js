const root = require("express").Router();
const { text } = require("express");
const pgAdmin = require("../database");
var User = require('../models/usuario');
const passport = require('passport');

root.get('/users/signin', (req, res) => {
    res.render('users/signin');
});

root.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/perfil',
    failureRedirect: '/users/signin',
    failureFlash: true
}));
root.get('/users/signup', (req, res) => {
    res.render('users/signup');
});

root.post('/users/signup', async(req, res) => {
    var { name, telefono, email, genero, contraseña, contraseña1, direccion } = req.body;
    var id = 0;
    const errores = [];
    if (name == "") {
        errores.push({ text: 'Debe ingresar un Nombre!' });
    }
    if (email == "") {
        errores.push({ text: 'Debe ingresar un Email!' });
    }
    if (genero == "seleccionar") {
        errores.push({ text: 'Debe seleccionar su genero!' });
    }
    if (contraseña == "" || contraseña1 == "") {
        errores.push({ text: 'Su contraseña no coicide!' });
    }
    if (contraseña != contraseña1) {
        errores.push({ text: 'Su contraseña no coicide!' });
    }
    if (errores.length > 0) {
        res.render('users/signup', { errores, name, telefono, email, genero, contraseña, contraseña1, direccion });
    } else {
        const consulta = await pgAdmin.query("SELECT * FROM usuario WHERE email = $1", [email]);
        console.log(consulta.rows);
        if (consulta.rows.length > 0) {
            errores.push({ text: 'El email ya esta registrado' });
            res.render('users/signup', { errores, name, telefono, email, genero, contraseña, contraseña1, direccion });
        } else {
            var usuarioActual = new User(id, name, telefono, email, genero, contraseña, direccion);
            usuarioActual.contraseña = await usuarioActual.encriptarPass(contraseña);
            await pgAdmin.query(
                "INSERT INTO usuario (name,telefono, email, genero,contraseña, direccion) VALUES ($1,$2,$3,$4,$5,$6)", [
                    usuarioActual.name,
                    usuarioActual.telefono,
                    usuarioActual.email,
                    usuarioActual.genero,
                    usuarioActual.contraseña,
                    usuarioActual.direccion
                ]
            );
            req.flash('msg', 'Registrado Correctamente!');
            res.redirect('/users/signin');
        }
    }
});


root.get('/users/cerrarSession', (req, res) => {
    req.logout();
    res.redirect('/users/signin');
})
module.exports = root;