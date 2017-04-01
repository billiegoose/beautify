/**
 * Copyright (C) 2014 Glayzzle (BSD3 License)
 * @authors https://github.com/glayzzle/php-parser/graphs/contributors
 * @url http://glayzzle.com
 */
module.exports = {
  T_STRING: function () {
    var token = this.yytext.toLowerCase()
    var id = this.keywords[token]
    if (!id) {
      if (token === 'yield') {
        if (this.tryMatch(' from')) {
          this.consume(5)
          id = this.tok.T_YIELD_FROM
        } else {
          id = this.tok.T_YIELD
        }
      } else {
        id = this.tok.T_STRING
        if (token === 'b' || token === 'B') {
          var ch = this.input(1)
          if (ch === '"') {
            return this.ST_DOUBLE_QUOTES()
          } else if (ch === '\'') {
            return this.T_CONSTANT_ENCAPSED_STRING()
          } else {
            this.unput(1)
          }
        }
      }
    }
    return id
  },
  // reads a custom token
  consume_TOKEN: function () {
    var ch = this._input[this.offset - 1]
    var fn = this.tokenTerminals[ch]
    if (fn) {
      return fn.apply(this, [])
    } else {
      return this.yytext
    }
  },
  // list of special char tokens
  tokenTerminals: {
    '$': function () {
      this.offset++
      if (this.is_LABEL_START()) {
        this.offset--
        this.consume_LABEL()
        return this.tok.T_VARIABLE
      } else {
        this.offset--
        return '$'
      }
    },
    '-': function () {
      var nchar = this._input[this.offset]
      if (nchar === '>') {
        this.begin('ST_LOOKING_FOR_PROPERTY').input()
        return this.tok.T_OBJECT_OPERATOR
      } else if (nchar === '-') {
        this.input()
        return this.tok.T_DEC
      } else if (nchar === '=') {
        this.input()
        return this.tok.T_MINUS_EQUAL
      }
      return '-'
    },
    '\\': function () {
      return this.tok.T_NS_SEPARATOR
    },
    '/': function () {
      if (this._input[this.offset] === '=') {
        this.input()
        return this.tok.T_DIV_EQUAL
      }
      return '/'
    },
    ':': function () {
      if (this._input[this.offset] === ':') {
        this.input()
        return this.tok.T_DOUBLE_COLON
      } else {
        return ':'
      }
    },
    '(': function () {
      var initial = this.offset
      this.input()
      if (this.is_TABSPACE()) {
        this.consume_TABSPACE().input()
      }
      if (this.is_LABEL_START()) {
        var yylen = this.yytext.length
        this.consume_LABEL()
        var castToken = this.yytext.substring(yylen - 1).toLowerCase()
        var castId = this.castKeywords[castToken]
        if (castId) {
          this.input()
          if (this.is_TABSPACE()) {
            this.consume_TABSPACE().input()
          }
          if (this._input[this.offset - 1] === ')') {
            return castId
          }
        }
      }
      // revert the check
      this.unput(this.offset - initial)
      return '('
    },
    '=': function () {
      var nchar = this._input[this.offset]
      if (nchar === '>') {
        this.input()
        return this.tok.T_DOUBLE_ARROW
      } else if (nchar === '=') {
        if (this._input[this.offset + 1] === '=') {
          this.consume(2)
          return this.tok.T_IS_IDENTICAL
        } else {
          this.input()
          return this.tok.T_IS_EQUAL
        }
      }
      return '='
    },
    '+': function () {
      var nchar = this._input[this.offset]
      if (nchar === '+') {
        this.input()
        return this.tok.T_INC
      } else if (nchar === '=') {
        this.input()
        return this.tok.T_PLUS_EQUAL
      }
      return '+'
    },
    '!': function () {
      if (this._input[this.offset] === '=') {
        if (this._input[this.offset + 1] === '=') {
          this.consume(2)
          return this.tok.T_IS_NOT_IDENTICAL
        } else {
          this.input()
          return this.tok.T_IS_NOT_EQUAL
        }
      }
      return '!'
    },
    '?': function () {
      if (this._input[this.offset] === '?') {
        this.input()
        return this.tok.T_COALESCE
      }
      return '?'
    },
    '<': function () {
      var nchar = this._input[this.offset]
      if (nchar === '<') {
        nchar = this._input[this.offset + 1]
        if (nchar === '=') {
          this.consume(2)
          return this.tok.T_SL_EQUAL
        } else if (nchar === '<') {
          if (this.is_HEREDOC()) {
            return this.tok.T_START_HEREDOC
          }
        }
        this.input()
        return this.tok.T_SL
      } else if (nchar === '=') {
        this.input()
        if (this._input[this.offset] === '>') {
          this.input()
          return this.tok.T_SPACESHIP
        } else {
          return this.tok.T_IS_SMALLER_OR_EQUAL
        }
      } else if (nchar === '>') {
        this.input()
        return this.tok.T_IS_NOT_EQUAL
      }
      return '<'
    },
    '>': function () {
      var nchar = this._input[this.offset]
      if (nchar === '=') {
        this.input()
        return this.tok.T_IS_GREATER_OR_EQUAL
      } else if (nchar === '>') {
        nchar = this._input[this.offset + 1]
        if (nchar === '=') {
          this.consume(2)
          return this.tok.T_SR_EQUAL
        } else {
          this.input()
          return this.tok.T_SR
        }
      }
      return '>'
    },
    '*': function () {
      var nchar = this._input[this.offset]
      if (nchar === '=') {
        this.input()
        return this.tok.T_MUL_EQUAL
      } else if (nchar === '*') {
        this.input()
        if (this._input[this.offset] === '=') {
          this.input()
          return this.tok.T_POW_EQUAL
        } else {
          return this.tok.T_POW
        }
      }
      return '*'
    },
    '.': function () {
      var nchar = this._input[this.offset]
      if (nchar === '=') {
        this.input()
        return this.tok.T_CONCAT_EQUAL
      } else if (nchar === '.' && this._input[this.offset + 1] === '.') {
        this.consume(2)
        return this.tok.T_ELLIPSIS
      }
      return '.'
    },
    '%': function () {
      if (this._input[this.offset] === '=') {
        this.input()
        return this.tok.T_MOD_EQUAL
      }
      return '%'
    },
    '&': function () {
      var nchar = this._input[this.offset]
      if (nchar === '=') {
        this.input()
        return this.tok.T_AND_EQUAL
      } else if (nchar === '&') {
        this.input()
        return this.tok.T_BOOLEAN_AND
      }
      return '&'
    },
    '|': function () {
      var nchar = this._input[this.offset]
      if (nchar === '=') {
        this.input()
        return this.tok.T_OR_EQUAL
      } else if (nchar === '|') {
        this.input()
        return this.tok.T_BOOLEAN_OR
      }
      return '|'
    },
    '^': function () {
      if (this._input[this.offset] === '=') {
        this.input()
        return this.tok.T_XOR_EQUAL
      }
      return '^'
    }
  }
}
