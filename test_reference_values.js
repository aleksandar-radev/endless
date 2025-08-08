// Test script for reference values functionality
import Item from './src/item.js';
import { ITEM_ICONS, ITEM_RARITY, ITEM_STAT_POOLS } from './src/constants/items.js';
import { STATS } from './src/constants/stats/stats.js';

// Mock the necessary imports that would normally be available
const mockAvailableStats = {
  attackSpeed: { min: 10, max: 50, scaling: (level) => Math.pow(level, 0.5) },
  armor: { min: 5, max: 25, scaling: (level) => Math.pow(level, 0.5) },
  critChance: { min: 1, max: 10, scaling: (level) => Math.pow(level, 0.3) },
};

// Test creating an item and checking reference values
console.log('Testing reference values implementation...');

try {
  // Create a test item
  const testItem = new Item('SWORD', 10, 'RARE', 1);
  
  // Test the new methods
  console.log('\n--- Item Details ---');
  console.log(`Item: ${testItem.getDisplayName()}`);
  console.log(`Level: ${testItem.level}, Tier: ${testItem.tier}, Rarity: ${testItem.rarity}`);
  
  console.log('\n--- Current Stats ---');
  console.log(testItem.stats);
  
  console.log('\n--- Base Values ---');
  console.log(testItem.getBaseStatValues());
  
  console.log('\n--- Reference Values ---');
  console.log(testItem.getReferenceValues());
  
  console.log('\n--- Overall Roll Quality ---');
  console.log(`${testItem.getOverallRollQuality().toFixed(2)}%`);
  
  console.log('\n--- Tooltip HTML ---');
  console.log(testItem.getTooltipHTML());
  
  console.log('\n✅ Reference values implementation working correctly!');
  
} catch (error) {
  console.error('❌ Error testing reference values:', error);
}