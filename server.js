// init project
const pkg = require('./package'),
      express = require('express'),
      compression = require('compression'),
      app = express(),
      randomWord = require('random-word'),
      Negotiator = require('negotiator')

const REALLY_SMALL_WORD = 2,
      REALLY_BIG_PALENDROME = 9, // seems "rotavator" is the longest one in our word corpus
      REALLY_BIG_ISOGRAM = 15,
      REALLY_BIG_WORD = 25,
      BASE_10 = 10

// add some neat response headers
app.use('*', (request, response, next) => {
  response.header({
    'X-Powered-By': 'Glitch',
    'Access-Control-Allow-Origin': '*'
  })
  next()
})

app.use(compression())

// cache our static content
app.use(express.static('public', { maxage: '1d' }))

///
/// the routes
///
randomWordMiddleware ("/random-word",       REALLY_BIG_WORD)
randomWordMiddleware ("/random-isogram",    REALLY_BIG_ISOGRAM, isIsogram)
randomWordMiddleware ("/random-palendrome", REALLY_BIG_PALENDROME, isPalendrome)
// totes can add any other routes on any other predicates 😂

function isIsogram(word) {
  /* global Set */
  return word.length === (new Set(word)).size
}

function isPalendrome(word) {
  return word.split('').reverse().join('') == word;
}

///
/// kinder error handling for ajaxers
///
app.use('*', (err, req, res, next) => {
  if (req.xhr) {
    console.error(err.stack)
    res.status(500).send('uh oh!')
  } else {
    next(err)
  }
})

/*
 * random word middleware. Renders a random word matching the given filter
 *  accepts min and max on the query string
 * 
 * - route: the route on which to listen
 * - defMax: the default maximum length, min must be less than this
 * - filter: only words for which this function returns true will be generated (default is "match all")
 *
 */
function randomWordMiddleware (route, defMax, filter) {
  app.use(route, (request, response, next) => {
    let min = parseInt(request.query.min, BASE_10) || 0,
        max = parseInt(request.query.max, BASE_10) || defMax
    if (min > max || max < REALLY_SMALL_WORD || min > defMax) {
      response.status(400).send('really?')
    } else {
      _wordFn(min, max, filter)
        .then(word => _render(word, request, response))
        .catch(next)
    }
  })
}

/*
 * Content-negotiating word renderer. Understands:
 *  - html (for e.g., slack embeds)
 *  - json (for e.g., jquery)
 *  - text
 */
function _render(word, req, res) {
  res.header({'Cache-Control': 'no store'})
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

/*
 * Random word generator. 
 *
 * - min: minimum length of generated word
 * - max: maximum length of generated word
 * - filter: default is "match all"
 */
function _wordFn(min, max, filter) {
  filter = filter || (val => true)
  return new Promise((resolve, reject) => {
    var word = randomWord()
    while (word.length < min || word.length > max || !filter(word)) {
      word = randomWord()
    }
    resolve(word)
  })
}

///
/// listen for requests :)
///
app.listen(process.env.PORT, function() {
  console.log(`⚓️🚀 Now running ${pkg.name} v${pkg.version} on node ${process.version}! ⚓️🚀`)
})
