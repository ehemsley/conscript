const Token = require('./token.js');

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
    if (this.operator === Token.ASSIGN_OP) {
      return this.left.codegen() + " = " + this.right.codegen();
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
  },

  generateExpressionSequenceCode: function() {
    var code = "";
    for (var i = 0; i < this.expressions.length; i++) {
      if (i == this.expressions.length - 1) {
        code += "return ";
      }
      code += this.expressions[i].codegen() + ";\n";
    }
    return code;
  },

  generateCallExpressionCode: function() {
    var code = this.callee.prototype.name + "(";
    for (var i = 0; i < this.args.length; i++) {
      code += this.args[i].codegen();
      if (i !== this.args.length - 1) { code += ", "; } // common pattern, should abstract it
    }
    code += ");";
    return code;
  },

  generatePrototypeCode: function() {
    var code = "function " + this.name + "(";
    for (var i = 0; i < this.args.length; i++) {
       code += this.args[i].codegen();
       if (i !== this.args.length - 1) { code += ", "; }
    }
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
    for (var i = 0; i < this.prototypeArgs.length; i++) {
      code += this.prototypeArgs[i].codegen();
      if (i !== this.prototypeArgs.length - 1) { code += ", "; }
    }
    code += ") {\n";
    code += this.body.codegen();
    code += "})("
    for (var i = 0; i < this.callArgs.length; i++) {
      code += this.callArgs[i].codegen();
      if (i !== this.callArgs.length - 1) { code += ", "; }
    }
    code += ");"
    return code;
  }
}
