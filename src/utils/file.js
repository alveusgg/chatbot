const { readdir } = require("node:fs/promises");
const { resolve } = require("node:path");

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

module.exports = { getAllFiles }
