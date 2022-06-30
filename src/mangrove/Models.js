/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable require-jsdoc */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */
/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'
import {
	getDbConfig,
	createTableQuestions,
	removeUnderfinedProps,
	displayTable
} from './utils'
import Migrations from './Migrations'

/**
 * @author Rukundo Eric
 * @class Model
 * @description this class performs the whole model oparations
 */
export default class Model {
	/**
   *
   * @returns {Object} - Response object
   */
	constructor() {
		this.migrations = new Migrations()
	}

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
   * @param {Object} data - Data object
   * @param {Function} next - Callback Function
   * @returns {Object} - Response object
   */
	async generateObjectModel(data, next) {
		try {
			data.dbConfig = getDbConfig()
			let stopPromptColmns = false
			let table = await inquirer.prompt(createTableQuestions.name)
			const columns = {}
			const ask = async (step) => {
				let addCol = {}
				if (step > 0) {
					displayTable(table)
					addCol = await inquirer.prompt(createTableQuestions.addNewColumn)
					if (addCol.addCol) {
						const { columnName } = await inquirer.prompt(
							createTableQuestions.column
						)
						const { type } = await inquirer.prompt([
							createTableQuestions.columnDetails[0]
						])
						const d = createTableQuestions.columnDetails
						let prop = await inquirer.prompt(
							type === 'INTEGER' ? d.slice(1, d.length) : d.slice(2, d.length)
						)

						prop = {
							...prop,
							type
						}

						if (prop.references) {
							let status = false
							let references = {}
							let selectedModel = {}
							const models = require(path.join(data.dbConfig.models, 'index'))
								.Models
							if (Object.keys(models).length > 0) {
								const { status: sts } = await inquirer.prompt(
									createTableQuestions.existingModel
								)
								status = sts
							}

							if (status) {
								selectedModel = await inquirer.prompt(
									createTableQuestions.referencesModel(models)
								)
								references = { ...references, ...selectedModel }
							}

							references = {
								...references,
								...(await inquirer.prompt(
									createTableQuestions.referencesDetails(
										status ? models : undefined,
										selectedModel
									)
								))
							}
							prop.references = references
						}
						columns[columnName] = prop
					} else {
						stopPromptColmns = true
					}
				} else {
					addCol = await inquirer.prompt(createTableQuestions.addIdColumn)
					columns.id = {
						type: 'INTEGER',
						unique: true,
						allowNull: true,
						primaryKey: true,
						autoIncreament: true
					}
					table.columns = columns
				}
				process.removeAllListeners()
			}
			for (let i = 0; !stopPromptColmns; i = +1) {
				await ask(i)
			}
			table = removeUnderfinedProps(table)
			displayTable(table)
			const { continuee } = await inquirer.prompt(
				createTableQuestions.applyModel
			)
			if (!continuee) {
				process.exit(1)
			}
			table.columns = columns
			data.model = table
			next(data)
		} catch (err) {
			next(data, next)
		}
	}

	/**
   *
   * @param {Object} data - Data object
   * @param {Function} next - Callback Function
   * @returns {Object} - Response object
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
								'Syntax Error: Attribute or its type can not be underfined!'
							)
						}
						a[x[0]] = x[1]
						return a
					}, {})
			}
			data.model = model
			next(data)
			console.log(data)
		} catch (err) {
			next(data, err)
		}
	}

	/**
   *
   * @param {Object} data - Data object
   * @param {Object} next - Callback Function
   * @returns {Object} - Response object
   */
	convertToStringCode(data, next) {
		const { model } = data
		const generateAttributes = (object) => {
			const attributes = []
			Object.keys(object).forEach((item) => {
				attributes.push(
					`\n\t\t${item}: mangrove.DataTypes.${object[item].type}`
				)
			})
			return attributes
		}
		try {
			const code = `// ${model.name} Model
module.exports = mangrove => {
	const ${model.name} = mangrove.define("${model.name}", {\t${generateAttributes(model.columns)}
	});
	return ${model.name};
};
`
			model.code = { ...model.code, model: code }
			data.model = model
			console.log(model)
			next(data)
		} catch (err) {
			next(data, err)
		}
	}

	/**
   *
   * @param {Object} data - Data object
   * @param {Object} next - Callback Function
   * @returns {Object} - Responbject
   */
	createFile(data) {
		fs.writeFile(
			path.join(data.dbConfig.models, `${data.model.name}.js`),
			data.model.code.model,
			(err) => {
				if (err) throw err
			}
		)
	}

	/**
   *
   * @returns {Object} - Response object
   * @description this method execute all functions passed as parameters
   */
	async run(...funcs) {
		let { data } = this
		for (let i = 0; i < funcs.length; i += 1) {
			await funcs[i](data, (res, err) => {
				if (err) throw err
				data = res
			})
		}
		this.data = data
	}
}
