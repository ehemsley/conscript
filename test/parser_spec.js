var assert = require('chai').assert;
const Token = require('../token.js');
const ast = require('../ast.js');
const parser = require('../parser.js');
const lexer = require('../lexer.js');
const Logger = require('../logger.js');

describe('parser', function() {
  describe('parse', function() {
    it('should parse a simple binary operation', function() {
      assert.equal(parser.parse(lexer.tokenize("12+4"), false)[0].body.expressions[0].operator, Token.ADD_OP);
    });

    it('should parse a simple identifier expression', function() {
      assert.equal(parser.parse(lexer.tokenize("identifier = 1234"), false)[0].body.expressions[0].operator, Token.ASSIGN_OP);
    });

    it('should correctly parse multiple binary operations with difference precedence', function() {
      var result = parser.parse(lexer.tokenize("12 / 24 + 3"), false)[0];
      assert.equal(result.body.expressions[0].operator, Token.ADD_OP);
      assert.equal(result.body.expressions[0].left.operator, Token.DIV_OP);
    });

    it('should fail gracefully when a binary operator does not have two arguments', function() {
      parser.parse(lexer.tokenize("12 +"), false);
      assert.include(Logger.Errors(), "unknown token; expected expression")
    });
  });
});
