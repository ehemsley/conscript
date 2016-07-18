var assert = require('chai').assert;
const lexer = require('../src/lexer.js');
const Token = require('../src/token.js');

describe('lexer', function() {
  describe('tokenize', function() {
    var tokens = lexer.tokenize("identifier = 12345 + 23456 - ((234 * 2) / 4)");

    it('should generate the correct amount of tokens', function() {
      assert.lengthOf(tokens, 16);
    });

    it ('should end with an EOF token', function() {
      assert.equal(tokens[15].lexeme, "EOF");
      assert.equal(tokens[15].code, Token.EOF);
    })

    describe('identifiers', function() {
      it('should generate the correct lexeme for an identifier', function() {
        assert.equal(tokens[0].lexeme, "identifier");
      });

      it('should generate the correct token code for an identifier', function() {
        assert.equal(tokens[0].code, Token.ID);
      });
    });

    describe('numbers', function() {
      it('should generate the correct lexeme for a number', function() {
        assert.equal(tokens[2].lexeme, "12345");
      });

      it('should generate the correct token code for a number', function() {
        assert.equal(tokens[2].code, Token.NUM);
      });
    });

    describe('assignment', function() {
      it('should generate the correct lexeme for an assignment operator', function() {
        assert.equal(tokens[1].lexeme, "=");
      });

      it('should generate the correct token code for an assignment operator', function() {
        assert.equal(tokens[1].code, Token.ASSIGN_OP);
      });
    });

    describe('comparison', function() {
      var tokens = lexer.tokenize("id == 4");
      it('should generate the correct lexeme for a comparison operator', function() {
        assert.equal(tokens[1].lexeme, "==");
      });

      it('should generate the correct token code for a comparison operator', function() {
        assert.equal(tokens[1].code, Token.COMPARISON_OP);
      });
    });

    describe('addition', function() {
      it('should generate the correct lexeme for an addition operator', function() {
        assert.equal(tokens[3].lexeme, "+");
      });

      it('should generate the correct token code for an assignment operator', function() {
        assert.equal(tokens[3].code, Token.ADD_OP);
      });
    });

    describe('subtract', function() {
      it('should generate the correct lexeme for a subtraction operator', function() {
        assert.equal(tokens[5].lexeme, "-");
      });

      it('should generate the correct token code for a subtration operator', function() {
        assert.equal(tokens[5].code, Token.SUB_OP);
      });
    });

    describe('multiply', function() {
      it('should generate the correct lexeme for a multiply operator', function() {
        assert.equal(tokens[9].lexeme, "*");
      });

      it('should generate the correct token code for a multiply operator', function() {
        assert.equal(tokens[9].code, Token.MULT_OP);
      });
    });

    describe('divide', function() {
      it('should generate the correct lexeme for a divide operator', function() {
        assert.equal(tokens[12].lexeme, "/");
      });

      it('should generate the correct token code for a divide operator', function() {
        assert.equal(tokens[12].code, Token.DIV_OP);
      });
    });

    describe('left paren', function() {
      it('should generate the correct lexeme for a left paren', function() {
        assert.equal(tokens[7].lexeme, "(");
      });

      it('should generate the correct token code for a left paren', function() {
        assert.equal(tokens[7].code, Token.LEFT_PAREN);
      });
    });

    describe('right paren', function() {
      it('should generate the correct lexeme for a right paren', function() {
        assert.equal(tokens[14].lexeme, ")");
      });

      it('should generate the correct token code for a right paren', function() {
        assert.equal(tokens[14].code, Token.RIGHT_PAREN);
      });
    });

    describe('left bracket', function() {
      var tokens = lexer.tokenize("myArray = [1,2]");
      it('should generate the correct lexeme for a left bracket', function() {
        assert.equal(tokens[2].lexeme, "[");
      });

      it('should generate the correct token code for a left bracket', function() {
        assert.equal(tokens[2].code, Token.LEFT_BRACKET);
      });
    });

    describe('right bracket', function() {
      var tokens = lexer.tokenize("myArray = [1,2]");
      it('should generate the correct lexeme for a right bracket', function() {
        assert.equal(tokens[6].lexeme, "]");
      });

      it('should generate the correct token code for a right bracket', function() {
        assert.equal(tokens[6].code, Token.RIGHT_BRACKET);
      });
    });

    describe('comma', function() {
      var tokens = lexer.tokenize("myArray = [1,2]");
      it('should generate the correct lexeme for a comma', function() {
        assert.equal(tokens[4].lexeme, ",");
      });

      it('should generate the correct token code for a comma', function() {
        assert.equal(tokens[4].code, Token.COMMA);
      });
    });

    describe('newline', function() {
      var tokens = lexer.tokenize("function add(a,b)\na+b\nend");
      it('should generate the correct lexeme for a newline', function() {
        assert.equal(tokens[7].lexeme, '\n');
      });

      it('should generate the correct token code for a newline', function() {
        assert.equal(tokens[7].code, Token.NEWLINE);
      });
    });

    describe('function', function() {
      var tokens = lexer.tokenize("function add(a,b)\na+b\nend");
      it('should generate the correct lexeme for the function keyword', function() {
        assert.equal(tokens[0].lexeme, 'function');
      });

      it('should generate the correct token code for the function keyword', function() {
        assert.equal(tokens[0].code, Token.FUNCTION_KEYWORD);
      });
    });

    describe('end', function() {
      var tokens = lexer.tokenize("function add(a,b)\na+b\nend");
      it('should generate the correct lexeme for the end keyword', function() {
        assert.equal(tokens[12].lexeme, 'end');
      });

      it('should generate the correct token code for the end keyword', function() {
        assert.equal(tokens[12].code, Token.END_KEYWORD);
      });
    });

    describe('point', function() {
      var tokens = lexer.tokenize("myArray.push");
      it('should generate the correct lexeme for the point', function() {
        assert.equal(tokens[1].lexeme, '.');
      });

      it('should generate the correct token code for the point', function() {
        assert.equal(tokens[1].code, Token.POINT);
      });
    });

    describe('through', function() {
      var tokens = lexer.tokenize("(1..5)");
      it('should generate the correct lexeme for the through op', function() {
        assert.equal(tokens[2].lexeme, '..');
      });

      it('should generate the correct token code for the through op', function() {
        assert.equal(tokens[2].code, Token.THROUGH_OP);
      });
    });
  });

  describe('isValidIdentifierChar', function() {
    it('should return true if the char is a letter', function() {
      assert.equal(lexer.isValidIdentifierChar("a"), true);
    });

    it('should return true if the char is a capital letter', function() {
      assert.equal(lexer.isValidIdentifierChar("F"), true);
    });

    it('should return false if the char is not a letter', function() {
      assert.equal(lexer.isValidIdentifierChar("1"), false);
    });

    it('should return true if the char is an underscore', function() {
      assert.equal(lexer.isValidIdentifierChar('_'), true);
    });

    it('should return false if the char is undefined', function() {
      assert.equal(lexer.isValidIdentifierChar(undefined), false);
    });

    it('should return false if the char is a bracket', function() {
      assert.equal(lexer.isValidIdentifierChar(']'), false);
    });
  });

  describe('isNum', function() {
    it('should return true if the char is a number', function() {
      assert.equal(lexer.isNum("1"), true);
    });

    it('should return false if the char is not a number', function() {
      assert.equal(lexer.isNum("a"), false);
    });

    it('should return false if the char is undefined', function() {
      assert.equal(lexer.isNum(undefined), false);
    });
  });

  describe('isNumOrDecimalPoint', function() {
    it('should return true if the char is a decimal point', function() {
      assert.equal(lexer.isNumOrDecimalPoint('.'), true);
    });
  })

  describe('isEqualsSign', function() {
    it('should return true if the char is an equals sign', function() {
      assert.equal(lexer.isEqualsSign("="), true);
    });

    it('should return false if the char is not an equals sign', function() {
      assert.equal(lexer.isEqualsSign("?"), false);
    });
  });

  describe('isWhitespace', function() {
    it('should return true if the char is whitespace', function() {
      assert.equal(lexer.isWhitespace(" "), true);
    });

    it('should return false if the char is not whitespace', function() {
      assert.equal(lexer.isWhitespace("a"), false);
    });
  });

  describe('isReservedWord', function() {
    it('should return true if the string is a reserved word', function() {
      assert.equal(lexer.isReservedWord("function"), true);
    });

    it('should return false if the string is not a reserved word', function() {
      assert.equal(lexer.isReservedWord("blargh"), false);
    });
  });
});
