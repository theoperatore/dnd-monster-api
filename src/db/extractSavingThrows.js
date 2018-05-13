
module.exports = function extractSavingThrows(htmlString, file) {
  const stLine = file.content
    .split('\n')
    .filter(p => p)
    .filter(p => p.match('Saving Throws'))[0];

  if (!stLine) return [];

  return stLine
    .split('**Saving Throws**') // ['', 'Int +5, Wis +2']
    .filter(str => str) // ['Int +5, Wis +2']
    .map(str => str.split(',')) // [ ['Int +5', ' Wis +2']]
    .reduce((arr, nextArr) => arr.concat(nextArr)) // ['Int +5', ' Wis +2']
    .map(lang => lang.trim()); // ['Int +5', 'Wis +2']
}
