var assert = require('chai').assert;
const Token = require('../src/token.js');
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

  describe('generateNumberExpressionCode', function() {
    it('should return the number', function() {
      var numberExpressionNode = new ast.NumberExpressionNode(2);
      assert.equal(numberExpressionNode.codegen(), '2');
    });
  });

  describe('generateVariableExpressionCode', function() {
    it('should return the variable name', function() {
      var variableExpressionNode = new ast.VariableExpressionNode('id');
      assert.equal(variableExpressionNode.codegen(), 'id');
    });
  });

  describe('generateBinaryExpressionCode', function() {
    it('should generate proper code with simple number expressions', function() {
      var binaryExpressionNode = new ast.BinaryExpressionNode(Token.ADD_OP, new ast.NumberExpressionNode(3), new ast.NumberExpressionNode(5));
      assert.equal(binaryExpressionNode.codegen(), '3 + 5');
    });

    it('should generate proper code with nested same-precedence operators', function() {
      var firstBinaryExpression = new ast.BinaryExpressionNode(Token.SUB_OP, new ast.NumberExpressionNode(5), new ast.NumberExpressionNode(2));
      var secondBinaryExpression = new ast.BinaryExpressionNode(Token.ADD_OP, firstBinaryExpression, new ast.NumberExpressionNode(12));
      assert.equal(secondBinaryExpression.codegen(), '5 - 2 + 12');
    });

    it('should generate proper code with nested different-precedence operators', function() {
      var firstBinaryExpression = new ast.BinaryExpressionNode(Token.MULT_OP, new ast.NumberExpressionNode(10), new ast.NumberExpressionNode(3));
      var secondBinaryExpression = new ast.BinaryExpressionNode(Token.ADD_OP, firstBinaryExpression, new ast.NumberExpressionNode(5));
      assert.equal(secondBinaryExpression.codegen(), '10 * 3 + 5');
    });
  });

  describe('generateCallExpressionCode', function() {
    it('should generate proper code for a function call with no arguments', function() {
      var prototypeNode = new ast.PrototypeNode("destroy", []);
      var functionNode = new ast.FunctionNode(prototypeNode, []);
      var callExpressionNode = new ast.CallExpressionNode(functionNode, []);
      assert.equal(callExpressionNode.codegen(), 'destroy();');
    });

    it('should generate proper code for a function call with one argument', function() {
      var prototypeNode = new ast.PrototypeNode("square", [new ast.VariableExpressionNode('value')]);
      var functionNode = new ast.FunctionNode(prototypeNode, []);
      var callExpressionNode = new ast.CallExpressionNode(functionNode, [new ast.NumberExpressionNode(3)]);
      assert.equal(callExpressionNode.codegen(), 'square(3);');
    });

    it('should generate proper code for a function call with two arguments', function() {
      var prototypeNode = new ast.PrototypeNode("pow", [new ast.VariableExpressionNode('base'), new ast.VariableExpressionNode('exp')]);
      var functionNode = new ast.FunctionNode(prototypeNode, []);
      var callExpressionNode = new ast.CallExpressionNode(functionNode, [new ast.NumberExpressionNode(3), new ast.NumberExpressionNode(2)]);
      assert.equal(callExpressionNode.codegen(), 'pow(3, 2);');
    });
  });
});
