import {flags} from '@oclif/command'
import chalk from 'chalk'
import * as fs from 'fs'
import * as path from 'path'

const inquirer = require('inquirer')
const ncp = require('copy-paste')
const notifier = require('node-notifier')
const request = require('request')
const opn = require('opn')
const ora = require('ora')

import {BaseCommand} from '../../base-command'
import config from '../../config'
import ErrorCodes from '../../errors-codes'
import {getModeForPath} from '../../filetypes'

export default class Add extends BaseCommand {
  static description = 'Add a new snippet to your Cacher personal/team library.'

  static examples = [
    `$ cacher snippets:add
? Snippet title: Example from System Clipboard
? Description: Snippet created from contents in the clipboard.
? Filename: my_file_from_clipboard.md
`,
    `$ cacher snippets:add ~/MyCode/example.rb
? Snippet title: Example for CLI
? Description: This is an example for the Cacher CLI.
`,
    `$ cacher snippets:add --filename=my_file_from_clipboard.md --title="Public example from System Clipboard" --description="Snippet created from contents in the clipboard" --team=cacher-dev-ops --public --quiet
`,
  ]

  static flags = {
    filename: flags.string({char: 'f', description: 'filename for content (will override name of file passed in)'}),
    title: flags.string({char: 't', description: 'snippet title'}),
    description: flags.string({char: 'd', description: 'snippet description', default: ''}),
    team: flags.string({char: 'm', description: 'screenname of team library that snippet will be created in', default: ''}),
    public: flags.boolean({char: 'u', description: 'save as public snippet'}),
    quiet: flags.boolean({char: 'q', description: 'minimal feedback'})
  }

  static args = [
    {name: 'filename', required: false}
  ]

  private filename = ''
  private title = ''
  private description = ''
  private content = ''
  private filetype = ''
  private teamScreenname: any
  private isPublic = false
  private quiet = false

  private snippet: any

  async run() {
    const {args, flags} = this.parse(Add)
    this.checkCredentials()

    if (args.filename) {
      if (!fs.existsSync(args.filename)) {
        this.warnAndQuit(`${args.filename} does not exist.`)
      }

      this.filename = path.basename(args.filename)
    } else if (flags.filename) {
      this.filename = flags.filename
    }

    if (args.filename) {
      this.content = fs.readFileSync(args.filename).toString()

      this.log(chalk.gray(`Snippet file content read from "${args.filename}":\n`))
    } else {
      // Read from clipboard
      this.content = ncp.paste()
      this.log(chalk.gray('Snippet file content read from clipboard:\n'))
    }

    this.log(chalk.yellow(`${this.content}\n`))

    this.filename = this.filename || ''
    this.title = flags.title || ''
    this.description = flags.description || ''
    this.teamScreenname = flags.team
    this.isPublic = flags.public === true
    this.quiet = flags.quiet === true

    const inquiries = []

    if (!this.title) {
      inquiries.push({
        type: 'input',
        name: 'title',
        message: 'Snippet title',
        suffix: ':',
        validate: (input: string) => {
          if (input.trim() === '') {
            return 'Snippet title required'
          } else {
            return true
          }
        }
      })
    }

    if (!this.description) {
      inquiries.push({
        type: 'input',
        name: 'description',
        message: 'Description',
        suffix: ':',
        default: ''
      })
    }

    if (!this.filename) {
      inquiries.push({
        type: 'input',
        name: 'filename',
        message: 'Filename',
        suffix: ':',
        validate: (input: string) => {
          if (input.trim() === '') {
            return 'Filename required'
          } else {
            return true
          }
        }
      })
    }

    inquirer.prompt(inquiries).then((answers: any) => {
      if (answers.title) {
        this.title = answers.title
      }

      if (answers.description) {
        this.description = answers.description
      }

      if (answers.filename) {
        this.filename = answers.filename
      }

      this.filetype = getModeForPath(this.filename).mode.split('/')[2]
      this.saveSnippet()
    })
  }

  saveSnippet = () => {
    const spinner = ora('Saving snippet').start()
    spinner.color = 'green'

    const credentials = this.getCredentials()

    const body = {
      teamScreenname: this.teamScreenname,
      snippet: {
        title: this.title,
        description: this.description,
        isPrivate: !this.isPublic,
        files: [
          {
            filename: this.filename,
            content: this.content,
            filetype: this.filetype
          }
        ]
      }
    }

    request({
      method: 'POST',
      url: `${config.apiHost}/public/snippets`,
      headers: {
        'X-Api-Key': credentials.apiKey,
        'X-Api-Token': credentials.apiToken
      },
      strictSSL: false,
      json: true,
      body
    }, (error: any, response: any, body: any) => {
      if (response.statusCode === 200) {
        spinner.succeed(chalk.green(` Snippet successfully created: ${this.title}`))

        if (!this.quiet) {
          this.log(
            `\n${chalk.white('View your snippet in Cacher:')}
${chalk.yellow.underline(`${config.appHost}/enter?action=goto_snippet&s=${body.snippet.guid}`)}`
          )

          this.log(
            `\n${chalk.white('View your snippet\'s page:')}
${chalk.yellow.underline(`${config.snippetsHost}/snippet/${body.snippet.guid}`)}\n`
          )

          this.snippet = body.snippet
          this.notifyCreated()
        }
      } else if (response.statusCode === 403
        && body.error_code === ErrorCodes.planLimitSnippets) {
        spinner.fail(chalk.red(' You have hit your account plan limit for private snippets.'))
        this.log(chalk.red('Upgrade your plan at: ') + chalk.red.underline(`${config.appHost}/enter?action=view_plans`))
      } else if (response.statusCode === 404
        && body.error_code === ErrorCodes.resourceNotFoundTeam) {
        spinner.fail(chalk.red(` Team with screenname "${this.teamScreenname}" not found.`))
      } else {
        this.handleApiResponse(response, spinner)
      }
    })
  }

  notifyCreated = () => {
    notifier.notify(
      {
        title: 'Snippet created',
        message: this.title,
        icon: path.join(__dirname, '..', '..', 'images', 'cacher-icon.png'),
        timeout: 3,
        actions: 'Open',
        closeLabel: 'Close'
      },
      (err: any, action: any) => {
        if (action === 'activate') {
          opn(
            `${config.appHost}/enter?action=goto_snippet&s=${this.snippet.guid}`,
            {wait: false}
          )
        }
      }
    )
  }
}
