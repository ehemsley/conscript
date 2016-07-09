module.exports = {
  NumberExpressionNode: function(value) {
    this.value = value;
  },

  VariableExpressionNode: function(name) {
    this.name = name;
  },

  BinaryExpressionNode: function(operator, left, right) {
    this.operator = operator;
    this.left = left;
    this.left.parent = this;
    this.right = right;
    this.right.parent = this;
  },

  CallExpressionNode: function(callee, args) {
    this.callee = callee;
    this.args = args;
  },

  PrototypeNode: function(name, args) {
    this.name = name;
    this.args = args;
  },

  FunctionNode: function(prototype, body) {
    this.prototype = prototype;
    this.body = body;
  }
}
