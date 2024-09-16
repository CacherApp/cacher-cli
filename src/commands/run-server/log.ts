import {RunServer} from '@cacherapp/run-server'
import {Flags} from '@oclif/core'

import { BaseCommand } from '../../base-command.js'

export default class RunServerLog extends BaseCommand {
  static description = 'Show the server log file.'

  static examples = [
    `$ cacher run-server:log
$ cacher run-server:log -t
$ cacher run-server:log -n 100
`,
  ]

  static flags = {
    lines: Flags.string({char: 'n', description: 'show the last n lines of the log'}),
    tail: Flags.boolean({char: 't', description: 'follow the Run Server log'})
  }

  public async run(): Promise<void> {
    this.checkForUpdate()

    const {flags} = await this.parse(RunServerLog)
    const lines = flags.lines ? Number.parseInt(flags.lines, 10) : undefined
    RunServer.openLog(flags.tail, lines)
  }
}
