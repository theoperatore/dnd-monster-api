
module.exports = function extractSkills(htmlString, file) {
  const skillsLine = file.content
    .split('\n')
    .filter(p => p)
    .filter(p => p.match('Skills'))[0];

  if (!skillsLine) return [];

  return skillsLine
    .split('**Skills**')
    .filter(skillsString => skillsString) // ['Deception +5, NextSkill +2']
    .map(skillsString => skillsString.split(',')) // [ ['Deception + 5', ' NextSkill +2']]
    .reduce((arr, nextArr) => arr.concat(nextArr)) // ['Deception + 5', ' NextSkill +2']
    .map(lang => lang.trim()); // ['Deception + 5', 'NextSkill +2']
}
