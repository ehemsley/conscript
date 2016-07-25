const expect = require('chai').expect;

const Token = require('../src/token.js');
const AST = require('../src/AST.js');
const parser = require('../src/parser.js');
const Lexer = require('../src/Lexer.js');
const Codegen = require('../src/codegen.js');

describe('codegen', function() {
  describe('generate', function() {
    it('should wrap a naked expression in a self-invoking function', function(){
      expect(Codegen.generate(parser.parse(Lexer.tokenize("12 + 1234")))).to.equal("(function() {12 + 1234;})();");
    });
  });

  describe('generateNumberExpressionCode', function() {
    it('should return the number', function() {
      var numberExpressionNode = new AST.NumberExpressionNode(2);
      expect(numberExpressionNode.codegen()).to.equal(2);
    });
  });

  describe('generateVariableExpressionCode', function() {
    it('should return the variable name', function() {
      var variableExpressionNode = new AST.VariableExpressionNode('id');
      expect(variableExpressionNode.codegen()).to.equal('id');
    });
  });

  describe('generateBinaryExpressionCode', function() {
    it('should generate proper code with simple number expressions', function() {
      var binaryExpressionNode = new AST.BinaryExpressionNode(Token.ADD_OP, new AST.NumberExpressionNode(3), new AST.NumberExpressionNode(5));
      expect(binaryExpressionNode.codegen()).to.equal('3 + 5');
    });

    it('should generate proper code for simple assignment expression', function() {
      var assignmentNode = new AST.BinaryExpressionNode(Token.ASSIGN_OP, new AST.VariableExpressionNode("myVar"), new AST.NumberExpressionNode(6));
      expect(assignmentNode.codegen()).to.equal('myVar = 6');
    });

    it('should generate proper code with nested same-precedence operators', function() {
      var firstBinaryExpression = new AST.BinaryExpressionNode(Token.SUB_OP, new AST.NumberExpressionNode(5), new AST.NumberExpressionNode(2));
      var secondBinaryExpression = new AST.BinaryExpressionNode(Token.ADD_OP, firstBinaryExpression, new AST.NumberExpressionNode(12));
      expect(secondBinaryExpression.codegen()).to.equal('5 - 2 + 12');
    });

    it('should generate proper code with nested different-precedence operators', function() {
      var firstBinaryExpression = new AST.BinaryExpressionNode(Token.MULT_OP, new AST.NumberExpressionNode(10), new AST.NumberExpressionNode(3));
      var secondBinaryExpression = new AST.BinaryExpressionNode(Token.ADD_OP, firstBinaryExpression, new AST.NumberExpressionNode(5));
      expect(secondBinaryExpression.codegen()).to.equal('10 * 3 + 5');
    });

    it('should generate proper code with comparison operation', function() {
      var comparisonExpression = new AST.BinaryExpressionNode(Token.COMPARISON_OP, new AST.VariableExpressionNode("id"), new AST.NumberExpressionNode(6));
      expect(comparisonExpression.codegen()).to.equal('id === 6');
    });
  });

  describe('generateCallExpressionCode', function() {
    it('should generate proper code for a function call with no arguments', function() {
      var signatureNode = new AST.FunctionSignatureNode("destroy", []);
      var functionNode = new AST.FunctionNode(signatureNode, []);
      var callExpressionNode = new AST.CallExpressionNode('destroy', []);
      callExpressionNode.callee = functionNode;
      expect(callExpressionNode.codegen()).to.equal('destroy()');
    });

    it('should generate proper code for a function call with one argument', function() {
      var signatureNode = new AST.FunctionSignatureNode("square", [new AST.VariableExpressionNode('value')]);
      var functionNode = new AST.FunctionNode(signatureNode, []);
      var callExpressionNode = new AST.CallExpressionNode(functionNode, [new AST.NumberExpressionNode(3)]);
      callExpressionNode.callee = functionNode;
      expect(callExpressionNode.codegen()).to.equal('square(3)');
    });

    it('should generate proper code for a function call with two arguments', function() {
      var signatureNode = new AST.FunctionSignatureNode("pow", [new AST.VariableExpressionNode('base'), new AST.VariableExpressionNode('exp')]);
      var functionNode = new AST.FunctionNode(signatureNode, []);
      var callExpressionNode = new AST.CallExpressionNode(functionNode, [new AST.NumberExpressionNode(3), new AST.NumberExpressionNode(2)]);
      callExpressionNode.callee = functionNode;
      expect(callExpressionNode.codegen()).to.equal('pow(3, 2)');
    });
  });

  describe('generateExpressionSequenceCode', function() {
    it('should generate proper code for a single expression', function() {
      var binaryExpressionNode = new AST.BinaryExpressionNode(Token.ADD_OP, new AST.NumberExpressionNode(10), new AST.NumberExpressionNode(4));
      var expressionSequenceNode = new AST.ExpressionSequenceNode([binaryExpressionNode]);
      expect(expressionSequenceNode.codegen()).to.equal('10 + 4;');
    });

    it('should generate proper code for multiple expressions', function() {
      var multNode = new AST.BinaryExpressionNode(Token.MULT_OP, new AST.NumberExpressionNode(10), new AST.NumberExpressionNode(4));
      var addNode = new AST.BinaryExpressionNode(Token.ADD_OP, new AST.NumberExpressionNode(10), new AST.NumberExpressionNode(4));
      var subNode = new AST.BinaryExpressionNode(Token.SUB_OP, new AST.NumberExpressionNode(10), new AST.NumberExpressionNode(4));
      var expressionSequenceNode = new AST.ExpressionSequenceNode([multNode, addNode, subNode]);
      expect(expressionSequenceNode.codegen()).to.equal("10 * 4;10 + 4;10 - 4;");
    });
  });

  describe('generatePrototypeCode', function() {
    it('should generate proper function prototype with no arguments', function() {
      var signatureNode = new AST.FunctionSignatureNode("myFun", []);
      expect(signatureNode.codegen()).to.equal('function myFun();');
    });

    it('should generate proper function prototype with one argument', function() {
      var signatureNode = new AST.FunctionSignatureNode("myFun", [new AST.VariableExpressionNode("myArg")]);
      expect(signatureNode.codegen()).to.equal('function myFun(myArg);');
    });

    it('should generate proper function prototype with two arguments', function() {
      var signatureNode = new AST.FunctionSignatureNode("myFun", [new AST.VariableExpressionNode("firstArg"), new AST.VariableExpressionNode("secondArg")]);
      expect(signatureNode.codegen()).to.equal('function myFun(firstArg, secondArg);');
    });
  });

  describe('functionNode', function() {
    it('should generate proper function code with empty body', function() {
      var signatureNode = new AST.FunctionSignatureNode("myFun", []);
      var emptyBody = new AST.ExpressionSequenceNode([]);
      var functionNode = new AST.FunctionNode(signatureNode, emptyBody);
      expect(functionNode.codegen()).to.equal('function myFun() {}');
    });

    it ('should generate proper function code with expression sequence body', function() {
      var signatureNode = new AST.FunctionSignatureNode("myFun", []);
      var firstExpression = new AST.BinaryExpressionNode(Token.ASSIGN_OP, new AST.VariableExpressionNode("myVar"), new AST.NumberExpressionNode(3));
      var secondExpression = new AST.BinaryExpressionNode(Token.ADD_OP, new AST.VariableExpressionNode("myVar"), new AST.NumberExpressionNode(4));
      var expressionSequenceNode = new AST.ExpressionSequenceNode([firstExpression, secondExpression]);
      var functionNode = new AST.FunctionNode(signatureNode, expressionSequenceNode);
      expect(functionNode.codegen()).to.equal("function myFun() {myVar = 3;myVar + 4;}");
    });

    it('should generate proper function code with expression sequence and arguments', function() {
      var signatureNode = new AST.FunctionSignatureNode("myFun", [new AST.VariableExpressionNode("myArg")]);
      var firstExpression = new AST.BinaryExpressionNode(Token.ASSIGN_OP, new AST.VariableExpressionNode("myVar"), new AST.NumberExpressionNode(3));
      var secondExpression = new AST.BinaryExpressionNode(Token.ADD_OP, new AST.VariableExpressionNode("myVar"), new AST.NumberExpressionNode(4));
      var expressionSequenceNode = new AST.ExpressionSequenceNode([firstExpression, secondExpression]);
      var functionNode = new AST.FunctionNode(signatureNode, expressionSequenceNode);
      expect(functionNode.codegen()).to.equal("function myFun(myArg) {myVar = 3;myVar + 4;}");
    });
  });

  describe('SelfInvokingFunctionNode', function() {
    it('should generate proper self invoking function code with empty body', function() {
      var emptyBody = new AST.ExpressionSequenceNode([]);
      var selfInvokingFunctionNode = new AST.SelfInvokingFunctionNode(emptyBody);
      expect(Codegen.generate(selfInvokingFunctionNode)).to.equal('(function() {})();');
    });

    it('should generate proper self invoking function code with expression sequence and one argument', function() {
      var firstExpression = new AST.BinaryExpressionNode(Token.ASSIGN_OP, new AST.VariableExpressionNode("myVar"), new AST.NumberExpressionNode(3));
      var secondExpression = new AST.BinaryExpressionNode(Token.ADD_OP, new AST.VariableExpressionNode("myVar"), new AST.VariableExpressionNode("givenVar"));
      var expressionSequenceNode = new AST.ExpressionSequenceNode([firstExpression, secondExpression]);
      var selfInvokingFunctionNode = new AST.SelfInvokingFunctionNode(expressionSequenceNode, [new AST.VariableExpressionNode("givenVar")], [new AST.NumberExpressionNode(2)]);
      expect(Codegen.generate(selfInvokingFunctionNode)).to.equal('(function(givenVar) {var myVar;myVar = 3;myVar + givenVar;})(2);');
    });
  });

  describe('ArrayNode', function() {
    it('should generate correct code for empty array', function() {
      var emptyArrayNode = new AST.ArrayNode([]);
      expect(emptyArrayNode.codegen()).to.equal('[]');
    });

    it('should generate correct code for array with one number', function() {
      var arrayNode = new AST.ArrayNode([new AST.NumberExpressionNode(3)]);
      expect(arrayNode.codegen()).to.equal('[3]');
    });

    it('should generate correct code for array with multiple numbers', function() {
      var arrayNode = new AST.ArrayNode([new AST.NumberExpressionNode(2), new AST.NumberExpressionNode(3), new AST.NumberExpressionNode(4)]);
      expect(arrayNode.codegen()).to.equal('[2, 3, 4]');
    });

    it('should generate correct code for array with multiple variables', function() {
      var arrayNode = new AST.ArrayNode([new AST.VariableExpressionNode('a'), new AST.VariableExpressionNode('b')]);
      expect(arrayNode.codegen()).to.equal('[a, b]');
    });
  });

  describe('ListGeneratorNode', function() {
    it('should generate correct code for a number list generator', function() {
      var listGeneratorNode = new AST.ListGeneratorNode(new AST.NumberExpressionNode(1), new AST.NumberExpressionNode(5), new AST.NumberExpressionNode(1));
      expect(listGeneratorNode.codegen()).to.equal(
        "(function() {var __list = []; for (var __i = 1; __i <= 5; __i+=1) {__list.push(__i);} return __list;}())");
    });

    it('should generate correct code for a list generator using variables', function() {
      var listGeneratorNode = new AST.ListGeneratorNode(new AST.VariableExpressionNode('three'), new AST.VariableExpressionNode('five'), new AST.NumberExpressionNode(1));
      expect(listGeneratorNode.codegen()).to.equal(
        "(function() {var __list = []; for (var __i = three; __i <= five; __i+=1) {__list.push(__i);} return __list;}())");
    });

    it('should generate correct code for a list generator using a where closure', function() {
      var firstBinaryExpression = new AST.BinaryExpressionNode(Token.MOD_OP, new AST.VariableExpressionNode('i'), new AST.NumberExpressionNode(2));
      var secondBinaryExpression = new AST.BinaryExpressionNode(Token.COMPARISON_OP, firstBinaryExpression, new AST.NumberExpressionNode(0));
      var listGeneratorNode = new AST.ListGeneratorNode(new AST.NumberExpressionNode(1), new AST.NumberExpressionNode(10), new AST.NumberExpressionNode(1), new AST.ClosureNode([new AST.VariableExpressionNode('i')], secondBinaryExpression));
      expect(listGeneratorNode.codegen()).to.equal(
        "(function() {var __list = []; var __c = (function(i) {i % 2 === 0});for (var __i = 1; __i <= 10; __i+=1) {if (__c(__i)) {__list.push(__i);}} return __list;}())"
      );
    });

    it('should generate correct code for a list generator using a by incrementor', function() {
      var listGeneratorNode = new AST.ListGeneratorNode(new AST.NumberExpressionNode(1), new AST.NumberExpressionNode(10), new AST.NumberExpressionNode(2));
      expect(listGeneratorNode.codegen()).to.equal(
        "(function() {var __list = []; for (var __i = 1; __i <= 10; __i+=2) {__list.push(__i);} return __list;}())"
      );
    });

    it('should generate correct code for a list generator using a by increment and a where closure', function() {
      var firstBinaryExpression = new AST.BinaryExpressionNode(Token.MOD_OP, new AST.VariableExpressionNode('i'), new AST.NumberExpressionNode(2));
      var secondBinaryExpression = new AST.BinaryExpressionNode(Token.COMPARISON_OP, firstBinaryExpression, new AST.NumberExpressionNode(0));
      var listGeneratorNode = new AST.ListGeneratorNode(new AST.NumberExpressionNode(1), new AST.NumberExpressionNode(10), new AST.NumberExpressionNode(2), new AST.ClosureNode([new AST.VariableExpressionNode('i')], secondBinaryExpression));
      expect(listGeneratorNode.codegen()).to.equal(
        "(function() {var __list = []; var __c = (function(i) {i % 2 === 0});for (var __i = 1; __i <= 10; __i+=2) {if (__c(__i)) {__list.push(__i);}} return __list;}())"
      );
    });
  });

  describe('ClosureNode', function() {
    it('should generate correct code for a closure with no args', function() {
      var closure = new AST.ClosureNode([], new AST.ExpressionSequenceNode([new AST.VariableExpressionNode('a')]));
      expect(closure.codegen()).to.equal('(function() {return a;})')
    });

    it('should generate correct code for a closure with one arg', function() {
      var firstBinaryExpression = new AST.BinaryExpressionNode(Token.MOD_OP, new AST.VariableExpressionNode('i'), new AST.NumberExpressionNode(2));
      var secondBinaryExpression = new AST.BinaryExpressionNode(Token.COMPARISON_OP, firstBinaryExpression, new AST.NumberExpressionNode(0));
      var closure = new AST.ClosureNode([new AST.VariableExpressionNode('i')], new AST.ExpressionSequenceNode([secondBinaryExpression]));
      expect(closure.codegen()).to.equal('(function(i) {return i % 2 === 0;})');
    });
  });

  describe('ForLoopNode', function() {
    it('should generate correct code for a list variable', function() {
      var identifier = new AST.VariableExpressionNode('myArray');
      var closure = new AST.ClosureNode([], new AST.ExpressionSequenceNode([new AST.VariableExpressionNode('a')]));
      var forLoopNode = new AST.ForLoopNode(new AST.VariableExpressionNode('elt'), identifier, closure);
      expect(forLoopNode.codegen()).to.equal('(function() {__list = myArray;for (var __i = 0; __i < __list.length; __i++) {var elt = __list[__i];(function() {return a;})();}})();');
    });

    it('should generate correct code for a for loop with list generator', function() {
      var listGenerator = new AST.ListGeneratorNode(new AST.NumberExpressionNode(1), new AST.NumberExpressionNode(5), new AST.NumberExpressionNode(1));
      var closure = new AST.ClosureNode([], new AST.ExpressionSequenceNode([new AST.BinaryExpressionNode(Token.ASSIGN_OP, new AST.VariableExpressionNode('a'), new AST.VariableExpressionNode('elt'))]));
      var forLoopNode = new AST.ForLoopNode(new AST.VariableExpressionNode('elt'), listGenerator, closure);
      expect(forLoopNode.codegen()).to.equal('(function() {__list = (function() {var __list = []; for (var __i = 1; __i <= 5; __i+=1) {__list.push(__i);} return __list;}());for (var __i = 0; __i < __list.length; __i++) {var elt = __list[__i];(function() {return a = elt;})();}})();')
    });
  });

  describe('PrintStatementNode', function() {
    it('should generate correct code for a simple print statement', function() {
      var printStatement = new AST.PrintStatementNode(new AST.VariableExpressionNode('a'));
      expect(printStatement.codegen()).to.equal('console.log(a)');
    });
  });

  describe('ReturnStatementNode', function() {
    it('should generate correct code for a simple return statement', function() {
      var returnStatement = new AST.ReturnStatementNode(new AST.VariableExpressionNode('a'));
      expect(returnStatement.codegen()).to.equal('return a');
    });
  });
});
