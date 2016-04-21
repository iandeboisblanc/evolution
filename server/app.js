var express = require('express');
var app = express();
var server = require('http').createServer(app);  
var runEves = require('./runEves');
var settings = require('./settings');

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
var db = require('./db/db.js');

app.listen(PORT);
console.log('Server listening on port', PORT);

var Eves = [];
setTimeout(runEves.bind(null, Eves, db),1000);

app.use(express.static(__dirname + '/../client'));

// Routes
app.get('/api/state', function(req, res) {
  res.status(200).send({Eves:Eves, settings:settings});
});

app.get('/api/eve/:id/ancestors', function(req, res) {
  var eveId = req.params.id;
  db.sequelize.query(
    'SELECT * FROM eves a' +
    ' JOIN eves b ON a.parent_id = b.id' +
    ' WHERE a.id = ?',
    {replacements: [eveId]}
  ).then((data) => {
    res.status(200).send(data[0]);
  }).catch((err) => {
    console.error('Error fetching ancestors:', err);
    res.status(500).send(err);
  });
});
