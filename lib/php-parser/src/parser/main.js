/**
 * Copyright (C) 2014 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */

module.exports = {
  /**
   * <ebnf>
   * start ::= (namespace | top_statement)*
   * </ebnf>
   */
  read_start: function () {
    if (this.token == this.tok.T_NAMESPACE) {
      return this.read_namespace()
    } else {
      return this.read_top_statement()
    }
  }
}
