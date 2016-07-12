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
  },

  generateCallExpressionCode: function() {
    var code = this.callee.prototype.name + "(";
    for (var i = 0; i < this.args.length; i++) {
      code += this.args[i].codegen();
      if (i !== this.args.length - 1) { code += ", "; }
    }
    code += ");";
    return code;
  }
}
