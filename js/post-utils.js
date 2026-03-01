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
