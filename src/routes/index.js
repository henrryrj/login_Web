const root = require("express").Router();
const { estaLogueado } = require('../helpers/auth');


root.get('/', estaLogueado, (req, res) => {
    res.render('index')
});

module.exports = root;