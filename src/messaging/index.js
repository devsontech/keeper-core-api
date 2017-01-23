'use strict'

const logger = require('../helper').logger
const path = require('path')
const redis = require('../helper/redis')

const client = redis.createClient()

// Dynamic loading Messaging...
const messengers = {}
require('fs').readdirSync(__dirname).forEach((file) => {
  if (/^[a-z_]+\.messenger\.js$/.test(file)) {
    const name = path.basename(file, '.messenger.js')
    logger.debug('Loading %s messenger...', name)
    const Messenger = require(path.join(__dirname, file))
    messengers[name] = new Messenger(client)
  }
})

module.exports = messengers
