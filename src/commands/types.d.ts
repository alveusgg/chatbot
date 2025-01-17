/**
 * Provides info on who's able to perform a command.
 * Note that each of these can be either or
 */
export interface CommandPermissionInfo {
  /**
   * The minimum group needed to run the command
   */
  group: import('../config/types.d.ts').Group

  /**
   * The users allowed to perform this command regardless of the group they're om
   */
  users?: Array<string>
}

export interface CommandArgs {
  controller: import('../controller')
  channel: string;
  user: string;
  args: string[]
  msg: object
}

export interface Command {
  /**
   * The name used to run the command in chat
   */
  name: string

  enabled: boolean,

  permission?: CommandPermissionInfo

  run: (args: CommandArgs) => void | Promise<void>
}
