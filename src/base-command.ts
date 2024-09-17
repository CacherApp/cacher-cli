import {Command} from '@oclif/core'
import chalk from 'chalk'
import 'dotenv/config'
import {execSync} from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import { type Ora } from 'ora'
import * as semver from 'semver'

export abstract class BaseCommand extends Command {
  cacherDir = `${os.homedir()}/.cacher`
  storageFile = `${this.cacherDir}/storage.json`

  checkCredentials() {
    const credentialsFile = `${os.homedir()}/.cacher/credentials.json`
    const envVarsPresent = process.env.CACHER_API_KEY && process.env.CACHER_API_TOKEN

    if (!fs.existsSync(credentialsFile) && !envVarsPresent) {
      this.warnAndQuit(
        'No Cacher credentials found. Please run `cacher setup` or set environment variables `CACHER_API_KEY` and `CACHER_API_TOKEN`.',
      )
    }
  }

  checkForUpdate() {
    this.makeCacherDir()

    let storage: { checkedForUpdate?: number } = {}

    if (fs.existsSync(this.storageFile)) {
      storage = JSON.parse(fs.readFileSync(this.storageFile).toString())
    } else {
      fs.writeFileSync(this.storageFile, JSON.stringify({}))
    }

    if (storage.checkedForUpdate) {
      const lastChecked = storage.checkedForUpdate
      const dayInMillis = 60 * 60 * 1000 * 24

      if (Date.now() - dayInMillis > lastChecked) {
        this.notifyUserForUpdate()
      }
    } else {
      this.notifyUserForUpdate()
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

  handleApiResponse(response: Response, spinner: Ora) {
    if (response.status === 403) {
      spinner.fail(chalk.red(' Cacher API key/token combination invalid.'))
    } else if (response.status >= 400) {
      spinner.fail(chalk.red(' Server-side error.'))
    }
  }

  makeCacherDir() {
    if (!fs.existsSync(this.cacherDir)) {
      fs.mkdirSync(this.cacherDir)
    }
  }

  warnAndQuit(message: string) {
    this.log(chalk.red(message))
    this.exit(0)
  }

  private notifyUserForUpdate() {
    const packageVersion = execSync(`npm show ${this.config.name} version`).toString()

    if (semver.gt(packageVersion, this.config.version)) {
      this.log(
        chalk.red(`Your Cacher CLI is outdated. Run \`npm update -g ${this.config.name}\` to update.`)
      )
    }

    // Update last checked time
    const storage = JSON.parse(fs.readFileSync(this.storageFile).toString())
    storage.checkedForUpdate = Date.now()
    fs.writeFileSync(this.storageFile, JSON.stringify(storage))
  }
}
