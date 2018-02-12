'use strict';

const path = require('path');
const del = require('del');
const git = require('simple-git/promise')();
const utils = require('./utils');

// main export
async function cloneDbSource(repoUrl, destination = 'rawDb') {
  const pathToRepo = path.resolve(process.cwd(), destination);
  utils.info('cleaning...');
  await del(pathToRepo);
  utils.info('cloning:', repoUrl, '==>', pathToRepo);
  await git.clone(repoUrl, destination);
  return path.resolve(pathToRepo, '_posts');
}

module.exports = cloneDbSource;
