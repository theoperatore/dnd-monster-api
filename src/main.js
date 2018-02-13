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

// schemas
const schema = buildSchema(require('./schema/monsters-schema'));
const Monster = require('./schema/Monster');

const PORT = process.env.PORT || 9966;
const app = express();

const db = level(path.resolve(process.cwd(), 'src/db/builtDb'), { valueEncoding: 'json' });

function getMonsterRange(limit, offset) {
  return new Promise((resolve, reject) => {
    const out = {
      count: 0,
      monsters: [],
    };
    db.createValueStream({ limit, gte: `monster:${offset}`, lte: `monster:${offset + limit}` })
      .on('data', monster => {
        // console.log(monster);
        out.count += 1;
        out.monsters.push(new Monster(monster));
      })
      .on('close', () => resolve(out))
      .on('error', reject);
  });
}

const graphqlConfig = {
  schema,
  rootValue: {
    monsters: ({ id, limit, offset }) => {
      if (id) {
        return db.get(id).then(monster => {
          return {
            count: 1,
            monsters: [
              new Monster(monster),
            ],
          };
        }).catch(err => {
          console.log('monster not found', err);
          return {
            count: 0,
            monsters: [],
          };
        });
      }

      return getMonsterRange(limit, offset);
    },
    // monsters: ({ id, limit, offset }) => ({
    //   count: 761,
    //   monsters: [],
    // }),
  },
  graphiql: process.env !== 'production',
};

app.use(helmet());
app.use(compression());
app.use(cors());
app.use('/graphql', graphqlHTTP(graphqlConfig));

const server = app.listen(PORT, () => console.log('Monsters up on port', PORT));

module.exports = server;
