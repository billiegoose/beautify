const _ = require('lodash')
const PhpParser = require('php-parser')
let parser = new PhpParser({
  ast: {
    withPositions: true
  },
  parser: {
    extractDoc: true
  }
})

module.exports = {
  collapsePHP: function collapsePHP (html) {
    try {
      // Locate PHP tags in HTML. Which we ironically do by locating the 'inlineHTML' nodes in the PHP AST
      let program = parser.parseCode(html)
      // Reduce the parse tree down to just the start and end of the HTML nodes
      let nodes = program.children.filter(node => node.kind === 'inline').map(node => node.loc)
      let htmlsections = nodes.map(loc => [loc.start.offset, loc.end.offset])
      let [htmlStarts = [], htmlEnds = []] = _.unzip(htmlsections)
      // The PHP starts where the HTML ends, and vice versa
      let phpStarts = htmlEnds.slice(0)
      let phpEnds = htmlStarts.slice(0)
      // except for the (literal) edge cases
      phpStarts.unshift(0)
      phpEnds.push(html.length)
      // which we filter out if unnecessary
      let phpsections = _.zip(phpStarts, phpEnds).filter(a => a[0] !== a[1])
      // Now the fun bit - stiching all the sections back together
      htmlsections = htmlsections.map(x => ({t: 'html', start: x[0], end: x[1]}))
      phpsections = phpsections.map(x => ({t: 'php', start: x[0], end: x[1]}))
      let allsections = [].concat(htmlsections).concat(phpsections)
      allsections.sort((a, b) => a.start - b.start)

      let result = ''
      let map = new Map()
      for (let section of allsections) {
        if (section.t === 'html') {
          result += html.slice(section.start, section.end)
        } else if (section.t === 'php') {
          result += `/*PHP_NODE_${section.start}_NODE_PHP*/`
          map.set(section.start, html.slice(section.start, section.end))
        }
      }
      return {
        html: result,
        phpNodes: map
      }
    } catch (err) {
      console.error(err)
      return {
        html,
        phpNodes: new Map()
      }
    }
  },
  expandPHP: function expandPHP ({html, phpNodes}) {
    // expand source code
    for (let [key, value] of phpNodes) {
      html = html.replace(`/*PHP_NODE_${key}_NODE_PHP*/`, value)
    }
    return html
  }
}
