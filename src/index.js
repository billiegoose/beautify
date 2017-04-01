import posthtml from 'posthtml'
import prettier from 'prettier'
import postcss from 'postcss'
import perfectionist from 'perfectionist'
const api = require('./api-async')
import render from './render-html'
import merge from 'lodash.merge'
import phpTags from './php-tags'
import renderPHP from './render-php'

function beautifyPHP (text) {
  try {
    return renderPHP(text)
  } catch (err) {
    console.log(text)
    console.log('ERROR')
    console.log(err)
    return text
  }
}

function beautifyStyleAttribute (text) {
  try {
    return postcss.parse(text).nodes.map(node => `${node.prop.trim()}: ${node.value.trim()};`).join(' ')
  } catch (err) {
    console.error(err.message)
    return text
  }
}

async function beautifyStyle (text, options) {
  try {
    let result = await postcss([perfectionist]).process(text, options.perfectionist)
    return result.css
  } catch (err) {
    console.error(err.message)
    return text
  }
}

async function beautifyScript (text, options) {
  try {
    // Unindent so comments don't grow.
    text = text.split('\n').map(line => line.replace(/^\s+/, '')).join('\n')
    let prettierText = prettier.format(text, options.prettier)
    return prettierText
  } catch (err) {
    console.error(err.message)
    return text
  }
}

function templateTags (options) {
  return async function templateTags (tree) {
    return tree.amatch([
      { tag: 'template' },                                         // actual template tags
      { tag: 'script', attrs: {src: false, type: /template$/} }  // template-in-script tags
    ], async node => {
      let origContent = node.content.map(t => t.replace(/\s\s+$/m, ' ')).join('')
      // TODO: Figure out why it crashes if we pass in options.
      let newContent = await Beautify.html(origContent)
      node.content = ['\n' + newContent]
      return node
    })
  }
}

function scriptTags (options) {
  return async function scriptTags (tree) {
    return tree.amatch([
      { tag: 'script', attrs: {src: false, type: 'text/javascript'} }, // Only match JavaScript script tags
      { tag: 'script', attrs: {src: false, type: false} },             // or script tags with no type attribute
      { tag: 'script', attrs: false }                                  // or script tags with no attributes
    ], async node => {
      let origContent = node.content.join('')
      let newContent = await beautifyScript(origContent, options)
      // console.log('===========================')
      // console.log(origContent)
      // console.log('---------------------------')
      // console.log(newContent)
      node.content = ['\n' + newContent]
      return node
    })
  }
}

function styleTags (options) {
  return async function styleTags (tree) {
    return tree.amatch([
      { tag: 'style', attrs: {type: 'text/css'} }, // Only match CSS style tags
      { tag: 'style', attrs: {type: false} },      // or style tags with no type attribute
      { tag: 'style', attrs: false }               // or style tags with no attributes
    ], async node => {
      let origContent = node.content.join('')
      let newContent = await beautifyStyle(origContent, options)
      // console.log('===========================')
      // console.log(origContent)
      // console.log('---------------------------')
      // console.log(newContent)
      node.content = ['\n' + newContent]
      return node
    })
  }
}

function styleAttributes (options) {
  return async function styleAttributes (tree) {
    return tree.amatch([
      { attrs: {style: true} } // Anything with a style attribute
    ], async node => {
      let origStyle = node.attrs.style
      let newStyle = beautifyStyleAttribute(origStyle, options)
      node.attrs.style = newStyle
      return node
    })
  }
}

function asyncifyTree (tree) {
  return api.apiExtend(tree)
}

const Beautify = {
  defaultOptions: {
    posthtml: {
      render: render
    },
    perfectionist: {
      indentSize: 4
    },
    prettier: {
      printWidth: 1000,
      tabWidth: 4,
      singleQuote: true
    },
    render: {
      indentString: '    ',
      closeVoidTags: true
    }
  },
  html: async function (input, userOptions) {
    let options = {}
    merge(options, Beautify.defaultOptions, userOptions)
    // I can't decide if this is elegant or awful
    options.posthtml.render = options.posthtml.render(options.render)
    let result = await posthtml([
      asyncifyTree,
      templateTags(options),
      scriptTags(options),
      styleTags(options),
      styleAttributes(options)
    ]).process(input, options.posthtml)
    return result.html
  },
  style: async function (input, userOptions) {
    let options = {}
    merge(options, Beautify.defaultOptions, userOptions)
    return beautifyStyle(input, options)
  },
  script: async function (input, userOptions) {
    let options = {}
    merge(options, Beautify.defaultOptions, userOptions)
    return beautifyScript(input, options)
  },
  php: async function (input, userOptions) {
    let options = {}
    merge(options, Beautify.defaultOptions, userOptions)
    let {html, phpNodes} = phpTags.collapsePHP(input)
    html = await Beautify.html(html, userOptions)
    for (let [key, value] of phpNodes) {
      phpNodes.set(key, beautifyPHP(value))
    }
    return phpTags.expandPHP({html, phpNodes})
  }
}

export default Beautify
