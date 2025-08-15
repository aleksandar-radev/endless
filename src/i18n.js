const translations = {
  en: {
    'app.title': 'Endless',
    'tab.stats': 'Stats',
    'tab.training': 'Training',
    'tab.inventory': 'Inventory',
    'tab.skilltree': 'Skill Tree',
    'tab.crystalShop': 'Crystal Shop',
    'tab.soulShop': 'Soul Shop',
    'tab.quests': 'Quests',
    'tab.statistics': 'Statistics',
    'tab.options': 'Options',
    'tab.buildings': 'Buildings',
    'tab.prestige': 'Prestige',
    'options.language': 'Language',
    'language.english': 'English',
    'language.spanish': 'Spanish',
    'combat.fight': 'Fight',
    'combat.stop': 'Stop',
    'combat.stage': 'Stage',
    'combat.bossLevel': 'Boss Level',
    'region.explore': 'Explore',
    'region.arena': 'Arena',
    'inventory.items': 'Items',
    'inventory.materials': 'Materials',
    'inventory.salvage': 'Salvage',
    'inventory.searchItems': 'Search items...',
    'inventory.equip': 'Equip',
    'inventory.sortItemsBy': 'Sort items by',
    'inventory.sortMaterials': 'Sort materials',
    'inventory.sortedMaterials': 'Sorted materials',
    'inventory.sortedItemsBy': 'Sorted items by',
    'inventory.sort': 'Sort',
    'inventory.typeRarityLevel': 'Type → Rarity → Level',
    'inventory.typeLevelRarity': 'Type → Level → Rarity',
    'inventory.rarityLevel': 'Rarity → Level',
    'inventory.levelRarity': 'Level → Rarity',
    'class.warrior': 'Warrior',
    'class.warriorDesc': 'A mighty warrior specializing in heavy armor and raw strength',
    'class.rogue': 'Rogue',
    'class.rogueDesc': 'Swift and deadly, focusing on critical hits and attack speed',
    'class.vampire': 'Vampire',
    'class.vampireDesc': 'Master of life-stealing and critical strikes',
    'class.paladin': 'Paladin',
    'class.paladinDesc': 'Holy warrior specializing in defense and vitality',
    'class.berserker': 'Berserker',
    'class.berserkerDesc': 'Frenzied fighter focusing on raw damage output',
    'class.elementalist': 'Elementalist',
    'class.elementalistDesc': 'Master of elemental damage types',
    'class.druid': 'Druid',
    'class.druidDesc': 'Wielder of nature magic and animal allies',
    'class.mage': 'Mage',
    'class.mageDesc': 'Master of arcane spells and destructive magic',
  },
  es: {
    'app.title': 'Interminable',
    'tab.stats': 'Estadísticas',
    'tab.training': 'Entrenamiento',
    'tab.inventory': 'Inventario',
    'tab.skilltree': 'Árbol de habilidades',
    'tab.crystalShop': 'Tienda de Cristales',
    'tab.soulShop': 'Tienda de Almas',
    'tab.quests': 'Misiones',
    'tab.statistics': 'Estadísticas',
    'tab.options': 'Opciones',
    'tab.buildings': 'Edificios',
    'tab.prestige': 'Prestigio',
    'options.language': 'Idioma',
    'language.english': 'Inglés',
    'language.spanish': 'Español',
    'combat.fight': 'Luchar',
    'combat.stop': 'Detener',
    'combat.stage': 'Etapa',
    'combat.bossLevel': 'Nivel de Jefe',
    'region.explore': 'Explorar',
    'region.arena': 'Arena',
    'inventory.items': 'Objetos',
    'inventory.materials': 'Materiales',
    'inventory.salvage': 'Reciclar',
    'inventory.searchItems': 'Buscar objetos...',
    'inventory.equip': 'Equipar',
    'inventory.sortItemsBy': 'Ordenar objetos por',
    'inventory.sortMaterials': 'Ordenar materiales',
    'inventory.sortedMaterials': 'Materiales ordenados',
    'inventory.sortedItemsBy': 'Objetos ordenados por',
    'inventory.sort': 'Ordenar',
    'inventory.typeRarityLevel': 'Tipo → Rareza → Nivel',
    'inventory.typeLevelRarity': 'Tipo → Nivel → Rareza',
    'inventory.rarityLevel': 'Rareza → Nivel',
    'inventory.levelRarity': 'Nivel → Rareza',
    'class.warrior': 'Guerrero',
    'class.warriorDesc': 'Un guerrero poderoso especializado en armadura pesada y fuerza bruta',
    'class.rogue': 'Pícaro',
    'class.rogueDesc': 'Rápido y mortal, enfocado en golpes críticos y velocidad de ataque',
    'class.vampire': 'Vampiro',
    'class.vampireDesc': 'Maestro del robo de vida y los golpes críticos',
    'class.paladin': 'Paladín',
    'class.paladinDesc': 'Guerrero sagrado especializado en defensa y vitalidad',
    'class.berserker': 'Berserker',
    'class.berserkerDesc': 'Luchador frenético centrado en el daño bruto',
    'class.elementalist': 'Elementalista',
    'class.elementalistDesc': 'Maestro de los tipos de daño elemental',
    'class.druid': 'Druida',
    'class.druidDesc': 'Portador de magia de la naturaleza y aliados animales',
    'class.mage': 'Mago',
    'class.mageDesc': 'Maestro de hechizos arcanos y magia destructiva',
  },
};

let currentLang = 'en';

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
  }
  applyTranslations();
}

export function t(key) {
  const langStrings = translations[currentLang] || {};
  return langStrings[key] || translations.en[key] || key;
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.title = t('app.title');
}

export function getCurrentLanguage() {
  return currentLang;
}
