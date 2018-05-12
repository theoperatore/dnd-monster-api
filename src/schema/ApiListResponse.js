'use strict';

class ApiListResponse {
  constructor({ count = 0, monsters = [] } = {}) {
    this.count = count;
    this.monsters = monsters;
  }

  total(fieldParams, context) {
    return context.monsterStore.getTotalMonsterCount();
  }
}

module.exports = ApiListResponse;
