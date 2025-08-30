import en from './languages/en.js';
import es from './languages/es.js';
import zh from './languages/zh.js';

const translations = { en, es, zh };

let currentLang = 'en';

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
  }
  applyTranslations();
}

export function t(key) {
  const langStrings = translations[currentLang] || {};
  return langStrings[key] || translations.en[key] || key;
}

export function tp(key, params = {}) {
  let str = t(key);
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    Object.prototype.hasOwnProperty.call(params, k) ? params[k] : `{${k}}`,
  );
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const value = t(key) || '';
    const forceHtml = el.hasAttribute('data-i18n-html');
    if (forceHtml || value.includes('<')) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key) || '');
  });

  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(key) || '');
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    el.setAttribute('aria-label', t(key) || '');
  });
  document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
    const key = el.getAttribute('data-i18n-alt');
    el.setAttribute('alt', t(key) || '');
  });
  // Ensure the document title does not contain raw HTML tags
  const rawTitle = t('app.title') || '';
  document.title = rawTitle.replace(/<[^>]*>/g, '');
}

export function getCurrentLanguage() {
  return currentLang;
}

