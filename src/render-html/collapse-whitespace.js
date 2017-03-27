// @flow
'use strict'
// NOTE: safe whitespace normalization in HTML is only possible if the active CSS stylesheets
// and the whitespace property is taken into account.
// This procedure therefore must be elective via a CLI flag to enable or disable.

/*::
import {tree, node} from './ast'
*/

function trimFrontText (text, opts) {
  return text.replace(/^ /, '')
}

function trimFrontNode (node/*: node */, opts) {
  if (node.meta.isText) {
    let text = trimFrontText(node.content[0], opts)
    node.content[0] = text
    delete node.meta.startsWithSpace
    return
  }
  if (node.content.length > 0) trimFrontNode(node.content[0], opts)
}

function trimBackText (text, opts) {
  return text.replace(/ $/, '')
}

function trimBackNode (node/*: node */, opts) {
  if (node.meta.isText) {
    let text = trimBackText(node.content[0], opts)
    node.content[0] = text
    delete node.meta.endsWithSpace
    return
  }
  if (node.content.length > 0) trimBackNode(node.content[node.content.length - 1], opts)
}

function collapseWhitespaceText (text, opts) {
  if (opts.whitespace === 'preserve') return text
  text = text.replace(/[ \t\n\r]+/gm, ' ')
  return text
}

function collapseWhitespaceNode (node/*: node */, opts) /*: node */ {
  let preserveWhitespace
  if (typeof opts.preserveWhitespace === 'boolean') {
    preserveWhitespace = opts.preserveWhitespace
  } else if (typeof opts.preserveWhitespace === 'function') {
    preserveWhitespace = opts.preserveWhitespace(node, opts)
  } else {
    preserveWhitespace = node.tag === 'pre'
  }
  if (preserveWhitespace) return
  if (node.meta.isText) {
    let text = collapseWhitespaceText(node.content[0], opts)
    node.content[0] = text
    if (/^[ \t\n\r]/.test(text)) node.meta.startsWithSpace = true
    if (/[ \t\n\r]$/.test(text)) node.meta.endsWithSpace = true
    return
  }
  if (node.content.length > 0) {
    node.content = collapseWhitespaceTree(node.content, opts)
    if (node.meta.isBlock) {
      // Remobe space from front and rear of blocks
      trimFrontNode(node.content[0])
      trimBackNode(node.content[node.content.length - 1])
    } else {
      // bubble up startsWithSpace and endsWithSpace
      if (node.content[0].meta.startsWithSpace) node.meta.startsWithSpace = true
      if (node.content[node.content.length - 1].meta.endsWithSpace) node.meta.endsWithSpace = true
    }
  }
  return node
}

function collapseWhitespaceTree (tree/*: tree */, opts)/*: tree */ {
  if (tree.length === 0) return tree
  // Collapse whitespace within nodes
  for (let node of tree) {
    collapseWhitespaceNode(node, opts)
  }
  // Collapse redundant whitespace between adjacent nodes
  for (let i = 1; i < tree.length; i++) {
    if (tree[i - 1].meta.endsWithSpace && tree[i].meta.startsWithSpace) {
      trimFrontNode(tree[i], opts)
    }
  }
  return tree
}

export default function collapseWhitespace (thing/*: node | tree */, opts = {}) /*: node | tree */ {
  if (Array.isArray(thing)) {
    return collapseWhitespaceTree(thing, opts)
  }
  return collapseWhitespaceNode(thing, opts)
}
