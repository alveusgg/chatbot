'use strict';

const { userBlacklist, commandPrefix } = require('../config/config');
const { getAllFiles } = require('../utils/file.js');
const { canUserPerformCommand } = require('./utils/canUserPerformCommand.js');

class CommandManager {
    /**
     * @type {import('../controller')}
     */
    #controller;

    /**
     * @type {Record<string, import('./types.d.ts').Command>}
     */
    #commands = {};

    /**
     * @param {import('../controller')} controller
     */
    constructor(controller) {
        if (!controller.connections.twitch) {
            throw new TypeError('controller.connections.twitch not found');
        }

        this.#controller = controller;

        // controller.connections.twitch.onMessage(this.handleTwitchMessage.bind(this));
        this.loadCommands();
    }

    async loadCommands() {
        // Grab all .js files in this directory other than this one
        const files = (await getAllFiles(__dirname + "/commands")).filter(
            (path) => path.endsWith('.js') && path !== 'index.js',
        );
        for (const file of files) {
            /**
             * Require the file, noteworthy this will throw if something's wrong with it
             * @type {import('../types.d.ts').CommandRegister}
             */
            const module = require(file);

            if (typeof module !== 'function') {
                throw new TypeError(
                    `expected ${file} to export function, got ${typeof module} instead`,
                );
            }
            let commands = module(this.#controller);

            if (typeof commands.then === 'function') {
                commands = await commands;
            }

            if (!Array.isArray(commands)) {
                commands = [commands];
            }

            for (const command of commands) {
                assertCommand(file, command);

                if (!command.enabled) {
                    // Command disabled, skipping
                    continue;
                }

                if (command.name in this.#commands) {
                    throw new TypeError(
                        `${file}: command ${command.name} already registered.`,
                    );
                }

                this.#commands[command.name] = command;

                if (command.aliases) {
                    for (const alias of command.aliases) {
                        if (alias in this.#commands) {
                            throw new TypeError(
                                `${file}: command ${command.name} already registered`,
                            );
                        }

                        this.#commands[alias] = command;
                    }
                }
            }
        }
    }

    /**
     * @param {string} channel
     * @param {string} user
     * @param {string} text
     * @param {object} msg TODO grab type
     *
     * @returns {Promise<void>}
     */
    async handleTwitchMessage(channel, user, text, msg) {
        console.log("Using New Commands",user.toLowerCase(),text);
        text = text.trim();

        if (text.length < 2) {
            // Not enough for their to be a command
            return;
        }

        const { database } = this.#controller.connections;

        if (userBlacklist.includes(user.toLowerCase()) || database['blockedUsers'][user]) {
            return;
        }

        const args = text.split(' ');
        if (!args[0].startsWith(commandPrefix)) {
            // Not a command (that we care about)
            return;
        }

        // Trim off the prefix & make it lowercased
        args[0] = args[0].substring(commandPrefix.length).toLowerCase();

        const commandName = args[0];
        const command = this.#commands[commandName];
        if (!command || !command.enabled) {
            // Command doesn't exist or it's disabled
            console.log("command doesnt exist");
            return;
        }
        
        if (!canUserPerformCommand(user, command, this.#controller)) {
            console.log("user cant perform command");
            return;
        }
        await Promise.resolve(
            command.run({
                channel,
                user,
                args,
                msg,
            }),
        );
    }
}

/**
 * @param {string} file
 * @param {any} command
 */
function assertCommand(file, command) {
    // TODO add the other propeties here
    if (typeof command !== 'object') {
        throw new TypeError(
            `${file}: expected command to be an object, got ${typeof command}`,
        );
    }

    if (typeof command.name !== 'string') {
        throw new TypeError(
            `${file}: expected name to be a string, got ${typeof command.name}`,
        );
    }

    if (typeof command.aliases !== 'undefined') {
        if (!Array.isArray(command.aliases)) {
            throw new TypeError(`${file}: expected aliases to be an array`);
        }

        if (
            command.aliases.length > 0 &&
            typeof command.aliases[0] !== 'string'
        ) {
            throw new TypeError(
                `${file}: expected aliases to be an array of strings but element is a ${typeof command
                    .aliases[0]}`,
            );
        }
    }

    if (typeof command.enabled !== 'boolean') {
        throw new TypeError(
            `${file}: expected enabled to be a boolean, got ${typeof command.enabled}`,
        );
    }

    if (
        typeof command.permission !== 'undefined' &&
        typeof command.permission !== 'object'
    ) {
        throw new TypeError(
            `${file}: expected permission to be undefined or object, got ${typeof command.name}`,
        );
    }

    if (typeof command.run !== 'function') {
        throw new TypeError(
            `${file}: expected run to be a function, got ${typeof command.run}`,
        );
    }
}

module.exports = CommandManager;
