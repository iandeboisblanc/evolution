import {findDistance, limitPositions, chooseOne} from './helpers/general'
import {checkIfPartsIncluded, checkIfPartsConnected} from './helpers/bodyparts'
import {applyLimbForces, updateBodyPartPositions} from './helpers/movement'

// setTimeout(animate, 1000);
// setInterval(collectStats, 10000);
// setInterval(function() {
//   killEves();
//   Eves.push(deriveEveData(chooseOne(Eves)));
//   generateEves();
// }, 10000);

//setInterval(saveStateToDB, 10000)

// function animate() {
//   setInterval( function() {
//     applyLimbForces();
//     updateBodyPartPositions();
//   }, settings.stepTime);
// }
