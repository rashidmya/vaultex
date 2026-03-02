/**
 * post-utils.js — post page utilities
 *
 * - Smooth scroll for in-page anchor links
 * - External link safety (rel="noopener noreferrer")
 *
 * Only runs when #markdown-body exists (post / page layouts).
 */

import { $, $$, on } from './helpers.js';

var markdownBody = $('#markdown-body');

/* Scroll to search excerpt on arrival from a match-card click */
(function () {
  var SCROLL_TARGET_KEY = 'vaultex-scroll-target';
  var raw = sessionStorage.getItem(SCROLL_TARGET_KEY);
  if (!raw) return;
  var t;
  try { t = JSON.parse(raw); } catch (e) { return; }

  /* Compare pathnames only — g.url may be a full URL or just a path */
  var targetPath;
  try { targetPath = new URL(t.url, window.location.href).pathname; } catch (e) { targetPath = t.url; }
  if (targetPath !== window.location.pathname) return;
  sessionStorage.removeItem(SCROLL_TARGET_KEY);

  requestAnimationFrame(function () {
    var root   = markdownBody || document.body;
    var norm = t.matchCase
      ? function (s) { return s.replace(/\s+/g, ' ').trim(); }
      : function (s) { return s.replace(/\s+/g, ' ').trim().toLowerCase(); };

    var blocks = root.querySelectorAll('p, pre, li, h1, h2, h3, h4, h5, h6, blockquote, td');
    var el = null;

    /* Try progressively shorter needles — a long excerpt may span two block
       elements, so the full string won't appear in any single one. */
    var lengths = [60, 40, 25];
    outer: for (var li = 0; li < lengths.length; li++) {
      var needle = norm(t.text.slice(0, lengths[li]));
      if (!needle) continue;
      for (var i = 0; i < blocks.length; i++) {
        if (norm(blocks[i].textContent).includes(needle)) {
          el = blocks[i];
          break outer;
        }
      }
    }

    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('search-scroll-highlight');
    el.addEventListener('animationend', function () {
      el.classList.remove('search-scroll-highlight');
    }, { once: true });
  });
})();

if (markdownBody) {
  $$('a[href^="#"]', markdownBody).forEach(function (a) {
    on(a, 'click', function (e) {
      var target = $(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  $$('a', markdownBody).forEach(function (a) {
    var href = a.getAttribute('href') || '';
    if ((href.startsWith('http://') || href.startsWith('https://')) &&
        a.hostname !== window.location.hostname) {
      a.setAttribute('rel', 'noopener noreferrer');
      /* target="_blank" is already set by Hexo's external_link config */
    }
  });
}
