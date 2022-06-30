const Mangrove = require("mangrove");
const dotenv = require("dotenv");

dotenv.config();
const db = {};

db.Mangrove = Mangrove;
db = {
  ...db,
  ...Mangrove.initializeModels(__dirname)
};

module.exports = db;
