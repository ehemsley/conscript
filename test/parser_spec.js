var assert = require('chai').assert;
const Token = require('../src/token.js');
const ast = require('../src/ast.js');
const parser = require('../src/parser.js');
const lexer = require('../src/lexer.js');
const Logger = require('../src/logger.js');

describe('parser', function() {
  describe('parse', function() {
    describe('numbers', function() {
      it('should parse a number containing a decimal', function() {
        var result = parser.parse(lexer.tokenize("10.345"));
        assert.equal(result[0].body.expressions[0].value, '10.345');
      });

      it('should parse a number ending in a decimal', function() {
        var result = parser.parse(lexer.tokenize("100."));
        assert.equal(result[0].body.expressions[0].value, '100');
      });
    });

    describe('binary operations', function() {
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
    });

    describe('arrays', function() {
      it('should parse an empty array definition', function() {
        var result = parser.parse(lexer.tokenize("myArray = []"));
        assert.deepEqual(result[0].body.expressions[0].right.contents, []);
      });

      it('should parse an array definition with one number', function() {
        var result = parser.parse(lexer.tokenize("myArray = [4]"));
        assert.equal(result[0].body.expressions[0].right.contents[0].value, 4);
      });

      it('should parse an array definition with multiple numbers', function() {
        var result = parser.parse(lexer.tokenize("myArray = [2,3,4]"));
        assert.equal(result[0].body.expressions[0].right.contents[0].value, 2);
        assert.equal(result[0].body.expressions[0].right.contents[1].value, 3);
        assert.equal(result[0].body.expressions[0].right.contents[2].value, 4);
      });

      it('should parse array of variables', function() {
        var result = parser.parse(lexer.tokenize("myArray = [a,b,c]"));
        assert.equal(result[0].body.expressions[0].right.contents[0].name, 'a');
        assert.equal(result[0].body.expressions[0].right.contents[1].name, 'b');
        assert.equal(result[0].body.expressions[0].right.contents[2].name, 'c');
      });

      it('should parse array of anonymous functions', function() {
        var result = parser.parse(lexer.tokenize("myFunctionArray = [function(a) a*2 end, function(b) b * 5 end]"));
        assert.equal(result[0].body.expressions[0].right.contents[0].body.expressions[0].right.value, 2);
        assert.equal(result[0].body.expressions[0].right.contents[0].body.expressions[0].left.name, 'a');
        assert.equal(result[0].body.expressions[0].right.contents[1].body.expressions[0].right.value, 5);
        assert.equal(result[0].body.expressions[0].right.contents[1].body.expressions[0].left.name, 'b');
      });
    });

    describe('list generator', function () {
      it('should correctly parse a list generator using the through op', function() {
        var result = parser.parse(lexer.tokenize("myArray = 1..5"));
        assert.equal(result[0].body.expressions[0].right.left.value, 1);
        assert.equal(result[0].body.expressions[0].right.right.value, 5);
      });
    });

    describe('functions', function() {
      it('should parse a function definition', function() {
        var result = parser.parse(lexer.tokenize("function add(a,b)\na+b\nend"));
        assert.equal(result[0].body.expressions[0].operator, Token.ADD_OP);
      });
    });
  });
});
