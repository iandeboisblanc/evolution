import express from 'express';
import http from 'http';
import settings from './settings';
import Eves from './eves';

const app = express();
const server = http.createServer(app);

var PORT = process.env.PORT || 3000;

// CORS handling
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

app.listen(PORT);
console.log('Server listening on port', PORT);

// Routes
app.use(express.static(__dirname + '/../client'));

app.get('/api/state', function(req, res) {
  // const currentState = eves.getState();
  res.status(200).send({ Eves, settings });
});
