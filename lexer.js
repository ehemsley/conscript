var fs = require('fs')

Token = {
  EOF: 0,
  ASSIGN_OP: 1,
  ID: 2,
  NUM: 3
}

function tokenize(string) {
  var tokens = [];
  var index = 0;
  while (index < string.length) {
    var char = string[index];

    while (char == " ") {
      index += 1;
      char = string[index];
    }

    if (isLetter(char)) {
      var id_str = char;
      index += 1;
      while (isLetter(string[index])) {
        id_str += string[index];
        index += 1;
      }
      tokens.push(Token.ID);
    }

    else if (isNum(char)) {
      var num = char;
      index += 1;
      while (isNum(string[index])) {
        num += string[index];
        index += 1;
      }
      tokens.push(Token.NUM);
    }

    else if (isEquals(char)) {
      tokens.push(Token.ASSIGN_OP);
    }

    index += 1;
  }

  tokens.push(Token.EOF);
  return tokens;
}

function isLetter(char) {
  return char.match(/[a-zA-z]/);
}

function isNum(char) {
  return char.match(/[0-9]/);
}

function isEquals(char) {
  return char.match(/=/);
}

if (process.argv.length <= 2) {
  console.log("Usage: node lexer.js <file>");
  process.exit(-1);
}

var filename = process.argv[2];

var contents = fs.readFileSync(filename, 'utf8');
var tokens = tokenize(contents);
console.log(tokens);
