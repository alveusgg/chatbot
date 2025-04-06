'use strict'

const { commandScenes, multiCommands, multiScenes, onewayCommands } = require('../../config/config.js');
const { groupMemberships } = require('../../config/config.js');
const { cleanName } = require('../../utils/helper.js');
const { isCommandTimeRestricted } = require('../utils/canUserPerformCommand.js');

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
  const { connections: { obs } } = controller;
  const commandSceneKeys = Object.keys(commandScenes);

  /**
   * @type {Array<import('../types.d.ts').Command>}
   */
  const commands = new Array(commandSceneKeys.length);

  for (let i = 0; i < commandSceneKeys.length; i++) {
    const commandName = commandSceneKeys[i];
    
    commands[i] = {
      name: commandName,
      enabled: !!obs,
      skipTimeRestrictionCheck: true,
      run: async ({ user }) => {
        let hasAccess = isCommandTimeRestricted(groupMemberships[user], { name: commandName }, controller);

        // Multicommand swapping
        if (!hasAccess) {
          let currentScene = await obs.local.getScene() || "";
          currentScene = cleanName(currentScene);

          for (const baseCommand in multiCommands) {
            let fullList = multiCommands[baseCommand] || [];
            //find usercommand in MultiCommands
            if (fullList.includes(commandName)) {
              //get Scene names for matching Command
              let fullSceneList = multiScenes[baseCommand] || [];
              for (let i = 0; i < fullSceneList.length; i++) {
                let scene = fullSceneList[i] || "";
                scene = cleanName(scene);
                //check if current scene is in current commands Multiscenes
                if (scene != "" && currentScene == scene) {
                  hasAccess = true;
                  break;
                }
              }
            }
          }

          //One Direction Swapping (if on scene, allow subscene)
          let onWayList = onewayCommands[currentScene] || null;
          if (onWayList != null) {
            if (onWayList.includes(commandName)) {
              hasAccess = true;
            }
          }
        }

        if (hasAccess) {
          await obs.local.setScene(commandScenes[commandName]);
        }
      }
    };
  }

  return commands;
}
