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
  });

  describe('isNum', function() {
    it('should return true if the char is a number', function() {
      assert.equal(lexer.isNum("1"), true);
    });

    it('should return false if the char is not a number', function() {
      assert.equal(lexer.isNum("a"), false);
    });
  });

  describe('isEqualsSign', function() {
    it('should return true if the char is an equals sign', function() {
      assert.equal(lexer.isEqualsSign("="), true);
    });

    it('should return false if the char is not an equals sign', function() {
      assert.equal(lexer.isEqualsSign("?"), false);
    });
  });
});
