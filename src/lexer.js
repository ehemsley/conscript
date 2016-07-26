var fs = require('fs')
const Logger = require('./logger.js');
const Token = require('./token.js');

const CHAR_TO_TOKEN = new Map([
  ['+', Token.ADD_OP],
  ['-', Token.SUB_OP],
  ['*', Token.MULT_OP],
  ['/', Token.DIV_OP],
  ['%', Token.MOD_OP],
  ['(', Token.LEFT_PAREN],
  [')', Token.RIGHT_PAREN],
  ['[', Token.LEFT_BRACKET],
  [']', Token.RIGHT_BRACKET],
  [',', Token.COMMA],
  ['\n', Token.NEWLINE],
  ['|', Token.BAR]
]);

const REPEATABLE_SINGLE_CHAR_TO_TOKEN = new Map([
  ['=', Token.ASSIGN_OP],
  ['.', Token.POINT]
])

const REPEATABLE_MULTI_CHAR_TO_TOKEN = new Map([
  ["==", Token.COMPARISON_OP],
  ["..", Token.THROUGH_OP]
])

const RESERVED_WORD_TO_TOKEN = new Map([
  ["function", Token.FUNCTION_KEYWORD],
  ["end", Token.END_KEYWORD],
  ["for", Token.FOR_KEYWORD],
  ["in", Token.IN_KEYWORD],
  ["do", Token.DO_KEYWORD],
  ["print", Token.PRINT_KEYWORD],
  ["where", Token.WHERE_KEYWORD],
  ["by", Token.BY_KEYWORD],
  ["return", Token.RETURN_KEYWORD],
  ["or", Token.OR_KEYWORD]
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
            buildAlphaNumericToken(_this.isValidIdentifierChar, Token.ID);
          } else if (_this.isNum(currentChar)) {
            buildAlphaNumericToken(_this.isNum, Token.NUM);
          } else if (REPEATABLE_SINGLE_CHAR_TO_TOKEN.get(currentChar) !== undefined) {
            buildRepeatableCharToken();
          } else if (_this.isWhitespace(currentChar)) {
            nextChar();
          } else {
            Logger.LogError("LexerError: Unknown character " + currentChar);
            nextChar();
          }
        } else if (result === Token.SUB_OP) {
          nextChar();
          if (currentChar === '>') {
            tokens.push({lexeme: '->', code: Token.ARROW_OP });
            nextChar();
          } else {
            tokens.push({lexeme: '-', code: Token.SUB_OP });
          }
        } else {
          tokens.push({ lexeme: currentChar, code: result });
          nextChar();
        }
      }

      function buildAlphaNumericToken(testFunction, tokenCode) {
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

      function buildRepeatableCharToken() {
        var char = currentChar;
        if (nextChar() === char) {
          var token = char + char;
          tokens.push({ lexeme: token, code: REPEATABLE_MULTI_CHAR_TO_TOKEN.get(token) });
          nextChar();
        } else {
          tokens.push({ lexeme: char, code: REPEATABLE_SINGLE_CHAR_TO_TOKEN.get(char) });
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
