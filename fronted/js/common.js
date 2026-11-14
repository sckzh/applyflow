/* =====================================================================
 * common.js — 公共组件与工具（拆分版：供 *.html 使用）
 *
 * 与 js/common.js 逻辑一致，唯一区别：导航、退出登录等跳转均指向
 * *.html 版本页面。
 *
 * 包含：公共导航（登录前/后两种状态、当前页高亮）、页脚、
 * 登录态检查（未登录自动跳登录页）、退出登录、
 * toast 提示、按钮防重复点击（loading）、HTML 转义、
 * 防抖、时间格式化、GET 参数读取、剪贴板复制（含降级）。
 * ===================================================================== */
(function (window) {
  'use strict';

  /* ---------------------------- 工具函数 ---------------------------- */

  /** HTML 转义，防 XSS */
  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** 读取 URL 查询参数 */
  function getParam(name) {
    return new URLSearchParams(location.search).get(name);
  }

  /** 时间格式化：'2026-11-14 10:30:00' -> '2026-11-14 10:30'；其他格式原样返回 */
  function fmtDate(input) {
    if (!input) return '';
    const s = String(input);
    const m = s.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(?::\d{2})?$/);
    return m ? m[1] + ' ' + m[2] : s;
  }

  function debounce(fn, wait) {
    let timer = null;
    return function () {
      const args = arguments;
      const ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  /** 原生确认框 */
  function confirmDlg(message) {
    return window.confirm(message);
  }

  /* ----------------------------- toast ----------------------------- */

  function ensureToastContainer() {
    let box = document.getElementById('toast-container');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toast-container';
      document.body.appendChild(box);
    }
    return box;
  }

  /**
   * 顶部轻提示
   * @param {string} message
   * @param {string} type success | error | info
   */
  function toast(message, type) {
    const box = ensureToastContainer();
    const el = document.createElement('div');
    el.className = 'toast toast-' + (type || 'info');
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    el.innerHTML = '<i class="fa ' + icon + '"></i><span>' + esc(message) + '</span>';
    box.appendChild(el);
    // 触发进入动画
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 300);
    }, 3000);
  }

  /* ------------------------ 按钮防重复点击 ------------------------ */

  /**
   * 设置按钮 loading 态（防重复点击）
   * @param {HTMLElement} btn
   * @param {boolean} loading true=进入 loading；false=恢复
   * @param {string} loadingText loading 时显示的文字
   */
  function setBtnLoading(btn, loading, loadingText) {
    if (!btn) return;
    if (loading) {
      if (!btn.dataset.origHtml) btn.dataset.origHtml = btn.innerHTML;
      btn.disabled = true;
      btn.classList.add('btn-loading');
      btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i><span>' + esc(loadingText || '处理中...') + '</span>';
    } else {
      btn.disabled = false;
      btn.classList.remove('btn-loading');
      if (btn.dataset.origHtml) {
        btn.innerHTML = btn.dataset.origHtml;
        delete btn.dataset.origHtml;
      }
    }
  }

  /* --------------------------- 剪贴板复制 --------------------------- */

  /** 复制文本到剪贴板；Clipboard API 失败时降级 execCommand（兼容 file:// 环境） */
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      throw new Error('fallback');
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        ta.style.top = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const okFlag = document.execCommand('copy');
        ta.remove();
        if (!okFlag) throw new Error('copy failed');
        return true;
      } catch (e2) {
        return false;
      }
    }
  }

  /* --------------------------- 登录态相关 --------------------------- */

  /**
   * 检查登录态。
   * @param {boolean} requireLogin 是否需要登录。受限页传 true（默认）：
   *   未登录时自动跳转登录页（带 redirect）；公共页（如首页）传 false，仅探测。
   * @returns {Promise<object|null>} 当前用户 {username, nickname} 或 null
   */
  async function checkLogin(requireLogin) {
    requireLogin = requireLogin !== false;
    try {
      return await window.Api.get('/auth/me');
    } catch (e) {
      if (requireLogin) {
        if (e && e.code === 401) {
          // 未登录或登录过期：清登录态并跳登录页（回到本页的 redirect 由 Api.redirectToLogin 拼接）
          try { window.localStorage.removeItem('jobhub_token'); } catch (e2) { /* 忽略 */ }
          window.Api.redirectToLogin();
        } else {
          toast((e && e.message) || '登录状态检查失败，请稍后重试', 'error');
        }
      }
      return null;
    }
  }

  /** 退出登录：调登出接口 -> 回登录页 */
  async function logout() {
    try {
      await window.Api.post('/auth/logout');
    } catch (e) {
      /* 接口失败也继续本地退出 */
    } finally {
      try { window.localStorage.removeItem('jobhub_token'); } catch (e2) { /* 忽略 */ }
      window.location.href = 'login.html';
    }
  }

  /* ---------------------------- 公共导航 ---------------------------- */

  const NAV_ITEMS = [
    { href: 'index.html', label: '首页' },
    { href: 'applications.html', label: '我的投递' },
    { href: 'profile.html', label: '个人资料' },
    { href: 'resume-editor.html', label: '简历编辑' },
    { href: 'resume-preview.html', label: '简历预览' },
  ];

  function currentPageName() {
    return location.pathname.split('/').pop() || 'index.html';
  }

  /**
   * 渲染公共导航
   * @param {object|null} user 当前用户；null 时显示"登录/注册"入口
   */
  function renderNav(user) {
    const nav = document.getElementById('global-nav');
    if (!nav) return;
    const cur = currentPageName();
    const links = NAV_ITEMS.map(function (item) {
      const active = item.href === cur ? ' active' : '';
      return '<a class="nav-link' + active + '" href="' + item.href + '">' + item.label + '</a>';
    }).join('');

    let rightHtml = '';
    if (user) {
      rightHtml =
        '<span class="user-badge"><i class="fa fa-user-circle"></i>' + esc(user.nickname || user.username) + '</span>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="btn-logout" title="退出登录">' +
        '<i class="fa fa-sign-out"></i><span>退出</span></button>';
    } else {
      rightHtml =
        '<a class="btn btn-primary btn-sm" href="login.html"><i class="fa fa-sign-in"></i><span>登录 / 注册</span></a>';
    }

    nav.innerHTML =
      '<div class="nav-inner">' +
      '<a class="nav-logo" href="index.html"><i class="fa fa-graduation-cap"></i><span>JobHub 校园求职</span></a>' +
      '<div class="nav-links">' + links + '</div>' +
      '<div class="nav-right">' + rightHtml + '</div>' +
      '</div>';

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () { logout(); });
    }
  }

  /** 渲染页脚 */
  function renderFooter() {
    const footer = document.getElementById('global-footer');
    if (!footer) return;
    footer.innerHTML =
      '<div class="footer-inner">' +
      '<p>JobHub 校园求职 · 学生求职平台前端演示版（纯 HTML / CSS / JS，数据为本地模拟）</p>' +
      '<p class="footer-sub">© 2026 JobHub Team · 仅供学习演示使用</p>' +
      '</div>';
  }

  /** 渲染三态（加载中 / 出错 / 空数据）通用区块 */
  function stateHtml(kind, opts) {
    opts = opts || {};
    if (kind === 'loading') {
      return '<div class="state-box"><i class="fa fa-spinner fa-spin state-icon"></i><p>' + esc(opts.text || '加载中...') + '</p></div>';
    }
    if (kind === 'error') {
      return '<div class="state-box"><i class="fa fa-exclamation-triangle state-icon state-icon-error"></i><p>' + esc(opts.text || '加载失败，请稍后重试') + '</p>' +
        (opts.retry ? '<button type="button" class="btn btn-outline btn-sm state-retry">重试</button>' : '') + '</div>';
    }
    if (kind === 'empty') {
      return '<div class="state-box"><i class="fa fa-inbox state-icon state-icon-muted"></i><p>' + esc(opts.text || '暂无数据') + '</p>' +
        (opts.actionHtml || '') + '</div>';
    }
    return '';
  }

  /* ------------------------------ 导出 ------------------------------ */

  window.Common = {
    esc: esc,
    getParam: getParam,
    fmtDate: fmtDate,
    debounce: debounce,
    confirmDlg: confirmDlg,
    toast: toast,
    setBtnLoading: setBtnLoading,
    copyText: copyText,
    checkLogin: checkLogin,
    logout: logout,
    renderNav: renderNav,
    renderFooter: renderFooter,
    stateHtml: stateHtml,
  };
})(window);
