// @flow
'use strict'

/* ::
// This is what posthtml gives us to work with.
import {PostHTMLTree, PostHTMLNode, PostHTMLText} from './ast'

// This is what we transform it into.
import {tree, node} from './ast'
*/

// TODO: Come back to this when your brain is working better
function isFlowingNode (node/* : node */) /* : node */{
  if (node.meta.isInline) return true
  if (node.meta.isBlock) return false
  return false
}

function wrapInGroup (tree/* : tree */) /* : node */{
  return {
    tag: '',
    attrs: {},
    meta: {
      isGroup: true,
      isBlock: true
    },
    content: tree.slice(0)
  }
}

function groupNode (node /* : node */) /* : node */{
  let copy = Object.assign({}, node)
  if (node.meta.isText) return copy
  copy.content = groupTree(node.content)
  return copy
}

function groupTree (tree/* : tree */) /* : tree */{
  // start at leaves, walk upwards grouping siblings together if they are both inline to form blocks
  let content = []
  let workingGroup = []
  if (tree.length === 1) return [groupNode(tree[0])]
  for (let node of tree) {
    node = groupNode(node)
    if (isFlowingNode(node)) {
      workingGroup.push(node)
    } else {
      if (workingGroup.length > 0) {
        let group = wrapInGroup(workingGroup)
        content.push(group)
        workingGroup = []
      }
      content.push(node)
    }
  }
  if (workingGroup.length > 0) {
    let group = wrapInGroup(workingGroup)
    content.push(group)
  }
  return content
}

export default function groupInline (thing/* : node | tree */, opts) /* : node | tree */ {
  if (Array.isArray(thing)) {
    return groupTree(thing, opts)
  }
  return groupNode(thing, opts)
}
