/* =====================================================================
 * api.js — 统一请求封装（拆分版：供 *.html 使用）
 *
 * 与 js/api.js 逻辑一致，唯一区别：401 跳转登录页指向 login.html。
 * 页面代码一律通过 window.Api 调接口，禁止直接读写 localStorage。
 * 功能：
 *   1. 拼接口前缀（真实模式：baseURL + path）
 *   2. 真实模式带 Cookie（credentials: 'include'）
 *   3. 统一处理业务错误码：非 0 code 抛出 ApiError（含 message）
 *   4. 401 自动清登录态并跳转登录页（登录/注册接口除外）
 *   5. Mock 模式走 js/mock.js 的 localStorage 模拟层
 *
 * 后端接口就绪后，把下方 API_CONFIG.useMock 改为 false 即可。
 * ===================================================================== */
(function (window) {
  'use strict';

  /* ------------------------------ 配置 ------------------------------ */

  const API_CONFIG = {
    useMock: true, // true = 本地模拟接口；false = 请求真实后端
    baseURL: '/api/v1', // 真实接口前缀
  };

  /* 登录令牌存储键（与 mock.js 保持一致） */
  const TOKEN_KEY = 'jobhub_token';

  /* ---------------------------- 异常类型 ---------------------------- */

  class ApiError extends Error {
    constructor(code, message) {
      super(message);
      this.name = 'ApiError';
      this.code = code;
    }
  }

  /* --------------------------- 401 处理 --------------------------- */

  function redirectToLogin() {
    const page = location.pathname.split('/').pop() + location.search;
    const redirect = encodeURIComponent(page);
    window.location.href = 'login.html?redirect=' + redirect;
  }

  function handle401(path) {
    // 以下接口的 401 不触发自动跳转：
    // - /auth/login、/auth/register：401/400 是"账号密码错误"，由登录页自行提示
    // - /auth/me：登录态"探测"接口，公共页（首页）游客也会调用，由 checkLogin 决定是否跳转
    if (path === '/auth/login' || path === '/auth/register' || path === '/auth/me') return;
    try { window.localStorage.removeItem(TOKEN_KEY); } catch (e) { /* 忽略 */ }
    redirectToLogin();
  }

  /* ---------------------------- 核心请求 ---------------------------- */

  async function request(method, path, body, query) {
    /* ---- Mock 模式 ---- */
    if (API_CONFIG.useMock) {
      const res = await window.MockAPI.handle(method, path, body || null, query || null);
      if (res.code !== 0) {
        if (res.code === 401) handle401(path);
        throw new ApiError(res.code, res.message || '请求失败');
      }
      return res.data;
    }

    /* ---- 真实后端模式 ---- */
    let url = API_CONFIG.baseURL + path;
    if (query && Object.keys(query).length > 0) {
      url += '?' + new URLSearchParams(query).toString();
    }
    const opts = {
      method: method,
      credentials: 'include', // 带 Cookie，维持后端 Session
      headers: { 'Content-Type': 'application/json' },
    };
    if (body !== null && body !== undefined) {
      opts.body = JSON.stringify(body);
    }

    let resp;
    try {
      resp = await fetch(url, opts);
    } catch (e) {
      throw new ApiError(-1, '网络异常，请检查后端服务是否已启动');
    }
    if (resp.status === 401) {
      handle401(path);
      throw new ApiError(401, '未登录或登录已过期');
    }
    let json;
    try {
      json = await resp.json();
    } catch (e) {
      throw new ApiError(-1, '接口返回格式异常');
    }
    if (json.code !== 0) {
      throw new ApiError(json.code, json.message || '请求失败');
    }
    return json.data;
  }

  /* ------------------------------ 导出 ------------------------------ */

  window.Api = {
    config: API_CONFIG,
    ApiError: ApiError,
    /** GET 请求：Api.get('/jobs', { page: 1 }) */
    get: function (path, query) { return request('GET', path, null, query || null); },
    /** POST 请求：Api.post('/auth/login', { username, password }) */
    post: function (path, body) { return request('POST', path, body || {}, null); },
    /** PUT 请求：Api.put('/resume', resume) */
    put: function (path, body) { return request('PUT', path, body || {}, null); },
    /** DELETE 请求：Api.del('/favorites/j01') */
    del: function (path) { return request('DELETE', path, null, null); },
    redirectToLogin: redirectToLogin,
  };
})(window);
