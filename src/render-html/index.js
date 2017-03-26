// @flow
'use strict'
import assert from 'assert'
// TODO
// import whitespacePreservingElements from './whitespace-preserving-elements'
import AST from './ast'
import renderAttributes from './render-attributes'

/*::
// This is what posthtml gives us to work with.
import {PostHTMLTree, PostHTMLNode, PostHTMLText} from './ast'

// This is what we transform it into.
import {tree, node} from './ast'
*/

function indentBlock (text, {depth, indentString}) {
  console.log('depth, indentString =', depth, indentString)
  let indent = indentString.repeat(depth)
  let finalNewline = text.endsWith('\n')
  // if the block ends with a newline, remove it
  if (finalNewline) {
    text = text.slice(0, text.length - 1)
  }
  // Indent the lines
  let indentedtext = text.replace(/^/mg, indent)
  // if the block ended with a newline put the newline back
  if (finalNewline) {
    indentedtext += '\n'
  }
  return indentedtext
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

function renderTextNode (node/*: node */, opts) /*: string */{
  assert(node.content.length === 1)
  return node.content[0]
}

function renderLine (node/*: node */, opts) /*: string */{
  return renderOpenTag(node, opts) + renderTree(node.content) + renderCloseTag(node, opts)
}

function renderBlock (node/*: node */, opts) /*: string */{
  if (node.meta.isVoid) {
    return renderVoidTag(node, opts) + '\n'
  }
  console.log('opts =', opts)
  let newopts = Object.assign({}, opts)
  newopts.depth += 1
  let text = renderTree(node.content, opts)
  if (text.includes('\n')) {
    console.log('very important tag = ', node.tag)
    return renderOpenTag(node, opts) + '\n' + indentBlock(text, newopts) + renderCloseTag(node, opts) + '\n'
  } else {
    console.log('text =', text)
    return renderOpenTag(node, opts) + text + renderCloseTag(node, opts) + '\n'
  }
}

function renderGroup (node/*: node */, opts) /*: string */{
  return node.content.map(node => renderNode(node, opts)).join('')
}

function renderNode (node/*: node */, opts) /*: string */{
  console.log('node.tag =', node.tag)
  // Text nodes render as themselves for the most part.
  if (node.meta.isText) return renderTextNode(node, opts)
  // Handle group of inline elements
  if (node.meta.isGroup) {
    return renderGroup(node, opts)
  }
  // Inline elements have to render inline for whitespace reasons.
  if (node.meta.isInline) {
    return renderLine(node, opts)
  } else {
    console.log(node.tag)
    return renderBlock(node, opts)
  }
}

function renderTree (tree/*: tree */, opts) /*: tree */{
  return tree.map(node => renderNode(node, opts)).join('')
}

// TODO: Come back to this when your brain is working better
function isFlowingNode (node/*: node */) /*: node */{
  if (node.meta.isText) return true
  if (node.meta.isInline) return true
  if (node.meta.isBlock) return false
  return false
}

function segmentGroup (tree/*: tree */) /*: node */{
  return {
    tag: '',
    attrs: {},
    content: tree.slice(0),
    meta: {
      isGroup: true
    }
  }
}

function segmentNode (node /*: node */) /*: node */{
  let copy = Object.assign({}, node)
  if (node.meta.isText) return copy
  copy.content = segmentTree(node.content)
  return copy
}

function segmentTree (tree/*: tree */) /*: tree */{
  // start at leaves, walk upwards grouping siblings together if they are both inline to form blocks
  let content = []
  let workingGroup = []
  for (let node of tree) {
    node = segmentNode(node)
    if (isFlowingNode(node)) {
      workingGroup.push(node)
    } else {
      if (workingGroup.length > 0) {
        let group = segmentGroup(workingGroup)
        content.push(group)
        workingGroup = []
      }
      content.push(node)
    }
  }
  if (workingGroup.length > 0) {
    let group = segmentGroup(workingGroup)
    content.push(group)
  }
  return content
}

function segment (thing/*: node | tree */, opts) /*: node | tree */ {
  if (Array.isArray(thing)) {
    return segmentTree(thing, opts)
  }
  return segmentNode(thing, opts)
}

// TODO: Should this have an async option?
export default function render (thing/*: PostHTMLTree|PostHTMLNode|PostHTMLText */, opts = {}) /*: string */ {
  opts.indentString = opts.indentString || '  '
  opts.depth = opts.depth || 0
  // Recursively normalize the shit out of this thing.
  thing = AST.norm(thing)
  console.log('------ AST.norm(thing) --------')
  console.log(JSON.stringify(thing, null, 2))
  thing = segment(thing)
  console.log('------ segment(thing) --------')
  console.log(JSON.stringify(thing, null, 2))
  console.log('render got called')
  if (Array.isArray(thing)) {
    return renderTree(thing, opts)
  }
  return renderNode(thing, opts)
}
