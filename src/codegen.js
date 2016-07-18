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
    for (var i = 0; i < this.expressions.length - 1; i++) {
      code += this.expressions[i].codegen() + "; ";
    }
    if (this.expressions.length > 0) {
      code += "return " + this.expressions[this.expressions.length - 1].codegen() + ";";
    }
    return code;
  },

  generateCallExpressionCode: function() {
    var code = this.callee.signature.name + "(";
    code += generateArgumentCode(this.args);
    code += ");";
    return code;
  },

  generateSignatureCode: function() {
    var code = "function " + this.name + "(";
    code += generateArgumentCode(this.args);
    code += ");"
    return code;
  },

  generateFunctionCode: function() {
    var prototypeCode = this.signature.codegen();
    var bodyCode = this.body.codegen();
    return prototypeCode.slice(0, -1) + " {" + bodyCode + "}";
  },

  generateSelfInvokingFunctionCode: function() {
    var code = "(function(";
    code += generateArgumentCode(this.signatureArgs);
    code += ") {";
    code += this.body.codegen();
    code += "})("
    code += generateArgumentCode(this.callArgs);
    code += ");"
    return code;
  },

  generateArrayCode: function() {
    var code = "[";
    for (var i = 0; i < this.contents.length; i++) {
      code += this.contents[i].codegen()
      if (i !== this.contents.length - 1) {
        code += ", ";
      }
    }
    code += "]";
    return code;
  },

  generateListGeneratorCode: function() {
    var code = "(function() {";
    code += "var list = []; "
    code += "for (var i = " + this.left.codegen() + "; i <= " + this.right.codegen() + "; i++) {";
    code += "list.push(i);";
    code += "} return list;}())";
    return code;
  }
}
