const expect = require('chai').expect;

const Logger = require('../src/logger.js');
const Analyzer = require('../src/analyzer.js');
const SymbolTable = require('../src/symbol_table.js');
const AST = require('../src/ast.js');

describe('Analyzer', function() {
  describe('analyzeVariableExpressionNode', function() {
    it('throws an error if variable lookup fails', function() {
      var globalSymbolTable = new SymbolTable(null);
      var childSymbolTable = new SymbolTable(globalSymbolTable);
      var variableExpressionNode = new AST.VariableExpressionNode('myVar');
      variableExpressionNode.analyze(childSymbolTable);
      expect(Logger.Errors()).to.include('error: variable not defined');
    });
  });

  describe('analyzeAssignmentStatementNode', function() {
    it('adds variable to symbol table if it is used by assignment', function() {
      var globalSymbolTable = new SymbolTable(null);
      var childSymbolTable = new SymbolTable(globalSymbolTable);
      var variableAssignmentNode = new AST.AssignmentStatementNode(new AST.VariableExpressionNode('myVar'), new AST.NumberExpressionNode(3));
      variableAssignmentNode.analyze(childSymbolTable);
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
