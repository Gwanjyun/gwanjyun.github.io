/* 共享导航与页脚注入 + 移动端菜单 */
(function () {
  'use strict';

  var NAV_LINKS = [
    { href: 'index.html', label: '主页' },
    { href: 'research.html', label: '研究' },
    { href: 'projects.html', label: '项目' },
    { href: 'blog.html', label: '博客' },
    { href: 'contact.html', label: '联系' }
  ];

  function currentPage() {
    var name = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    return name === '' ? 'index.html' : name;
  }

  function navHTML(name) {
    var here = currentPage();
    var links = NAV_LINKS.map(function (l) {
      var active = here === l.href.toLowerCase() ||
        (here === 'post.html' && l.href === 'blog.html');
      return '<a href="' + l.href + '"' + (active ? ' class="active"' : '') + '>' + l.label + '</a>';
    }).join('');

    return '' +
      '<header class="nav">' +
      '  <div class="container nav-inner">' +
      '    <a class="brand" href="index.html">' +
      '      <span class="logo">DJY</span>' +
      '      <span class="brand-name">' +
      '        <span class="name-cn">' + name + '</span>' +
      '        <small>AIGC · Research</small>' +
      '      </span>' +
      '    </a>' +
      '    <nav class="nav-links" id="navLinks">' + links + '</nav>' +
      '    <button class="nav-toggle" id="navToggle" aria-label="打开菜单" aria-expanded="false">☰</button>' +
      '  </div>' +
      '</header>';
  }

  function footerHTML(name) {
    var links = NAV_LINKS.slice(1).map(function (l) {
      return '<a href="' + l.href + '">' + l.label + '</a>';
    }).join('');
    var year = new Date().getFullYear();
    return '' +
      '<footer class="footer">' +
      '  <div class="container footer-inner">' +
      '    <div class="copy">© ' + year + ' ' + name + ' · AIGC 研究</div>' +
      '    <nav class="nav-links">' + links + '</nav>' +
      '  </div>' +
      '</footer>';
  }

  // 导航/页脚品牌名与页面内容同源：读取本地 content.json
  function fetchBrandName(cb) {
    fetch('data/content.json', { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var c = data.content || data;
        cb((c.profile && c.profile.name) || '个人主页');
      })
      .catch(function () { cb('个人主页'); });
  }

  function inject() {
    fetchBrandName(function (name) {
      var navHost = document.getElementById('siteHeader');
      var footHost = document.getElementById('siteFooter');
      if (navHost) navHost.innerHTML = navHTML(name);
      if (footHost) footHost.innerHTML = footerHTML(name);

      var toggle = document.getElementById('navToggle');
      var linksNav = document.getElementById('navLinks');
      if (toggle && linksNav) {
        toggle.addEventListener('click', function () {
          var open = linksNav.classList.toggle('open');
          toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        linksNav.addEventListener('click', function (e) {
          if (e.target.tagName === 'A') {
            linksNav.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
          }
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
