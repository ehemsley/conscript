var assert = require('chai').assert;
const ast = require('../src/ast.js');
const parser = require('../src/parser.js');
const lexer = require('../src/lexer.js');
const codegen = require('../src/codegen.js');

describe('codegen', function() {
  describe('generate', function() {
    it('should wrap naked expressions in a self-invoking function', function(){
      assert.equal(codegen.generate(parser.parse(lexer.tokenize("12 + 1234"))), "(function() {return 12 + 1234;})();");
    });
  });
});
