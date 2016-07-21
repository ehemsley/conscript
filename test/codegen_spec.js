const expect = require('chai').expect;
const Token = require('../src/token.js');
const ast = require('../src/ast.js');
const parser = require('../src/parser.js');
const lexer = require('../src/lexer.js');
const codegen = require('../src/codegen.js');

describe('codegen', function() {
  describe('generate', function() {
    it('should wrap naked expressions in a self-invoking function', function(){
      expect(codegen.generate(parser.parse(lexer.tokenize("12 + 1234")))).to.equal("(function() {12 + 1234;})();");
    });
  });

  describe('generateNumberExpressionCode', function() {
    it('should return the number', function() {
      var numberExpressionNode = new ast.NumberExpressionNode(2);
      expect(numberExpressionNode.codegen()).to.equal(2);
    });
  });

  describe('generateVariableExpressionCode', function() {
    it('should return the variable name', function() {
      var variableExpressionNode = new ast.VariableExpressionNode('id');
      expect(variableExpressionNode.codegen()).to.equal('id');
    });
  });

  describe('generateBinaryExpressionCode', function() {
    it('should generate proper code with simple number expressions', function() {
      var binaryExpressionNode = new ast.BinaryExpressionNode(Token.ADD_OP, new ast.NumberExpressionNode(3), new ast.NumberExpressionNode(5));
      expect(binaryExpressionNode.codegen()).to.equal('3 + 5');
    });

    it('should generate proper code for simple assignment expression', function() {
      var assignmentNode = new ast.BinaryExpressionNode(Token.ASSIGN_OP, new ast.VariableExpressionNode("myVar"), new ast.NumberExpressionNode(6));
      expect(assignmentNode.codegen()).to.equal('myVar = 6');
    });

    it('should generate proper code with nested same-precedence operators', function() {
      var firstBinaryExpression = new ast.BinaryExpressionNode(Token.SUB_OP, new ast.NumberExpressionNode(5), new ast.NumberExpressionNode(2));
      var secondBinaryExpression = new ast.BinaryExpressionNode(Token.ADD_OP, firstBinaryExpression, new ast.NumberExpressionNode(12));
      expect(secondBinaryExpression.codegen()).to.equal('5 - 2 + 12');
    });

    it('should generate proper code with nested different-precedence operators', function() {
      var firstBinaryExpression = new ast.BinaryExpressionNode(Token.MULT_OP, new ast.NumberExpressionNode(10), new ast.NumberExpressionNode(3));
      var secondBinaryExpression = new ast.BinaryExpressionNode(Token.ADD_OP, firstBinaryExpression, new ast.NumberExpressionNode(5));
      expect(secondBinaryExpression.codegen()).to.equal('10 * 3 + 5');
    });

    it('should generate proper code with comparison operation', function() {
      var comparisonExpression = new ast.BinaryExpressionNode(Token.COMPARISON_OP, new ast.VariableExpressionNode("id"), new ast.NumberExpressionNode(6));
      expect(comparisonExpression.codegen()).to.equal('id === 6');
    });
  });

  describe('generateCallExpressionCode', function() {
    it('should generate proper code for a function call with no arguments', function() {
      var signatureNode = new ast.FunctionSignatureNode("destroy", []);
      var functionNode = new ast.FunctionNode(signatureNode, []);
      var callExpressionNode = new ast.CallExpressionNode(functionNode, []);
      expect(callExpressionNode.codegen()).to.equal('destroy();');
    });

    it('should generate proper code for a function call with one argument', function() {
      var signatureNode = new ast.FunctionSignatureNode("square", [new ast.VariableExpressionNode('value')]);
      var functionNode = new ast.FunctionNode(signatureNode, []);
      var callExpressionNode = new ast.CallExpressionNode(functionNode, [new ast.NumberExpressionNode(3)]);
      expect(callExpressionNode.codegen()).to.equal('square(3);');
    });

    it('should generate proper code for a function call with two arguments', function() {
      var signatureNode = new ast.FunctionSignatureNode("pow", [new ast.VariableExpressionNode('base'), new ast.VariableExpressionNode('exp')]);
      var functionNode = new ast.FunctionNode(signatureNode, []);
      var callExpressionNode = new ast.CallExpressionNode(functionNode, [new ast.NumberExpressionNode(3), new ast.NumberExpressionNode(2)]);
      expect(callExpressionNode.codegen()).to.equal('pow(3, 2);');
    });
  });

  describe('generateExpressionSequenceCode', function() {
    it('should generate proper code for a single expression', function() {
      var binaryExpressionNode = new ast.BinaryExpressionNode(Token.ADD_OP, new ast.NumberExpressionNode(10), new ast.NumberExpressionNode(4));
      var expressionSequenceNode = new ast.ExpressionSequenceNode([binaryExpressionNode]);
      expect(expressionSequenceNode.codegen()).to.equal('10 + 4;');
    });

    it('should generate proper code for multiple expressions', function() {
      var multNode = new ast.BinaryExpressionNode(Token.MULT_OP, new ast.NumberExpressionNode(10), new ast.NumberExpressionNode(4));
      var addNode = new ast.BinaryExpressionNode(Token.ADD_OP, new ast.NumberExpressionNode(10), new ast.NumberExpressionNode(4));
      var subNode = new ast.BinaryExpressionNode(Token.SUB_OP, new ast.NumberExpressionNode(10), new ast.NumberExpressionNode(4));
      var expressionSequenceNode = new ast.ExpressionSequenceNode([multNode, addNode, subNode]);
      expect(expressionSequenceNode.codegen()).to.equal("10 * 4;10 + 4;10 - 4;");
    });
  });

  describe('generatePrototypeCode', function() {
    it('should generate proper function prototype with no arguments', function() {
      var signatureNode = new ast.FunctionSignatureNode("myFun", []);
      expect(signatureNode.codegen()).to.equal('function myFun();');
    });

    it('should generate proper function prototype with one argument', function() {
      var signatureNode = new ast.FunctionSignatureNode("myFun", [new ast.VariableExpressionNode("myArg")]);
      expect(signatureNode.codegen()).to.equal('function myFun(myArg);');
    });

    it('should generate proper function prototype with two arguments', function() {
      var signatureNode = new ast.FunctionSignatureNode("myFun", [new ast.VariableExpressionNode("firstArg"), new ast.VariableExpressionNode("secondArg")]);
      expect(signatureNode.codegen()).to.equal('function myFun(firstArg, secondArg);');
    });
  });

  describe('functionNode', function() {
    it('should generate proper function code with empty body', function() {
      var signatureNode = new ast.FunctionSignatureNode("myFun", []);
      var emptyBody = new ast.ExpressionSequenceNode([]);
      var functionNode = new ast.FunctionNode(signatureNode, emptyBody);
      expect(functionNode.codegen()).to.equal('function myFun() {}');
    });

    it ('should generate proper function code with expression sequence body', function() {
      var signatureNode = new ast.FunctionSignatureNode("myFun", []);
      var firstExpression = new ast.BinaryExpressionNode(Token.ASSIGN_OP, new ast.VariableExpressionNode("myVar"), new ast.NumberExpressionNode(3));
      var secondExpression = new ast.BinaryExpressionNode(Token.ADD_OP, new ast.VariableExpressionNode("myVar"), new ast.NumberExpressionNode(4));
      var expressionSequenceNode = new ast.ExpressionSequenceNode([firstExpression, secondExpression]);
      var functionNode = new ast.FunctionNode(signatureNode, expressionSequenceNode);
      expect(functionNode.codegen()).to.equal("function myFun() {myVar = 3;myVar + 4;}");
    });

    it('should generate proper function code with expression sequence and arguments', function() {
      var signatureNode = new ast.FunctionSignatureNode("myFun", [new ast.VariableExpressionNode("myArg")]);
      var firstExpression = new ast.BinaryExpressionNode(Token.ASSIGN_OP, new ast.VariableExpressionNode("myVar"), new ast.NumberExpressionNode(3));
      var secondExpression = new ast.BinaryExpressionNode(Token.ADD_OP, new ast.VariableExpressionNode("myVar"), new ast.NumberExpressionNode(4));
      var expressionSequenceNode = new ast.ExpressionSequenceNode([firstExpression, secondExpression]);
      var functionNode = new ast.FunctionNode(signatureNode, expressionSequenceNode);
      expect(functionNode.codegen()).to.equal("function myFun(myArg) {myVar = 3;myVar + 4;}");
    });
  });

  describe('SelfInvokingFunctionNode', function() {
    it('should generate proper self invoking function code with empty body', function() {
      var emptyBody = new ast.ExpressionSequenceNode([]);
      var selfInvokingFunctionNode = new ast.SelfInvokingFunctionNode(emptyBody);
      expect(selfInvokingFunctionNode.codegen()).to.equal('(function() {})();');
    });

    it('should generate proper self invoking function code with expression sequence and one argument', function() {
      var firstExpression = new ast.BinaryExpressionNode(Token.ASSIGN_OP, new ast.VariableExpressionNode("myVar"), new ast.NumberExpressionNode(3));
      var secondExpression = new ast.BinaryExpressionNode(Token.ADD_OP, new ast.VariableExpressionNode("myVar"), new ast.VariableExpressionNode("givenVar"));
      var expressionSequenceNode = new ast.ExpressionSequenceNode([firstExpression, secondExpression]);
      var selfInvokingFunctionNode = new ast.SelfInvokingFunctionNode(expressionSequenceNode, [new ast.VariableExpressionNode("givenVar")], [new ast.NumberExpressionNode(2)]);
      expect(selfInvokingFunctionNode.codegen()).to.equal('(function(givenVar) {myVar = 3;myVar + givenVar;})(2);');
    });
  });

  describe('ArrayNode', function() {
    it('should generate correct code for empty array', function() {
      var emptyArrayNode = new ast.ArrayNode([]);
      expect(emptyArrayNode.codegen()).to.equal('[]');
    });

    it('should generate correct code for array with one number', function() {
      var arrayNode = new ast.ArrayNode([new ast.NumberExpressionNode(3)]);
      expect(arrayNode.codegen()).to.equal('[3]');
    });

    it('should generate correct code for array with multiple numbers', function() {
      var arrayNode = new ast.ArrayNode([new ast.NumberExpressionNode(2), new ast.NumberExpressionNode(3), new ast.NumberExpressionNode(4)]);
      expect(arrayNode.codegen()).to.equal('[2, 3, 4]');
    });

    it('should generate correct code for array with multiple variables', function() {
      var arrayNode = new ast.ArrayNode([new ast.VariableExpressionNode('a'), new ast.VariableExpressionNode('b')]);
      expect(arrayNode.codegen()).to.equal('[a, b]');
    });
  });

  describe('ListGeneratorNode', function() {
    it('should generate correct code for a number list generator', function() {
      var listGeneratorNode = new ast.ListGeneratorNode(new ast.NumberExpressionNode(1), new ast.NumberExpressionNode(5));
      expect(listGeneratorNode.codegen()).to.equal(
        "(function() {var __list = []; for (var __i = 1; __i <= 5; __i++) {__list.push(__i);} return __list;}())");
    });

    it('should generate correct code for a list generator using variables', function() {
      var listGeneratorNode = new ast.ListGeneratorNode(new ast.VariableExpressionNode('three'), new ast.VariableExpressionNode('five'));
      expect(listGeneratorNode.codegen()).to.equal(
        "(function() {var __list = []; for (var __i = three; __i <= five; __i++) {__list.push(__i);} return __list;}())");
    });

    it('should generate correct code for a list generator using a where closure', function() {
      var firstBinaryExpression = new ast.BinaryExpressionNode(Token.MOD_OP, new ast.VariableExpressionNode('i'), new ast.NumberExpressionNode(2));
      var secondBinaryExpression = new ast.BinaryExpressionNode(Token.COMPARISON_OP, firstBinaryExpression, new ast.NumberExpressionNode(0));
      var listGeneratorNode = new ast.ListGeneratorNode(new ast.NumberExpressionNode(1), new ast.NumberExpressionNode(10), new ast.ClosureNode([new ast.VariableExpressionNode('i')], secondBinaryExpression));
      expect(listGeneratorNode.codegen()).to.equal(
        "(function() {var __list = []; var __c = (function(i) {i % 2 === 0});for (var __i = 1; __i <= 10; __i++) {if (__c(__i)) {__list.push(__i);}} return __list;}())");
    });
  });

  describe('ClosureNode', function() {
    it('should generate correct code for a closure with no args', function() {
      var closure = new ast.ClosureNode([], new ast.ExpressionSequenceNode([new ast.VariableExpressionNode('a')]));
      expect(closure.codegen()).to.equal('(function() {return a;})')
    });

    it('should generate correct code for a closure with one arg', function() {
      var firstBinaryExpression = new ast.BinaryExpressionNode(Token.MOD_OP, new ast.VariableExpressionNode('i'), new ast.NumberExpressionNode(2));
      var secondBinaryExpression = new ast.BinaryExpressionNode(Token.COMPARISON_OP, firstBinaryExpression, new ast.NumberExpressionNode(0));
      var closure = new ast.ClosureNode([new ast.VariableExpressionNode('i')], new ast.ExpressionSequenceNode([secondBinaryExpression]));
      expect(closure.codegen()).to.equal('(function(i) {return i % 2 === 0;})');
    });
  });

  describe('ForLoopNode', function() {
    it('should generate correct code for a list variable', function() {
      var identifier = new ast.VariableExpressionNode('myArray');
      var closure = new ast.ClosureNode([], new ast.ExpressionSequenceNode([new ast.VariableExpressionNode('a')]));
      var forLoopNode = new ast.ForLoopNode(new ast.VariableExpressionNode('elt'), identifier, closure);
      expect(forLoopNode.codegen()).to.equal('(function() {__list = myArray;for (var __i = 0; __i < __list.length; __i++) {var elt = __list[__i];(function() {return a;})();}})();');
    });

    it('should generate correct code for a for loop with list generator', function() {
      var listGenerator = new ast.ListGeneratorNode(new ast.NumberExpressionNode(1), new ast.NumberExpressionNode(5));
      var closure = new ast.ClosureNode([], new ast.ExpressionSequenceNode([new ast.BinaryExpressionNode(Token.ASSIGN_OP, new ast.VariableExpressionNode('a'), new ast.VariableExpressionNode('elt'))]));
      var forLoopNode = new ast.ForLoopNode(new ast.VariableExpressionNode('elt'), listGenerator, closure);
      expect(forLoopNode.codegen()).to.equal('(function() {__list = (function() {var __list = []; for (var __i = 1; __i <= 5; __i++) {__list.push(__i);} return __list;}());for (var __i = 0; __i < __list.length; __i++) {var elt = __list[__i];(function() {return a = elt;})();}})();')
    });
  });

  describe('PrintStatementNode', function() {
    it('should generate correct code for a simple print statement', function() {
      var printStatement = new ast.PrintStatementNode(new ast.VariableExpressionNode('a'));
      expect(printStatement.codegen()).to.equal('console.log(a)');
    });
  });
});
