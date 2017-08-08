import settings from './settings'
import { findDistance, limitPositions, chooseOne, randomInt, getAvgPostion } from './helpers/general'
import { applyLimbForces, updateBodyPartPositions } from './helpers/movement'
import { createEveData, deriveEveData } from './helpers/eveCreation'
import { killEve, collectStats } from './helpers/lifeCycle'

const Eves = [];
for (let i = 0; i < settings.eveCount; i++) {
  Eves.push(createEveData());
}

//Animate:
setInterval(() => {
  applyLimbForces(Eves);
  updateBodyPartPositions(Eves);
}, settings.stepTime);

//Selective Pressure:
setInterval(() => {
  killEve(Eves);
  var eve = chooseOne(Eves);
  Eves.push(deriveEveData(eve));
}, settings.killTime);

setInterval(() => {
  collectStats(Eves);
}, 2000);

module.exports = Eves;
