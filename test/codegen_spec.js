var assert = require('chai').assert;
const Token = require('../src/token.js');
const ast = require('../src/ast.js');
const parser = require('../src/parser.js');
const lexer = require('../src/lexer.js');
const codegen = require('../src/codegen.js');

describe('codegen', function() {
  describe('generate', function() {
    it('should wrap naked expressions in a self-invoking function', function(){
      assert.equal(codegen.generate(parser.parse(lexer.tokenize("12 + 1234"))), "(function() {\n  return 12 + 1234;\n})();");
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

    it('should generate proper code for simple assignment expression', function() {
      var assignmentNode = new ast.BinaryExpressionNode(Token.ASSIGN_OP, new ast.VariableExpressionNode("myVar"), new ast.NumberExpressionNode(6));
      assert.equal(assignmentNode.codegen(), 'myVar = 6');
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

    it('should generate proper code with comparison operation', function() {
      var comparisonExpression = new ast.BinaryExpressionNode(Token.COMPARISON_OP, new ast.VariableExpressionNode("id"), new ast.NumberExpressionNode(6));
      assert.equal(comparisonExpression.codegen(), 'id === 6');
    });
  });

  describe('generateCallExpressionCode', function() {
    it('should generate proper code for a function call with no arguments', function() {
      var signatureNode = new ast.FunctionSignatureNode("destroy", []);
      var functionNode = new ast.FunctionNode(signatureNode, []);
      var callExpressionNode = new ast.CallExpressionNode(functionNode, []);
      assert.equal(callExpressionNode.codegen(), 'destroy();');
    });

    it('should generate proper code for a function call with one argument', function() {
      var signatureNode = new ast.FunctionSignatureNode("square", [new ast.VariableExpressionNode('value')]);
      var functionNode = new ast.FunctionNode(signatureNode, []);
      var callExpressionNode = new ast.CallExpressionNode(functionNode, [new ast.NumberExpressionNode(3)]);
      assert.equal(callExpressionNode.codegen(), 'square(3);');
    });

    it('should generate proper code for a function call with two arguments', function() {
      var signatureNode = new ast.FunctionSignatureNode("pow", [new ast.VariableExpressionNode('base'), new ast.VariableExpressionNode('exp')]);
      var functionNode = new ast.FunctionNode(signatureNode, []);
      var callExpressionNode = new ast.CallExpressionNode(functionNode, [new ast.NumberExpressionNode(3), new ast.NumberExpressionNode(2)]);
      assert.equal(callExpressionNode.codegen(), 'pow(3, 2);');
    });
  });

  describe('generateExpressionSequenceCode', function() {
    it('should generate proper code for a single expression', function() {
      var binaryExpressionNode = new ast.BinaryExpressionNode(Token.ADD_OP, new ast.NumberExpressionNode(10), new ast.NumberExpressionNode(4));
      var expressionSequenceNode = new ast.ExpressionSequenceNode([binaryExpressionNode]);
      assert.equal(expressionSequenceNode.codegen(), 'return 10 + 4;\n');
    });

    it('should generate proper code for multiple expressions', function() {
      var multNode = new ast.BinaryExpressionNode(Token.MULT_OP, new ast.NumberExpressionNode(10), new ast.NumberExpressionNode(4));
      var addNode = new ast.BinaryExpressionNode(Token.ADD_OP, new ast.NumberExpressionNode(10), new ast.NumberExpressionNode(4));
      var subNode = new ast.BinaryExpressionNode(Token.SUB_OP, new ast.NumberExpressionNode(10), new ast.NumberExpressionNode(4));
      var expressionSequenceNode = new ast.ExpressionSequenceNode([multNode, addNode, subNode]);
      assert.equal(expressionSequenceNode.codegen(), "10 * 4;\n10 + 4;\nreturn 10 - 4;\n");
    });
  });

  describe('generatePrototypeCode', function() {
    it('should generate proper function prototype with no arguments', function() {
      var signatureNode = new ast.FunctionSignatureNode("myFun", []);
      assert.equal(signatureNode.codegen(), 'function myFun();');
    });

    it('should generate proper function prototype with one argument', function() {
      var signatureNode = new ast.FunctionSignatureNode("myFun", [new ast.VariableExpressionNode("myArg")]);
      assert.equal(signatureNode.codegen(), 'function myFun(myArg);');
    });

    it('should generate proper function prototype with two arguments', function() {
      var signatureNode = new ast.FunctionSignatureNode("myFun", [new ast.VariableExpressionNode("firstArg"), new ast.VariableExpressionNode("secondArg")]);
      assert.equal(signatureNode.codegen(), 'function myFun(firstArg, secondArg);');
    });
  });

  describe('functionNode', function() {
    it('should generate proper function code with empty body', function() {
      var signatureNode = new ast.FunctionSignatureNode("myFun", []);
      var emptyBody = new ast.ExpressionSequenceNode([]);
      var functionNode = new ast.FunctionNode(signatureNode, emptyBody);
      assert.equal(functionNode.codegen(), 'function myFun() {\n}');
    });

    it ('should generate proper function code with expression sequence body', function() {
      var signatureNode = new ast.FunctionSignatureNode("myFun", []);
      var firstExpression = new ast.BinaryExpressionNode(Token.ASSIGN_OP, new ast.VariableExpressionNode("myVar"), new ast.NumberExpressionNode(3));
      var secondExpression = new ast.BinaryExpressionNode(Token.ADD_OP, new ast.VariableExpressionNode("myVar"), new ast.NumberExpressionNode(4));
      var expressionSequenceNode = new ast.ExpressionSequenceNode([firstExpression, secondExpression]);
      var functionNode = new ast.FunctionNode(signatureNode, expressionSequenceNode);
      assert.equal(functionNode.codegen(), "function myFun() {\n  myVar = 3;\n  return myVar + 4;\n}");
    });

    it('should generate proper function code with expression sequence and arguments', function() {
      var signatureNode = new ast.FunctionSignatureNode("myFun", [new ast.VariableExpressionNode("myArg")]);
      var firstExpression = new ast.BinaryExpressionNode(Token.ASSIGN_OP, new ast.VariableExpressionNode("myVar"), new ast.NumberExpressionNode(3));
      var secondExpression = new ast.BinaryExpressionNode(Token.ADD_OP, new ast.VariableExpressionNode("myVar"), new ast.NumberExpressionNode(4));
      var expressionSequenceNode = new ast.ExpressionSequenceNode([firstExpression, secondExpression]);
      var functionNode = new ast.FunctionNode(signatureNode, expressionSequenceNode);
      assert.equal(functionNode.codegen(), "function myFun(myArg) {\n  myVar = 3;\n  return myVar + 4;\n}");
    });
  });

  describe('SelfInvokingFunctionNode', function() {
    it('should generate proper self invoking function code with empty body', function() {
      var emptyBody = new ast.ExpressionSequenceNode([]);
      var selfInvokingFunctionNode = new ast.SelfInvokingFunctionNode(emptyBody);
      assert.equal(selfInvokingFunctionNode.codegen(), '(function() {\n})();');
    });

    it('should generate proper self invoking function code with expression sequence and one argument', function() {
      var firstExpression = new ast.BinaryExpressionNode(Token.ASSIGN_OP, new ast.VariableExpressionNode("myVar"), new ast.NumberExpressionNode(3));
      var secondExpression = new ast.BinaryExpressionNode(Token.ADD_OP, new ast.VariableExpressionNode("myVar"), new ast.VariableExpressionNode("givenVar"));
      var expressionSequenceNode = new ast.ExpressionSequenceNode([firstExpression, secondExpression]);
      var selfInvokingFunctionNode = new ast.SelfInvokingFunctionNode(expressionSequenceNode, [new ast.VariableExpressionNode("givenVar")], [new ast.NumberExpressionNode(2)]);
      assert.equal(selfInvokingFunctionNode.codegen(), '(function(givenVar) {\n  myVar = 3;\n  return myVar + givenVar;\n})(2);');
    });
  });

  describe('ArrayNode', function() {
    it('should generate correct code for empty array', function() {
      var emptyArrayNode = new ast.ArrayNode([]);
      assert.equal(emptyArrayNode.codegen(), '[]');
    });

    it('should generate correct code for array with one number', function() {
      var arrayNode = new ast.ArrayNode([new ast.NumberExpressionNode(3)]);
      assert.equal(arrayNode.codegen(), '[3]');
    });

    it('should generate correct code for array with multiple numbers', function() {
      var arrayNode = new ast.ArrayNode([new ast.NumberExpressionNode(2), new ast.NumberExpressionNode(3), new ast.NumberExpressionNode(4)]);
      assert.equal(arrayNode.codegen(), '[2, 3, 4]');
    });

    it('should generate correct code for array with multiple variables', function() {
      var arrayNode = new ast.ArrayNode([new ast.VariableExpressionNode('a'), new ast.VariableExpressionNode('b')]);
      assert.equal(arrayNode.codegen(), '[a, b]');
    });
  });

  describe('ListGeneratorNode', function() {
    it('should generate correct code for a number list generator', function() {
      var listGeneratorNode = new ast.ListGeneratorNode(new ast.NumberExpressionNode(1), new ast.NumberExpressionNode(5));
      assert.equal(listGeneratorNode.codegen(),
        "(function(){\nvar list = [];\nfor (var i = 1; i <= 5; i++) {\nlist.push(i);\n}\nreturn list;}())");
    });
  });
});
