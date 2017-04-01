const parser = require('../../lib/php-parser')
const unparser = require('../../lib/php-unparser')

export default function renderPHP (text, options) {
  // strip <?php and ?> so we can use eval
  text = text.replace(/^\s*<\?php\s*/, '')
  text = text.replace(/\s*\?>\s*$/, '')
  let ast = parser.parseEval(text, {parser: {extractDoc: true}})
  // let ast = parser.parseCode(text, {parser: {extractDoc: true}})
  let code = unparser(ast, options.phpUnparser).trim()
  console.log(code)
  let spacer = code.includes('\n') ? '\n' : ' '
  return '<?php' + spacer + code + spacer + '?>'
}
