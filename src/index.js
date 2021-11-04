const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const override = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const Usuario = require('./models/usuario');
//inicializacion
const app = express();
require('./database');
require('./models/usuario');
require('./config/passport');

//settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));

app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    runtimeOptions: {                           
        //allowProtoPropertiesByDefault: true,
         allowProtoMethodsByDefault: true
    },
    extname: '.hbs',
}));
app.set('view engine', '.hbs');

//middlerwares
app.use(express.urlencoded({ extended: false }));
app.use(override('_method'));
app.use(session({
    secret: 'topicos',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//variables globales
app.use((req, res, next) => {
    res.locals.error = req.flash('error');
    res.locals.msg = req.flash('msg');
    res.locals.user = req.user || null;
    next();
});

//routes
app.use(require('./routes/index'));
app.use(require('./routes/users'));


//static files
app.use(express.static(path.join(__dirname, 'public')));


//servidor
app.listen(app.get('port'), () => {
    console.log('servidor en el port', app.get('port'));
})