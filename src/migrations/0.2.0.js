import { createModal } from '../ui/modal.js';

export function run(rawData) {
  let data = JSON.parse(JSON.stringify(rawData || {}));

  const salt = Math.random().toString(36).substring(2, 15);
  if (typeof window !== 'undefined') {
    localStorage.setItem('game_backup_' + salt, JSON.stringify(data));
  }

  // DATA RESET
  data = {};

  showResetModal();

  return {
    data,
    result: true,
  };
}

function showResetModal() {
  createModal({
    id: 'reset-modal',
    className: 'reset-modal',
    content: `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <h2>Game Data Reset</h2>
        <p>Your game data has been fully reset due to an update or migration. We apologize for any inconvenience. Thank you for your understanding!</p>
        <div style="text-align:center; margin-top: 24px;">
          <button id="reset-modal-ok" style="padding: 8px 24px; font-size: 1.1em;">OK</button>
        </div>
      </div>
    `,
    onClose: () => {
      // Optionally, you can add any logic here if needed when modal closes
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
