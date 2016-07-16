// i hate this parser architecture because it's impossible
// to test the parts individually. need to think of a better
// design.

const ast = require('./ast.js');
const Token = require('./token.js');
const Logger = require('./logger.js');

const PRECEDENCE = new Map([
  [Token.ADD_OP, 20],
  [Token.SUB_OP, 20],
  [Token.MULT_OP, 40],
  [Token.DIV_OP, 40],
  [Token.COMPARISON_OP, 10],
  [Token.ASSIGN_OP, 1]
]);

module.exports = {
  parse: function(tokens, verbose) {
    var verbose = typeof verbose !== 'undefined' ?  verbose : true;

    var index = 0;
    var currentToken = tokens[index];

    function nextToken() {
      index += 1;
      currentToken = tokens[index];
      return currentToken;
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
      if (currentToken !== ')') {
        Logger.LogError("expected ')'");
        return null;
      }
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
            Logger.LogError("expected ')' or ',' in argument list");
            return null;
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
        return null;
      }
    }

    function tokenPrecedence() {
      var precedence_value = PRECEDENCE.get(currentToken.code);
      if (precedence_value == undefined) return -1;
      return precedence_value;
    }

    function parseExpressionSequence() {
      var expressions = [];
      var e;

      while (true) { // :(
        if (e = parseExpression()) {
          expressions.push(e);
          nextToken();
          consumeNewlineTokens();
        } else {
          return new ast.ExpressionSequenceNode(expressions);
        }
      }
    }

    function parseExpression() {
      var left = parsePrimary();
      if (!left) { return null; }
      return parseBinaryOperationRightSide(0, left);
    }

    function parseBinaryOperationRightSide(expressionPrecedence, left) {
      while (true) { //horrible
        var precedence = tokenPrecedence();
        if (precedence < expressionPrecedence) {
          return left;
        }

        var binaryOperation = currentToken;
        nextToken();

        var right = parsePrimary();
        if (!right) {
          return null;
        }

        var nextPrecedence = tokenPrecedence();
        if (precedence < nextPrecedence) {
          right = parseBinaryOperationRightSide(precedence + 1, right);
          if (!right) { return null; }
        }

        left = new ast.BinaryExpressionNode(binaryOperation.code, left, right);
      }
    }

    function parsePrototype() {
      if (currentToken.code !== Token.ID) {
        Logger.LogError("expected function name in prototype");
        return null;
      }

      var functionName = currentToken.lexeme;
      nextToken();

      if (currentToken.code !== Token.LEFT_PAREN) {
        Logger.LogError("expected '(' in prototype");
        return null;
      }

      var argumentNames = [];
      var parsingArgs = true;

      while (parsingArgs) {
        if (nextToken().code === Token.ID) {
          argumentNames.push(new ast.VariableExpressionNode(currentToken.lexeme));
          if (nextToken().code !== Token.COMMA) {
            parsingArgs = false;
          }
        }
      }

      if (currentToken.code !== Token.RIGHT_PAREN) {
        Logger.LogError("expected ')' in prototype");
        return null;
      }

      nextToken();

      consumeNewlineTokens();

      return new ast.PrototypeNode(functionName, argumentNames);
    }

    function parseDefinition() {
      nextToken();
      var prototype = parsePrototype();
      if (!prototype) { return null; }
      var s;
      if (s = parseExpressionSequence()) {
        consumeNewlineTokens();
        if (currentToken.code !== Token.END_KEYWORD) {
          Logger.LogError("expected keyword end in function definition");
          return null;
        }
        nextToken();
        return new ast.FunctionNode(prototype, s);
      }
      return null;
    }

    function parseTopLevelExpression() {
      var e;
      if (e = parseExpression()) {
        var expressionSequence = new ast.ExpressionSequenceNode([e]);
        return new ast.SelfInvokingFunctionNode(expressionSequence);
      }
      return null;
    }

    function handleDefinition() {
      var result;
      if (result = parseDefinition()) {
        return result;
      } else {
        nextToken();
      }
    }

    function handleTopLevelExpression() {
      var result;
      if (result = parseTopLevelExpression()) {
        return result;
      } else {
        nextToken();
      }
    }

    function main() {
      var expressions = [];
      while (true) {
        if (currentToken === undefined) {
          Logger.LogError("Error: unexpected end of file");
          return null;
        } else if (currentToken.code === Token.EOF) {
          return expressions;
        } else if (currentToken.code === Token.FUNCTION_KEYWORD) {
          expressions.push(handleDefinition());
        } else {
          expressions.push(handleTopLevelExpression());
        }
      }
    }

    function consumeNewlineTokens() {
      while (currentToken.code === Token.NEWLINE) {
        nextToken();
      }
    }

    var result = main();
    if (verbose) {
      var errors = Logger.Errors();
      if (errors !== "") { console.log(Logger.Errors()); }
    }
    return result;
  }
}
