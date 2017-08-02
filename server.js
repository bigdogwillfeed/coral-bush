// init project
var express = require('express'),
    compression = require('compression'),
    app = express(),
    randomWord = require('random-word'),
    Negotiator = require('negotiator')

const REALLY_SMALL_WORD = 2,
      REALLY_BIG_ISOGRAM = 15,
      REALLY_BIG_WORD = 25,
      REALLY_REALLY_BIG_WORD = 100,
      BASE_10 = 10


app.use('*', (request, response, next) => {
  response.header({
    'X-Powered-By': 'Glitch',
    'Access-Control-Allow-Origin': '*'
  })
  next()
})

app.use(compression())

app.use(express.static('public', { maxage: '1d' }))

randomWordMiddleware ("/random-word",    wordFn(),          REALLY_BIG_WORD)
randomWordMiddleware ("/random-isogram", wordFn(isIsogram), REALLY_BIG_ISOGRAM)

app.use('*', (err, req, res, next) => {
  if (req.xhr) {
    console.error(err.stack)
    res.status(500).send('uh oh!')
  } else {
    next(err)
  }
})


function randomWordMiddleware (route, fn, defMax) {
  app.use(route, (request, response, next) => {
    var min = parseInt(request.query.min, BASE_10) || 0,
        max = parseInt(request.query.max, BASE_10) || defMax
    if (min > max || max < REALLY_SMALL_WORD || min > defMax) {
      response.status(400).send('really?')
    } else {
      fn(min, max)
        .then(word => render(word, request, response))
        .catch(next)
    }
  })
}

function render(word, req, res) {
  let negotiator = new Negotiator(req)
  switch (negotiator.mediaType(['text/html', 'text/plain', 'application/json'])) {
    case 'application/json': res.json(word); break;
    case 'text/html': res.send(`
<html>
  <head>
    <meta property="og:title" content="a web service for random words" />
    <meta property="og:description" content="${word}" />
  </head>
  <body>${word}</body>
</html>`); break;
    case 'text/plain': 
    default: res.type('text/plain'); res.send(word); break;
  }
}

function wordFn(predicate) {
  predicate = predicate || (val => true)
  return (min, max) => {
    return new Promise((resolve, reject) => {
      var word = randomWord()
      while (word.length < min || word.length > max || !predicate(word)) {
        word = randomWord()
      }
      resolve(word)
    })
  }
}

function isIsogram(word) {
  /* global Set */
  return word.length === (new Set(word)).size
}

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your node ${process.version} app is listening on port ${listener.address().port}`)
})
