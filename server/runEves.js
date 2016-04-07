import settings from './helpers/settings'
import {findDistance, limitPositions, chooseOne, randomInt, getAvgPostion} from './helpers/general'
import {applyLimbForces, updateBodyPartPositions} from './helpers/movement'
import {createEveData, deriveEveData} from './helpers/eveCreation'
import {killEve, collectStats, saveStateToDB} from './helpers/lifeCycle'

var runEves = function(Eves, db) {
  //Create initial data:
  for(var i = 0; i < settings.eveCount; i ++) {
    Eves.push(createEveData(db));
  }

  //Animate:
  setInterval(() => {
    applyLimbForces(Eves);
    updateBodyPartPositions(Eves);
  }, settings.stepTime);

  //Selective Pressure:
  setInterval(() => {
    killEve(Eves, db);
    var eve = chooseOne(Eves);
    Eves.push(deriveEveData(eve, db));
  }, settings.killTime);

  setInterval(() => {
    collectStats(Eves);
  }, 10000);

  //setInterval(saveStateToDB, 10000)
  
}

module.exports = runEves;
