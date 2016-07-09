var assert = require('chai').assert;
const lexer = require('../lexer.js');

describe('lexer', function() {
  describe('tokenize', function() {
    var tokens = lexer.tokenize("identifier = 12345 + 23456 - ((234 * 2) / 4)");

    it('should generate the correct amount of tokens', function() {
      assert.lengthOf(tokens, 16);
    });

    describe('identifiers', function() {
      it('should generate the correct lexeme for an identifier', function() {
        assert.equal(tokens[0].lexeme, "identifier");
      });

      it('should generate the correct token code for an identifier', function() {
        assert.equal(tokens[0].code, -2);
      });
    });

    describe('numbers', function() {
      it('should generate the correct lexeme for a number', function() {
        assert.equal(tokens[2].lexeme, "12345");
      });

      it('should generate the correct token code for a number', function() {
        assert.equal(tokens[2].code, -3);
      });
    });

    describe('assignment', function() {
      it('should generate the correct lexeme for an assignment operator', function() {
        assert.equal(tokens[1].lexeme, "=");
      });

      it('should generate the correct token code for an assignment operator', function() {
        assert.equal(tokens[1].code, -4);
      });
    });

    describe('addition', function() {
      it('should generate the correct lexeme for an addition operator', function() {
        assert.equal(tokens[3].lexeme, "+");
      });

      it('should generate the correct token code for an assignment operator', function() {
        assert.equal(tokens[3].code, -5);
      });
    });

    describe('subtract', function() {
      it('should generate the correct lexeme for a subtraction operator', function() {
        assert.equal(tokens[5].lexeme, "-");
      });

      it('should generate the correct token code for a subtration operator', function() {
        assert.equal(tokens[5].code, -6);
      });
    });

    describe('multiply', function() {
      it('should generate the correct lexeme for a multiply operator', function() {
        assert.equal(tokens[9].lexeme, "*");
      });

      it('should generate the correct token code for a multiply operator', function() {
        assert.equal(tokens[9].code, -7);
      });
    });

    describe('divide', function() {
      it('should generate the correct lexeme for a divide operator', function() {
        assert.equal(tokens[12].lexeme, "/");
      });

      it('should generate the correct token code for a divide operator', function() {
        assert.equal(tokens[12].code, -8);
      });
    });

    describe('left paren', function() {
      it('should generate the correct lexeme for a left paren', function() {
        assert.equal(tokens[7].lexeme, "(");
      });

      it('should generate the correct token code for a left paren', function() {
        assert.equal(tokens[7].code, -9);
      });
    });

    describe('right paren', function() {
      it('should generate the correct lexeme for a right paren', function() {
        assert.equal(tokens[14].lexeme, ")");
      });

      it('should generate the correct token code for a right paren', function() {
        assert.equal(tokens[14].code, -10);
      });
    });
  });

  describe('isLetter', function() {
    it('should return true if the char is a letter', function() {
      assert.equal(lexer.isLetter("a"), true);
    });

    it('should return false if the char is not a letter', function() {
      assert.equal(lexer.isLetter("1"), false);
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

  describe('isEqualsOperator', function() {
    it('should return true if the char is an equals operator', function() {
      assert.equal(lexer.isEqualsOperator("="), true);
    });

    it('should return false if the char is not an equals operator', function() {
      assert.equal(lexer.isEqualsOperator("?"), false);
    });
  });

  describe('isAddOperator', function() {
    it('should return true if the char is an addition operator', function() {
      assert.equal(lexer.isAddOperator("+"), true);
    });

    it('should return false if the char is not an addition operator', function() {
      assert.equal(lexer.isAddOperator("/"), false);
    });
  });

  describe('isSubtractOperator', function() {
    it('should return true if the char is a subtract operator', function() {
      assert.equal(lexer.isSubtractOperator("-"), true);
    });

    it('should return false if the char is not a subtract operator', function() {
      assert.equal(lexer.isSubtractOperator("*"), false);
    });
  });

  describe('isMultiplyOperator', function() {
    it('should return true if the char is a multiply operator', function() {
      assert.equal(lexer.isMultiplyOperator("*"), true);
    });

    it('should return false if the char is not a multiply operator', function() {
      assert.equal(lexer.isMultiplyOperator("+"), false);
    });
  });

  describe('isDivideOperator', function() {
    it('should return true if the char is a divide operator', function() {
      assert.equal(lexer.isDivideOperator("/"), true);
    });

    it('should return false if the char is not a divide operator', function() {
      assert.equal(lexer.isDivideOperator("-"), false);
    });
  });

  describe('isLeftParen', function() {
    it('should return true if the char is a left parenthesis', function() {
      assert.equal(lexer.isLeftParen("("), true);
    });

    it('should return false if the char is not a left parenthesis', function() {
      assert.equal(lexer.isLeftParen("z"), false);
    });
  });

  describe('isRightParen', function() {
    it('should return true if the char is a right parenthesis', function() {
      assert.equal(lexer.isRightParen(")"), true);
    });

    it('should return false if the char is not a right parenthesis', function() {
      assert.equal(lexer.isRightParen("-"), false);
    });
  });
});
