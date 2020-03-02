/* eslint-disable no-await-in-loop */
/* eslint-disable no-loop-func */
import arg from 'arg'
import path from 'path'
import Listr from 'listr'
import mkdirp from 'mkdirp'
import inquirer from 'inquirer'
import fs from 'fs'
import { promisify } from 'util'
import { runCommand, getDbConfig } from './utils'
import { getInitTempleteDirectory, copyTemplateFiles } from './filesHandler'

const access = promisify(fs.access)

/**
 * @author Rukundo Eric
 * @class Init
 * @description this class performs the whole Init oparations
 */
export default class Init {
	/**
   *
   * @param {Array} args - Request array
   * @returns {Object} - Response object
   */
	setArgs(args) {
		this.data = { rawArgs: args }
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
	async parseArgsIntoOptions(data, next) {
		const { rawArgs } = data
		const args = arg(
			{
				'--init': Boolean,
				'--git': Boolean,
				'--yes': Boolean,
				'--install': Boolean,
				'-g': '--git',
				'-y': '--yes',
				'-i': '--install'
			},
			{
				argv: rawArgs.slice(2)
			}
		)
		const options = {
			skipPrompts: args['--yes'] || false,
			git: args['--git'] || false,
			initProject: args['--init'] || false,
			runInstall: args['--install'] || false
		}
		data.options = options
		next(data)
	}

	/**
   *
   * @param {Object} data - Data object
   * @param {Function} next - Callback Function
   * @returns {Object} - Response object
   */
	async prompForMissingOptions(data, next) {
		let { options } = data
		const defaultTemplate = 'JavaScript'
		if (options.skipPrompts) {
			return {
				...options,
				template: { choice: options.template || defaultTemplate }
			}
		}
		const questions = []
		if (!options.template) {
			questions.push({
				type: 'list',
				name: 'template',
				message: 'Please choose which language to user',
				choices: ['JavaScript', 'TypeScript'],
				default: defaultTemplate
			})
		}
		if (!options.git) {
			questions.push({
				type: 'confirm',
				name: 'git',
				message: 'Initialize a git repository',
				default: false
			})
		}
		if (!options.runInstall) {
			questions.push({
				type: 'confirm',
				name: 'Dependencies',
				message: 'Install required dependencie',
				default: false
			})
		}

		const answers = await inquirer.prompt(questions)
		options = {
			...options,
			template: { choice: options.template || answers.template },
			git: options.git || answers.git,
			runInstall: options.runInstall || answers.runInstall
		}

		data.options = options
		next(data)
	}

	/**
   *
   * @param {Object} data - Data object
   * @param {Function} next - Callback Function
   * @returns {Object} - Response object
   */
	async initializeProjectDirectory(data, next) {
		let { options } = data
		options = {
			...options,
			dbConfig: getDbConfig()
		}
		try {
			const initTemplete = getInitTempleteDirectory({
				initTemplete: '../../../templates/init-templates',
				options
			})
			options.template.initTemplete = initTemplete
			data.options = options
			await access(initTemplete, fs.constants.R_OK)
			next(data)
		} catch (err) {
			next(data, err)
		}
	}

	/**
   *
   * @param {Object} data - Data object
   * @returns {Object} - Response object
   */
	async executeTasks(data) {
		const { options } = data
		const extractFiles = (a) => {
			const {
				options: {
					template: { initTemplete },
					dbConfig
				}
			} = a
			Object.keys(dbConfig).forEach((config) => {
				mkdirp(dbConfig[config])
					.then(() => {
						copyTemplateFiles(
							path.join(initTemplete, 'mangrove', config),
							path.join(dbConfig[config], '')
						)
							.then(() => {})
							.catch(err => Promise.reject(err))
					})
					.catch(err => Promise.reject(err))
			})
			access(path.join(process.cwd(), '.mangroverc'), fs.constants.R_OK)
				.then(() => {})
				.catch(() => {
					fs.copyFile(
						path.join(initTemplete, '.mangroverc'),
						path.join(process.cwd(), '.mangroverc'),
						(err) => {
							if (err) return Promise.reject(err)
						}
					)
				})
		}
		const tasks = new Listr([
			{
				title: 'Initializing project',
				task: () => extractFiles(data)
			},
			{
				title: 'Initializing git',
				task: () => runCommand('git', ['init'], 'Failed to initialize Git'),
				enabled: () => options.git
			},
			{
				title: 'Install dependencies',
				task: () => ['pg'].forEach(item => runCommand('npm', ['install'].concat([item]))),
				skip: () => (!options.runInstall
					? 'Pass install to automatical install dependencies'
					: undefined)
			}
		])
		await tasks.run()
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
