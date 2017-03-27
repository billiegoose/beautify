'use strict'
/**
 * # API
 * @author Ivan Voischev (@voischev),
 *         Anton Winogradov (@awinogradov),
 *         Alexej Yaroshevich (@zxqfox),
 *         Vasiliy (@Yeti-or)
 * @module API
 * @namespace tree
 */
module.exports = {
  /**
   * Extends the PostHTMLTree with the Tree API
   *
   * @private
   *
   * @param   {Array} tree - PostHTMLTree
   * @returns {Array} tree - PostHTMLTree with API
   */
  apiExtend: function (tree) {
    tree.awalk = module.exports.walk
    tree.amatch = module.exports.match
  },
  /**
   * walk the tree and pass all nodes to callback
   *
   * @memberof tree
   * @param  {async Function} cb - Callback
   * @return {async Function}    - Node in callback
   *
   ***Usage**
   * ```js
   * export const walk = (tree) => {
   *   tree.walk((node) => {
   *     let classes = node.attrs && node.attrs.class.split(' ') || []
   *
   *     if (classes.includes(className)) return cb(node)
   *       return node
   *   })
   * }
   * ```
   */
  walk: async function (cb) {
    return traverse(this, cb)
  },
  /**
   * match expression to search nodes in the tree
   *
   * @memberof tree
   * @param  {String|RegExp|Object|Array} expression - Matcher(s) to search
   * @param  {async Function} cb - Callback
   * @return {async Function}    - Node in callback
   *
   ***Usage**
   * ```js
   * export const match = (tree) => {
   *   // Single matcher
   *   tree.match({ tag: 'custom-tag' }, (node) => {
   *     let tag = node.tag
   *
   *     Object.assign(node, { tag: 'div', attrs: {class: tag} })
   *
   *     return node
   *   })
   *   // Multiple matchers
   *   tree.match([{ tag: 'b' }, { tag: 'strong' }], (node) => {
   *     let style = 'font-weight: bold;'
   *
   *     node.tag = 'span'
   *
   *     node.attrs
   *       ? ( node.attrs.style
   *         ? ( node.attrs.style += style )
   *         : node.attrs.style = style
   *       )
   *       : node.attrs = { style: style }
   *
   *     return node
   *   })
   * }
   * ```
   */
  match: async function (expression, cb) {
    return Array.isArray(expression)
      ? await traverse(this, async function (node) {
        for (var i = 0; i < expression.length; i++) {
          if (compare(expression[i], node)) return await cb(node)
        }

        return node
      })
      : await traverse(this, async function (node) {
        if (compare(expression, node)) return await cb(node)

        return node
      })
  }
}

/** @private */
async function traverse (tree, cb) {
  if (Array.isArray(tree)) {
    for (var i = 0; i < tree.length; i++) {
      tree[i] = await traverse(await cb(tree[i]), cb)
    }
  } else if (
      tree &&
      typeof tree === 'object' &&
      tree.hasOwnProperty('content')
  ) await traverse(tree.content, cb)

  return tree
}

/** @private */
function compare (expected, actual) {
  if (expected instanceof RegExp) {
    if (typeof actual === 'object') return false
    if (typeof actual === 'string') return expected.test(actual)
  }

  if (typeof expected !== typeof actual) return false
  if (typeof expected !== 'object' || expected === null) {
    return expected === actual
  }

  if (Array.isArray(expected)) {
    return expected.every(function (exp) {
      return [].some.call(actual, function (act) {
        return compare(exp, act)
      })
    })
  }

  return Object.keys(expected).every(function (key) {
    var ao = actual[key]
    var eo = expected[key]

    if (typeof eo === 'object' && eo !== null && ao !== null) {
      return compare(eo, ao)
    }
    if (typeof eo === 'boolean') {
      return eo !== (ao == null)
    }

    return ao === eo
  })
}
