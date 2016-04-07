//helpful things
var findDistance = function(pos1, pos2) {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
};

var limitPositions = function(x,y,r) {
  x = Math.max(r, Math.min(x, (settings.width - r)));
  y = Math.max(r, Math.min(y, (settings.height - r)));
  return [x,y];
};

var chooseOne = function(args) {
  args = Array.prototype.slice.call(arguments);
  if(args.length === 1 && typeof Array.isArray(args[0])) {
    return args[0][randomInt(args[0].length)]
  }
  return args[randomInt(args.length)];
};

var randomInt = function(limit) {
  return Math.floor(Math.random() * limit);
};

var getJunctions = function(array) {
  var possibleConnections = [];
  for(var i = 0; i < array.length; i++) {
    for(var j = i + 1; j < array.length; j++) {
      possibleConnections.push([i,j]);
    }
  }
  return possibleConnections;
};

var getAvgPosition = function(eve) {
  var xPos = 0;
  var yPos = 0;
  for(var j = 0; j < eve.bodyParts.length; j++) {
    xPos += eve.bodyParts[j].pos.x;
    yPos += eve.bodyParts[j].pos.y;
  }
  var pos = {
    x:xPos / eve.bodyParts.length,
    y:yPos / eve.bodyParts.length,
  }
  return pos;
};

var checkIfPartsIncluded = function(connectionsArray, partCount) {
  var nodes = {};
  connectionsArray.forEach(function(conn) {
    nodes[conn[0]] = true;
    nodes[conn[1]] = true;
  });
  return Object.keys(nodes).length === partCount;
};

var checkIfPartsConnected = function(connectionsArray) {
  var nodes = {};
  var setInc = 1;
  for(var i = 0; i < connectionsArray.length; i++) {
    var junction = connectionsArray[i];
    var leastSet = Math.min(nodes[junction[0]] || Infinity, nodes[junction[1]] || Infinity);
    if(leastSet < Infinity) {
      nodes[junction[0]] = leastSet;
      nodes[junction[1]] = leastSet;
    } else {
      nodes[junction[0]] = setInc;
      nodes[junction[1]] = setInc;
      setInc++;
    }
  }
  for(var set in nodes) {
    if(nodes[set] !== 1) {
      return false;
    }
  }
  return true;
};

