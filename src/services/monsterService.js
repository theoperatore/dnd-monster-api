'use strict';

const ApiListResponse = require('../schema/ApiListResponse');

class MonsterService {
  constructor(monsterStore) {
    this.monsterStore = monsterStore;
  }

  async getMonstersRange(limit, offset) {
    try {
      const monsters = await this.monsterStore.getMonstersRange(limit, offset);
      const total = await this.monsterStore.getTotalMonsterCount();
      return new ApiListResponse({
        count: monsters.length,
        total,
        monsters,
      });
    } catch (e) {
      return new ApiListResponse();
    }
  }

  getMonsterById(id) {
    return this.monsterStore
      .getMonsterById(id)
      .catch(err => null);
  }
}

module.exports = MonsterService;
