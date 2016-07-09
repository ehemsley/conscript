var assert = require('chai').assert;
const ast = require('../ast.js');

describe('ast', function() {
  describe('NumberExpressionNode', function() {
    var numberExpressionNode = new ast.NumberExpressionNode(2);

    it('should contain the correct numeric value', function() {
      assert.equal(numberExpressionNode.value, 2);
    });
  });

  describe('VariableExpressionNode', function() {
    var variableExpressionNode = new ast.VariableExpressionNode("id");

    it('should contain the correct identifier string', function (){
      assert.equal(variableExpressionNode.name, "id");
    });
  });

  describe('BinaryExpressionNode', function() {
    var leftNumberNode = new ast.NumberExpressionNode(2);
    var rightNumberNode = new ast.NumberExpressionNode(5);
    var binaryExpressionNode = new ast.BinaryExpressionNode("+", leftNumberNode, rightNumberNode);

    it('should set the operator', function() {
      assert.equal(binaryExpressionNode.operator, "+");
    });

    it('should set the left side', function() {
      assert.equal(binaryExpressionNode.left, leftNumberNode);
    });

    it('should set the left side parent', function() {
      assert.equal(leftNumberNode.parent, binaryExpressionNode);
    });

    it('should set the right side', function() {
      assert.equal(binaryExpressionNode.right, rightNumberNode);
    });

    it('should set the right side parent', function() {
      assert.equal(rightNumberNode.parent, binaryExpressionNode);
    });
  });

  describe('CallExpressionNode', function() {
    var arg1 = new ast.NumberExpressionNode(3);
    var arg2 = new ast.NumberExpressionNode(2);
    var callExpressionNode = new ast.CallExpressionNode("identifier", [arg1, arg2]);

    it('should set the callee', function() {
      assert.equal(callExpressionNode.callee, "identifier");
    })

    it('should set the arguments', function() {
      assert.include(callExpressionNode.args, arg1);
      assert.include(callExpressionNode.args, arg2);
    });
  });

  describe('PrototypeNode', function() {
    var arg1 = new ast.NumberExpressionNode(12);
    var arg2 = new ast.NumberExpressionNode(45);
    var prototypeNode = new ast.PrototypeNode("name", [arg1, arg2]);

    it('should set the name', function() {
      assert.equal(prototypeNode.name, "name");
    });

    it('should set the arguments', function() {
      assert.include(prototypeNode.args, arg1);
      assert.include(prototypeNode.args, arg2);
    });
  });

  describe('FunctionNode', function() {
    var prototypeNode = new  ast.PrototypeNode("name", []);
    var body = new ast.NumberExpressionNode(5);
    var functionNode = new ast.FunctionNode(prototypeNode, body);

    it('should set the prototype reference', function() {
      assert.equal(functionNode.prototype, prototypeNode);
    });

    it('should set the body reference', function() {
      assert.equal(functionNode.body, body);
    });
  });
});
