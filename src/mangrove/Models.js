/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'
import { getDbConfig } from './utils'

/**
 * @author Rukundo Eric
 * @class Model
 * @description this class performs the whole model oparations
 */
export default class Model {
	/**
   *
   * @param {Array} args - Request array
   * @returns {Object} - Response object
   */
	setArgs(args) {
		this.data = { args }
		return this
	}

	/**
   *
   * @returns {Object} - Response object
   */
	getData() {
		return this.data
	}

	/**
   *
   * @param {Object} data - Request object
   * @param {Object} next - Response object
   * @returns {Object} - Response object
   * @description this method takes arguments passed from cli an convert it to Model object
   */
	parseArgsToProperties(data, next) {
		const { args } = data
		try {
			const model = {
				name: args[3],
				attributes: args
					.slice(5, args.length)
					.toString()
					.split(',')
					.map(x => x.split(':').map(y => y.trim()))
					.reduce((a, x) => {
						if (!x[0] || !x[1]) {
							throw new Error(
								'Syntax Error: Attribute or its type can not be underfined!',
							)
						}
						a[x[0]] = x[1]
						return a
					}, {}),
			}
			data.model = model
			next(data)
		} catch (err) {
			next(data, err)
		}
	}

	/**
   *
   * @param {Object} data - Request object
   * @param {Object} next - Response object
   * @returns {Object} - Response object
   * @description this method takes Model object and convert it to javascript code
   */
	convertToStringCode(data, next) {
		const { model } = data
		const generateAttributes = (object) => {
			const attributes = []
			Object.keys(object).forEach((item) => {
				attributes.push(`\n\t\t\t\t\t${item}: mangrove.DataTypes.${object[item]}`)
			})
			return attributes
		}
		try {
			const code = `// ${model.name} Model
    module.exports = mangrove => {
      const ${model.name} = mangrove.define("${model.name}",
        {${generateAttributes(model.attributes)}
        }
      );
    return ${model.name};
    };
    `
			model.code = { ...model.code, model: code }
			data.model = model
			next(data)
		} catch (err) {
			next(data, err)
		}
	}

	/**
   *
   * @param {Object} data - Request object
   * @param {Object} next - Response object
   * @returns {Object} - Response object
   * @description this method takes the codes and write them in file
   */
	createFile(data) {
		data.dbConfig = getDbConfig()
		fs.writeFile(
			path.join(data.dbConfig.models, `${data.model.name}.js`),
			data.model.code.model,
			(err) => {
				if (err) throw err
			},
		)
	}

	/**
   *
   * @returns {Object} - Response object
   * @description this method execute all functions passed as parameters
   */
	async run(...funcs) {
		let { data } = this
		funcs.forEach(async (func) => {
			await func(data, (res, err) => {
				if (err) throw err
				data = res
			})
		})
		this.data = data
	}
}
