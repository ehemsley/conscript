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

    this.codegen = function() {
      var code = "";
      for (var i = 0; i < this.expressions.length; i++) {
        if (i == this.expressions.length - 1) {
          code += "return ";
        }
        code += this.expressions[i].codegen() + ";";
      }
      return code;
    };
  },

  PrototypeNode: function(name, args) {
    this.name = name;
    this.args = args;

    this.codegen = function() {
      var code = "function " + this.name + " ( ";
      for (var i = 0; i < this.args.length; i++) {
         code += this.args[i].codegen();
      }
      code += ");"
      return code;
    };
  },

  FunctionNode: function(prototype, body) {
    this.prototype = prototype;
    this.body = body;

    this.codegen = function() {
      var prototypeCode = this.prototype.codegen();
      var bodyCode = this.body.codegen();
      return "{" + prototypeCode + bodyCode + "}";
    };
  },

  SelfInvokingFunctionNode: function(args, body) {
    this.args = args;
    this.body = body;

    this.codegen = function() {
      var bodyCode = this.body.codegen();
      return "(function(" + this.args.toString() + ") {" + bodyCode + "})(" + this.args.toString() + ");";
    };
  }
}
