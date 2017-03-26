// @flow
'use strict'
import attributeOrder from './preferred-attribute-order'
// Because indexOf returns -1 for "not found" and we want -1 to be placed LAST,
// we reverse the attributeOrder array so that whichever value returned by
// indexOf is higher is prefered.
attributeOrder.reverse() // mutates array
/*::
import type { tree, node } from './ast'
*/

function compareAttributes (a /*: string */, b /*: string */) /*: number */{
  return attributeOrder.indexOf(b) - attributeOrder.indexOf(a)
}

// accepts a normalized node
export default function renderAttributes (node/*: node */, opts) /*: string[] */{
  let keys = Object.keys(node.attrs)
  keys.sort(compareAttributes)
  console.log(keys)
  return keys.map(key => `${key}="${node.attrs[key]}"`)
}
