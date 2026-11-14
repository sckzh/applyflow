/* resume-editor.js — 简历编辑（拆分版）逻辑 */
(function () {
  'use strict';

  let aiJobId = Common.getParam('jobId'); // 从 URL 读取 jobId（详情页"用这个岗位优化简历"带入）
  let aiResultData = null; // 最近一次 AI 结果（用于"复制"和"填入"）
  let aiBusy = false;

  async function init() {
    const user = await Common.checkLogin();
    if (!user) return; // 未登录已跳转登录页
    Common.renderNav(user);
    Common.renderFooter();

    setupDynamicRows();
    setupAiPanel();
    await loadResume();
    if (aiJobId) await loadJobForAi();
  }

  /* ==================== 简历读取 / 保存 ==================== */

  async function loadResume() {
    const stateBox = document.getElementById('resume-state');
    const form = document.getElementById('resume-form');
    form.classList.add('hidden');
    stateBox.innerHTML = Common.stateHtml('loading', { text: '简历加载中...' });
    try {
      const resume = await Api.get('/resume');
      stateBox.innerHTML = '';
      fillForm(resume);
      form.classList.remove('hidden');
    } catch (err) {
      stateBox.innerHTML = Common.stateHtml('error', {
        text: (err && err.message) || '简历加载失败',
        retry: true,
      });
      stateBox.querySelector('.state-retry').addEventListener('click', loadResume);
    }
  }

  /* ---------------- 回填表单 ---------------- */
  function fillForm(resume) {
    const b = (resume && resume.basic) || {};
    document.getElementById('ba-name').value = b.name || '';
    document.getElementById('ba-gender').value = b.gender || '';
    document.getElementById('ba-birth').value = b.birth || '';
    document.getElementById('ba-phone').value = b.phone || '';
    document.getElementById('ba-email').value = b.email || '';
    document.getElementById('ba-city').value = b.city || '';
    document.getElementById('ba-target').value = b.targetJob || '';
    document.getElementById('ba-selfintro').value = b.selfIntro || '';

    const eduList = document.getElementById('edu-list');
    eduList.innerHTML = '';
    const eduRows = (resume && resume.education) || [];
    eduRows.forEach(function (item) { addEduRow(item); });
    updateEmptyHint('edu');

    const projList = document.getElementById('proj-list');
    projList.innerHTML = '';
    const projRows = (resume && resume.projects) || [];
    projRows.forEach(function (item) { addProjRow(item); });
    updateEmptyHint('proj');

    const skills = (resume && resume.skills) || [];
    document.getElementById('skills-input').value = skills.join('\n');
  }

  /* ---------------- 收集表单数据 ---------------- */
  function collectResume() {
    function val(sel) { return document.querySelector(sel).value.trim(); }
    return {
      basic: {
        name: val('#ba-name'),
        gender: val('#ba-gender'),
        birth: val('#ba-birth'),
        phone: val('#ba-phone'),
        email: val('#ba-email'),
        city: val('#ba-city'),
        targetJob: val('#ba-target'),
        selfIntro: document.getElementById('ba-selfintro').value, // 保留换行原样
      },
      education: collectRows('edu'),
      projects: collectRows('proj'),
      skills: document.getElementById('skills-input').value
        .split('\n')
        .map(function (s) { return s.trim(); })
        .filter(Boolean),
    };
  }

  /* ---------------- 保存 ---------------- */
  document.getElementById('resume-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('ba-name').value.trim();
    if (!name) {
      Common.toast('请填写姓名后再保存', 'error');
      document.getElementById('ba-name').focus();
      return;
    }
    const btn = document.getElementById('btn-save-resume');
    Common.setBtnLoading(btn, true, '保存中...');
    try {
      await Api.put('/resume', collectResume());
      Common.setBtnLoading(btn, false);
      Common.toast('简历保存成功', 'success');
    } catch (err) {
      Common.setBtnLoading(btn, false);
      Common.toast((err && err.message) || '保存失败，请稍后重试', 'error');
    }
  });

  /* ==================== 动态行：教育 / 项目 ==================== */

  function setupDynamicRows() {
    document.getElementById('btn-add-edu').addEventListener('click', function () { addEduRow(null); });
    document.getElementById('btn-add-proj').addEventListener('click', function () { addProjRow(null); });
  }

  function addEduRow(item) {
    item = item || {};
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.innerHTML =
      '<button type="button" class="btn btn-gray btn-sm row-remove" title="删除这条"><i class="fa fa-trash-o"></i></button>' +
      '<div class="dynamic-grid">' +
      '<div><label class="form-label">学校</label><input class="form-input f-school" value="' + Common.esc(item.school || '') + '" placeholder="学校名称"></div>' +
      '<div><label class="form-label">专业</label><input class="form-input f-major" value="' + Common.esc(item.major || '') + '" placeholder="专业名称"></div>' +
      '<div><label class="form-label">学历</label><input class="form-input f-degree" value="' + Common.esc(item.degree || '') + '" placeholder="如：本科"></div>' +
      '<div><label class="form-label">开始时间</label><input class="form-input f-start" value="' + Common.esc(item.start || '') + '" placeholder="如：2022-09"></div>' +
      '<div><label class="form-label">结束时间</label><input class="form-input f-end" value="' + Common.esc(item.end || '') + '" placeholder="如：2026-06"></div>' +
      '</div>' +
      '<textarea class="form-textarea f-desc" rows="3" placeholder="在校经历、主修课程、获奖情况等（支持换行）">' + Common.esc(item.desc || '') + '</textarea>';
    row.querySelector('.row-remove').addEventListener('click', function () {
      row.remove();
      updateEmptyHint('edu');
    });
    document.getElementById('edu-list').appendChild(row);
    updateEmptyHint('edu');
  }

  function addProjRow(item) {
    item = item || {};
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.innerHTML =
      '<button type="button" class="btn btn-gray btn-sm row-remove" title="删除这条"><i class="fa fa-trash-o"></i></button>' +
      '<div class="dynamic-grid">' +
      '<div class="span-2"><label class="form-label">项目名称</label><input class="form-input f-name" value="' + Common.esc(item.name || '') + '" placeholder="项目名称"></div>' +
      '<div><label class="form-label">担任角色</label><input class="form-input f-role" value="' + Common.esc(item.role || '') + '" placeholder="如：后端开发"></div>' +
      '<div><label class="form-label">开始时间</label><input class="form-input f-start" value="' + Common.esc(item.start || '') + '" placeholder="如：2025-03"></div>' +
      '<div><label class="form-label">结束时间</label><input class="form-input f-end" value="' + Common.esc(item.end || '') + '" placeholder="如：2025-08"></div>' +
      '</div>' +
      '<textarea class="form-textarea f-desc" rows="3" placeholder="项目简介、你的职责、量化成果（支持换行）">' + Common.esc(item.desc || '') + '</textarea>';
    row.querySelector('.row-remove').addEventListener('click', function () {
      row.remove();
      updateEmptyHint('proj');
    });
    document.getElementById('proj-list').appendChild(row);
    updateEmptyHint('proj');
  }

  function collectRows(kind) {
    const listBox = kind === 'edu' ? document.getElementById('edu-list') : document.getElementById('proj-list');
    const rows = listBox.querySelectorAll('.dynamic-row');
    const result = [];
    rows.forEach(function (row) {
      const get = function (cls) {
        const el = row.querySelector('.' + cls);
        return el ? el.value.trim() : '';
      };
      if (kind === 'edu') {
        const item = {
          school: get('f-school'), major: get('f-major'), degree: get('f-degree'),
          start: get('f-start'), end: get('f-end'), desc: row.querySelector('.f-desc').value,
        };
        // 全空的跳过
        if (item.school || item.major || item.desc) result.push(item);
      } else {
        const item = {
          name: get('f-name'), role: get('f-role'),
          start: get('f-start'), end: get('f-end'), desc: row.querySelector('.f-desc').value,
        };
        if (item.name || item.desc) result.push(item);
      }
    });
    return result;
  }

  function updateEmptyHint(kind) {
    const listBox = kind === 'edu' ? document.getElementById('edu-list') : document.getElementById('proj-list');
    const hint = document.getElementById(kind === 'edu' ? 'edu-empty-hint' : 'proj-empty-hint');
    hint.style.display = listBox.children.length ? 'none' : 'block';
  }

  /* ==================== AI 操作区 ==================== */

  function setupAiPanel() {
    const btnGen = document.getElementById('btn-ai-generate');
    btnGen.addEventListener('click', function () { runAi(); });
    document.getElementById('btn-ai-again').addEventListener('click', function () { runAi(); });
    document.getElementById('btn-ai-retry').addEventListener('click', function () { runAi(); });

    document.getElementById('btn-ai-copy').addEventListener('click', async function () {
      const btn = this;
      Common.setBtnLoading(btn, true, '复制中...');
      const okFlag = await Common.copyText(buildAiText());
      Common.setBtnLoading(btn, false);
      Common.toast(okFlag ? '已复制到剪贴板' : '复制失败，请手动选择复制', okFlag ? 'success' : 'error');
    });

    // 填入：AI 结果不自动覆盖，必须用户确认
    document.getElementById('btn-ai-fill').addEventListener('click', function () {
      if (!aiResultData) return;
      const selfIntro = aiResultData.selfIntro;
      const skills = (aiResultData.skills || []).join('\n');
      const taIntro = document.getElementById('ba-selfintro');
      const taSkills = document.getElementById('skills-input');
      const willOverwrite = (taIntro.value.trim() !== '') || (taSkills.value.trim() !== '');
      if (willOverwrite) {
        if (!Common.confirmDlg('填入将覆盖当前表单中的"自我评价"和"技能特长"内容，确认继续吗？')) {
          return;
        }
      }
      if (selfIntro) taIntro.value = selfIntro;
      if (skills) taSkills.value = skills;
      Common.toast('已填入表单，请确认后点击"保存简历"', 'success');
    });

    document.getElementById('btn-ai-discard').addEventListener('click', function () {
      document.getElementById('ai-result').classList.add('hidden');
      aiResultData = null;
      document.getElementById('btn-ai-again').classList.add('hidden');
      document.getElementById('btn-ai-generate').classList.remove('hidden');
    });
  }

  function setAiBusy(busy) {
    aiBusy = busy;
    const btnGen = document.getElementById('btn-ai-generate');
    const btnAgain = document.getElementById('btn-ai-again');
    if (busy) {
      Common.setBtnLoading(btnGen, true, 'AI 生成中，请稍候...');
      Common.setBtnLoading(btnAgain, true, 'AI 生成中，请稍候...');
    } else {
      Common.setBtnLoading(btnGen, false);
      Common.setBtnLoading(btnAgain, false);
    }
  }

  function hideAiError() {
    document.getElementById('ai-error').classList.add('hidden');
  }

  function showAiError(msg) {
    document.getElementById('ai-error-text').textContent = msg || 'AI 服务异常，请稍后重试';
    document.getElementById('ai-error').classList.remove('hidden');
  }

  async function runAi() {
    if (aiBusy) return; // 防重复点击
    hideAiError();
    setAiBusy(true);
    try {
      const data = await Api.post('/ai/resume', {
        jobId: aiJobId || '',
        resume: collectResume(), // 基于当前表单内容生成
      });
      aiResultData = data;
      renderAiResult(data);
      document.getElementById('btn-ai-generate').classList.add('hidden');
      document.getElementById('btn-ai-again').classList.remove('hidden');
    } catch (err) {
      showAiError((err && err.message) || 'AI 生成失败，请稍后重试');
    } finally {
      setAiBusy(false);
    }
  }

  function renderAiResult(data) {
    const box = document.getElementById('ai-result');
    const content = document.getElementById('ai-result-content');
    let html = '';
    if (data.analysis) {
      html += '<div class="font-bold mb-8" style="color: #92400e;">📋 整体分析与建议</div>' +
        '<div class="mb-16">' + Common.esc(data.analysis) + '</div>';
    }
    if (data.selfIntro) {
      html += '<div class="font-bold mb-8" style="color: #92400e;">✍️ 优化后的自我评价（点"填入"写入表单）</div>' +
        '<div class="mb-16" style="background: #fff; border: 1px dashed #f59e0b; border-radius: 8px; padding: 12px 14px;">' +
        Common.esc(data.selfIntro) + '</div>';
    }
    if (data.skills && data.skills.length) {
      html += '<div class="font-bold mb-8" style="color: #92400e;">🛠 推荐技能标签（点"填入"写入表单）</div>' +
        '<div class="flex flex-wrap">' + data.skills.map(function (s) {
          return '<span class="tag">' + Common.esc(s) + '</span>';
        }).join('') + '</div>';
    }
    content.innerHTML = html;
    box.classList.remove('hidden');
  }

  function buildAiText() {
    if (!aiResultData) return '';
    const parts = [];
    if (aiResultData.analysis) parts.push('【整体分析与建议】\n' + aiResultData.analysis);
    if (aiResultData.selfIntro) parts.push('【优化后的自我评价】\n' + aiResultData.selfIntro);
    if (aiResultData.skills && aiResultData.skills.length) parts.push('【推荐技能标签】\n' + aiResultData.skills.join('、'));
    return parts.join('\n\n');
  }

  /* ---------------- 带 jobId 进入：加载岗位信息 ---------------- */
  async function loadJobForAi() {
    const banner = document.getElementById('ai-job-banner');
    try {
      const job = await Api.get('/jobs/' + aiJobId);
      document.getElementById('ai-job-title').textContent = job.title;
      document.getElementById('ai-job-meta').textContent = job.company + ' · ' + job.city + ' · ' + job.salary;
      document.getElementById('ai-job-link').href = 'job-detail.html?id=' + encodeURIComponent(job.id);
      // 按钮文案切换为"优化"
      document.getElementById('btn-ai-generate').innerHTML = '<i class="fa fa-magic"></i><span>用这个岗位优化我的简历</span>';
      document.getElementById('ai-tip').textContent =
        '已带入岗位「' + job.title + '」。点击按钮，AI 将结合该岗位要求优化你的简历。' +
        '生成结果不会自动覆盖，需要点击"填入"确认后才会写入表单。';
      banner.classList.remove('hidden');
    } catch (err) {
      // 岗位不存在时降级为普通生成
      aiJobId = null;
      Common.toast('目标岗位不存在，已切换为通用生成模式', 'info');
    }
  }

  init();
})();
