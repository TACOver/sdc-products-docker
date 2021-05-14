const Pool = require('pg').Pool;
const pool = new Pool({
  user: 'tamir',
  host: 'localhost',
  database: 'sdcproducts',
  password: 'password',
  port: 5432,
});
pool.connect();

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
