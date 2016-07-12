const Token = require('./token.js');
const Logger = require('./logger.js');

module.exports = {
  NumberExpressionNode: function(value) {
    this.value = value;
    this.codegen = function() {
      return this.value;
    };
  },

  VariableExpressionNode: function(name) {
    this.name = name;
    this.codegen = function() {
      return this.name;
    };
  },

  BinaryExpressionNode: function(operator, left, right) {
    this.operator = operator;
    this.left = left;
    this.left.parent = this;
    this.right = right;
    this.right.parent = this;

    this.codegen = function() {
      if (this.operator === Token.ASSIGN_OP) {
        return this.left.codegen() + "  = " + this.right.codegen();
      } else if (this.operator === Token.ADD_OP) {
        return this.left.codegen() + " + " + this.right.codegen();
      } else if (this.operator === Token.SUB_OP) {
        return this.left.codegen() + " - " + this.right.codegen();
      } else if (this.operator === Token.MULT_OP) {
        return this.left.codegen() + " * " + this.right.codegen();
      } else if (this.operator === Token.DIV_OP) {
        return this.left.codegen() + " / " + this.right.codegen();
      } else {
        return undefined;
      }
    };
  },

  CallExpressionNode: function(callee, args) {
    this.callee = callee;
    this.args = args;

    this.codegen = function() {
      var argumentCodes = [];
      for (var i = 0; i < this.args.length; i++) {
        argumentCodes.push(this.args[i].codegen());
      }

      return this.callee.prototype.name + "(" + argumentCodes.toString() + ");";
    };
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
      return "function " + this.name + " ( " + this.args.toString() + ");";//prototype!!";
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
