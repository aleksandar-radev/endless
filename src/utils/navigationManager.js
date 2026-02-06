// src/utils/navigationManager.js

class NavigationManager {
  constructor() {
    this.isSyncing = false;
    this.currentTab = null;
    this.currentSubTab = null;
    this.currentSkillTreeTab = null;
    this.currentModal = null;
    this.initialized = false;
  }

  init(callbacks) {
    if (this.initialized) return;
    this.callbacks = callbacks; // { switchTab, switchShopSubTab, switchSkillTreeTab, switchJournalSubTab, switchOptionsSubTab, switchStatsSubTab, closeModal }
    
    window.addEventListener('popstate', () => this.handlePopState());
    this.initialized = true;
  }

  /**
   * Sync the UI state from the current URL query parameters.
   */
  syncFromUrl() {
    this.isSyncing = true;
    const params = new URLSearchParams(window.location.search);
    
    const tab = params.get('tab');
    const subtab = params.get('subtab');
    const skillTreeTab = params.get('skilltree-tab');
    const modal = params.get('modal');

    // Handle Tab
    if (tab && this.callbacks.switchTab) {
      this.callbacks.switchTab(tab, { skipUrlUpdate: true });
    }

    // Handle Subtab (Generic)
    if (subtab) {
      const activeTab = tab || this.currentTab;
      if (activeTab === 'shop' && this.callbacks.switchShopSubTab) {
        this.callbacks.switchShopSubTab(subtab, { skipUrlUpdate: true });
      } else if (activeTab === 'journal' && this.callbacks.switchJournalSubTab) {
        this.callbacks.switchJournalSubTab(subtab, { skipUrlUpdate: true });
      } else if (activeTab === 'options' && this.callbacks.switchOptionsSubTab) {
        this.callbacks.switchOptionsSubTab(subtab, { skipUrlUpdate: true });
      } else if (activeTab === 'stats' && this.callbacks.switchStatsSubTab) {
        this.callbacks.switchStatsSubTab(subtab, { skipUrlUpdate: true });
      }
    }

    // Handle Skill Tree Tab (Special case as it can be deep linked with main tab)
    if (skillTreeTab && this.callbacks.switchSkillTreeTab) {
      this.callbacks.switchSkillTreeTab(skillTreeTab, { skipUrlUpdate: true });
    }

    // Handle Modal
    if (modal) {
      this.currentModal = modal;
    }

    this.isSyncing = false;
  }

  /**
   * Update the URL to match the current UI state.
   */
  updateUrl({ tab, subtab, skillTreeTab, modal }, { push = true } = {}) {
    if (this.isSyncing) return;

    const params = new URLSearchParams(window.location.search);
    let changed = false;

    if (tab !== undefined) {
      if (tab) {
        if (params.get('tab') !== tab) {
          params.set('tab', tab);
          changed = true;
        }
      } else if (params.has('tab')) {
        params.delete('tab');
        changed = true;
      }
      this.currentTab = tab || null;
    }

    if (subtab !== undefined) {
      if (subtab) {
        if (params.get('subtab') !== subtab) {
          params.set('subtab', subtab);
          changed = true;
        }
      } else if (params.has('subtab')) {
        params.delete('subtab');
        changed = true;
      }
      this.currentSubTab = subtab || null;
    }

    if (skillTreeTab !== undefined) {
      if (skillTreeTab) {
        if (params.get('skilltree-tab') !== skillTreeTab) {
          params.set('skilltree-tab', skillTreeTab);
          changed = true;
        }
      } else if (params.has('skilltree-tab')) {
        params.delete('skilltree-tab');
        changed = true;
      }
      this.currentSkillTreeTab = skillTreeTab || null;
    }

    if (modal !== undefined) {
      if (modal) {
        if (params.get('modal') !== modal) {
          params.set('modal', modal);
          changed = true;
        }
      } else if (params.has('modal')) {
        params.delete('modal');
        changed = true;
      }
      this.currentModal = modal || null;
    }

    if (changed) {
      const queryString = params.toString();
      const newUrl = `${window.location.pathname}${queryString ? '?' + queryString : ''}${window.location.hash}`;
      
      const state = { 
        tab: this.currentTab, 
        subtab: this.currentSubTab, 
        skillTreeTab: this.currentSkillTreeTab,
        modal: this.currentModal 
      };

      if (push) {
        window.history.pushState(state, '', newUrl);
      } else {
        window.history.replaceState(state, '', newUrl);
      }
    }
  }

  handlePopState() {
    this.isSyncing = true;
    const params = new URLSearchParams(window.location.search);
    
    const tab = params.get('tab');
    const subtab = params.get('subtab');
    const skillTreeTab = params.get('skilltree-tab');
    const modal = params.get('modal');

    // 1. Handle Modals (Close if it changed or is no longer in URL)
    if (this.currentModal && this.currentModal !== modal) {
      if (this.callbacks.closeModal) {
        this.callbacks.closeModal(this.currentModal);
      }
    }
    this.currentModal = modal;

    // 2. Handle Tabs
    if (tab && tab !== this.currentTab) {
      if (this.callbacks.switchTab) {
        this.callbacks.switchTab(tab, { skipUrlUpdate: true });
      }
    }
    this.currentTab = tab;

    // 3. Handle Subtabs
    if (subtab && subtab !== this.currentSubTab) {
      const activeTab = tab || this.currentTab;
      if (activeTab === 'shop' && this.callbacks.switchShopSubTab) {
        this.callbacks.switchShopSubTab(subtab, { skipUrlUpdate: true });
      } else if (activeTab === 'journal' && this.callbacks.switchJournalSubTab) {
        this.callbacks.switchJournalSubTab(subtab, { skipUrlUpdate: true });
      } else if (activeTab === 'options' && this.callbacks.switchOptionsSubTab) {
        this.callbacks.switchOptionsSubTab(subtab, { skipUrlUpdate: true });
      } else if (activeTab === 'stats' && this.callbacks.switchStatsSubTab) {
        this.callbacks.switchStatsSubTab(subtab, { skipUrlUpdate: true });
      }
    }
    this.currentSubTab = subtab;

    // 4. Handle Skill Tree Tabs
    if (skillTreeTab && skillTreeTab !== this.currentSkillTreeTab) {
      if (this.callbacks.switchSkillTreeTab) {
        this.callbacks.switchSkillTreeTab(skillTreeTab, { skipUrlUpdate: true });
      }
    }
    this.currentSkillTreeTab = skillTreeTab;

    this.isSyncing = false;
  }
}

export const navigationManager = new NavigationManager();
