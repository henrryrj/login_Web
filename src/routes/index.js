const root = require("express").Router();
const { estaLogueado } = require('../helpers/auth');


root.get('/', (req, res) => {
    res.render('index')
});

root.get('/perfil',estaLogueado, (req,res)=>{
    res.render('users/perfil');
})

module.exports = root;