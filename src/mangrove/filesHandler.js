import fs from "fs";
import ncp from "ncp";
import { promisify } from "util";
import path from "path";
const copy = promisify(ncp);

export const correctPath = dir_url => {
  let j = 0;
  for (let i = 0; i < dir_url.length; i++) {
    if (/^[a-zA-Z0-9]*$/.test(dir_url.charAt(i)) === false) {
      j += 1;
    } else {
      break;
    }
  }
  return dir_url.substring(j, dir_url.length);
};
export const copyTemplateFiles = async (origin, destination) =>
  copy(origin, destination, { clobber: false });
export const filesDirectory = path_dir => {
  let dir = path_dir.split("\\");
  let cwd = process.cwd();
  let temp = `${dir[0]}/`;
  let output = "";
  for (let i = 1; i < dir.length - 1; i++) {
    temp = path.join(temp, dir[i]);
    if (temp === cwd) {
      for (let index = i; index < dir.length -1; index++) {
        output += dir[index + 1] + '/';
      }
    }
  }
  return output;
};

export const mkDirByPathSync = (targetDir, { isRelativeToScript = false } = {}) => {
  const sep = path.sep;
  const initDir = path.isAbsolute(targetDir) ? sep : '';
  const baseDir = isRelativeToScript ? __dirname : '.';

  return targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(baseDir, parentDir, childDir);
    console.log(curDir);
    try {
      fs.mkdirSync(curDir);
    } catch (err) {
      if (err.code === 'EEXIST') { // curDir already exists!
        return curDir;
      }

      // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
      if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
        throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
      }

      const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
      if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
        throw err; // Throw if it's just the last created dir.
      }
    }

    return curDir;
  }, initDir);
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
