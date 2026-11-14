/* applications.js — 我的投递（拆分版）逻辑 */
(function () {
  'use strict';

  async function init() {
    const user = await Common.checkLogin();
    if (!user) return; // 未登录已跳转登录页
    Common.renderNav(user);
    Common.renderFooter();
    loadFavorites();
    loadApplications();
  }

  /* ==================== 我的收藏 ==================== */

  async function loadFavorites() {
    const stateBox = document.getElementById('fav-state');
    const listBox = document.getElementById('fav-list');
    listBox.innerHTML = '';
    stateBox.innerHTML = Common.stateHtml('loading', { text: '收藏加载中...' });
    try {
      const list = await Api.get('/favorites');
      document.getElementById('fav-count').textContent = list.length + ' 个';
      if (!list.length) {
        stateBox.innerHTML = Common.stateHtml('empty', {
          text: '还没有收藏的岗位',
          actionHtml: '<a class="btn btn-primary btn-sm" href="index.html"><i class="fa fa-search"></i>去首页逛逛</a>',
        });
        return;
      }
      stateBox.innerHTML = '';
      listBox.innerHTML = list.map(favRowHtml).join('');
      bindFavRemove(listBox);
    } catch (err) {
      stateBox.innerHTML = Common.stateHtml('error', {
        text: (err && err.message) || '收藏加载失败',
        retry: true,
      });
      stateBox.querySelector('.state-retry').addEventListener('click', loadFavorites);
    }
  }

  function favRowHtml(job) {
    const tags = (job.tags || []).slice(0, 3).map(function (t) {
      return '<span class="tag">' + Common.esc(t) + '</span>';
    }).join('');
    return '<div class="list-row" data-job-id="' + Common.esc(job.id) + '">' +
      '<div class="list-row-main">' +
      '<a class="list-row-title" href="job-detail.html?id=' + encodeURIComponent(job.id) + '">' + Common.esc(job.title) + '</a>' +
      '<div class="list-row-sub">' + Common.esc(job.company) + ' · ' + Common.esc(job.city) + ' · <span class="text-danger">' + Common.esc(job.salary) + '</span></div>' +
      '<div class="mt-8">' + tags + '</div>' +
      '</div>' +
      '<div class="list-row-actions">' +
      '<a class="btn btn-outline btn-sm" href="job-detail.html?id=' + encodeURIComponent(job.id) + '">查看</a>' +
      '<button class="btn btn-gray btn-sm btn-remove-fav"><i class="fa fa-star"></i>取消收藏</button>' +
      '</div>' +
      '</div>';
  }

  function bindFavRemove(listBox) {
    listBox.querySelectorAll('.btn-remove-fav').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        const row = btn.closest('.list-row');
        const jobId = row.dataset.jobId;
        Common.setBtnLoading(btn, true, '取消中...');
        try {
          await Api.del('/favorites/' + jobId);
          Common.toast('已取消收藏', 'info');
          loadFavorites(); // 重新加载列表
        } catch (err) {
          Common.setBtnLoading(btn, false);
          Common.toast((err && err.message) || '操作失败', 'error');
        }
      });
    });
  }

  /* ==================== 我的投递记录 ==================== */

  let statusList = []; // 状态选项来自接口（不写死）

  async function loadApplications() {
    const stateBox = document.getElementById('app-state');
    const listBox = document.getElementById('app-list');
    listBox.innerHTML = '';
    stateBox.innerHTML = Common.stateHtml('loading', { text: '投递记录加载中...' });
    try {
      // 状态列表与投递记录并行获取
      const [statuses, list] = await Promise.all([
        Api.get('/statuses'),
        Api.get('/applications'),
      ]);
      statusList = statuses || [];
      document.getElementById('app-count').textContent = list.length + ' 条';
      if (!list.length) {
        stateBox.innerHTML = Common.stateHtml('empty', {
          text: '还没有投递记录',
          actionHtml: '<a class="btn btn-primary btn-sm" href="index.html"><i class="fa fa-search"></i>去首页找找机会</a>',
        });
        return;
      }
      stateBox.innerHTML = '';
      listBox.innerHTML = list.map(appRowHtml).join('');
      bindStatusSelects(listBox);
    } catch (err) {
      stateBox.innerHTML = Common.stateHtml('error', {
        text: (err && err.message) || '投递记录加载失败',
        retry: true,
      });
      stateBox.querySelector('.state-retry').addEventListener('click', loadApplications);
    }
  }

  function appRowHtml(rec) {
    // 状态下拉：选项来自接口返回的状态列表，文字不写死
    const options = statusList.map(function (s) {
      const selected = s.code === rec.statusCode ? ' selected' : '';
      return '<option value="' + Common.esc(s.code) + '"' + selected + '>' + Common.esc(s.text) + '</option>';
    }).join('');
    return '<div class="list-row" data-app-id="' + Common.esc(rec.id) + '">' +
      '<div class="list-row-main">' +
      '<a class="list-row-title" href="job-detail.html?id=' + encodeURIComponent(rec.jobId) + '">' + Common.esc(rec.jobTitle) + '</a>' +
      '<div class="list-row-sub">' + Common.esc(rec.company) + ' · ' + Common.esc(rec.city) + ' · 投递于 ' + Common.fmtDate(rec.appliedAt) + '</div>' +
      '</div>' +
      '<div class="list-row-actions">' +
      '<label class="text-sub" style="font-size: 13px;">状态：</label>' +
      '<select class="form-select status-select" style="width: 130px;" data-app-id="' + Common.esc(rec.id) + '">' + options + '</select>' +
      '</div>' +
      '</div>';
  }

  function bindStatusSelects(listBox) {
    listBox.querySelectorAll('.status-select').forEach(function (sel) {
      sel.addEventListener('change', async function () {
        const appId = sel.dataset.appId;
        const statusCode = sel.value;
        sel.disabled = true; // 防重复提交
        try {
          const rec = await Api.put('/applications/' + appId + '/status', { statusCode: statusCode });
          Common.toast('状态已更新为「' + rec.statusText + '」', 'success');
        } catch (err) {
          Common.toast((err && err.message) || '状态更新失败', 'error');
          loadApplications(); // 更新失败：重新拉取列表，下拉自动还原为服务端状态
          return;
        } finally {
          sel.disabled = false;
        }
      });
    });
  }

  init();
})();
