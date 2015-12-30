'use strict';

const logger = require('../helper').logger,
      path   = require('path');

// Dynamic loading Controllers...
const controllers = {};
require('fs').readdirSync(__dirname).forEach((file) => {
  if (/^[a-z_]+\.ctrl\.js$/.test(file)) {
    const name = path.basename(file, '.ctrl.js');
    logger.debug('Loading %s connector controller...', name);
    controllers[name] = require(path.join(__dirname, file))();
  }
});

module.exports = controllers;

