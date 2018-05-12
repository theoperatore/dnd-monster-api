'use strict';

const ApiListResponse = require('../schema/ApiListResponse');

class MonsterService {
  constructor(monsterStore) {
    this.monsterStore = monsterStore;
  }

  getMonstersRange(limit, offset) {
    return this.monsterStore
      .getMonstersRange(limit, offset)
      .then(monsters => new ApiListResponse({
        count: monsters.length,
        monsters,
      }))
      .catch(() => new ApiListResponse());
  }

  getMonsterById(id) {
    return this.monsterStore
      .getMonsterById(id)
      .catch(err => null);
  }
}

module.exports = MonsterService;
