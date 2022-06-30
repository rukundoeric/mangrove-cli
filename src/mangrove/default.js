/* eslint-disable import/prefer-default-export */
export const defaultDbConfig = {
	connection: `${process.cwd()}/mangrove/connection`,
	models: `${process.cwd()}/mangrove/models`,
	seeders: `${process.cwd()}/mangrove/seeders`,
	migrations: `${process.cwd()}/mangrove/migrations`
}
