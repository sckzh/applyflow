/* login.js — 登录 / 注册（拆分版）逻辑 */
(function () {
  'use strict';

  /* 已登录用户访问登录页：直接进首页（或 redirect 目标） */
  Api.get('/auth/me')
    .then(function (user) {
      if (user) {
        const redirect = Common.getParam('redirect');
        location.replace(redirect || 'index.html');
      }
    })
    .catch(function () { /* 未登录，停留在登录页 */ });

  /* ---------------- Tab 切换 ---------------- */
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const errorBar = document.getElementById('form-error-bar');
  const errorText = document.getElementById('form-error-text');

  function setTab(which) {
    const isLogin = which === 'login';
    loginForm.classList.toggle('hidden', !isLogin);
    registerForm.classList.toggle('hidden', isLogin);
    tabLogin.style.background = isLogin ? '#2563eb' : 'transparent';
    tabLogin.style.color = isLogin ? '#fff' : '#475569';
    tabRegister.style.background = isLogin ? 'transparent' : '#2563eb';
    tabRegister.style.color = isLogin ? '#475569' : '#fff';
    hideErrorBar();
    hideFieldErrors();
  }
  tabLogin.addEventListener('click', function () { setTab('login'); });
  tabRegister.addEventListener('click', function () { setTab('register'); });

  /* ---------------- 错误提示 ---------------- */
  function showErrorBar(msg) {
    errorText.textContent = msg;
    errorBar.classList.remove('hidden');
  }
  function hideErrorBar() {
    errorBar.classList.add('hidden');
  }
  function fieldError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    if (msg) { el.textContent = msg; el.classList.add('show'); }
    else { el.textContent = ''; el.classList.remove('show'); }
  }
  function hideFieldErrors() {
    ['login-username-error', 'login-password-error',
     'reg-username-error', 'reg-password-error', 'reg-password2-error'].forEach(fieldError);
  }

  /* ---------------- 前端校验规则 ---------------- */
  const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

  function validateLogin() {
    hideFieldErrors();
    let valid = true;
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    if (!u) { fieldError('login-username-error', '请输入用户名'); valid = false; }
    else if (!USERNAME_RE.test(u)) { fieldError('login-username-error', '用户名为 3-20 位字母、数字或下划线'); valid = false; }
    if (!p) { fieldError('login-password-error', '请输入密码'); valid = false; }
    else if (p.length < 6 || p.length > 20) { fieldError('login-password-error', '密码长度为 6-20 位'); valid = false; }
    return valid;
  }

  function validateRegister() {
    hideFieldErrors();
    let valid = true;
    const u = document.getElementById('reg-username').value.trim();
    const p = document.getElementById('reg-password').value;
    const p2 = document.getElementById('reg-password2').value;
    if (!u) { fieldError('reg-username-error', '请输入用户名'); valid = false; }
    else if (!USERNAME_RE.test(u)) { fieldError('reg-username-error', '用户名为 3-20 位字母、数字或下划线'); valid = false; }
    if (!p) { fieldError('reg-password-error', '请输入密码'); valid = false; }
    else if (p.length < 6 || p.length > 20) { fieldError('reg-password-error', '密码长度为 6-20 位'); valid = false; }
    if (!p2) { fieldError('reg-password2-error', '请再次输入密码'); valid = false; }
    else if (p !== p2) { fieldError('reg-password2-error', '两次输入的密码不一致'); valid = false; }
    return valid;
  }

  /* ---------------- 登录 ---------------- */
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideErrorBar();
    if (!validateLogin()) return;
    const btn = document.getElementById('btn-login-submit');
    Common.setBtnLoading(btn, true, '登录中...');
    try {
      await Api.post('/auth/login', {
        username: document.getElementById('login-username').value.trim(),
        password: document.getElementById('login-password').value,
      });
      Common.toast('登录成功', 'success');
      const redirect = Common.getParam('redirect');
      // 稍等 toast 展示后跳转
      setTimeout(function () { location.replace(redirect || 'index.html'); }, 400);
    } catch (err) {
      showErrorBar(err.message || '登录失败，请稍后重试');
      Common.setBtnLoading(btn, false);
    }
  });

  /* ---------------- 注册 ---------------- */
  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideErrorBar();
    if (!validateRegister()) return;
    const btn = document.getElementById('btn-register-submit');
    Common.setBtnLoading(btn, true, '注册中...');
    try {
      await Api.post('/auth/register', {
        username: document.getElementById('reg-username').value.trim(),
        password: document.getElementById('reg-password').value,
        nickname: document.getElementById('reg-nickname').value.trim(),
      });
      Common.toast('注册成功，请登录', 'success');
      Common.setBtnLoading(btn, false);
      // 回填用户名并切到登录 tab
      document.getElementById('login-username').value = document.getElementById('reg-username').value.trim();
      setTab('login');
    } catch (err) {
      // 如"用户名已存在"等业务错误
      showErrorBar(err.message || '注册失败，请稍后重试');
      Common.setBtnLoading(btn, false);
    }
  });

  /* 输入时清除对应字段错误 */
  document.querySelectorAll('#login-form input, #register-form input').forEach(function (input) {
    input.addEventListener('input', function () {
      if (input.id) fieldError(input.id + '-error', '');
      hideErrorBar();
    });
  });
})();
