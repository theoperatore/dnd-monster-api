import path from 'path';
import fse from 'fs-extra';
import { cloneDbSource } from './cloneDbSource';
import { convertYamlToJson } from './convertYamlToJson';
import { createEntries } from './createEntry';
import * as utils from './utils';

const BESTIARY_URL = 'https://github.com/chisaipete/bestiary.git';

(async () => {
  try {
    // clone repo
    // access _creatures directory
    const pathToRawMdDir = await cloneDbSource(BESTIARY_URL);

    // convert all jekyll posts to json
    const frontMatterParsedJsons = await convertYamlToJson(pathToRawMdDir);
    const entries = await createEntries(frontMatterParsedJsons);

    // save json files for use in some fashion.
    utils.info('writing reference files...');
    const destinationPath = path.resolve(__dirname, 'data');
    await fse.ensureDir(destinationPath);
    await fse.emptyDir(destinationPath);

    await Promise.all(
      entries.map((file, idx) =>
        fse.writeJson(path.resolve(destinationPath, `${idx}-${file.id}.json`), file, { spaces: 2 })
      )
    );

    utils.success('Done!');
  } catch (error) {
    utils.error(error);
  }
})();
