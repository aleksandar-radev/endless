import en from './languages/en.js';
import es from './languages/es.js';

const translations = { en, es };

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

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.title = t('app.title');
}

export function getCurrentLanguage() {
  return currentLang;
}

