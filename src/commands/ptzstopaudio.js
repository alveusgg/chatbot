const aliases = [
  'ptzplayaudio',
  'playclip',
  'playaudio'
]

/**
 * @type {Array<import('./types.d.ts').Command>}
 */
const commands = aliases.map(alias => ({
  name: alias,
  enabled: true,
  permission: {
    group: 'operator'
  },
  run: async ({ controller }) => {
    if (!controller.connections.cameras) {
      return;
    }

    const speaker = controller.connections.cameras.speaker

    await speaker.stopAudioClip()
  }
}))

module.exports = commands;
