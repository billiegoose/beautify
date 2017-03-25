// This is just my personal preference that I've developed over the years.
// In general, I've attempted to group attributes into four groups:
// - those having to do with the identity of the element
// - those related to the value of the element
// - those that modify the behavior of the element, and lastly
// - those that affect the appearance of the element
module.exports = [
  // Self-identifiers
  'alt',
  'id',
  'name',
  'title',
  'type',
  // Other-identifies
  'for',
  'form',
  'contextmenu',
  'rel',
  'target',
  // Values
  'checked',
  'data-',
  'href',
  'src',
  'srcdoc',
  'srcset',
  'value',
  'width',
  'height',
  'language',
  'action',
  'method',
  // Value modifiers / restrictors
  'min',
  'max',
  'maxlength',
  'low',
  'hight',
  'pattern',
  // Value modifiers (boolean)
  'default',
  'disabled',
  'enabled',
  'readonly',
  'required',
  'multiple',
  'novalidate',
  'selected',
  // Behavior modifiers
  'charset',
  'onload',
  'onclick',
  'onerror',
  'accesskey',
  // Behavior modifiers (boolean)
  'async',
  'autoplay',
  'autofocus',
  'buffered',
  'contenteditable',
  'defer',
  'download',
  'loop',
  'muted',
  'preload',
  'role',
  'wrap',
  // Presentation
  'border',
  'class',
  'dir',
  'placeholder',
  'poster',
  'style',
  'tabindex',
  // Presentation (boolean)
  'hidden',
  'compact',
  'controls',
  'allowfullscreen',
  'open'
]
