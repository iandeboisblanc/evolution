import { findDistance, limitPositions, chooseOne, randomInt, getAvgPosition } from './general'

module.exports = {

  killEve: (Eves) => {
    var loserIndex = 0;
    var worstScore;
    for(var i = 0; i < Eves.length; i++) {
      var eveSpeed = (Eves[i].stats.distanceTraveled / Eves[i].stats.cyclesSinceBirth) || 0;
      var score = eveSpeed * Math.pow(Eves[i].bodyParts.length, 0.75);
      if (!worstScore || score < worstScore) {
        loserIndex = i;
        worstScore = score;
      }
    }
    var eve = Eves.splice(loserIndex,1)[0];
  },

  collectStats: (Eves) => {
    for(var i = 0; i < Eves.length; i++) {
      var eve = Eves[i];
      var pos = getAvgPosition(eve);
      var distance = findDistance(pos, eve.stats.currentPos);
      eve.stats.distanceTraveled += distance;
      eve.stats.cyclesSinceBirth += 1;
      eve.stats.currentPos = pos;
    }
  }
}
