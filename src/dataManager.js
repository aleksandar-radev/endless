import { loadGameData, saveGameData, apiFetch } from './api.js';
import { CHANGELOG } from './changelog/changelog.js';
import { crypt } from './functions.js';
import { getGlobals } from './globals.js';
import { createModal } from './ui/modal.js';
import { showToast } from './ui/ui.js';

const MAX_SLOTS = 5;

export class DataManager {
  constructor() {
    this.session = null;
    this.sessionInterval = null;
    this.currentSlot = parseInt(localStorage.getItem('gameCurrentSlot'), 10) || 0;
  }

  getSession() {
    return this.session;
  }

  setSession(user) {
    this.session = user;
  }

  clearSession() {
    this.session = null;
  }

  getCurrentSlot() {
    return this.currentSlot;
  }

  setCurrentSlot(slot) {
    this.currentSlot = Math.min(Math.max(slot, 0), MAX_SLOTS - 1);
    localStorage.setItem('gameCurrentSlot', this.currentSlot);
  }

  getSlotSummaries() {
    const summaries = [];
    for (let i = 0; i < MAX_SLOTS; i++) {
      const raw = localStorage.getItem(`gameProgress_${i}`);
      if (!raw) {
        summaries[i] = null;
        continue;
      }
      try {
        let data = crypt.decrypt(raw);
        if (typeof data === 'string') data = JSON.parse(data);
        summaries[i] = {
          level: data?.hero?.level ?? 0,
          path: data?.skillTree?.selectedPath?.name || null,
        };
      } catch {
        summaries[i] = null;
      }
    }
    return summaries;
  }

  async saveGame({ cloud = false } = {}) {
    const saveData = getGlobals();

    const encrypted = crypt.encrypt(JSON.stringify(saveData));
    const slotKey = `gameProgress_${this.currentSlot}`;
    localStorage.setItem(slotKey, encrypted);
    // Maintain legacy key for debug tools
    localStorage.setItem('gameProgress', encrypted);

    if (cloud) {
      try {
        const slots = [];
        for (let i = 0; i < MAX_SLOTS; i++) {
          if (i === this.currentSlot) {
            slots[i] = saveData;
          } else {
            const other = localStorage.getItem(`gameProgress_${i}`);
            if (other) {
              try {
                const decryptedData = (crypt.decrypt(other));
                slots[i] = decryptedData;
              } catch {
                slots[i] = null;
              }
            } else {
              slots[i] = null;
            }
          }
        }

        await saveGameData(this.session.id, {
          data_json: {
            slots,
            currentSlot: this.currentSlot,
          },
          game_name: import.meta.env.VITE_GAME_NAME,
        });
      } catch (e) {
        showToast('Cloud save failed!');
        console.error('Cloud save failed:', e);
      }
    }
  }

  async loadGame({ cloud = false, premium = 'no', statusCheck = false } = {}) {
    let data = null;
    let updated_at = null;
    let source = 'local';

    // get cloud save data
    try {
      if (cloud) {
        await this.checkSession();
        if (!this.session || !this.session.id) {
          console.warn('No session found, cannot load cloud data');
        } else {
          const result = await loadGameData(this.session.id, premium);
          if (result.data) {
            source = 'cloud';
            updated_at = result.updated_at;
            if (result.data.slots) {
              const slot = result.data.currentSlot || 0;
              if (!statusCheck) {
                this.currentSlot = slot;
                localStorage.setItem('gameCurrentSlot', this.currentSlot);
                for (let i = 0; i < MAX_SLOTS; i++) {
                  const slotData = result.data.slots[i];
                  if (slotData) {
                    localStorage.setItem(
                      `gameProgress_${i}`,
                      crypt.encrypt(JSON.stringify(slotData)),
                    );
                  }
                }
              }
              data = result.data.slots[slot];
            } else {
              data = result.data;
            }
          }
        }
      }
    } catch (e) {
      console.error('Cloud load failed:', e);
    }

    // if no cloud data, try local storage
    if (!data) {
      this.currentSlot = parseInt(localStorage.getItem('gameCurrentSlot'), 10) || 0;
      let dataStr = localStorage.getItem(`gameProgress_${this.currentSlot}`);

      if (!dataStr && this.currentSlot === 0) {
        const legacy = localStorage.getItem('gameProgress');
        if (legacy) {
          dataStr = legacy;
          localStorage.setItem('gameProgress_0', legacy);
        }
      }

      if (!dataStr) {
        console.warn('No game data found in local storage');
        return null;
      }

      try {
        data = crypt.decrypt(dataStr);
      } catch (e) {
        console.warn('Failed to decrypt game data:', e);

        try {
          data = JSON.parse(dataStr);
        } catch (e) {
          console.warn('Failed to parse game data:', dataStr);
          return null;
        }
      }
    }

    // get version
    let version = data.options?.version || null;

    if (!version) {
      const salt = Math.random().toString(36).substring(2, 15);
      if (typeof window !== 'undefined' && !statusCheck) {
        this._showResetModal();
        localStorage.setItem('game_backup_' + salt, JSON.stringify(data));
      }
      return null;
    }

    if (!statusCheck) {
      data = await this.runMigrations(data, version);
    }

    // check if is empty object
    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    data.source = source;
    data.updated_at = updated_at;
    return data;
  }

  async runMigrations(data, version) {
    let migratedData = data;
    const migrationContext = import.meta.glob('./migrations/*.js', { eager: true });
    const compareVersions = (a, b) => {
      const pa = a.split('.').map(Number);
      const pb = b.split('.').map(Number);
      for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const na = pa[i] || 0;
        const nb = pb[i] || 0;
        if (na > nb) return 1;
        if (na < nb) return -1;
      }
      return 0;
    };
    const migrations = Object.keys(migrationContext)
      .map((path) => {
        const match = path.match(/([\\/])(\d+\.\d+\.\d+)\.js$/);
        return match ? { version: match[2], path } : null;
      })
      .filter(Boolean)
      .sort((a, b) => compareVersions(a.version, b.version));

    let currentVersion = version;
    let lastMigration = null;
    for (const migration of migrations) {
      if (compareVersions(migration.version, currentVersion) > 0) {
        const migrationModule = migrationContext[migration.path];
        if (typeof migrationModule.run === 'function') {
          const { data: newData, result } = await migrationModule.run(migratedData);
          if (result === true) {
            lastMigration = { version: migration.version };
            currentVersion = migration.version;
            migratedData = newData;
          }
        }
      }
    }

    if (lastMigration) {
      // Read changelog for the last migration version using shared logic
      const changelogHtml = CHANGELOG[lastMigration.version];

      if (changelogHtml) {
        this._showMigrationModal(lastMigration.version, changelogHtml.run());
      }
    }

    if (migratedData.options) {
      migratedData.options.version = currentVersion;
    }
    return migratedData;
  }

  /**
   * Show a modal with migration info after a migration is run.
   * @param {string} version - Migration version
   * @param {string|object} info - Info or summary of changes
   */
  _showMigrationModal(version, info) {
    let contentHtml = `<div class="modal-content">
      <span class="modal-close">&times;</span>
      <h2>v${version}</h2>`;
    if (info) {
      contentHtml += `<div class="migration-info">${info}</div>`;
    }
    contentHtml += `<div style="text-align:center; margin-top: 24px;">
      <button id="migration-modal-ok" style="padding: 8px 24px; font-size: 1.1em;">OK</button>
    </div></div>`;

    createModal({
      id: `migration-modal-${version}`,
      className: 'migration-modal',
      content: contentHtml,
      onClose: () => {},
    });
    setTimeout(() => {
      const okBtn = document.getElementById('migration-modal-ok');
      if (okBtn) {
        okBtn.addEventListener('click', () => {
          const modal = document.getElementById(`migration-modal-${version}`);
          if (modal) modal.remove();
        });
      }
    }, 0);
  }

  async checkSession() {
    if (this.session !== null) {
      // Session already set, no need to check
      return;
    }
    try {
      const res = await apiFetch('/user/session');
      if (!res.ok) throw new Error('Not logged in');
      const user = (await res.json()).user;
      this.setSession(user);
    } catch (error) {
      this.clearSession();
    }
  }

  async startSessionMonitor() {
    await this.checkSession();
    if (this.sessionInterval) clearInterval(this.sessionInterval);
    this.sessionInterval = setInterval(() => this.checkSession(), 60000 * 60); // check every hour
  }

  _showResetModal() {
    createModal({
      id: 'reset-modal',
      className: 'reset-modal',
      content: `
            <div class="modal-content">
              <span class="modal-close">&times;</span>
              <h2>Game Data Reset</h2>
              <p>Your game data has been fully reset due to a major update or migration. We apologize for any inconvenience. Thank you for your understanding! Your data was not deleted, you can find it in <strong>localStorage</strong>. Contact support for assistance.</p>
              <div style="text-align:center; margin-top: 24px;">
                <button id="reset-modal-ok" style="padding: 8px 24px; font-size: 1.1em;">OK</button>
              </div>
            </div>
          `,
      onClose: () => {
        // Optionally, you can add any logic here if needed when modal closess
      },
    });
    // Add event listener for OK button
    setTimeout(() => {
      const okBtn = document.getElementById('reset-modal-ok');
      if (okBtn) {
        okBtn.addEventListener('click', () => {
          const modal = document.getElementById('reset-modal');
          if (modal) modal.remove();
        });
      }
    }, 0);
  }
}
