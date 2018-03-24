import {Command, flags} from '@oclif/command'

export default class Add extends Command {
  static description = 'add a new snippet to your Cacher personal/team library'

  static examples = [
    `$ cacher add
Filename: my_file_from_clipboard.md
Snippet title: Example from System Clipboard
Description (empty): Snippet created from contents in the clipboard.
`,
    `$ cacher add --filename=my_file_from_clipboard.md --title="Public example from System Clipboard" --description="Snippet created from contents in the clipboard" --team=cacher-dev-ops --public
`,
    `$ cacher add ~/MyCode/example.rb
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
    {name: 'file', required: false}
  ]

  async run() {
    const {args, flags} = this.parse(Add)

    this.log(args)
    this.log(flags)
  }
}
