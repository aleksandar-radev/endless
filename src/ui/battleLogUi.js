import { battleLog } from '../battleLog.js';
import { t } from '../i18n.js';

const html = String.raw;

export function initializeBattleLogUI() {
  const panel = document.getElementById('battleLog');
  if (!panel) return;

  panel.innerHTML = html`<div class="battle-log-wrapper">
    <div class="battle-log-tabs">
      <button class="battle-log-tab active" data-log="battle" data-i18n="battleLog.battle">${t('battleLog.battle')}</button>
      <button class="battle-log-tab" data-log="drops" data-i18n="battleLog.drops">${t('battleLog.drops')}</button>
    </div>
    <div class="battle-log-controls">
      <button id="battle-log-reset" data-i18n="battleLog.reset">${t('battleLog.reset')}</button>
      <button id="battle-log-freeze" data-i18n="battleLog.freeze">${t('battleLog.freeze')}</button>
    </div>
    <div class="battle-log-content">
      <div id="battle-log-battle" class="log-list"></div>
      <div id="battle-log-drops" class="log-list hidden"></div>
    </div>
  </div>`;

  const tabs = panel.querySelectorAll('.battle-log-tab');
  const battleList = panel.querySelector('#battle-log-battle');
  const dropList = panel.querySelector('#battle-log-drops');
  const resetBtn = panel.querySelector('#battle-log-reset');
  const freezeBtn = panel.querySelector('#battle-log-freeze');

  let current = 'battle';

  function format(entry) {
    const time = new Date(entry.time).toLocaleTimeString();
    return `<div class="log-entry"><span class="timestamp">[${time}]</span>${entry.message}</div>`;
  }

  function render() {
    battleList.innerHTML = battleLog.battle.map(format).join('');
    dropList.innerHTML = battleLog.drops.map(format).join('');
  }

  function updateButtons() {
    const frozen = current === 'battle' ? battleLog.battleFrozen : battleLog.dropsFrozen;
    freezeBtn.textContent = frozen ? t('battleLog.unfreeze') : t('battleLog.freeze');
  }

  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      current = btn.dataset.log;
      tabs.forEach((b) => b.classList.toggle('active', b === btn));
      battleList.classList.toggle('hidden', current !== 'battle');
      dropList.classList.toggle('hidden', current !== 'drops');
      updateButtons();
    });
  });

  resetBtn.addEventListener('click', () => {
    if (current === 'battle') {
      battleLog.resetBattle();
    } else {
      battleLog.resetDrops();
    }
    render();
  });

  freezeBtn.addEventListener('click', () => {
    if (current === 'battle') {
      battleLog.battleFrozen = !battleLog.battleFrozen;
    } else {
      battleLog.dropsFrozen = !battleLog.dropsFrozen;
    }
    updateButtons();
  });

  document.addEventListener('battleLogUpdated', render);

  render();
  updateButtons();
}
