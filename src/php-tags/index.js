const PhpParser = require('php-parser')
let parser = new PhpParser({
  ast: {
    withPositions: true
  }
})

module.exports = {
  collapsePHP: function collapsePHP (html) {
    try {
      // Separate the PHP from the HTML
      let tokens = parser.tokenGetAll(html)
      // Normalize bloody tokens
      tokens = tokens.map(t => (typeof t === 'string') ? ['T_CHAR', t] : t)
      for (let n in tokens) {
        if (tokens[n][0] === 'T_INLINE_HTML') {
          console.log(tokens.slice(n - 1, n + 1))
        }
      }
      let sections = tokens.map(t => (t[0] === 'T_INLINE_HTML') ? {type: 'html', text: t[1]} : {type: 'php', text: t[1]})
      let first = sections.shift()
      sections = sections.reduce((A, b) => {
        let prev = A[A.length - 1]
        if (prev.type === b.type) {
          prev.text += b.text
        } else {
          A.push(b)
        }
        return A
      }, [first])
      let offset = 0
      sections = sections.map(n => {
        n.offset = offset
        offset += n.text.length
        return n
      })
      console.log(offset, ' == ', html.length)
      let result = ''
      let map = new Map()
      for (let section of sections) {
        if (section.type === 'html') {
          result += section.text
        } else if (section.type === 'php') {
          result += `/*PHP_NODE_${section.offset}_NODE_PHP*/`
          map.set(section.offset, section.text)
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
