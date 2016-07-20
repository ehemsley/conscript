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
  [Token.ASSIGN_OP, 1],
  [Token.THROUGH_OP, 60]
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
      var number = currentToken.lexeme;
      nextToken();
      if (currentToken.code === Token.POINT) {
        nextToken();
        if (currentToken.code === Token.NUM) {
          var decimalComponent = currentToken.lexeme;
          nextToken();
          return new ast.NumberExpressionNode(number + '.' + decimalComponent);
        } else {
          return new ast.NumberExpressionNode(number)
        }
      } else {
        return new ast.NumberExpressionNode(number);
      }
    }

    function parseParenExpression() {
      nextToken();
      var expr = parseExpression();
      if (!expr) { return null; }
      if (currentToken.code !== Token.RIGHT_PAREN) {
        Logger.LogError("expected ')'");
        return null;
      }
      nextToken();
      return expr;
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

    function parseBracketExpression() {
      var contents = [];

      nextToken();
      var e;
      if (e = parseExpression()) {
        contents.push(e);
      } else if (currentToken.code === Token.RIGHT_BRACKET) {
        nextToken();
        return new ast.ArrayNode(contents);
      }

      while (true) {
        if (currentToken.code === Token.COMMA) {
          nextToken();
        } else if (currentToken.code === Token.RIGHT_BRACKET) {
          nextToken();
          return new ast.ArrayNode(contents);
        } else if (e = parseExpression()) {
          contents.push(e);
        } else {
          Logger.LogError("Error: expected expression in array definition");
          return null;
        }
      }
    }

    function parseForLoop() {
      nextToken();
      if (currentToken.code !== Token.ID) {
        Logger.LogError("error: expected identifier");
        return null;
      }

      var elementIdentifier = new ast.VariableExpressionNode(currentToken.lexeme);
      nextToken();

      if (currentToken.code !== Token.IN_KEYWORD) {
        Logger.LogError("error: expected in");
        return null;
      }

      nextToken();

      var arrayIdentifier;
      var e;
      if (e = parseExpression()) {
        if (e instanceof ast.ListGeneratorNode) {
          arrayIdentifier = e;
        } else if (e instanceof ast.VariableExpressionNode) {
          arrayIdentifier = e;
        } else {
          Logger.LogError("error: expected expression to be a list generator or identifier");
          return null;
        }
      } else {
        Logger.LogError("error: expected expression");
        return null;
      }

      var c;
      if (c = parseClosure()) {
        if (arrayIdentifier instanceof ast.ListGeneratorNode) {
          return new ast.ForLoopWithListGeneratorNode(elementIdentifier, arrayIdentifier, c);
        } else if (arrayIdentifier instanceof ast.VariableExpressionNode) {
          return new ast.ForLoopWithVariableNode(elementIdentifier, arrayIdentifier, c);
        } else {
          Logger.LogError("error: epxected identifier or list generator");
          return null;
        }
      } else {
        Logger.LogError("error: expected closure");
        return null;
      }
    }

    function parseClosure() {
      if (currentToken.code !== Token.DO_KEYWORD) {
        Logger.LogError("error: expected do");
        return null;
      }

      nextToken();
      consumeNewlineTokens();

      if (s = parseExpressionSequence()) {
        if (currentToken.code !== Token.END_KEYWORD) {
          Logger.LogError("error: expected end");
          return null;
        }
        nextToken();
        return new ast.ClosureNode(s);
      } else {
        Logger.LogError("error: expected expression sequence");
        return null;
      }
    }

    function parsePrintStatement() {
      nextToken();

      if (e = parseExpression()) {
        return new ast.PrintStatementNode(e);
      } else {
        Logger.LogError("error: expected expression");
        return null;
      }
    }

    function parsePrimary() {
      if (currentToken.code == Token.ID) {
        return parseIdentifierExpression();
      } else if (currentToken.code == Token.NUM) {
        return parseNumberExpression();
      } else if (currentToken.code == Token.LEFT_PAREN) {
        return parseParenExpression();
      } else if (currentToken.code === Token.LEFT_BRACKET) {
        return parseBracketExpression();
      } else if (currentToken.code === Token.FOR_KEYWORD) {
        return parseForLoop();
      } else if (currentToken.code === Token.FUNCTION_KEYWORD) {
        return parseDefinition();
      } else if (currentToken.code === Token.PRINT_KEYWORD) {
        return parsePrintStatement();
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

        if (binaryOperation.code === Token.THROUGH_OP) {
          left = new ast.ListGeneratorNode(left, right);
        } else {
          left = new ast.BinaryExpressionNode(binaryOperation.code, left, right);
        }
      }
    }

    function parseFunctionSignature() {
      var functionName;
      if (currentToken.code !== Token.ID) {
        functionName = '';
      } else {
        functionName = currentToken.lexeme;
        nextToken();
      }

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

      return new ast.FunctionSignatureNode(functionName, argumentNames);
    }

    function parseDefinition() {
      nextToken();
      var signature = parseFunctionSignature();
      if (!signature) { return null; }
      var s;
      if (s = parseExpressionSequence()) {
        consumeNewlineTokens();
        if (currentToken.code !== Token.END_KEYWORD) {
          Logger.LogError("expected keyword end in function definition");
          return null;
        }
        nextToken();
        return new ast.FunctionNode(signature, s);
      }
      return null;
    }

    function parseTopLevelExpression() {
      var e;
      if (s = parseExpressionSequence()) {
        return new ast.SelfInvokingFunctionNode(s);
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
        consumeNewlineTokens();
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
