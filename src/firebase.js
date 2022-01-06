const admin = require('firebase-admin');
var serviceAccount = require('../encuestasapp-e3fc3-firebase-adminsdk-47zop-d135672a22.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://encuestasapp-e3fc3-default-rtdb.firebaseio.com/',
});

const dbFire = admin.database();

module.exports = dbFire;