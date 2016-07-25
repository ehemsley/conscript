const Token = require('./token.js');
const Analyzer = require('./analyzer.js');
const Codegen = require('./codegen.js');
const Logger = require('./logger.js');

function StatementNode(node, expression, codegenFunction) {
  node.expression = expression;
  node.analyze = function(){};
  node.codegen = codegenFunction;
}

module.exports = {
  NumberExpressionNode: function(value) {
    this.value = value;
    this.analyze = function(){};
    this.codegen = Codegen.generateNumberExpressionCode;
  },

  VariableExpressionNode: function(name) {
    this.name = name;
    this.analyze = Analyzer.analyzeVariableExpressionNode;
    this.codegen = Codegen.generateVariableExpressionCode;
  },

  BinaryExpressionNode: function(operator, left, right) {
    this.operator = operator;
    this.left = left;
    this.left.parent = this;
    this.right = right;
    this.right.parent = this;
    this.analyze = Analyzer.analyzeBinaryExpressionNode;
    this.codegen = Codegen.generateBinaryExpressionCode;
  },

  CallExpressionNode: function(callee_name, args) {
    this.callee_name = callee_name;
    this.args = args;
    this.callee = null;
    this.analyze = Analyzer.analyzeCallExpressionNode;
    this.codegen = Codegen.generateCallExpressionCode;
  },

  ExpressionSequenceNode: function(expressions) {
    this.expressions = expressions;
    this.analyze = Analyzer.analyzeExpressionSequenceNode;
    this.codegen = Codegen.generateExpressionSequenceCode;
  },

  FunctionSignatureNode: function(name, args) {
    this.name = name;
    this.args = args;
    this.codegen = Codegen.generateSignatureCode;
  },

  FunctionNode: function(signature, body) {
    this.signature = signature;
    this.body = body;
    this.analyze = Analyzer.analyzeFunctionNode;
    this.codegen = Codegen.generateFunctionCode;
  },

  SelfInvokingFunctionNode: function(body, signatureArgs, callArgs) {
    this.body = body;
    this.signatureArgs = typeof signatureArgs !== 'undefined' ?  signatureArgs : [];
    this.callArgs = typeof callArgs !== 'undefined' ? callArgs : [];
    this.analyze = Analyzer.analyzeSelfInvokingFunctionNode;
    this.codegen = Codegen.generateSelfInvokingFunctionCode;
  },

  ArrayNode: function(contents) {
    this.contents = contents;
    this.codegen = Codegen.generateArrayCode;
  },

  ListGeneratorNode: function(left, right, increment, conditionalClosure) {
    this.left = left;
    this.right = right;
    this.increment = increment;
    this.conditionalClosure = conditionalClosure;
    this.codegen = Codegen.generateListGeneratorCode;
  },

  ForLoopNode: function(elementIdentifier, listNode, procedure) {
    this.elementIdentifier = elementIdentifier;
    this.listNode = listNode;
    this.procedure = procedure;
    this.isStatement = true;
    this.codegen = Codegen.generateForLoopCode;
  },

  ClosureNode: function(args, body) {
    this.args = args;
    this.body = body;
    this.codegen = Codegen.generateClosureCode;
  },

  PrintStatementNode: function(expression) {
    StatementNode(this, expression, Codegen.generatePrintStatementNode);
  },

  ReturnStatementNode: function(expression) {
    StatementNode(this, expression, Codegen.generateReturnStatementNode);
  }
}
