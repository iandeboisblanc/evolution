//settings
var settings = {}
var Eves = [];

HTTPRequest.get('http://localhost:3000/api/state', function(status, headers, content) {
  var body = JSON.parse(content);
  settings = body.settings;
  Eves = body.Eves;

  //INIT:
  createBoard();
  generateEves();
  animate();
  setInterval(collectStats, 10000);
  setInterval(function() {
    killEves();
    Eves.push(deriveEveData(chooseOne(Eves)));
    generateEves();
  }, settings.killTime);
});


//helpful things
var random = Math.random;
var max = Math.max;
var min = Math.min;
var floor = Math.floor;
var sqrt = Math.sqrt;
var pow = Math.pow;
var sin = Math.sin;
var cos = Math.cos;
var atan = Math.atan;
var log10 = Math.log10;
var findDistance = function(pos1, pos2) {
  return sqrt(pow(pos2.x - pos1.x, 2) + pow(pos2.y - pos1.y, 2));
}
var limitPositions = function(x,y,r) {
  x = max(r, min(x, (settings.width - r)));
  y = max(r, min(y, (settings.height - r)));
  return [x,y];
}
var chooseOne = function(args) {
  args = Array.prototype.slice.call(arguments);
  if(args.length === 1 && typeof Array.isArray(args[0])) {
    return args[0][floor(random() * args[0].length)]
  }
  return args[floor(random() * args.length)];
}


//FUNCTIONS:

function drawEve(data) {
  //draws Eve with data
  //return element
  var eve = document.createElementNS('http://www.w3.org/2000/svg','g');

  d3.select(eve)
    .attr('class','eve')
    .attr('id', data.id);
  //if distance between starting x and wall are less than 50, 
    //draw it on oneside, 
  // else, 
    //draw it on the other

  for(var i = 0; i < data.limbs.length; i++) {
    //tack on body part
    var b0 = data.bodyParts[data.limbs[i].connections[0]];
    var b1 = data.bodyParts[data.limbs[i].connections[1]];
    d3.select(eve)
      .append('line')
      .attr('x1', b0.pos.x).attr('y1', b0.pos.y)
      .attr('x2', b1.pos.x).attr('y2', b1.pos.y)
      .attr('id', data.id + 'l' + i);
  }
  for(var i = 0; i < data.bodyParts.length; i ++) {
    var bodyPart = data.bodyParts[i];
    d3.select(eve)
      .append('circle')
      .attr('cx', bodyPart.pos.x).attr('cy', bodyPart.pos.y)
      .attr('r', bodyPart.mass)
      .attr('id', data.id + 'b' + (i));
  }
  return eve;
};


function createBoard() {
  d3.select('body').selectAll('svg')
    .data([{width:settings.width, height:settings.height}])
    .enter()
    .append('svg')
    .attr('class', 'board')
    .attr('width', settings.width)
    .attr('height', settings.height);
}

function createEveData() {
  var data = {};
  data.id = 'eve' + floor(random() * 10000000000);
  data.stats = {
    distanceTraveled: 0,
    timeSinceBirth: 0,
    generation: 1,
    ancestors: []
  }
  data.bodyParts = [];

  var firstPart = {
    mass: floor(random() * 10) + 3,
    pos: {x:floor(random() * settings.width), y:floor(random() * settings.height)},
    initialRelativePos: {x:0, y:0},
    vel: {x:0, y:0}
  }
  data.bodyParts.push(firstPart);
  //count of limbs? Can they be freely attached without two nodes?

  var bodyPartCount = floor(random() * 5) + 2;
  var currentXPos = firstPart.pos.x;
  var currentYPos = firstPart.pos.y;
  var xSum = currentXPos;
  var ySum = currentYPos;
  for(var i = 1; i < bodyPartCount; i++) {
    var distance = floor(random() * 10) + 2;
    var angle = random() * 2 * Math.PI;
    currentXPos = currentXPos + distance * cos(angle);
    currentYPos = currentYPos + distance * sin(angle);
    xSum += currentXPos;
    ySum += currentYPos;
    //store initial relative start/end points for making children
    var bodyPart = {
      mass: floor(random() * 10) + 3,
      pos: {x:currentXPos, y:currentYPos},
      initialRelativePos: {x:currentXPos - firstPart.pos.x, y:currentYPos - firstPart.pos.y},
      vel: {x:0, y:0}
      //color
      //spikes/plates if i'm into that
    }
    data.bodyParts.push(bodyPart);
  }

  data.stats.currentPos = {x: xSum / data.bodyParts.length, y: ySum / data.bodyParts.length};

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
}

function deriveEveData(proto) {
  var data = JSON.parse(JSON.stringify(proto));
  data.id = 'eve' + floor(random() * 10000000000);
  data.stats = {
    distanceTraveled: 0,
    timeSinceBirth: 0,
    generation: proto.stats.generation + 1,
    ancestors: proto.stats.ancestors.concat(proto)
  };
  
  //reset to initial body positions?  

  var bodyOrLimb = chooseOne('body','limb');
  if(bodyOrLimb === 'body') {
    var property = chooseOne('mass','count','position');
    if(property === 'mass') {
      var bodyPart = chooseOne(data.bodyParts);
      var posOrNeg = chooseOne(-1,1);
      bodyPart.mass = bodyPart.mass + posOrNeg * (floor(random() * 1 + 1));
    }
    if(property === 'count') {
      var moreOrLess = chooseOne('more', 'less');
      if(moreOrLess === 'more') {
        var index = floor(random() * data.bodyParts.length);
        var linkedPart = data.bodyParts[index];
        var distance = floor(random() * 10) + 2;
        var angle = random() * 2 * Math.PI;
        var bodyPart = {
          mass: floor(random() * 10) + 3,
          pos: {
            x:linkedPart.pos.x + distance * cos(angle), 
            y:linkedPart.pos.y + distance * sin(angle)
          },
          initialRelativePos: {
            x:linkedPart.initialRelativePos.x + distance * cos(angle), 
            y:linkedPart.initialRelativePos.x + distance * cos(angle),
          },
          vel: {x:0, y:0}
        };
        var newIndex = data.bodyParts.length;
        data.bodyParts.push(bodyPart);
        
        //add limb
        var length = findDistance(data.bodyParts[index].pos, data.bodyParts[newIndex].pos);
        var limb = {
          connections: [index, newIndex],
          currentLength: length,
          growing: true,
          initialLength: length,
          maxLength: length + floor(random() * 3),
        };
        data.limbs.push(limb);
      }
      if(moreOrLess === 'less') {
        //when removing, need to make sure it stays together
        //need to reset indices of all others in connections
      }
    }
    if(property === 'position') {
      var bodyPart = chooseOne(data.bodyParts);
      var xDir = chooseOne(-1,1);
      var yDir = chooseOne(-1,1);
      bodyPart.initialRelativePos.x = bodyPart.initialRelativePos.x + xDir * floor(random() * 3 + 1);
      bodyPart.initialRelativePos.y = bodyPart.initialRelativePos.y + yDir * floor(random() * 3 + 1);
    }
  }
  if(bodyOrLimb === 'limb') {
    var property = chooseOne('maxLength', 'count');
    if(property === 'maxLength') {
      var limb = chooseOne(data.limbs);
      var plusOrMinus = chooseOne([-1,1]);
      limb.maxLength = limb.maxLength + plusOrMinus * floor(random() * 3 + 1); 
    }
    if (property === 'count') {
      var moreOrLess = chooseOne('more', 'less');
      if(moreOrLess === 'more') {
        var possibleConnections = [];
        for(var i = 0; i < data.bodyParts.length; i++) {
          for(var j = i + 1; j < data.bodyParts.length; j++) {
            possibleConnections.push([i,j]);
          }
        }
        //REMOVE ONES THAT ARE TAKEN
      }
      if(moreOrLess === 'less') {
        //NEED TO MAKE SURE IT'S STILL CONNECTED
      }
    }
  }
  for(var i = 0; i < data.limbs.length; i++) {
    //set lengths?
  }

  //need to set stats.currentPos
  data.stats.currentPos = {x: data.bodyParts[0].pos.x, y: data.bodyParts[0].pos.y}
  
return data;
}

function checkIfAllIncluded(connections, partCount) {
  var nodes = {};
  connections.forEach(function(conn) {
    nodes[conn[0]] = true;
    nodes[conn[1]] = true;
  });
  return Object.keys(nodes).length === partCount;
}

function checkIfConnected(array) {
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
}

function generateEves() {
  var d3Eves = d3.select('.board').selectAll('.eve')
    .data(Eves, function(d) { return d.id });
  //new ones:
  d3Eves.enter()
    .append(drawEve);
    //click handler for stats
}

function populateData() {
  for(var i = 0; i < settings.eveCount; i ++) {
    Eves.push(createEveData());
  }
}

function animate() {
  setInterval( function() {
    applyLimbForces();
    updateBodyPartPositions();
  }, settings.stepTime);
}

function applyLimbForces() {
  for(var i = 0; i < Eves.length; i++) {
    var eve = Eves[i];
    for(var j = 0; j < eve.limbs.length; j++) {
      var limb = eve.limbs[j];
      var b0 = eve.bodyParts[limb.connections[0]];
      var b1 = eve.bodyParts[limb.connections[1]];
      var displacement, force;
      limb.currentLength = findDistance(b0.pos, b1.pos)
      if(limb.growing) {
        displacement = limb.maxLength - limb.currentLength;
        force = displacement * 0.1 - 1.5;
        if(limb.currentLength >= limb.maxLength) {
          limb.growing = false;
        }
      } else {
        displacement = limb.initialLength - limb.currentLength;
        force = displacement * 0.1 + 1.5;
        if(limb.currentLength <= limb.initialLength) {
          limb.growing = true;
        }
      }
      var xPosDiff = b1.pos.x - b0.pos.x;
      var yPosDiff = b1.pos.y - b0.pos.y;
      if(xPosDiff === 0) {
        var theta = Math.PI;
      }
      else {
        var theta = atan(yPosDiff / xPosDiff);
      }
      if (xPosDiff >= 0) {
        force *= -1;
      }
      var movementFactor = 1;
      if(limb.growing) {
        movementFactor = 0.5;
      }
      var dVx0 = force / b0.mass * cos(theta);
      var dVy0 = force / b0.mass * sin(theta);
      var dVx1 = -force / b1.mass * cos(theta) * movementFactor;
      var dVy1 = -force / b1.mass * sin(theta) * movementFactor;
      b0.vel.x = min( 20, max( b0.vel.x + dVx0, -20 ));
      b0.vel.y = min( 20, max( b0.vel.y + dVy0, -20 ));
      b1.vel.x = min( 20, max( b1.vel.x + dVx1, -20 ));
      b1.vel.y = min( 20, max( b1.vel.y + dVy1, -20 ));
    }
  }
}

function updateBodyPartPositions() {
  for(var i = 0; i < Eves.length; i++) {
    var eve = Eves[i];
    for(var j = 0; j < eve.bodyParts.length; j++) {
      var bodyPart = eve.bodyParts[j];
      bodyPart.pos.x += bodyPart.vel.x;
      //check if offscreen
      if(bodyPart.pos.x <= bodyPart.mass || bodyPart.pos.x >= settings.width - bodyPart.mass) {
        bodyPart.pos.x = limitPositions(bodyPart.pos.x, 1, bodyPart.mass)[0];
        bodyPart.vel.x = -1 * bodyPart.vel.x;
      }
      bodyPart.pos.y += bodyPart.vel.y;
      if(bodyPart.pos.y <= bodyPart.mass || bodyPart.pos.y >= settings.height - bodyPart.mass) {
        bodyPart.pos.y = limitPositions(1, bodyPart.pos.y, bodyPart.mass)[1];
        bodyPart.vel.y = -1 * bodyPart.vel.y;
      }
      //check if offscreen
      d3.select('#' + eve.id + 'b' + j)
        .attr('cx', bodyPart.pos.x).attr('cy', bodyPart.pos.y);
    }
    for(var k = 0; k < eve.limbs.length; k++) {
      var b0 = eve.bodyParts[eve.limbs[k].connections[0]];
      var b1 = eve.bodyParts[eve.limbs[k].connections[1]];
      d3.select('#' + eve.id + 'l' + k)
        .attr('x1', b0.pos.x).attr('y1', b0.pos.y)
        .attr('x2', b1.pos.x).attr('y2', b1.pos.y);
    }
  }
}

function collectStats() {
  for(var i = 0; i < Eves.length; i++) {
    var eve = Eves[i];
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

    var distance = findDistance(pos, eve.stats.currentPos);
    eve.stats.distanceTraveled += distance;
    eve.stats.timeSinceBirth += 1;
    console.log(eve.id, 'avg speed is', eve.stats.distanceTraveled / eve.stats.timeSinceBirth);
  }
}

function killEves() {
  var smallest = Eves.reduce(function(smallest, eve) {
    var eveSpeed = eve.stats.distanceTraveled / eve.stats.timeSinceBirth;
    var smallestSpeed = smallest.stats.distanceTraveled / smallest.stats.timeSinceBirth;
    return eveSpeed < smallestSpeed ? eve : smallest;
  });
  var slowest = 0;
  for(var i = 0; i < Eves.length; i++) {
    var eveSpeed = Eves[i].stats.distanceTraveled / Eves[i].stats.timeSinceBirth;
    var smallestSpeed = Eves[slowest].stats.distanceTraveled / Eves[slowest].stats.timeSinceBirth;
    if(eveSpeed < smallestSpeed) {
      slowest = i;
    }
  }

  Eves.splice(slowest,1);

  var killEve = d3.select('.board').selectAll('.eve')
    .data(Eves, function(d) { return d.id })
    .exit()
    .remove();
  // would be great if i could remove a piece at a time

}


