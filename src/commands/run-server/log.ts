import {RunServer} from '@cacherapp/run-server'
import {flags} from '@oclif/command'

import {BaseCommand} from '../../base-command'

export default class Log extends BaseCommand {
  static description = 'Show the server log file.'

  static examples = [
    `$ cacher run-server:log
$ cacher run-server:log --tail
`,
  ]

  static flags = {
    tail: flags.boolean({char: 't', description: 'follow the Run Server log'}),
    lines: flags.string({char: 'n', description: 'show the last n lines of the log'})
  }

  async run() {
    const {flags} = this.parse(Log)
    RunServer.openLog(flags.tail, flags.lines)
  }
}
