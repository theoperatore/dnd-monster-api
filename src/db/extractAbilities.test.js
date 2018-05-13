const marked = require('marked');
const extractAbilities = require('./extractAbilities');

function parseMarkdown(md) {
  return new Promise((resolve, reject) => {
    marked(md, (err, content) => {
      return err
        ? reject(err)
        : resolve(content);
    });
  });
}

const mockContent = `\n\n**Large monstrosity, neutral evil**\n\n**Armor Class** 12 (hide armor)\n\n**Hit Points** 52 (7d10+14)\n\n**Speed** 30 ft.\n\n|   STR   |   DEX   |   CON   |   INT   |   WIS   |   CHA   |\n|:-----:|:-----:|:-----:|:-----:|:-----:|:-----:|\n| 16 (+3) | 11 (0) | 15 (+2) | 14 (+2) | 18 (+4) | 14 (+2) |\n\n**Skills** Deception +4, Medicine +6, Survival +6\n\n**Languages** Common, Yikaria\n\n**Challenge** 4 (1,100 XP)\n\n***Possession (Recharges after a rest.*** The yakfolk attempts to magically possess a humanoid or giant. The yakfolk must touch the target throughout a short rest or the attempt fails. At the end of the rest, the target must succeed a DC 12 Con saving throw or be possessed by the yakfolk, which disappears with everything its carrying and wearing. Until the possession ends, the target is incapacitated, loses control of its body, and it unaware of its surroundings. The yakfolk now controls the body and cannot be targeted by any attack, spell, or other effect, and it retains its alignment, its Intelligence, Wisdom, and Charisma scores; and its proficiencies. It otherwise uses the target's statistics, except the target's knowledge, class features, feats, and proficiencies. \n\nThe possession lats until either the body drops to 0 hit points, the yakfolk ends the possession as an action, or the yakfolk is forced out of the body by an effect such as dispel evil and good spell. When the possession ends, the yakfolk appears in an unoccupied space within 5 feet of the body and is stunned until the end of its next turn. If the host body dies while it is possessed by the yakfolk, the yakfolk dies as well and its body does not reappear.\n\n***Spellcasting.*** The yakfolk is a 7th-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 14, +6 to hit with spell attacks). The priest has the following cleric spells prepared: \n\n* Cantrips (at will): light, mending, sacred flame, thaumaturgy\n\n* 1st level (4 slots): bane, command, cure wounds, sanctuary\n\n* 2nd level (3 slots): augury, hold person, spiritual weapon\n\n* 3rd level (3 slots): bestow curse, protection from energy, sending\n\n* 4th level (1 slots): banishment\n\n**Actions**\n\n***Multiattack.*** The yakfolk makes two attacks, either with it's greatsword or its longbow\n\n***Quarterstaff.*** Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6+3) bludgeoning damage, or 12 (2d8+3) bludgeoning damage if used with two hands.\n\n***Summon Earth Elemental (1/day).*** The yakfolk summons an earth elemental. The elemental appears in an unoccupied space within 60 feet of its summoner and acts as an ally of the summoner. It remains for 10 minutes, until it dies, or until its summoner dismisses it as an action.\n\n`;

test('It extracts abilities from unparsed markdown', async () => {
  const parsed = await parseMarkdown(mockContent);
  const expected = [
    {
      name: 'Possession',
      recharge: '(Recharges after a rest.',
      description: `The yakfolk attempts to magically possess a humanoid or giant. The yakfolk must touch the target throughout a short rest or the attempt fails. At the end of the rest, the target must succeed a DC 12 Con saving throw or be possessed by the yakfolk, which disappears with everything its carrying and wearing. Until the possession ends, the target is incapacitated, loses control of its body, and it unaware of its surroundings. The yakfolk now controls the body and cannot be targeted by any attack, spell, or other effect, and it retains its alignment, its Intelligence, Wisdom, and Charisma scores; and its proficiencies. It otherwise uses the target's statistics, except the target's knowledge, class features, feats, and proficiencies.\nThe possession lats until either the body drops to 0 hit points, the yakfolk ends the possession as an action, or the yakfolk is forced out of the body by an effect such as dispel evil and good spell. When the possession ends, the yakfolk appears in an unoccupied space within 5 feet of the body and is stunned until the end of its next turn. If the host body dies while it is possessed by the yakfolk, the yakfolk dies as well and its body does not reappear.`,
    },
    {
      name: 'Spellcasting.',
      recharge: null,
      description: `The yakfolk is a 7th-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 14, +6 to hit with spell attacks). The priest has the following cleric spells prepared:\n* Cantrips (at will): light, mending, sacred flame, thaumaturgy\n* 1st level (4 slots): bane, command, cure wounds, sanctuary\n* 2nd level (3 slots): augury, hold person, spiritual weapon\n* 3rd level (3 slots): bestow curse, protection from energy, sending\n* 4th level (1 slots): banishment`
    }
  ]
  return expect(extractAbilities(parsed, { content: mockContent })).toEqual(expected);
});
