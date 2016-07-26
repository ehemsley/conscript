function SymbolTable(parent) {
  this.symbols = new Map();
  this.parent = parent;
}

SymbolTable.prototype.addSymbol = function(symbol, type) {
  this.symbols.set(symbol, type);
}

SymbolTable.prototype.lookup = function(symbol) {
  if (this.symbols.has(symbol)) {
    return true;
  } else if (this.parent !== null) {
    return this.parent.lookup(symbol);
  } else {
    return false;
  }
}

SymbolTable.prototype.functionLookup = function(symbol) {
  if (this.symbols.has(symbol)) {
    return this.symbols.get(symbol);
  } else if (this.parent !== null) {
    return this.parent.functionLookup(symbol);
  } else {
    return false;
  }
}

SymbolTable.prototype.generateDeclarations = function() {
  if (this.symbols.length === 0) { return ""; }

  var declarations = [];
  this.symbols.forEach(function(value, key) {
    if (value === 'variable') {
      declarations.push(key);
    }
  });
  if (declarations.length === 0) { return ""; }
  var code = "var ";
  for (var i = 0; i < declarations.length; i++) {
    code += declarations[i];
    if (i !== declarations.length - 1) { code += ", "; }
  }
  code += ";";
  return code;
}

module.exports = SymbolTable;
