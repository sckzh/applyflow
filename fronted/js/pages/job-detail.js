/* job-detail.js — 岗位详情（拆分版）逻辑 */
(function () {
  'use strict';

  let job = null;
  let favorited = false;
  let applying = false;

  async function init() {
    const user = await Common.checkLogin();
    if (!user) return; // 未登录已跳转登录页
    Common.renderNav(user);
    Common.renderFooter();
    await loadDetail();
  }

  /* ---------------- 加载详情 ---------------- */
  async function loadDetail() {
    const id = Common.getParam('id');
    const stateBox = document.getElementById('detail-state');
    const body = document.getElementById('detail-body');
    body.classList.add('hidden');

    if (!id) {
      stateBox.innerHTML = Common.stateHtml('error', { text: '缺少岗位参数，无法查看详情' });
      stateBox.classList.remove('hidden');
      return;
    }
    stateBox.innerHTML = Common.stateHtml('loading', { text: '岗位详情加载中...' });
    stateBox.classList.remove('hidden');

    try {
      job = await Api.get('/jobs/' + id);
    } catch (err) {
      stateBox.innerHTML = Common.stateHtml('error', {
        text: (err && err.message) || '岗位加载失败',
        retry: true,
      });
      stateBox.querySelector('.state-retry').addEventListener('click', loadDetail);
      return;
    }

    // 读取收藏状态
    try {
      const favs = await Api.get('/favorites');
      favorited = favs.some(function (f) { return String(f.id) === String(job.id); });
    } catch (e) {
      favorited = false;
    }

    stateBox.classList.add('hidden');
    renderDetail();
  }

  /* ---------------- 渲染详情 ---------------- */
  function renderDetail() {
    document.title = job.title + ' - ' + job.company + ' - JobHub';
    document.getElementById('detail-company-logo').textContent = job.company.charAt(0);
    document.getElementById('detail-title').textContent = job.title;
    document.getElementById('detail-company').innerHTML = '<i class="fa fa-building-o"></i> ' + Common.esc(job.company);
    document.getElementById('detail-city').innerHTML = '<i class="fa fa-map-marker"></i> ' + Common.esc(job.city);
    document.getElementById('detail-published').innerHTML = '<i class="fa fa-clock-o"></i> 发布于 ' + Common.fmtDate(job.publishedAt);
    document.getElementById('detail-salary').textContent = job.salary;
    // 状态文字来自数据（不写死）
    const statusEl = document.getElementById('detail-status');
    statusEl.innerHTML = job.statusCode === 'OPEN'
      ? '<span class="tag" style="background: #dcfce7; color: #166534;">' + Common.esc(job.statusText) + '</span>'
      : '<span class="tag tag-gray">' + Common.esc(job.statusText) + '</span>';
    document.getElementById('detail-tags').innerHTML = (job.tags || []).map(function (t) {
      return '<span class="tag">' + Common.esc(t) + '</span>';
    }).join('');
    document.getElementById('detail-description').textContent = job.description || '暂无详细描述';
    document.getElementById('detail-requirements').innerHTML = (job.requirements || []).map(function (r) {
      return '<div class="requirement-item">' + Common.esc(r) + '</div>';
    }).join('');

    updateFavoriteBtn();
    const applyBtn = document.getElementById('btn-apply');
    if (job.statusCode !== 'OPEN') {
      applyBtn.disabled = true;
      applyBtn.innerHTML = '<i class="fa fa-ban"></i><span>' + Common.esc(job.statusText) + '</span>';
    }
    document.getElementById('detail-body').classList.remove('hidden');
  }

  /* ---------------- 收藏 / 取消收藏 ---------------- */
  function updateFavoriteBtn() {
    const btn = document.getElementById('btn-favorite');
    btn.innerHTML = favorited
      ? '<i class="fa fa-star"></i><span>已收藏（点击取消）</span>'
      : '<i class="fa fa-star-o"></i><span>收藏岗位</span>';
  }

  document.getElementById('btn-favorite').addEventListener('click', async function () {
    const btn = this;
    Common.setBtnLoading(btn, true, favorited ? '取消中...' : '收藏中...');
    try {
      if (favorited) {
        await Api.del('/favorites/' + job.id);
        favorited = false;
        Common.toast('已取消收藏', 'info');
      } else {
        await Api.post('/favorites', { jobId: job.id });
        favorited = true;
        Common.toast('收藏成功', 'success');
      }
      Common.setBtnLoading(btn, false);
      updateFavoriteBtn();
    } catch (err) {
      Common.setBtnLoading(btn, false);
      Common.toast((err && err.message) || '操作失败，请稍后重试', 'error');
    }
  });

  /* ---------------- 投递 ---------------- */
  document.getElementById('btn-apply').addEventListener('click', async function () {
    if (applying) return; // 防重复点击
    applying = true;
    const btn = this;
    Common.setBtnLoading(btn, true, '投递中...');
    try {
      const rec = await Api.post('/applications', { jobId: job.id });
      Common.toast('投递成功，当前状态：' + rec.statusText, 'success');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa fa-check"></i><span>已投递</span>';
    } catch (err) {
      Common.toast((err && err.message) || '投递失败，请稍后重试', 'error');
      Common.setBtnLoading(btn, false);
    } finally {
      applying = false;
    }
  });

  /* ---------------- 用岗位优化简历 ---------------- */
  document.getElementById('btn-optimize').addEventListener('click', function () {
    location.href = 'resume-editor.html?jobId=' + encodeURIComponent(job.id);
  });

  init();
})();
