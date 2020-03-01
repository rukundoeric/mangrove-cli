import execa from 'execa'
import { defaultDbConfig } from './default.js'

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
