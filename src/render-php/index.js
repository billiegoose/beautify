const parser = require('../../lib/php-parser')
const unparser = require('../../lib/php-unparser')

export default function renderPHP (text, options) {
  let ast = parser.parseCode(text, {parser: {extractDoc: true}})
  let code = unparser(ast, options.phpUnparser).trim()
  let spacer = code.includes('\n') ? '\n' : ' '
  return '<?php' + spacer + code + spacer + '?>'
}
