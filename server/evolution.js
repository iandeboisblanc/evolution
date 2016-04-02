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


//INIT:

createBoard();
populateData();
generateEves();
setTimeout(animate, 1000);
setInterval(collectStats, 10000);
setInterval(function() {
  killEves();
  Eves.push(deriveEveData(chooseOne(Eves)));
  generateEves();
}, 10000);

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

function 

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
            x:linkedPart.pos.x + distance * cos(angle), 
            y:linkedPart.pos.x + distance * cos(angle),
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


