/* profile.js — 个人资料（拆分版）逻辑 */
(function () {
  'use strict';

  async function init() {
    const user = await Common.checkLogin();
    if (!user) return; // 未登录已跳转登录页
    Common.renderNav(user);
    Common.renderFooter();
    await loadProfile();
  }

  /* ---------------- 读取资料并回填 ---------------- */
  async function loadProfile() {
    const stateBox = document.getElementById('profile-state');
    const form = document.getElementById('profile-form');
    form.classList.add('hidden');
    stateBox.innerHTML = Common.stateHtml('loading', { text: '资料加载中...' });
    try {
      const profile = await Api.get('/profile');
      stateBox.innerHTML = '';
      // 回填表单
      document.getElementById('pf-nickname').value = profile.nickname || '';
      document.getElementById('pf-email').value = profile.email || '';
      document.getElementById('pf-phone').value = profile.phone || '';
      document.getElementById('pf-city').value = profile.city || '';
      document.getElementById('pf-target').value = profile.targetJob || '';
      document.getElementById('pf-intro').value = profile.intro || '';
      form.classList.remove('hidden');
    } catch (err) {
      stateBox.innerHTML = Common.stateHtml('error', {
        text: (err && err.message) || '资料加载失败',
        retry: true,
      });
      stateBox.querySelector('.state-retry').addEventListener('click', loadProfile);
    }
  }

  /* ---------------- 保存：加载中 / 成功 / 失败三种反馈 ---------------- */
  document.getElementById('profile-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const nickname = document.getElementById('pf-nickname').value.trim();
    const nickError = document.getElementById('pf-nickname-error');
    nickError.classList.remove('show');

    // 前端校验：昵称必填
    if (!nickname) {
      nickError.textContent = '昵称不能为空';
      nickError.classList.add('show');
      return;
    }
    if (nickname.length > 20) {
      nickError.textContent = '昵称最长 20 个字符';
      nickError.classList.add('show');
      return;
    }

    const btn = document.getElementById('btn-save');
    Common.setBtnLoading(btn, true, '保存中...'); // 反馈一：保存中
    try {
      const saved = await Api.put('/profile', {
        nickname: nickname,
        email: document.getElementById('pf-email').value.trim(),
        phone: document.getElementById('pf-phone').value.trim(),
        city: document.getElementById('pf-city').value.trim(),
        targetJob: document.getElementById('pf-target').value.trim(),
        intro: document.getElementById('pf-intro').value.trim(),
      });
      Common.setBtnLoading(btn, false);
      Common.toast('保存成功', 'success'); // 反馈二：成功
      // 昵称变更后刷新导航显示
      const me = await Api.get('/auth/me').catch(function () { return null; });
      Common.renderNav(me);
    } catch (err) {
      Common.setBtnLoading(btn, false);
      Common.toast((err && err.message) || '保存失败，请稍后重试', 'error'); // 反馈三：失败
    }
  });

  init();
})();
