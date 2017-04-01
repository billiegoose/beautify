/* jslint node: true, indent: 2 */
'use strict'
var noSemiColons = [
  'class', 'namespace', 'try', 'if', 'switch',
  'for', 'foreach', 'function', 'while', 'doc', 'comment'
]
module.exports = function (codegen, currentIndent, indent, nl, body, isProgram) {
  var str, indentation

  indentation = isProgram ? '' : currentIndent + indent
  str = body.map(function (expr) {
    if (expr === null) {
      return ''
    }
    var line = indentation + codegen(expr, indentation, { notClosure: true })

    // This expressions don't require semicolons
    if (noSemiColons.indexOf(expr[0]) === -1) {
      line += ';'
    }

    return line + nl
  }).join('')

  return str
}
