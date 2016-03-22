//settings
var settings = {
  stepTime: 50,
  eveCount: 20,
  width: window.innerWidth - 40,
  height: window.innerHeight - 40,
}

Eves = [];

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

//INIT:

createBoard();
populateData();
generateEves();
setTimeout(animate, 1000);
setInterval(collectStats, 10000);
setInterval(killEves, 10000);

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
    console.log(data.limbs[i]);
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

function createEveData(proto) {
  var data = {};
  data.id = 'eve' + floor(random() * 10000000000);
  data.stats = {
    distanceTraveled: 0,
    timeSinceBirth: 0,
    generation: 1,
    ancestors: []
  }
  if(proto) {
    //build off existing
    //select a quality
    //if relevant, select a subquality
  } else {
    //make body parts, setting distance a random (small) limbish length apart
    //generate the limbs from the distances and random connections
    data.bodyParts = [];

    var firstPart = {
      mass: floor(random() * 10) + 3,
      pos: {x:floor(random() * settings.width), y:floor(random() * settings.height)},
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
      var bodyPart = {
        mass: floor(random() * 10) + 3,
        pos: {x:currentXPos, y:currentYPos},
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
      var length = findDistance(data.bodyParts[b0].pos,data.bodyParts[b1].pos);
      console.log('length:',length);
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
    //add a random few more limbs
  }
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

  d3.select('.board').selectAll('.eve')
    .data(Eves, function(d) { return d.id })
    .exit()
    .remove();
}



