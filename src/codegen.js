const Token = require('./token.js');

const OPERATOR_TO_CODE = new Map([
  [Token.ASSIGN_OP, "="],
  [Token.ADD_OP, "+"],
  [Token.SUB_OP, "-"],
  [Token.MULT_OP, "*"],
  [Token.DIV_OP, "/"],
  [Token.COMPARISON_OP, "==="]
]);

var tabLevel = 0;

function generateArgumentCode(args) {
  var code = "";
  for (var i = 0; i < args.length; i++) {
    code += args[i].codegen();
    if (i !== args.length - 1) { code += ", "; }
  }
  return code;
}

function generateTabSpaces() {
  var spaces = ""
  for (var i = 0; i < tabLevel; i++) {
    spaces += "  ";
  }
  return spaces;
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
    for (var i = 0; i < this.expressions.length - 1; i++) {
      code += generateTabSpaces() + this.expressions[i].codegen() + ";\n";
    }
    if (this.expressions.length > 0) {
      code += generateTabSpaces() + "return " + this.expressions[this.expressions.length - 1].codegen() + ";\n";
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
    tabLevel += 1;
    var bodyCode = this.body.codegen();
    tabLevel -= 1;
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
