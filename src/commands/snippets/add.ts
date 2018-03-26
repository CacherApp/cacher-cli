import {flags} from '@oclif/command'
import chalk from 'chalk'
import * as fs from 'fs'
import * as path from 'path'

const ncp = require('copy-paste')
const request = require('request')
const ora = require('ora')

const prompt = require('prompt')
prompt.message = ''
prompt.delimiter = ':'

import {BaseCommand} from '../../base-command'
import config from '../../config'
import {getModeForPath} from '../../filetypes'

export default class Add extends BaseCommand {
  static description = 'Add a new snippet to your Cacher personal/team library.'

  static examples = [
    `$ cacher snippets:add
Snippet title: Example from System Clipboard
Description (empty): Snippet created from contents in the clipboard.
Filename: my_file_from_clipboard.md
`,
    `$ cacher snippets:add --filename=my_file_from_clipboard.md --title="Public example from System Clipboard" --description="Snippet created from contents in the clipboard" --team=cacher-dev-ops --public
`,
    `$ cacher snippets:add ~/MyCode/example.rb
Snippet title: Example for CLI
Description (empty): This is an example for the Cacher CLI.
`,
  ]

  static flags = {
    filename: flags.string({char: 'f', description: 'filename for content (will override name of file passed in)'}),
    title: flags.string({char: 't', description: 'snippet title'}),
    description: flags.string({char: 'd', description: 'snippet description', default: ''}),
    team: flags.string({char: 'm', description: 'screenname of team library that snippet will be created in', default: ''}),
    public: flags.boolean({char: 'u', description: 'save as public snippet'})
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

    const prompts = [
      {
        name: 'title',
        description: 'Snippet title',
        required: true
      },
      {
        name: 'description',
        description: 'Description (empty)',
        required: false
      },
      {
        name: 'filename',
        description: 'Filename',
        required: true
      },
    ]

    prompt.override = {...args, ...flags}

    prompt.get(prompts, (err: any, result: any) => {
      this.title = result.title
      this.description = result.description
      this.teamScreenname = flags.team
      this.isPublic = flags.public === true
      this.filename = this.filename || result.filename
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
      url: `${config.apiHost}/integrations/create_snippet`,
      headers: {
        'X-Api-Key': credentials.apiKey,
        'X-Api-Token': credentials.apiToken
      },
      strictSSL: false,
      json: true,
      body
    }, (error: any, response: any, body: any) => {
      this.handleApiResponse(response, spinner)

      if (response.statusCode === 200) {
        spinner.succeed(chalk.green(` Snippet successfully created: ${this.title}`))
        this.log(
          chalk.yellow(`\nView your snippet in the Cacher app:
${chalk.underline(`${config.apiHost}/enter?action=view_snippet=${body.snippet.guid}`)}\n`)
        )

        this.log(
          chalk.yellow(`View your snippet's page:
${chalk.underline(`${config.snippetsHost}/snippet/${body.snippet.guid}`)}\n`)
        )
      }
    })
  }
}
