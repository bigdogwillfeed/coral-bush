// init project
var express = require('express'),
    app = express(),
    randomWord = require('random-word');

const REALLY_BIG_ISOGRAM = 15,
      REALLY_BIG_WORD = 25,
      REALLY_REALLY_BIG_WORD = 100,
      BASE_10 = 10;


app.head("/", function (request, response) {
  response.send('ok');
});

app.use(express.static('public'));

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/random-word', function (request, response) {
  var min = parseInt(request.query.min, BASE_10) || 0,
      max = parseInt(request.query.max, BASE_10) || REALLY_REALLY_BIG_WORD;
  if (min > max || min > REALLY_BIG_WORD) {
    response.status(400).send('really?');
  } else {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.send(getWord(min, max));
  }
});

app.get('/random-isogram', function (request, response) {
  var min = parseInt(request.query.min, BASE_10) || 0,
      max = parseInt(request.query.max, BASE_10) || REALLY_REALLY_BIG_WORD;
  if (min > max || min > REALLY_BIG_ISOGRAM) {
    response.status(400).send('really?');
  } else {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.send(getIsogram(min, max));
  }
});

function getWord(min, max) {
  var word = randomWord();
  while (word.length < min || word.length > max) {
    word = randomWord();
  }
  return word;
}

function getIsogram(min, max) {
  var word = getWord(min, max);
  while (!isIsogram(word)) {
    word = getWord(min, max);
  }
  return word;
}

function isIsogram(word) {
  return word.length === (new Set(word)).size;
}

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});