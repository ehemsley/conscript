const expect = require('chai').expect;

const Analyzer = require('../src/analyzer.js');
const SymbolTable = require('../src/symbol_table.js');
const AST = require('../src/ast.js');

describe('Analyzer', function() {
  describe('analyzeVariableExpressionNode', function() {
    it('adds variable to symbol table if not already in a scope', function() {
      var globalSymbolTable = new SymbolTable(null);
      var childSymbolTable = new SymbolTable(globalSymbolTable);
      var variableExpressionNode = new AST.VariableExpressionNode('myVar');
      variableExpressionNode.analyze(childSymbolTable);
      expect(childSymbolTable.lookup('myVar')).to.equal(true);
    });

    it('does not add variable to symbol table if it is already in scope', function() {
      var globalSymbolTable = new SymbolTable(null);
      var childSymbolTable = new SymbolTable(globalSymbolTable);
      var variableExpressionNode = new AST.VariableExpressionNode('myVar');
      globalSymbolTable.addSymbol('myVar', 'variable');
      variableExpressionNode.analyze(childSymbolTable);
      expect(childSymbolTable.symbols.has('myVar')).to.equal(false);
    });
  });
});
