import {RunServer} from '@cacherapp/run-server'
import {flags} from '@oclif/command'

import {BaseCommand} from '../../base-command'

export default class Start extends BaseCommand {
  static description = 'Start a Run Server to accept requests from a given origin. The Run Server is used to run shell ' +
    'commands using Cacher snippet file contents. Run this command in tandom with the Cacher\'s standalone Run Server option.'

  static examples = [
    `$ cacher run-server:start -o https://myapp.dev -p 30012 -t my_server_token

 Listening on: http://localhost:30012
 Server token: my_server_token
`,
  ]

  static flags = {
    origin: flags.string({
      char: 'o',
      description: 'http(s) origin for CORS requests (use "file://" with Cacher Desktop, "https://app.cacher.io" with Web App)'
    }),
    port: flags.string({char: 'p', description: 'port to run server on'}),
    token: flags.string({char: 't', description: 'server token to check against while making connections'}),
    verbose: flags.boolean({char: 'v', description: 'show verbose logging'}),
    logToFile: flags.boolean({char: 'l', description: 'log output to server log file (~/.cacher/logs/run-server.log)'})
  }

  async run() {
    this.checkForUpdate()

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
