import Joi from '@hapi/joi'

export const schemas = {
	table: Joi.object({
		name: Joi.string().regex(/^[a-zA-Z]+$/).min(1)
			.required()
	}),
	column: Joi.object({
		name: Joi.string().regex(/^[a-zA-Z]+$/).min(1)
			.required(),
	}),
	yesNo: Joi.string().valid('yes', 'no', 'y', 'n').required()
}
export const validate = (input, a) => {
	const { error } = schemas[a].validate({ name: input })
	if (error) {
		return `${a} name must be more than one character length and should not contain numbers or special characters`
	}
	return true
}
