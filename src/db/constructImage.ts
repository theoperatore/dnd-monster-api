import * as path from 'path';
import { JSDOM } from 'jsdom';
import request from 'request';
import * as fse from 'fs-extra';
import { CreaturePost } from './convertYamlToJson';

export type PropertyConstructorOptions = {
  requestImages: boolean;
};

type PropertyConstructor<T> = (
  post: CreaturePost,
  index: number,
  options?: PropertyConstructorOptions
) => Promise<T>;

type MonsterResource = {
  href: string;
  name: string;
  id: string;
};

function createGetMonsterList(): () => Promise<MonsterResource[]> {
  const IMAGE_MONSTER_LIST_ENDPOINT = 'https://www.aidedd.org/dnd-filters/monsters.php';
  let monsters: MonsterResource[] = [];
  let promise: Promise<JSDOM> | null = null;

  return async () => {
    if (!promise) {
      console.log('Getting all monsters...');
      promise = JSDOM.fromURL(IMAGE_MONSTER_LIST_ENDPOINT);
    }

    const dom = await promise;
    const anchors = dom.window.document.querySelectorAll<HTMLAnchorElement>('tr td > a');

    for (let i = 0; i < anchors.length; i++) {
      const monsterLink = anchors[i];
      const name = monsterLink.textContent;
      if (!name) continue;

      const id = name
        .toLowerCase()
        .replace(/\'+/g, '')
        .replace(/\/+/g, '')
        .split(' ')
        .join('_');

      monsters.push({
        id,
        name,
        href: monsterLink.href
      });
    }

    return monsters;
  };
}

async function findImageFromDOM(href: string) {
  try {
    const dom = await JSDOM.fromURL(href);
    const imgTag = dom.window.document.querySelector('amp-img') as HTMLImageElement;
    return imgTag ? imgTag.getAttribute('src') : null;
  } catch (error) {
    console.log('error equesing:', href);
    console.log(error);
    return null;
  }
}

async function getAndSaveImageData(imgUrl: string, destination: string) {
  return new Promise(resolve => {
    request(imgUrl)
      .on('error', err => {
        console.log('error getting ', imgUrl, err.message);
        resolve();
      })
      .pipe(fse.createWriteStream(destination))
      .on('close', resolve);
  });
}

const memoGetMonsterList = createGetMonsterList();

export const constructImage: PropertyConstructor<string | null> = async (
  post,
  index,
  options = { requestImages: false }
) => {
  // find existing data and image, if it exists,
  const id = post.name
    .trim()
    .toLowerCase()
    .replace(/\'+/g, '')
    .replace(/\/+/g, '')
    .split(' ')
    .join('_');

  const imgName = post.name
    .trim()
    .toLowerCase()
    .replace(/\'+/g, '')
    .replace(/\/+/g, '')
    .split(' ')
    .join('-');

  let imageOut = null;
  try {
    imageOut = require(path.resolve(__dirname, `./data/${index}-${id}.json`)).image;
  } catch (error) {
    imageOut = null;
  }

  // do this side effect
  if (options.requestImages) {
    const monsters = await memoGetMonsterList();
    const monster = monsters.find(m => m.id === id);
    if (monster) {
      const maybeImgUrl = await findImageFromDOM(monster.href);
      if (maybeImgUrl) {
        const parts = maybeImgUrl.split('.');
        const ext = parts[parts.length - 1];
        const destination = path.resolve(__dirname, `assets/${imgName}.${ext}`);
        imageOut = `https://raw.githubusercontent.com/theoperatore/dnd-monster-api/master/src/db/assets/${imgName}.${ext}`;

        await getAndSaveImageData(maybeImgUrl, destination);
      }
    }
  }

  return imageOut;
};
