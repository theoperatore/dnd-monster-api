const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
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

function getMonster(call, callback) {
  console.log('getMonster request', call.request);
  const monster = {
    id: call.request.id,
  };
  callback(null, new Monster(monster));
}

function getMonsters(call) {
  console.log('getMonsters stream request', call.request);
  const monster = {
    id: 'abc123',
  };
  call.write(new Monster(monster));
  call.end();
}

const monsterApiServer = new grpc.Server();

monsterApiServer
  .addService(monsterApi.MonsterApiService.service, {
    getMonster,
    getMonsters,
  });

const result = monsterApiServer.bind('localhost:1337', grpc.ServerCredentials.createInsecure());
monsterApiServer.start();

console.log('bind result', result);
