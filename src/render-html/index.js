// @flow
'use strict'
import assert from 'assert'
// TODO
import AST from './ast'
import renderAttributes from './render-attributes'
import groupInline from './group-inline-nodes'
import collapseWhitespace from './collapse-whitespace'

/*::
// This is what posthtml gives us to work with.
import {PostHTMLTree, PostHTMLNode, PostHTMLText} from './ast'

// This is what we transform it into.
import {tree, node} from './ast'
*/

function indentBlock (text, {depth, indentString}) {
  assert(typeof depth === 'number')
  assert(typeof indentString === 'string')
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
  assert(opts)
  return '<' + [node.tag, ...renderAttributes(node, opts)].join(' ') + '>'
}

// accepts a normalized node
function renderCloseTag (node/*: node */, opts) /*: string */{
  assert(opts)
  return '</' + node.tag + '>'
}

function renderVoidTag (node/*: node */, opts) /*: string */{
  assert(opts)
  // TODO: add option for XML tag endings
  return '<' + [node.tag, ...renderAttributes(node, opts)].join(' ') + '>'
}

function renderTextNode (node/*: node */, opts) /*: string */{
  assert(opts)
  assert(node.content.length === 1)
  let result = node.content[0]
  if (node.meta.isBlock) result += '\n'
  return result
}

function renderLine (node/*: node */, opts) /*: string */{
  assert(opts)
  if (node.meta.isVoid) return renderVoidTag(node, opts)
  return renderOpenTag(node, opts) + renderTree(node.content, opts) + renderCloseTag(node, opts)
}

function renderBlock (node/*: node */, opts) /*: string */{
  assert(opts)
  if (node.meta.isVoid) {
    return renderVoidTag(node, opts) + '\n'
  }
  let newopts = Object.assign({}, opts)
  newopts.depth += 1
  let text = renderTree(node.content, opts)
  if (text.includes('\n')) {
    return renderOpenTag(node, opts) + '\n' + indentBlock(text.trim() + '\n', newopts) + renderCloseTag(node, opts) + '\n'
  } else {
    return renderOpenTag(node, opts) + text.trim() + renderCloseTag(node, opts) + '\n'
  }
}

function renderGroup (node/*: node */, opts) /*: string */{
  assert(opts)
  return node.content.map(node => renderNode(node, opts)).join('') + '\n'
}

function renderNode (node/*: node */, opts) /*: string */{
  assert(opts)
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
    return renderBlock(node, opts)
  }
}

function renderTree (tree/*: tree */, opts) /*: tree */{
  assert(opts)
  return tree.map(node => renderNode(node, opts)).join('')
}

// TODO: Should this have an async option?
export default function render (thing/*: PostHTMLTree|PostHTMLNode|PostHTMLText */, opts = {}) /*: string */ {
  assert(opts)
  opts.indentString = opts.indentString || '  '
  opts.depth = opts.depth || 0
  console.log('\n\n')
  console.log('------ parse(thing) --------')
  console.log(JSON.stringify(thing, null, 2))
  // Recursively normalize the shit out of this thing.
  console.log('------ AST.norm(thing) --------')
  thing = AST.norm(thing)
  console.log(JSON.stringify(thing, null, 2))
  console.log('------ groupInline(thing) --------')
  thing = groupInline(thing)
  console.log(JSON.stringify(thing, null, 2))
  console.log('------ collapseWhitespace(thing) --------')
  thing = collapseWhitespace(thing)
  console.log(JSON.stringify(thing, null, 2))
  if (Array.isArray(thing)) {
    return renderTree(thing, opts)
  }
  return renderNode(thing, opts)
}
