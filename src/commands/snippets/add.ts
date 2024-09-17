import {Args, Flags} from '@oclif/core'
import chalk from 'chalk'
import clipboardy from 'clipboardy'
import inquirer from 'inquirer'
import * as fs from 'node:fs'
import path, {dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import notifier from 'node-notifier'
import open from 'open'
import ora from 'ora'

import {BaseCommand} from '../../base-command.js'
import {appConfig} from '../../config.js'
import {errorCodes} from '../../error-codes.js'
import {getModeForPath} from '../../filetypes.js'
import {Snippet} from '../../types/snippet.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default class SnippetsAdd extends BaseCommand {
  static override args = {
    filename: Args.string({description: 'filename to read', required: false}),
  }

  static description =
    'Add a new snippet to your Cacher personal/team library. By default, creates snippet using clipboard contents. Append filename argument to use file contents instead.'

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
    `$ cacher snippets:add --filename=my_file_from_clipboard.md \\
   --title="Public example from System Clipboard" \\
   --description="Snippet created from contents in the clipboard" \\
   --team=cacher-dev-ops --public --quiet
`,
  ]

  static flags = {
    description: Flags.string({char: 'd', default: '', description: 'snippet description'}),
    filename: Flags.string({char: 'f', description: 'filename for content (will override name of file passed in)'}),
    public: Flags.boolean({char: 'u', description: 'save as public snippet'}),
    quiet: Flags.boolean({char: 'q', description: 'minimal feedback'}),
    team: Flags.string({
      char: 'm',
      default: '',
      description: 'screenname of team library that snippet will be created in',
    }),
    title: Flags.string({char: 't', description: 'snippet title'}),
  }

  notifyCreated = (snippet: Snippet) => {
    notifier.notify(
      {
        actions: 'Open',
        closeLabel: 'Close',
        icon: path.join(__dirname, '..', '..', 'images', 'cacher-icon.png'),
        message: this.title,
        timeout: 3,
        title: 'Snippet created',
      },
      (err: unknown, action: string) => {
        if (action === 'activate') {
          open(`${appConfig.appHost}/enter?action=goto_snippet&s=${snippet.guid}`, {wait: false})
        }
      },
    )
  }

  saveSnippet = async () => {
    const spinner = ora('Saving snippet').start()
    spinner.color = 'green'

    const credentials = this.getCredentials()

    const body: {snippet: Snippet; teamScreenname?: string} = {
      snippet: {
        description: this.snippetDescription,
        files: [
          {
            content: this.content,
            filename: this.filename,
            filetype: this.filetype,
          },
        ],
        isPrivate: !this.isPublic,
        title: this.title,
      },
    }

    if (this.teamScreenname && this.teamScreenname.trim() !== '') {
      body.teamScreenname = this.teamScreenname
    }

    const response = await fetch(`${appConfig.apiHost}/public/snippets`, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': credentials.apiKey,
        'X-Api-Token': credentials.apiToken,
      },
      method: 'POST',
    })

    const data: {error_code?: string; snippet: Snippet} = await response.json()

    if (response.status === 200) {
      spinner.succeed(chalk.green(` Snippet successfully created: ${this.title}`))

      if (!this.quiet) {
        this.log(
          `\n${chalk.white('View your snippet in Cacher:')}
${chalk.yellow.underline(`${appConfig.appHost}/enter?action=goto_snippet&s=${data.snippet.guid}`)}`,
        )

        this.log(
          `\n${chalk.white("View your snippet's page:")}
${chalk.yellow.underline(`${appConfig.snippetsHost}/snippet/${data.snippet.guid}`)}\n`,
        )

        this.notifyCreated(data.snippet)
      }
    } else if (response.status === 403 && data.error_code === errorCodes.planLimitSnippets) {
      spinner.fail(chalk.red(' You have hit your account plan limit for private snippets.'))
      this.log(
        chalk.red('Upgrade your plan at: ') + chalk.red.underline(`${appConfig.appHost}/enter?action=view_plans`),
      )
    } else if (response.status === 404 && data.error_code === errorCodes.resourceNotFoundTeam) {
      spinner.fail(chalk.red(` Team with screenname "${this.teamScreenname}" not found.`))
    } else {
      this.handleApiResponse(response, spinner)
    }
  }

  private content = ''
  private filename = ''
  private filetype = ''
  private isPublic = false
  private quiet = false

  private snippetDescription = ''

  private teamScreenname = ''

  private title = ''

  public async run(): Promise<void> {
    this.checkForUpdate()

    const {args, flags} = await this.parse(SnippetsAdd)
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
      this.content = clipboardy.readSync()
      this.log(chalk.gray('Snippet file content read from clipboard:\n'))
    }

    this.log(chalk.yellow(`${this.content}\n`))

    this.filename = flags.filename || ''
    this.title = flags.title || ''
    this.snippetDescription = flags.description || ''
    this.teamScreenname = flags.team
    this.isPublic = flags.public === true
    this.quiet = flags.quiet === true

    const inquiries = []

    if (!this.title) {
      inquiries.push({
        message: 'Snippet title',
        name: 'title',
        suffix: ':',
        type: 'input',
        validate(input: string) {
          if (input.trim() === '') {
            return 'Snippet title required'
          }

          return true
        },
      })
    }

    if (!this.snippetDescription) {
      inquiries.push({
        default: '',
        message: 'Description',
        name: 'description',
        suffix: ':',
        type: 'input',
      })
    }

    if (!this.filename) {
      inquiries.push({
        message: 'Filename',
        name: 'filename',
        suffix: ':',
        type: 'input',
        validate(input: string) {
          if (input.trim() === '') {
            return 'Filename required'
          }

          return true
        },
      })
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    inquirer.prompt(inquiries).then(async (answers: Answer) => {
      if (answers.title) {
        this.title = answers.title
      }

      if (answers.description) {
        this.snippetDescription = answers.description
      }

      if (answers.filename) {
        this.filename = answers.filename
      }

      this.filetype = getModeForPath(this.filename).mode.split('/')[2]
      await this.saveSnippet()
    })
  }
}
