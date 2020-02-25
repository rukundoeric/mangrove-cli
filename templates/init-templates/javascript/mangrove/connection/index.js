const Mangrove = require('mangrove');
const dotenv = require('dotenv');

dotenv.config();

const connection = {};
const env = process.env.NODE_ENV || 'development';
const config = require('./config')[env];

const mangrove = new Mangrove(config);

connection.mangrove = mangrove;

module.exports = connection;