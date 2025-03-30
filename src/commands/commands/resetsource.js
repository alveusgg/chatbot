'use strict'

/**
 * @type {import('../types.d.ts').CommandRegister}
 */
module.exports = ({ connections: { obs } }) => {
  return {
    name: 'resetsource',
    aliases: ['resetcloudsource'],
    enabled: !!obs,
    permission: {
      group: 'operator'
    },
    run: ({ args: _args }) => {
      const [command, args] = _args;
      
      const source = command === 'resetsource' ? obs.local : obs.cloud;

      source.restartSceneItem(source.currentScene, args);
    }
  }
};
