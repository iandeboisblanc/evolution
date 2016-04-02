//import settings

module.exports = {
  createEveData:() => {

    var data = {};
    data.id = 'eve' + Math.floor(Math.random() * 10000000000);
    data.stats = {
      distanceTraveled: 0,
      timeSinceBirth: 0,
      generation: 1,
      ancestors: []
    }

    var bodyPartCount = Math.floor(Math.random() * 5) + 2;
    data.bodyParts = createNBodyParts(bodyPartCount, /*settings.X, settings.Y*/);

    // data.stats.currentPos = {x: xSum / data.bodyParts.length, y: ySum / data.bodyParts.length};

    data.limbs = [];

    var possibleConnections = [];
    for(var i = 0; i < data.bodyParts.length; i++) {
      for(var j = i + 1; j < data.bodyParts.length; j++) {
        possibleConnections.push([i,j]);
      }
    }
    var allConnected = false;
    while(!allConnected && possibleConnections.length) {
      var randomIndex = Math.floor(Math.random() * possibleConnections.length);
      var randomConnection = possibleConnections.splice(randomIndex,1)[0];
      var b0 = randomConnection[0];
      var b1 = randomConnection[1];
      var length = findDistance(data.bodyParts[b0].pos, data.bodyParts[b1].pos);
      var limb = {
        connections: randomConnection,
        currentLength: length,
        growing: true,
        initialLength: length,
        maxLength: length + floor(random() * 3),
        //phase of movement?
        //speed of movement?
        //color?
      };
      data.limbs.push(limb);
      var connections = data.limbs.map(function(limb) {
        return limb.connections;
      });
      allConnected = checkIfAllIncluded(connections, data.bodyParts.length) && checkIfConnected(connections);
    }
    var moreLimbs = floor(random() * possibleConnections.length);
    for(var i = 0; i < moreLimbs; i++) {
      var randomIndex = Math.floor(Math.random() * possibleConnections.length);
      var randomConnection = possibleConnections.splice(randomIndex,1)[0];
      var b0 = randomConnection[0];
      var b1 = randomConnection[1];
      var length = findDistance(data.bodyParts[b0].pos, data.bodyParts[b1].pos);
      var limb = {
        connections: randomConnection,
        currentLength: length,
        growing: true,
        initialLength: length,
        maxLength: length + floor(random() * 3),
        //phase of movement?
        //speed of movement?
        //color?
      };
      data.limbs.push(limb);
    }
  return data;
  },

}

function createNBodyParts(n, maxX, maxY) {
  var bodyPartsArray = [];
  var firstPart = {
    mass: Math.floor(Math.random() * 10) + 3,
    pos: {x:Math.floor(Math.random() * maxX), y:Math.floor(Math.random() * maxY)},
    initialRelativePos: {x:0, y:0},
    vel: {x:0, y:0}
  }
  bodyPartsArray.push(firstPart);

  var currentXPos = firstPart.pos.x;
  var currentYPos = firstPart.pos.y;
  for(var i = 1; i < n; i++) {
    var distance = Math.floor(Math.random() * 10) + 2;
    var angle = Math.random() * 2 * Math.PI;
    currentXPos = currentXPos + distance * Math.cos(angle);
    currentYPos = currentYPos + distance * Math.sin(angle);
    //store initial relative start/end points for making children
    var bodyPart = {
      mass: Math.floor(Math.random() * 10) + 3,
      pos: {x:currentXPos, y:currentYPos},
      initialRelativePos: {x:currentXPos - firstPart.pos.x, y:currentYPos - firstPart.pos.y},
      vel: {x:0, y:0}
      //color
      //spikes/plates if i'm into that
    }
    bodyPartsArray.push(bodyPart);
  }
  return bodyPartsArray;
};