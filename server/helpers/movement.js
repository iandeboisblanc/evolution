import settings from './../settings'
import {findDistance, limitPositions, chooseOne, randomInt, getAvgPostion} from './general'

module.exports = {
  applyLimbForces: (Eves) => {
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
        } else {
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
  },

  updateBodyPartPositions: (Eves) => {
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

        //NEEEDS TO GO ON CLIENT ONLY??
        // d3.select('#' + eve.id + 'b' + j)
        //   .attr('cx', bodyPart.pos.x).attr('cy', bodyPart.pos.y);
        //
      }

      for(var k = 0; k < eve.limbs.length; k++) {
        var b0 = eve.bodyParts[eve.limbs[k].connections[0]];
        var b1 = eve.bodyParts[eve.limbs[k].connections[1]];

        //NEEDS TO GO ON CLIENT ONLY??
        // d3.select('#' + eve.id + 'l' + k)
        //   .attr('x1', b0.pos.x).attr('y1', b0.pos.y)
        //   .attr('x2', b1.pos.x).attr('y2', b1.pos.y);
        //
      }
    }
  }
}