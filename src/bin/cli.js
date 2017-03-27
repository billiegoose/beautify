#!/usr/bin/env node
'use strict'
import chalk from 'chalk'
import commandLineArgs from 'command-line-args'
import getUsage from 'command-line-usage'
import assert from 'assert'
import fs from 'fs'
import beautify from '..'

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
  { name: 'input'      , type: String  , description: 'input file (.html or .php)'            , alias: 'i' },
  { name: 'output'     , type: String  , description: 'output file'                           , alias: 'o' },
  { name: 'replace'    , type: String  , description: 'Use this file for input and output'    , alias: 'r' },
  { name: 'dryrun'     , type: Boolean , description: 'Do a dry run' }
]
const usageDefinitions = [
  {
    header: 'Usage:',
    content: [
      { cmd: 'beautify -i input.html -o output.html',    help: 'Reads input.html, beautifies it, and saves it as output.html' },
      { cmd: 'or' },
      { cmd: 'beautify -r input.html',                   help: 'Beautifies input.html in place by overwriting it' }
    ]
  },
  {
    header: 'Options:',
    optionList: optionDefinitions
  }
]
/* eslint-enable no-multi-spaces, comma-spacing */

let options = commandLineArgs(optionDefinitions)

if (Object.keys(options).length === 0 || options.help) {
  console.log(getUsage(usageDefinitions))
  process.exit()
}

// Assertions
if (options.replace) {
  assert(!options.input, 'Cannot mix replace mode with input/output mode')
  assert(!options.output, 'Cannot mix replace mode with input/output mode')
  // Because we're gonna overwrite your values sucker!
  options.input = options.replace
  options.output = options.replace
} else {
  assert.ok(options.input, 'No input file specified')
  assert.ok(options.output, 'No output file specified')
}

console.log(options.input, '->', options.output)

let input = fs.readFileSync(options.input, {encoding: 'utf8'})
beautify(input).then(output => {
  fs.writeFileSync(options.output, output, {encoding: 'utf8'})
  console.log(options.input, '->', options.output)
})
