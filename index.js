const express = require('express')
const compression = require('compression')
const Fuse = require('fuse.js')

const data = require('./data.json')

const app = express()

const fuse = new Fuse(data, {
  distance: 100,
  keys: ['title'],
  location: 0,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  shouldSort: true,
  threshold: 0.1,
  tokenize: true
})

app
  .set('port', (process.env.PORT || 8080))
  .set('host', (process.env.HOST || 'localhost'))
  .use(compression())
  .get('/v1/search/:q',
    (req, res, next) => {
      const query = req.params.q || ''

      const results = fuse.search(query)

      if (!Array.isArray(results) || !results.length) {
        return res
          .status(400)
          .json({
            message: 'No results for the search.'
          })
      }

      res
        .status(200)
        .json({
          results
        })
    },
    (err, req, res, next) => {
      res
        .status(422)
        .json({
          message: 'There was an issue with the request.'
        })
    }
  )

module.exports = app.listen(
  app.get('port'),
  app.get('host'),
  () => console.info(`RUNNING AT http://${app.get('host')}:${app.get('port')}.`)
)
