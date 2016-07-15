var fs = require('fs')
const Logger = require('./logger.js');
const Token = require('./token.js');

const CHAR_TO_TOKEN = new Map([
  ['+', Token.ADD_OP],
  ['-', Token.SUB_OP],
  ['*', Token.MULT_OP],
  ['/', Token.DIV_OP],
  ['(', Token.LEFT_PAREN],
  [')', Token.RIGHT_PAREN]
]);

module.exports = {
  tokenize: function(string) {
    var tokens = [];

    var index = 0;
    var chars = string.split("");
    var currentChar = chars[index];

    return (function (_this) {
      function nextChar() {
        index += 1;
        currentChar = chars[index];
        return currentChar;
      }

      function processToken() {
        var result = CHAR_TO_TOKEN.get(currentChar);
        if (result === undefined) {
          if (_this.isValidIdentifierChar(currentChar)) {
            buildIdentifierToken();
          } else if (_this.isNum(currentChar)) {
            buildNumberToken();
          } else if (_this.isEqualsSign(currentChar)) {
            buildEqualsToken();
          } else {
            Logger.LogError("LexerError: Unknown character");
            nextChar();
          }
        } else {
          tokens.push({ lexeme: currentChar, code: result });
          nextChar();
        }
      }

      function buildIdentifierToken() {
        var identifier_string = currentChar;
        while (_this.isValidIdentifierChar(nextChar())) {
          identifier_string += currentChar;
        }
        tokens.push({ lexeme: identifier_string, code: Token.ID });
      }

      function buildNumberToken() {
        var number_string = currentChar;
        while (_this.isNum(nextChar())) {
          number_string += currentChar;
        }
        tokens.push({ lexeme: number_string, code: Token.NUM });
      }

      function buildEqualsToken() {
        if (nextChar() === "=") {
          tokens.push({ lexeme: "==", code: Token.COMPARISON_OP });
          nextChar();
        } else {
          tokens.push({ lexeme: "=", code: Token.ASSIGN_OP });
        }
      }

      function process() {
        while (index < chars.length) {
          processToken();
        }
        tokens.push({ lexeme: 'EOF', code: Token.EOF });
        return tokens;
      }

      return process();
    }(this));
  },

  isValidIdentifierChar: function(char) {
    return /[a-zA-z_]/.test(char);
  },

  isNum: function(char) {
    return /[0-9]/.test(char);
  },

  isEqualsSign: function(char) {
    return char === "=";
  }
}
