'use strict';

const ApiListResponse = require('../schema/ApiListResponse');
const Monster = require('../schema/Monster');

class MonsterService {
  constructor(db) {
    this.db = db;
  }

  _inRange(num, min, max) {
    return num >= min && num < max;
  }

  getMonstersRange(limit, offset) {
    const min = offset;
    const max = offset + limit;
    return new Promise((resolve, reject) => {
      const out = {
        count: 0,
        monsters: [],
      };
      this.db.createValueStream()
        .on('data', monster => {
          if (this._inRange(monster._index, min, max)) {
            out.count += 1;
            out.monsters.push(new Monster(monster));
          }
        })
        .on('close', () => resolve(new ApiListResponse(out)))
        .on('error', reject);
    });
  }

  getMonsterById(id) {
    return this.db.get(id).then(monster =>
      new ApiListResponse({ count: 1, monsters: [new Monster(monster)]})
    ).catch(err =>
      new ApiListResponse());
  }
}

module.exports = MonsterService;
