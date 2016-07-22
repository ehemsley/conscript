const Token = require('./token.js');
const SymbolTable = require('./symbol_table.js');

module.exports = {
  analyze: function(ast) {
    var globalSymbolTable = new SymbolTable(null);
    ast.analyze(globalSymbolTable);
  },

  analyzeVariableExpressionNode: function(symbolTable) {
    if (!symbolTable.lookup(this.name)) {
      symbolTable.addSymbol(this.name, 'variable');
    }
  },

  analyzeBinaryExpressionNode: function(symbolTable) {
    this.left.analyze(symbolTable);
    this.right.analyze(symbolTable);
  },

  analyzeExpressionSequenceNode: function(symbolTable) {
    for (var i = 0; i < this.expressions.length; i++) {
      this.expressions[i].analyze(symbolTable);
    }
  },

  analyzeSelfInvokingFunctionNode: function(parentSymbolTable) {
    this.symbolTable = new SymbolTable(parentSymbolTable);
    for (var i = 0; i < this.signatureArgs.length; i++) {
      this.symbolTable.addSymbol(this.signatureArgs[i].name, 'argument');
    }
    this.body.analyze(this.symbolTable);
  }
}
