import {findDistance, limitPositions, chooseOne, randomInt, getAvgPostion} from './general'

module.exports = {

  killEve: (Eves) => {
    var slowest = 0;
    for(var i = 0; i < Eves.length; i++) {
      var eveSpeed = Eves[i].stats.distanceTraveled / Eves[i].stats.timeSinceBirth;
      var smallestSpeed = Eves[slowest].stats.distanceTraveled / Eves[slowest].stats.timeSinceBirth;
      if(eveSpeed < smallestSpeed) {
        slowest = i;
      }
    }
    Eves.splice(slowest,1);
  },

  collectStats: (Eves) => {
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
  },

  saveStateToDB: (Eves) => {

  }
}
