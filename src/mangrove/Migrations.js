export const convertModelPropertiesToMigrationStringCode = (data, next) => {
    const { model } = data;
    const generateRow = (name, value) => {
      let rows = [];
      Object.keys(value).forEach(item => {
        rows.push(
          `${item}:  ${item === "type" ? "mangrove.DataTypes." : ""}${
            value[item]
          }`
        );
      });
      return `
      ${name}: {
        ${rows}
      }
      `;
    };
    const generateAttributes = object => {
      let attributes = [];
      Object.keys(object).forEach(item => {
        attributes.push(generateRow(item, { type: object[item] }));
      });
      return attributes;
    };
    try {
      const code = `
      module.exports = {
       up: mangrove =>   
         mangrove.createTable("${model.name}",
       {
         ${generateAttributes(model.attributes)}
       });
       down: mangrove => mangrove.dropTable("${model.name}")
    };
    `;
      model.code = { ...model.code, migration: code };
      data.model = model;
      next(data);
    } catch (err) {
      next(data, err);
    }
  };