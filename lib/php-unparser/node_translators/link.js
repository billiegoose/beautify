/* jslint node: true, indent: 2 */
'use strict'

module.exports = function (node, indent) {
  var codegen = this.process.bind(this)
  return codegen(node[1], indent) + this.ws + '=&' + this.ws + codegen(node[2], indent)
}
