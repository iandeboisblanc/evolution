var express = require('express');
var app = express();
var server = require('http').createServer(app);  
var runEves = require('./runEves');
var settings = require('./helpers/settings');

var PORT = process.env.PORT || 3000;

// CORS handling
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

// Connect to DB
var db = require('./db');

app.listen(PORT);
console.log('Server listening on port', PORT);

var Eves = [];
setTimeout(runEves.bind(null, Eves, db),1000);

app.use(express.static(__dirname + '/../client'));

// Routes
app.get('/api/state', function(req, res) {
  res.status(200).send({Eves:Eves, settings:settings});
});
