const Token = require('./token.js');
const SymbolTable = require('./symbol_table.js');

module.exports = {
  //TODO: top level should be a function node
  analyze: function(ast) {
    var globalSymbolTable = new SymbolTable(null);
    for (var i = 0; i < ast.length; i++) {
      ast[i].analyze(globalSymbolTable);
    }
  },

  analyzeBinaryExpressionNode: function(symbolTable) {
    if (this.operator === Token.ASSIGN_OP) {
      if (!symbolTable.lookup(this.left)) {
        symbolTable.addSymbol(this.left);
        this.left.localToScope = true;
      }
    }
  },

  analyzeExpressionSequenceNode: function(symbolTable) {
    for (var i = 0; i < this.expressions.length; i++) {
      this.expressions[i].analyze(symbolTable);
    }
  },

  analyzeSelfInvokingFunctionNode: function(parentSymbolTable) {
    this.symbolTable = new SymbolTable(parentSymbolTable);
    for (var i = 0; i < this.signatureArgs.length; i++) {
      this.symbolTable.addSymbol(this.signatureArgs[i]);
    }
    this.body.analyze(this.symbolTable);
  }
}
