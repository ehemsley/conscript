const expect = require('chai').expect;

const ast = require('../src/ast.js');
const SymbolTable = require('../src/symbol_table.js');

describe('symbolTable', function() {
  var globalSymbolTable = new SymbolTable(null);
  describe('addSymbol', function() {
    globalSymbolTable.addSymbol('myVar', 'variable');
    it('adds a symbol to the symbols map', function() {
      expect(globalSymbolTable.symbols.has('myVar')).to.equal(true);
    });

    it('adds a symbol to the symbols map with the correct type', function() {
      expect(globalSymbolTable.symbols.get('myVar')).to.equal('variable');
    });
  });

  describe('lookup', function() {
    var globalSymbolTable = new SymbolTable(null);
    var childSymbolTable = new SymbolTable(globalSymbolTable);
    globalSymbolTable.addSymbol('globalVar', 'variable');
    childSymbolTable.addSymbol('scopedVar', 'variable');
    it('finds a global variable starting from the child symbol table', function() {
      expect(childSymbolTable.lookup('globalVar')).to.equal(true);
    });

    it('finds a scoped variable starting from an inner scope', function() {
      expect(childSymbolTable.lookup('scopedVar')).to.equal(true);
    });

    it('does not find an inner scoped variable starting from the global scope', function() {
      expect(globalSymbolTable.lookup('scopedVar')).to.equal(false);
    })
  });

  describe('functionLookup', function() {
    var symbolTable = new SymbolTable(null);
    var expression = new ast.ExpressionSequenceNode([new ast.PrintStatementNode(new ast.NumberExpressionNode(1))]);
    var functionNode = new ast.FunctionNode('printOne', expression);
    symbolTable.addSymbol('printOne', functionNode);
    it('finds the function node from the name using lookup', function() {
      expect(symbolTable.functionLookup('printOne')).to.equal(functionNode);
    });
  });

  describe('generateDeclarations', function() {
    var globalSymbolTable = new SymbolTable(null);
    var childSymbolTable = new SymbolTable(globalSymbolTable);
    childSymbolTable.addSymbol('scopedVar', 'variable');
    childSymbolTable.addSymbol('anotherScopedVar', 'variable');

    it('generates variable declarations in the given scope', function() {
      expect(childSymbolTable.generateDeclarations()).to.equal('var scopedVar, anotherScopedVar;')
    });

    it('does not generate variable declarations for function arguments', function() {
      childSymbolTable.addSymbol('functionArg', 'argument');
      expect(childSymbolTable.generateDeclarations()).to.not.include('functionArg');
    });
  });
});
