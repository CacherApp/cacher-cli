import {RunServer} from '@cacherapp/run-server'
import {flags} from '@oclif/command'

import {BaseCommand} from '../../base-command'

export default class Config extends BaseCommand {
  static description = 'Open the user configuration for the Run Server. Add rules here to handle additional file extensions.'

  static examples = [
    `$ cacher run-server:config
$ cacher run-server:config -e atom
`,
  ]

  static flags = {
    editor: flags.string({char: 'e', description: 'open configuration file with editor (i.e. "atom")'})
  }

  async run() {
    const {flags} = this.parse(Config)
    RunServer.openConfig(flags.editor)
  }
}
