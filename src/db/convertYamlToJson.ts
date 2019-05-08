import * as fs from 'fs';
import * as path from 'path';
import * as m2j from 'markdown-to-json';
import * as utils from './utils';

function getFileNames(dir: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => (err ? reject(err) : resolve(files)));
  });
}

// might be worth turning these into actual types rather than just raw value types.
export type CreaturePost = {
  // name: "Aarakocra",
  name: string;
  // tags: [medium, humanoid, cr1/4, monster-manual]
  tags: string[]; // or [Size, CreatureType, ChallengeRating, Source]
  // cha: 11(0)
  // wis: 12(+1)
  // int: 11(0)
  // con: 10(0)
  // dex: 14(+2)
  // str: 10(0)
  cha: string;
  wis: string;
  int: string;
  con: string;
  dex: string;
  str: string;
  // size: Medium humanoid(aarakocra), Medium undead (shapechanger)
  size?: string;
  // alignment: neutral good
  alignment?: string; // or Alignment enum
  // challenge: "1/4 (50 XP)"
  challenge?: string;
  // senses: "darkvision 60 ft."
  senses?: string;
  // damage_immunities: "poison"
  damage_immunities?: string;
  // languages: "Auran, Aarakocra" or "the languages it knew in life"
  languages?: string; // might want to turn this into a string[]
  // skills: "Perception +5, Stealth +9"
  skills?: string; // might also be a string[]
  // speed: "0 ft., fly 30 ft. (hover)"
  speed?: string;
  // saving_throws: Dex +9, Wis +7, Cha +9"
  saving_throws?: string;
  // hit_points: "13 (3d8)", "45 (6d8+18)"
  hit_points: string;
  // armor_class: "12 (natural armor)"",
  armor_class?: string;

  content: string; // raw markdown of the post
};

export async function convertYamlToJson(postsDirectory: string): Promise<CreaturePost[]> {
  utils.info('converting _creatures front-matter...', postsDirectory);
  const files = await getFileNames(postsDirectory);
  const pathResolvedFiles = files.map(file => path.resolve(postsDirectory, file));
  const stringJson = m2j.parse(pathResolvedFiles, {
    content: true,
    // don't generate a preview...just give me the content!
    width: 0
  });

  if (!stringJson) throw new Error('somehow there isnt frontmatter...');

  const parsedJson = JSON.parse(stringJson);

  return Object.keys(parsedJson).map(key => parsedJson[key]);
}
