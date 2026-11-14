/* index.js — 首页（拆分版）逻辑 */
(function () {
  'use strict';

  /* 首页对未登录游客也可浏览（导航显示登录入口），用 checkLogin(false) 仅探测登录态 */
  async function init() {
    const user = await Common.checkLogin(false);
    Common.renderNav(user);
    Common.renderFooter();
    const welcome = document.getElementById('welcome-text');
    welcome.textContent = user ? ('你好，' + (user.nickname || user.username)) : '欢迎来到 JobHub';
    loadJobs(1);
  }

  /* ---------------- 列表状态管理 ---------------- */
  const stateBox = document.getElementById('list-state');
  const gridBox = document.getElementById('job-grid');
  const pageBox = document.getElementById('pagination');
  const totalInfo = document.getElementById('total-info');
  let currentPage = 1;
  let currentKeyword = '';
  const PAGE_SIZE = 8;

  function showState(kind, opts) {
    stateBox.innerHTML = Common.stateHtml(kind, opts);
    stateBox.classList.remove('hidden');
    gridBox.classList.add('hidden');
    pageBox.classList.add('hidden');
    totalInfo.textContent = '';
    // 绑定重试
    if (kind === 'error' && opts && opts.retry) {
      stateBox.querySelector('.state-retry').addEventListener('click', function () {
        loadJobs(currentPage);
      });
    }
  }
  function showGrid() {
    stateBox.classList.add('hidden');
    gridBox.classList.remove('hidden');
  }

  /* ---------------- 渲染岗位卡片 ---------------- */
  function jobCardHtml(job) {
    const tags = (job.tags || []).map(function (t) {
      return '<span class="tag">' + Common.esc(t) + '</span>';
    }).join('');
    const statusTag = job.statusCode === 'OPEN'
      ? '' // 招聘中不需要额外标注，展示来自数据的 statusText 即可
      : '<span class="tag tag-gray">' + Common.esc(job.statusText) + '</span>';
    return '<a class="job-card" href="job-detail.html?id=' + encodeURIComponent(job.id) + '">' +
      '<div class="job-card-title">' + Common.esc(job.title) + '</div>' +
      '<div class="job-card-company"><i class="fa fa-building-o"></i> ' + Common.esc(job.company) + '</div>' +
      '<div class="job-card-meta">' +
      '<span><i class="fa fa-map-marker"></i> ' + Common.esc(job.city) + '</span>' +
      '<span class="salary">' + Common.esc(job.salary) + '</span>' +
      statusTag +
      '</div>' +
      '<div class="job-card-tags">' + tags + '</div>' +
      '<div class="text-sub" style="font-size: 12px; margin-top: auto;">发布于 ' + Common.fmtDate(job.publishedAt) + '</div>' +
      '</a>';
  }

  /* ---------------- 加载岗位（搜索 + 分页） ---------------- */
  async function loadJobs(page) {
    const keyword = currentKeyword;
    showState('loading', { text: '岗位加载中...' });
    try {
      const data = await Api.get('/jobs', { keyword: keyword, page: page, size: PAGE_SIZE });
      currentPage = data.page;
      if (!data.list || data.list.length === 0) {
        const empty = keyword
          ? { text: '没有找到与"' + keyword + '"相关的岗位', actionHtml: '<button class="btn btn-outline btn-sm" id="btn-clear-search">清除搜索</button>' }
          : { text: '暂时没有在招岗位，请稍后再来看看' };
        showState('empty', empty);
        if (keyword) {
          const clearBtn = document.getElementById('btn-clear-search');
          if (clearBtn) clearBtn.addEventListener('click', function () {
            currentKeyword = '';
            document.getElementById('search-input').value = '';
            loadJobs(1);
          });
        }
        return;
      }
      gridBox.innerHTML = data.list.map(jobCardHtml).join('');
      showGrid();
      const totalPages = Math.ceil(data.total / PAGE_SIZE);
      totalInfo.textContent = '共 ' + data.total + ' 个岗位';
      renderPagination(page, totalPages);
    } catch (err) {
      showState('error', { text: (err && err.message) || '岗位加载失败，请稍后重试', retry: true });
    }
  }

  /* ---------------- 分页 ---------------- */
  function renderPagination(page, totalPages) {
    pageBox.classList.remove('hidden');
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const info = document.getElementById('page-info');
    info.textContent = '第 ' + page + ' / ' + totalPages + ' 页';
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = page >= totalPages;
    prevBtn.onclick = function () { if (page > 1) { loadJobs(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
    nextBtn.onclick = function () { if (page < totalPages) { loadJobs(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  }

  /* ---------------- 搜索 ---------------- */
  function doSearch() {
    currentKeyword = document.getElementById('search-input').value.trim();
    loadJobs(1);
  }
  document.getElementById('btn-search').addEventListener('click', doSearch);
  document.getElementById('search-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') doSearch();
  });
  // 输入防抖搜索（输入即搜，无需点按钮）
  document.getElementById('search-input').addEventListener('input', Common.debounce(doSearch, 400));

  init();
})();
