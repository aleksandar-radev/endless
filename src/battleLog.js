export class BattleLog {
  constructor(maxEntries = 500) {
    this.maxEntries = maxEntries;
    this.battle = [];
    this.drops = [];
    this.battleFrozen = false;
    this.dropsFrozen = false;
  }

  addBattle(entry) {
    if (this.battleFrozen) return;
    this.battle.push(entry);
    if (this.battle.length > this.maxEntries) this.battle.shift();
    document.dispatchEvent(new CustomEvent('battleLogUpdated'));
  }

  addDrop(entry) {
    if (this.dropsFrozen) return;
    this.drops.push(entry);
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
