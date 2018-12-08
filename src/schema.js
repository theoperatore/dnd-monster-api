module.exports = `
  type MonsterAbility {
    name: String!,
    description: String!,
    recharge: String,
  }

  enum MonsterRace {
    ABERRATION
    BEAST
    CELESTIAL
    CONSTRUCT
    DRAGON
    ELEMENTAL
    FEY
    FIEND
    GIANT
    HUMANOID
    MONSTROSITY
    OOZE
    PLANT
    UNDEAD
    SWARM
  }

  type MonsterHitPoints {
    average: Int
    roll: String
  }

  enum MonsterSize {
    TINY
    SMALL
    MEDIUM
    LARGE
    HUGE
    GARGANTUAN
  }

  enum MonsterAlignment {
    LAWFUL_EVIL
    LAWFUL_GOOD
    LAWFUL_NEUTRAL
    CHAOTIC_EVIL
    CHAOTIC_GOOD
    CHAOTIC_NEUTRAL
    NEUTRAL_EVIL
    NEUTRAL_GOOD
    NEUTRAL
    UNALIGNED

    CONSTRUCT

    ANY_ALIGNMENT
    ANY_EVIL_ALIGNMENT
    ANY_NON_GOOD_ALIGNMENT
    ANY_NON_LAWFUL_ALIGNMENT
    ANY_CHAOTIC_ALIGNMENT

    NEUTRAL_GOOD_50_OR_NEUTRAL_EVIL_50
    CHAOTIC_GOOD_75_OR_NEUTRAL_EVIL_25
  }

  enum Ability {
    STR
    DEX
    CON
    WIS
    INT
    CHA
  }

  type AbilityScore {
    score: Int,
    mod: Int,
    ability: Ability
  }

  type MonsterAbilityScoresMap {
    STR: AbilityScore
    DEX: AbilityScore
    CON: AbilityScore
    INT: AbilityScore
    WIS: AbilityScore
    CHA: AbilityScore
  }

  type Monster {
    id: ID
    _index: Int
    name: String
    race: MonsterRace
    armorClass: String
    hitPoints: MonsterHitPoints
    image: String
    challengeRating: String
    size: MonsterSize
    speed: String
    alignment: MonsterAlignment
    abilityScores: MonsterAbilityScoresMap
    source: String
    abilities: [MonsterAbility]!
    languages: [String]!
    skills: [String]!
    savingThrows: [String]!
  }

  type ApiListResponse {
    count: Int
    total: Int
    monsters: [Monster]!
  }

  type Query {
    getMonsters(limit: Int = 10, offset: Int = 0): ApiListResponse
    getMonster(id: ID!): Monster
    searchMonstersByName(name: String!): [Monster]!
    getRandomMonster: Monster
  }
`;
