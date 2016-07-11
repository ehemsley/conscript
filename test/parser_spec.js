var assert = require('chai').assert;
const Token = require('../token.js');
const ast = require('../ast.js');
const parser = require('../parser.js');
const lexer = require('../lexer.js');

describe('parser', function() {
  describe('parse', function() {
    it('should parse a simple binary operation', function() {
      assert.equal(parser.parse(lexer.tokenize("12+4"))[0].body.operator, Token.ADD_OP);
    });

    it('should parse a simple identifier expression', function() {
      assert.equal(parser.parse(lexer.tokenize("identifier = 1234"))[0].body.operator, Token.ASSIGN_OP);
    });
  });
});
