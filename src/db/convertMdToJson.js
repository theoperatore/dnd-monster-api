'use strict';

const path = require('path');
const marked = require('marked');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');
const request = require('request');
const fse = require('fs-extra');
const utils = require('./utils');

/* example of a single jsonFile
{
  "layout": "post",
  "title": "Yakfolk Priest",
  "date": "2017-09-10T00:00:00.000Z",
  "tags": [
    "large",
    "monstrosity",
    "cr4",
    "storm-kings-thunder"
  ],
  "content": "\n\n**Large monstrosity, neutral evil**\n\n**Armor Class** 12 (hide armor)\n\n**Hit Points** 52 (7d10+14)\n\n**Speed** 30 ft.\n\n|   STR   |   DEX   |   CON   |   INT   |   WIS   |   CHA   |\n|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|\n| 16 (+3) | 11 (0) | 15 (+2) | 14 (+2) | 18 (+4) | 14 (+2) |\n\n**Skills** Deception +4, Medicine +6, Survival +6\n\n**Languages** Common, Yikaria\n\n**Challenge** 4 (1,100 XP)\n\n***Possession (Recharges after a rest.*** The yakfolk attempts to magically possess a humanoid or giant. The yakfolk must touch the target throughout a short rest or the attempt fails. At the end of the rest, the target must succeed a DC 12 Con saving throw or be possessed by the yakfolk, which disappears with everything its carrying and wearing. Until the possession ends, the target is incapacitated, loses control of its body, and it unaware of its surroundings. The yakfolk now controls the body and cannot be targeted by any attack, spell, or other effect, and it retains its alignment, its Intelligence, Wisdom, and Charisma scores; and its proficiencies. It otherwise uses the target's statistics, except the target's knowledge, class features, feats, and proficiencies. \n\nThe possession lats until either the body drops to 0 hit points, the yakfolk ends the possession as an action, or the yakfolk is forced out of the body by an effect such as dispel evil and good spell. When the possession ends, the yakfolk appears in an unoccupied space within 5 feet of the body and is stunned until the end of its next turn. If the host body dies while it is possessed by the yakfolk, the yakfolk dies as well and its body does not reappear.\n\n***Spellcasting.*** The yakfolk is a 7th-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 14, +6 to hit with spell attacks). The priest has the following cleric spells prepared: \n\n* Cantrips (at will): light, mending, sacred flame, thaumaturgy\n\n* 1st level (4 slots): bane, command, cure wounds, sanctuary\n\n* 2nd level (3 slots): augury, hold person, spiritual weapon\n\n* 3rd level (3 slots): bestow curse, protection from energy, sending\n\n* 4th level (1 slots): banishment\n\n**Actions**\n\n***Multiattack.*** The yakfolk makes two attacks, either with it's greatsword or its longbow\n\n***Quarterstaff.*** Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6+3) bludgeoning damage, or 12 (2d8+3) bludgeoning damage if used with two hands.\n\n***Summon Earth Elemental (1/day).*** The yakfolk summons an earth elemental. The elemental appears in an unoccupied space within 60 feet of its summoner and acts as an ally of the summoner. It remains for 10 minutes, until it dies, or until its summoner dismisses it as an action.\n\n",
  "iso8601Date": "2017-09-09T20:00:00-04:00",
  "basename": "2017-09-10-yakfolk-priest"
}
*/

/* example of parsed content
<p><strong>Medium humanoid (aarakocra), neutral good</strong></p> // size, type, alignment
<p><strong>Armor Class</strong> 12</p> // AC
<p><strong>Hit Points</strong> 13 (3d8)</p> // Average Hp, dice
<p><strong>Speed</strong> 20 ft., fly 50 ft.</p> // speed
<table>
<thead>
<tr>
<th style="text-align:center">STR</th> // ability scores
<th style="text-align:center">DEX</th>
<th style="text-align:center">CON</th>
<th style="text-align:center">INT</th>
<th style="text-align:center">WIS</th>
<th style="text-align:center">CHA</th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align:center">10 (0)</td>
<td style="text-align:center">14 (+2)</td>
<td style="text-align:center">10 (0)</td>
<td style="text-align:center">11 (0)</td>
<td style="text-align:center">12 (+1)</td>
<td style="text-align:center">11 (0)</td>
</tr>
</tbody>
</table>
<p><strong>Skills</strong> Perception +5</p>
<p><strong>Languages</strong> Auran, Aarakocra</p>
<p><strong>Challenge</strong> 1/4 (50 XP)</p>
<p><strong><em>Dive Attack.</em></strong> If the aarakocra is flying and dives at least 30 ft. straight toward a target and then hits it with a melee weapon attack, the attack deals an extra 3 (1d6) damage to the target.</p>
<p><strong>Actions</strong></p>
<p><strong><em>Talon.</em></strong> Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) slashing damage.</p>
<p><strong><em>Javelin.</em></strong> Melee or Ranged Weapon Attack: +4 to hit, reach 5 ft. or range 30/120 ft., one target. Hit: 5 (1d6 + 2) piercing damage.</p>
<p><strong><em>Summon Air Elemental.</em></strong> Five aarakocra within 30 feet of each other can magically summon an air elemental. Each of the five must use its action and movement on three consecutive turns to perform an aerial dance and must maintain concentration while doing so (as if concentrating on a spell). When all five have finished their third turn of the dance, the elemental appears in an unoccupied space within 60 feet of them. It is friendly toward them and obeys their spoken commands. It remains for 1 hour, until it or all its summoners die, or until any of its summoners dismisses it as a bonus action. A summoner can&#39;t perform the dance again until it finishes a short rest. When the elemental returns to the Elemental Plane of Air, any aarakocra within 5 feet of it can return with it.</p>
*/

const IMAGE_SCRAPING_ENDPOINT = 'https://www.aidedd.org/dnd/monstres.php?vo=';

const ABILITY_BY_INDEX = [
  'STR',
  'DEX',
  'CON',
  'INT',
  'WIS',
  'CHA',
];

// will match: 13 (3d12)
// will match: 1 (12d1)
// will match: xx (xdxx+66)
// will match: 0
// captures average in group 1, everything in parens in group 2
const HP_REGEX = /(\d+)\W?(?:\((\d+d\d+(?:\W+\d+)?)\))?/;

// will match: 20 (+5)
// will match: 9 (-1)
// will match: 10 (0)
const ABIL_REGEX = /(\d+)\W+\(([+-]?\d+)\)/;

// matches: medium monstrosity (shapechanger, yuan-ti), neutral evil
// matches: medium monstrosity, neutral evil
// gives you the last part as capture group 1
const ALIGNMENT_REGEX = /.+(?:\(.+\))?\,\W+(.+)/;

async function parseStats(htmlString, file) {
  const $ = cheerio.load(htmlString);
  const sizeTypeAlignment = $('p:first-of-type > strong').text() || 'notFound';
  const alignment = ALIGNMENT_REGEX.exec(sizeTypeAlignment)[1] || 'notFound';
  const normalAlignment = alignment.trim().toUpperCase().replace(/[\s\-]/g, '_').replace(/[\(\)\%]/g, '');

  const armorClass = $('p:nth-of-type(2)').contents().filter(function () { return this.nodeType === 3}).text() || 'notFound';

  const hitPoints = $('p:nth-of-type(3)').contents().filter(function () { return this.nodeType === 3}).text() || 'notFound';
  const hitPointParts = HP_REGEX.exec(hitPoints);

  const speed = $('p:nth-of-type(4)').contents().filter(function () { return this.nodeType === 3}).text() || 'notFound';

  const abilityScores = $('td')
    .map(function () {
      return $(this).text();
    })
    .get()
    .map((abil, idx) => {
      const matches = ABIL_REGEX.exec(abil);
      return {
        score: Number(matches[1]),
        mod: Number(matches[2]),
        ability: ABILITY_BY_INDEX[idx],
      };
    })
    .reduce((out, abil) => {
      out[abil.ability] = abil;
      return out;
    }, {});

  // TODO: parse actions / abilities
  // TODO: figure out how to represent 50/50 75/25 splits in alignments

  return {
    abilityScores,
    alignment: normalAlignment,
    armorClass: armorClass.trim(),
    challengeRating: file.tags[2].split('cr')[1],
    hitPoints: {
      average: Number(hitPointParts[1]),
      roll: hitPointParts[2],
    },
    race: file.tags[1].toUpperCase(),
    size: file.tags[0].toUpperCase(),
    speed: speed.trim(),
    source: file.tags[file.tags.length - 1],
  };
}

function parseMarkdown(md) {
  return new Promise((resolve, reject) => {
    marked(md, (err, content) => {
      return err
        ? reject(err)
        : resolve(content);
    });
  });
}

async function findImageFromDom(dom) {
  const imgTag = dom.window.document.querySelector('img');
  return imgTag ? imgTag.src : null;
}

async function getAndSaveImageData(imgUrl, destination) {
  return new Promise((resolve, reject) => {
    request(imgUrl)
      .on('error', err => {
        console.log('error getting ', imgUrl, err.message);
        resolve();
      })
      .pipe(fse.createWriteStream(destination))
      .on('close', resolve);
  });
}

async function convertFileToJson(file, index, arr, getImages = false) {
  utils.info(`[${index + 1}/${arr.length}]`, file.title);
  const convertedContent = await parseMarkdown(file.content);
  const parsedMonsterStats = await parseStats(convertedContent, file);

  // TODO: make a better, more deterministic id.
  const id = file.title
    .toLowerCase()
    .replace("'", '')
    .replace('/', ' ')
    .replace('\\', ' ')
    .split(' ')
    .join('_');

  const imgName = file.title
    .toLowerCase()
    .replace("'", '')
    .replace('/', ' ')
    .replace('\\', ' ')
    .split(' ')
    .join('-');

  // TODO: scrape images from somewhere...
  //       possibly https://www.aidedd.org/dnd/monstres.php?vo=duodrone
  //       then dive the html for the img tag and capture the src.
  let imageUrl = null;
  let imageUrlOut = null;
  if (getImages) {
    const dom = await JSDOM.fromURL(`${IMAGE_SCRAPING_ENDPOINT}${imgName}`);
    imageUrl = await findImageFromDom(dom);
    if (imageUrl) {
      const parts = imageUrl.split('.');
      const ext = parts[parts.length - 1];
      const destination = path.resolve(__dirname, `assets/${imgName}.${ext}`);
      imageUrlOut = `https://raw.githubusercontent.com/theoperatore/dnd-monster-api/master/db/assets/${imgName}.${ext}`;
      await getAndSaveImageData(imageUrl, destination);
    }
  }

  return Object.assign({}, parsedMonsterStats, {
    id,
    _index: index,
    name: file.title,
    image: imageUrlOut, // default image
    _tags: file.tags,
  });
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function convertMdToJson(jsonFiles) {
  const assetDesination = path.resolve(__dirname, 'assets');
  await fse.emptyDir(assetDesination)
  // const tmp = await convertFileToJson(jsonFiles[0], 0, []);
  // return [tmp];

  // sequence and delay each convert for images sake so we don't accidentally
  // overload the server...again...
  const out = [];
  const final = await jsonFiles.reduce((promise, file, idx, arr) => {
    return promise.then(result => {
      out.push(result[1]);
      return Promise.all([delay(1000), convertFileToJson(file, idx, arr, false)]);
    });
  }, Promise.resolve([null, null]));

  // push the final entry to the array.
  out.push(final[1]);
  // the first entry is null
  return out.slice(1);
}

module.exports = convertMdToJson;
