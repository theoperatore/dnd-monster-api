function groupLines(groups, remainingLines) {
  if (remainingLines.length === 0) {
    return groups;
  }

  const nextLine = remainingLines.shift();

  if (nextLine.match(/\*\*\*/)) {
    groups.push([nextLine]);
  } else {
    groups[groups.length - 1].push(nextLine);
  }

  return groupLines(groups, remainingLines);
}

module.exports = function extractAbilities(htmlString, file) {
  const parts = file.content
    .split('\n')
    .filter(p => p);

  const startIndex = parts.findIndex(p => p.match('Challenge'));
  const endIndex = parts.findIndex(p => p.match('Actions'));

  if (startIndex === -1 || endIndex === -1) return [];
  const abilitiesLines = parts.slice(startIndex + 1, endIndex);

  // group lines by ability.
  const groupedAbilities = groupLines([], abilitiesLines);

  return groupedAbilities.map(groupLines => {
    const lineWithName = groupLines[0];
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
      description: nameParts.slice(1).concat(groupLines.slice(1)).join('\n'),
      recharge,
    };
  })
}
