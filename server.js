/* global Set */

// init project
var express = require('express'),
    app = express(),
    randomWord = require('random-word')

const REALLY_SMALL_WORD = 2,
      REALLY_BIG_ISOGRAM = 15,
      REALLY_BIG_WORD = 25,
      REALLY_REALLY_BIG_WORD = 100,
      BASE_10 = 10


app.use(express.static('public'))

app.get("/", (request, response) => {
  response.sendFile(__dirname + '/views/index.html')
})

randomWordMiddleware ("/random-word",    wordFn(),          REALLY_BIG_WORD)
randomWordMiddleware ("/random-isogram", wordFn(isIsogram), REALLY_BIG_ISOGRAM)

function randomWordMiddleware (route, fn, defMax) {
  app.use(route, (request, response, next) => {
    var min = parseInt(request.query.min, BASE_10) || 0,
        max = parseInt(request.query.max, BASE_10) || defMax
    if (min > max || max < REALLY_SMALL_WORD || min > defMax) {
      response.status(400).send('really?')
    } else {
      fn(min, max).then(word => {
        response.setHeader('Access-Control-Allow-Origin', '*')
        response.send(word)
      })
      .catch(next)
    }
  })
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
  return word.length === (new Set(word)).size
}

// listen for requests :)
var listener = app.listen(process.env.PORT, () => {
  console.log(`Your node ${process.version} app is listening on port ${listener.address().port}`)
})
