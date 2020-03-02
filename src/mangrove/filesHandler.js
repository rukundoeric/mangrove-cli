/* eslint-disable max-len */
import ncp from 'ncp'
import { promisify } from 'util'
import path from 'path'

const copy = promisify(ncp)

export const correctPath = (dirUrl) => {
	let j = 0
	for (let i = 0; i < dirUrl.length; i += 1) {
		if (/^[a-zA-Z0-9]*$/.test(dirUrl.charAt(i)) === false) {
			j += 1
		} else {
			break
		}
	}
	return dirUrl.substring(j, dirUrl.length)
}

export const copyTemplateFiles = async (origin, destination) => copy(origin, destination, { clobber: false })

export const filesDirectory = (pathDir) => {
	const dir = pathDir.split('\\')
	const cwd = process.cwd()
	let temp = `${dir[0]}/`
	let output = ''
	for (let i = 1; i < dir.length - 1; i += 1) {
		temp = path.join(temp, dir[i])
		if (temp === cwd) {
			for (let index = i; index < dir.length - 1; index += 1) {
				output += `${dir[index + 1]}/`
			}
		}
	}
	return output
}

export const getInitTempleteDirectory = data => {
  let { options } = data;
  const currentFileUrl = import.meta.url;
  let templateDir = path.resolve(
    correctPath(new URL(currentFileUrl).pathname),
    data.initTemplete,
    options.template.choice.toLowerCase()
  );
  return templateDir;
};
