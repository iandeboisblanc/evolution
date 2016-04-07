import settings from './settings'
import {findDistance, limitPositions, chooseOne, randomInt, getAvgPosition} from './general'

module.exports = {
  createEveData:(db) => {

    var data = {};
    data.stats = {
      distanceTraveled: 0,
      cyclesSinceBirth: 0,
      //stored in DB:
      generation: 1,
    }


    var bodyPartCount = randomInt(5) + 2;
    data.bodyParts = createNBodyParts(bodyPartCount, settings.width, settings.height);

    data.limbs = [];

    var possibleConnections = getJunctions(data.bodyParts);
    
    var allConnected = false;
    while(!allConnected && possibleConnections.length) {
      var randomIndex = randomInt(possibleConnections.length);
      var randomConnection = possibleConnections.splice(randomIndex,1)[0];
      var b0 = randomConnection[0];
      var b1 = randomConnection[1];
      var length = findDistance(data.bodyParts[b0].pos, data.bodyParts[b1].pos);
      var limb = {
        connections: randomConnection,
        currentLength: length,
        growing: true,
        initialLength: length,
        maxLength: length + randomInt(3),
        //phase of movement?
        //speed of movement?
        //color?
      };
      data.limbs.push(limb);
      var connections = data.limbs.map(function(limb) {
        return limb.connections;
      });

      allConnected = checkIfPartsIncluded(connections, data.bodyParts.length) 
        && checkIfPartsConnected(connections);
    }
    var moreLimbs = randomInt(possibleConnections.length);
    for(var i = 0; i < moreLimbs; i++) {
      var randomIndex = randomInt(possibleConnections.length);
      var randomConnection = possibleConnections.splice(randomIndex,1)[0];
      var b0 = randomConnection[0];
      var b1 = randomConnection[1];
      var length = findDistance(data.bodyParts[b0].pos, data.bodyParts[b1].pos);
      var limb = {
        connections: randomConnection,
        currentLength: length,
        growing: true,
        initialLength: length,
        maxLength: length + randomInt(3),
        //phase of movement?
        //speed of movement?
        //color?
      };
      data.limbs.push(limb);
    }
    data.stats.currentPos = getAvgPosition(data);

    //write to db
    db.Eve.create({
      parent_id: null,
      generation: 1,
    })
    .then(function(eve) {
      data.id = eve.dataValues.id;
    })
    .catch(function(err) {
      console.error('Error saving eve data to db:', err);
    })
    return data;
  },

  deriveEveData: (proto, db) => {
    var data = JSON.parse(JSON.stringify(proto));
    data.stats = {
      distanceTraveled: 0,
      cyclesSinceBirth: 0,
      //stored in DB:
      generation: proto.stats.generation + 1,
    };
    
    //reset to initial body positions?
    var newPos = {x:randomInt(settings.width - 40) + 20, y:randomInt(settings.height - 40) + 20} 
    data.bodyParts[0].pos = newPos;
    for(var i = 1; i < data.bodyParts.length; i++) {
      data.bodyParts[i].pos.x = data.bodyParts[0].pos.x + data.bodyParts[i].initialRelativePos.x;
      data.bodyParts[i].pos.y = data.bodyParts[0].pos.y + data.bodyParts[i].initialRelativePos.y;
    }  

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
          var partCount = data.bodyParts.length;
          for(var i = 0; i < data.limbs.length; i++) {
            var limbsCopy = JSON.parse(JSON.stringify(data.limbs));
            limbsCopy.splice(i,1);
            var connectionsArray = limbsCopy.map(function(limb) {
              return limb.connections;
            });
            if(checkIfPartsIncluded(connectionsArray, partCount) && checkIfPartsConnected(connectionsArray)) {
              data.limbs.splice(i,1);
              break;
            }
          }
        }
      }
    }

    data.stats.currentPos = getAvgPosition(data);

    db.Eve.create({
      parent_id: proto.id,
      generation: data.stats.generation,
    })
    .then(function(eve) {
      data.id = eve.dataValues.id;
    })
    .catch(function(err) {
      console.error('Error saving eve data to db:', err);
    })
    return data;
  }
}

function createNBodyParts(n, maxX, maxY) {
  var bodyPartsArray = [];
  var firstPart = {
    mass: randomInt(10) + 3,
    pos: {x:randomInt(maxX), y:randomInt(maxY)},
    initialRelativePos: {x:0, y:0},
    vel: {x:0, y:0},
    color: '#ffffff'
  }
  bodyPartsArray.push(firstPart);

  var currentXPos = firstPart.pos.x;
  var currentYPos = firstPart.pos.y;
  for(var i = 1; i < n; i++) {
    var distance = randomInt(10) + 2;
    var angle = Math.random() * 2 * Math.PI;
    currentXPos = currentXPos + distance * Math.cos(angle);
    currentYPos = currentYPos + distance * Math.sin(angle);
    //store initial relative start/end points for making children
    var bodyPart = {
      mass: randomInt(10) + 3,
      pos: {x:currentXPos, y:currentYPos},
      initialRelativePos: {x:currentXPos - firstPart.pos.x, y:currentYPos - firstPart.pos.y},
      vel: {x:0, y:0},
      color: '#ffffff'
      //spikes/plates if i'm into that
    }
    bodyPartsArray.push(bodyPart);
  }
  return bodyPartsArray;
};


function getJunctions(array) {
  var possibleConnections = [];
  for(var i = 0; i < array.length; i++) {
    for(var j = i + 1; j < array.length; j++) {
      possibleConnections.push([i,j]);
    }
  }
  return possibleConnections;
};

function checkIfPartsIncluded(connectionsArray, partCount) {
  var nodes = {};
  connectionsArray.forEach(function(conn) {
    nodes[conn[0]] = true;
    nodes[conn[1]] = true;
  });
  return Object.keys(nodes).length === partCount;
};

function checkIfPartsConnected(connectionsArray) {
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


