/* eslint-disable import/prefer-default-export */
/* eslint-disable no-tabs */
/* eslint-disable import/named */
import InitProject, {
	parseArgumentsIntoOptionsInit,
	prompForMissingOptionsInit,
	initializeProjectDirectory,
	executeTasks,
} from './mangrove/initProject'
import Model from './mangrove/Models'


export const cli = async (args) => {
	const initProject = new InitProject(args)
	switch (args[2]) {
	case '--init': {
		initProject
			.setArgs(args)
			.run(
				parseArgumentsIntoOptionsInit,
				prompForMissingOptionsInit,
				initializeProjectDirectory,
				executeTasks,
			)
			.then(() => Promise.resolve())
			.catch(err => Promise.reject(err))

		break
	}
	case 'create:model': {
		const model = new Model()
		model.setArgs(args)
			.run(
				model.parseArgsToProperties,
				model.convertToStringCode,
				model.createFile,
			)
		break
	}
	default: {
		console.log(
			`Mangrove: ${args[2]}  is not mangrove command.  See 'mangrove --help'`,
		)
		break
	}
	}
}
