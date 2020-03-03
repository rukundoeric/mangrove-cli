const dotenv = require("dotenv");

const config = {};
dotenv.config();
config.development = {
  connectionString: process.env.DEV_DATABASE_URL,
  database: 'postgres'
};

config.staging = {
  connectionString: process.env.STAG__DATABASE_URL,
  database: 'postgres'
};

config.test = {
  connectionString: process.env.DATABASE_URL,
  database: 'postgres',
};

config.production = {
  dbUrl: process.env.PROD_DATABASE_URL,
  database: 'postgres'
};

module.exports = config;
