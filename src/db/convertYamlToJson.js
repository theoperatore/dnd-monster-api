'use strict';

const fs = require('fs');
const path = require('path');
const m2j = require('markdown-to-json');
const utils = require('./utils');

function getFileNames(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) =>
      err
        ? reject(err)
        : resolve(files)
      );
  });
}

async function convertMdToJson(postsDirectory) {
  utils.info('converting _posts front-matter...', postsDirectory);
  const files = await getFileNames(postsDirectory);
  const pathResolvedFiles = files.map(file => path.resolve(postsDirectory, file));
  const stringJson = m2j.parse(
    pathResolvedFiles,
    {
      content: true,
      // don't generate a preview...just give me the content!
      width: 0,
    }
  );

  const parsedJson = JSON.parse(stringJson);
  return Object.keys(parsedJson).map(key => parsedJson[key]);
}

module.exports = convertMdToJson;
