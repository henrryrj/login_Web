const passport = require('passport');
const local = require('passport-local').Strategy;
const usercito = require('../models/usuario');
const pgAdmin = require('../database');

passport.use(new local({
    usernameField: 'email',
    passwordField: 'contraseña'
}, async(email, contraseña, done) => {
    const usuarioEncontrado = await pgAdmin.query(
        "SELECT * FROM usuario WHERE email = $1", [email]
    );
    var usuarioCargado = new usercito();
    usuarioCargado = usuarioCargado.insertarUsuario(usuarioEncontrado.rows);
    if (!usuarioCargado) {
        return done(null, false, { message: 'El usuario no existe' });
    } else {
        const match = await usuarioCargado.desencriptarPass(contraseña);
        if (match) {
            return done(null, usuarioCargado);
        } else {
            return done(null, false, { message: 'contraseña incorrecta!' });
        }
    }
}));

passport.serializeUser((usuarioCargado, done) => {
    done(null, usuarioCargado.id);
});

passport.deserializeUser((id, done) => {
    pgAdmin.query("SELECT * FROM usuario WHERE id = $1", [id], (err, usuarioCargado) => {
        var usuario = new usercito();
        usuario = usuario.insertarUsuario(usuarioCargado.rows);
        done(err, usuario);
    });
});