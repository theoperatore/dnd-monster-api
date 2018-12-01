const path = require('path');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const Yadb = require('../yadb/ya-db');
const MonsterStore = require('../stores/monsterStore');
const Monster = require('../resolvers/MonsterResolver');

const packageDefintion = protoLoader.loadSync(
  `${__dirname}/monster_api.proto`,
  {
    enums: String,
    defaults: true,
  },
);
const protoDescriptor = grpc.loadPackageDefinition(packageDefintion);
const monsterApi = protoDescriptor.grpc.monsterapi;
const db = new Yadb(path.resolve(process.cwd(), 'src/db/data'));
const monsterStore = new MonsterStore(db);

function getMonster(call, callback) {
  console.log('getMonster request', call.request);
  const { id } = call.request;
  monsterStore.getMonsterById(id)
    .then(maybeMonster => {
      if (!maybeMonster) {
        const notFound = {
          code: 404,
          message: `MonsterId "${id}" not found`,
        };
        return callback(notFound);
      }
      callback(null, maybeMonster);
    })
    .catch(error => callback(error));
}

function getMonsters(call, callback) {
  console.log('getMonsters stream request', call.request);
  const { limit, offset } = call.request;
  Promise.all([
    monsterStore.getTotalMonsterCount(),
    monsterStore.getMonstersRange(limit, offset),
  ])
  .then(results => {
    const [total, monsters] = results;
    callback(null, { count: monsters.length, total, monsters });
  })
  .catch(error => callback({ code: 500, message: error.message }));
}

const delay = ms => new Promise(r => setTimeout(r, ms));
function SearchMonstersByName(call) {
  const { name } = call.request;
  monsterStore.findMonstersByName(name)
    .then(monsters => {
      Promise.all(
        monsters.map(monster => {
          call.write({ match: monster});
          return delay(0);
        })
      )
      .then(() => call.end());
    })
    .catch(error => call.end({ code: 500, message: error.message }));
}

const monsterApiServer = new grpc.Server();

monsterApiServer
  .addService(monsterApi.MonsterApiService.service, {
    getMonster,
    getMonsters,
    SearchMonstersByName,
  });

const result = monsterApiServer.bind('127.0.0.1:1337', grpc.ServerCredentials.createInsecure());
monsterApiServer.start();

console.log('bind result', result);
