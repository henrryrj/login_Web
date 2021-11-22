const { Pool } = require("pg");

const pgAdmin = new Pool({
  host: 'ec2-35-169-204-98.compute-1.amazonaws.com',
  port: '5432',
  user: 'hctyepugenxwkt',
  password: 'd4dc32ac571f743dc92b0624eaad75836e813b64aa8dfad7090e9a47ca25c1a2',
  database: 'dcf8dnk1pvrgl5',
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pgAdmin;