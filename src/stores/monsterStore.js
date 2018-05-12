'use strict';

const Monster = require('../schema/Monster');

class MonsterStore {
  constructor(db) {
    this.db = db;
  }

  getTotalMonsterCount() {
    return this.db.getTotal();
  }

  // returns an array of Monster objects that are in range
  // starting from the offset provided.
  getMonstersRange(limit, offset) {
    return this.db
      .readRange(limit, offset)
      .then(monsters => monsters.map(m => new Monster(m)));
  }

  // return a promise that resolves to a single monster given the monster
  // id.
  // throws if the monster is not found.
  getMonsterById(id) {
    return this.db.findFirst(id).then(monster => monster? new Monster(monster) : null);
  }
}

module.exports = MonsterStore;
