import Debug from 'debug';

const debug = Debug('rm2:lib:universal');

const getCollection = endpoint => endpoint.split('/')[1];

class UniversalLib {
  constructor(main) {
    this.db = main.db;
  }

  search(endpoint, query, pages = {}, fields = {}) {
    const collection = getCollection(endpoint);
    debug(`.search called ${collection}`);
    return new Promise((resolve, reject) => {
      const p = {
        limit: pages.limit || 50,
        page: pages.page || 1,
        sort: pages.sorting,
      };
      if (typeof this.db[collection].paginate === 'undefined') {
        return resolve({
          docs: [],
          limit: 1,
          count: 0,
          page: 1,
          totalPages: 0,
          error: true,
        });
      }
      return this.db[collection].paginate(pages.q || {}, fields, p)
        .then(docs => resolve(docs))
        .catch(err => reject(err));
    });
  }

  today(endpoint) {
    debug('.today called: ');

    return new Promise((resolve, reject) => {
      const collection = getCollection(endpoint.replace('/today', ''));
      const p = {
        limit: 500,
        page: 1,
        sorting: '_id:desc',
      };

      const today = new Date();
      today.setHours(0, 0, 0);
      const tomorow = new Date(this.moment(today).add(1, 'days'));

      this.db[collection].paginate({ $and: [{ added: { $gte: today } }, { added: { $lte: tomorow } }] }, {}, p)
        .then(docs => resolve(docs))
        .catch(err => reject(err));
    });// end promise
  }

  insert(endpoint, params) {
    const collection = getCollection(endpoint);
    params.added = new Date();
    debug(`.insert called: ${JSON.stringify(params)}`);

    return new Promise((resolve, reject) => {
      this.db[collection].insert(params, (err, doc) => (err ? reject(err) : resolve(doc)));
    });
  }

  findOne(endpoint, query, props) {
    debug('findOne called: ', endpoint, query, props);
    const collection = getCollection(endpoint);
    if (query._id) query._id = this.db.ObjectId(query._id);
    return new Promise((resolve, reject) => {
      this.db[collection].findOne(query, props, (err, doc) => (err ? reject(err) : resolve(doc)));
    });
  }

  insertOrCount(endpoint, params) {
    const collection = getCollection(endpoint);
    params.count = 1;

    return new Promise((resolve, reject) => {
      const q = {};
      q[params._criterial] = params._unique;
      delete params._criterial;
      delete params._unique;

      this.db[collection].findOne(q, {}, (err, doc) => {
        if (err) return reject(err);
        if (doc === null) {
          return this.insert(endpoint, params)
            .then(data => resolve(data))
            .catch(err2 => reject(err2));
        }
        return this.update(endpoint, doc._id, Object.assign({}, params, { count: doc.count + 1 }))
          .then(data => resolve(data))
          .catch(err3 => reject(err3));
      });
    });
  }

  remove(endpoint, _id) {
    const collection = getCollection(endpoint);
    return new Promise((resolve, reject) => {
      this.db[collection].remove({ _id: this.db.ObjectId(_id) }, (err, doc) => (err ? reject(err) : resolve(doc)));
    });
  }

  removeAll(endpoint, query = { a: 1 }) {
    const collection = getCollection(endpoint);
    return new Promise((resolve, reject) => {
      this.db[collection].remove(query, (err, doc) => (err ? reject(err) : resolve(doc)));
    });
  }

  update(endpoint, _id, data, opts = { updated: true, set: true }) {
    const collection = getCollection(endpoint);
    let query = {};
    if (opts.updated) data.updated = new Date();
    if (opts.set) query = { $set: data };
    else query = data;
    debug('.update called:', endpoint, _id, data);

    return new Promise((resolve, reject) => {
      this.db[collection].update({ _id: this.db.ObjectId(_id) }, query, (err, doc) => (err ? reject(err) : resolve(doc)));
    });
  }

  count(endpoint, query) {
    debug('count called: ', endpoint, query);
    const collection = getCollection(endpoint);
    return new Promise((resolve, reject) => {
      this.db[collection].find(query).count((err, doc) => {
        if (err) return reject(err);
        return resolve(doc);
      });
    });
  }

  modify(collection, _id, query) {
    debug('modify called:', collection, _id, query);
    return new Promise((resolve, reject) => {
      this.db[collection].update({ _id: this.db.ObjectId(_id) }, query, (err, doc) => (err ? reject(err) : resolve(doc)));
    });
  }
}

export default UniversalLib;
