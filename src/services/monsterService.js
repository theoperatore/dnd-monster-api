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
      .catch(err => new ApiListResponse());
  }

  getMonsterById(id) {
    return this.monsterStore
      .getMonsterById(id)
      .then(monster => new ApiListResponse({ count: 1, monsters: [monster] }))
      .catch(err => new ApiListResponse());
  }
}

module.exports = MonsterService;
