#!/usr/bin/env node
'use strict'
import chalk from 'chalk'
import commandLineArgs from 'command-line-args'
import getUsage from 'command-line-usage'
import {fs} from 'mz'
import path from 'upath'
import {ls, mkdir} from 'shelljs'
import beautify from '..'
import _ from 'lodash'

process.on('uncaughtException', function (err) {
  console.error(chalk.red('Error: ' + err.message))
  console.error(err)
  process.exit()
})
process.on('unhandledRejection', function (err) {
  console.error(chalk.red('Error: ' + err.message))
  console.error(err)
  process.exit()
})

/* eslint-disable no-multi-spaces, comma-spacing */
const optionDefinitions = [
  { name: 'help'       , type: Boolean , description: 'Display this help message'             , alias: 'h' },
  { name: 'input'      , type: String  , description: 'input file (or files)'                 , multiple: true, defaultOption: true },
  { name: 'output'     , type: String  , description: 'output file (or directory)'            , alias: 'o' },
  { name: 'html'       , type: String  , description: 'file extensions to treat as HTML'      , multiple: true, defaultValue: ['.html', '.htm'] },
  { name: 'style'      , type: String  , description: 'file extensions to treat as CSS'       , multiple: true, defaultValue: ['.css'] },
  { name: 'script'     , type: String  , description: 'file extensions to treat as JS'        , multiple: true, defaultValue: ['.js'] },
  { name: 'php'        , type: String  , description: 'file extensions to treat as PHP'       , multiple: true, defaultValue: ['.php'] },
  { name: 'dryrun'     , type: Boolean , description: 'Do a dry run' }
]
const reducedOptionDefinitions = optionDefinitions.filter(opt => !opt.defaultOption)
const usageDefinitions = [
  {
    header: 'Usage:',
    content: [
      { cmd: 'beautify input.html',                      help: 'Overwrites original' },
      { cmd: 'beautify input.html -o output.html',       help: 'Doesn\'t overwrite original' }
    ]
  },
  {
    header: 'Advanced Usage:',
    content: [
      { cmd: 'beautify *.html -o output',                help: 'Beautify all the .html files, save them in the output directory' },
      { cmd: 'beautify components/* --html .vue',        help: 'Beautify all the .vue files in components using the HTML beautifier' },
      { cmd: 'beautify **/*.css **/*.less --style .less .css', help: 'Beautify all the .css and .less files' },
      { cmd: 'beautify src/**/* --script .js .es6 .ts .json',  help: 'Beautify all the JavaScript / TypeScript / JSON files under the src dir' }
    ]
  },
  {
    header: 'Options:',
    optionList: reducedOptionDefinitions
  }
]
/* eslint-enable no-multi-spaces, comma-spacing */

async function main () {
  let options = commandLineArgs(optionDefinitions)

  if (process.argv.length === 2 || options.help) {
    console.log(getUsage(usageDefinitions))
    process.exit()
  }

  // Run each input through glob, remove duplicates, remove directories
  let files = _.uniq(ls('-ld', options.input)).filter(f => !f.isDirectory()).map(f => f.name)
  // filter out unrecognized file types
  let recognized = _.flatten([options.html, options.style, options.script, options.php])
  files = files.filter(f => recognized.includes(path.extname(f)))

  // Treat any path without a file extension as a directory
  var isDirectory = options.output && path.extname(options.output) === ''
  if (isDirectory && !options.dryrun) {
    mkdir('-p', options.output)
  }

  let getOutputFilename = (file) => {
    if (!options.output) return file
    return isDirectory ? path.join(options.output, file) : options.output
  }

  let getFormat = (file) => {
    let ext = path.extname(file)
    let formats = ['html', 'style', 'script', 'php']
    for (let i in formats) {
      if (options[formats[i]].includes(ext)) return formats[i]
    }
    return null
  }

  for (let file of files) {
    process.stdout.write(`${file} -> ${getOutputFilename(file)}`, 'utf8')
    let input = await fs.readFile(file, {encoding: 'utf8'})
    let output
    let format = getFormat(file)
    if (format) {
      output = await beautify[format](input)
    }
    if (!options.dryrun) {
      await fs.writeFile(getOutputFilename(file), output, {encoding: 'utf8'})
    }
    console.log(' ✔')
  }
}
main()
