import { applyTranslations, t } from '../i18n.js';
import { createModal, closeModal } from '../ui/modal.js';

export const DEV_ACCESS_DEADLINE_ISO = '2025-10-31T23:59:59.999Z';

export function isDevAccessWindowActive(now = Date.now()) {
  return now <= new Date(DEV_ACCESS_DEADLINE_ISO).getTime();
}

export function run(rawData) {
  const data = JSON.parse(JSON.stringify(rawData || {}));
  data.options = data.options || {};

  if (data.options.devAccessDeadline !== DEV_ACCESS_DEADLINE_ISO) {
    data.options.devAccessDeadline = DEV_ACCESS_DEADLINE_ISO;
  }

  if (typeof data.options.devAccessModalDismissed !== 'boolean') {
    data.options.devAccessModalDismissed = false;
  }

  return { data, result: true };
}

export function ensureDevAccessRuntimeState(options) {
  let changed = false;

  if (options.devAccessDeadline !== DEV_ACCESS_DEADLINE_ISO) {
    options.devAccessDeadline = DEV_ACCESS_DEADLINE_ISO;
    changed = true;
  }

  if (typeof options.devAccessModalDismissed !== 'boolean') {
    options.devAccessModalDismissed = false;
    changed = true;
  }

  const active = isDevAccessWindowActive();

  return { active, changed };
}

export function appendDevAccessFooter({ environment, active }) {
  if (environment !== 'production') {
    if (document.querySelector('.dev-access-footer')) return;

    const footer = document.createElement('footer');
    footer.classList.add('dev-access-footer', 'dev-access-footer--test');
    footer.setAttribute('data-i18n', 'footer.devOptionsTestNotice');
    footer.setAttribute('data-i18n-html', 'true');

    document.body.appendChild(footer);
    applyTranslations();
    return;
  }

  if (!active) return;
  if (document.querySelector('.dev-access-footer')) return;

  const footer = document.createElement('footer');
  footer.classList.add('dev-access-footer');
  footer.setAttribute('data-i18n', 'footer.devOptionsNotice');
  footer.setAttribute('data-i18n-html', 'true');

  document.body.appendChild(footer);
  applyTranslations();
}

export function showDevAccessApologyModal({
  active, options, dataManager,
}) {
  if (!active) return;
  if (!options || options.devAccessModalDismissed) return;

  const content = `
    <div class="modal-content dev-access-modal__content">
      <span class="modal-close">&times;</span>
      <h2>${t('migration.0_8_15.apologyTitle')}</h2>
      <p>${t('migration.0_8_15.apologyBody')}</p>
      <div class="dev-access-modal__actions">
        <button id="dev-access-modal-ok" class="dev-access-modal__confirm">${t('migration.0_8_15.apologyConfirm')}</button>
      </div>
    </div>
  `;

  createModal({
    id: 'dev-access-apology-modal',
    className: 'migration-modal dev-access-modal',
    content,
    closeOnOutsideClick: false,
    onClose: () => {
      if (options && !options.devAccessModalDismissed) {
        options.devAccessModalDismissed = true;
        if (dataManager && typeof dataManager.saveGame === 'function') {
          dataManager.saveGame();
        }
      }
      const overlay = document.getElementById('dev-access-apology-modal');
      if (overlay) {
        overlay.remove();
      }
    },
  });

  setTimeout(() => {
    const okBtn = document.getElementById('dev-access-modal-ok');
    if (okBtn) {
      okBtn.addEventListener('click', () => {
        closeModal('dev-access-apology-modal');
      });
    }
  }, 0);
}
