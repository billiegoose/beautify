const PhpUnparser = require('php-unparser')
const PhpParser = require('php-parser')
let parser = new PhpParser({
  ast: {
    withPositions: true
  },
  parser: {
    extractDoc: true
  }
})

export default function renderPHP (text, options) {
  const defaultOptions = {}
  let ast = parser.parseCode(text)
  return PhpUnparser(ast, options ? options.phpUnparser || defaultOptions : defaultOptions).trim()
}
