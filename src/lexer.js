var fs = require('fs')
const Logger = require('./logger.js');
const Token = require('./token.js');

const CHAR_TO_TOKEN = new Map([
  ['+', Token.ADD_OP],
  ['-', Token.SUB_OP],
  ['*', Token.MULT_OP],
  ['/', Token.DIV_OP],
  ['(', Token.LEFT_PAREN],
  [')', Token.RIGHT_PAREN],
  ['[', Token.LEFT_BRACKET],
  [']', Token.RIGHT_BRACKET],
  [',', Token.COMMA],
  ['\n', Token.NEWLINE]
]);

const RESERVED_WORD_TO_TOKEN = new Map([
  ["function", Token.FUNCTION_KEYWORD ],
  ["end", Token.END_KEYWORD ]
]);

module.exports = {
  tokenize: function(string) {
    var tokens = [];

    var index = 0;
    var chars = string.split("");
    var currentChar = chars[index];

    return (function (_this) {
      const MULTICHAR_TO_FUNCTION = new Map([
        ['=', buildEqualsToken],
        ['.', buildPeriodToken]
      ]);

      function nextChar() {
        index += 1;
        currentChar = chars[index];
        return currentChar;
      }

      function buildEqualsToken() {
        if (nextChar() === "=") {
          tokens.push({ lexeme: "==", code: Token.COMPARISON_OP });
          nextChar();
        } else {
          tokens.push({ lexeme: "=", code: Token.ASSIGN_OP });
        }
      }

      function buildPeriodToken() {
        if (nextChar() === '.') {
          tokens.push({ lexeme: "..", code: Token.THROUGH_OP });
          nextChar();
        } else {
          tokens.push({ lexeme: ".", code: Token.POINT });
        }
      }

      function processToken() {
        var result = CHAR_TO_TOKEN.get(currentChar);
        if (result === undefined) {
          var buildFunction;
          if (_this.isValidIdentifierChar(currentChar)) {
            buildMultiCharToken(_this.isValidIdentifierChar, Token.ID);
          } else if (_this.isNum(currentChar)) {
            buildMultiCharToken(_this.isNum, Token.NUM);
          } else if ((buildFunction = MULTICHAR_TO_FUNCTION.get(currentChar)) !== undefined) {
            buildFunction();
          } else if (_this.isWhitespace(currentChar)) {
            nextChar();
          } else {
            Logger.LogError("LexerError: Unknown character " + currentChar);
            nextChar();
          }
        } else {
          tokens.push({ lexeme: currentChar, code: result });
          nextChar();
        }
      }

      function buildMultiCharToken(testFunction, tokenCode) {
        var tokenString = currentChar;

        while(testFunction(nextChar())) {
          if (currentChar === undefined) { break; }
          tokenString += currentChar;
        }

        if (_this.isReservedWord(tokenString)) {
          tokens.push({ lexeme: tokenString, code: RESERVED_WORD_TO_TOKEN.get(tokenString) })
        } else {
          tokens.push({ lexeme: tokenString, code: tokenCode });
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
    return !!char && /[a-zA-Z_]/.test(char);
  },

  isNum: function(char) {
    return /[0-9]/.test(char);
  },

  isNumOrDecimalPoint: function(char) {
    return /[0-9\.]/.test(char);
  },

  isEqualsSign: function(char) {
    return char === "=";
  },

  isWhitespace: function(char) {
    return char === " ";
  },

  isReservedWord: function(string) {
    return RESERVED_WORD_TO_TOKEN.get(string) !== undefined;
  }
}
