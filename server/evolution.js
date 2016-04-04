
//INIT:

createBoard();
populateData();
generateEves();
setTimeout(animate, 1000);
setInterval(collectStats, 10000);
setInterval(function() {
  killEves();
  Eves.push(deriveEveData(chooseOne(Eves)));
  generateEves();
}, 10000);

//FUNCTIONS:

function drawEve(data) {
  //draws Eve with data
  //return element
  var eve = document.createElementNS('http://www.w3.org/2000/svg','g');

  d3.select(eve)
    .attr('class','eve')
    .attr('id', data.id);
  //if distance between starting x and wall are less than 50, 
    //draw it on oneside, 
  // else, 
    //draw it on the other

  for(var i = 0; i < data.limbs.length; i++) {
    //tack on body part
    var b0 = data.bodyParts[data.limbs[i].connections[0]];
    var b1 = data.bodyParts[data.limbs[i].connections[1]];
    d3.select(eve)
      .append('line')
      .attr('x1', b0.pos.x).attr('y1', b0.pos.y)
      .attr('x2', b1.pos.x).attr('y2', b1.pos.y)
      .attr('id', data.id + 'l' + i);
  }
  for(var i = 0; i < data.bodyParts.length; i ++) {
    var bodyPart = data.bodyParts[i];
    d3.select(eve)
      .append('circle')
      .attr('cx', bodyPart.pos.x).attr('cy', bodyPart.pos.y)
      .attr('r', bodyPart.mass)
      .attr('id', data.id + 'b' + (i));
  }
  return eve;
};


function drawBoard() {
  d3.select('body').selectAll('svg')
    .data([{width:settings.width, height:settings.height}])
    .enter()
    .append('svg')
    .attr('class', 'board')
    .attr('width', settings.width)
    .attr('height', settings.height);
} 

function generateEves() {
  var d3Eves = d3.select('.board').selectAll('.eve')
    .data(Eves, function(d) { return d.id });
  //new ones:
  d3Eves.enter()
    .append(drawEve);
    //click handler for stats
}

function animate() {
  setInterval( function() {
    applyLimbForces();
    updateBodyPartPositions();
  }, settings.stepTime);
}


  var killEve = d3.select('.board').selectAll('.eve')
    .data(Eves, function(d) { return d.id })
    .exit()
    .remove();
  // would be great if i could remove a piece at a time



