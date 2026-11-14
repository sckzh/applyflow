/* resume-preview.js — 简历预览（拆分版）逻辑 */
(function () {
  'use strict';

  async function init() {
    const user = await Common.checkLogin();
    if (!user) return; // 未登录已跳转登录页
    Common.renderNav(user);
    Common.renderFooter();
    await loadResume();
  }

  async function loadResume() {
    const stateBox = document.getElementById('preview-state');
    const sheet = document.getElementById('sheet');
    sheet.classList.add('hidden');
    stateBox.innerHTML = Common.stateHtml('loading', { text: '简历加载中...' });
    try {
      const resume = await Api.get('/resume');
      if (!resume || !resume.basic || !resume.basic.name) {
        stateBox.innerHTML = Common.stateHtml('empty', {
          text: '还没有简历内容',
          actionHtml: '<a class="btn btn-primary btn-sm" href="resume-editor.html"><i class="fa fa-pencil"></i>先去编辑简历</a>',
        });
        return;
      }
      stateBox.innerHTML = '';
      renderSheet(resume);
      sheet.classList.remove('hidden');
    } catch (err) {
      stateBox.innerHTML = Common.stateHtml('error', {
        text: (err && err.message) || '简历加载失败',
        retry: true,
      });
      stateBox.querySelector('.state-retry').addEventListener('click', loadResume);
    }
  }

  /* ---------------- 渲染 A4 版式简历 ---------------- */
  function renderSheet(resume) {
    const b = resume.basic || {};
    const sheet = document.getElementById('sheet');

    const contactParts = [];
    if (b.phone) contactParts.push('<span><i class="fa fa-phone"></i> ' + Common.esc(b.phone) + '</span>');
    if (b.email) contactParts.push('<span><i class="fa fa-envelope-o"></i> ' + Common.esc(b.email) + '</span>');
    if (b.city) contactParts.push('<span><i class="fa fa-map-marker"></i> ' + Common.esc(b.city) + '</span>');
    if (b.birth) contactParts.push('<span><i class="fa fa-birthday-cake"></i> ' + Common.esc(b.birth) + '</span>');

    const edu = (resume.education || []).map(function (e) {
      return '<div class="sheet-entry">' +
        '<div class="sheet-entry-head">' +
        '<span class="sheet-entry-title">' + Common.esc(e.school || '') + '</span>' +
        '<span class="sheet-entry-time">' + Common.esc(e.start || '') + ' - ' + Common.esc(e.end || '') + '</span>' +
        '</div>' +
        '<div class="sheet-entry-sub">' + Common.esc([e.major, e.degree].filter(Boolean).join(' · ')) + '</div>' +
        (e.desc ? '<div class="sheet-entry-desc">' + Common.esc(e.desc) + '</div>' : '') +
        '</div>';
    }).join('') || '<p class="text-sub">暂无教育经历</p>';

    const proj = (resume.projects || []).map(function (p) {
      return '<div class="sheet-entry">' +
        '<div class="sheet-entry-head">' +
        '<span class="sheet-entry-title">' + Common.esc(p.name || '') + '</span>' +
        '<span class="sheet-entry-time">' + Common.esc(p.start || '') + ' - ' + Common.esc(p.end || '') + '</span>' +
        '</div>' +
        '<div class="sheet-entry-sub">' + Common.esc(p.role || '') + '</div>' +
        (p.desc ? '<div class="sheet-entry-desc">' + Common.esc(p.desc) + '</div>' : '') +
        '</div>';
    }).join('') || '<p class="text-sub">暂无项目经历</p>';

    const skills = (resume.skills || []).map(function (s) {
      return '<span class="sheet-skill">' + Common.esc(s) + '</span>';
    }).join('') || '<p class="text-sub">暂无技能标签</p>';

    sheet.innerHTML =
      '<div class="sheet-header">' +
      '<div class="sheet-name">' + Common.esc(b.name) + '</div>' +
      '<div class="sheet-target">' + (b.targetJob ? ('求职意向：' + Common.esc(b.targetJob)) : '') + '</div>' +
      '<div class="sheet-contact">' + contactParts.join('') + '</div>' +
      '</div>' +

      (b.selfIntro ?
        '<section class="sheet-section">' +
        '<div class="sheet-section-title">自我评价</div>' +
        '<div class="sheet-paragraph">' + Common.esc(b.selfIntro) + '</div>' +
        '</section>' : '') +

      '<section class="sheet-section">' +
      '<div class="sheet-section-title">教育经历</div>' + edu +
      '</section>' +

      '<section class="sheet-section">' +
      '<div class="sheet-section-title">项目经历</div>' + proj +
      '</section>' +

      '<section class="sheet-section">' +
      '<div class="sheet-section-title">技能特长</div>' +
      '<div class="sheet-skills">' + skills + '</div>' +
      '</section>';
  }

  document.getElementById('btn-print').addEventListener('click', function () {
    window.print();
  });

  init();
})();
