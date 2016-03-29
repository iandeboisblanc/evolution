module.exports= {
  checkIfAllIncluded: function(connections, partCount) {
    var nodes = {};
    connections.forEach(function(conn) {
      nodes[conn[0]] = true;
      nodes[conn[1]] = true;
    });
    return Object.keys(nodes).length === partCount;
  },

  checkIfConnected: function(array) {
    var nodes = {};
    var setInc = 1;
    for(var i = 0; i < array.length; i++) {
      var conns = array[i];
      var leastSet = min(nodes[conns[0]] || Infinity, nodes[conns[1]] || Infinity);
      if(leastSet < Infinity) {
        nodes[conns[0]] = leastSet;
        nodes[conns[1]] = leastSet;
      } else {
        nodes[conns[0]] = setInc;
        nodes[conns[1]] = setInc;
        setInc++;
      }
    }
    for(var set in nodes) {
      if(nodes[set] !== 1) {
        return false;
      }
    }
    return true;
  },
}