const levels = ["debug", "info", "log", "warn", "error", "silent"];
const levelsEnum = levels.reduce((obj, l, i) => ({ ...obj, [l]: i }), {});

class Logger {
  #context = "";
  #level = 0;

  constructor(context, level = "info") {
    this.#context = context;
    if (level) this.level = level;
  }

  set level(level) {
    if (!Object.prototype.hasOwnProperty.call(levelsEnum, level)) {
      throw new Error(`Invalid log level: ${level}`);
    }
    this.#level = levels[level];
  }

  get level() {
    return levels[this.#level];
  }

  get #prefix() {
    return `[${this.#context}]`;
  }

  debug(...args) {
    if (this.#level < levels.debug) return;
    console.debug(this.#prefix, ...args);
  }

  info(...args) {
    if (this.#level < levels.info) return;
    console.info(this.#prefix, ...args);
  }

  log(...args) {
    if (this.#level < levels.log) return;
    console.log(this.#prefix, ...args);
  }

  warn(...args) {
    if (this.#level < levels.warn) return;
    console.warn(this.#prefix, ...args);
  }

  error(...args) {
    if (this.#level < levels.error) return;
    console.error(this.#prefix, ...args);
  }
}

module.exports = Logger;
