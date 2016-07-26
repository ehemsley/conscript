// i hate this parser architecture because it's impossible
// to test the parts individually. need to think of a better
// design.

const AST = require('./ast.js');
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
  [Token.THROUGH_OP, 60],
  [Token.OR_KEYWORD, 10]
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
          return new AST.NumberExpressionNode(number + '.' + decimalComponent);
        } else {
          return new AST.NumberExpressionNode(number)
        }
      } else {
        return new AST.NumberExpressionNode(number);
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
      var identifier_name = currentToken.lexeme;
      nextToken();
      if (currentToken.code !== Token.LEFT_PAREN) {
        return new AST.VariableExpressionNode(identifier_name);
      }
      nextToken();
      var args = [];
      if (currentToken.code !== Token.RIGHT_PAREN) {
        while (currentToken !== undefined) {
          var arg;
          if (arg = parseExpression()) {
            args.push(arg);
          } else {
            return null;
          }

          if (currentToken.code === Token.RIGHT_PAREN) {
            break;
          }

          if (currentToken.code !== Token.COMMA) {
            Logger.LogError("expected ')' or ',' in argument list");
            return null;
          }

          nextToken();
        }
      }

      nextToken();

      return new AST.CallExpressionNode(identifier_name, args);
    }

    function parseBracketExpression() {
      var contents = [];

      nextToken();
      var e;
      if (e = parseExpression()) {
        contents.push(e);
      } else if (currentToken.code === Token.RIGHT_BRACKET) {
        nextToken();
        return new AST.ArrayNode(contents);
      }

      while (currentToken !== undefined) {
        if (currentToken.code === Token.COMMA) {
          nextToken();
        } else if (currentToken.code === Token.RIGHT_BRACKET) {
          nextToken();
          return new AST.ArrayNode(contents);
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

      var elementIdentifier = new AST.VariableExpressionNode(currentToken.lexeme);
      nextToken();

      if (currentToken.code !== Token.IN_KEYWORD) {
        Logger.LogError("error: expected in");
        return null;
      }

      nextToken();

      var listExpression = parseExpression();
      if (listExpression === null) {
        Logger.LogError("error: expected expression");
        return null;
      }

      //could use newline as indicator token for these loops too?
      if (currentToken.code !== Token.DO_KEYWORD) {
        Logger.LogError("error: expected do");
        return null;
      }

      nextToken();
      consumeNewlineTokens();

      var s = parseExpressionSequence();
      if (s === null) {
        Logger.LogError("error: expected closure");
        return null;
      }

      if (currentToken.code !== Token.END_KEYWORD) {
        Logger.LogError("error: expected end keyword");
        return null;
      }
      nextToken();

      return new AST.ForLoopNode(elementIdentifier, listExpression, s);
    }

    function parseClosure() {
      var args = [];
      var a;
      if (a = parseClosureArgs()) {
        args = a;
      }

      if (currentToken.code !== Token.ARROW_OP) {
        Logger.LogError("error: expected arrow after closure arguments");
        return null;
      }

      nextToken();
      consumeNewlineTokens();

      if (s = parseExpressionSequence()) {
        return new AST.ClosureNode(args, s);
      } else {
        Logger.LogError("error: expected expression sequence");
        return null;
      }
    }

    function parseClosureArgs() {
      if (currentToken.code === Token.LEFT_PAREN) {
        nextToken();
        var args = [];
        while (currentToken !== undefined) {
          if (currentToken.code === Token.RIGHT_PAREN) {
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
        return new AST.PrintStatementNode(e);
      } else {
        Logger.LogError("error: expected expression");
        return null;
      }
    }

    function parseReturnStatement() {
      nextToken();

      if (e = parseExpression()) {
        return new AST.ReturnStatementNode(e);
      } else {
        Logger.LogError("error: expected expression");
        return null;
      }
    }

    //this needs a rework, too much if-else
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
      } else if (currentToken.code === Token.RETURN_KEYWORD) {
        return parseReturnStatement();
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

      while (currentToken !== undefined) {
        if (e = parseExpression()) {
          expressions.push(e);
          consumeNewlineTokens();
        } else {
          return new AST.ExpressionSequenceNode(expressions);
        }
      }
    }

    function parseExpression() {
      var left = parsePrimary();
      if (!left) { return null; }
      var rest = null;
      if (currentToken.code === Token.THROUGH_OP) {
        rest = parseListGeneratorExpression(left);
      } else if (currentToken.code === Token.ASSIGN_OP) {
        rest = parseAssignmentStatement(left);
      } else {
        rest = parseBinaryOperationRightSide(0, left);
      }

      if (currentToken.code === Token.POINT) {
        nextToken();
        var property = parseExpression();
        if (property === null) {
          Logger.LogError("error: expected expression after point");
          return null;
        }
        return new AST.AccessExpressionNode(rest, property);
      }

      return rest;
    }

    function parseBinaryOperationRightSide(expressionPrecedence, left) {
      while (currentToken !== undefined) {
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

        left = new AST.BinaryExpressionNode(binaryOperation.code, left, right);
      }
    }

    function parseAssignmentStatement(left) {
      nextToken();
      var e = parseExpression();
      if (e === null) {
        Logger.LogError("error: expected expression");
        return null;
      } else {
        return new AST.AssignmentStatementNode(left, e);
      }
    }

    function parseListGeneratorExpression(left) {
      nextToken();

      var right = parseExpression();
      if (right === null) {
        Logger.LogError("error: expected expression");
        return null;
      }

      var increment = new AST.NumberExpressionNode(1);
      if (currentToken.code === Token.BY_KEYWORD) {
        nextToken();
        var expression = parseExpression();
        if (expression === null) {
          Logger.LogError("error: expected id or number");
          return null;
        } else {
          increment = expression;
        }
      }

      var conditionalClosure;
      if (currentToken.code === Token.WHERE_KEYWORD) {
        nextToken();
        var c;
        if (c = parseClosure()) {
          conditionalClosure = c;
        } else {
          Logger.LogError("error: expected closure in where clause");
          return null;
        }
      }

      return new AST.ListGeneratorNode(left, right, increment, conditionalClosure);
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
          argumentNames.push(new AST.VariableExpressionNode(currentToken.lexeme));
          if (nextToken().code !== Token.COMMA) {
            parsingArgs = false;
          }
        }
      }

      if (currentToken.code !== Token.RIGHT_PAREN) {
        Logger.LogError("expected ')' in signature");
        return null;
      }

      nextToken();

      consumeNewlineTokens();

      return new AST.FunctionSignatureNode(functionName, argumentNames);
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
        return new AST.FunctionNode(signature, s);
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
      while (currentToken !== undefined) {
        consumeNewlineTokens();
        if (currentToken === undefined) {
          Logger.LogError("Error: unexpected end of file");
          return null;
        } else if (currentToken.code === Token.EOF) {
          return new AST.SelfInvokingFunctionNode(new AST.ExpressionSequenceNode(expressions));
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
