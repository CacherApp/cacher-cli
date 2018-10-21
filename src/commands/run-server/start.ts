import {RunServer} from '@cacherapp/run-server'
import {flags} from '@oclif/command'

import {BaseCommand} from '../../base-command'

export default class Start extends BaseCommand {
  static description = 'Start the local run server to accept requests from a given origin.'

  static examples = [
    `$ cacher run-server:start -o https://myapp.dev -p 30012 -t my_server_token

 Listening on: http://localhost:30012
 Server token: my_server_token
`,
  ]

  static flags = {
    origin: flags.string({char: 'o', description: 'http(s) origin for CORS requests'}),
    port: flags.string({char: 'p', description: 'port to run server on'}),
    token: flags.string({char: 't', description: 'server token to check against while making connections'}),
    verbose: flags.boolean({char: 'v', description: 'show verbose logging'}),
    logToFile: flags.boolean({char: 'l', description: 'log output to server log file'})
  }

  async run() {
    const {flags} = this.parse(Start)

    // By default, origin points to production Cacher instance
    const origin = flags.origin || 'https://app.cacher.io'
    const args: any = {
      origin,
      verbose: flags.verbose,
      logToFile: flags.logToFile
    }

    if (flags.port) {
      args.port = parseInt(flags.port, 10)
    }

    if (flags.token) {
      args.token = flags.token
    }

    (new RunServer(args)).start()
  }
}
