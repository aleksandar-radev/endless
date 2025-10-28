function stripStatRollBounds(statRolls) {
  if (!statRolls || typeof statRolls !== 'object') return;

  for (const [stat, roll] of Object.entries(statRolls)) {
    if (!roll || typeof roll !== 'object') {
      continue;
    }
    if (Object.prototype.hasOwnProperty.call(roll, 'min')) {
      delete roll.min;
    }
    if (Object.prototype.hasOwnProperty.call(roll, 'max')) {
      delete roll.max;
    }
    if (Object.keys(roll).length === 0) {
      delete statRolls[stat];
    }
  }
}

function walkAndStrip(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    node.forEach(walkAndStrip);
    return;
  }

  if (node.metaData && typeof node.metaData === 'object') {
    const statRolls = node.metaData.statRolls;
    if (statRolls && typeof statRolls === 'object') {
      stripStatRollBounds(statRolls);
      if (Object.keys(statRolls).length === 0) {
        delete node.metaData.statRolls;
      }
    }
  }

  if (node.statRolls && typeof node.statRolls === 'object') {
    stripStatRollBounds(node.statRolls);
    if (Object.keys(node.statRolls).length === 0) {
      delete node.statRolls;
    }
  }

  for (const value of Object.values(node)) {
    walkAndStrip(value);
  }
}

export function run(rawData) {
  const data = JSON.parse(JSON.stringify(rawData || {}));

  walkAndStrip(data);

  return { data, result: true };
}
