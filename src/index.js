import posthtml from 'posthtml'
import prettier from 'prettier'
import postcss from 'postcss'
import perfectionist from 'perfectionist'
const api = require('./api-async')
import render from './render-html'
import merge from 'lodash.merge'

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
    let prettierText = prettier.format(text, options.prettier)
    return prettierText
  } catch (err) {
    console.error(err.message)
    return text
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
    stylefmt: {
      indentWidth: 4,
      rules: {
        indentation: 4
      }
    },
    prettier: {
      printWidth: 1000,
      tabWidth: 4
    },
    beautify: {
      indentString: '    ',
      closeVoidTags: true
    }
  },
  html: async function (input, userOptions) {
    let options = {}
    merge(options, Beautify.defaultOptions, userOptions)
    // I can't decide if this is elegant or awful
    options.posthtml.render = options.posthtml.render(options.beautify)
    let result = await posthtml([
      asyncifyTree,
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
  }
}

export default Beautify
