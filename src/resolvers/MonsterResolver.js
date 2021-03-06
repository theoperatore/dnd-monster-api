'use strict';

class MonsterResolver {
  constructor({ id, name, race, armorClass, hitPoints, image, challengeRating, size, speed, alignment, abilityScores, source, abilities, savingThrows, languages, skills, _tags, _index }) {
    this.id = id;
    this.name = name;
    this.race = race;
    this.armorClass = armorClass;
    this.hitPoints = hitPoints;
    this.image = image;
    this.challengeRating = challengeRating;
    this.size = size;
    this.speed = speed;
    this.alignment = alignment;
    this.abilityScores = abilityScores;
    this.languages = languages;
    this.skills = skills;
    this.savingThrows = savingThrows;
    this.abilities = abilities;
    this.source = source;
    this._index = _index;
    this._tags = _tags;
  }
}

module.exports = MonsterResolver;
