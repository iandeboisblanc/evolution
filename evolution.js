//settings
var settings = {
  stepTime: 5,
  eveCount: 20,
  width: window.innerWidth - 40,
  height: window.innerHeight - 40,
}

Eves = [];

//helpful things
var random = Math.random;
var max = Math.max;
var min = Math.min;
var floor = Math.floor;
var sqrt = Math.sqrt;
var pow = Math.pow;
var sin = Math.sin;
var cos = Math.cos;
var atan = Math.atan;
var log10 = Math.log10;
var findDistance = function(pos1, pos2) {
  return sqrt(pow(pos2.x - pos1.x, 2) + pow(pos2.y - pos1.y, 2));
}
var limitPositions = function(x,y,r) {
  x = max(r, min(x, (settings.width - r)));
  y = max(r, min(y, (settings.height - r)));
  return [x,y];
}

function drawEve(data) {
  //draws Eve with data
  //return element
  console.log(data);
  var eve = document.createElementNS('http://www.w3.org/2000/svg','g');

  d3.select(eve)
    .attr('class','eve')
    .append('circle')
    .attr('cx',data.startPos.x).attr('cy',data.startPos.y)
    .attr('r',data.bodyParts[0].mass);
  
  var yPos = data.startPos.y;
  var currentXPos = data.startPos.x;
  var lastXPos = currentXPos;
  //if distance between starting x and wall are less than 50, 
    //draw it on oneside, 
  // else, 
    //draw it on the otehr
  for(var i = 0; i < data.limbs.length; i++) {
    lastXPos = currentXPos;
    currentXPos += data.limbs[i].length;
    //tack on body part
    d3.select(eve)
      .append('line')
      .attr('x1', lastXPos).attr('y1', yPos)
      .attr('x2', currentXPos).attr('y2', yPos);
    d3.select(eve)
      .append('circle')
      .attr('cx', currentXPos).attr('cy', yPos)
      .attr('r', data.bodyParts[i+1].mass);
  }
  return eve;
};

//INIT:
createBoard();
populateData();
generateEves();

function createBoard() {
  d3.select('body').selectAll('svg')
    .data([{width:settings.width, height:settings.height}])
    .enter()
    .append('svg')
    .attr('class', 'board')
    .attr('width', settings.width)
    .attr('height', settings.height);
}

function createEveData(proto) {
  var data = {};
  data.id = floor(random() * 10000000000);
  if(proto) {
    //build off existing
    //select a quality
    //if relevant, select a subquality
  } else {
    data.bodyParts = [];
    // var bodyPartCount = floor(random() * 4) + 1;
    var bodyPartCount = 3;
    for(var i = 0; i < bodyPartCount; i++) {
      var bodyPart = {};
      bodyPart.mass = floor(random() * 10) + 3; 
      //color
      //spikes/plates if i'm into that
      data.bodyParts.push(bodyPart);
    }
    //count of limbs? Can they be freely attached without two nodes?
    data.limbs = [];
    for(var i = 1; i < bodyPartCount; i++) {
      var limb = {};
      limb.connections = [i-1, i];
      limb.length = floor(random() * 5) + 2 + data.bodyParts[i-1].mass + data.bodyParts[i].mass;
      //angle of connection?
      //phase of movement?
      //magnitude of movement? (springiness)
      //speed of movement?
      //color?
      data.limbs.push(limb);
    }
    //speed?
    //color?
    //total mass?
    data.startPos = {x:floor(random() * settings.width), y:floor(random() * settings.height)};
  }
  return data;
}

function generateEves() {
  var d3Eves = d3.select('.board').selectAll('.eve')
    .data(Eves, function(d) { return d.id });
  //new ones:
  d3Eves.enter()
    .append(drawEve);
    //click handler for stats
}

function populateData() {
  for(var i = 0; i < settings.eveCount; i ++) {
    Eves.push(createEveData());
  }
}










