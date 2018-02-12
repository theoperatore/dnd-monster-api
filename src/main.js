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

const PORT = process.env.PORT || 9966;
const app = express();

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const graphqlConfig = {
  schema,
  rootValue: {
    hello: () => 'world',
  },
  graphiql: process.env !== 'production',
};

app.use(helmet());
app.use(compression());
app.use(cors());
app.use('/graphql', graphqlHTTP(graphqlConfig));

const server = app.listen(PORT, () => console.log('Monsters up on port', PORT));

module.exports = server;
