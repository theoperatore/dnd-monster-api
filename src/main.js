'use strict';

require('dotenv').config();

const path = require('path');
const level = require('level');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

// schemas and services
const MonsterService = require('./services/monsterService');
const schema = buildSchema(require('./schema/monsters-schema'));

const PORT = process.env.PORT || 9966;
const app = express();

const db = level(path.resolve(process.cwd(), 'src/db/builtDb'), { valueEncoding: 'json' });
const monsterService = new MonsterService(db);

const graphqlConfig = {
  schema,
  rootValue: {
    getMonsters: ({ id, limit, offset }) => {
      return id
        ? monsterService.getMonsterById(id)
        : monsterService.getMonstersRange(limit, offset);
    },
  },
  graphiql: process.env !== 'production',
};

app.use(helmet());
app.use(compression());
app.use(cors());
app.use('/graphql', graphqlHTTP(graphqlConfig));

const server = app.listen(PORT, () => console.log('Monsters up on port', PORT));

module.exports = server;
