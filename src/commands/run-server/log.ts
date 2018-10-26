import {RunServer} from '@cacherapp/run-server'
import {flags} from '@oclif/command'

import {BaseCommand} from '../../base-command'

export default class Log extends BaseCommand {
  static description = 'Show the server log file.'

  static examples = [
    `$ cacher run-server:log
$ cacher run-server:log -t
$ cacher run-server:log -n 100
`,
  ]

  static flags = {
    tail: flags.boolean({char: 't', description: 'follow the Run Server log'}),
    lines: flags.string({char: 'n', description: 'show the last n lines of the log'})
  }

  async run() {
    this.checkForUpdate()

    const {flags} = this.parse(Log)
    const lines = flags.lines ? parseInt(flags.lines, 10) : undefined
    RunServer.openLog(flags.tail, lines)
  }
}
