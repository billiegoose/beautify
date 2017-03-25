// @flow
'use strict'
// import blockElements from 'block-elements'
import inlineTags from './inline-tags'
import voidElements from './void-elements'
import whitespacePreservingElements from './whitespace-preserving-elements'
import renderAttributes from './render-attributes'

/*::
export type tree = Array<node | string>

export type node = {
  tag: string,
  attrs: {[id:string]: string},
  content: tree
}
*/

function trimTextNode (text/*: string */, opts) /*: string */{
  // If this is an inline element, we need to keep a space.
  // Otherwise, we can remove all spaces.
  let {inline} = opts
  let startSpace = text.match(/^\s/) ? ' ' : ''
  let endSpace = text.match(/\s$/) ? ' ' : ''
  if (inline) {
    text = startSpace + text.trim() + endSpace
  } else {
    text = text.trim()
  }
  return text
}

function renderContent (node/*: node */, opts) /*: string */{
  // let {inline} = opts
  console.log('node =', node)
  if (whitespacePreservingElements.includes(node.tag)) {
    return node.content.join('')
  } else {
    let content = node.content.map(node => {
      if (typeof node === 'string') {
        return trimTextNode(node, opts)
      }
      return node
    })
    // Remove double spaces
    content = content.reduce((acc, node) => {
      // if the last element was a ' ' and this one is a ' ' skip it.
      if (node === ' ' && acc.length > 0 && acc[acc.length - 1] === ' ') {
      } else {
        acc.push(node)
      }
      return acc
    }, [])
    // Remove empty text nodes
    content = content.filter(x => x !== '')
    return render(content, opts)
  }
}

// accepts a normalized node
function renderOpenTag (node/*: node */, opts) /*: string */{
  return '<' + [node.tag, ...renderAttributes(node, opts)].join(' ') + '>'
}

// accepts a normalized node
function renderCloseTag (node/*: node */, opts) /*: string */{
  return '</' + node.tag + '>'
}

function renderVoidTag (node/*: node */, opts) /*: string */{
  // TODO: add option for XML tag endings
  return '<' + [node.tag, ...renderAttributes(node, opts)].join(' ') + '>'
}

function normalizeAttr (node/*: node */, key) /*: void */{
  if (key !== key.toLowerCase()) {
    node.attrs[key.toLowerCase()] = node.attrs[key]
    delete node.attrs[key]
    key = key.toLowerCase()
  }
  switch (typeof node.attrs[key]) {
    case 'undefined':
      delete node.attrs[key]
      break
    case 'string':
      break
    default:
      node.attrs[key] = String(node.attrs[key])
  }
}

function normalizeNode (node/*: node */) /*: void */{
  node.tag = node.tag.toLowerCase()
  if (!node.attrs) node.attrs = {}
  for (let key in node.attrs) {
    normalizeAttr(node, key) // mutates node
  }
  if (!node.content) node.content = ['']
}

function renderElement (node/*: node */, opts) {
  let {inline} = opts
  normalizeNode(node) // mutates node
  console.log('Tis an Element!')
  console.log(node)
  if (voidElements.includes(node.tag)) {
    return renderVoidTag(node, opts)
  }
  let preserveWhitespace = whitespacePreservingElements.includes(node.tag)
  console.log('preserveWhitespace =', preserveWhitespace)
  inline = inline || inlineTags.includes(node.tag)
  console.log('inline =', inline)
  let content = renderContent(node, {preserveWhitespace, inline, ...opts})
  console.log('content =', content)
  if (inline) {
    return renderOpenTag(node, opts) + content + renderCloseTag(node, opts)
  } else {
    return renderOpenTag(node, opts) + '\n' + content + renderCloseTag(node, opts) + '\n'
  }
}

// TODO: Should this have an async option?
export default function render (tree/*: tree|node|string */, opts = {}) /*: string */ {
  let {inline} = opts
  console.log('render got called')
  // let {depth = 0} = opts
  // opts.depth++
  // tree can either be a string, and object, or an array of nodes.
  switch (typeof tree) {
    case 'string':
      console.log('Tis a string!')
      console.log(tree)
      return tree
    case 'object':
      if (Array.isArray(tree)) {
        console.log('Tis an Array!')
        let results = tree.map(el => render(el, opts))
        return (inline) ? results.join('') : results.join('\n')
      } else {
        console.log('Tis an Object!')
        console.log(tree)
        return renderElement(tree, opts)
      }
    default:
      throw new Error("I really wasn't expecting that.")
  }
}
