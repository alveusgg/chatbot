'use strict'

/**
 * @type {import('./types.d.ts').CommandRegister}
 */
module.exports = (controller) => {
  return {
    name: 'ptzstopaudio',
    aliases: [
      'stopclip',
      'stopaudio'
    ],
    enabled: controller.connections.cameras !== undefined,
    permission: {
      group: 'operator'
    },
    run: async () => {
      const speaker = controller.connections.cameras.speaker
      
      await speaker.stopAudioClip()
    }
  }
};
