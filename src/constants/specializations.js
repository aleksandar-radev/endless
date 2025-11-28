import { t } from '../i18n.js';

export const SPECIALIZATIONS = {
  WARRIOR: [
    {
      id: 'warrior_guardian',
      name: () => t('specialization.warrior.guardian.name'),
      description: () => t('specialization.warrior.guardian.desc'),
      avatar: 'warrior-guardian.jpg',
      skills: {
        'warrior_guardian_mastery': {
          name: () => t('skill.warrior.guardianMastery.name'),
          description: () => t('skill.warrior.guardianMastery.desc'),
          icon: () => 'shield-bash', // Reusing existing icon for now
          maxLevel: () => 50,
          requiredLevel: () => 0,
          row: 1,
          col: 1,
          prerequisites: [],
          type: () => 'passive',
          effect: (level) => ({
            armorPercent: level * 5,
            lifePercent: level * 2,
          }),
        }
      }
    },
    {
      id: 'warrior_berserker',
      name: () => t('specialization.warrior.berserker.name'),
      description: () => t('specialization.warrior.berserker.desc'),
      avatar: 'warrior-berserker.jpg',
      skills: {
        'warrior_berserker_mastery': {
          name: () => t('skill.warrior.berserkerMastery.name'),
          description: () => t('skill.warrior.berserkerMastery.desc'),
          icon: () => 'frenzy',
          maxLevel: () => 50,
          requiredLevel: () => 0,
          row: 1,
          col: 1,
          prerequisites: [],
          type: () => 'passive',
          effect: (level) => ({
            damagePercent: level * 5,
            attackSpeed: level * 0.01,
          }),
        }
      }
    },
    {
      id: 'warrior_warlord',
      name: () => t('specialization.warrior.warlord.name'),
      description: () => t('specialization.warrior.warlord.desc'),
      avatar: 'warrior-warlord.jpg',
      skills: {
        'warrior_warlord_mastery': {
          name: () => t('skill.warrior.warlordMastery.name'),
          description: () => t('skill.warrior.warlordMastery.desc'),
          icon: () => 'battle-cry',
          maxLevel: () => 50,
          requiredLevel: () => 0,
          row: 1,
          col: 1,
          prerequisites: [],
          type: () => 'passive',
          effect: (level) => ({
            strengthPercent: level * 2,
            damage: level * 10,
          }),
        }
      }
    }
  ],
  // Add other classes similarly with generic placeholders if needed
};

// Helper to fill other classes with placeholders to avoid errors
const classes = ['ROGUE', 'VAMPIRE', 'PALADIN', 'BERSERKER', 'ELEMENTALIST', 'DRUID', 'MAGE'];
classes.forEach(cls => {
  if (!SPECIALIZATIONS[cls]) {
    SPECIALIZATIONS[cls] = [
      {
        id: `${cls.toLowerCase()}_spec1`,
        name: () => `${cls} Path 1`,
        description: () => `First specialization path for ${cls}`,
        avatar: `${cls.toLowerCase()}-avatar.jpg`, // Fallback to default
        skills: {
          [`${cls.toLowerCase()}_spec1_skill`]: {
            name: () => 'Path 1 Mastery',
            description: () => 'Increases stats.',
            icon: () => 'bash',
            maxLevel: () => 50,
            requiredLevel: () => 0,
            row: 1,
            col: 1,
            prerequisites: [],
            type: () => 'passive',
            effect: (level) => ({ allAttributes: level }),
          }
        }
      },
      {
        id: `${cls.toLowerCase()}_spec2`,
        name: () => `${cls} Path 2`,
        description: () => `Second specialization path for ${cls}`,
        avatar: `${cls.toLowerCase()}-avatar.jpg`,
        skills: {
           [`${cls.toLowerCase()}_spec2_skill`]: {
            name: () => 'Path 2 Mastery',
            description: () => 'Increases stats.',
            icon: () => 'bash',
            maxLevel: () => 50,
            requiredLevel: () => 0,
            row: 1,
            col: 1,
            prerequisites: [],
            type: () => 'passive',
            effect: (level) => ({ allAttributes: level }),
          }
        }
      },
      {
        id: `${cls.toLowerCase()}_spec3`,
        name: () => `${cls} Path 3`,
        description: () => `Third specialization path for ${cls}`,
        avatar: `${cls.toLowerCase()}-avatar.jpg`,
        skills: {
           [`${cls.toLowerCase()}_spec3_skill`]: {
            name: () => 'Path 3 Mastery',
            description: () => 'Increases stats.',
            icon: () => 'bash',
            maxLevel: () => 50,
            requiredLevel: () => 0,
            row: 1,
            col: 1,
            prerequisites: [],
            type: () => 'passive',
            effect: (level) => ({ allAttributes: level }),
          }
        }
      }
    ];
  }
});
