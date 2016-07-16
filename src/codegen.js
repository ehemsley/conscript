const Token = require('./token.js');

const OPERATOR_TO_CODE = new Map([
  [Token.ASSIGN_OP, "="],
  [Token.ADD_OP, "+"],
  [Token.SUB_OP, "-"],
  [Token.MULT_OP, "*"],
  [Token.DIV_OP, "/"],
  [Token.COMPARISON_OP, "==="]
]);

function generateArgumentCode(args) {
  var code = "";
  for (var i = 0; i < args.length; i++) {
    code += args[i].codegen();
    if (i !== args.length - 1) { code += ", "; }
  }
  return code;
}

module.exports = {
  generate: function(ast) {
    var output = "";
    for (var i = 0; i < ast.length; i++) {
      output += ast[i].codegen();
    }
    return output;
  },

  generateNumberExpressionCode: function() {
    return this.value;
  },

  generateVariableExpressionCode: function() {
    return this.name;
  },

  generateBinaryExpressionCode: function() {
    var operatorCode = OPERATOR_TO_CODE.get(this.operator);
    if (operatorCode === undefined) {
      Logger.LogError("Error: unknown operator");
      return null;
    }
    return this.left.codegen() + " " + operatorCode + " " + this.right.codegen();
  },

  generateExpressionSequenceCode: function() {
    var code = "";
    for (var i = 0; i < this.expressions.length; i++) {
      if (i === this.expressions.length - 1) {
        code += "return ";
      }
      code += this.expressions[i].codegen() + ";\n";
    }
    return code;
  },

  generateCallExpressionCode: function() {
    var code = this.callee.prototype.name + "(";
    code += generateArgumentCode(this.args);
    code += ");";
    return code;
  },

  generatePrototypeCode: function() {
    var code = "function " + this.name + "(";
    code += generateArgumentCode(this.args);
    code += ");"
    return code;
  },

  generateFunctionCode: function() {
    var prototypeCode = this.prototype.codegen();
    var bodyCode = this.body.codegen();
    return prototypeCode.slice(0, -1) + " {\n" + bodyCode + "}";
  },

  generateSelfInvokingFunctionCode: function() {
    var code = "(function(";
    code += generateArgumentCode(this.prototypeArgs);
    code += ") {\n";
    code += this.body.codegen();
    code += "})("
    code += generateArgumentCode(this.callArgs);
    code += ");"
    return code;
  }
}
