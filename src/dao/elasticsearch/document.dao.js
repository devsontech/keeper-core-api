'use strict'

const _ = require('lodash')
const AbstractMongodbDao = require('./common/abstract.dao')
const QueryBuilder = require('./common/query-builder')

/**
 * Document DAO.
 * @module document.dao
 */
class DocumentDao extends AbstractMongodbDao {
  constructor (client, index, useAsMainDatabaseEngine) {
    super(client, index, 'document')
    this.storeContent = useAsMainDatabaseEngine ? 'yes' : 'no'
  }

  getMapping () {
    return {
      properties: {
        title      : {type: 'string', store: 'yes'},
        content    : {type: 'string', store: this.storeContent},
        contentType: {type: 'string', store: 'yes', index: 'not_analyzed'},
        owner      : {type: 'string', store: 'yes', index: 'not_analyzed'},
        labels     : {type: 'string', store: 'yes', index: 'not_analyzed'},
        attachments: {type: 'object'},
        origin     : {type: 'string', store: 'yes'},
        ghost      : {type: 'boolean', store: 'yes'},
        date       : {type: 'date', store: 'yes', format: 'dateOptionalTime'}
      }
    }
  }

  buildFindQuery (query, params) {
    params = params || {}
    return new QueryBuilder()
    .exclude(['*.content', '*.contentType', '*.owner', '*.date'])
    .filtered(_.pick(query, ['owner', 'ghost']))
    .size(params.size)
    .from(params.from)
    .sort(params.order)
    .fulltext(query.q, ['title^5', 'content'])
    .debug()
    .build()
  }

  /**
   * Search documents.
   * @param {Object} query Search query.
   * @param {Object} params Search params.
   * @return {Array} the documents
   */
  search (query, params) {
    return this.client.search({
      index: this.index,
      type: this.type,
      body: this.buildFindQuery(query, params)
    }).then((data) => {
      // console.log(JSON.stringify(data, null, 2))
      const result = {}
      result.total = data.hits.total
      result.hits = this._decodeSearchResult(data)
      // console.log(JSON.stringify(result, null, 2))
      return Promise.resolve(result)
    })
  }
}

module.exports = DocumentDao
