import posthtml from 'posthtml'
import prettier from 'prettier'
import standard from 'standard'
import postcss from 'postcss'
import stylefmt from 'stylefmt'
const api = require('./api-async')
import render from './render-html'

const options = {
  posthtml: {
    render: render
  },
  standard: {
    fix: true
  },
  prettier: {
  },
  render: {
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

async function beautifyStyle (text) {
  try {
    let result = await postcss([stylefmt]).process(text, options.postcss)
    return result.css
  } catch (err) {
    console.error(err.message)
    return text
  }
}

async function beautifyScript (text) {
  try {
    let prettierText = prettier.format(text, options.prettier)
    let standardText = await new Promise(function (resolve, reject) {
      standard.lintText(prettierText, options.standard, (err, results) => {
        if (err) reject(err)
        resolve(results.results[0].output)
      })
    })
    return standardText
  } catch (err) {
    console.error(err.message)
    return text
  }
}

async function scriptTags (tree) {
  return tree.amatch([
    { tag: 'script', attrs: {src: false, type: 'text/javascript'} }, // Only match JavaScript script tags
    { tag: 'script', attrs: {src: false, type: false} },             // or script tags with no type attribute
    { tag: 'script', attrs: false }                                  // or script tags with no attributes
  ], async node => {
    let origContent = node.content.join('')
    let newContent = await beautifyScript(origContent)
    // console.log('===========================')
    // console.log(origContent)
    // console.log('---------------------------')
    // console.log(newContent)
    node.content = ['\n' + newContent]
    return node
  })
}

async function styleTags (tree) {
  return tree.amatch([
    { tag: 'style', attrs: {type: 'text/css'} }, // Only match CSS style tags
    { tag: 'style', attrs: {type: false} },      // or style tags with no type attribute
    { tag: 'style', attrs: false }               // or style tags with no attributes
  ], async node => {
    let origContent = node.content.join('')
    let newContent = await beautifyStyle(origContent)
    // console.log('===========================')
    // console.log(origContent)
    // console.log('---------------------------')
    // console.log(newContent)
    node.content = ['\n' + newContent]
    return node
  })
}

async function styleAttributes (tree) {
  return tree.amatch([
    { attrs: {style: true} } // Anything with a style attribute
  ], async node => {
    let origStyle = node.attrs.style
    let newStyle = beautifyStyleAttribute(origStyle)
    node.attrs.style = newStyle
    return node
  })
}

function asyncifyTree (tree) {
  return api.apiExtend(tree)
}

export default async function Process (input) {
  let result = await posthtml([asyncifyTree, scriptTags, styleTags, styleAttributes]).process(input, options.posthtml)
  return result.html
}
