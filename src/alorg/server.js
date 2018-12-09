const path = require('path');
const alorg = require('@theoperatore/alorg-service');

const Yadb = require('../yadb/ya-db');
const MonsterStore = require('../stores/monsterStore');

const db = new Yadb(path.resolve(process.cwd(), 'src/db/data'));
const monsterStore = new MonsterStore(db);

(async () => {
  try {
    const service = await alorg.createService('dnd-monster-api');

    // get a random monster
    service.get('/random', async (stream, headers, callback) => {
      try {
        const monster = await monsterStore.getRandomMonster();
        callback(null, monster);
      } catch (error) {
        const output = { status: 503, message: error.message };
        callback(output, null);
      }
    });

    service.listen();
  } catch (error) {
    console.error(error);
  }
})();
