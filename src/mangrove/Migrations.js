/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'
import Listr from 'listr'
import chalk from 'chalk'
import { getDbConfig } from './utils'


/**
 * @author Rukundo Eric
 * @class Migrations
 * @description this class performs the whole Migrations oparations
 */
export default class Migrations {
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
   * @param {Object} data - Data object
   * @param {Object} next - Callback Function
   * @returns {Object} - Response object
   * @description this method takes Model object and convert it to javascript code
   */
	convertToStringCode(data, next) {
		const { model } = data
		const generateRow = (name, value) => {
			const rows = []
			Object.keys(value).forEach((item) => {
				rows.push(
					`${item}:  ${item === 'type' ? 'mangrove.DataTypes.' : ''}${
						value[item]
					}`
				)
			})
			return `
        ${name}: {
          ${rows}
        }
      `
		}
		const generateAttributes = (object) => {
			const attributes = []
			Object.keys(object).forEach((item) => {
				attributes.push(`\t\t${generateRow(item, { type: object[item] })}`)
			})
			return attributes
		}
		try {
			const code = `
  module.exports = {
    up: mangrove =>   
      mangrove.createTable("${model.name}",
       {${generateAttributes(model.attributes)}}),
    down: mangrove => mangrove.dropTable("${model.name}")
};
    `
			model.code = { ...model.code, migration: code }
			data.model = model
			console.log(data)
			next(data)
		} catch (err) {
			next(data, err)
		}
	}

	/**
   *
   * @param {Object} data - Data object
   * @param {Object} next - Callback Function
   * @returns {Object} - Response object
   * @description this method takes the codes and write them in file
   */
	createFile(data) {
		data.dbConfig = getDbConfig()
		fs.writeFile(
			path.join(data.dbConfig.migrations, `${new Date().getTime().toString()}-create-${data.model.name.toLowerCase()}.js`),
			data.model.code.migration,
			(err) => {
				if (err) throw err
			},
		)
	}

	/**
   *
   * @param {Object} data - Data object
   * @param {Object} next - Callback Function
   * @returns {Object} - Response object
   * @description this method takes the codes and write them in file
   */
	async testDbConnection(data, next) {
		const mangrove = require('mangrove')
		mangrove.connect((err) => {
			if (err) next(data, err)
			next(data)
		})
	}

	/**
   *
   * @param {Object} data - Data object
   * @param {Object} next - Callback Function
   * @returns {Object} - Response object
   * @description this method takes the codes and write them in file
   */
	async migrate(data, next) {
		const mangrove = require('mangrove')
		data.dbConfig = getDbConfig()
		const migrationsDir = data.dbConfig.migrations
		const tasks = []
		fs.readdirSync(path.join(migrationsDir, ''))
			.filter(
				file => file.slice(-3) === '.js'
			)
			.forEach((file) => {
				const task = {}
				task.title = `migrating ${file.substring(0, file.length - 3)}`
				task.task = () => require(path.join(migrationsDir, file)).up(mangrove)
				tasks.push(task)
			})
		await new Listr(tasks).run()
		data.finish = { message: 'Migrated successful!' }
		next(data)
	}

	/**
   *
   * @param {Object} data - Data object
   * @returns {Boolean} - Response boolean
   * @description this method takes the codes and write them in file
   */
	async finish(data) {
		const { finish } = data
		console.log(`%s ${finish.message}`, chalk.green.bold('DONE'))
		process.exit(1)
		return true
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
