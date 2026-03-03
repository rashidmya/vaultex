/**
 * search.js — full-text search against search.xml
 *
 * Exports `searchData` as a live binding so quick-switcher.js can read it
 * once the async fetch completes (ES module live bindings update automatically).
 */

import { $, $$, on, escHtml, toPlain, decodeEntities, makeRe, renderWithHighlight } from './helpers.js';
import { closeDropdown, toggleDropdown } from './dropdowns.js';
import { openLeft, activateSidebarTab } from './sidebar-left.js';

export var searchData = null;

var searchInput        = $('#search-input');
var searchResults      = $('#search-results');
var noResults          = $('#search-no-results');
var resultsCount       = $('#search-results-count');
var searchToolbar      = $('#search-toolbar');
var matchCaseBtn       = $('#search-match-case');
var clearBtn           = $('#search-clear');
var searchSortBtn      = $('#search-sort-btn');
var searchSortDropdown = $('#search-sort-dropdown');
var filterBtn          = $('#search-filter-btn');
var filterPanel        = $('#search-filter-panel');
var filterCollapseEl   = $('#filter-collapse-results');
var filterMoreCtxEl    = $('#filter-more-context');
var searchSortValue    = 'name-asc';
var searchTimeout      = null;
var matchCase          = false;
var filterCollapse     = false;
var filterMoreCtx      = false;

/* Load search.xml once */
fetch((window.VAULTEX_CONFIG && window.VAULTEX_CONFIG.searchXml) || '/search.xml')
  .then(function (r) { if (!r.ok) throw 0; return r.text(); })
  .then(function (xml) {
    var doc = new DOMParser().parseFromString(xml, 'text/xml');
    searchData = Array.from(doc.querySelectorAll('entry')).map(function (e) {
      function txt(tag) { return (e.querySelector(tag) || {}).textContent || ''; }
      return { title: txt('title'), url: txt('url'), content: txt('content'), date: txt('published') };
    });
  })
  .catch(function () {});

/*
 * extractExcerpts — context-window approach.
 * Find all match positions in plain text, merge nearby windows,
 * return at most maxN trimmed excerpts with leading/trailing ellipsis.
 */
function extractExcerpts(plain, terms, cs, maxN) {
  var CTX = filterMoreCtx ? 260 : 50;
  var re  = makeRe(terms, cs);
  if (!re) return [plain.slice(0, 150)];

  /* collect positions */
  var hits = [], m;
  re.lastIndex = 0;
  while ((m = re.exec(plain)) !== null) {
    hits.push(m.index);
    if (hits.length > 300) break; /* safety cap */
  }
  if (!hits.length) return [plain.slice(0, 150)];

  /* split into new card only when windows have no overlap */
  var windows = [];
  var wS = Math.max(0, hits[0] - CTX);
  var wE = Math.min(plain.length, hits[0] + CTX);
  for (var i = 1; i < hits.length; i++) {
    var nS = Math.max(0, hits[i] - CTX);
    if (nS <= wE) {
      wE = Math.min(plain.length, hits[i] + CTX);
    } else {
      windows.push([wS, wE]);
      if (windows.length >= maxN) break;
      wS = nS;
      wE = Math.min(plain.length, hits[i] + CTX);
    }
  }
  windows.push([wS, wE]);

  return windows.slice(0, maxN).map(function (w) {
    return (w[0] > 0 ? '\u2026' : '') + plain.slice(w[0], w[1]) + (w[1] < plain.length ? '\u2026' : '');
  });
}

/* Main search function */
function doSearch(query) {
  var toolbar = searchToolbar;
  if (!query || query.trim().length < 1) {
    if (searchResults) searchResults.innerHTML = '';
    if (resultsCount)  resultsCount.textContent = '';
    if (noResults)     noResults.hidden = false;
    if (toolbar)       toolbar.hidden = true;
    return;
  }
  if (!searchData) return;

  var q     = query.trim();
  var terms = q.split(/\s+/);
  var fold  = terms.map(function (t) { return matchCase ? t : t.toLowerCase(); });

  /* Build FileGroup array */
  var groups = [];
  searchData.forEach(function (post) {
    var plain    = toPlain(post.content);
    var hayTitle = matchCase ? post.title : post.title.toLowerCase();
    var hayBody  = matchCase ? plain       : plain.toLowerCase();

    if (!fold.every(function (t) { return hayTitle.includes(t) || hayBody.includes(t); })) return;

    var excerpts = extractExcerpts(plain, terms, matchCase, filterMoreCtx ? 14 : 7);
    var re = makeRe(terms, matchCase);
    var hitCount = re ? ((plain.match(re) || []).length + (post.title.match(re) || []).length) : 0;
    groups.push({ title: decodeEntities(post.title), url: post.url, date: post.date,
                  excerpts: excerpts, count: hitCount });
  });

  /* Sort */
  var sortFns = {
    'name-asc':      function (a, b) { return a.title.localeCompare(b.title); },
    'name-desc':     function (a, b) { return b.title.localeCompare(a.title); },
    'modified-desc': function (a, b) { return new Date(b.date) - new Date(a.date); },
    'modified-asc':  function (a, b) { return new Date(a.date) - new Date(b.date); },
    'created-desc':  function (a, b) { return new Date(b.date) - new Date(a.date); },
    'created-asc':   function (a, b) { return new Date(a.date) - new Date(b.date); }
  };
  if (sortFns[searchSortValue]) groups.sort(sortFns[searchSortValue]);

  /* SearchToolbar */
  var total = groups.reduce(function (s, g) { return s + g.count; }, 0);
  if (resultsCount) resultsCount.textContent = groups.length === 0 ? '0 results' : total + ' result' + (total !== 1 ? 's' : '');
  if (toolbar)      toolbar.hidden = false;
  if (noResults)    noResults.hidden = groups.length > 0;
  if (!searchResults) return;

  /* ResultsList → FileGroups → MatchCards */
  var chevronSvg = '<svg class="file-group-chevron" viewBox="0 0 24 24" width="15" height="15" ' +
    'fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">' +
    '<polyline points="6 9 12 15 18 9"/></svg>';

  searchResults.innerHTML = groups.map(function (g) {
    var cards = g.excerpts.map(function (ex) {
      return '<div class="match-card">' +
        '<a href="' + escHtml(g.url) + '" class="match-card-link">' +
          renderWithHighlight(ex, terms, matchCase) +
        '</a></div>';
    }).join('');
    return '<div class="file-group" data-open="' + (filterCollapse ? 'false' : 'true') + '">' +
      '<div class="file-group-header">' +
        chevronSvg +
        '<a href="' + escHtml(g.url) + '" class="file-group-name">' + renderWithHighlight(g.title, terms, matchCase) + '</a>' +
        '<span class="file-group-count">' + g.count + '</span>' +
      '</div>' +
      '<div class="file-group-body">' + cards + '</div>' +
    '</div>';
  }).join('');

  /* FileGroup collapse toggle */
  $$('.file-group-header', searchResults).forEach(function (header) {
    on(header, 'click', function (e) {
      if (e.target.closest('a')) return;
      var grp = header.closest('.file-group');
      grp.dataset.open = grp.dataset.open !== 'false' ? 'false' : 'true';
    });
  });
}

/* SearchHeader interactions */
on(searchInput, 'input', function () {
  if (clearBtn) clearBtn.hidden = !searchInput.value;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(function () { doSearch(searchInput.value); }, 200);
});

on(clearBtn, 'click', function () {
  if (searchInput)   { searchInput.value = ''; searchInput.focus(); }
  if (clearBtn)      clearBtn.hidden = true;
  if (searchResults) searchResults.innerHTML = '';
  if (resultsCount)  resultsCount.textContent = '';
  if (noResults)     noResults.hidden = false;
  if (searchToolbar) searchToolbar.hidden = true;
});

on(matchCaseBtn, 'click', function () {
  matchCase = !matchCase;
  matchCaseBtn.classList.toggle('active', matchCase);
  matchCaseBtn.setAttribute('aria-pressed', String(matchCase));
  if (searchInput && searchInput.value) doSearch(searchInput.value);
});

on(filterBtn, 'click', function () {
  var open = filterPanel && !filterPanel.hidden;
  if (filterPanel) filterPanel.hidden = open;
  filterBtn.classList.toggle('active', !open);
  filterBtn.setAttribute('aria-pressed', String(!open));
});

on(filterCollapseEl, 'change', function () {
  filterCollapse = filterCollapseEl.checked;
  if (searchInput && searchInput.value) doSearch(searchInput.value);
});

on(filterMoreCtxEl, 'change', function () {
  filterMoreCtx = filterMoreCtxEl.checked;
  if (searchInput && searchInput.value) doSearch(searchInput.value);
});

on(searchSortBtn, 'click', function (e) {
  e.stopPropagation();
  toggleDropdown(searchSortDropdown, searchSortBtn);
});

on(searchSortDropdown, 'click', function (e) {
  var opt = e.target.closest('.dropdown-item');
  if (!opt) return;
  $$('.dropdown-item', searchSortDropdown).forEach(function (o) { o.classList.remove('active'); });
  opt.classList.add('active');
  searchSortValue = opt.dataset.sort;
  var label = $('#search-sort-label');
  if (label) label.textContent = opt.querySelector('span').textContent;
  closeDropdown(searchSortDropdown, searchSortBtn);
  if (searchInput && searchInput.value) doSearch(searchInput.value);
});

/* Ctrl+Shift+F / Cmd+Shift+F — focus search sidebar */
document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
    e.preventDefault();
    openLeft();
    activateSidebarTab('search');
    if (searchInput) setTimeout(function () { searchInput.focus(); searchInput.select(); }, 60);
  }
});
