const { readdir } = require("node:fs/promises");
const { resolve, relative } = require("node:path");

const Logger = require("./utils/logger");

/**
 * Get all files in a directory recursively
 *
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
const getAllFiles = (dir) =>
  readdir(dir, { withFileTypes: true }).then((dirents) =>
    Promise.all(
      dirents.map((dirent) => {
        const res = resolve(dir, dirent.name);
        return dirent.isDirectory() ? getAllFiles(res) : res;
      }),
    ).then((files) => files.flat()),
  );

class Controller {
  #connections = {};
  #logger = new Logger("controller");

  get connections() {
    return this.#connections;
  }

  async load(directory) {
    const files = await getAllFiles(directory);
    for (const file of files) {
      if (!file.endsWith(".js")) continue;

      const name = relative(process.cwd(), file).slice(0, -3);
      this.#logger.log(`Loading ${name}...`);

      const connection = require(file);
      if (typeof connection === "function") await connection(this);
    }
  }
}

module.exports = Controller;
