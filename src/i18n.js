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
    const value = t(key) || '';
    // If the translation contains HTML (or element explicitly requests HTML), insert as HTML
    const forceHtml = el.hasAttribute('data-i18n-html');
    if (forceHtml || value.includes('<')) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  });
  // Ensure the document title does not contain raw HTML tags
  const rawTitle = t('app.title') || '';
  document.title = rawTitle.replace(/<[^>]*>/g, '');
}

export function getCurrentLanguage() {
  return currentLang;
}

