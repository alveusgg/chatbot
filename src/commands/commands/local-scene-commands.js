// @ts-check
'use strict'

const { commandScenes } = require('../../config/config.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { twitch, unifi, obs } }) => {
  const commandSceneKeys = Object.keys(commandScenes);

  /**
   * @type {Array<import('../types.d.ts').Command>}
   */
  const commands = new Array(commandSceneKeys.length);

  for (let i = 0; i < commandSceneKeys.length; i++) {
    const commandName = commandSceneKeys[i];

    // TODO figure out what it's doing with the time access stuff cause what
    
    commands[i] = {
      name: commandName,
      enabled: !!obs,
      run: async () => {
        const sceneName = commandScenes[commandName];

        await obs.local.setScene(sceneName);
      }
    };
  }

  return commands;
}
