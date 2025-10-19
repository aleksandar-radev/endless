import { loadGameData, saveGameData, apiFetch } from './api.js';
import { CHANGELOG } from './changelog/changelog.js';
import { crypt } from './functions.js';
import { getGlobals } from './globals.js';
import { createModal } from './ui/modal.js';
import { showToast } from './ui/ui.js';
import { t } from './i18n.js';
import { getTimeNow } from './common.js';

const SAVE_INTERVAL_MS = 5000;

const MAX_SLOTS = 5;
const BACKUP_KEY_PREFIX = 'gameProgressBackup_';
const BACKUP_MAX_ENTRIES = 7;

const toDateKey = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export class DataManager {
  constructor() {
    this.session = null;
    this.sessionInterval = null;
    this.currentSlot = parseInt(localStorage.getItem('gameCurrentSlot'), 10) || 0;
    // Delay updating last combat time until offline rewards have been processed
    this.enableLastFightTime = false;
    this.lastLocalSaveAt = 0;
    this._pendingSaveTimer = null;
    this._pendingSavePromise = null;
    this._pendingSaveResolve = null;
    this._pendingSaveReject = null;
    this._lastSerializedSnapshot = null;
    this._lastEncryptedSnapshot = null;
    this._saveInFlight = null;
    this.saveGame = this.saveGame.bind(this);
  }

  toJSON() {
    return {
      session: this.session,
      sessionInterval: this.sessionInterval,
      currentSlot: this.currentSlot,
      enableLastFightTime: this.enableLastFightTime,
      lastLocalSaveAt: this.lastLocalSaveAt,
    };
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
    if (typeof localStorage === 'undefined') {
      return Array(MAX_SLOTS).fill(null);
    }
    const summaries = [];
    for (let i = 0; i < MAX_SLOTS; i++) {
      const raw = localStorage.getItem(`gameProgress_${i}`);
      const summary = this._getSaveSummary(raw);
      if (summary) {
        summaries[i] = {
          level: summary.level,
          path: summary.path,
        };
      } else {
        summaries[i] = null;
      }
    }
    return summaries;
  }

  createDailyBackups() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    const today = toDateKey(new Date());
    if (!today) return;

    for (let slot = 0; slot < MAX_SLOTS; slot++) {
      const raw = localStorage.getItem(`gameProgress_${slot}`);
      if (!raw) continue;

      const backups = this._readBackupsForSlot(slot);
      let modified = backups._dirty === true;

      if (!backups.some((entry) => entry.date === today)) {
        const summary = this._getSaveSummary(raw);
        const entry = {
          slot,
          date: today,
          timestamp: Date.now(),
          level: summary?.level ?? 0,
          path: summary?.path || null,
          data: raw,
        };
        backups.push(entry);
        modified = true;
      }

      backups.sort((a, b) => b.timestamp - a.timestamp);
      if (backups.length > BACKUP_MAX_ENTRIES) {
        backups.splice(BACKUP_MAX_ENTRIES);
        modified = true;
      }

      if (modified) {
        this._writeBackupsForSlot(slot, backups);
      }
    }
  }

  getBackupsForSlot(slot = this.getCurrentSlot()) {
    if (slot < 0 || slot >= MAX_SLOTS) return [];
    const backups = this._readBackupsForSlot(slot);
    return backups
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(({ data, ...rest }) => ({ ...rest }));
  }

  getBackup(slot, timestamp) {
    if (slot < 0 || slot >= MAX_SLOTS) return null;
    const backups = this._readBackupsForSlot(slot);
    const found = backups.find((entry) => entry.timestamp === timestamp);
    return found ? { ...found } : null;
  }

  restoreBackup(slot, timestamp) {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    const backup = this.getBackup(slot, timestamp);
    if (!backup || !backup.data) {
      return false;
    }

    const slotKey = `gameProgress_${slot}`;
    try {
      this._writeLocalSave(slotKey, backup.data, { optional: false });
      if (slot === this.getCurrentSlot()) {
        this._writeLocalSave('gameProgress', backup.data, { optional: true });
      }
      return true;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return false;
    }
  }

  async saveGame({ cloud = false, force = false } = {}) {
    if (cloud) {
      return this._performSave({ cloud: true });
    }

    if (force) {
      return this._performSave({ cloud: false });
    }

    if (this._pendingSavePromise) {
      return this._pendingSavePromise;
    }

    const now = Date.now();
    const delay = Math.max(0, (this.lastLocalSaveAt || 0) + SAVE_INTERVAL_MS - now);

    this._pendingSavePromise = new Promise((resolve, reject) => {
      this._pendingSaveResolve = resolve;
      this._pendingSaveReject = reject;
    });

    const triggerSave = () => {
      this._performSave({ cloud: false }).catch(() => {});
    };

    if (delay === 0) {
      triggerSave();
    } else {
      this._pendingSaveTimer = setTimeout(triggerSave, delay);
    }

    return this._pendingSavePromise;
  }

  async _performSave({ cloud }) {
    if (this._saveInFlight) {
      await this._saveInFlight;
    }

    if (this._pendingSaveTimer) {
      clearTimeout(this._pendingSaveTimer);
      this._pendingSaveTimer = null;
    }

    const resolve = this._pendingSaveResolve;
    const reject = this._pendingSaveReject;
    this._pendingSavePromise = null;
    this._pendingSaveResolve = null;
    this._pendingSaveReject = null;

    const saveOperation = (async () => {
      const saveData = getGlobals();
      if (this.enableLastFightTime) {
        const serverNow = await getTimeNow();
        const localNow = Date.now();
        saveData.statistics.lastFightActive = serverNow;
        saveData.statistics.lastFightActiveLocal = localNow;
      } else if (!Number.isFinite(saveData.statistics?.lastFightActiveLocal)) {
        saveData.statistics.lastFightActiveLocal = Date.now();
      }

      const serialized = JSON.stringify(saveData);
      let encrypted;
      if (serialized === this._lastSerializedSnapshot && this._lastEncryptedSnapshot) {
        encrypted = this._lastEncryptedSnapshot;
      } else {
        encrypted = crypt.encrypt(serialized);
        this._lastSerializedSnapshot = serialized;
        this._lastEncryptedSnapshot = encrypted;
      }

      const slotKey = `gameProgress_${this.currentSlot}`;
      this._writeLocalSave(slotKey, encrypted, { optional: false });
      // Maintain legacy key for debug tools when possible without exceeding quota
      this._writeLocalSave('gameProgress', encrypted, { optional: true });

      this.lastLocalSaveAt = Date.now();
      this._dispatchSavedEvent(this.lastLocalSaveAt);

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
                  const decryptedData = crypt.decrypt(other);
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
          showToast(t('dataManager.cloudSaveFailed'));
          console.error('Cloud save failed:', e);
        }
      }
    })();

    this._saveInFlight = saveOperation;

    try {
      await saveOperation;
      if (resolve) resolve();
    } catch (error) {
      if (reject) reject(error);
      throw error;
    } finally {
      this._saveInFlight = null;
    }
  }

  _writeLocalSave(key, value, { optional } = { optional: false }) {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      if (!this._isQuotaExceeded(error)) {
        throw error;
      }

      console.warn(`Local storage quota exceeded while writing ${key}. Attempting cleanup.`, error);
      const removedKeys = this._purgeBackupSaves();

      try {
        localStorage.setItem(key, value);
        if (removedKeys.length > 0) {
          console.info('Recovered space for local save by removing backups:', removedKeys);
        }
        return true;
      } catch (retryError) {
        if (!optional) {
          showToast(t('dataManager.localSaveFailed'));
        }
        console.error(`Failed to persist ${key} after freeing space.`, retryError);
        if (optional) {
          return false;
        }
        throw retryError;
      }
    }
  }

  _isQuotaExceeded(error) {
    if (!error) return false;
    return (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014
    );
  }

  _purgeBackupSaves() {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('game_backup_')) {
        keysToRemove.push(key);
      } else if (key && key.startsWith(BACKUP_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    return keysToRemove;
  }

  _getBackupStorageKey(slot) {
    return `${BACKUP_KEY_PREFIX}${slot}`;
  }

  _readBackupsForSlot(slot) {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    try {
      const raw = localStorage.getItem(this._getBackupStorageKey(slot));
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      let dirty = false;
      const normalized = parsed.map((entry) => {
        const normalizedSlot = typeof entry.slot === 'number' ? entry.slot : slot;
        if (normalizedSlot !== entry.slot) dirty = true;
        const normalizedTimestamp = typeof entry.timestamp === 'number' ? entry.timestamp : 0;
        if (normalizedTimestamp !== entry.timestamp) dirty = true;
        const normalizedLevel = typeof entry.level === 'number' ? entry.level : 0;
        if (normalizedLevel !== entry.level) dirty = true;
        if (entry.path !== undefined && entry.path !== null && typeof entry.path !== 'string') {
          dirty = true;
        }
        return {
          slot: normalizedSlot,
          date: entry.date || null,
          timestamp: normalizedTimestamp,
          level: normalizedLevel,
          path: typeof entry.path === 'string' ? entry.path : null,
          data: typeof entry.data === 'string' ? entry.data : null,
        };
      });

      const cleaned = normalized.filter((entry) => {
        const valid = entry.data && entry.date && entry.timestamp;
        if (!valid) dirty = true;
        return valid;
      });

      if (cleaned.length !== parsed.length) {
        dirty = true;
      }

      cleaned._dirty = dirty;
      return cleaned;
    } catch (error) {
      console.warn('Failed to parse backup data for slot', slot, error);
      return [];
    }
  }

  _writeBackupsForSlot(slot, backups) {
    if (typeof localStorage === 'undefined') {
      return;
    }
    const sanitized = backups
      .filter((entry) => entry && typeof entry.data === 'string')
      .map((entry) => ({
        slot,
        date: entry.date,
        timestamp: entry.timestamp,
        level: entry.level ?? 0,
        path: entry.path || null,
        data: entry.data,
      }));
    this._writeLocalSave(this._getBackupStorageKey(slot), JSON.stringify(sanitized), { optional: true });
  }

  _decodeSaveData(raw) {
    if (!raw) return null;
    try {
      let data = crypt.decrypt(raw);
      if (typeof data === 'string') data = JSON.parse(data);
      if (!data || typeof data !== 'object') return null;
      return data;
    } catch (err) {
      try {
        const data = JSON.parse(raw);
        if (!data || typeof data !== 'object') return null;
        return data;
      } catch {
        return null;
      }
    }
  }

  _getSaveSummary(raw) {
    const data = this._decodeSaveData(raw);
    if (!data) return null;
    const selectedPath = data?.skillTree?.selectedPath;
    const path = selectedPath?.id ?? selectedPath?.name ?? null;
    return {
      level: data?.hero?.level ?? 0,
      path,
    };
  }

  _dispatchSavedEvent(timestamp) {
    if (typeof document !== 'undefined') {
      document.dispatchEvent(
        new CustomEvent('dataManager:saved', {
          detail: { timestamp },
        }),
      );
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
