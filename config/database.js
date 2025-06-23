const { createPool, createConnection } = require("mysql");
require("dotenv").config();

const dbEnv = process.env.DB_ENV;

const DbCredentials = process.env.DB_CREDENTIALS[dbEnv];

console.log(`DB Credentials: ${JSON.stringify(DbCredentials)}`);

const pool = createPool({
  port: DbCredentials.port,
  host: DbCredentials.host,
  user: DbCredentials.user,
  password: DbCredentials.password,
  insecureAuth: true,
  database: DbCredentials.database,
  connectionLimit: 10,
});

const connection = createConnection({
  port: DbCredentials.port,
  host: DbCredentials.host,
  user: DbCredentials.user,
  password: DbCredentials.password,
  insecureAuth: true,
  database: DbCredentials.database,
  connectionLimit: 10,
});

connection.connect((error) => {
  console.log(`Connecting to database... ${process.env}`);
  if (error) throw error;
  console.log("Database connected successfully.");
});

module.exports = {
  pool,
  connection,
};
