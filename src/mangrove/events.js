/* eslint-disable require-jsdoc */
/* eslint-disable import/prefer-default-export */
import { EventEmitter } from 'events'
import inquirer from 'inquirer'

const event = new EventEmitter()

export default class Event {
	async define() {
		this.event = event
		return this
	}

	async prompt(name, body) {
		let object = {}
		this.event.on(name, async () => {
			object = await inquirer.prompt(body)
		})
		return object
	}

	emit(a) {
		this.event.emit(a)
	}
}
