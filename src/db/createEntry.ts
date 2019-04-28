import { CreaturePost } from './convertYamlToJson';
import { constructImage, PropertyConstructorOptions } from './constructImage';
import { info } from './utils';

export enum Ability {
  STR = 'STR',
  DEX = 'DEX',
  CON = 'CON',
  INT = 'INT',
  WIS = 'WIS',
  CHA = 'CHA'
}

export type AbilityScore = {
  score: number;
  mod: number;
  ability: Ability;
};

export type AbilityScores = {
  [key: string]: AbilityScore;
};

export type HitPoints = {
  average: number;
  roll: string;
};

export type CreatureAbility = {
  name: string;
  description: string;
  recharge: string | null;
};

export type CreatureEntry = {
  id: string;
  _index: number;
  abilityScores: AbilityScores;
  alignment: string;
  armorClass: string;
  challengeRating: string;
  hitPoints: HitPoints;
  race: string;
  size: string;
  speed: string;
  source: string | null;
  senses: string | null;
  languages: string[];
  skills: string[];
  savingThrows: string[];
  abilities?: CreatureAbility[];
  name: string;
  image: string | null;
};

// will match: 13 (3d12)
// will match: 1 (12d1)
// will match: xx (xdxx+66)
// will match: 0
// captures average in group 1, everything in parens in group 2
const HP_REGEX = /(\d+)\W?(?:\((\d+d\d+(?:\W+\d+)?)\))?/;
// will match: 20 (+5)
// will match: 9 (-1)
// will match: 10 (0)
// will match: 10(0)
const ABIL_REGEX = /(\d+)\W*\(([+-]?\d+)\)/;

// visible for testing
export function parseAbility(abil: Ability, rawString: string): AbilityScore {
  const matches = ABIL_REGEX.exec(rawString);
  if (!matches) {
    return {
      score: 0,
      mod: 0,
      ability: abil
    };
  }

  return {
    score: Number(matches[1]),
    mod: Number(matches[2]),
    ability: abil
  };
}

// visible for testing
export function parseHitPoints(rawString: string): HitPoints {
  const matches = HP_REGEX.exec(rawString);
  if (!matches) {
    return {
      average: 0,
      roll: ''
    };
  }

  return {
    average: Number(matches[1]),
    roll: matches[2]
  };
}

// things that aren't actions/legendary actions but still in the character sheet.
// visible for testing
export function groupLines(groups: string[][], remainingLines: string[]): string[][] {
  if (remainingLines.length === 0) {
    return groups;
  }

  const nextLine = remainingLines.shift();

  if (nextLine) {
    // some lines have 3 *s, and some have 2 *s...
    // we're only interested in the 3 star ones...
    // And some groups only have 2*s, so skip those ones.

    // usually those are Damage Resistances and Condition Immunities
    // which is currently not tracked.
    if (nextLine.match(/\*\*\*/)) {
      groups.push([nextLine]);
    } else if (nextLine.match(/\*\*/)) {
      // for now, skip grouping.
      // this should be refactored to account for all kinds of grouping.
    } else {
      groups[groups.length - 1].push(nextLine);
    }
  }

  return groupLines(groups, remainingLines);
}

// visible for testing
export function parseCreatureAbilities(rawContent?: string): CreatureAbility[] {
  if (!rawContent) return [];

  // split text by new lines and filter out any blank lines.
  const lines = rawContent.split('\n').filter(l => l);

  // find the lines index of ### Actions...
  const actionTitleIndex = lines.findIndex(
    line => Boolean(line.match('### Actions')) || Boolean(line.match('###Actions'))
  );

  // if there aren't any ### Actions, but there are lines, then we treat
  // each line as a CreatureAbility.
  // actionTitleIndex might be -1, slice should wrap around to the start then.
  const linesToParse = lines.slice(0, actionTitleIndex);
  // group lines by ability, some ability descriptions map to many lines
  const groupedAbilities = groupLines([], linesToParse);

  // for each ability group, create a CreatureAbility
  return groupedAbilities.map(group => {
    const lineWithName = group[0];
    const nameParts = lineWithName
      .split('***')
      .filter(l => l)
      .map(l => l.trim());

    const rechargeIndex = nameParts[0].indexOf('(');

    let recharge = null;
    let name = nameParts[0];

    if (rechargeIndex !== -1) {
      recharge = nameParts[0].substr(rechargeIndex).trim();
      name = nameParts[0].substr(0, rechargeIndex).trim();
    }

    return {
      name,
      description: nameParts
        .slice(1)
        .concat(group.slice(1))
        .join('\n'),
      recharge
    };
  });
}

// visible for testing
export async function createEntry(
  post: CreaturePost,
  index: number,
  options: PropertyConstructorOptions
): Promise<CreatureEntry> {
  return {
    id: post.name
      .trim()
      .toLowerCase()
      .replace(/\'+/g, '')
      .replace(/\/+/g, '')
      .split(' ')
      .join('_'),
    _index: index,
    name: post.name.trim(),
    abilityScores: {
      [Ability.STR]: parseAbility(Ability.STR, post.str),
      [Ability.DEX]: parseAbility(Ability.DEX, post.dex),
      [Ability.CON]: parseAbility(Ability.CON, post.con),
      [Ability.INT]: parseAbility(Ability.INT, post.int),
      [Ability.WIS]: parseAbility(Ability.WIS, post.wis),
      [Ability.CHA]: parseAbility(Ability.CHA, post.cha)
    } as AbilityScores,
    alignment: post.alignment
      ? post.alignment
          .trim()
          .toUpperCase()
          .replace(/[\s\-]/g, '_')
          .replace(/[\(\)\%]/g, '')
      : 'NEUTRAL',
    armorClass: post.armor_class ? post.armor_class.trim() : '0',
    challengeRating: post.challenge ? post.challenge.trim() : '0',
    hitPoints: parseHitPoints(post.hit_points),
    race: post.tags[1].trim().toUpperCase(),
    size: post.size ? post.size.trim() : '',
    speed: post.speed ? post.speed.trim() : '',
    senses: post.senses ? post.senses.trim() : null,
    source: post.tags[post.tags.length - 1] || null,
    languages: post.languages ? post.languages.split(',').map(l => l.trim()) : [],
    skills: post.skills ? post.skills.split(',').map(s => s.trim()) : [],
    savingThrows: post.saving_throws ? post.saving_throws.split(',').map(s => s.trim()) : [],
    abilities: parseCreatureAbilities(post.content),
    image: await constructImage(post, index, options)
  };
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// maybe this should instead be an object stitcher...
// keys to producer functions that are used to construct the final
// CreaturePost.
export async function createEntries(posts: CreaturePost[]): Promise<CreatureEntry[]> {
  // this should be changed to false before committing to master.
  const options = { requestImages: false } as PropertyConstructorOptions;
  const max = posts.length;
  const out: CreatureEntry[] = [];
  await posts.reduce(async (chain, post, index) => {
    await chain;

    info(`[${index + 1} / ${max}]`, post.name);
    const result = await createEntry(post, index, options);
    out[index] = result;

    // this has to be here otherwise we'll destroy the image server!
    if (options.requestImages) {
      await delay(1000);
    }
  }, Promise.resolve());

  return out;
}
