import settings from './helpers/settings'
import {findDistance, limitPositions, chooseOne, randomInt, getAvgPostion} from './helpers/general'
import {applyLimbForces, updateBodyPartPositions} from './helpers/movement'
import {createEveData, deriveEveData} from './helpers/eveCreation'

//Create initial data:
var Eves = [];
for(var i = 0; i < settings.eveCount; i ++) {
  Eves.push(createEveData());
}

//Animate:
setInterval(() => {
  applyLimbForces(Eves);
  updateBodyPartPositions(Eves);
} ,settings.stepTime)

// setTimeout(animate, 1000);
// setInterval(collectStats, 10000);
// setInterval(function() {
//   killEves();
//   Eves.push(deriveEveData(chooseOne(Eves)));
//   generateEves();
// }, 10000);

//setInterval(saveStateToDB, 10000)
