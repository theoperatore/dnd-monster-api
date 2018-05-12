'use strict';

const path = require('path');
const fse = require('fs-extra');
const cloneDbSource = require('./cloneDbSource');
const convertYamlToJson = require('./convertYamlToJson');
const convertMdToJson = require('./convertMdToJson');
const utils = require('./utils');

const BESTIARY_URL = 'https://github.com/chisaipete/bestiary.git';

(async () => {
  try {
    // clone repo
    // access _posts directory
    const pathToRawMdDir = await cloneDbSource(BESTIARY_URL);

    // convert all jekyll posts to json
    const frontMatterParsedJsons = await convertYamlToJson(pathToRawMdDir);
    // const frontMatterParsedJsons = await convertYamlToJson('/Users/al/projects/dnd-projects/dnd-monster-api/rawDb/_posts');

    // further convert each json's content markdown to html
    // parse the html to json schema
    // (the secret sauce and probably where most errors will occur)
    const fullJsonFiles  = await convertMdToJson(frontMatterParsedJsons);

    // save json files for use in some fashion.
    utils.info('writing reference files...');
    const destinationPath = path.resolve(__dirname, 'data');
    await fse.ensureDir(destinationPath);
    await fse.emptyDir(destinationPath);

    await Promise.all(
      fullJsonFiles.map((file, idx) =>
        fse.writeJson(
          path.resolve(destinationPath, `${idx}-${file.id}.json`),
          file,
          { spaces: 2 }
        )
      )
    );

    utils.success('Done!');
  } catch (error) {
    utils.error(error);
    process.exit(1);
  }
})();
