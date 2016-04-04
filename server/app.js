var express = require('express');
var app = express();
var server = require('http').createServer(app);  
var PORT = process.env.PORT || 3000;
var runEves = require('./runEves');

app.listen(PORT);
console.log('Server listening on port', PORT);

var Eves = [];

runEves(Eves);

app.use(express.static(__dirname + '/../client'));

app.get('/api/eves', function(req, res) {
  res.status(200).send(Eves)
});

