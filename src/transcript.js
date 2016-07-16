const Lexer = require('./lexer.js');
const Parser = require('./parser.js');
const Codegen = require('./codegen.js');

module.exports = {
  compile: function(string) {
    var tokens = Lexer.tokenize(string);
    var ast = Parser.parse(tokens);
    var code = Codegen.generate(ast);
    return code;
  }
}
