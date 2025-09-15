import { t, tp } from './i18n.js';
import { ELEMENTS } from './constants/common.js';

const ELEMENT_IDS = Object.keys(ELEMENTS);
const ELEMENT_REGEX = new RegExp(
  `^(${ELEMENT_IDS.join('|')})(Damage|DamagePercent|Resistance|ResistancePercent|Penetration|PenetrationPercent)$`,
);

export function formatStatName(stat, shortElementalNames = false) {
  const match = stat.match(ELEMENT_REGEX);
  if (match) {
    const [, element, suffix] = match;
    const icon = ELEMENTS[element]?.icon || '';
    const translation = t(stat);
    const baseMap = {
      Damage: 'Damage',
      DamagePercent: 'Damage %',
      Resistance: 'Res',
      ResistancePercent: 'Res %',
      Penetration: 'Penetration',
      PenetrationPercent: 'Penetration %',
    };
    let base = translation !== stat ? translation.replace(icon, '').trim() : baseMap[suffix];
    if (shortElementalNames) {
      return `${icon} ${base}`.trim();
    }
    const elementName = t(element);
    return `${icon} ${elementName} ${base}`.trim();
  }

  const translation = t(stat);
  if (translation !== stat) return translation;

  return stat
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/Percent$/, '%')
    .trim();
}

export function formatNamedType(name, typeKey) {
  return tp('combatMode.subAreaFormat', { name, type: t(typeKey) });
}
