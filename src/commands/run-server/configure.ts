import {RunServer} from '@cacherapp/run-server'
import {Flags} from '@oclif/core'

import { BaseCommand } from '../../base-command.js'

export default class RunServerConfigure extends BaseCommand {
  static description = 'Open the user configuration for the Run Server. Add rules here to handle additional file extensions.'

  static examples = [
    `$ cacher run-server:configure
$ cacher run-server:configure -e code
`,
  ]

  static override flags = {
    editor: Flags.string({char: 'e', description: 'open configuration file with editor (i.e. "code")'})
  }

  async run() {
    this.checkForUpdate()

    const {flags} = await this.parse(RunServerConfigure)
    RunServer.openConfig(flags.editor)
  }
}
