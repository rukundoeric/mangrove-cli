import fs from "fs";
import path from "path";
import { getDbConfig } from "./utils";

/**
 * @author Kwizera Aime Elvis
 * @class Seeder
 * @description This Class Handles Seediing data Operations
 */
export default class Seeders {
  /**
   *
   * @param {Array} args - Request array
   * @returns {Object} - Response object
   */
  setArgs(args) {
    this.data = { args };
    return this;
  }

  /**
   *
   * @param {Object} data - Data object
   * @param {Function} next - Callback Function
   * @returns {Object} - Response object
   */
  parseArgsToProperties(data, next) {
    const { args } = data;
    try {
      const seeder = {
        name: args[3]
      };
      data.seeder = seeder;
      next(data);
    } catch (err) {
      next(data, err);
    }
  }

  /**
   *
   * @param {Object} data - Data object
   * @param {Object} next - Callback Function
   * @returns {Object} - Response object
   */
  convertToStringCode(data, next) {
    const { seeder } = data;
    try {
      const code = `
        module.exports = {
          up: mangrove => mangrove.Insert(${seeder.name}, [{

          },
          {

          }
          ], {}), }`;
      seeder.code = { ...seeder.code, seeder: code };
      data.seeder = seeder;
      next(data);
    } catch (err) {
      next(data, err);
    }
  }

  /**
   *
   * @param {Object} data - Data object
   * @returns {Object} - Responbject
   */
  createFile(data) {
    data.dbConfig = getDbConfig();
    fs.writeFile(
      path.join(data.dbConfig.seeders, `${data.seeder.name}.js`),
      data.seeder.code.seeder,
      err => {
        if (err) throw err;
      }
    );
  }

  /**
   *
   * @returns {Object} - Response object
   * @description this method execute all functions passed as parameters
   */
  async run(...funcs) {
    let { data } = this;
    for (let i = 0; i < funcs.length; i += 1) {
      await funcs[i](data, (res, err) => {
        if (err) throw err;
        data = res;
      });
    }
    this.data = data;
  }
}
