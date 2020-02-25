import {
  parseArgumentsIntoOptionsInit,
  prompForMissingOptionsInit,
  initializeProjectDirectory,
  executeTasks
} from "./mangrove/initProject";
import InitProject from "./mangrove/initProject";


export const cli = async args => {
  const initProject = new InitProject(args);
  switch (args[2]) {
    case "--init": {
      initProject
      .setArgs(args)
      .run(
        parseArgumentsIntoOptionsInit,
        prompForMissingOptionsInit,
        initializeProjectDirectory,
        executeTasks
      )
      .then(() => Promise.resolve())
      .catch(err => Promise.reject(err))
     
      break;
    }
    default: {
      console.log(
        `Mangrove: ${args[2]}  is not mangrove command.  See 'mangrove --help'`
      );
      break;
    }
  }
};
