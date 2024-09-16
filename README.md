Cacher CLI
==========

**Cacher CLI** - The command line interface to [Cacher](https://www.cacher.io), the code snippet organizer for pro 
developers.

![Cacher logo](https://cdn.cacher.io/repos/cacher-logo.png)

[![Version](https://img.shields.io/npm/v/@cacherapp/cli.svg)](https://npmjs.org/package/@cacherapp/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@cacherapp/cli.svg)](https://npmjs.org/package/@cacherapp/cli)
[![License](https://img.shields.io/npm/l/@cacherapp/cli.svg)](https://github.com/cacherapp/cacher-cli/blob/master/package.json)

The Cacher CLI allows power users to perform common actions on their Cacher libraries.

The CLI is constantly evolving. Check back often for updates and new commands.

**Demo**

![CLI demo](https://cdn.cacher.io/repos/cli-demo-add.gif)

## Getting Started

**Prerequisites**
- You've signed up for [Cacher](https://www.cacher.io)
- [Node.js](https://nodejs.org/en/)

**Instructions**

To view your Cacher API credentials, visit:
[https://app.cacher.io/enter?action=view_api_creds](https://app.cacher.io/enter?action=view_api_creds)

Note the API key and token in the dialog:

<img src="https://cdn.cacher.io/repos/api-creds.png" width="600" />

From a terminal window, run:

```bash
npm install -g @cacherapp/cli
cacher setup
? API key: ****************
? API token: ********************************
``` 

If all goes well, your credentials will be saved and you can execute CLI commands. 

## Commands

* [setup](#setup)
* snippets:
  - [add](#snippetsadd)
* run-server:
  - [start](#run-serverstart)
  - [configure](#run-serverconfig)
  - [log](#run-serverlog)

### setup

Configure API credentials for Cacher CLI. To view your API token and key visit:
[https://app.cacher.test/enter?action=view_api_creds](https://app.cacher.test/enter?action=view_api_creds)

```
USAGE
  $ cacher setup

OPTIONS
  -k, --key=key      api key for Cacher account
  -t, --token=token  token for Cacher account

EXAMPLES
  cacher setup
  ? API key: ****************
  ? API token: ********************************

  cacher setup --key=fe33cd82ae161ba1 --token=0134a0be884468829669c3be02c3a814
```

_See code: [lib/commands/setup/index.ts](https://github.com/CacherApp/cacher-cli/blob/master/src/commands/setup/index.ts)_

### snippets:add

Add a new snippet to your Cacher personal/team library. By default, creates snippet using clipboard contents. Append `filename` argument to use file contents instead.

```
USAGE
  $ cacher snippets:add [FILENAME]

OPTIONS
  -d, --description=description  snippet description
  -f, --filename=filename        filename for content (will override name of file passed in)
  -m, --team=team                screenname of team library that snippet will be created in
  -q, --quiet                    minimal feedback
  -t, --title=title              snippet title
  -u, --public                   save as public snippet

EXAMPLES
  $ cacher snippets:add
  ? Snippet title: Example from System Clipboard
  ? Description: Snippet created from contents in the clipboard.
  ? Filename: my_file_from_clipboard.md

  $ cacher snippets:add ~/MyCode/example.rb
  ? Snippet title: Example for CLI
  ? Description: This is an example for the Cacher CLI.

  $ cacher snippets:add --filename=my_file_from_clipboard.md \
      --title="Public example from System Clipboard" \
      --description="Snippet created from contents in the clipboard" \
      --team=cacher-dev-ops --public --quiet
```

_See code: [lib/commands/snippets/add.ts](https://github.com/CacherApp/cacher-cli/blob/master/src/commands/snippets/add.ts)_

### run-server:start
Start a Run Server to accept requests from a given origin. The Run Server is used to run shell commands using Cacher snippet file contents. Run this command in tandom with the Cacher's standalone Run Server option.

For more information about the Run Server and its configuration, check out [@cacherapp/cacher-run-server](https://github.com/cacherapp/cacher-run-server).

```
USAGE
  $ cacher run-server:start

OPTIONS
  -l, --logToFile      log output to server log file (~/.cacher/logs/run-server.log)
  -o, --origin=origin  http(s) origin for CORS requests (use "file://" with Cacher Desktop, "https://app.cacher.io" with Web App)
  -p, --port=port      port to run server on
  -t, --token=token    server token to check against while making connections
  -v, --verbose        show verbose logging

EXAMPLE
  $ cacher run-server:start -o https://myapp.dev -p 30012 -t my_server_token

    Listening on: http://localhost:30012
    Server token: my_server_token
```

**Examples:**
```shell
# With origin "https://app.cacher.io", generate port and token
cacher run-server:start

# With origin "file://" for Cacher Desktop Client, specify port and token
cacher run-server:start -o file:// -p 12345 -t secret

# Verbose output, logged to "~/.cacher/logs/run-server.log"
cacher run-server:start -v -l
```

#### Starting the server on a remote machine

Running a remote server ensures all your developers are able to run snippet file commands against the same 
environment.

**Note:** Since the commands will be run using the shell account from which you launch the CLI, we recommend
you use only machines which are for testing or are ephemeral (i.e. Docker instances).

Example of launching with a secure tunnel ([ngrok](https://ngrok.com/)).
```
cacher run-server:start -p 39135 -t 4D5dzRGliafhGg~btNlR9 -o file:// -v
ngrok http 39135
```

You can then connect to the server via Cacher's Standalone option:

![Connect to Standalone Run Server](https://cdn.cacher.io/repos/standalone-connect.png)

### run-server:configure

Open the user configuration for the Run Server. Add rules here to handle additional file extensions.

```
USAGE
  $ cacher run-server:configure

OPTIONS
  -e, --editor=editor  open configuration file with editor (i.e. "code" for Visual Studio Code)

EXAMPLES
  $ cacher run-server:configure
  $ cacher run-server:configure -e code
```

[View documentation](https://github.com/CacherApp/cacher-run-server#editing-the-configuration) on the user
configuration rule format.

### run-server:log

Show the server log file.

```
USAGE
  $ cacher run-server:log

OPTIONS
  -n, --lines=lines  show the last n lines of the log
  -t, --tail         follow the Run Server log

EXAMPLE
  $ cacher run-server:log
  $ cacher run-server:log -t
  $ cacher run-server:log -n 100
```

## Command Help

```bash
cacher help                 # View description and command topics
cacher help snippets        # Help on snippets commands
cacher help snippets:add    # Help and usage for the snippets:add command
```

## Libraries Used

- [oclif](https://oclif.io/) - Heroku's open CLI framework.
- [chalk](https://github.com/chalk/chalk) - Terminal styling for Node.
- [node-copy-paste](https://github.com/xavi-/node-copy-paste) - Cross-platform clipboard support.

## Author / License

Released under the [MIT License](/LICENSE) by [Rui Jiang](https://github.com/jookyboi) of [Cacher](https://www.cacher.io).
