'use strict';

class ApiListResponseResolver {
  constructor(monsters = []) {
    this.monsters = monsters;
  }

  count() {
    return this.monsters.length;
  }

  total(fieldParams, context) {
    return context.monsterStore.getTotalMonsterCount();
  }
}

module.exports = ApiListResponseResolver;
