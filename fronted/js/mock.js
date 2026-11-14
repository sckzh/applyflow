/* =====================================================================
 * mock.js — 前端模拟接口层（无后端演示用）
 *
 * 所有"接口"用 localStorage 模拟，带 200~500ms 随机延迟，
 * 返回结构统一为 { code, message, data }（与真实后端契约一致）。
 *
 * 后端接口就绪后：把 api.js 中 API_CONFIG.useMock 改为 false 即可，
 * 接口路径与参数与真实后端对齐。
 *
 * 注意：岗位列表是示例数据（内存中），刷新后恢复；
 * 用户 / 资料 / 收藏 / 投递 / 简历存在 localStorage，刷新不丢。
 * ===================================================================== */
(function (window) {
  'use strict';

  /* ------------------------------ 常量 ------------------------------ */

  const TOKEN_KEY = 'jobhub_token'; // 当前登录令牌 { token, username }
  const LS = {
    users: 'jobhub_users', // 用户表
    profile: 'jobhub_profile_', // 个人资料，按用户名后缀
    resume: 'jobhub_resume_', // 简历，按用户名后缀
    fav: 'jobhub_fav_', // 收藏的岗位 id 数组
    app: 'jobhub_app_', // 投递记录数组
    appSeq: 'jobhub_app_seq', // 投递记录自增 id
  };

  /* 投递状态列表：状态文字跟数据走，页面一律不写死 */
  const STATUS_LIST = [
    { code: 'APPLIED', text: '已投递' },
    { code: 'SCREENING', text: '筛选中' },
    { code: 'INTERVIEW', text: '面试中' },
    { code: 'OFFER', text: '已录用' },
    { code: 'REJECTED', text: '未通过' },
  ];

  /* ---------------------------- 示例岗位 ---------------------------- */

  const JOBS = [
    {
      id: 'j01',
      title: '软件开发工程师（校招）',
      company: '星辰科技',
      city: '上海',
      salary: '15k-25k · 14薪',
      tags: ['Java', 'Spring Boot', 'MySQL', '校招'],
      statusCode: 'OPEN',
      statusText: '招聘中',
      publishedAt: '2026-11-05 09:30:00',
      description: '星辰科技成立于 2016 年，是一家专注于企业级云服务的高科技公司，已完成 C 轮融资。\n\n【岗位职责】\n1. 参与公司核心业务系统的设计与开发；\n2. 负责模块的功能实现、单元测试与文档编写；\n3. 配合团队完成需求评审、代码评审与线上问题排查；\n4. 持续优化系统性能与稳定性。\n\n【任职要求】\n1. 2026 届本科及以上学历，计算机相关专业；\n2. 熟悉 Java 语言，了解 Spring Boot 框架；\n3. 掌握 MySQL 基本使用，了解索引与事务；\n4. 有实际项目或实习经验者优先；\n5. 学习能力强，具备良好的沟通与团队协作能力。\n\n【福利待遇】\n五险一金、弹性工作、导师一对一培养、年度体检、免费健身房。',
      requirements: [
        '2026 届本科及以上学历，计算机相关专业',
        '熟悉 Java 语言与 Spring Boot 框架',
        '掌握 MySQL 基本使用，了解索引与事务',
        '有实际项目或实习经验者优先',
        '学习能力强，具备良好的沟通与团队协作能力',
      ],
    },
    {
      id: 'j02',
      title: '前端开发工程师（实习）',
      company: '云帆网络',
      city: '北京',
      salary: '200-300元/天',
      tags: ['JavaScript', 'Vue', 'CSS', '实习'],
      statusCode: 'OPEN',
      statusText: '招聘中',
      publishedAt: '2026-11-06 14:20:00',
      description: '云帆网络是国内领先的出海 SaaS 服务商，服务 3000+ 企业客户。\n\n【岗位职责】\n1. 参与公司核心产品前端页面开发与维护；\n2. 配合设计师还原高保真设计稿；\n3. 优化页面性能与交互体验；\n4. 参与前端组件库建设。\n\n【任职要求】\n1. 本科及以上在读，计算机相关专业优先；\n2. 熟悉 HTML、CSS、JavaScript 基础；\n3. 了解 Vue 或 React 任一框架；\n4. 每周可实习 4 天以上，实习期不少于 3 个月。\n\n【你将获得】\n转正机会、技术大牛带教、实习证明、下午茶零食不限量。',
      requirements: [
        '本科及以上在读，计算机相关专业优先',
        '熟悉 HTML、CSS、JavaScript 基础',
        '了解 Vue 或 React 任一框架',
        '每周可实习 4 天以上，实习期不少于 3 个月',
      ],
    },
    {
      id: 'j03',
      title: '后端开发工程师（校招）',
      company: '蓝海数据',
      city: '杭州',
      salary: '14k-24k · 15薪',
      tags: ['Go', '微服务', 'Redis', '校招'],
      statusCode: 'OPEN',
      statusText: '招聘中',
      publishedAt: '2026-11-03 10:00:00',
      description: '蓝海数据专注于大数据分析与处理平台，核心团队来自一线互联网大厂。\n\n【岗位职责】\n1. 负责数据平台后端服务的开发与维护；\n2. 参与微服务架构设计与接口定义；\n3. 处理高并发场景下的性能优化；\n4. 编写技术文档与单元测试。\n\n【任职要求】\n1. 2026 届本科及以上学历，计算机相关专业；\n2. 熟练掌握至少一门后端语言（Go / Java / Python）；\n3. 了解 Redis、消息队列等中间件；\n4. 有分布式系统或高并发项目经验者优先。\n\n【加分项】\nACM 竞赛获奖、开源项目贡献、GitHub 活跃。',
      requirements: [
        '2026 届本科及以上学历，计算机相关专业',
        '熟练掌握至少一门后端语言（Go / Java / Python）',
        '了解 Redis、消息队列等中间件',
        '有分布式系统或高并发项目经验者优先',
      ],
    },
    {
      id: 'j04',
      title: '产品经理（助理）',
      company: '青柠互娱',
      city: '深圳',
      salary: '12k-20k',
      tags: ['产品设计', '数据分析', '游戏'],
      statusCode: 'OPEN',
      statusText: '招聘中',
      publishedAt: '2026-11-08 16:45:00',
      description: '青柠互娱是一家年轻的游戏公司，代表作累计下载量破亿。\n\n【岗位职责】\n1. 协助产品经理完成需求调研与竞品分析；\n2. 撰写 PRD 文档并跟进开发落地；\n3. 跟踪产品数据，输出分析报告；\n4. 收集用户反馈，推动产品迭代。\n\n【任职要求】\n1. 本科及以上学历，专业不限，理工科优先；\n2. 逻辑清晰，具备较强的文档撰写能力；\n3. 对游戏行业有热情，玩过主流手游；\n4. 会使用 Axure / Figma 者优先。\n\n【培养计划】\n入职后由资深产品经理一对一带教，半年内可独立负责功能模块。',
      requirements: [
        '本科及以上学历，专业不限，理工科优先',
        '逻辑清晰，具备较强的文档撰写能力',
        '对游戏行业有热情，玩过主流手游',
        '会使用 Axure / Figma 者优先',
      ],
    },
    {
      id: 'j05',
      title: 'UI 设计师（实习）',
      company: '光点设计',
      city: '广州',
      salary: '150-250元/天',
      tags: ['Figma', '视觉设计', '实习'],
      statusCode: 'OPEN',
      statusText: '招聘中',
      publishedAt: '2026-11-07 11:10:00',
      description: '光点设计是一家精品设计咨询公司，服务多个知名品牌。\n\n【岗位职责】\n1. 参与 App / Web 界面视觉设计；\n2. 协助完成设计规范与组件库维护；\n3. 配合开发同学走查还原度；\n4. 参与设计评审与脑暴。\n\n【任职要求】\n1. 设计类相关专业在读，大三及以上；\n2. 熟练使用 Figma / Sketch；\n3. 有完整作品集（课程作业亦可）；\n4. 每周到岗 3 天以上。\n\n【你将获得】\n参与真实商业项目、作品集打磨指导、实习证明。',
      requirements: [
        '设计类相关专业在读，大三及以上',
        '熟练使用 Figma / Sketch',
        '有完整作品集（课程作业亦可）',
        '每周到岗 3 天以上',
      ],
    },
    {
      id: 'j06',
      title: '数据分析师（校招）',
      company: '恒信金融科技',
      city: '上海',
      salary: '13k-22k',
      tags: ['SQL', 'Python', '统计学', '校招'],
      statusCode: 'OPEN',
      statusText: '招聘中',
      publishedAt: '2026-11-02 09:00:00',
      description: '恒信金融科技致力于用数据驱动风控与营销决策，团队氛围务实。\n\n【岗位职责】\n1. 负责业务数据的提取、清洗与分析；\n2. 搭建业务监控报表与看板；\n3. 通过数据分析发现业务问题并给出建议；\n4. 支持运营与风控部门的临时取数需求。\n\n【任职要求】\n1. 2026 届本科及以上学历，统计、数学、计算机相关专业；\n2. 熟练掌握 SQL，能编写复杂查询；\n3. 会使用 Python 进行数据处理；\n4. 了解常用统计方法与 A/B 测试者优先。',
      requirements: [
        '2026 届本科及以上学历，统计、数学、计算机相关专业',
        '熟练掌握 SQL，能编写复杂查询',
        '会使用 Python 进行数据处理',
        '了解常用统计方法与 A/B 测试者优先',
      ],
    },
    {
      id: 'j07',
      title: '算法工程师（NLP 方向）',
      company: '极光智能',
      city: '北京',
      salary: '25k-40k · 16薪',
      tags: ['Python', 'PyTorch', 'NLP', '大模型'],
      statusCode: 'OPEN',
      statusText: '招聘中',
      publishedAt: '2026-11-01 15:30:00',
      description: '极光智能深耕智能客服与文档理解领域，自研大模型已服务数百家企业。\n\n【岗位职责】\n1. 参与 NLP 相关算法的研发与落地；\n2. 负责大模型微调、Prompt 工程与效果评测；\n3. 跟进业界前沿技术并推动内部应用；\n4. 撰写技术方案与实验报告。\n\n【任职要求】\n1. 硕士及以上学历，计算机、AI 相关方向；\n2. 扎实的机器学习与深度学习基础；\n3. 熟练使用 PyTorch，有 NLP 项目经验；\n4. 有顶会论文或竞赛获奖者优先。',
      requirements: [
        '硕士及以上学历，计算机、AI 相关方向',
        '扎实的机器学习与深度学习基础',
        '熟练使用 PyTorch，有 NLP 项目经验',
        '有顶会论文或竞赛获奖者优先',
      ],
    },
    {
      id: 'j08',
      title: '测试开发工程师（校招）',
      company: '锐思软件',
      city: '武汉',
      salary: '10k-18k',
      tags: ['Python', '自动化测试', 'CI/CD', '校招'],
      statusCode: 'OPEN',
      statusText: '招聘中',
      publishedAt: '2026-11-09 10:20:00',
      description: '锐思软件是华中地区领先的行业软件提供商，客户覆盖政务与金融。\n\n【岗位职责】\n1. 参与产品功能测试与接口测试；\n2. 开发与维护自动化测试脚本；\n3. 搭建与优化持续集成测试流程；\n4. 定位并跟踪缺陷直至闭环。\n\n【任职要求】\n1. 2026 届本科及以上学历，计算机相关专业；\n2. 熟悉 Python 或 Java；\n3. 了解软件测试基本理论与方法；\n4. 细心耐心，具备较强的质量意识。',
      requirements: [
        '2026 届本科及以上学历，计算机相关专业',
        '熟悉 Python 或 Java',
        '了解软件测试基本理论与方法',
        '细心耐心，具备较强的质量意识',
      ],
    },
    {
      id: 'j09',
      title: '新媒体运营专员',
      company: '万象传媒',
      city: '成都',
      salary: '8k-12k',
      tags: ['公众号', '短视频', '文案'],
      statusCode: 'OPEN',
      statusText: '招聘中',
      publishedAt: '2026-11-04 13:00:00',
      description: '万象传媒旗下运营多个百万粉丝账号，内容覆盖职场与校园。\n\n【岗位职责】\n1. 负责公众号与短视频账号的内容策划与发布；\n2. 撰写原创文案并跟进排版设计；\n3. 分析内容数据，优化选题方向；\n4. 参与粉丝互动与社群运营。\n\n【任职要求】\n1. 本科及以上学历，专业不限；\n2. 网感好，熟悉主流内容平台玩法；\n3. 具备扎实的文字功底；\n4. 有个人账号运营经验者优先。',
      requirements: [
        '本科及以上学历，专业不限',
        '网感好，熟悉主流内容平台玩法',
        '具备扎实的文字功底',
        '有个人账号运营经验者优先',
      ],
    },
    {
      id: 'j10',
      title: '游戏策划（实习）',
      company: '青柠互娱',
      city: '深圳',
      salary: '150-250元/天',
      tags: ['游戏设计', '数值策划', '文档'],
      statusCode: 'CLOSED',
      statusText: '已招满',
      publishedAt: '2026-10-20 09:00:00',
      description: '青柠互娱是一家年轻的游戏公司，代表作累计下载量破亿。\n\n【岗位职责】\n1. 协助主策完成玩法与关卡设计；\n2. 撰写策划案与配置表；\n3. 跟进开发进度，组织玩法测试；\n4. 整理玩家反馈与数据分析。\n\n【任职要求】\n1. 本科及以上在读，热爱游戏；\n2. 逻辑清晰，擅长拆解游戏系统；\n3. 熟练使用 Excel；\n4. 每周实习 4 天以上。\n\n【补充说明】\n本岗位 2026-11-11 起已停止接收简历，可关注公司其他在招岗位。',
      requirements: [
        '本科及以上在读，热爱游戏',
        '逻辑清晰，擅长拆解游戏系统',
        '熟练使用 Excel',
        '每周实习 4 天以上',
      ],
    },
    {
      id: 'j11',
      title: '嵌入式软件工程师（校招）',
      company: '宏图智造',
      city: '苏州',
      salary: '14k-22k',
      tags: ['C语言', 'RTOS', '单片机', '校招'],
      statusCode: 'OPEN',
      statusText: '招聘中',
      publishedAt: '2026-11-06 08:50:00',
      description: '宏图智造专注智能硬件研发，产品远销海外 30 多个国家。\n\n【岗位职责】\n1. 负责嵌入式软件的设计、编码与调试；\n2. 参与硬件驱动与协议栈开发；\n3. 编写软件设计文档；\n4. 支持产品测试与量产问题定位。\n\n【任职要求】\n1. 2026 届本科及以上学历，电子、自动化、计算机相关专业；\n2. 扎实的 C 语言基础，了解 RTOS 原理；\n3. 熟悉 STM32 等常用单片机；\n4. 参加过电子设计竞赛者优先。',
      requirements: [
        '2026 届本科及以上学历，电子、自动化、计算机相关专业',
        '扎实的 C 语言基础，了解 RTOS 原理',
        '熟悉 STM32 等常用单片机',
        '参加过电子设计竞赛者优先',
      ],
    },
    {
      id: 'j12',
      title: '网络安全工程师（实习）',
      company: '翰宇信息',
      city: '南京',
      salary: '200-300元/天',
      tags: ['渗透测试', 'Linux', '网络协议', '实习'],
      statusCode: 'OPEN',
      statusText: '招聘中',
      publishedAt: '2026-11-08 17:30:00',
      description: '翰宇信息为政企客户提供安全评估与应急响应服务。\n\n【岗位职责】\n1. 参与 Web / 主机渗透测试项目；\n2. 协助编写安全评估报告；\n3. 跟踪最新漏洞与攻击手法；\n4. 参与内部安全工具开发。\n\n【任职要求】\n1. 本科及以上在读，信息安全相关专业优先；\n2. 熟悉常见 Web 漏洞原理；\n3. 熟悉 Linux 与网络协议基础；\n4. 有 CTF 参赛经历者优先。',
      requirements: [
        '本科及以上在读，信息安全相关专业优先',
        '熟悉常见 Web 漏洞原理',
        '熟悉 Linux 与网络协议基础',
        '有 CTF 参赛经历者优先',
      ],
    },
    {
      id: 'j13',
      title: '人力资源专员（校招）',
      company: '绿洲教育',
      city: '长沙',
      salary: '7k-11k',
      tags: ['招聘', '员工关系', '校招'],
      statusCode: 'OPEN',
      statusText: '招聘中',
      publishedAt: '2026-11-10 09:15:00',
      description: '绿洲教育是华中地区头部在线教育机构，员工 2000+。\n\n【岗位职责】\n1. 协助完成校园招聘与社招流程；\n2. 负责入职手续办理与档案管理；\n3. 组织员工活动与培训；\n4. 维护员工关系，解答制度咨询。\n\n【任职要求】\n1. 2026 届本科及以上学历，人力资源、管理类相关专业；\n2. 亲和力强，善于沟通；\n3. 熟练使用 Office 办公软件；\n4. 有学生会或社团组织经验者优先。',
      requirements: [
        '2026 届本科及以上学历，人力资源、管理类相关专业',
        '亲和力强，善于沟通',
        '熟练使用 Office 办公软件',
        '有学生会或社团组织经验者优先',
      ],
    },
    {
      id: 'j14',
      title: '市场推广专员（实习）',
      company: '飞驰出行',
      city: '天津',
      salary: '120-200元/天',
      tags: ['活动策划', '校园推广', '新媒体', '实习'],
      statusCode: 'OPEN',
      statusText: '招聘中',
      publishedAt: '2026-11-09 14:40:00',
      description: '飞驰出行是京津冀地区领先的共享出行平台。\n\n【岗位职责】\n1. 策划并执行校园推广活动；\n2. 拓展校园渠道与社团合作；\n3. 负责活动数据统计与效果复盘；\n4. 协助新媒体内容产出。\n\n【任职要求】\n1. 本科及以上在读，专业不限；\n2. 执行力强，有校园活动经验；\n3. 性格外向，乐于与人打交道；\n4. 每周实习 3 天以上。',
      requirements: [
        '本科及以上在读，专业不限',
        '执行力强，有校园活动经验',
        '性格外向，乐于与人打交道',
        '每周实习 3 天以上',
      ],
    },
    {
      id: 'j15',
      title: '跨境电商运营（校招）',
      company: '新芽科技',
      city: '宁波',
      salary: '9k-14k',
      tags: ['亚马逊', '英语', '数据分析', '校招'],
      statusCode: 'OPEN',
      statusText: '招聘中',
      publishedAt: '2026-11-07 10:05:00',
      description: '新芽科技主营智能家居出海，年销售额超 5 亿。\n\n【岗位职责】\n1. 负责亚马逊店铺日常运营与维护；\n2. 优化商品 Listing 与广告投放；\n3. 分析销售数据并制定运营策略；\n4. 处理客户邮件与售后问题。\n\n【任职要求】\n1. 2026 届本科及以上学历，专业不限；\n2. 英语六级以上，读写流利；\n3. 对数据敏感，会使用 Excel 处理数据；\n4. 有电商运营经验者优先。',
      requirements: [
        '2026 届本科及以上学历，专业不限',
        '英语六级以上，读写流利',
        '对数据敏感，会使用 Excel 处理数据',
        '有电商运营经验者优先',
      ],
    },
  ];

  /* ---------------------- 演示账号与示例数据 ---------------------- */

  const DEMO_USERS = [
    { username: 'user', password: '123456', nickname: '小明同学', createdAt: '2026-10-01 10:00:00' },
    { username: 'admin', password: '123456', nickname: '管理员', createdAt: '2026-10-01 10:00:00' },
  ];

  const DEMO_PROFILE = {
    nickname: '小明同学',
    email: 'liming@stu.edu.cn',
    phone: '13800136688',
    city: '上海',
    targetJob: 'Java 开发工程师',
    intro: '计算机专业准毕业生，热爱技术，期待一份有成长空间的校招岗位。',
  };

  const DEMO_RESUME = {
    basic: {
      name: '李明',
      gender: '男',
      birth: '2003-05-12',
      phone: '13800136688',
      email: 'liming@stu.edu.cn',
      city: '上海',
      targetJob: 'Java 开发工程师',
      selfIntro: '计算机科学与技术专业大四学生，主修课程成绩优秀，具备扎实的 Java 与数据库基础。\n有两次真实项目开发经历，熟悉团队协作开发流程与 Git 工作流。\n对技术有热情，坚持阅读源码与技术博客，希望在校招季加入一家有技术追求的公司。',
    },
    education: [
      {
        school: '华东理工大学',
        major: '计算机科学与技术',
        degree: '本科',
        start: '2022-09',
        end: '2026-06',
        desc: '主修课程：数据结构、操作系统、计算机网络、数据库原理、软件工程。\nGPA 3.6 / 4.0，专业排名前 15%，连续两年获得校二等奖学金。',
      },
    ],
    projects: [
      {
        name: '校园二手交易平台',
        role: '后端开发',
        start: '2025-03',
        end: '2025-08',
        desc: '基于 Spring Boot + MySQL 开发的校园二手交易平台，负责订单模块与消息通知功能。\n使用 Redis 缓存热点商品，接口平均响应时间降低 40%。\n日均处理订单 200+，单元测试覆盖率 85%。',
      },
      {
        name: '图书馆座位预约小程序',
        role: '前端开发',
        start: '2024-10',
        end: '2025-01',
        desc: '使用微信小程序原生框架开发，实现座位查询、预约、签到、取消全流程。\n负责页面布局与交互逻辑，上线三个月累计用户 3000+。\n获学院"最佳课程设计"奖。',
      },
    ],
    skills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'Git', 'Linux 基础'],
  };

  /* ------------------------ localStorage 工具 ------------------------ */

  function lsGet(key, def) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null || raw === undefined ? def : JSON.parse(raw);
    } catch (e) {
      return def;
    }
  }
  function lsSet(key, val) {
    window.localStorage.setItem(key, JSON.stringify(val));
  }
  function lsRemove(key) {
    window.localStorage.removeItem(key);
  }

  function getUsers() {
    let users = lsGet(LS.users, null);
    if (!Array.isArray(users) || users.length === 0) {
      // 首次访问：写入演示账号
      users = DEMO_USERS.map(function (u) { return Object.assign({}, u); });
      lsSet(LS.users, users);
    }
    return users;
  }
  function saveUsers(users) {
    lsSet(LS.users, users);
  }

  /** 当前登录用户名（无 token 或 token 无效返回 null） */
  function currentUsername() {
    const tokenObj = lsGet(TOKEN_KEY, null);
    if (!tokenObj || !tokenObj.username) return null;
    const users = getUsers();
    const found = users.find(function (u) { return u.username === tokenObj.username; });
    return found ? found.username : null;
  }

  /* --------------------------- 响应工具 --------------------------- */

  function ok(data) { return { code: 0, message: 'ok', data: data }; }
  function err(code, message) { return { code: code, message: message, data: null }; }
  function delay() {
    return new Promise(function (resolve) {
      setTimeout(resolve, 200 + Math.random() * 300);
    });
  }

  /** 把岗位数据精简为卡片/收藏用结构 */
  function jobCard(job) {
    return {
      id: job.id,
      title: job.title,
      company: job.company,
      city: job.city,
      salary: job.salary,
      tags: job.tags,
      statusCode: job.statusCode,
      statusText: job.statusText,
      publishedAt: job.publishedAt,
    };
  }
  function findJob(id) {
    return JOBS.find(function (j) { return j.id === id; });
  }

  /* ------------------------ 各接口实现 ------------------------ */

  /* -------- 认证：注册 / 登录 / 登出 / 当前用户 -------- */

  async function handleRegister(body) {
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    const nickname = String(body.nickname || '').trim() || username;
    const users = getUsers();
    if (users.some(function (u) { return u.username === username; })) {
      return err(409, '用户名已存在，请换一个试试');
    }
    const user = {
      username: username,
      password: password,
      nickname: nickname,
      createdAt: formatNow(),
    };
    users.push(user);
    saveUsers(users);
    return ok({ username: user.username, nickname: user.nickname });
  }

  async function handleLogin(body) {
    const username = String(body.username || '').trim();
    const password = String(body.password || '');
    const users = getUsers();
    const user = users.find(function (u) { return u.username === username; });
    if (!user || user.password !== password) {
      return err(400, '用户名或密码错误');
    }
    const token = 'mock-token-' + username + '-' + Date.now();
    lsSet(TOKEN_KEY, { token: token, username: username });
    return ok({ token: token, username: user.username, nickname: user.nickname });
  }

  async function handleLogout() {
    lsRemove(TOKEN_KEY);
    return ok(null);
  }

  async function handleMe() {
    const username = currentUsername();
    if (!username) return err(401, '未登录或登录已过期');
    const users = getUsers();
    const user = users.find(function (u) { return u.username === username; });
    return ok({ username: user.username, nickname: user.nickname });
  }

  /* -------- 岗位：分页检索 / 详情 -------- */

  async function handleJobList(query) {
    const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
    const size = Math.max(1, parseInt(query.size || '8', 10) || 8);
    const keyword = String(query.keyword || '').trim().toLowerCase();
    let list = JOBS;
    if (keyword) {
      list = JOBS.filter(function (j) {
        const haystack = (j.title + ' ' + j.company + ' ' + j.city + ' ' + j.tags.join(' ')).toLowerCase();
        return haystack.indexOf(keyword) !== -1;
      });
    }
    const total = list.length;
    const start = (page - 1) * size;
    const pageList = list.slice(start, start + size).map(jobCard);
    return ok({ list: pageList, total: total, page: page, size: size });
  }

  async function handleJobDetail(id) {
    const job = findJob(id);
    if (!job) return err(404, '岗位不存在或已下架');
    return ok(job);
  }

  /* -------- 收藏：列表 / 添加 / 取消 -------- */

  async function handleFavList() {
    const username = currentUsername();
    if (!username) return err(401, '未登录或登录已过期');
    const ids = lsGet(LS.fav + username, []);
    const list = ids
      .map(function (id) { return findJob(id); })
      .filter(Boolean)
      .map(jobCard);
    return ok(list);
  }

  async function handleFavAdd(body) {
    const username = currentUsername();
    if (!username) return err(401, '未登录或登录已过期');
    const jobId = String(body.jobId || '');
    if (!findJob(jobId)) return err(404, '岗位不存在或已下架');
    const ids = lsGet(LS.fav + username, []);
    if (ids.indexOf(jobId) === -1) {
      ids.push(jobId);
      lsSet(LS.fav + username, ids);
    }
    return ok({ jobId: jobId, favorited: true });
  }

  async function handleFavRemove(jobId) {
    const username = currentUsername();
    if (!username) return err(401, '未登录或登录已过期');
    let ids = lsGet(LS.fav + username, []);
    ids = ids.filter(function (id) { return id !== jobId; });
    lsSet(LS.fav + username, ids);
    return ok({ jobId: jobId, favorited: false });
  }

  /* -------- 投递：列表 / 新增 / 修改状态 -------- */

  async function handleAppList() {
    const username = currentUsername();
    if (!username) return err(401, '未登录或登录已过期');
    const list = lsGet(LS.app + username, []);
    return ok(list);
  }

  async function handleAppAdd(body) {
    const username = currentUsername();
    if (!username) return err(401, '未登录或登录已过期');
    const jobId = String(body.jobId || '');
    const job = findJob(jobId);
    if (!job) return err(404, '岗位不存在或已下架');
    if (job.statusCode !== 'OPEN') return err(400, '该岗位已停止招聘');
    const list = lsGet(LS.app + username, []);
    if (list.some(function (a) { return a.jobId === jobId; })) {
      return err(409, '你已投递过该岗位，请勿重复投递');
    }
    const seq = (lsGet(LS.appSeq, 0) || 0) + 1;
    lsSet(LS.appSeq, seq);
    const rec = {
      id: seq,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      city: job.city,
      salary: job.salary,
      statusCode: STATUS_LIST[0].code,
      statusText: STATUS_LIST[0].text,
      appliedAt: formatNow(),
    };
    list.push(rec);
    lsSet(LS.app + username, list);
    return ok(rec);
  }

  async function handleAppStatus(id, body) {
    const username = currentUsername();
    if (!username) return err(401, '未登录或登录已过期');
    const statusCode = String(body.statusCode || '');
    const status = STATUS_LIST.find(function (s) { return s.code === statusCode; });
    if (!status) return err(400, '无效的投递状态');
    const list = lsGet(LS.app + username, []);
    const rec = list.find(function (a) { return String(a.id) === String(id); });
    if (!rec) return err(404, '投递记录不存在');
    rec.statusCode = status.code;
    rec.statusText = status.text;
    lsSet(LS.app + username, list);
    return ok(rec);
  }

  async function handleStatuses() {
    return ok(STATUS_LIST.map(function (s) { return { code: s.code, text: s.text }; }));
  }

  /* -------- 个人资料：读取 / 保存 -------- */

  async function handleGetProfile() {
    const username = currentUsername();
    if (!username) return err(401, '未登录或登录已过期');
    let profile = lsGet(LS.profile + username, null);
    if (!profile) {
      // 演示账号预置一份资料；新注册用户为空对象
      profile = username === 'user' ? Object.assign({}, DEMO_PROFILE) : {};
      if (username === 'user') lsSet(LS.profile + username, profile);
    }
    return ok(profile);
  }

  async function handleSaveProfile(body) {
    const username = currentUsername();
    if (!username) return err(401, '未登录或登录已过期');
    const profile = {
      nickname: String(body.nickname || '').trim(),
      email: String(body.email || '').trim(),
      phone: String(body.phone || '').trim(),
      city: String(body.city || '').trim(),
      targetJob: String(body.targetJob || '').trim(),
      intro: String(body.intro || '').trim(),
    };
    lsSet(LS.profile + username, profile);
    // 昵称同步到用户表（导航栏展示用）
    if (profile.nickname) {
      const users = getUsers();
      const user = users.find(function (u) { return u.username === username; });
      if (user) { user.nickname = profile.nickname; saveUsers(users); }
    }
    return ok(profile);
  }

  /* -------- 简历：读取 / 保存 -------- */

  async function handleGetResume() {
    const username = currentUsername();
    if (!username) return err(401, '未登录或登录已过期');
    let resume = lsGet(LS.resume + username, null);
    if (!resume && username === 'user') {
      resume = JSON.parse(JSON.stringify(DEMO_RESUME));
      lsSet(LS.resume + username, resume);
    }
    return ok(resume); // 新用户返回 null，页面显示空表单
  }

  async function handleSaveResume(body) {
    const username = currentUsername();
    if (!username) return err(401, '未登录或登录已过期');
    const resume = {
      basic: {
        name: String((body.basic && body.basic.name) || '').trim(),
        gender: String((body.basic && body.basic.gender) || ''),
        birth: String((body.basic && body.basic.birth) || ''),
        phone: String((body.basic && body.basic.phone) || '').trim(),
        email: String((body.basic && body.basic.email) || '').trim(),
        city: String((body.basic && body.basic.city) || '').trim(),
        targetJob: String((body.basic && body.basic.targetJob) || '').trim(),
        selfIntro: String((body.basic && body.basic.selfIntro) || ''),
      },
      education: Array.isArray(body.education) ? body.education : [],
      projects: Array.isArray(body.projects) ? body.projects : [],
      skills: Array.isArray(body.skills) ? body.skills : [],
    };
    lsSet(LS.resume + username, resume);
    return ok(resume);
  }

  /* -------- AI：生成 / 优化简历（模拟） -------- */

  async function handleAiResume(body) {
    const username = currentUsername();
    if (!username) return err(401, '未登录或登录已过期');
    const jobId = String(body.jobId || '');
    const resume = body.resume || null;
    const job = jobId ? findJob(jobId) : null;
    if (jobId && !job) return err(404, '岗位不存在或已下架');

    // 模拟 AI 处理耗时更长一些（1.5~2.5 秒）
    await new Promise(function (resolve) {
      setTimeout(resolve, 1500 + Math.random() * 1000);
    });
    // 约 8% 概率模拟服务异常，便于测试"错误提示 + 重试"逻辑
    if (Math.random() < 0.08) {
      return err(500, 'AI 服务暂时不可用（模拟错误），请稍后重试');
    }

    const name = (resume && resume.basic && resume.basic.name) ? resume.basic.name : '这位同学';
    const targetJob = (resume && resume.basic && resume.basic.targetJob) || (job ? job.title : '目标岗位');
    const skillBase = (job && job.tags && job.tags.length) ? job.tags : ['专业基础扎实'];

    const analysis =
      '整体评价：\n' +
      '1. 简历结构完整，教育背景与「' + targetJob + '」的匹配度较高；\n' +
      '2. 项目经历的描述可以更突出技术栈与量化成果（如性能提升、用户规模）；\n' +
      '3. 自我评价部分偏笼统，建议结合岗位要求补充关键词。\n' +
      (job ? '\n针对' + job.company + '「' + job.title + '」的定制建议：\n' +
        '1. 该岗位要求：' + job.requirements.slice(0, 3).join('；') + '；\n' +
        '2. 建议在简历中优先展示与 ' + job.tags.join('、') + ' 相关的经历；\n' +
        '3. 岗位所在地为 ' + job.city + '，如可到岗请写明。\n' : '');

    const selfIntro =
      '我是' + name + '，' + targetJob + '方向准毕业生。在校期间主修课程成绩优秀，并有多次真实项目开发经历，' +
      '熟悉从需求分析到上线交付的完整流程。我注重代码质量与文档沉淀，习惯用数据衡量工作成果。' +
      '期待加入一家重视技术成长的公司，在' + targetJob + '岗位上快速成长，为团队创造价值。';

    const skills = skillBase.concat(['沟通表达', '团队协作', '快速学习']);

    return ok({ analysis: analysis, selfIntro: selfIntro, skills: skills });
  }

  /* ---------------------------- 工具 ---------------------------- */

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function formatNow() {
    const d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  /* ----------------------------- 路由 ----------------------------- */

  const MockAPI = {
    /**
     * 模拟接口统一入口
     * @param {string} method GET / POST / PUT / DELETE
     * @param {string} path   如 /auth/login、/jobs/j01、/favorites/j01
     * @param {object} body   请求体
     * @param {object} query  URL 查询参数
     */
    handle: async function (method, path, body, query) {
      await delay();
      query = query || {};
      body = body || {};

      // /jobs/:id
      let m = path.match(/^\/jobs\/([^/]+)$/);
      if (m) {
        if (method === 'GET') return handleJobDetail(m[1]);
      }
      // /favorites/:id
      m = path.match(/^\/favorites\/([^/]+)$/);
      if (m) {
        if (method === 'DELETE') return handleFavRemove(m[1]);
      }
      // /applications/:id/status
      m = path.match(/^\/applications\/([^/]+)\/status$/);
      if (m) {
        if (method === 'PUT') return handleAppStatus(m[1], body);
      }

      // 固定路径
      if (method === 'POST' && path === '/auth/register') return handleRegister(body);
      if (method === 'POST' && path === '/auth/login') return handleLogin(body);
      if (method === 'POST' && path === '/auth/logout') return handleLogout();
      if (method === 'GET' && path === '/auth/me') return handleMe();

      if (method === 'GET' && path === '/jobs') return handleJobList(query);

      if (method === 'GET' && path === '/favorites') return handleFavList();
      if (method === 'POST' && path === '/favorites') return handleFavAdd(body);

      if (method === 'GET' && path === '/applications') return handleAppList();
      if (method === 'POST' && path === '/applications') return handleAppAdd(body);
      if (method === 'GET' && path === '/statuses') return handleStatuses();

      if (method === 'GET' && path === '/profile') return handleGetProfile();
      if (method === 'PUT' && path === '/profile') return handleSaveProfile(body);

      if (method === 'GET' && path === '/resume') return handleGetResume();
      if (method === 'PUT' && path === '/resume') return handleSaveResume(body);

      if (method === 'POST' && path === '/ai/resume') return handleAiResume(body);

      return err(404, '接口不存在：' + method + ' ' + path);
    },
  };

  window.MockAPI = MockAPI;
})(window);
