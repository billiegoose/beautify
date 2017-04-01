const parser = require('../../lib/php-parser')
const unparser = require('../../lib/php-unparser')

export default function renderPHP (text) {
  let ast = parser.parseCode(text, {parser: {extractDoc: true}})
  let code = unparser(ast).trim()
  let spacer = code.includes('\n') ? '\n' : ' '
  return '<?php' + spacer + code + spacer + '?>'
}
