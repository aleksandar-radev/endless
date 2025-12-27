// modal.js
// Generic modal helper for creating and closing overlay dialogs

// Create a modal overlay
// options:
//  - id: DOM id for the overlay element
//  - className: CSS class to apply to overlay (e.g. 'training-modal')
//  - content: HTML string to inject inside overlay
//  - onClose: optional callback when modal closes
export function createModal({
  id, className, content, onClose, closeOnOutsideClick = true,
}) {
  // Remove existing modal with same id
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = id;
  // apply specific and generic modal classes
  overlay.classList.add('modal');
  if (className) overlay.classList.add(...className.split(' '));
  overlay.innerHTML = content;
  document.body.appendChild(overlay);

  // Handle close button clicks
  const closeBtn = overlay.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeModal(id));
  }

  // Handle ESC key to close only the topmost modal
  function escListener(e) {
    if (e.key === 'Escape') {
      // Only close if this is the topmost modal
      const modals = Array.from(document.querySelectorAll('.modal:not(.hidden)'));
      if (modals.length && modals[modals.length - 1] === overlay) {
        closeModal(id);
      }
    }
  }
  document.addEventListener('keydown', escListener);

  // Clicking outside content closes modal
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay && closeOnOutsideClick) closeModal(id);
  });

  // Store onClose callback
  if (typeof onClose === 'function') {
    overlay._onClose = onClose;
  }

  return overlay;
}

// Close a modal overlay by id or element
export function closeModal(identifier) {
  const overlay = typeof identifier === 'string' ? document.getElementById(identifier) : identifier;
  if (overlay) {
    const cb = overlay._onClose;
    // hide overlay instead of removing to allow reopen
    overlay.classList.add('hidden');
    if (cb) cb();
  }
}
