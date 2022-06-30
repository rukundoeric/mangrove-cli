/* eslint-disable require-jsdoc */
/* eslint-disable no-console */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import execa from 'execa'
import { defaultDbConfig } from './default'
import { validate } from './validate'

export const runCommand = async (cmd, attributes, onErrorMsg) => {
	const result = await execa(cmd, attributes, {
		swd: process.cwd()
	})
	if (result.failed) {
		return Promise.reject(new Error(onErrorMsg || result))
	}
}
export const getDbConfig = () => {
	let dbConfig
	try {
		dbConfig = require(`${process.cwd()}/.mangroverc`)
	} catch (err) {
		dbConfig = defaultDbConfig
	}
	return dbConfig
}
export const createTableQuestions = {
	applyModel: [
		{
			type: 'confirm',
			name: 'continuee',
			message: 'Generate this model\n Type "y" to continue or "n" to cancel',
			default: true
		}
	],
	addIdColumn: [
		{
			type: 'confirm',
			name: 'addCol',
			message: 'Add column id as Primary key and set it to Auto Increament:',
			default: true
		}
	],
	addColumn: [
		{
			type: 'confirm',
			name: 'addCol',
			message: 'Add column',
			default: false
		}
	],
	addNewColumn: [
		{
			type: 'confirm',
			name: 'addCol',
			message: 'Add New column',
			default: true
		}
	],
	name: [
		{
			type: 'input',
			name: 'name',
			message: 'Table name:',
			validate: e => validate(e, 'table')
		}
	],
	column: [
		{
			type: 'input',
			name: 'columnName',
			message: 'Column name:',
			validate: e => validate(e, 'column')
		}
	],
	columnDetails: [
		{
			type: 'list',
			name: 'type',
			message: 'Select type:',
			choices: ['TEXT', 'STRING', 'INTEGER', 'BOOLEAN'],
			default: 'STRING'
		},
		{
			type: 'confirm',
			name: 'autoIncrement',
			message: 'Auto Increment',
			default: false
		},
		{
			type: 'confirm',
			name: 'unique',
			message: 'Should be unique:',
			default: false
		},
		{
			type: 'confirm',
			name: 'allowNull',
			message: 'Allow null:',
			default: true
		},
		{
			type: 'confirm',
			name: 'primaryKey',
			message: 'isPrimaryKey:',
			default: false
		},
		{
			type: 'confirm',
			name: 'references',
			message: 'define references:',
			default: false
		}
	],
	existingModel: [
		{
			type: 'confirm',
			name: 'status',
			message: 'Associate to Existing Model',
			default: false
		}
	],
	referencesModel: models => [
		{
			type: 'list',
			name: 'table',
			message: 'Associate To(Table or Model)',
			choices: Object.keys(models),
			default: Object.keys(models)[0]
		}
	],
	referencesDetails: (models, { table: selected }) => {
		const res = models
			? [
				{
					type: 'list',
					name: 'key',
					message: 'Target Key(Foreign Key)',
					choices: Object.keys(models[selected].properties),
					default: Object.keys(models[selected].properties)[0]
				}
			].concat([
				{
					type: 'list',
					name: 'onDelete',
					message: 'On Delete',
					choices: ['CASCADE', 'SET NULL'],
					default: 'SET NULL'
				},
				{
					type: 'list',
					name: 'onUpdate',
					message: 'On Update',
					choices: ['CASCADE', 'SET NULL'],
					default: 'CASCADE'
				}
			])
			: [
				{
					type: 'input',
					name: 'table',
					message: 'Associate To(Table or Model)'
				},
				{
					type: 'input',
					name: 'key',
					message: 'Target Key(Foreign Key)'
				}
			].concat([
				{
					type: 'list',
					name: 'onDelete',
					message: 'On Delete',
					choices: ['CASCADE', 'SET NULL'],
					default: 'SET NULL'
				},
				{
					type: 'list',
					name: 'onUpdate',
					message: 'On Update',
					choices: ['CASCADE', 'SET NULL'],
					default: 'CASCADE'
				}
			])
		return res
	}
}
export const displayTable = ({ columns: cols }) => {
	const rows = []
	Object.keys(cols).forEach((item) => {
		const row = {
			Column: item,
			Datatype: cols[item].type,
			Unique: cols[item].unique || false,
			AutoIncrement: cols[item].autoIncrement || false,
			AllowNull: cols[item].allowNull || false,
			PrimaryKey: cols[item].primaryKey || false,
			References: cols[item].references || undefined
		}
		rows.push(row)
	})
	console.table(rows)
	console.log(
		`${Object.keys(cols).length} Column${
			Object.keys(cols).length > 0 ? 's' : ''
		}`
	)
}

export const removeUnderfinedProps = (object) => {
	function removeProps(obj) {
		if (obj instanceof Array) {
			obj.forEach((item) => {
				removeProps(item)
			})
		} else if (typeof obj === 'object') {
			Object.keys(obj).forEach((key) => {
				if (typeof obj[key] === 'object') {
					removeProps(obj[key])
				} else if (obj[key] === false || obj[key] === undefined) delete obj[key]
				else removeProps(obj[key])
			})
		}
	}
	removeProps(object)
	return object
}
