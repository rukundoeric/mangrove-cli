/* eslint-disable no-fallthrough */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-tabs */
/* eslint-disable import/named */
import Init from './mangrove/Init'
import Model from './mangrove/Models'
import Migrations from './mangrove/Migrations'
import Seeders from './mangrove/Seeder';

export const cli = async (args) => {
	switch (args[2]) {
	case '--init': {
		const init = new Init(args)
		init
			.setArgs(args)
			.run(
				init.parseArgsIntoOptions,
				init.prompForMissingOptions,
				init.initializeProjectDirectory,
				init.executeTasks
			)

		break
	}
	case 'create:model': {
		const model = new Model()
		model
			.setArgs(args)
			.run(
				model.parseArgsToProperties,
				model.convertToStringCode,
				model.migrations.convertToStringCode,
				model.createFile,
				model.migrations.createFile
			)
		break
	}
	case 'db:migrate': {
		const migrations = new Migrations()
		migrations
			.setArgs(args)
			.run(
				migrations.testDbConnection,
				migrations.migrate,
				migrations.finish
			)
		break
	}

	case 'db:seed' : {
		const seeders = new Seeders();
		seeders
			.setArgs(args)
			.run(
				seeders.parseArgsToProperties,
				seeders.convertToStringCode,
				seeders.createFile
			)
			break
	}
	default: {
		// eslint-disable-next-line no-console
		console.log(
			`Mangrove: ${args[2]}  is not mangrove command.  See 'mangrove --help'`
		)
		break
	}
	}
}
