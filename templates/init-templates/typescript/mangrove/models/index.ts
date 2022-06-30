const fs = require("fs");
const path = require("path");
const Mangrove = require("mangrove");
const dotenv = require("dotenv");

dotenv.config();
const basename = path.basename(__filename);
const db = {};

let mangrove;
fs.readdirSync(__dirname)
  .filter(
    file =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach(file => {
    const model = mangrove.import(path.join(__dirname, file));
    db[model.name] = model;
  });

db.mangrove = mangrove;
db.Mangrove = Mangrove;

module.exports = db;
