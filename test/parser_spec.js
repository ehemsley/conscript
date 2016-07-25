var assert = require('chai').assert;
const Token = require('../src/token.js');
const parser = require('../src/parser.js');
const Lexer = require('../src/Lexer.js');
const Logger = require('../src/logger.js');

describe('parser', function() {
  describe('parse', function() {
    describe('numbers', function() {
      it('should parse a number containing a decimal', function() {
        var result = parser.parse(Lexer.tokenize("10.345"));
        assert.equal(result.body.expressions[0].value, '10.345');
      });

      it('should parse a number ending in a decimal', function() {
        var result = parser.parse(Lexer.tokenize("100."));
        assert.equal(result.body.expressions[0].value, '100');
      });
    });

    describe('binary operations', function() {
      it('should parse a simple binary operation', function() {
        assert.equal(parser.parse(Lexer.tokenize("12+4"), false).body.expressions[0].operator, Token.ADD_OP);
      });

      it('should parse a simple identifier expression', function() {
        assert.equal(parser.parse(Lexer.tokenize("identifier = 1234"), false).body.expressions[0].operator, Token.ASSIGN_OP);
      });

      it('should correctly parse multiple binary operations with descending precedence', function() {
        var result = parser.parse(Lexer.tokenize("12 / 24 + 3"), false);
        assert.equal(result.body.expressions[0].operator, Token.ADD_OP);
        assert.equal(result.body.expressions[0].left.operator, Token.DIV_OP);
      });

      it('should correctly parse multiple binary operations with ascending precedence', function() {
        var result = parser.parse(Lexer.tokenize("myVar = a + 3"), false);
        assert.equal(result.body.expressions[0].operator, Token.ASSIGN_OP);
        assert.equal(result.body.expressions[0].right.operator, Token.ADD_OP);
      });

      it('should correctly parse a comparison operation', function() {
        var result = parser.parse(Lexer.tokenize("id == 4"), false);
        assert.equal(result.body.expressions[0].operator, Token.COMPARISON_OP);
      });
    });

    describe('arrays', function() {
      it('should parse an empty array definition', function() {
        var result = parser.parse(Lexer.tokenize("myArray = []"));
        assert.deepEqual(result.body.expressions[0].right.contents, []);
      });

      it('should parse an array definition with one number', function() {
        var result = parser.parse(Lexer.tokenize("myArray = [4]"));
        assert.equal(result.body.expressions[0].right.contents[0].value, 4);
      });

      it('should parse an array definition with multiple numbers', function() {
        var result = parser.parse(Lexer.tokenize("myArray = [2,3,4]"));
        assert.equal(result.body.expressions[0].right.contents[0].value, 2);
        assert.equal(result.body.expressions[0].right.contents[1].value, 3);
        assert.equal(result.body.expressions[0].right.contents[2].value, 4);
      });

      it('should parse array of variables', function() {
        var result = parser.parse(Lexer.tokenize("myArray = [a,b,c]"));
        assert.equal(result.body.expressions[0].right.contents[0].name, 'a');
        assert.equal(result.body.expressions[0].right.contents[1].name, 'b');
        assert.equal(result.body.expressions[0].right.contents[2].name, 'c');
      });

      it('should parse array of anonymous functions', function() {
        var result = parser.parse(Lexer.tokenize("myFunctionArray = [function(a) a*2 end, function(b) b * 5 end]"));
        assert.equal(result.body.expressions[0].right.contents[0].body.expressions[0].right.value, 2);
        assert.equal(result.body.expressions[0].right.contents[0].body.expressions[0].left.name, 'a');
        assert.equal(result.body.expressions[0].right.contents[1].body.expressions[0].right.value, 5);
        assert.equal(result.body.expressions[0].right.contents[1].body.expressions[0].left.name, 'b');
      });
    });

    describe('list generator', function () {
      it('should correctly parse a list generator using the through op', function() {
        var result = parser.parse(Lexer.tokenize("myArray = 1..5"));
        assert.equal(result.body.expressions[0].right.left.value, 1);
        assert.equal(result.body.expressions[0].right.right.value, 5);
      });

      it('should correctly parse a list generator wrapped in parens', function() {
        var result = parser.parse(Lexer.tokenize("myArray = (1..5)"));
        assert.equal(result.body.expressions[0].right.left.value, 1);
        assert.equal(result.body.expressions[0].right.right.value, 5);
      });

      it('should correctly parse a list generator that uses variables', function() {
        var result = parser.parse(Lexer.tokenize("myArray = three..five"));
        assert.equal(result.body.expressions[0].right.left.name, 'three');
        assert.equal(result.body.expressions[0].right.right.name, 'five');
      });

      it('should correctly parse a list generator that uses a where conditional', function() {
        var result = parser.parse(Lexer.tokenize("(1..10 where do |i| i % 2 == 0 end)"));
        assert.equal(result.body.expressions[0].conditionalClosure.body.expressions[0].left.left.name, 'i');
      });
    });

    describe('for loop', function() {
      it('should parse for loop with identifiers', function() {
        var result = parser.parse(Lexer.tokenize("for elt in myArray do x+1 end"));
        assert.equal(result.body.expressions[0].elementIdentifier.name, 'elt');
        assert.equal(result.body.expressions[0].listNode.name, 'myArray');
        assert.equal(result.body.expressions[0].procedure.body.expressions[0].operator, Token.ADD_OP);
      });

      it('should parse for loop using numerical list generator', function() {
        var result = parser.parse(Lexer.tokenize("for i in (1..5) do i*2 end"));
        assert.equal(result.body.expressions[0].elementIdentifier.name, 'i');
        assert.equal(result.body.expressions[0].listNode.left.value, 1);
        assert.equal(result.body.expressions[0].procedure.body.expressions[0].operator, Token.MULT_OP);
      });

      it('should parse for loop using variable list generator', function() {
        var result = parser.parse(Lexer.tokenize("for i in three..five do i*2 end"));
        assert.equal(result.body.expressions[0].elementIdentifier.name, 'i');
        assert.equal(result.body.expressions[0].listNode.left.name, 'three');
        assert.equal(result.body.expressions[0].procedure.body.expressions[0].operator, Token.MULT_OP);
      });
    });

    describe('list generator', function() {
      it('should correctly parse list generator with a conditional closure', function() {
        var result = parser.parse(Lexer.tokenize("(1..10 where do |i| i % 2 == 0 end)"));
        assert.equal(result.body.expressions[0].left.value, 1);
        assert.equal(result.body.expressions[0].right.value, 10);
        assert.equal(result.body.expressions[0].conditionalClosure.body.expressions[0].left.left.name, 'i');
      });

      it('should correctly parse list generator with a custom increment', function() {
        var result = parser.parse(Lexer.tokenize("(1..10 by 2)"));
        assert.equal(result.body.expressions[0].left.value, 1);
        assert.equal(result.body.expressions[0].right.value, 10);
        assert.equal(result.body.expressions[0].increment.value, 2);
      });
    });

    describe('functions', function() {
      it('should parse a function definition', function() {
        var result = parser.parse(Lexer.tokenize("function add(a,b)\na+b\nend"));
        assert.equal(result.body.expressions[0].body.expressions[0].operator, Token.ADD_OP);
      });
    });

    describe('print statements', function() {
      it('should parse a print statement', function() {
        var result = parser.parse(Lexer.tokenize("print a"));
        assert.equal(result.body.expressions[0].expression.name, 'a');
      });
    });

    describe('return statements', function() {
      it('should parse a return statement', function() {
        var result = parser.parse(Lexer.tokenize("return a"));
        assert.equal(result.body.expressions[0].expression.name, 'a');
      })
    })
  });
});
