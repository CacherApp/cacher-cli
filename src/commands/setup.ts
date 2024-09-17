import {Flags} from '@oclif/core'
import chalk from 'chalk'
import inquirer from 'inquirer'
import * as fs from 'node:fs'
import ora, {type Ora} from 'ora'

import {BaseCommand} from '../base-command.js'
import {appConfig} from '../config.js'

export default class Setup extends BaseCommand {
  static description = `
  Configure API credentials for Cacher CLI. To view your API token and key visit:
  ${chalk.underline(`${appConfig.appHost}/enter?action=view_api_creds`)}
  `

  static examples = [
    `cacher setup
? API key: ****************
? API token: ********************************
`,
    `cacher setup --key=fe33cd82ae161ba1 --token=0134a0be884468829669c3be02c3a814
`,
  ]

  static flags = {
    key: Flags.string({char: 'k', description: 'api key for Cacher account'}),
    token: Flags.string({char: 't', description: 'token for Cacher account'}),
  }

  onValidateSuccess = (spinner: Ora) => {
    this.makeCacherDir()

    const credentialsJSON = {
      key: this.apiKey,
      token: this.apiToken,
    }
    const credentialsFile = `${this.cacherDir}/credentials.json`
    fs.writeFileSync(credentialsFile, JSON.stringify(credentialsJSON))
    spinner.succeed(chalk.green(` API key/token validated. Credentials saved to "${credentialsFile}"`))
  }

  validateCredentials = async () => {
    const spinner = ora('Logging into Cacher').start()
    spinner.color = 'green'

    const response = await fetch(`${appConfig.apiHost}/public/validate`, {
      headers: {
        'X-Api-Key': this.apiKey,
        'X-Api-Token': this.apiToken,
      },
      method: 'POST',
    })

    this.handleApiResponse(response, spinner)

    if (response.status === 204) {
      this.onValidateSuccess(spinner)
    }
  }

  private apiKey = ''

  private apiToken = ''

  public async run() {
    this.checkForUpdate()

    const {flags} = await this.parse(Setup)

    if (!flags.key || !flags.token) {
      this.log(
        chalk.yellow(`
To view your Cacher API token and token, visit:
${chalk.underline(`${appConfig.appHost}/enter?action=view_api_creds`)}
`),
      )
    }

    this.apiKey = flags.key || ''
    this.apiToken = flags.token || ''

    const inquiries = []

    if (!this.apiKey) {
      inquiries.push({
        mask: '*',
        message: 'API key',
        name: 'key',
        suffix: ':',
        type: 'password',
        validate(input: string) {
          if (input.trim() === '') {
            return 'API key input required'
          }

          return true
        },
      })
    }

    if (!this.apiToken) {
      inquiries.push({
        mask: '*',
        message: 'API token',
        name: 'token',
        suffix: ':',
        type: 'password',
        validate(input: string) {
          if (input.trim() === '') {
            return 'API token input required'
          }

          return true
        },
      })
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    inquirer.prompt(inquiries).then(async (answers: Answer) => {
      if (answers.key) {
        this.apiKey = answers.key
      }

      if (answers.token) {
        this.apiToken = answers.token
      }

      await this.validateCredentials()
    })
  }
}
