errorQueue = []

module.exports = {
  LogError: function(string) {
    errorQueue.push(string);
  },

  Errors: function() {
    var string = "";
    for (var i = 0; i < errorQueue.length; i++)
    {
      string += (errorQueue[i] + "\n");
    }
    return string;
  }
}
