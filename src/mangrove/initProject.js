import arg from "arg";
import path from "path";
import Listr from 'listr';
import mkdirp from "mkdirp";
import inquirer from "inquirer";
import fs from "fs";
import { runCommand } from "./utils";
import {
  getInitTempleteDirectory,
  copyTemplateFiles,
} from "./filesHandler";
import { promisify } from "util";
const access = promisify(fs.access);
import { getDbConfig } from "./utils";

export const parseArgumentsIntoOptionsInit = async (data, next) => {
  let { rawArgs } = data;
  const defaultTemplate = "JavaScript";
  const args = arg(
    {
      "--init": Boolean,
      "--git": Boolean,
      "--yes": Boolean,
      "--install": Boolean,
      "-g": "--git",
      "-y": "--yes",
      "-i": "--install"
    },
    {
      argv: rawArgs.slice(2)
    }
  );
  let options = {
    skipPrompts: args["--yes"] || false,
    git: args["--git"] || false,
    initProject: args["--init"] || false,
    runInstall: args["--install"] || false
  };
  data.options = options;
  next(data);
};
export const prompForMissingOptionsInit = async (data, next) => {
  let { options } = data;
  const defaultTemplate = "JavaScript";
  if (options.skipPrompts) {
    return {
      ...options,
      template: { choice: options.template || defaultTemplate }
    };
  }
  const questions = [];
  if (!options.template) {
    questions.push({
      type: "list",
      name: "template",
      message: "Please choose which language to user",
      choices: ["JavaScript", "TypeScript"],
      default: defaultTemplate
    });
  }
  if (!options.git) {
    questions.push({
      type: "confirm",
      name: "git",
      message: "Initialize a git repository",
      default: false
    });
  }
  if (!options.runInstall) {
    questions.push({
      type: "confirm",
      name: "Dependencies",
      message: "Install required dependencie",
      default: false
    });
  }

  const answers = await inquirer.prompt(questions);
  options = {
    ...options,
    template: { choice: options.template || answers.template },
    git: options.git || answers.git,
    runInstall: options.runInstall || answers.runInstall
  };

  data.options = options;
  next(data);
};
export const initializeProjectDirectory = async (data, next) => {
  let { options } = data;
  options = {
    ...options,
    dbConfig: getDbConfig()
  };
  try {
    let initTemplete = getInitTempleteDirectory({
      initTemplete: "../../../templates/init-templates",
      options
    });
    options.template.initTemplete = initTemplete;
    data.options = options;
    await access(initTemplete, fs.constants.R_OK);
    next(data);
  } catch (err) {
    next(data, err);
  }
};

export const extractFiles = async data => {
  const {
    options: {
      template: { initTemplete },
      dbConfig
    }
  } = data;

  Object.keys(dbConfig).forEach(config => {
    mkdirp(dbConfig[config])
      .then(() => {
        copyTemplateFiles(
          path.join(initTemplete, "mangrove", config),
          path.join(dbConfig[config], "")
        );
      })
      .catch(err => {
        return Promise.reject(err);
      });
  });
  fs.copyFile(
    path.join(initTemplete, ".mangroverc"),
    path.join(process.cwd(), "mangroverc"),
    err => {
      if (err) return Promise.reject(err);;
    }
  );
  return;
};

export const executeTasks = async data => {
  let { options } = data;
  const tasks = new Listr([
    {
      title: "Initializing project",
      task: () => extractFiles(data)
     },
    {
      title: "Initializing git",
      task: () => runCommand("git", ["init"], "Failed to initialize Git"),
      enabled: () => options.git
    },
    {
      title: "Install dependencies",
      task: () =>
        ["pg"].forEach(item =>
          runCommand("npm", ["install"].concat([item]))
        ),
      skip: () =>
        !options.runInstall
          ? "Pass install to automatical install dependencies"
          : undefined
    }
  ]);
  await tasks.run();
}
export default class InitProject {
  setArgs(args) {
    this.data = { rawArgs: args };
    return this;
  }
  getData(){
    return this.data;
  }
  async run() {
    let data = this.data;
    for (let i = 0; i < arguments.length; i++) {
      await arguments[i](data, (res, err) => {
        if (err) {
          console.log(err);
          process.exit(1);
        }
        data = res;
      });
    }
    this.data = data;
  }
}
