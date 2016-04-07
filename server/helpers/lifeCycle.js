import {findDistance, limitPositions, chooseOne, randomInt, getAvgPosition} from './general'

module.exports = {

  killEve: (Eves, db) => {
    var slowest = 0;
    for(var i = 0; i < Eves.length; i++) {
      var eveSpeed = Eves[i].stats.distanceTraveled / Eves[i].stats.cyclesSinceBirth;
      var smallestSpeed = Eves[slowest].stats.distanceTraveled / Eves[slowest].stats.cyclesSinceBirth;
      if(eveSpeed < smallestSpeed) {
        slowest = i;
      }
    }
    var eve = Eves.splice(slowest,1)[0];
    db.Eve.update({
      killedAt: new Date()
    }, {
      where: {id: eve.id}
    })
    .catch((err) => {
      console.error('Error setting killed date:', err);
    });
  },

  collectStats: (Eves) => {
    for(var i = 0; i < Eves.length; i++) {
      var eve = Eves[i];
      var pos = getAvgPosition(eve);
      var distance = findDistance(pos, eve.stats.currentPos);
      eve.stats.distanceTraveled += distance;
      eve.stats.cyclesSinceBirth += 1;
      // console.log(eve.id, 'avg speed is', eve.stats.distanceTraveled / eve.stats.cyclesSinceBirth);
    }
  },

  saveStateToDB: (Eves) => {

  }
}
