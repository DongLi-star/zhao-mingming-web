const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

// Shared, font-independent line icons for links and generated player controls.
function uiIconMarkup(name = 'ne') {
  const paths = {"ne": "M5 19 19 5M5 5h14v14", "left": "M19 12H5m6-6-6 6 6 6", "right": "M5 12h14m-6-6 6 6-6 6", "down": "M12 5v14m-6-6 6 6 6-6", "up": "M12 19V5m-6 6 6-6 6 6", "horizontal": "M4 12h16M8 8l-4 4 4 4m8-8 4 4-4 4", "burst": "M12 3v18M3 12h18M5.6 5.6l12.8 12.8M5.6 18.4 18.4 5.6"};
  return `<svg class="ui-icon ui-icon-${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths[name] || paths.ne}"/></svg>`;
}
function appendUiIcon(parent, name = 'ne') { parent.insertAdjacentHTML('beforeend', ' ' + uiIconMarkup(name)); }

const menuButton = $('.menu-toggle');
const mobileNav = $('#mobile-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('span').textContent = '＋';
  mobileNav.hidden = true;
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.querySelector('span').textContent = open ? '−' : '＋';
  mobileNav.hidden = !open;
});
$$('#mobile-nav a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });

$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  const filter = button.dataset.filter;
  $$('[data-filter]').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  let count = 0;
  $$('.project').forEach(project => {
    project.hidden = filter !== 'all' && project.dataset.category !== filter;
    if (!project.hidden) count++;
  });
  $('#filter-status').textContent = `显示 ${count} 组${filter === 'all' ? '全部' : button.textContent.replace(/\d/g, '').trim()}作品`;
}));

const projects = {
  portraitLibrary: {
  "title": "从模特实拍，到 AI 人像库",
  "category": "PHOTOGRAPHY → AI GENERALIZATION → MODEL LIBRARY",
  "description": "基于「6.4人像拍摄」的模特实拍素材，通过 AI 泛化发型、妆容与人像风格，形成「人物」文件夹中的50张人像资产。实拍与生成图分区展示，用于后续角色选择、换装、场景创作与视频视觉分镜。",
  "portraitLibrary": {
    "sources": [
      {
        "src": "portraits/real-01.jpg",
        "label": "实拍素材 01"
      },
      {
        "src": "portraits/real-02.jpg",
        "label": "实拍素材 02"
      },
      {
        "src": "portraits/real-03.jpg",
        "label": "实拍素材 03"
      },
      {
        "src": "portraits/real-04.jpg",
        "label": "实拍素材 04"
      }
    ],
    "results": [
      {
        "src": "portraits/ai-10.jpg",
        "label": "优雅-1"
      },
      {
        "src": "portraits/ai-11.jpg",
        "label": "优雅-2"
      },
      {
        "src": "portraits/ai-12.jpg",
        "label": "优雅-3"
      },
      {
        "src": "portraits/ai-13.jpg",
        "label": "俊美"
      },
      {
        "src": "portraits/ai-16.jpg",
        "label": "俊美型"
      },
      {
        "src": "portraits/ai-14.jpg",
        "label": "俊美型-1"
      },
      {
        "src": "portraits/ai-15.jpg",
        "label": "俊美型-2"
      },
      {
        "src": "portraits/ai-17.jpg",
        "label": "俊美型2"
      },
      {
        "src": "portraits/ai-20.jpg",
        "label": "俏皮型"
      },
      {
        "src": "portraits/ai-18.jpg",
        "label": "俏皮型-1"
      },
      {
        "src": "portraits/ai-19.jpg",
        "label": "俏皮型-2"
      },
      {
        "src": "portraits/ai-21.jpg",
        "label": "前卫型"
      },
      {
        "src": "portraits/ai-22.jpg",
        "label": "前卫型"
      },
      {
        "src": "portraits/ai-23.jpg",
        "label": "前卫型3"
      },
      {
        "src": "portraits/ai-24.jpg",
        "label": "华丽型"
      },
      {
        "src": "portraits/ai-25.jpg",
        "label": "华丽型"
      },
      {
        "src": "portraits/ai-26.jpg",
        "label": "古典&都市"
      },
      {
        "src": "portraits/ai-27.jpg",
        "label": "古典型1"
      },
      {
        "src": "portraits/ai-31.jpg",
        "label": "唯美型"
      },
      {
        "src": "portraits/ai-28.jpg",
        "label": "唯美型-1"
      },
      {
        "src": "portraits/ai-29.jpg",
        "label": "唯美型-2"
      },
      {
        "src": "portraits/ai-30.jpg",
        "label": "唯美型-3"
      },
      {
        "src": "portraits/ai-32.jpg",
        "label": "少年型"
      },
      {
        "src": "portraits/ai-33.jpg",
        "label": "少年型1"
      },
      {
        "src": "portraits/ai-34.jpg",
        "label": "异域型"
      },
      {
        "src": "portraits/ai-35.jpg",
        "label": "异域型"
      },
      {
        "src": "portraits/ai-36.jpg",
        "label": "戏剧型-1"
      },
      {
        "src": "portraits/ai-37.jpg",
        "label": "戏剧型-2"
      },
      {
        "src": "portraits/ai-38.jpg",
        "label": "浪漫型"
      },
      {
        "src": "portraits/ai-39.jpg",
        "label": "甜美型"
      },
      {
        "src": "portraits/ai-40.jpg",
        "label": "甜美型"
      },
      {
        "src": "portraits/ai-41.jpg",
        "label": "甜美型1"
      },
      {
        "src": "portraits/ai-42.jpg",
        "label": "睿智型"
      },
      {
        "src": "portraits/ai-43.jpg",
        "label": "知性"
      },
      {
        "src": "portraits/ai-44.jpg",
        "label": "知性"
      },
      {
        "src": "portraits/ai-45.jpg",
        "label": "知性1"
      },
      {
        "src": "portraits/ai-46.jpg",
        "label": "知性型"
      },
      {
        "src": "portraits/ai-47.jpg",
        "label": "知性型"
      },
      {
        "src": "portraits/ai-50.jpg",
        "label": "自然型"
      },
      {
        "src": "portraits/ai-48.jpg",
        "label": "自然型-1"
      },
      {
        "src": "portraits/ai-49.jpg",
        "label": "自然型-2"
      },
      {
        "src": "portraits/ai-01.jpg",
        "label": "风格探索 01"
      },
      {
        "src": "portraits/ai-02.jpg",
        "label": "风格探索 02"
      },
      {
        "src": "portraits/ai-03.jpg",
        "label": "风格探索 03"
      },
      {
        "src": "portraits/ai-04.jpg",
        "label": "风格探索 04"
      },
      {
        "src": "portraits/ai-05.jpg",
        "label": "风格探索 05"
      },
      {
        "src": "portraits/ai-06.jpg",
        "label": "风格探索 06"
      },
      {
        "src": "portraits/ai-07.jpg",
        "label": "风格探索 07"
      },
      {
        "src": "portraits/ai-08.jpg",
        "label": "风格探索 08"
      },
      {
        "src": "portraits/ai-09.jpg",
        "label": "风格探索 09"
      }
    ]
  }
},
  skateWorkflow: {
    "title": "滑板运动 · 从原子素材到视觉分镜",
    "category": "AI VIDEO PRE-PRODUCTION / SKATEBOARD STUDY",
    "description": "以人物、服装、滑板、动作与背景五类共18份素材，组织动作和场景，校准商品外观、透视、光影与接触关系。下方展示完整流程图及8张静态生成结果，呈现AI视频制作的前期视觉方案。",
    "processImage": "workflows/skate-workflow.svg",
    "processLabel": "滑板运动视觉分镜生成流程",
    "images": [
        "workflows/skate-result-01.jpg",
        "workflows/skate-result-02.jpg",
        "workflows/skate-result-03.jpg",
        "workflows/skate-result-04.jpg",
        "workflows/skate-result-05.jpg",
        "workflows/skate-result-06.jpg",
        "workflows/skate-result-07.jpg",
        "workflows/skate-result-08.jpg"
    ]
},
  luxury: {
    title: '一线奢品 · AI 视觉重构', category: 'AI IMAGE / ART DIRECTION',
    description: '围绕 AMIRI、Maison Margiela 等奢品视觉，探索人物、服装与场景的生成式表达。以 ComfyUI 连接图像与分镜，在统一审美中扩展视觉叙事。创作方向：AI 全链路。',
    images: ['tods.jpg','rv.jpg','AMIRI-2.jpg','AMIRI-1.jpg','MaisonMargiela.jpg','MaisonMargiela-2.jpg']
  },
  motion: {
    title: '从静帧，到动态影像', category: 'AI MOTION / VISUAL STORY',
    description: '将时装人物与场景转化为动态叙事。选择一段影片，观察静帧中的服装、光线与情绪如何进入时间。六段 AI 动态影像，收录于创作档案。',
    films: [
      ['作品 01','13633266','3Yn57pW23rlQdDAa'],['作品 02','13633337','qd9g4rGBPLBQv86Z'],['作品 03','13633365','Mk6B4xNeERq79LAP'],['作品 04','13633374','3Yn57pW2P0aQdDAa'],['作品 05','13633386','XzVJwDqA3nO4D0EZ'],['作品 06','13633394','36Jm4aPdA8nwyjzB']
    ]
  },
  workflow: {
    title: '让创意，成为工作流', category: 'AI SYSTEM / CREATIVE WORKFLOW',
    description: '通过 TapNow 与 ComfyUI 连接产品、人物和场景，整理可复用的自动化视觉创作流程。连接构思、人物换装与场景生成，把视觉经验整理为可重复使用的创作流程。',
    images: ['tapnow-1.jpg','tapnow-2.jpg','comfyui-workflow.png'], wide: true
  },
  models: {
    title: '数字人 · 虚拟模特', category: 'AI IMAGE / DIGITAL HUMAN',
    description: '围绕数字人、服装呈现与商业图像一致性进行的生成式探索。八组造型，从人物比例、面料质感到姿态表达，建立可延续的视觉语言。',
    images: ['model-1.jpg','model-2.jpg','model-3.jpg','model-4.jpg','model-5.jpg','model-6.jpg','model-7.jpg','model-8.jpg']
  },
  film: {
    title: '导演与摄影 · 商业影像档案', category: 'FILM ARCHIVE / DIRECTING & CINEMATOGRAPHY',
    description: '在生成式 AI 之前，从现场与镜头中积累的视觉经验。以下内容沿用原网站的导演、摄影作品归档。',
    films: [
      ['天猫超市《麦田守望者》','12661242','E6WlQgZMxbx4gdJz'],['天猫小黑盒《咖啡体验派》','13371673','rVo9wyYz9gXwl5PG'],['河南卫视《爷爷的宝贝》','12208514','d0Nq7MzyrXvwO2Vj'],['小黑盒运动开新季','13634577','yM1l43VdExpwod2V'],['小黑盒38尖货节','13634588','eRPn7q681G9wm39p'],['王者荣耀全国大赛','12073648','BXl5M7namPbQkKEg'],['小黑盒双旦尖货','13634617','rVo9wyNgdgL4l5PG'],['天猫国际全球 TOP100','12818751','NK0mw6q90x87W1na'],['蒙牛纯甄 × 沈腾马丽','11811102','ArVo9wyAdg3wl5PG'],['天猫金妆奖活动先导片','13632425','bKG8Qd3o1AV4RJMy']
    ]
  }
};
Object.assign(projects, {
  "productFeatured": {
    "title": "AI 产品视频",
    "category": "AI MOTION / PRODUCT FILMS",
    "description": "数码耳机、护肤、饮料与运动产品的生成式影像创作。",
    "externalPlayer": true,
    "films": [
      [
        "AI产品广告—面霜护肤",
        "13777671",
        "DaLZwPqBqVD4nrjY"
      ],
      [
        "AI产品广告—数码耳机",
        "13777724",
        "qd9g4rDmDOr7v86Z"
      ],
      [
        "AI产品广告—运动鞋",
        "13777664",
        "KdRx7bZoZ8R7b2N3"
      ],
      [
        "AI产品广告—护肤精油",
        "13777685",
        "n2k9QAVaVzr718MZ"
      ],
      [
        "AI产品广告—饮品饮料",
        "13777668",
        "Mnp8wWk6kelwK0lG"
      ]
    ]
  },
  "sceneFeatured": {
    "title": "AI 人物场景视频",
    "category": "AI PEOPLE & SCENES",
    "description": "人物、家居、茶饮与奢品场景中的生成式影像叙事。",
    "externalPlayer": true,
    "films": [
      [
        "AI产品广告—家居沙发",
        "13777733",
        "xv5Ywj5A5lO760PX"
      ],
      [
        "AI广告—潮流耳机",
        "13777719",
        "DA96QevkvPP7j5N0"
      ],
      [
        "新中式茶饮—AI广告片",
        "13777686",
        "v9GZQRomoAo7WnAR"
      ],
      [
        "AI品牌广告",
        "13777619",
        "qd9g4rDmDeN7v86Z"
      ],
      [
        "AI创意短片—奢品手表",
        "13777546",
        "GKL87No2oPdwojJz"
      ]
    ]
  },
  "productFilms": {
    "title": "商品的另一种叙事",
    "category": "AI MOTION / PRODUCT STUDIES",
    "description": "12 条生成式商品创作短片，每条约 8–12 秒。围绕美妆、个护与日用品，探索产品展示、使用场景与材质表达，让每一帧服务于商品叙事。",
    "videos": [
      {
        "title": "优时颜洗面泡",
        "embed": "https://player.xinpianchang.com/?aid=13853520&mid=xv5YwjMd13O760PX",
        "poster": "recent/video-01-1.jpg",
        "duration": 10.1
      },
      {
        "title": "兰蔻眼霜",
        "embed": "https://player.xinpianchang.com/?aid=13853523&mid=GKL87N0aqg04ojJz",
        "poster": "recent/video-02-1.jpg",
        "duration": 10.1
      },
      {
        "title": "可复美修复贴",
        "embed": "https://player.xinpianchang.com/?aid=13853524&mid=MzkmwJD9MgGQxjXp",
        "poster": "recent/video-03-1.jpg",
        "duration": 10.1
      },
      {
        "title": "唇釉",
        "embed": "https://player.xinpianchang.com/?aid=13853525&mid=GmOEQGn9Blb418bn",
        "poster": "recent/video-04-1.jpg",
        "duration": 10
      },
      {
        "title": "巴黎欧莱雅润发精油",
        "embed": "https://player.xinpianchang.com/?aid=13853526&mid=DGPB72vRElg7drm5",
        "poster": "recent/video-05-1.jpg",
        "duration": 10.1
      },
      {
        "title": "护舒宝卫生巾",
        "embed": "https://player.xinpianchang.com/?aid=13853527&mid=0lYnQm3Vr8Gw62j1",
        "poster": "recent/video-06-1.jpg",
        "duration": 10.1
      },
      {
        "title": "杜蕾斯",
        "embed": "https://player.xinpianchang.com/?aid=13853528&mid=POpZQXvDEd1wEr5a",
        "poster": "recent/video-07-1.jpg",
        "duration": 10
      },
      {
        "title": "洗衣凝珠",
        "embed": "https://player.xinpianchang.com/?aid=13853529&mid=jlyzw0qZAYk4B198",
        "poster": "recent/video-08-1.jpg",
        "duration": 8.1
      },
      {
        "title": "漱口水",
        "embed": "https://player.xinpianchang.com/?aid=13853530&mid=yoRe78Kq6AGQr1Dj",
        "poster": "recent/video-09-1.jpg",
        "duration": 9.2
      },
      {
        "title": "舒肤佳香皂",
        "embed": "https://player.xinpianchang.com/?aid=13853531&mid=rVo9wy2nda64l5PG",
        "poster": "recent/video-10-1.jpg",
        "duration": 10.2
      },
      {
        "title": "苏菲安睡裤",
        "embed": "https://player.xinpianchang.com/?aid=13853532&mid=bKG8QdRn0OdwRJMy",
        "poster": "recent/video-11-1.jpg",
        "duration": 11.5
      },
      {
        "title": "鱼子面膜",
        "embed": "https://player.xinpianchang.com/?aid=13853533&mid=d0Nq7M1KOnG7O2Vj",
        "poster": "recent/video-12-1.jpg",
        "duration": 9.8
      }
    ]
  },
  "liveScenes": {
    "title": "让AI直播间，拥有新的想象",
    "category": "AI IMAGE / LIVE SPACE STUDIES",
    "description": "21 张AI直播间视觉效果测试，涵盖美妆专柜、东方美学、3C 极客与珠宝文玩。从机位与人物尺度，到空间氛围与产品陈列，探索不同品类的视觉表达。",
    "groups": [
      {
        "title": "美妆专柜",
        "images": [
          "recent/live-01.jpg",
          "recent/live-02.jpg",
          "recent/live-03.jpg"
        ]
      },
      {
        "title": "东方与法式美学",
        "images": [
          "recent/live-04.jpg",
          "recent/live-05.jpg",
          "recent/live-06.jpg",
          "recent/live-07.jpg",
          "recent/live-08.jpg",
          "recent/live-09.jpg",
          "recent/live-10.jpg",
          "recent/live-11.jpg",
          "recent/live-12.jpg"
        ]
      },
      {
        "title": "3C 极客空间",
        "images": [
          "recent/live-13.jpg",
          "recent/live-14.jpg",
          "recent/live-15.jpg",
          "recent/live-16.jpg"
        ]
      },
      {
        "title": "珠宝与文玩",
        "images": [
          "recent/live-17.jpg",
          "recent/live-18.jpg",
          "recent/live-19.jpg",
          "recent/live-20.jpg",
          "recent/live-21.jpg"
        ]
      }
    ]
  },
  "liveProject": {
    "title": "AI直播间 · 从构想到动态",
    "category": "AI PROJECT / CREATIVE PROCESS",
    "description": "从视觉参考、空间搭建，到界面效果与动态测试。连接场景、人物和商品，呈现 AI直播间由概念走向动态的创作过程。包含搭建流程图与两组人物口播展示。",
    "processImage": "recent/live-workflow.jpg",
    "videos": [
      {
        "title": "AI直播间人物口播 · 示例 01",
        "embed": "https://player.xinpianchang.com/?aid=13853534&mid=8pvbQYpR9mk4306X",
        "poster": "recent/video-13-1.jpg",
        "duration": 15.0
      },
      {
        "title": "AI直播间人物口播 · 示例 02",
        "embed": "https://player.xinpianchang.com/?aid=13854180&mid=E6WlQgN5md14gdJz",
        "duration": null
      }
    ]
  }
});
const dialog = $('#project-dialog');
const dialogBody = $('#dialog-body');
let lastTrigger = null;
function setFilm(project, index) {
  const film = project.films[index];
  const frame = $('.media-frame', dialogBody);
  frame.replaceChildren();
  const iframe = document.createElement('iframe');
  iframe.src = `https://player.xinpianchang.com/?aid=${film[1]}&mid=${film[2]}`;
  iframe.title = film[0];
  iframe.allow = 'fullscreen; picture-in-picture';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allowFullscreen = true;
  frame.append(iframe);
  $$('.film-controls button', dialogBody).forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  $('.media-caption', dialogBody).textContent = film[0];
  const link = $('.external-film', dialogBody);
  link.href = project.externalPlayer ? iframe.src : `https://www.xinpianchang.com/a${film[1]}`;
  link.textContent = project.externalPlayer ? '在新片场播放器中打开' : '在新片场打开此作品'; appendUiIcon(link);
}
function openProject(key, trigger, initialIndex = 0) {
  const project = projects[key];
  if (!project) return;
  stopInlineLiveEmbed();
  lastTrigger = trigger;
  $('#dialog-title').textContent = project.title;
  $('#dialog-category').textContent = project.category;
  $('#dialog-description').textContent = project.description;
  dialogBody.replaceChildren();
  if (project.processImage) {
    const link = document.createElement('a'); link.href = `assets/${project.processImage}`; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.className = 'process-image-link'; link.setAttribute('aria-label',`打开${project.processLabel || 'AI直播间搭建流程'}大图`);
    const image = document.createElement('img'); image.src = link.href; image.alt = `${project.processLabel || 'AI直播间搭建流程'}，点击查看大图`; link.append(image); dialogBody.append(link);
    const note = document.createElement('p'); note.className = 'media-caption'; note.textContent = `${project.processLabel || '搭建流程'} / 点击图片打开完整大图`; dialogBody.append(note);
  }
  if (project.portraitLibrary) {
    const library = project.portraitLibrary;
    const jump = document.createElement('button'); jump.type = 'button'; jump.className = 'portrait-library-jump'; jump.textContent = '浏览 50 张 AI 泛化人像'; appendUiIcon(jump, 'down');
    dialogBody.append(jump);
    let resultsHeading;
    [['模特实拍 · 原始拍摄', library.sources, true], ['AI 模特人像库 · 50 张生成资产', library.results, false]].forEach(([label, items, original]) => {
      const heading = document.createElement('h3'); heading.className = 'gallery-group-title portrait-detail-heading'; heading.textContent = label; heading.tabIndex = -1;
      if (!original) resultsHeading = heading;
      const gallery = document.createElement('div'); gallery.className = `portrait-detail-grid${original ? ' portrait-source-detail' : ''}`;
      items.forEach(item => {
        const figure = document.createElement('figure');
        const link = document.createElement('a'); link.href = `assets/${item.src}`; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.setAttribute('aria-label', `打开${item.label}${original ? '实拍' : 'AI 泛化人像'}大图`);
        const image = document.createElement('img'); image.src = link.href; image.alt = `${item.label} · ${original ? '模特实拍原片' : 'AI 泛化人像'}`; image.loading = 'lazy'; image.width = original ? 600 : 700; image.height = original ? 900 : 700;
        const caption = document.createElement('figcaption'); caption.textContent = item.label;
        link.append(image); figure.append(link, caption); gallery.append(figure);
      });
      dialogBody.append(heading, gallery);
    });
    jump.addEventListener('click', () => { resultsHeading.scrollIntoView({block: 'start', behavior: 'auto'}); resultsHeading.focus({preventScroll: true}); });
  } else if (project.videos) {
    const player = document.createElement('iframe'); player.className = `native-video${project.processImage ? ' portrait-video' : ''}`; player.allow = 'fullscreen; picture-in-picture'; player.allowFullscreen = true; player.referrerPolicy = 'strict-origin-when-cross-origin';
    const caption = document.createElement('p'); caption.className = 'media-caption';
    const controls = document.createElement('div'); controls.className = 'film-controls'; controls.setAttribute('role','group'); controls.setAttribute('aria-label','选择短片');
    const link = document.createElement('a'); link.className = 'external-film'; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = '在新片场播放器中打开'; appendUiIcon(link);
    function chooseVideo(index) {
      const clip = project.videos[index]; player.src = clip.embed; player.title = clip.title;
      caption.textContent = `${clip.title}${clip.duration ? ` / ${clip.duration} 秒` : ""} / 创作测试`;
      link.href = clip.embed;
      [...controls.children].forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));
    }
    project.videos.forEach((item,index)=>{const button=document.createElement('button');button.textContent=item.title;button.addEventListener('click',()=>chooseVideo(index));controls.append(button);});
    dialogBody.append(player,caption,controls,link); chooseVideo(Math.max(0, Math.min(project.videos.length - 1, initialIndex)));
  } else if (project.groups) {
    project.groups.forEach(group=>{
      const heading=document.createElement('h3');heading.className='gallery-group-title';heading.textContent=group.title;
      const gallery=document.createElement('div');gallery.className='detail-gallery live-gallery';
      group.images.forEach((file,index)=>{const image=document.createElement('img');image.src=`assets/${file}`;image.alt=`${group.title}AI直播间效果测试 ${index+1}`;image.loading='lazy';gallery.append(image);});
      dialogBody.append(heading,gallery);
    });
  } else if (project.images) {
    const gallery = document.createElement('div');
    gallery.className = `detail-gallery${project.wide ? ' workflow-gallery' : ''}`;
    project.images.forEach((file, index) => {
      const image = document.createElement('img');
      image.src = `assets/${file}`;
      image.alt = `${project.title}，作品 ${index + 1}`;
      image.loading = 'lazy';
      gallery.append(image);
    });
    dialogBody.append(gallery);
  } else {
    const frame = document.createElement('div'); frame.className = 'media-frame';
    const caption = document.createElement('p'); caption.className = 'media-caption';
    const controls = document.createElement('div'); controls.className = 'film-controls'; controls.setAttribute('role','group'); controls.setAttribute('aria-label','选择影片');
    project.films.forEach((film, index) => {
      const button = document.createElement('button');
      button.textContent = film[0]; button.setAttribute('aria-pressed','false');
      button.addEventListener('click', () => setFilm(project, index));
      controls.append(button);
    });
    const link = document.createElement('a'); link.className = 'external-film'; link.target = '_blank'; link.rel = 'noopener noreferrer';
    dialogBody.append(frame, caption, controls, link);
    setFilm(project, Math.max(0, Math.min(project.films.length - 1, initialIndex)));
  }
  document.body.classList.add('dialog-open');
  dialog.showModal();
  dialog.scrollTop = 0;
}
document.addEventListener('click', event => {
  const button = event.target.closest('[data-project]');
  if (!button) return;
  openProject(button.dataset.project, button, Number(button.dataset.mediaIndex ?? button.dataset.filmIndex ?? 0) || 0);
});
$('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) {const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();} });
dialog.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  $$('video',dialogBody).forEach(video=>{video.pause();video.removeAttribute('src');video.load();});
  dialogBody.replaceChildren();
  restoreInlineLiveEmbed();
  lastTrigger?.focus({preventScroll:true});
});

// Unload the inline embed while a modal is open so two players cannot speak together.
const inlineLiveFrames = [...document.querySelectorAll('[data-live-embed]')];
function stopInlineLiveEmbed() { inlineLiveFrames.forEach(frame => frame.removeAttribute('src')); }
function restoreInlineLiveEmbed() {
  if (!dialog.open) inlineLiveFrames.forEach(frame => { if (!frame.hasAttribute('src')) frame.src = frame.dataset.liveEmbed; });
}
addEventListener('pagehide', stopInlineLiveEmbed);
addEventListener('pageshow', restoreInlineLiveEmbed);
