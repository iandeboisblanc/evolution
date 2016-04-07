//settings
var settings = {}
var Eves = [];

//INIT:
// HTTPRequest.get('http://159.203.249.253/api/state', function(status, headers, content) {
HTTPRequest.get('http://localhost:3000/api/state', function(status, headers, content) {
  var body = JSON.parse(content);
  settings = body.settings;
  Eves = body.Eves;

  renderBoard();
  renderEves();

  setInterval(function() {
    applyLimbForces();
    updateBodyPartPositions();
  }, settings.stepTime);
  
  
  setInterval(function() {
    killEves();
    Eves.push(deriveEveData(chooseOne(Eves)));
    renderEves();
  }, settings.killTime);

  setInterval(collectStats, 10000);
});

//FUNCTIONS:
function renderBoard() {
  d3.select('body').selectAll('svg')
    .data([{width:settings.width, height:settings.height}])
    .enter()
    .append('svg')
    .attr('class', 'board')
    .attr('width', settings.width)
    .attr('height', settings.height);
}

function renderEves() {
  var d3Eves = d3.select('.board').selectAll('.eve')
    .data(Eves, function(d) { return d.id });
  //new ones:
  d3Eves.enter()
    .append(drawEve);
}

function drawEve(data) {
  var eve = document.createElementNS('http://www.w3.org/2000/svg','g');
  var eveId = 'eve' + data.id;
  d3.select(eve)
    .attr('class','eve')
    .attr('id', eveId);
  //if distance between starting x and wall are less than 50, 
    //draw it on oneside, 
  // else, 
    //draw it on the other

  // Render limbs:
  for(var i = 0; i < data.limbs.length; i++) {
    var b0 = data.bodyParts[data.limbs[i].connections[0]];
    var b1 = data.bodyParts[data.limbs[i].connections[1]];
    d3.select(eve)
      .append('line')
      .attr('x1', b0.pos.x).attr('y1', b0.pos.y)
      .attr('x2', b1.pos.x).attr('y2', b1.pos.y)
      .attr('class', 'part')
      .attr('id', eveId + 'l' + i)
  }
  
  // Render body parts:
  for(var i = 0; i < data.bodyParts.length; i ++) {
    var bodyPart = data.bodyParts[i];
    d3.select(eve)
      .append('circle')
      .attr('cx', bodyPart.pos.x).attr('cy', bodyPart.pos.y)
      .attr('r', bodyPart.mass)
      .attr('class', 'part')
      .style('fill', bodyPart.color)
      .attr('id', eveId + 'b' + (i));
  }

  // Apply click handler
  d3.select(eve)
    .on('click', function(d,i) {
      d.beingDragged = true;
      console.log('Stats for eve: ' + d.id + '\n' +
      'Generation: ' + d.stats.generation + '\n' +
      'Distance Travelled: ' + d.stats.distanceTraveled + '\n' +
      'Avg Speed: ' + ((d.stats.distanceTraveled / d.stats.cyclesSinceBirth) || 0));
  });

  return eve;
};

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
        var theta = Math.atan(yPosDiff / xPosDiff);
      }
      if (xPosDiff >= 0) {
        force *= -1;
      }
      var movementFactor = 1;
      if(limb.growing) {
        movementFactor = 0.5;
      }
      var dVx0 = force / b0.mass * Math.cos(theta);
      var dVy0 = force / b0.mass * Math.sin(theta);
      var dVx1 = -force / b1.mass * Math.cos(theta) * movementFactor;
      var dVy1 = -force / b1.mass * Math.sin(theta) * movementFactor;
      b0.vel.x = Math.min( 20, Math.max( b0.vel.x + dVx0, -20 ));
      b0.vel.y = Math.min( 20, Math.max( b0.vel.y + dVy0, -20 ));
      b1.vel.x = Math.min( 20, Math.max( b1.vel.x + dVx1, -20 ));
      b1.vel.y = Math.min( 20, Math.max( b1.vel.y + dVy1, -20 ));
    }
  }
}

function updateBodyPartPositions() {
  for(var i = 0; i < Eves.length; i++) {
    var eve = Eves[i];
    for(var j = 0; j < eve.bodyParts.length; j++) {
      var bodyPart = eve.bodyParts[j];

      //set new positions:
      bodyPart.pos.x += bodyPart.vel.x;
      bodyPart.pos.y += bodyPart.vel.y;
      
      //redirect if hitting edge of screen:
      if(bodyPart.pos.x <= bodyPart.mass || bodyPart.pos.x >= settings.width - bodyPart.mass) {
        bodyPart.pos.x = limitPositions(bodyPart.pos.x, 1, bodyPart.mass)[0];
        bodyPart.vel.x = -1 * bodyPart.vel.x;
      }
      if(bodyPart.pos.y <= bodyPart.mass || bodyPart.pos.y >= settings.height - bodyPart.mass) {
        bodyPart.pos.y = limitPositions(1, bodyPart.pos.y, bodyPart.mass)[1];
        bodyPart.vel.y = -1 * bodyPart.vel.y;
      }

      //render new body part positions:
      d3.select('#eve' + eve.id + 'b' + j)
        .attr('cx', bodyPart.pos.x).attr('cy', bodyPart.pos.y);
    }

    //render new limb positions:
    for(var k = 0; k < eve.limbs.length; k++) {
      var b0 = eve.bodyParts[eve.limbs[k].connections[0]];
      var b1 = eve.bodyParts[eve.limbs[k].connections[1]];
      d3.select('#eve' + eve.id + 'l' + k)
        .attr('x1', b0.pos.x).attr('y1', b0.pos.y)
        .attr('x2', b1.pos.x).attr('y2', b1.pos.y);
    }
  }
}

function killEves() {
  var slowest = 0;
  for(var i = 0; i < Eves.length; i++) {
    var eveSpeed = (Eves[i].stats.distanceTraveled / Eves[i].stats.cyclesSinceBirth) || 0;
    var smallestSpeed = (Eves[slowest].stats.distanceTraveled / Eves[slowest].stats.cyclesSinceBirth) || 0;
    if(eveSpeed < smallestSpeed) {
      slowest = i;
    }
  }

  Eves.splice(slowest,1);

  //Remove from board
  var elementsToRemove = [];
  var killEve = d3.select('.board').selectAll('.eve')
    .data(Eves, function(d) { return d.id })
    .exit()
    .remove();

  // var partsToRemove = killEve.selectAll('.part')[0];
  // partsToRemove.push(killEve);
  // var counter = partsToRemove.length;
  // var removePiece = function(queue) {
  //   var part = d3.select(queue.splice(0,1)[0]);
  //   part.remove();
  //   while(counter > 0) {
  //     counter--;
  //     setTimeout(function() {
  //       removePiece(queue);
  //     },100)
  //   }
  // }
  
  // removePiece(partsToRemove);
    // .remove();
  // would be great if i could remove a piece at a time

}

function deriveEveData(proto) {
  var data = JSON.parse(JSON.stringify(proto));
  data.id = 'eve' + randomInt(10000000000);
  var ancestors = proto.stats.ancestors ? proto.stats.ancestors.concat(proto) : [proto];
  data.stats = {
    distanceTraveled: 0,
    cyclesSinceBirth: 0,
    generation: proto.stats.generation + 1,
    ancestors: ancestors
  };

  var newPos = {x:randomInt(settings.width - 40) + 20, y:randomInt(settings.height - 40) + 20} 
  data.bodyParts[0].pos = newPos;
  for(var i = 1; i < data.bodyParts.length; i++) {
    data.bodyParts[i].pos.x = data.bodyParts[0].pos.x + data.bodyParts[i].initialRelativePos.x;
    data.bodyParts[i].pos.y = data.bodyParts[0].pos.y + data.bodyParts[i].initialRelativePos.y;
  }

  //reset to initial body positions?  

  var bodyOrLimb = chooseOne('body','limb');
  if(bodyOrLimb === 'body') {
    var property = chooseOne('mass','count','position');
    if(randomInt(1000) === 18) {
      property = 'color';
    }
    if(property === 'mass') {
      var bodyPart = chooseOne(data.bodyParts);
      var posOrNeg = chooseOne(-1,1);
      bodyPart.mass = Math.max(1, bodyPart.mass + posOrNeg * (randomInt(2) + 1));
    }
    if(property === 'count') {
      var moreOrLess = chooseOne('more', 'less');
      if(moreOrLess === 'more') {
        var index = randomInt(data.bodyParts.length);
        var linkedPart = data.bodyParts[index];
        var distance = randomInt(10) + 2;
        var angle = Math.random() * 2 * Math.PI;
        var bodyPart = {
          mass: randomInt(10) + 3,
          pos: {
            x:linkedPart.pos.x + distance * Math.cos(angle), 
            y:linkedPart.pos.y + distance * Math.sin(angle)
          },
          initialRelativePos: {
            x:linkedPart.initialRelativePos.x + distance * Math.cos(angle), 
            y:linkedPart.initialRelativePos.x + distance * Math.cos(angle),
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
          maxLength: length + randomInt(3),
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
      bodyPart.initialRelativePos.x = bodyPart.initialRelativePos.x + xDir * (randomInt(3) + 1);
      bodyPart.initialRelativePos.y = bodyPart.initialRelativePos.y + yDir * (randomInt(3) + 1);
    }
    if(property === 'color') {
      var bodyPart = chooseOne(data.bodyParts);
      bodyPart.color = 'rgb(' + randomInt(256) + ',' + randomInt(256) + ',' + randomInt(256) + ')';
    }
  }
  if(bodyOrLimb === 'limb') {
    var property = chooseOne('maxLength', 'count');
    if(property === 'maxLength') {
      var limb = chooseOne(data.limbs);
      var plusOrMinus = chooseOne([-1,1]);
      limb.maxLength = limb.maxLength + plusOrMinus * (randomInt(3) + 1); 
    }
    if (property === 'count') {
      var moreOrLess = chooseOne('more', 'less');
      if(moreOrLess === 'more') {
        var possibleConnections = getJunctions(data.bodyParts).map(function(junction) {
          return JSON.stringify(junction);
        });
        for(var i = 0; i < data.limbs.length; i++) {
          var connectionsString = JSON.stringify(data.limbs[i].connections);
          var substrIndex = possibleConnections.indexOf(connectionsString);
          if(substrIndex > -1) {
            possibleConnections.splice(substrIndex,1);
          }
        }
        var newConnection = chooseOne(possibleConnections);
        if(newConnection) {
          newConnection = JSON.parse(newConnection);
          var b0 = data.bodyParts[newConnection[0]];
          var b1 = data.bodyParts[newConnection[1]];
          var length = findDistance(b0.pos, b1.pos);
          var limb = {
            connections: newConnection,
            currentLength: length,
            growing: true,
            initialLength: length,
            maxLength: length + randomInt(3),
          };
          data.limbs.push(limb);
        }
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


function collectStats() {
  for(var i = 0; i < Eves.length; i++) {
    var eve = Eves[i];
    var pos = getAvgPosition(eve);
    var distance = findDistance(pos, eve.stats.currentPos);
    eve.stats.distanceTraveled += distance;
    eve.stats.cyclesSinceBirth += 1;
  }
}
