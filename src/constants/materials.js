import { t } from '../i18n.js';
import { skillTree } from '../globals.js';

const BASE = import.meta.env.VITE_BASE_PATH;

// Material definitions
export const MATERIALS = {
  experience_potion: {
    id: 'experience_potion',
    get name() { return t('Experience Potion'); },
    icon: `<img src="${BASE}/icons/experience-potion-small.svg" class="icon" alt="potion"/>`,
    get description() { return t('Grants 1000 experience when used.'); },
    dropChance: 20,
    sort: 100,
    onUse: (hero, qty = 1) => {
      hero.gainExp(1000 * qty);
    },
  },
  greater_experience_potion: {
    id: 'greater_experience_potion',
    get name() { return t('Greater Experience Potion'); },
    icon: `<img src="${BASE}/icons/experience-potion.svg" class="icon" alt="potion"/>`,
    get description() { return t('Grants 5% experience when used.'); },
    dropChance: 3,
    sort: 101,
    onUse: (hero, qty = 1) => {
      const xpGain = Math.floor(hero.getExpToNextLevel() * 0.05);
      hero.gainExp(xpGain * qty);
    },
  },
  huge_experience_potion: {
    id: 'huge_experience_potion',
    get name() { return t('Huge Experience Potion'); },
    icon: `<img src="${BASE}/icons/experience-potion-big.svg" class="icon" alt="potion"/>`,
    get description() { return t('Grants 15% experience when used.'); },
    dropChance: 1,
    sort: 102,
    onUse: (hero, qty = 1) => {
      const xpGain = Math.floor(hero.getExpToNextLevel() * 0.15);
      hero.gainExp(xpGain * qty);
    },
  },
  gold_coins: {
    id: 'gold_coins',
    get name() { return t('Gold Coins'); },
    icon: `<img src="${BASE}/icons/gold-coin.svg" class="icon" alt="gold"/>`,
    get description() { return t('Adds 1000 gold per coin to your total.'); },
    dropChance: 60,
    sort: 200,
    onUse: (hero, qty = 1) => {
      hero.gainGold(1000 * qty);
    },
  },
  large_gold_coins: {
    id: 'large_gold_coins',
    get name() { return t('Large Gold Coins'); },
    icon: `<img src="${BASE}/icons/large-gold-coin.svg" class="icon" alt="gold"/>`,
    get description() { return t('Adds 10000 gold per coin to your total.'); },
    dropChance: 20,
    sort: 201,
    onUse: (hero, qty = 1) => {
      hero.gainGold(10000 * qty);
    },
  },
  enormous_gold_coins: {
    id: 'enormous_gold_coins',
    get name() { return t('Enormous Gold Coins'); },
    icon: `<img src="${BASE}/icons/enormous-gold-coin.svg" class="icon" alt="gold"/>`,
    get description() { return t('Adds 50000 gold per coin to your total.'); },
    dropChance: 1,
    sort: 202,
    onUse: (hero, qty = 1) => {
      hero.gainGold(50000 * qty);
    },
  },
  freaky_gold_coins: {
    id: 'freaky_gold_coins',
    get name() { return t('Freaky Gold Coins'); },
    icon: `<img src="${BASE}/icons/freaky-gold-coin.svg" class="icon" alt="gold"/>`,
    get description() { return t('Adds 1000000 gold per coin to your total.'); },
    dropChance: 0.01,
    sort: 203,
    onUse: (hero, qty = 1) => {
      hero.gainGold(1000000 * qty);
    },
  },
  elixir: {
    id: 'elixir',
    get name() { return t('Elixir'); },
    icon: `<img src="${BASE}/icons/experience-potion.svg" class="icon" alt="elixir"/>`,
    get description() { return t('Grants 2 skill points.'); },
    dropChance: 2,
    sort: 300,
    exclusive: true, // only drops when region or enemy canDrop includes 'elixir'
    onUse: (hero, qty = 1) => {
      hero.permaStats.skillPoints = hero.permaStats.skillPoints + 2 * qty;
      skillTree.addSkillPoints(2 * qty);
    },
  },
  crystalized_rock: {
    id: 'crystalized_rock',
    get name() { return t('Crystalized Rock'); },
    icon: `<img src="${BASE}/icons/crystal.svg" class="icon" alt="crystal"/>`,
    get description() { return t('Gives 1 crystal.'); },
    dropChance: 20,
    sort: 400,
    onUse: (hero, qty = 1) => {
      hero.gainCrystals(1 * qty);
    },
  },
  potion_of_strength: {
    id: 'potion_of_strength',
    get name() { return t('Potion of Strength'); },
    icon: `<img src="${BASE}/icons/strength-potion.svg" class="icon" alt="strength"/>`,
    get description() { return t('Increases strength by 1.'); },
    dropChance: 12,
    sort: 500,
    onUse: (hero, qty = 1) => {
      hero.permaStats.strength += 1 * qty;
    },
  },
  potion_of_agility: {
    id: 'potion_of_agility',
    get name() { return t('Potion of Agility'); },
    icon: `<img src="${BASE}/icons/agility-potion.svg" class="icon" alt="speed"/>`,
    get description() { return t('Increases agility by 1.'); },
    dropChance: 12,
    sort: 501,
    onUse: (hero, qty = 1) => {
      hero.permaStats.agility += 1 * qty;
    },
  },
  potion_of_vitality: {
    id: 'potion_of_vitality',
    get name() { return t('Potion of Vitality'); },
    icon: `<img src="${BASE}/icons/vitality-potion.svg" class="icon" alt="vitality"/>`,
    get description() { return t('Increases vitality by 1.'); },
    dropChance: 12,
    sort: 502,
    onUse: (hero, qty = 1) => {
      hero.permaStats.vitality += 1 * qty;
    },
  },
  potion_of_endurance: {
    id: 'potion_of_endurance',
    get name() { return t('Potion of Endurance'); },
    icon: `<img src="${BASE}/icons/endurance-potion.svg" class="icon" alt="endurance"/>`,
    get description() { return t('Increases endurance by 1.'); },
    dropChance: 12,
    sort: 503,
    onUse: (hero, qty = 1) => {
      hero.permaStats.endurance += 1 * qty;
    },
  },
  potion_of_wisdom: {
    id: 'potion_of_wisdom',
    get name() { return t('Potion of Wisdom'); },
    icon: `<img src="${BASE}/icons/wisdom-potion.svg" class="icon" alt="wisdom"/>`,
    get description() { return t('Increases wisdom by 1.'); },
    dropChance: 12,
    sort: 504,
    onUse: (hero, qty = 1) => {
      hero.permaStats.wisdom += 1 * qty;
    },
  },
  potion_of_dexterity: {
    id: 'potion_of_dexterity',
    get name() { return t('Potion of Dexterity'); },
    icon: `<img src="${BASE}/icons/dexterity-potion.svg" class="icon" alt="dexterity"/>`,
    get description() { return t('Increases dexterity by 1.'); },
    dropChance: 12,
    sort: 505,
    onUse: (hero, qty = 1) => {
      hero.permaStats.dexterity += 1 * qty;
    },
  },
  potion_of_intelligence: {
    id: 'potion_of_intelligence',
    get name() { return t('Potion of Intelligence'); },
    icon: `<img src="${BASE}/icons/intelligence-potion.svg" class="icon" alt="intelligence"/>`,
    get description() { return t('Increases intelligence by 1.'); },
    dropChance: 12,
    sort: 506,
    onUse: (hero, qty = 1) => {
      hero.permaStats.intelligence += 1 * qty;
    },
  },
  potion_of_perseverance: {
    id: 'potion_of_perseverance',
    get name() { return t('Potion of Perseverance'); },
    icon: `<img src="${BASE}/icons/perseverance-potion.svg" class="icon" alt="perseverance"/>`,
    get description() { return t('Increases perseverance by 1.'); },
    dropChance: 12,
    sort: 507,
    onUse: (hero, qty = 1) => {
      hero.permaStats.perseverance += 1 * qty;
    },
  },
  armor_upgrade_stone: {
    id: 'armor_upgrade_stone',
    get name() { return t('Armor Upgrade Stone'); },
    icon: `<img src="${BASE}/icons/armor-upgrade-stone.svg" class="icon" alt="armor"/>`,
    get description() { return t("Upgrade the level of an equipped armor item. Requires a quantity equal to the item's tier for each level."); },
    dropChance: 20,
    sort: 600,
    onUse: (hero, qty = 1) => {
      // Custom modal logic handled in inventory UI
    },
    upgradeType: 'armor',
    isCustom: true,
  },
  jewelry_upgrade_gem: {
    id: 'jewelry_upgrade_gem',
    get name() { return t('Jewelry Upgrade Gem'); },
    icon: `<img src="${BASE}/icons/jewelry-upgrade-gem.svg" class="icon" alt="ring"/>`,
    get description() { return t("Upgrade the level of an equipped jewelry item. Requires a quantity equal to the item's tier for each level."); },
    dropChance: 4,
    sort: 601,
    onUse: (hero, qty = 1) => {
      // Custom modal logic handled in inventory UI
    },
    upgradeType: 'jewelry',
    isCustom: true,
  },
  weapon_upgrade_core: {
    id: 'weapon_upgrade_core',
    get name() { return t('Weapon Upgrade Core'); },
    icon: `<img src="${BASE}/icons/weapon-upgrade-core.svg" class="icon" alt="weapon"/>`,
    get description() { return t("Upgrade the level of an equipped weapon. Requires a quantity equal to the item's tier for each level."); },
    dropChance: 3,
    sort: 602,
    onUse: (hero, qty = 1) => {
      // Custom modal logic handled in inventory UI
    },
    upgradeType: 'weapon',
    isCustom: true,
  },
  enchantment_scroll: {
    id: 'enchantment_scroll',
    get name() { return t('Enchantment Scroll'); },
    icon: `<img src="${BASE}/icons/enchantment-scroll.svg" class="icon" alt="scroll"/>`,
    get description() { return t('Increases the rarity of an equipped item. (cannot be used on mythic items)'); },
    dropChance: 0.5,
    sort: 700,
    onUse: (hero, qty = 1) => {
      // Custom modal logic handled in inventory UI
    },
    isCustom: true,
  },
  alternation_orb: {
    id: 'alternation_orb',
    get name() { return t('Alternation Orb'); },
    icon: `<img src="${BASE}/icons/alternation-orb.svg" class="icon" alt="orb"/>`,
    get description() { return t('Re-rolls the value of one chosen stat on an equipped item.'); },
    dropChance: 2,
    sort: 701,
    onUse: (hero, qty = 1) => {
      // Custom modal logic handled in inventory UI
    },
    isCustom: true,
  },
};
