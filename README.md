cacher-cli
==========

The command line interface to Cacher.

[![Version](https://img.shields.io/npm/v/cacher-cli.svg)](https://npmjs.org/package/@cacherapp/cli)
[![Downloads/week](https://img.shields.io/npm/dw/cacher-cli.svg)](https://npmjs.org/package/@cacherapp/cli)
[![License](https://img.shields.io/npm/l/cacher-cli.svg)](https://github.com/jookyboi/cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
<!-- usage -->
# Usage

```sh-session
$ npm install -g cacher-cli
$ cacher COMMAND
running command...
$ cacher (-v|--version|version)
cacher-cli/0.0.1 darwin-x64 node-v8.9.4
$ cacher --help [COMMAND]
USAGE
  $ cacher COMMAND
...
```
<!-- usagestop -->
<!-- commands -->
# Commands

* [cacher hello [FILE]](#hello-file)
* [cacher help [COMMAND]](#help-command)
## hello [FILE]

describe the command here

```
USAGE
  $ cacher hello [FILE]

OPTIONS
  -f, --force
  -n, --name=name  name to print

EXAMPLE
  $ cacher hello
  hello world from ./src/hello.ts!
```

_See code: [lib/commands/hello.js](https://github.com/cacherapp/cacher-cli/blob/v0.0.1/lib/commands/hello.js)_

## help [COMMAND]

display help for cacher

```
USAGE
  $ cacher help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v1.1.6/src/commands/help.ts)_
<!-- commandsstop -->
