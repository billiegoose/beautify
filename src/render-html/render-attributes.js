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

function renderAttribute (key, value) /*: string */{
  if (key === 'class') value = value.trim().replace(/\s\s+/g, ' ')
  if (value === '') {
    // Discard attribute if we're certain it is not a boolean attribute.
    if (['id', 'class', 'style'].includes(key)) return ''
    return key
  }
  return `${key}="${value}"`
}

function compareAttributes (a /*: string */, b /*: string */) /*: number */{
  if (a === 'style' && b !== 'style') return 1
  if (b === 'style' && a !== 'style') return -1
  let result = attributeOrder.indexOf(b) - attributeOrder.indexOf(a)
  if (result !== 0) return result
  if (a.startsWith('data-') && b.startsWith('data-')) {
    result = attributeOrder.indexOf(b.slice(5)) - attributeOrder.indexOf(a.slice(5))
  }
  if (result !== 0) return result
  return a.localeCompare(b, {numeric: true, ignorePunctuation: true})
}

// accepts a normalized node
export default function renderAttributes (node/*: node */, opts) /*: string[] */{
  let keys = Object.keys(node.attrs)
  keys.sort(compareAttributes)
  return keys.map(key => renderAttribute(key, node.attrs[key])).filter(text => text !== '').join(' ')
}
