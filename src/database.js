const { Pool } = require("pg");

const pgAdmin = new Pool({
    host: 'localhost',
    port: '5432',
    user: 'postgres',
    password: '0406',
    database: 'encuesta_web'
});

module.exports = pgAdmin;