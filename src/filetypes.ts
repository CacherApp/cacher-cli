/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable guard-for-in */
/* eslint-disable camelcase */
// Taken from https://raw.githubusercontent.com/thlorenz/brace/master/ext/modelist.js
const modes: any = []

function getModeForPath(path: string) {
  let mode = modesByName.text
  const fileName = path.split(/[/\\]/).pop()
  for (const mode_ of modes) {
    if (mode_.supportsFile(fileName)) {
      mode = mode_
      break
    }
  }

  return mode
}

class Mode {
  caption: string
  extensions: any
  extRe: any
  mode: string
  name: string

  constructor(name: string, caption: string, extensions: any) {
    this.name = name
    this.caption = caption
    this.mode = 'ace/mode/' + name
    this.extensions = extensions
    const re = /\^/.test(extensions) ? extensions.replaceAll(/\|(\^)?/g, (a: any, b: any) => '$|' + (b ? '^' : '^.*\\.')) + '$' : '^.*\\.(' + extensions + ')$';

    this.extRe = new RegExp(re, 'gi')
  }

  public supportsFile(filename: string) {
    return filename.match(this.extRe)
  }
}

const supportedModes: any = {
  ABAP: ['abap'],
  ABC: ['abc'],
  ADA: ['ada|adb'],
  ActionScript: ['as'],
  Apache_Conf: ['^htaccess|^htgroups|^htpasswd|^conf|htaccess|htgroups|htpasswd'],
  AsciiDoc: ['asciidoc|adoc'],
  Assembly_x86: ['asm|a'],
  AutoHotKey: ['ahk'],
  BatchFile: ['bat|cmd'],
  Bro: ['bro'],
  C_Cpp: ['cpp|c|cc|cxx|h|hh|hpp|ino'],
  C9Search: ['c9search_results'],
  CSS: ['css'],
  CSharp: ['cs'],
  Cirru: ['cirru|cr'],
  Clojure: ['clj|cljs'],
  Cobol: ['CBL|COB'],
  ColdFusion: ['cfm'],
  Csound_Document: ['csd'],
  Csound_Orchestra: ['orc'],
  Csound_Score: ['sco'],
  Curly: ['curly'],
  D: ['d|di'],
  Dart: ['dart'],
  Diff: ['diff|patch'],
  Django: ['html'],
  Dockerfile: ['^Dockerfile'],
  Dot: ['dot'],
  Drools: ['drl'],
  Dummy: ['dummy'],
  DummySyntax: ['dummy'],
  EJS: ['ejs'],
  Eiffel: ['e|ge'],
  Elixir: ['ex|exs'],
  Elm: ['elm'],
  Erlang: ['erl|hrl'],
  FTL: ['ftl'],
  Forth: ['frt|fs|ldr|fth|4th'],
  Fortran: ['f|f90'],
  Gcode: ['gcode'],
  Gherkin: ['feature'],
  Gitignore: ['^.gitignore'],
  Glsl: ['glsl|frag|vert'],
  Gobstones: ['gbs'],
  GraphQLSchema: ['gql'],
  Groovy: ['groovy'],
  HAML: ['haml'],
  HTML: ['html|htm|xhtml|vue|we|wpy'],
  HTML_Elixir: ['eex|html.eex'],
  HTML_Ruby: ['erb|rhtml|html.erb'],
  Handlebars: ['hbs|handlebars|tpl|mustache'],
  Haskell: ['hs'],
  Haskell_Cabal: ['cabal'],
  Hjson: ['hjson'],
  INI: ['ini|conf|cfg|prefs'],
  Io: ['io'],
  JSON: ['json'],
  JSONiq: ['jq'],
  JSP: ['jsp'],
  JSSM: ['jssm|jssm_state'],
  JSX: ['jsx'],
  Jack: ['jack'],
  Jade: ['jade|pug'],
  Java: ['java|cls|tgr'],
  JavaScript: ['js|jsm|jsx'],
  Julia: ['jl'],
  Kotlin: ['kt|kts'],
  LESS: ['less'],
  LSL: ['lsl'],
  LaTeX: ['tex|latex|ltx|bib'],
  Liquid: ['liquid'],
  Lisp: ['lisp'],
  LiveScript: ['ls'],
  LogiQL: ['logic|lql'],
  Lua: ['lua'],
  LuaPage: ['lp'],
  Lucene: ['lucene'],
  MATLAB: ['matlab'],
  MEL: ['mel'],
  MUSHCode: ['mc|mush'],
  Makefile: ['^Makefile|^GNUmakefile|^makefile|^OCamlMakefile|make'],
  Markdown: ['md|markdown'],
  Mask: ['mask'],
  Maze: ['mz'],
  MySQL: ['mysql'],
  NSIS: ['nsi|nsh'],
  Nix: ['nix'],
  OCaml: ['ml|mli'],
  ObjectiveC: ['m|mm'],
  PHP: ['php|phtml|shtml|php3|php4|php5|phps|phpt|aw|ctp|module'],
  Pascal: ['pas|p'],
  Perl: ['pl|pm'],
  Pig: ['pig'],
  Powershell: ['ps1'],
  Praat: ['praat|praatscript|psc|proc'],
  Prolog: ['plg|prolog'],
  Properties: ['properties'],
  Protobuf: ['proto'],
  Python: ['py'],
  R: ['r'],
  RDoc: ['Rd'],
  RHTML: ['Rhtml'],
  RST: ['rst'],
  Razor: ['cshtml|asp'],
  Red: ['red|reds'],
  Ruby: ['rb|ru|gemspec|rake|^Guardfile|^Rakefile|^Gemfile'],
  Rust: ['rs'],
  SASS: ['sass'],
  SCAD: ['scad'],
  SCSS: ['scss'],
  SH: ['sh|bash|^.bashrc'],
  SJS: ['sjs'],
  SQL: ['sql'],
  SQLServer: ['sqlserver'],
  SVG: ['svg'],
  Scala: ['scala'],
  Scheme: ['scm|sm|rkt|oak|scheme'],
  Smarty: ['smarty|tpl'],
  Soy_Template: ['soy'],
  Space: ['space'],
  Stylus: ['styl|stylus'],
  Swift: ['swift'],
  TSX: ['tsx'],
  Tcl: ['tcl'],
  Tex: ['tex'],
  Text: ['txt'],
  Textile: ['textile'],
  Toml: ['toml'],
  Twig: ['twig|swig'],
  Typescript: ['ts|typescript|str'],
  VBScript: ['vbs|vb'],
  VHDL: ['vhd|vhdl'],
  Vala: ['vala'],
  Velocity: ['vm'],
  Verilog: ['v|vh|sv|svh'],
  Wollok: ['wlk|wpgm|wtest'],
  XML: ['xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl|xaml'],
  XQuery: ['xq'],
  YAML: ['yaml|yml'],
  coffee: ['coffee|cf|cson|^Cakefile'],
  golang: ['go'],
  haXe: ['hx'],
  pgSQL: ['pgsql'],
  snippets: ['snippets']
}

const nameOverrides: any = {
  C_Cpp: 'C and C++',
  CSharp: 'C#',
  Csound_Document: 'Csound Document',
  Csound_Orchestra: 'Csound',
  Csound_Score: 'Csound Score',
  FTL: 'FreeMarker',
  HTML_Elixir: 'HTML (Elixir)',
  HTML_Ruby: 'HTML (Ruby)',
  ObjectiveC: 'Objective-C',
  coffee: 'CoffeeScript',
  golang: 'Go'
}
const modesByName: any = {}
for (const name in supportedModes) {
  const data = supportedModes[name]
  const displayName = (nameOverrides[name] || name).replaceAll('_', ' ')
  const filename = name.toLowerCase()
  const mode = new Mode(filename, displayName, data[0])
  modesByName[filename] = mode
  modes.push(mode)
}

export {
  getModeForPath,
  modes,
  modesByName
}
