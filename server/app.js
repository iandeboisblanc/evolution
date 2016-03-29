var express = require('express');
var app = express();
var server = require('http').createServer(app);  
var PORT = process.env.PORT || 3000;

app.listen(PORT);
console.log('Server listening on port', PORT);

app.use(express.static(__dirname + '/../client'));

require('./utils/runEves');
