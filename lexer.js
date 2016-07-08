var fs = require('fs')

Token = {
  EOF: -1,
  ID: -2,
  NUM: -3,
  ASSIGN_OP: -4,
  ADD_OP: -5,
  SUB_OP: -6,
  MULT_OP: -7,
  DIV_OP: -8,
  LEFT_PAREN: -9,
  RIGHT_PAREN: -10
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
      var id_index = index;
      id_index += 1;
      while (isLetter(string[id_index])) {
        id_str += string[id_index];
        id_index += 1;
      }
      index = id_index - 1;
      tokens.push([id_str, Token.ID]);
    }

    else if (isNum(char)) {
      var num_str = char;
      var num_index = index;
      num_index += 1;
      while (isNum(string[num_index])) {
        num_str += string[num_index];
        num_index += 1;
      }
      index = num_index - 1;
      tokens.push([num_str, Token.NUM]);
    }

    else if (isEquals(char)) {
      tokens.push([char, Token.ASSIGN_OP]);
    }

    else if (isAdd(char)) {
      tokens.push([char, Token.ADD_OP]);
    }

    else if (isSub(char)) {
      tokens.push([char, Token.SUB_OP]);
    }

    else if (isMult(char)) {
      tokens.push([char, Token.MULT_OP]);
    }

    else if (isDiv(char)) {
      tokens.push([char, Token.DIV_OP]);
    }

    else if (isLeftParen(char)) {
      tokens.push([char, Token.LEFT_PAREN]);
    }

    else if (isRightParen(char)) {
      tokens.push([char, Token.RIGHT_PAREN]);
    }

    index += 1;
  }

  tokens.push(['EOF', Token.EOF]);
  return tokens;
}

function isLetter(char) {
  return char.match(/[a-zA-z]/);
}

function isNum(char) {
  return char.match(/[0-9]/);
}

function isEquals(char) {
  return char == "=";
}

function isAdd(char) {
  return char == "+";
}

function isSub(char) {
  return char == "-";
}

function isMult(char) {
  return char == "*";
}

function isDiv(char) {
  return char == "/";
}

function isLeftParen(char) {
  return char == "(";
}

function isRightParen(char) {
  return char == ")";
}

if (process.argv.length <= 2) {
  console.log("Usage: node lexer.js <file>");
  process.exit(-1);
}

var filename = process.argv[2];

var contents = fs.readFileSync(filename, 'utf8');
var tokens = tokenize(contents);
console.log(tokens);
