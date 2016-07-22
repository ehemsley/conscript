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
  [Token.MOD_OP, 40],
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

      var listExpression;
      if (listExpression = parseExpression()) {
        if (!(listExpression instanceof ast.ListGeneratorNode ||
              listExpression instanceof ast.VariableExpressionNode))
        {
          Logger.LogError("error: expected expression to be a list generator or identifier");
          return null;
        }
      } else {
        Logger.LogError("error: expected expression");
        return null;
      }

      var p;
      if (p = parseClosure()) {
        return new ast.ForLoopNode(elementIdentifier, listExpression, p);
      } else {
        Logger.LogError("error: expected closure");
        return null;
      }
    }

    function parseClosure() {
      if (currentToken.code !== Token.DO_KEYWORD) {
        return null;
      }

      nextToken();

      var args = [];
      var a;
      if (a = parseClosureArgs()) {
        args = a;
      }

      consumeNewlineTokens();

      if (s = parseExpressionSequence()) {
        if (currentToken.code !== Token.END_KEYWORD) {
          Logger.LogError("error: expected end");
          return null;
        }
        nextToken();
        return new ast.ClosureNode(args, s);
      } else {
        Logger.LogError("error: expected expression sequence");
        return null;
      }
    }

    function parseClosureArgs() {
      if (currentToken.code === Token.BAR) {
        nextToken();
        var args = [];
        while(true) {
          if (currentToken.code === Token.BAR) {
            nextToken();
            break;
          } else {
            var v;
            if (v = parseIdentifierExpression()) {
              args.push(v);
            } else {
              Logger.LogError("error: expected variable identifier");
              return null;
            }
          }
        }
        return args;
      } else {
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
      if (currentToken.code == Token.THROUGH_OP) {
        return parseListGeneratorExpression(left);
      } else {
        return parseBinaryOperationRightSide(0, left);
      }
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

    function parseListGeneratorExpression(left) {
      nextToken();

      var right;
      if (currentToken.code === Token.ID) {
        right = new ast.VariableExpressionNode(currentToken.lexeme);
      } else if (currentToken.code === Token.NUM) {
        right = new ast.NumberExpressionNode(currentToken.lexeme);
      } else {
        Logger.LogError("error: expected id or variable");
        return null;
      }

      nextToken();

      var increment = new ast.NumberExpressionNode(1);
      if (currentToken.code === Token.BY_KEYWORD) {
        nextToken();
        var id;
        if (currentToken.code === Token.ID) {
          increment = parseIdentifierExpression();
        } else if (currentToken.code === Token.NUM) {
          increment = parseNumberExpression();
        } else {
          Logger.LogError("error: expected id or number");
          return null;
        }
      }

      var conditionalClosure;
      if (currentToken.code === Token.WHERE_KEYWORD) {
        nextToken();
        var c;
        if (c = parseClosure()) {
          conditionalClosure = c;
        } else {
          Logger.LogError("error: expected closure");
          return null;
        }
      }

      return new ast.ListGeneratorNode(left, right, increment, conditionalClosure);
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
      if (e = parseExpression()) {
        return e;
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
          return new ast.SelfInvokingFunctionNode(new ast.ExpressionSequenceNode(expressions));
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
