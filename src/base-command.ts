import {Command} from '@oclif/command'
import chalk from 'chalk'
import {execSync} from 'child_process'
import * as fs from 'fs'
import * as os from 'os'

const semver = require('semver')
require('dotenv').config()

export abstract class BaseCommand extends Command {
  cacherDir = `${os.homedir()}/.cacher`
  storageFile = `${this.cacherDir}/storage.json`

  makeCacherDir() {
    if (!fs.existsSync(this.cacherDir)) {
      fs.mkdirSync(this.cacherDir)
    }
  }

  checkForUpdate() {
    this.makeCacherDir()

    let storage: any = {}

    if (fs.existsSync(this.storageFile)) {
      storage = JSON.parse(fs.readFileSync(this.storageFile).toString())
    } else {
      fs.writeFileSync(this.storageFile, JSON.stringify({}))
    }

    if (storage.checkedForUpdate) {
      const lastChecked = storage.checkedForUpdate
      const dayInMillis = 60 * 60 * 1000 * 24

      if ((new Date()).getTime() - dayInMillis > lastChecked) {
        this.notifyUserForUpdate()
      }
    } else {
      this.notifyUserForUpdate()
    }
  }

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

  private notifyUserForUpdate() {
    const packageVersion = execSync(`npm show ${this.config.name} version`).toString()

    if (semver.gt(packageVersion, this.config.version)) {
      this.log(
        chalk.red(`Your Cacher CLI is outdated. Run \`npm update -g ${this.config.name}\` to update.`)
      )
    }

    // Update last checked time
    let storage = JSON.parse(fs.readFileSync(this.storageFile).toString())
    storage.checkedForUpdate = (new Date()).getTime()
    fs.writeFileSync(this.storageFile, JSON.stringify(storage))
  }
}
