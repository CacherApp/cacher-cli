import {Command, flags} from '@oclif/command'

const request = require('request')
const ora = require('ora')
const chalk = require('chalk')
const os = require('os')
const fs = require('fs')

const prompt = require('prompt')
prompt.message = ''
prompt.delimiter = ':'

require('dotenv').config()
import config from '../config'

export default class Setup extends Command {
  static description = `
Configure API credentials for Cacher CLI. To view your API token and key visit:
${config.apiHost}/enter?action=view_api_creds
`

  static examples = [
    `cacher setup
API key: ****************,
API token: ********************************
`,
    `cacher setup --key=fe33cd82ae161ba1 --token=0134a0be884468829669c3be02c3a814
`
  ]

  static flags = {
    key: flags.string({char: 'k', description: 'api key for Cacher account'}),
    token: flags.string({char: 't', description: 'token for Cacher account'})
  }

  async run() {
    const {flags} = this.parse(Setup)

    const prompts = [
      {
        name: 'key',
        description: 'API key',
        required: true,
        hidden: true,
        replace: '*',
      },
      {
        name: 'token',
        description: 'API token',
        required: true,
        hidden: true,
        replace: '*',
      }
    ]

    prompt.override = flags

    if (!flags.key || !flags.token) {
      this.log(
        chalk.yellow(`
To view your Cacher API token and token, visit:
${config.apiHost}/enter?action=view_api_creds
`)
      )
    }

    prompt.start()

    let apiKey = ''
    let apiToken = ''

    prompt.get(prompts, (err: any, result: any) => {
      apiKey = result.key
      apiToken = result.token

      const spinner = ora('Logging into Cacher').start()
      spinner.color = 'green'

      request({
        method: 'POST',
        url: `${config.apiHost}/integrations/validate`,
        headers: {
          'X-Api-Key': apiKey,
          'X-Api-Token': apiToken
        },
        strictSSL: false
      }, (error: any, response: any, body: any) => {
        if (response.statusCode === 204) {
          const credentialsDir = `${os.homedir()}/.cacher`
          if (!fs.existsSync(credentialsDir)) {
            fs.mkdirSync(credentialsDir)
          }

          const credentialsJSON = {
            key: apiKey,
            token: apiToken
          }
          fs.writeFileSync(`${credentialsDir}/credentials.json`, JSON.stringify(credentialsJSON))

          spinner.succeed(chalk.green(` API key/token validated. Credentials saved in "${credentialsDir}"`))
        } else {
          spinner.fail(chalk.red(' Cacher API key/token combination invalid. Credentials not saved.'))
        }
      })
    })
  }
}
