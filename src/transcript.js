const Lexer = require('./lexer.js');
const Parser = require('./parser.js');
const Codegen = require('./codegen.js');
const Beautify = require('js-beautify').js_beautify;

module.exports = {
  compile: function(string) {
    var tokens = Lexer.tokenize(string);
    var ast = Parser.parse(tokens);
    var code = Codegen.generate(ast);
    var pretty_code = Beautify(code, { indent_size: 2 });
    return pretty_code + "\n";
  }
}
