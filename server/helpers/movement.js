module.exports = {
  applyLimbForces: function(Eves) {
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
}