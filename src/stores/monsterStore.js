'use strict';

const Monster = require('../schema/Monster');

class MonsterStore {
  constructor(db) {
    this.db = db;
  }

  _inRange(num, min, max) {
    return num >= min && num < max;
  }

  // returns an array of Monster objects that are in range
  // starting from the offset provided.
  getMonstersRange(limit, offset) {
    const min = offset;
    const max = offset + limit;
    return new Promise((resolve, reject) => {
      const monsters = [];
      this.db.createValueStream()
        .on('data', monster => {
          if (this._inRange(monster._index, min, max)) {
            monsters.push(new Monster(monster));
          }
        })
        .on('close', () => resolve(monsters))
        .on('error', reject);
    });
  }

  // return a promise that resolves to a single monster given the monster
  // id.
  // throws if the monster is not found.
  getMonsterById(id) {
    return this.db.get(id).then(monster => new Monster(monster));
  }
}

module.exports = MonsterStore;
