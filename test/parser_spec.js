var assert = require('chai').assert;
const ast = require('../ast.js');
const parser = require('../parser.js');
const lexer = require('../lexer.js');

describe('parser', function() {
  describe('parse', function() {
    it('should parse a thing', function() {
      parser.parse(lexer.tokenize("123355 + 3332"));
    })
  });
});
