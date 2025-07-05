import { KILL_QUESTS } from './quests/kills.js';
import { RARITY_QUESTS } from './quests/rarity.js';
import { RESOURCE_QUESTS } from './quests/resources.js';
import { PROGRESSION_QUESTS } from './quests/progression.js';
import { DROP_QUESTS } from './quests/drops.js';

export const QUEST_DEFINITIONS = [
  ...KILL_QUESTS,
  ...RARITY_QUESTS,
  ...RESOURCE_QUESTS,
  ...PROGRESSION_QUESTS,
  ...DROP_QUESTS,
];
