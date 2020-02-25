import execa from 'execa';

export const runCommand = async (cmd, attributes, onErrorMsg) => {
    const result = await execa(cmd, attributes, {
        swd: process.cwd()
      });
      if (result.failed) {
        return Promise.reject(new Error(onErrorMsg || result));
      }
      return;
}