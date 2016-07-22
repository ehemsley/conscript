const Token = require('./token.js');
const Analyzer = require('./analyzer.js');

const OPERATOR_TO_CODE = new Map([
  [Token.ASSIGN_OP, "="],
  [Token.ADD_OP, "+"],
  [Token.SUB_OP, "-"],
  [Token.MULT_OP, "*"],
  [Token.DIV_OP, "/"],
  [Token.MOD_OP, "%"],
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
    Analyzer.analyze(ast);
    return ast.codegen();
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

  generateExpressionSequenceCode: function(finalShouldReturn) {
    var code = "";
    for (var i = 0; i < this.expressions.length; i++) {
      if (finalShouldReturn !== undefined && i === this.expressions.length - 1) {
        code += "return ";
      }
      code += this.expressions[i].codegen();
      if (!this.expressions[i].isStatement) { code += ";" }
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
    code += this.symbolTable.generateDeclarations();
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
    code += "var __list = []; "
    if (this.conditionalClosure !== undefined) {
      code += "var __c = " + this.conditionalClosure.codegen() + ";";
    }
    code += "for (var __i = " + this.left.codegen() + "; __i <= " + this.right.codegen() + "; __i+=" + this.increment.codegen() + ") {";
    if (this.conditionalClosure !== undefined) {
      code += "if (__c(__i)) {";
    }
    code += "__list.push(__i);";
    if (this.conditionalClosure !== undefined) {
      code += "}";
    }
    code += "} return __list;}())";
    return code;
  },

  generateClosureCode: function() {
    var code = "(function(" + generateArgumentCode(this.args) + ") {";
    code += this.body.codegen(true);
    code += "})";
    return code;
  },

  generateForLoopCode: function() {
    var code = "(function() {";
    code += "__list = " + this.listNode.codegen() + ";";
    code += "for (var __i = 0; __i < __list.length; __i++) {";
    code += "var " + this.elementIdentifier.codegen() + " = __list[__i];";
    code += this.procedure.codegen();
    code += "();}})();";
    return code;
  },

  generatePrintStatementNode: function() {
    var code = "console.log(" + this.expression.codegen() + ")";
    return code;
  }
}
