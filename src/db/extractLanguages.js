
module.exports = function extractLanguages(htmlString, file) {
  const languageLine = file.content
    .split('\n')
    .filter(p => p)
    .filter(p => p.match('Languages'))[0];

  if (!languageLine) return [];

  return languageLine
    .split('**Languages**') // ['', 'Common, NextLang']
    .filter(langString => langString) // ['Common, NextLang']
    .map(langString => langString.split(',')) // [ ['Common', ' NextLang']]
    .reduce((arr, nextArr) => arr.concat(nextArr)) // ['Common', ' NextLang']
    .map(lang => lang.trim()); // ['Common', 'NextLang']
}
