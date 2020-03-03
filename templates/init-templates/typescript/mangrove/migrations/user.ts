module.exports = {
  up: mangrove =>
    mangrove.createTable("User", [
      {
        name: "id",
        type: mangrove.DataTypes.STRING,
        constraints: {
          primaryKey: true,
          notNull: true,
          unique: true
        }
      },
      {
        name: "FirstName",
        type: mangrove.DataTypes.STRING,
        constraints: []
      },
      {
        name: "LastName",
        type: mangrove.DataTypes.STRING,
        constraints: []
      },
      {
        name: "Email",
        type: mangrove.DataTypes.STRING,
        constraints: []
      }
    ]),
  down: mangrove => mangrove.dropTable("User")
};
