var assert = require('chai').assert;
const ast = require('../ast.js');
const parser = require('../parser.js');
const lexer = require('../lexer.js');
const codegen = require('../codegen.js');

describe('codegen', function() {
  describe('generate', function() {
    it('should wrap naked expressions in a self-invoking function', function(){
      assert.equal(codegen.generate(parser.parse(lexer.tokenize("12 + 1234"))), "(function() {12 + 1234;})();");
    });
  });
});
