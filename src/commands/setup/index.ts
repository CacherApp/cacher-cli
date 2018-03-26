import {flags} from '@oclif/command'
import chalk from 'chalk'
import * as fs from 'fs'
import * as os from 'os'

const request = require('request')
const ora = require('ora')

const inquirer = require('inquirer')

require('dotenv').config()
import {BaseCommand} from '../../base-command'
import config from '../../config'

export default class Setup extends BaseCommand {
  static description = `
Configure API credentials for Cacher CLI. To view your API token and key visit:
${chalk.underline(`${config.appHost}/enter?action=view_api_creds`)}
`

  static examples = [
    `cacher setup
? API key: ****************,
? API token: ********************************
`,
    `cacher setup --key=fe33cd82ae161ba1 --token=0134a0be884468829669c3be02c3a814
`
  ]

  static flags = {
    key: flags.string({char: 'k', description: 'api key for Cacher account'}),
    token: flags.string({char: 't', description: 'token for Cacher account'})
  }

  private apiKey = ''
  private apiToken = ''

  async run() {
    const {flags} = this.parse(Setup)

    if (!flags.key || !flags.token) {
      this.log(
        chalk.yellow(`
To view your Cacher API token and token, visit:
${chalk.underline(`${config.appHost}/enter?action=view_api_creds`)}
`)
      )
    }

    this.apiKey = flags.key || ''
    this.apiToken = flags.token || ''

    const inquiries = []

    if (!this.apiKey) {
      inquiries.push({
        type: 'password',
        name: 'key',
        message: 'API key',
        mask: '*',
        suffix: ':',
        validate: (input: string) => {
          if (input.trim() === '') {
            return 'API key input required'
          } else {
            return true
          }
        }
      })
    }

    if (!this.apiToken) {
      inquiries.push({
        type: 'password',
        name: 'token',
        message: 'API token',
        mask: '*',
        suffix: ':',
        validate: (input: string) => {
          if (input.trim() === '') {
            return 'API token input required'
          } else {
            return true
          }
        }
      })
    }

    inquirer.prompt(inquiries).then((answers: any) => {
      if (answers.key) {
        this.apiKey = answers.key
      }

      if (answers.token) {
        this.apiToken = answers.token
      }

      this.validateCredentials()
    })
  }

  validateCredentials = () => {
    const spinner = ora('Logging into Cacher').start()
    spinner.color = 'green'

    request({
      method: 'POST',
      url: `${config.apiHost}/public/validate`,
      headers: {
        'X-Api-Key': this.apiKey,
        'X-Api-Token': this.apiToken
      },
      strictSSL: false
    }, (error: any, response: any, body: any) => {
      this.handleApiResponse(response, spinner)

      if (response.statusCode === 204) {
        this.onValidateSuccess(spinner)
      }
    })
  }

  onValidateSuccess = (spinner: any) => {
    const credentialsDir = `${os.homedir()}/.cacher`
    if (!fs.existsSync(credentialsDir)) {
      fs.mkdirSync(credentialsDir)
    }

    const credentialsJSON = {
      key: this.apiKey,
      token: this.apiToken
    }
    const credentialsFile = `${credentialsDir}/credentials.json`
    fs.writeFileSync(credentialsFile, JSON.stringify(credentialsJSON))
    spinner.succeed(chalk.green(` API key/token validated. Credentials saved to "${credentialsFile}"`))
  }
}
