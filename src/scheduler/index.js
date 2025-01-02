'use strict';

const { join } = require('node:path');
const { getAllFiles } = require('../utils/file');
const Logger = require('../utils/logger.js');
const runAtTime = require('../utils/schedule.js');

const logger = new Logger('scheduler');

class Scheduler {
    /**
     * @type {import('../controller')}
     */
    #controller;

    /**
     * @param {import('../controller.js')} controller 
     */
    constructor(controller) {
        this.#controller = controller;
    }

    async loadTasks() {
        const files = (await getAllFiles(join(__dirname, 'tasks'))).filter(
            (path) => path.endsWith('.js'),
        );

        for (const file of files) {
            /**
             * Require the file, noteworthy this will throw if something's wrong with it
             * @type {import('./types.d.ts').TaskRegister}
             */
            const module = require(file);

            if (typeof module !== 'function') {
                throw new TypeError(
                    `expected ${file} to export function, got ${typeof module} instead`,
                );
            }

            let tasks = module(this.#controller);

            if (!Array.isArray(tasks)) {
                tasks = [tasks];
            }

            logger.info(`${file}: found ${tasks.length} task(s)`);

            for (const task of tasks) {
                assertTask(file, task);

                if (!task.enabled) {
                    // Task disabled, skipping...
                    continue;
                }

                runAtTime(task.runAt.hour, task.runAt.minute, task.run);
            }
        }
    }
}

/**
 * @param {string} file
 * @param {any} task
 */
function assertTask(file, task) {
    if (typeof task !== 'object') {
        throw new TypeError(
            `${file}: expected task to be an object, got ${typeof task}`,
        );
    }

    if (typeof task.name !== 'string') {
        throw new TypeError(
            `${file}: expected name to be a string, got ${typeof task.name}`,
        );
    }

    if (typeof task.enabled !== 'boolean') {
        throw new TypeError(
            `${file}: expected enabled to be a boolean, got ${typeof task.enabled}`,
        );
    }

    if (typeof task.runAt !== 'object') {
        throw new TypeError(
            `${file}: expected runAt to be an object, got ${typeof task.runAt}`,
        );
    }

    if (typeof task.runAt.hour !== 'number') {
        throw new TypeError(
            `${file}: expected runAt.hour to be a number, got ${typeof task
                .runAt.hour}`,
        );
    }

    if (typeof task.runAt.minute !== 'number') {
        throw new TypeError(
            `${file}: expected runAt.minute to be a number, got ${typeof task
                .runAt.minute}`,
        );
    }

    if (typeof task.run !== 'function') {
        throw new TypeError(
            `${file}: expected run to be a function, got ${typeof task.run}`,
        );
    }
}

module.exports = Scheduler;
