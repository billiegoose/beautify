'use strict'
// This is actually a little different from inline elements.
// E.g. I want 'title' in. I want 'script' out. I want 'br' out. etc
module.exports = [
  // <head> elements
  'title',
  'base',
  'link',
  'meta',
  // inline <body> elements
  'a',
  'abbr',
  'acronym',
  'b',
  'bdo',
  'big',
  'br',
  'button',
  'cite',
  'code',
  'dfn',
  'em',
  'i',
  'img',
  'input',
  'kbd',
  'label',
  'map',
  'object',
  'q',
  'samp',
  'script',
  'select',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'textarea',
  'time',
  'tt',
  'var'
]
