const express = require('express')
const cors = require('cors')
const compression = require('compression')
const isEmpty = require('lodash/isEmpty')
const Fuse = require('fuse.js')

const data = require('./data.json')

const KEY_TO_SEARCH = process.env.KEY_TO_SEARCH || 'title'
const RESULTS_LIMIT = process.env.RESULTS_LIMIT || 5

const fuse = new Fuse(data, {
  distance: 100,
  keys: [KEY_TO_SEARCH],
  location: 0,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  shouldSort: true,
  threshold: 0.1,
  tokenize: true
})

const app = express()

app
  .set('port', (process.env.PORT || 8080))
  .set('host', (process.env.HOST || '0.0.0.0'))
  .disable('x-powered-by')
  .use(compression())
  .use(cors())
  .get('/v1/search/:q',
    (req, res, next) => {
      const query = req.params.q || ''

      const results = fuse.search(query, RESULTS_LIMIT)

      if (isEmpty(results)) {
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
