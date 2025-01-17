// @ts-check

const { userBlacklist, commandPrefix } = require('../config/config')
const { groupMemberships, groups } = require('../config/config2.js')
const { getAllFiles } = require('../utils/file.js')

class CommandManager {
  /**
   * @type {import('../controller')}
   */
  #controller

  /**
   * @type {Record<string, import('./types.d.ts').Command>}
   */
  #commands = {}

  /**
   * @param {import('../controller')} controller 
   */
  constructor(controller) {
    if (!controller.connections.twitch) {
      throw new TypeError('controller.connections.twitch not found')
    }

    this.#controller = controller

    controller.connections.twitch.onMessage(this.#handleTwitchMessage)
  }

  async loadCommands() {
    const files = (await getAllFiles(__dirname)).filter(path => path.endsWith('.js') && path !== 'index.js')

    for (const path of files) {
      const module = require(path)

      const commands = Array.isArray(module) ? module : [module]
      for (const command of commands) {
        assertCommand(path, command)

        this.#commands[command.name] = command
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
  async #handleTwitchMessage(channel, user, text, msg) {
    text = text.trim()

    if (text.length < 2) {
      // Not enough for their to be a command
      return;
    }

    if (userBlacklist.includes(user.toLowerCase())) {
      return;
    }

    const args = text.split(' ')
    if (!args[0].startsWith(commandPrefix)) {
      // Not a command (that we care about)
      return;
    }

    const commandName = args[0].substring(1)
    const command = this.#commands[commandName]
    if (!command || !command.enabled) {
      // Command doesn't exist or it's disabled
      return;
    }

    if (!canUserPerformCommand(user, command)) {
      return
    }

    const result = command.run({
      controller: this.#controller,
      channel,
      user,
      args,
      msg
    })

    if (typeof result?.then === 'function') {
      await result
    }
  }
}

/**
 * @param {string} file 
 * @param {any} command 
 */
function assertCommand(file, command) {
  if (typeof command !== 'object') {
    throw new TypeError(`${file}: expected command to be an object, got ${typeof command}`)
  }

  if (typeof command.name !== 'string') {
    throw new TypeError(`${file}: expected name to be a string, got ${typeof command.name}`)
  }

  if (typeof command.enabled !== 'boolean') {
    throw new TypeError(`${file}: expected enabled to be a boolean, got ${typeof command.enabled}`)
  }

  if (typeof command.permission !== 'undefined' && typeof command.permission !== 'object') {
    throw new TypeError(`${file}: expected permission to be undefined or object, got ${typeof command.name}`)
  }

  if (typeof command.run !== 'function') {
    throw new TypeError(`${file}: expected run to be a function, got ${typeof command.run}`)
  }
}

/**
 * @param {string} user 
 * @param {import('./types.d.ts').Command} arg1
 * @returns {boolean} 
 */
function canUserPerformCommand(user, { permission }) {
  if (!permission) {
    // Command doesn't have permissions listed
    return true
  }

  if (permission.group && user in groupMemberships) {
    const userGroup = groupMemberships[user]
    if (permission.group === userGroup) {
      // User is in the exact group required
      return true;
    }

    // At this point, the user is in a group but it's not the one that's listed.
    //  They can still run the command however if their group outranks the
    //  group that's listed (i.e. admin can run mod commands, but operator
    //  can't run mod commands)
    //
    // Noteworthy that the ranks are defined in reverse order, meaning a group
    //  with a rank of 0 has a higher ranking than a group of 1.
    
    const minimumRank = groups[permission.group]
    const userRank = groups[userGroup]

    if (minimumRank === userRank) {
      // Different group, same rank. Shouldn't happen, but there's also nothing
      //  preventing it from happening
      return false;
    }

    if (minimumRank > userRank) {
      // User has permission
      return true;
    }
  }

  if (permission.users && permission.users.includes(user.toLowerCase())) {
    return true
  }

  return false
}

module.exports = CommandManager
