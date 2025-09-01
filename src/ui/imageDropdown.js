let _stylesInjected = false;
function ensureStyles() {
  if (_stylesInjected) return;
  _stylesInjected = true;
  const css = `
  .img-dd-container { position: relative; display: inline-block; min-width: 180px; font-family: inherit; }
  .img-dd-selected { display:flex; align-items:center; gap:8px; padding:6px 8px; border:1px solid #ccc; background:#fff; cursor:pointer; color: black; }
  .img-dd-selected img { width:24px; height:24px; object-fit:cover; border-radius:3px; }
  .img-dd-options { position:absolute; left:0; right:0; z-index:9999; background:#fff; border:1px solid #ccc; max-height:240px; overflow:auto; margin-top:4px; box-shadow:0 6px 18px rgba(0,0,0,0.08); }
  .img-dd-option { display:flex; align-items:center; gap:8px; padding:6px 8px; cursor:pointer; color: black; }
  .img-dd-option[aria-selected="true"], .img-dd-option:hover { background:#f3f4f6; }
  .img-dd-option img { width:20px; height:20px; object-fit:cover; border-radius:3px; }
  .img-dd-hidden-native { position:absolute !important; left:-9999px !important; }
  `;
  const s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);
}

function createOptionNode(text, iconUrl, disabled) {
  const el = document.createElement('div');
  el.className = 'img-dd-option';
  el.setAttribute('role', 'option');
  if (disabled) el.setAttribute('aria-disabled', 'true');
  if (iconUrl) {
    const img = document.createElement('img');
    img.src = iconUrl;
    img.alt = '';
    el.appendChild(img);
  }
  const span = document.createElement('span');
  span.innerHTML = text;
  el.appendChild(span);
  return el;
}

function closeAll(except) {
  document.querySelectorAll('.img-dd-container.open').forEach(c => {
    if (c === except) return;
    c.classList.remove('open');
    const opts = c.querySelector('.img-dd-options');
    if (opts) opts.style.display = 'none';
  });
}

/**
 * Create an image dropdown directly from data (no native <select> required).
 * items: [{ id, text, icon }]
 * initialId: optional selected id
 * onChange: function(id) called when selection changes
 * Returns { container, getValue, setValue }
 */
export function createImageDropdownFromData(items, initialId = null, onChange = null) {
  ensureStyles();
  const container = document.createElement('div');
  container.className = 'img-dd-container';
  container.tabIndex = 0;

  const selected = document.createElement('div');
  selected.className = 'img-dd-selected';
  selected.setAttribute('role', 'button');
  selected.setAttribute('aria-haspopup', 'listbox');

  const optionsPane = document.createElement('div');
  optionsPane.className = 'img-dd-options';
  optionsPane.setAttribute('role', 'listbox');
  optionsPane.style.display = 'none';

  let currentId = initialId !== null ? initialId : (items[0] && items[0].id) || null;

  function buildOptions() {
    optionsPane.innerHTML = '';
    items.forEach((it, idx) => {
      const node = createOptionNode(it.text, it.icon, it.disabled);
      if (it.id === currentId) node.setAttribute('aria-selected', 'true');
      node.addEventListener('click', () => {
        if (it.disabled) return;
        setValue(it.id);
        closeAll();
      });
      optionsPane.appendChild(node);
    });
  }

  function updateSelected() {
    selected.innerHTML = '';
    const cur = items.find(i => i.id === currentId);
    if (!cur) return;
    if (cur.icon) {
      const img = document.createElement('img');
      img.src = cur.icon;
      img.alt = '';
      selected.appendChild(img);
    }
    const span = document.createElement('span');
    span.innerHTML = cur.text;
    selected.appendChild(span);

    const optionNodes = optionsPane.querySelectorAll('.img-dd-option');
    optionNodes.forEach((n,i) => n.setAttribute('aria-selected', (items[i].id === currentId).toString()));
  }

  function setValue(id) {
    currentId = id;
    updateSelected();
    onChange && onChange(id);
  }

  selected.addEventListener('click', () => {
    const open = container.classList.toggle('open');
    optionsPane.style.display = container.classList.contains('open') ? '' : 'none';
    if (open) closeAll(container);
  });

  container.addEventListener('keydown', (e) => {
    const open = container.classList.contains('open');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { selected.click(); return; }
      const idx = items.findIndex(i => i.id === currentId);
      let next = idx;
      if (e.key === 'ArrowDown') next = Math.min(items.length - 1, idx + 1);
      else next = Math.max(0, idx - 1);
      setValue(items[next].id);
      const opts = optionsPane.querySelectorAll('.img-dd-option');
      opts[next] && opts[next].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!open) selected.click(); else { container.classList.remove('open'); optionsPane.style.display='none'; }
    } else if (e.key === 'Escape') {
      container.classList.remove('open');
      optionsPane.style.display='none';
    }
  });

  document.addEventListener('click', (ev) => {
    if (!container.contains(ev.target)) {
      container.classList.remove('open');
      optionsPane.style.display = 'none';
    }
  });

  container.appendChild(selected);
  container.appendChild(optionsPane);
  buildOptions();
  updateSelected();

  return {
    container,
    getValue: () => currentId,
    setValue,
  };
}
