var assert = require('chai').assert;
const Token = require('../src/token.js');
const ast = require('../src/ast.js');
const parser = require('../src/parser.js');
const lexer = require('../src/lexer.js');
const Logger = require('../src/logger.js');

describe('parser', function() {
  describe('parse', function() {
    it('should parse a simple binary operation', function() {
      assert.equal(parser.parse(lexer.tokenize("12+4"), false)[0].body.expressions[0].operator, Token.ADD_OP);
    });

    it('should parse a simple identifier expression', function() {
      assert.equal(parser.parse(lexer.tokenize("identifier = 1234"), false)[0].body.expressions[0].operator, Token.ASSIGN_OP);
    });

    it('should correctly parse multiple binary operations with descending precedence', function() {
      var result = parser.parse(lexer.tokenize("12 / 24 + 3"), false)[0];
      assert.equal(result.body.expressions[0].operator, Token.ADD_OP);
      assert.equal(result.body.expressions[0].left.operator, Token.DIV_OP);
    });

    it('should correctly parse multiple binary operations with ascending precedence', function() {
      var result = parser.parse(lexer.tokenize("myVar = a + 3"), false)[0];
      assert.equal(result.body.expressions[0].operator, Token.ASSIGN_OP);
      assert.equal(result.body.expressions[0].right.operator, Token.ADD_OP);
    });

    it('should correctly parse a comparison operation', function() {
      var result = parser.parse(lexer.tokenize("id == 4"), false)[0];
      assert.equal(result.body.expressions[0].operator, Token.COMPARISON_OP);
    });

    it('should parse a function definition', function() {
      var result = parser.parse(lexer.tokenize("function add(a,b)\na+b\nend"));
      assert.equal(result[0].body.expressions[0].operator, Token.ADD_OP);
    });
  });
});
