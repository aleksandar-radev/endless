export class BattleLog {
  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
    this.battle = [];
    this.drops = [];
    this.battleFrozen = true;
    this.dropsFrozen = true;
  }

  addBattle(message) {
    if (this.battleFrozen) return;
    this.battle.push({ time: Date.now(), message });
    if (this.battle.length > this.maxEntries) this.battle.shift();
    document.dispatchEvent(new CustomEvent('battleLogUpdated'));
  }

  addDrop(message) {
    if (this.dropsFrozen) return;
    this.drops.push({ time: Date.now(), message });
    if (this.drops.length > this.maxEntries) this.drops.shift();
    document.dispatchEvent(new CustomEvent('battleLogUpdated'));
  }

  resetBattle() {
    this.battle = [];
    document.dispatchEvent(new CustomEvent('battleLogUpdated'));
  }

  resetDrops() {
    this.drops = [];
    document.dispatchEvent(new CustomEvent('battleLogUpdated'));
  }
}

export const battleLog = new BattleLog();
