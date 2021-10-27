const helpers = {};

helpers.estaLogueado = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error', 'No estas autorizado. Debe iniciar session!');
        res.redirect('/users/signin');

    }
}
module.exports = helpers;