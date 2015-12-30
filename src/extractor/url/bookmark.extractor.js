'use strict';

const fs         = require('fs'),
      logger     = require('../../helper').logger,
      errors     = require('../../helper').errors,
      hash       = require('../../helper').hash,
      validators = require('../../helper').validators,
      thumbnail  = require('../../helper').thumbnail,
      request    = require('../../helper').request;

/**
 * Bookmark extractor.
 * @module url
 */
module.exports = {
  /**
   * Extract thumbnail of an online HTML document.
   * @param {Document} doc
   * @return {Promise} Promise of the document with extracted content.
   */
  extract: function(doc) {
    logger.debug('Using Bookmark extractor.');
    doc.origin = doc.origin.substring(10);
    if (!validators.isURL(doc.origin)) {
      return Promise.reject(new errors.BadRequest('URL not valid: ' + doc.origin));
    }

    return new Promise(function(resolve, reject) {
      request.head(doc.origin, function(err, res) {
        if (err) {
          return reject(err);
        }
        const contentType = res.headers['content-type'];
        if (!/text\/html/.test(contentType)) {
          return reject(new errors.BadRequest('Target document is not a regular HTML page.'));
        }
        return thumbnail.page(doc.origin)
          .then(function(thumbnailFile) {
            logger.debug('Page thumbnailed: ' + thumbnailFile);
            if (!doc.title) {
              doc.title = doc.doc.origin.replace(/.*?:\/\//g, '');
            }
            doc.contentType = 'text/html';
            doc.attachments.push({
              key: hash.hashUrl(doc.origin),
              stream: fs.createReadStream(thumbnailFile),
              contentType: 'image/png'
            });
            return Promise.resolve(doc);
          })
        .then(resolve, reject);
      });
    });
  },

  /**
   * Detect if the document origin is a cwbookmarkDailymotion URL.
   * @param {Document} doc
   * @return {Boolean} True if the URL is a bookmark
   */
  detect: function(doc) {
    return doc.origin.lastIndexOf('bookmark://', 0) === 0;
  }
};