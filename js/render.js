/**
 * 前端内容渲染器（静态版）
 * ----------------------
 * 原站点依赖后端 /api/content 提供内容；GitHub Pages 是纯静态托管，
 * 因此这里改为读取仓库内的 data/content.json，接口与渲染逻辑保持一致。
 *
 * 页面对应（body[data-page]）：index / research / projects / blog / post / contact
 */
(function () {
  'use strict';

  var page = document.body.getAttribute('data-page');
  var CONTENT_URL = 'data/content.json';
  var _cache = null;

  function el(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function tagsHtml(tags) {
    if (!tags || !tags.length) return '';
    return tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('');
  }

  function authorsHtml(authors) {
    return (authors || []).map(function (a) {
      return a.me ? '<span class="me">' + esc(a.name) + '</span>' : esc(a.name);
    }).join(', ');
  }

  // ---------- 内容加载（带缓存） ----------
  function loadContent() {
    if (_cache) return Promise.resolve(_cache);
    return fetch(CONTENT_URL, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        _cache = data.content || data;
        return _cache;
      });
  }

  // ---------- 首页 ----------
  function renderIndex(c) {
    var p = c.profile || {}, a = c.about || {};

    var eyebrow = el('heroEyebrow');
    if (eyebrow) eyebrow.textContent = a.eyebrow || '';

    var heroText = el('heroText');
    if (heroText) heroText.textContent = a.heroText || '';

    var lead = el('heroLead');
    if (lead) lead.textContent = p.bio || '';

    // 头像卡
    var avImg = el('avImg');
    var avPhoto = el('avPhoto');
    if (avImg && avPhoto && p.photo) {
      avImg.src = p.photo;
      avImg.alt = (p.name || '') + ' 的照片';
      avImg.style.display = 'block';
      avPhoto.classList.add('has-photo');
    }
    var avInitials = el('avInitials');
    if (avInitials) avInitials.textContent = (p.name || '').slice(0, 1) || 'D';

    var avName = el('avName'); if (avName) avName.textContent = p.name || '';
    var avNameEn = el('avNameEn'); if (avNameEn) avNameEn.textContent = p.nameEn || '';
    var avTitle = el('avTitle'); if (avTitle) avTitle.textContent = p.title || '';
    var avHead = el('avHeadline'); if (avHead) avHead.textContent = p.headline || '';
    var avEmail = el('avEmail');
    if (avEmail) {
      avEmail.textContent = p.email || '';
      avEmail.href = 'mailto:' + (p.email || '');
    }

    // 统计（自动计算，见 renderStats）
    renderStats(c);

    // 研究方向
    var rc = el('researchCards');
    if (rc && c.research) {
      rc.innerHTML = c.research.map(function (r) {
        return '<div class="card reveal">' +
          '<span class="chip">' + esc(r.category || '') + '</span>' +
          '<h3>' + esc(r.title) + '</h3>' +
          '<p>' + esc(r.desc) + '</p>' +
          '<div class="tags">' + tagsHtml(r.tags) + '</div></div>';
      }).join('');
    }

    // 工作经历
    var workList = el('workExperience');
    if (workList && c.work_experience) {
      workList.innerHTML = c.work_experience.map(expCardHtml).join('');
    }

    // 项目经历
    var projList = el('projectExperience');
    if (projList && c.project_experience) {
      projList.innerHTML = c.project_experience.map(expCardHtml).join('');
    }

    // 出版论文（首页精选）
    var paperList = el('paperCards');
    if (paperList && c.publications) {
      paperList.innerHTML = c.publications.slice(0, 2).map(paperCardHtml).join('');
    }

    // 近期文章（取前 3）
    var featured = el('featuredPosts');
    if (featured && c.posts) {
      featured.innerHTML = c.posts.slice(0, 3).map(function (post) {
        return postHtml(post, c.posts.indexOf(post));
      }).join('');
    }

    triggerReveal();
  }

  /* ---------- 首页统计：全部自动计算 ----------
     规则来自 c.stats.fields，支持两种类型：
       count       数某个数组的长度
       yearsSince  当前年份 − 指定年份（随时间自动增长）
     未配置 stats 时，回退到 about 里的手填值，保证兼容旧数据。 */
  function renderStats(c) {
    var host = el('statsRow');
    if (!host) return;

    var cfg = c.stats || {};
    var fields = Array.isArray(cfg.fields) ? cfg.fields : [];

    // 兼容：没有 stats 配置时用 about 的旧字段
    if (!fields.length) {
      var a = c.about || {};
      fields = [
        { label: '年 AI 研究经验', type: 'value', value: a.years },
        { label: '公开出版物 / 文章', type: 'value', value: a.publications },
        { label: '项目经历', type: 'value', value: a.projects }
      ];
    }

    var html = fields.map(function (f) {
      var v = computeStat(f, cfg, c);
      return '<div class="stat-card">' +
        '<div class="num" data-count="' + v + '">' + v + '</div>' +
        '<div class="lbl">' + esc(f.label || '') + '</div>' +
        '</div>';
    }).join('');

    host.innerHTML = html;
    // 列数跟随卡片数量，保证分隔线均匀
    host.style.setProperty('--stat-cols', Math.max(1, fields.length));
  }

  function computeStat(field, cfg, c) {
    var type = field.type || 'value';

    if (type === 'count') {
      var arr = c[field.source];
      return Array.isArray(arr) ? arr.length : 0;
    }

    if (type === 'yearsSince') {
      // source 指向 stats 内的字段（如 startYear），也兼容直接写数字
      var start = field.source === 'startYear' || field.source === undefined
        ? cfg.startYear
        : (typeof field.source === 'number' ? field.source : cfg[field.source]);
      start = parseInt(start, 10);
      if (isNaN(start)) return 0;
      var now = new Date().getFullYear();
      return Math.max(0, now - start);
    }

    return field.value || 0;
  }

  // ---------- 研究 ----------
  function renderResearch(c) {
    var rc = el('researchCards');
    if (rc && c.research) {
      rc.innerHTML = c.research.map(function (r, i) {
        return '<div class="card reveal">' +
          '<span class="chip">' + esc((r.index || i + 1) + ' · ' + (r.category || '')) + '</span>' +
          '<h3>' + esc(r.title) + '</h3>' +
          '<p>' + esc(r.desc) + '</p>' +
          '<div class="tags">' + tagsHtml(r.tags) + '</div></div>';
      }).join('');
    }

    var pubs = el('publications');
    if (pubs && c.publications) {
      pubs.innerHTML = c.publications.map(function (pub) {
        var badges = (pub.badges || []).map(function (b) {
          return '<span class="tag">' + esc(b) + '</span>';
        }).join('');
        return '<div class="pub-item reveal">' +
          '<div class="pub-badge">' +
          '  <span class="yr">' + esc(pub.year) + '</span>' +
          '  <span class="type">' + esc(pub.type) + '</span>' +
          '</div>' +
          '<div>' +
          '  <div class="pub-title">' + esc(pub.title) + '</div>' +
          '  <div class="pub-authors">' + authorsHtml(pub.authors) + '</div>' +
          '  <div class="pub-venue">' + esc(pub.venue) + '</div>' +
          (pub.detail ? '<div class="pub-detail">' + esc(pub.detail) + '</div>' : '') +
          (badges ? '<div class="pub-badges">' + badges + '</div>' : '') +
          (pub.link ? '<div class="exp-link-wrap"><a class="exp-link" href="' + esc(pub.link) +
            '" target="_blank" rel="noopener">查看 ↗</a></div>' : '') +
          '</div></div>';
      }).join('');
    }

    var awardsWrap = el('awards');
    if (awardsWrap && c.awards) {
      awardsWrap.innerHTML = c.awards.map(function (aw) {
        return '<div class="card reveal">' +
          '<h3>' + esc(aw.title || '') + '</h3>' +
          '<p>' + esc(aw.desc || '') + '</p></div>';
      }).join('');
    }

    triggerReveal();
  }

  // ---------- 项目 ----------
  function renderProjects(c) {
    var pc = el('projectCards');
    if (pc && c.projects) {
      pc.innerHTML = c.projects.map(function (pr) {
        var link = pr.link
          ? '<a class="exp-link" href="' + esc(pr.link) + '" target="_blank" rel="noopener">访问 ↗</a>'
          : '';
        var clickAttr = pr.link ? ' data-href="' + esc(pr.link) + '" role="link" tabindex="0"' : '';
        var arrow = pr.link ? '<span class="card-corner" aria-hidden="true">↗</span>' : '';
        return '<div class="card reveal u-card-clickable' + (pr.link ? ' is-clickable' : '') + '"' + clickAttr + '>' +
          arrow +
          '<span class="chip">' + esc(pr.category || '') + '</span>' +
          '<h3>' + esc(pr.title) + '</h3>' +
          '<p>' + esc(pr.desc) + '</p>' +
          (pr.meta ? '<div class="meta">' + esc(pr.meta) + '</div>' : '') +
          '<div class="tags">' + tagsHtml(pr.tags) + '</div>' +
          (link ? '<div class="exp-link-wrap">' + link + '</div>' : '') +
          '</div>';
      }).join('');
    }

    // 工作经历（项目页复用）
    var workList = el('workExperience');
    if (workList && c.work_experience) {
      workList.innerHTML = c.work_experience.map(expCardHtml).join('');
    }

    triggerReveal();
  }

  // ---------- 博客 ----------
  function renderBlog(c) {
    var list = el('postList');
    if (list && c.posts) {
      list.innerHTML = c.posts.map(function (p, i) { return postHtml(p, i); }).join('');
    }
    triggerReveal();
  }

  // ---------- 单篇文章 ----------
  function renderPost(c) {
    var params = new URLSearchParams(location.search);
    var id = parseInt(params.get('id'), 10);
    var body = el('postBody');
    if (!body) return;

    var posts = c.posts || [];
    var post = (isNaN(id) || id < 0 || id >= posts.length) ? null : posts[id];

    if (!post) {
      body.innerHTML =
        '<div style="text-align:center;padding:50px 0;">' +
        '<p style="color:var(--ink-faint);margin-bottom:20px;">文章不存在或已删除。</p>' +
        '<a class="btn btn-primary" href="blog.html">← 返回博客</a></div>';
      document.title = '文章不存在 · ' + (c.profile && c.profile.name ? c.profile.name : '');
      return;
    }

    var paras = String(post.content || post.excerpt || '')
      .split(/\n+/)
      .map(function (p) { return p.trim(); })
      .filter(Boolean)
      .map(function (p) { return '<p>' + esc(p) + '</p>'; })
      .join('');

    body.innerHTML =
      '<div class="blog-meta">' +
      '<span class="cat">' + esc(post.category) + '</span>' +
      '<span>' + esc(post.date) + '</span>' +
      (post.minutes ? '<span>' + esc(post.minutes) + ' 分钟阅读</span>' : '') +
      '</div>' +
      '<h1 class="post-title">' + esc(post.title) + '</h1>' +
      '<div class="post-body">' + paras + '</div>' +
      '<div class="post-foot"><a class="blog-read" href="blog.html">← 更多文章</a></div>';

    document.title = post.title + ' · ' + (c.profile && c.profile.name ? c.profile.name : '');
  }

  // ---------- 联系 ----------
  function renderContact(c) {
    var p = c.profile || {};
    var defs = [
      { ic: '✉️', tt: 'Email', ss: p.email, href: p.email ? 'mailto:' + p.email : '' },
      { ic: '🐙', tt: 'GitHub', ss: p.githubHandle || p.github, href: p.github },
      { ic: '🎓', tt: 'Google Scholar', ss: p.scholarHandle, href: p.scholar },
      { ic: '📞', tt: '电话', ss: p.phone, href: p.phone ? 'tel:' + p.phone.replace(/\s/g, '') : '' },
      { ic: '📍', tt: '办公地点', ss: p.office, href: '' },
      { ic: '📚', tt: 'DBLP', ss: p.dblpHandle, href: p.dblp },
      { ic: '📝', tt: '微博', ss: p.weiboHandle, href: p.weibo },
      { ic: '🎬', tt: 'Bilibili', ss: p.bilibiliHandle, href: p.bilibili }
    ];
    var box = el('contactCards');
    if (box) {
      // 有链接的走 <a>，纯文本信息（如办公地点）走 <div>
      var items = defs.filter(function (d) { return d.ss; });
      box.innerHTML = items.map(function (d) {
        var ext = d.href && d.href.indexOf('http') === 0;
        var inner = '<span class="ic">' + d.ic + '</span>' +
          '<div><div class="tt">' + esc(d.tt) + '</div><div class="ss">' + esc(d.ss) + '</div></div>';
        if (!d.href) {
          return '<div class="contact-card reveal">' + inner + '</div>';
        }
        return '<a class="contact-card reveal" href="' + esc(d.href) + '"' +
          (ext ? ' target="_blank" rel="noopener"' : '') + '>' + inner + '</a>';
      }).join('');
    }

    var contactName = el('contactName');
    if (contactName) contactName.textContent = (p.name || '') + (p.title ? ' · ' + p.title : '');
    var contactEmail = el('contactEmail');
    if (contactEmail && p.email) {
      contactEmail.textContent = p.email;
      contactEmail.href = 'mailto:' + p.email;
    }

    triggerReveal();
  }

  // ---------- 卡片片段 ----------
  function postHtml(post, idx) {
    var hasContent = !!(post.content && post.content.trim());
    var link = hasContent ? ('post.html?id=' + idx) : '#';
    return '<article class="blog-item reveal">' +
      '<div class="blog-meta">' +
      '<span class="cat">' + esc(post.category) + '</span>' +
      '<span>' + esc(post.date) + '</span>' +
      (post.minutes ? '<span>' + esc(post.minutes) + ' 分钟</span>' : '') +
      '</div>' +
      '<h3><a href="' + link + '">' + esc(post.title) + '</a></h3>' +
      '<p>' + esc(post.excerpt) + '</p>' +
      '<a class="blog-read" href="' + link + '">' + (hasContent ? '阅读全文 →' : '查看 →') + '</a>' +
      '</article>';
  }

  function expCardHtml(exp) {
    var detail = exp.detail ? '<p class="exp-detail">' + esc(exp.detail) + '</p>' : '';
    var link = exp.link
      ? '<a class="exp-link" href="' + esc(exp.link) + '" target="_blank" rel="noopener">链接 ↗</a>'
      : '';
    var clickAttr = exp.link ? ' data-href="' + esc(exp.link) + '" role="link" tabindex="0"' : '';
    var arrow = exp.link ? '<span class="card-corner" aria-hidden="true">↗</span>' : '';
    return '<div class="exp-card u-card-clickable' + (exp.link ? ' is-clickable' : '') + '"' + clickAttr + '>' +
      arrow +
      '<div class="exp-head">' +
      '  <div class="exp-title">' + esc(exp.company || exp.title || '') + '</div>' +
      '  <div class="exp-role">' + esc(exp.role || '') + '</div>' +
      '  <div class="exp-period">' + esc(exp.period || '') + '</div>' +
      '</div>' +
      '<p class="exp-desc">' + esc(exp.desc || '') + '</p>' +
      detail +
      '<div class="tags">' + tagsHtml(exp.tags) + '</div>' +
      (link ? '<div class="exp-link-wrap">' + link + '</div>' : '') +
      '</div>';
  }

  function paperCardHtml(pub) {
    var authors = (pub.authors || []).slice(0, 3).map(function (a) {
      return a.me ? '<span class="me">' + esc(a.name) + '</span>' : esc(a.name);
    }).join(', ');
    var more = (pub.authors || []).length > 3 ? ' <em class="paper-more">等</em>' : '';
    var badges = (pub.badges || []).length
      ? '<div class="paper-badges">' + (pub.badges || []).map(function (b) {
          return '<span class="tag">' + esc(b) + '</span>';
        }).join('') + '</div>'
      : '';
    var detail = pub.detail ? '<p class="paper-detail">' + esc(pub.detail) + '</p>' : '';
    var link = pub.link
      ? '<a class="paper-link" href="' + esc(pub.link) + '" target="_blank" rel="noopener">查看论文 ↗</a>'
      : '';
    var clickAttr = pub.link ? ' data-href="' + esc(pub.link) + '" role="link" tabindex="0"' : '';
    var arrow = pub.link ? '<span class="card-corner" aria-hidden="true">↗</span>' : '';
    return '<div class="paper-card u-card-clickable' + (pub.link ? ' is-clickable' : '') + '"' + clickAttr + '>' +
      arrow +
      '<div class="paper-meta"><span class="paper-year">' + esc(pub.year) + '</span>' +
      (pub.type ? '<span class="paper-type">' + esc(pub.type) + '</span>' : '') + '</div>' +
      '<div class="paper-title">' + esc(pub.title) + '</div>' +
      '<div class="paper-authors">' + authors + more + '</div>' +
      '<div class="paper-venue">' + esc(pub.venue || '') + '</div>' +
      detail + badges +
      (link ? '<div class="paper-link-wrap">' + link + '</div>' : '') +
      '</div>';
  }

  // ---------- SEO：用配置的姓名填充 head 占位符 ----------
  function applySeo(profile) {
    var name = profile && profile.name;
    if (!name) return;
    var titleEl = document.querySelector('title');
    if (titleEl) {
      titleEl.textContent = titleEl.textContent.replace(/\{\s*name\s*\}/g, name);
    }
    var descEl = document.querySelector('meta[name="description"]');
    if (descEl) {
      descEl.setAttribute('content',
        (descEl.getAttribute('content') || '').replace(/\{\s*name\s*\}/g, name));
    }
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content',
        (ogTitle.getAttribute('content') || '').replace(/\{\s*name\s*\}/g, name));
    }
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && profile.bio) ogDesc.setAttribute('content', profile.bio);
  }

  function triggerReveal() {
    window.dispatchEvent(new CustomEvent('content-rendered'));
  }

  // ---------- 初始化 ----------
  function init() {
    loadContent()
      .then(function (c) {
        applySeo(c.profile);
        if (page === 'index') renderIndex(c);
        else if (page === 'research') renderResearch(c);
        else if (page === 'projects') renderProjects(c);
        else if (page === 'blog') renderBlog(c);
        else if (page === 'post') renderPost(c);
        else if (page === 'contact') renderContact(c);
      })
      .catch(function (e) {
        console.error('[render] 内容加载失败', e);
        var host = document.querySelector('[data-render]');
        if (host) {
          host.innerHTML = '<p style="color:var(--ink-faint);padding:20px 0;">' +
            '内容加载失败，请通过本地服务器（而非 file://）打开本页面。</p>';
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
