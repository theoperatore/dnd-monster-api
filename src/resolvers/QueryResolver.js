const ApiListResponseResolver = require('./ApiListResponseResolver');

class QueryResolver {
  getMonster(root, context) {
    return context.monsterStore
      .getMonsterById(root.id)
      .catch(() => null);
  }

  getMonsters(root, context) {
    return context.monsterStore
      .getMonstersRange(root.limit, root.offset)
      .then(monsters => new ApiListResponseResolver(monsters))
      .catch(() => new ApiListResponseResolver());
  }

  searchMonstersByName(root, context) {
    return context.monsterStore
      .findMonstersByName(root.name)
      .catch(() => []);
  }

  getRandomMonster(root, context) {
    return context.monsterStore
      .getRandomMonster()
      .catch(() => null);
  }
};

module.exports = QueryResolver;
