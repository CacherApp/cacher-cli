import {RunServer} from '@cacherapp/run-server'
import {Flags} from '@oclif/core'

import { BaseCommand } from '../../base-command.js'
import { appConfig } from '../../config.js'

export default class RunServerStart extends BaseCommand {
  static description = 'Start a Run Server to accept requests from a given origin. The Run Server is used to run shell ' +
    'commands using Cacher snippet file contents. Run this command in tandom with the Cacher\'s standalone Run Server option.'

  static examples = [
    `$ cacher run-server:start -o https://myapp.dev -p 30012 -t my_server_token

 Listening on: http://localhost:30012
 Server token: my_server_token
`,
  ]

  static flags = {
    logToFile: Flags.boolean({char: 'l', description: 'log output to server log file (~/.cacher/logs/run-server.log)'}),
    origin: Flags.string({
      char: 'o',
      description: 'http(s) origin for CORS requests (use "file://" with Cacher Desktop, "https://app.cacher.io" with Web App)'
    }),
    port: Flags.string({char: 'p', description: 'port to run server on'}),
    token: Flags.string({char: 't', description: 'server token to check against while making connections'}),
    verbose: Flags.boolean({char: 'v', description: 'show verbose logging'})
  }

  public async run(): Promise<void> {
    this.checkForUpdate()

    const {flags} = await this.parse(RunServerStart)

    // By default, origin points to production Cacher instance
    const origin = flags.origin || appConfig.appHost
    const args: { logToFile: boolean, origin: string, port?: number, token?: string, verbose: boolean } = {
      logToFile: flags.logToFile,
      origin,
      verbose: flags.verbose
    }

    if (flags.port) {
      args.port = Number.parseInt(flags.port, 10)
    }

    if (flags.token) {
      args.token = flags.token
    }

    (new RunServer(args)).start()
  }
}
