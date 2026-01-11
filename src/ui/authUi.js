import { createModal, closeModal } from './modal.js';
import { t, tp } from '../i18n.js';
import { showToast } from './ui.js';
import { login, register } from '../api.js';

const html = String.raw;

export function showAuthModal(onSuccess) {
  const content = html`
    <div class="auth-modal-content">
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login" data-i18n="auth.login">${t('auth.login')}</button>
        <button class="auth-tab" data-tab="register" data-i18n="auth.register">${t('auth.register')}</button>
      </div>
      
      <div class="auth-forms">
        <form id="login-form" class="auth-form active">
          <div class="form-group">
            <label for="login-email" data-i18n="auth.email">${t('auth.email')}</label>
            <input type="email" id="login-email" required>
          </div>
          <div class="form-group">
            <label for="login-password" data-i18n="auth.password">${t('auth.password')}</label>
            <input type="password" id="login-password" required>
          </div>
          <button type="submit" class="auth-submit-btn" data-i18n="auth.login">${t('auth.login')}</button>
          
          <div class="auth-switch">
            <button type="button" class="switch-btn" data-target="register" data-i18n="auth.switchToRegister">${t('auth.switchToRegister')}</button>
          </div>
        </form>

        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="register-username" data-i18n="auth.username">${t('auth.username')}</label>
            <input type="text" id="register-username" required>
          </div>
          <div class="form-group">
            <label for="register-email" data-i18n="auth.email">${t('auth.email')}</label>
            <input type="email" id="register-email" required>
          </div>
          <div class="form-group">
            <label for="register-password" data-i18n="auth.password">${t('auth.password')}</label>
            <input type="password" id="register-password" required>
          </div>
          <div class="form-group">
            <label for="register-confirm-password" data-i18n="auth.confirmPassword">${t('auth.confirmPassword')}</label>
            <input type="password" id="register-confirm-password" required>
          </div>
          <button type="submit" class="auth-submit-btn" data-i18n="auth.register">${t('auth.register')}</button>
          
          <div class="auth-switch">
             <button type="button" class="switch-btn" data-target="login" data-i18n="auth.switchToLogin">${t('auth.switchToLogin')}</button>
          </div>
        </form>
      </div>
      <button class="modal-close">X</button>
    </div>
  `;

  createModal({
    id: 'auth-modal',
    className: 'auth-modal',
    content,
  });

  // Tab switching logic
  const modalEl = document.getElementById('auth-modal');
  const tabs = modalEl.querySelectorAll('.auth-tab');
  const forms = modalEl.querySelectorAll('.auth-form');
  const switchBtns = modalEl.querySelectorAll('.switch-btn');

  function switchTab(tabName) {
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === tabName));
    forms.forEach((f) => f.classList.toggle('active', f.id === `${tabName}-form`));
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  switchBtns.forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.dataset.target));
  });

  // Login Form
  const loginForm = modalEl.querySelector('#login-form');
  loginForm.addEventListener('submit', async (e) => {
    if(!loginForm.checkValidity()) return;
    e.preventDefault();

    const email = loginForm.querySelector('#login-email').value;
    const password = loginForm.querySelector('#login-password').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = '...';
      await login(email, password);
      showToast(t('auth.loginSuccess'), 'success');
      closeModal('auth-modal');
      if (onSuccess) onSuccess();
    } catch (error) {
      showToast(tp('auth.loginFailed', { error: error.message }), 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t('auth.login');
    }
  });

  // Register Form
  const registerForm = modalEl.querySelector('#register-form');
  registerForm.addEventListener('submit', async (e) => {
    if(!registerForm.checkValidity()) return;
    e.preventDefault();

    const username = registerForm.querySelector('#register-username').value;
    const email = registerForm.querySelector('#register-email').value;
    const password = registerForm.querySelector('#register-password').value;
    const confirmPassword = registerForm.querySelector('#register-confirm-password').value;
    const submitBtn = registerForm.querySelector('button[type="submit"]');

    if (password !== confirmPassword) {
      showToast(t('auth.passwordsDoNotMatch'), 'error');
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = '...';
      await register(username, email, password, confirmPassword);
      showToast(t('auth.registerSuccess'), 'success');
      closeModal('auth-modal');
      if (onSuccess) onSuccess();
    } catch (error) {
      showToast(tp('auth.registerFailed', { error: error.message }), 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = t('auth.register');
    }
  });
}
