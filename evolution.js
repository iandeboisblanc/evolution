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

//FUNCTIONS:

function drawEve(data) {
  //draws Eve with data
  //return element
  console.log(data);
  var eve = document.createElementNS('http://www.w3.org/2000/svg','g');

  d3.select(eve)
    .attr('class','eve')
    .attr('id', data.id)
    .append('circle')
    .attr('cx', data.bodyParts[0].pos.x).attr('cy', data.bodyParts[0].pos.y)
    .attr('r', data.bodyParts[0].mass)
    .attr('id', data.id + 'b0');
  //if distance between starting x and wall are less than 50, 
    //draw it on oneside, 
  // else, 
    //draw it on the otehr
  for(var i = 0; i < data.limbs.length; i++) {
    //tack on body part
    var b0 = data.bodyParts[i];
    var b1 = data.bodyParts[i + 1];
    d3.select(eve)
      .append('line')
      .attr('x1', b0.pos.x).attr('y1', b0.pos.y)
      .attr('x2', b1.pos.x).attr('y2', b1.pos.y)
      .attr('id', data.id + 'l' + i);
    d3.select(eve)
      .append('circle')
      .attr('cx', b1.pos.x).attr('cy', b1.pos.y)
      .attr('r', b1.mass)
      .attr('id', data.id + 'b' + (i + 1));
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

  if(proto) {
    //build off existing
    //select a quality
    //if relevant, select a subquality
  } else {
    data.bodyParts = [];
    data.limbs = [];
    var firstPart = {
      mass: floor(random() * 10) + 3,
      pos: {x:floor(random() * settings.width), y:floor(random() * settings.height)},
      vel: {x:0, y:0}
    }
    data.bodyParts.push(firstPart);
    //count of limbs? Can they be freely attached without two nodes?

    var bodyPartCount = floor(random() * 4) + 2;
    var yPos = firstPart.pos.y;
    var currentXPos = firstPart.pos.x;
    for(var i = 1; i < bodyPartCount; i++) {
      
      var limb = {
        connections: [i-1, i],
        currentLength: floor(random() * 20) + 10,
        growing: false,
        //angle of connection?
        //phase of movement?
        //magnitude of movement? (springiness)
        //speed of movement?
        //color?
      };
      limb.initialLength = limb.currentLength;
      limb.maxLength = limb.initialLength + floor(random() * 5);

      currentXPos = currentXPos + limb.initialLength;
      
      var bodyPart = {
        mass: floor(random() * 10) + 3,
        pos: {x:currentXPos, y:yPos},
        vel: {x:0, y:0}
        //color
        //spikes/plates if i'm into that
      }

      data.limbs.push(limb);
      data.bodyParts.push(bodyPart);
    }
    //speed?
    //color?
    //total mass?
  }
  return data;
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
    updateLimbPositions();
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
        force = displacement * 0.1;
        if(limb.currentLength >= limb.maxLength) {
          limb.growing = false;
        }
      } else {
        displacement = limb.initialLength - limb.currentLength;
        force = displacement * 0.1;
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
      var dVx0 = force / b0.mass * cos(theta);
      var dVy0 = force / b0.mass * sin(theta);
      var dVx1 = -force / b1.mass * cos(theta);
      var dVy1 = -force / b1.mass * sin(theta);
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
      bodyPart.pos.y += bodyPart.vel.y;
      //check if offscreen
      d3.select('#' + eve.id + 'b' + j)
        .attr('cx', bodyPart.pos.x)
        .attr('cy', bodyPart.pos.y)
    }
  }
}






