var fs = require('fs')
const Token = require('./token.js');

module.exports = {
  tokenize: function(string) {
    var tokens = [];
    var index = 0;
    while (index < string.length) {
      var char = string[index];

      while (char == " ") {
        index += 1;
        char = string[index];
      }

      if (this.isLetter(char)) {
        var id_str = char;
        var id_index = index;
        id_index += 1;
        while (this.isLetter(string[id_index])) {
          id_str += string[id_index];
          id_index += 1;
        }
        index = id_index - 1;
        tokens.push({ lexeme: id_str, code: Token.ID });
      }

      else if (this.isNum(char)) {
        var num_str = char;
        var num_index = index;
        num_index += 1;
        while (this.isNum(string[num_index])) {
          num_str += string[num_index];
          num_index += 1;
        }
        index = num_index - 1;
        tokens.push({ lexeme: num_str, code: Token.NUM });
      }

      else if (this.isEqualsSign(char)) {
        if (this.isEqualsSign(string[index + 1])) {
          tokens.push({ lexeme: "==", code: Token.COMPARISON_OP });
          index += 1;
        } else {
          tokens.push({ lexeme: "=", code: Token.ASSIGN_OP });
        }
      }

      else if (this.isAddOperator(char)) {
        tokens.push({ lexeme: char, code: Token.ADD_OP });
      }

      else if (this.isSubtractOperator(char)) {
        tokens.push({ lexeme: char, code: Token.SUB_OP });
      }

      else if (this.isMultiplyOperator(char)) {
        tokens.push({ lexeme: char, code: Token.MULT_OP });
      }

      else if (this.isDivideOperator(char)) {
        tokens.push({ lexeme: char, code: Token.DIV_OP });
      }

      else if (this.isLeftParen(char)) {
        tokens.push({ lexeme: char, code: Token.LEFT_PAREN });
      }

      else if (this.isRightParen(char)) {
        tokens.push({ lexeme: char, code: Token.RIGHT_PAREN });
      }

      index += 1;
    }

    tokens.push({ lexeme: 'EOF', code: Token.EOF});
    return tokens;
  },

  isLetter: function(char) {
    return /[a-zA-z]/.test(char);
  },

  isNum: function(char) {
    return /[0-9]/.test(char);
  },

  isEqualsSign: function(char) {
    return char === "=";
  },

  isAddOperator: function(char) {
    return char === "+";
  },

  isSubtractOperator: function(char) {
    return char === "-";
  },

  isMultiplyOperator: function(char) {
    return char === "*";
  },

  isDivideOperator: function(char) {
    return char === "/";
  },

  isLeftParen: function(char) {
    return char === "(";
  },

  isRightParen: function(char) {
    return char === ")";
  }
}
