'use strict';

const MonsterResolver = require('../resolvers/MonsterResolver');

class MonsterStore {
  constructor(db) {
    this.db = db;
  }

  getTotalMonsterCount() {
    return this.db.getTotal();
  }

  // returns an array of MonsterResolver objects that are in range
  // starting from the offset provided.
  getMonstersRange(limit, offset) {
    return this.db
      .readRange(limit, offset)
      .then(monsters => monsters.map(m => new MonsterResolver(m)));
  }

  // return a promise that resolves to a single monster given the monster
  // id.
  // throws if the monster is not found.
  getMonsterById(id) {
    return this.db.findFirst(id).then(monster => monster? new MonsterResolver(monster) : null);
  }
}

module.exports = MonsterStore;
