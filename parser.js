const ast = require('./ast.js');
const Token = require('./token.js');

const PRECEDENCE = new Map([
  [Token.ADD_OP, 20],
  [Token.SUB_OP, 20],
  [Token.MULT_OP, 40],
  [Token.DIV_OP, 40]
]);

module.exports = {
  parse: function(tokens) {
    var index = 0;
    var currentToken = tokens[index];

    function nextToken() {
      index += 1;
      currentToken = tokens[index];
      return currentToken;
    }

    function LogError(string) {
      console.log("Error: " + string);
      return null;
    }

    function parseNumberExpression() {
      var numberExpressionNode = new ast.NumberExpressionNode(currentToken.lexeme);
      nextToken();
      return numberExpressionNode;
    }

    function parseParenExpression() {
      nextToken();
      var expr = parseExpression();
      if (!expr) { return null; }
      if (currentToken !== ')') { return LogError("expected ')'"); }
      nextToken();
    }

    function parseIdentifierExpression() {
      identifier_name = currentToken.lexeme;
      nextToken();
      if (currentToken.code != Token.LEFT_PAREN) {
        return new ast.VariableExpressionNode(identifier_name);
      }
      nextToken();
      var arguments = [];
      if (currentToken.code != Token.RIGHT_PAREN) {
        while (1) {
          var arg;
          if (arg = parseExpression()) {
            arguments.push(arg);
          } else {
            return null;
          }

          if (currentToken.code == Token.RIGHT_PAREN) {
            break;
          }

          if (currentToken.code != Token.COMMA) {
            return LogError("expected ')' or ',' in argument list");
          }

          nextToken();
        }
      }

      nextToken();

      return new ast.CallExpressionNode(identifier_name, arguments);
    }

    function parsePrimary() {
      if (currentToken.code == Token.ID) {
        return parseIdentifierExpression();
      } else if (currentToken.code == Token.NUM) {
        return parseNumberExpression();
      } else if (currentToken.code == Token.LEFT_PAREN) {
        return parseParenExpression();
      } else {
        return LogError("unknown token; expected expression");
      }
    }

    function tokenPrecedence() {
      var precedence_value = PRECEDENCE.get(currentToken.code);
      if (precedence_value == undefined) return -1;
      return precedence_value;
    }

    function parseExpression() {
      var left = parsePrimary();
      if (!left) { return null; }
      return parseBinaryOperationRightSide(0, left);
    }

    function parseBinaryOperationRightSide(expressionPrecedence, left) {
      while (1) {
        var precedence = tokenPrecedence();
        if (precedence < expressionPrecedence) {
          return left;
        }

        var binaryOperation = currentToken;
        nextToken();
        var right = parsePrimary();
        if (!right) { return null; }

        var nextPrecedence = tokenPrecedence();
        if (precedence < nextPrecedence) {
          var right = parseBinaryOperationRightSide(tokenPrecedence + 1, right);
          if (!right) { return null; }
        }

        // this might not work, in the example this functioned
        // by reassigning the left pointer to the following binary node
        return new ast.BinaryExpressionNode(binaryOperation.code, left, right);
      }
    }

    function parsePrototype() {
      if (currentToken.code !== Token.ID) {
        return LogError("expected function name in prototype");
      }

      var functionName = currenToken.lexeme;
      nextToken();

      if (currentToken.code !== Token.LEFT_PAREN) {
        return LogError("expected '(' in prototype");
      }

      var argumentNames = [];
      while (nextToken().code === Token.ID) {
        argumentNames.push(currentToken.lexeme);
      }

      if (currentToken.code !== Token.RIGHT_PAREN) {
        return LogError("expected ')' in prototype");
      }

      nextToken();

      return new ast.PrototypeNode(functionName, argumentNames);
    }

    function parseDefinition() {
      nextToken();
      var prototype = parsePrototype();
      if (!prototype) { return null; }
      var e;
      if (e = parseExpression) {
        return new ast.FunctionNode(prototype, e);
      }
      return null;
    }

    function parseTopLevelExpression() {
      var e;
      if (e = parseExpression()) {
        var prototype = new ast.PrototypeNode("__anon_expr", []);
        return new ast.FunctionNode(prototype, e);
      }
      return null;
    }

    function handleDefinition() {
      if (parseDefinition()) {
        console.log("parsed a function definition");
      } else {
        nextToken();
      }
    }

    function handleTopLevelExpression() {
      var result;
      if (result = parseTopLevelExpression()) {
        console.log("parsed a top-level expression");
        return result;
      } else {
        nextToken();
      }
    }

    function main() {
      var expressions = [];
      while (true) {
        console.log("ready");
        console.log(currentToken);
        if (currentToken.code === Token.EOF) {
          console.log("done");
          return expressions;
        } else {
          expressions.push(handleTopLevelExpression());
        }
      }
    }

    var result = main();
    console.log(result);
  }
}
