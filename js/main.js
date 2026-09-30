/* 通用交互：滚动入场动画、数字滚动、整卡可点 */
(function () {
  'use strict';

  var _revealIO = null;

  function ensureRevealObserver() {
    if ('IntersectionObserver' in window && !_revealIO) {
      _revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            _revealIO.unobserve(e.target);
          }
        });
      }, { threshold: 0.12 });
    }
  }

  function observeReveals() {
    ensureRevealObserver();
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (el.classList.contains('in')) return;
      if (_revealIO) _revealIO.observe(el);
      else el.classList.add('in');
    });
  }

  function runCounters() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) return;

      if (reduce) { el.textContent = target; return; }

      var suf = el.getAttribute('data-suffix') || '';
      var dur = 900, start = null, done = false;

      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target) + suf;
        if (p < 1) requestAnimationFrame(step);
        else { el.textContent = target + suf; done = true; }
      }

      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (ent) {
          if (ent[0].isIntersecting && !done) {
            requestAnimationFrame(step);
            io.disconnect();
          }
        }, { threshold: 0.4 });
        io.observe(el);
      } else {
        el.textContent = target + suf;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    observeReveals();
    runCounters();

    window.addEventListener('content-rendered', observeReveals);
    window.addEventListener('content-rendered', runCounters);

    // 整卡可点：带 data-href 的卡片
    document.addEventListener('click', function (e) {
      var target = e.target;
      if (target.closest && target.closest('a, button')) return;
      var card = target.closest && target.closest('.u-card-clickable[data-href]');
      if (card) {
        var href = card.getAttribute('data-href');
        if (href) window.open(href, '_blank', 'noopener');
      }
    });

    // 键盘可达性
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.target && e.target.closest && e.target.closest('.u-card-clickable[data-href]')) {
        e.preventDefault();
        var card = e.target.closest('.u-card-clickable[data-href]');
        var href = card.getAttribute('data-href');
        if (href) window.open(href, '_blank', 'noopener');
      }
    });
  });
})();
