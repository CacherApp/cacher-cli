import {Command} from '@oclif/command'
import chalk from 'chalk'
import * as fs from 'fs'
import * as os from 'os'

require('dotenv').config()

export abstract class BaseCommand extends Command {
  warnAndQuit(message: string) {
    this.log(chalk.red(message))
    this.exit(0)
  }

  checkCredentials() {
    const credentialsFile = `${os.homedir()}/.cacher/credentials.json`
    const envVarsPresent = process.env.CACHER_API_KEY && process.env.CACHER_API_TOKEN

    if (!fs.existsSync(credentialsFile) && !envVarsPresent) {
      this.warnAndQuit(
        'No Cacher credentials found. Please run `cacher setup` or set environment variables `CACHER_API_KEY` and `CACHER_API_TOKEN`.',
      )
    }
  }

  getCredentials() {
    let apiKeyFromFile = ''
    let apiTokenFromFile = ''

    const credentialsFile = `${os.homedir()}/.cacher/credentials.json`

    if (fs.existsSync(credentialsFile)) {
      const json = JSON.parse(fs.readFileSync(credentialsFile).toString())
      apiKeyFromFile = json.key
      apiTokenFromFile = json.token
    }

    // Env vars take precedence
    const apiKey = process.env.CACHER_API_KEY || apiKeyFromFile
    const apiToken = process.env.CACHER_API_TOKEN || apiTokenFromFile

    return {apiKey, apiToken}
  }

  handleApiResponse(response: any, spinner: any) {
    if (response.statusCode === 403) {
      spinner.fail(chalk.red(' Cacher API key/token combination invalid.'))
    } else if (response.statusCode >= 400) {
      spinner.fail(chalk.red(' Server-side error.'))
    }
  }
}
