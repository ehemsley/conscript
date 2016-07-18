const Token = require('./token.js');
const Codegen = require('./codegen.js');
const Logger = require('./logger.js');

module.exports = {
  NumberExpressionNode: function(value) {
    this.value = value;
    this.codegen = Codegen.generateNumberExpressionCode;
  },

  VariableExpressionNode: function(name) {
    this.name = name;
    this.codegen = Codegen.generateVariableExpressionCode;
  },

  BinaryExpressionNode: function(operator, left, right) {
    this.operator = operator;
    this.left = left;
    this.left.parent = this;
    this.right = right;
    this.right.parent = this;
    this.codegen = Codegen.generateBinaryExpressionCode;
  },

  CallExpressionNode: function(callee, args) {
    this.callee = callee;
    this.args = args;
    this.codegen = Codegen.generateCallExpressionCode;
  },

  ExpressionSequenceNode: function(expressions) {
    this.expressions = expressions;
    this.codegen = Codegen.generateExpressionSequenceCode;
  },

  //sort of want to rename this as it's not really a "prototype"
  FunctionSignatureNode: function(name, args) {
    this.name = name;
    this.args = args;
    this.codegen = Codegen.generateSignatureCode;
  },

  FunctionNode: function(signature, body) {
    this.signature = signature;
    this.body = body;
    this.codegen = Codegen.generateFunctionCode;
  },

  SelfInvokingFunctionNode: function(body, signatureArgs, callArgs) {
    this.body = body;
    this.signatureArgs = typeof signatureArgs !== 'undefined' ?  signatureArgs : [];
    this.callArgs = typeof callArgs !== 'undefined' ? callArgs : [];
    this.codegen = Codegen.generateSelfInvokingFunctionCode;
  },

  ArrayNode: function(contents) {
    this.contents = contents;
    this.codegen = Codegen.generateArrayCode;
  },

  ListGeneratorNode: function(left, right) {
    this.left = left;
    this.right = right;
    this.codegen = Codegen.generateListGeneratorCode;
  }
}
