import settings from './helpers/settings'
import {findDistance, limitPositions, chooseOne, randomInt, getAvgPostion} from './helpers/general'
import {applyLimbForces, updateBodyPartPositions} from './helpers/movement'
import {createEveData, deriveEveData} from './helpers/eveCreation'
import {killEve, collectStats, saveStateToDB} from './helpers/lifeCycle'

var runEves = function(Eves) {

  //Create initial data:
  for(var i = 0; i < settings.eveCount; i ++) {
    Eves.push(createEveData());
  }

  //Animate:
  setInterval(() => {
    applyLimbForces(Eves);
    updateBodyPartPositions(Eves);
  }, settings.stepTime)

  //Selective Pressure:
  setInterval(() => {
    killEve(Eves);
    var eve = chooseOne(Eves);
    Eves.push(deriveEveData(eve));
  }, settings.killTime)

  // setInterval(collectStats, 10000);

  //setInterval(saveStateToDB, 10000)
  
}

module.exports = runEves;
