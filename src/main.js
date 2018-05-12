'use strict';

require('dotenv').config();

const path = require('path');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const Yadb = require('./yadb/ya-db');

// schemas and services
const MonsterService = require('./services/monsterService');
const MonsterStore = require('./stores/monsterStore');
const schema = buildSchema(require('./schema/monsters-schema'));

const PORT = process.env.PORT || 9966;
const app = express();

const db = new Yadb(path.resolve(process.cwd(), 'src/db/data'));
const monsterStore = new MonsterStore(db);
const monsterService = new MonsterService(monsterStore);

// TODO: actually make reolvers rather than resource getters.
// TODO: create a different way to get data...possibly employ
//       friends with beer as payment for hand coding...
const graphqlConfig = {
  schema,
  // rootValue: new QueryResolver(),
  rootValue: {
    // getMonsters: new ApiListResponse(),
    // getMonster: new Monster(),
    getMonsters({ limit, offset }) {
      return monsterService.getMonstersRange(limit, offset);
    },
    getMonster({ id }) {
      return monsterService.getMonsterById(id);
    },
  },
  context: {
    monsterStore,
  },
  graphiql: process.env !== 'production',
};

app.use(helmet());
app.use(compression());
app.use(cors());
app.use('/graphql', graphqlHTTP(graphqlConfig));

const server = app.listen(PORT, () => console.log('Monsters up on port', PORT));

module.exports = server;
