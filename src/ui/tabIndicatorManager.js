import { hero, skillTree } from '../globals.js';

/**
 * Manages "new action required" indicators on top-level tabs.
 * Displays colored dots on tabs when user attention is needed.
 */
export class TabIndicatorManager {
  constructor({ tabsContainerSelector = '.tab-buttons' } = {}) {
    this.tabs = {};
    this.clearedIndicators = new Set(); // Track which indicators have been manually cleared

    // Track previous state to detect when new conditions arise
    this.previousStatPoints = 0;
    this.previousSkillPoints = 0;
    this.previousClaimableQuests = 0;

    // Find all tab buttons
    const tabButtons = Array.from(document.querySelectorAll(`${tabsContainerSelector} .tab-btn`));
    tabButtons.forEach((btn) => {
      const tabName = btn.dataset.tab;
      if (tabName) {
        // Store reference to each tab button. Indicator dots are handled via CSS pseudo-elements,
        // so no additional DOM nodes are required.
        this.tabs[tabName] = btn;
      }
    });
  }

  /**
   * Show the indicator dot on a tab.
   * @param {string} tabName - The tab to show indicator on
   */
  showIndicator(tabName) {
    const tab = this.tabs[tabName];
    if (tab) {
      tab.classList.add('has-indicator');
    }
  }
  /**
   * Remove the indicator dot from a tab.
   * @param {string} tabName - The tab to clear indicator from
   */
  clearIndicator(tabName) {
    const tab = this.tabs[tabName];
    if (tab) {
      tab.classList.remove('has-indicator');
      // Mark this indicator as manually cleared
      this.clearedIndicators.add(tabName);
    }
  }

  /**
   * Remove the indicator dot from a tab without marking as manually cleared.
   * @param {string} tabName - The tab to clear indicator from
   */
  clearIndicatorOnly(tabName) {
    const tab = this.tabs[tabName];
    if (tab) {
      tab.classList.remove('has-indicator');
    }
  }

  /**
   * Reset the cleared status for an indicator (when new condition occurs).
   * @param {string} tabName - The tab name
   */
  resetClearedStatus(tabName) {
    this.clearedIndicators.delete(tabName);
  }

  /**
   * Toggle indicator on/off for a tab.
   * @param {string} tabName - The tab name
   * @param {boolean} show - Whether to show or hide the indicator
   */
  toggleIndicator(tabName, show) {
    if (show) {
      this.showIndicator(tabName);
    } else {
      this.clearIndicator(tabName);
    }
  }
  /**
   * Update all tab indicators based on game state.
   * Call this whenever relevant game data changes.
   * @param {Object} state - Game state object
   * @param {number} state.unallocatedStatPoints - Number of unallocated attribute points
   * @param {boolean} state.hasNewInventoryItems - Whether new items/materials were found
   * @param {number} state.unallocatedSkillPoints - Number of unallocated skill points
   * @param {number} state.claimableQuests - Number of quests ready to claim
   * @param {string} state.currentTab - Current active tab
   */
  updateAll(state) {
    const {
      unallocatedStatPoints = 0,
      hasNewInventoryItems = false,
      unallocatedSkillPoints = 0,
      claimableQuests = 0,
      currentTab = 'stats',
    } = state;

    // Stats tab: show indicator when there are unallocated attribute points
    // Reset cleared status if points increased from previous value (level up happened)
    if (unallocatedStatPoints > this.previousStatPoints) {
      this.resetClearedStatus('stats');
    }
    this.previousStatPoints = unallocatedStatPoints;

    if (unallocatedStatPoints > 0 && !this.clearedIndicators.has('stats')) {
      this.showIndicator('stats');
    } else {
      this.clearIndicatorOnly('stats');
    }

    // Inventory tab: show indicator when new items found AND not currently on inventory tab
    // The hasNewInventoryItems flag is cleared when visiting inventory, so we can use it directly
    if (hasNewInventoryItems && currentTab !== 'inventory') {
      this.showIndicator('inventory');
    } else {
      this.clearIndicatorOnly('inventory');
    }

    // Skill tree tab: show indicator when there are unallocated skill points
    // Only show if a path is chosen
    if (!!skillTree.selectedPath) {
      if (unallocatedSkillPoints > this.previousSkillPoints) {
        this.resetClearedStatus('skilltree');
      }
      this.previousSkillPoints = unallocatedSkillPoints;

      if (unallocatedSkillPoints > 0 && !this.clearedIndicators.has('skilltree')) {
        this.showIndicator('skilltree');
      } else {
        this.clearIndicatorOnly('skilltree');
      }
    } else {
      this.clearIndicatorOnly('skilltree');
      this.previousSkillPoints = unallocatedSkillPoints;
    }

    // Quests tab: show indicator when there are claimable quests
    // Reset cleared status if claimable quests increased from previous value (quest completed)
    if (claimableQuests > this.previousClaimableQuests) {
      this.resetClearedStatus('quests');
    }
    this.previousClaimableQuests = claimableQuests;

    if (claimableQuests > 0 && !this.clearedIndicators.has('quests')) {
      this.showIndicator('quests');
    } else {
      this.clearIndicatorOnly('quests');
    }

    // Training and CrystalShop tabs don't need indicators per requirements
    this.clearIndicatorOnly('training');
    this.clearIndicatorOnly('crystalShop');
    this.clearIndicatorOnly('options');
  }
  /**
   * Clear all indicators.
   */
  clearAll() {
    Object.keys(this.tabs).forEach((tabName) => {
      this.clearIndicator(tabName);
    });
  }
  /**
   * Mark a tab as visited (clear its indicator).
   * @param {string} tabName - Tab name that was visited
   */
  markTabAsVisited(tabName) {
    // Mark indicator as cleared when switching to a tab (visiting it)
    if (tabName === 'stats') {
      this.previousStatPoints = hero.statPoints;
    } else if (tabName === 'skilltree') {
      this.previousSkillPoints = skillTree.skillPoints;
    }
    this.clearedIndicators.add(tabName);
    this.clearIndicator(tabName);
  }
}
