function SymbolTable(parent) {
  this.symbols = [];
  this.parent = parent;
}

SymbolTable.prototype.addSymbol = function(symbol) {
  this.symbols.push(symbol);
}

SymbolTable.prototype.lookup = function(symbol) {
  if (this.symbols.indexOf(symbol) >= 0) {
    return true;
  } else if (this.parent !== null) {
    return this.parent.lookup(symbol);
  } else {
    return false;
  }
}

module.exports = SymbolTable;
