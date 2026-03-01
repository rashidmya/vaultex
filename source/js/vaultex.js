/**
 * vaultex.js
 * Vaultex Hexo Theme – client-side interactions
 * Sidebar toggles | TOC generation | Search | Mobile drawers
 */
(function () {
  'use strict';

  /* -----------------------------------------------------------------------
     Helpers
  ----------------------------------------------------------------------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
  function on(el, ev, fn) { if (el) el.addEventListener(ev, fn); }

  /* Storage helpers (graceful degradation) */
  function store(key, val) {
    try { localStorage.setItem('obs-' + key, val); } catch (_) {}
  }
  function recall(key) {
    try { return localStorage.getItem('obs-' + key); } catch (_) { return null; }
  }

  /* -----------------------------------------------------------------------
     1. LEFT SIDEBAR TOGGLE
  ----------------------------------------------------------------------- */
  var sidebarLeft = $('#sidebar-left');
  var toggleLeftBtn = $('#toggle-left');
  var activityExplorerBtn = $('#activity-quick-switcher');
  var tabBarSpacer = $('#tab-bar-left-spacer');
  var activityBar = $('#activity-bar');
  var overlay = $('#sidebar-overlay');
  var isMobile = function () { return window.innerWidth <= 768; };

  function openLeft() {
    if (!sidebarLeft) return;
    sidebarLeft.classList.remove('collapsed');
    if (toggleLeftBtn) toggleLeftBtn.classList.add('active');
    if (tabBarSpacer) tabBarSpacer.classList.remove('spacer-collapsed');
    if (activityBar) activityBar.classList.remove('sidebar-collapsed');
    if (isMobile()) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    store('left-open', '1');
  }

  function closeLeft() {
    if (!sidebarLeft) return;
    sidebarLeft.classList.add('collapsed');
    if (toggleLeftBtn) toggleLeftBtn.classList.remove('active');
    if (tabBarSpacer) tabBarSpacer.classList.add('spacer-collapsed');
    if (activityBar) setTimeout(function () { activityBar.classList.add('sidebar-collapsed'); }, 250);
    if (isMobile()) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
    store('left-open', '0');
  }

  function toggleLeft() {
    if (!sidebarLeft) return;
    if (sidebarLeft.classList.contains('collapsed')) { openLeft(); }
    else { closeLeft(); }
  }

  on(toggleLeftBtn, 'click', toggleLeft);
  on($('#sidebar-left-close'), 'click', closeLeft);
  on(overlay, 'click', function () { closeLeft(); closeRight(); });

  /* Restore sidebar state (desktop only) */
  if (!isMobile()) {
    var leftState = recall('left-open');
    if (leftState === '0') {
      sidebarLeft && sidebarLeft.classList.add('collapsed');
      tabBarSpacer && tabBarSpacer.classList.add('spacer-collapsed');
      activityBar && activityBar.classList.add('sidebar-collapsed');
    }
  } else {
    /* Always collapsed on mobile by default */
    sidebarLeft && sidebarLeft.classList.add('collapsed');
    tabBarSpacer && tabBarSpacer.classList.add('spacer-collapsed');
    activityBar && activityBar.classList.add('sidebar-collapsed');
  }

  /* -----------------------------------------------------------------------
     1.5. VAULT SWITCHER DROPDOWN
  ----------------------------------------------------------------------- */
  var vaultSwitcher = $('#vault-switcher');
  var vaultDropdown = $('#vault-dropdown');

  on(vaultSwitcher, 'click', function (e) {
    e.stopPropagation();
    var opening = vaultDropdown.hidden;
    vaultDropdown.hidden = !opening;
    vaultSwitcher.setAttribute('aria-expanded', String(opening));
  });

  document.addEventListener('click', function () {
    if (vaultDropdown && !vaultDropdown.hidden) {
      vaultDropdown.hidden = true;
      if (vaultSwitcher) vaultSwitcher.setAttribute('aria-expanded', 'false');
    }
  });

  /* -----------------------------------------------------------------------
     1.5. SIDEBAR VIEW BUTTONS + TAB SWITCHING
  ----------------------------------------------------------------------- */
  var sidebarViewBtns = $$('.sidebar-view-btn');
  var sidebarTabContents = $$('.sidebar-tab-content');

  function activateSidebarTab(tabName) {
    sidebarViewBtns.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    sidebarTabContents.forEach(function (panel) {
      panel.classList.toggle('sidebar-tab-hidden', panel.dataset.tab !== tabName);
    });
    store('left-tab', tabName);
  }

  sidebarViewBtns.forEach(function (btn) {
    on(btn, 'click', function () {
      var tabName = btn.dataset.tab;
      var isCollapsed = sidebarLeft && sidebarLeft.classList.contains('collapsed');
      var currentTab = recall('left-tab') || 'folder';

      if (isCollapsed) {
        openLeft();
        activateSidebarTab(tabName);
      } else if (currentTab === tabName) {
        /* Re-clicking the active tab closes the sidebar */
        closeLeft();
        return;
      } else {
        activateSidebarTab(tabName);
      }

      if (tabName === 'search') {
        var si = $('#search-input');
        if (si) { setTimeout(function () { si.focus(); }, 50); }
      }
    });
  });

  /* Restore last active tab */
  var lastLeftTab = recall('left-tab');
  if (lastLeftTab) { activateSidebarTab(lastLeftTab); }

  /* -----------------------------------------------------------------------
     2. RIGHT SIDEBAR TOGGLE
  ----------------------------------------------------------------------- */
  var sidebarRight = $('#sidebar-right');
  var toggleRightBtn = $('#toggle-right');

  function openRight() {
    if (!sidebarRight) return;
    sidebarRight.classList.remove('collapsed');
    sidebarRight.classList.remove('mobile-open'); // reset
    if (isMobile()) {
      sidebarRight.classList.add('mobile-open');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    if (toggleRightBtn) toggleRightBtn.classList.add('active');
    store('right-open', '1');
  }

  function closeRight() {
    if (!sidebarRight) return;
    sidebarRight.classList.add('collapsed');
    sidebarRight.classList.remove('mobile-open');
    if (isMobile()) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
    if (toggleRightBtn) toggleRightBtn.classList.remove('active');
    store('right-open', '0');
  }

  function toggleRight() {
    if (!sidebarRight) return;
    if (sidebarRight.classList.contains('collapsed') || sidebarRight.classList.contains('mobile-open') === false && isMobile()) {
      openRight();
    } else {
      closeRight();
    }
  }

  on(toggleRightBtn, 'click', toggleRight);

  /* Restore right sidebar state */
  if (sidebarRight) {
    var rightState = recall('right-open');
    if (rightState === '0') {
      sidebarRight.classList.add('collapsed');
    }
    if (isMobile()) {
      sidebarRight.classList.add('collapsed');
    }
  }

  /* -----------------------------------------------------------------------
     3. CATEGORY TREE TOGGLE
  ----------------------------------------------------------------------- */
  var navCategories = $('#nav-categories');

  function updateCatVisibility() {
    if (!navCategories) return;
    $$('[data-depth]', navCategories).forEach(function (item) {
      var visible = true;
      var pid = item.dataset.parentTreeId;
      // Walk up the parent chain; if any ancestor is collapsed, hide
      while (pid) {
        var parentEl = navCategories.querySelector('[data-tree-id="' + pid + '"]');
        if (!parentEl) break;
        if (parentEl.dataset.treeOpen === 'false') { visible = false; break; }
        pid = parentEl.dataset.parentTreeId;
      }
      item.style.display = visible ? '' : 'none';
    });
  }

  $$('.nav-tree-parent').forEach(function (parent) {
    on(parent, 'click', function () {
      var isOpen = parent.dataset.treeOpen === 'true';
      parent.dataset.treeOpen = isOpen ? 'false' : 'true';
      updateCatVisibility();
      try { localStorage.setItem('obs-' + parent.dataset.treeId, isOpen ? '0' : '1'); } catch (_) {}
    });
    // Restore persisted state
    try {
      var saved = localStorage.getItem('obs-' + parent.dataset.treeId);
      if (saved === '0') { parent.dataset.treeOpen = 'false'; }
    } catch (_) {}
  });
  updateCatVisibility();

  /* -----------------------------------------------------------------------
     4. EXPLORER SECTION COLLAPSE (sidebar-left section headers)
  ----------------------------------------------------------------------- */
  $$('.explorer-section-header').forEach(function (header) {
    var sectionId = header.dataset.section;
    var tree = $('#nav-' + sectionId);
    var key = 'section-' + sectionId;

    /* Restore collapsed state */
    if (recall(key) === '0' && tree) {
      header.classList.add('collapsed');
      tree.classList.add('section-hidden');
    }

    on(header, 'click', function () {
      var isCollapsed = header.classList.toggle('collapsed');
      if (tree) tree.classList.toggle('section-hidden', isCollapsed);
      store(key, isCollapsed ? '0' : '1');
      if (!isCollapsed) {
        var btn = $('#explorer-collapse-all');
        if (btn) {
          btn.classList.remove('is-expanded');
          btn.title = 'Collapse all';
          btn.setAttribute('aria-label', 'Collapse all');
        }
      }
    });
  });

  /* -----------------------------------------------------------------------
     4.5. EXPLORER ACTION BAR
  ----------------------------------------------------------------------- */
  on($('#explorer-collapse-all'), 'click', function () {
    var btn = this;
    var expanding = btn.classList.contains('is-expanded');
    $$('.explorer-section-header').forEach(function (header) {
      var sectionId = header.dataset.section;
      var tree = $('#nav-' + sectionId);
      if (expanding) {
        header.classList.remove('collapsed');
        if (tree) tree.classList.remove('section-hidden');
        store('section-' + sectionId, '1');
      } else {
        header.classList.add('collapsed');
        if (tree) tree.classList.add('section-hidden');
        store('section-' + sectionId, '0');
      }
    });
    $$('.nav-tree-parent').forEach(function (parent) {
      parent.dataset.treeOpen = expanding ? 'true' : 'false';
      try { localStorage.setItem('obs-' + parent.dataset.treeId, expanding ? '1' : '0'); } catch (_) {}
    });
    updateCatVisibility();
    btn.classList.toggle('is-expanded', !expanding);
    var label = expanding ? 'Collapse all' : 'Expand all';
    btn.title = label;
    btn.setAttribute('aria-label', label);
  });

  on($('#explorer-auto-reveal'), 'click', function () {
    var active = $('.nav-item.active');
    if (!active) return;

    // 1. Expand the section that contains the active item
    var section = active.closest('.explorer-section');
    if (section) {
      var header = section.querySelector('.explorer-section-header');
      var sectionId = header && header.dataset.section;
      var tree = sectionId && $('#nav-' + sectionId);
      if (header && header.classList.contains('collapsed')) {
        header.classList.remove('collapsed');
        if (tree) tree.classList.remove('section-hidden');
        store('section-' + sectionId, '1');
      }
    }

    // 2. Expand all ancestor tree-parent nodes
    var pid = active.dataset.parentTreeId;
    while (pid) {
      var parentEl = navCategories && navCategories.querySelector('[data-tree-id="' + pid + '"]');
      if (!parentEl) break;
      if (parentEl.dataset.treeOpen === 'false') {
        parentEl.dataset.treeOpen = 'true';
        try { localStorage.setItem('obs-' + pid, '1'); } catch (_) {}
      }
      pid = parentEl.dataset.parentTreeId;
    }
    updateCatVisibility();

    // 3. Sync collapse-all button state
    var collapseBtn = $('#explorer-collapse-all');
    if (collapseBtn) {
      collapseBtn.classList.remove('is-expanded');
      collapseBtn.title = 'Collapse all';
      collapseBtn.setAttribute('aria-label', 'Collapse all');
    }
  });

  on($('#explorer-close'), 'click', closeLeft);

  /* -----------------------------------------------------------------------
     4.6. HELP MODAL
  ----------------------------------------------------------------------- */
  var helpModal    = $('#help-modal');
  var vaultHelpBtn = $('#vault-help-btn');

  function openHelpModal() {
    if (!helpModal) return;
    helpModal.hidden = false;
    var closeBtn = $('#hm-close');
    if (closeBtn) closeBtn.focus();
  }

  function closeHelpModal() {
    if (!helpModal) return;
    helpModal.hidden = true;
    if (vaultHelpBtn) vaultHelpBtn.focus();
  }

  on(vaultHelpBtn, 'click', openHelpModal);
  on($('#hm-close'),    'click', closeHelpModal);
  on($('#hm-minimize'), 'click', closeHelpModal);
  on(helpModal, 'click', function (e) {
    if (e.target === helpModal) closeHelpModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && helpModal && !helpModal.hidden) closeHelpModal();
  });

  /* -----------------------------------------------------------------------
     4.7. QUICK SWITCHER
  ----------------------------------------------------------------------- */
  var qsBackdrop  = $('#quick-switcher');
  var qsInput     = $('#qs-input');
  var qsResultsEl = $('#qs-results');
  var qsClearBtn  = $('#qs-clear');
  var qsActiveIdx = -1;

  function qsFormatPath(fullPath, query) {
    var parts = fullPath.split('/');
    var last   = parts[parts.length - 1];
    var prefix = parts.length > 1 ? parts.slice(0, -1).join('/') + '/' : '';
    var pl = prefix.length;

    if (!query) {
      return escHtml(fullPath);
    }

    var lo = fullPath.toLowerCase();
    var qi = lo.indexOf(query.toLowerCase());
    if (qi === -1) return escHtml(fullPath);
    var qe = qi + query.length;

    return escHtml(fullPath.slice(0, qi)) +
      '<strong>' + escHtml(fullPath.slice(qi, qe)) + '</strong>' +
      escHtml(fullPath.slice(qe));
  }

  function qsRender(query) {
    if (!searchData) { qsResultsEl.innerHTML = ''; return; }
    var q = query.trim();
    var results = q
      ? searchData.filter(function (p) {
          var full = p.url.replace(/^\/|\/$/g, '');
          return full.toLowerCase().indexOf(q.toLowerCase()) !== -1;
        })
      : searchData.slice();
    results = results.slice(0, 20);
    qsActiveIdx = results.length ? 0 : -1;
    qsResultsEl.innerHTML = results.map(function (p, i) {
      var full = p.url.replace(/^\/|\/$/g, '');
      return '<li class="qs-item' + (i === 0 ? ' qs-selected' : '') + '"' +
        ' role="option" data-url="' + escHtml(p.url) + '" data-idx="' + i + '">' +
        qsFormatPath(full, q) + '</li>';
    }).join('');
  }

  function qsOpen() {
    if (!qsBackdrop) return;
    qsBackdrop.classList.add('qs-open');
    qsInput.value = '';
    qsRender('');
    qsInput.focus();
  }

  function qsClose() {
    if (!qsBackdrop) return;
    qsBackdrop.classList.remove('qs-open');
    qsActiveIdx = -1;
  }

  function qsMove(dir) {
    var items = $$('.qs-item', qsResultsEl);
    if (!items.length) return;
    if (qsActiveIdx >= 0) items[qsActiveIdx].classList.remove('qs-selected');
    qsActiveIdx = (qsActiveIdx + dir + items.length) % items.length;
    items[qsActiveIdx].classList.add('qs-selected');
    items[qsActiveIdx].scrollIntoView({ block: 'nearest' });
  }

  function qsNavigateTo(newTab) {
    var items = $$('.qs-item', qsResultsEl);
    var item = qsActiveIdx >= 0 ? items[qsActiveIdx] : null;
    if (!item) return;
    var url = item.dataset.url;
    if (newTab) { window.open(url, '_blank', 'noopener'); } else { window.location.href = url; }
    qsClose();
  }

  on($('#activity-quick-switcher'), 'click', qsOpen);

  on(qsInput, 'input', function () { qsRender(this.value); });

  on(qsClearBtn, 'click', qsClose);

  on(qsInput, 'keydown', function (e) {
    if      (e.key === 'ArrowDown')  { e.preventDefault(); qsMove(1); }
    else if (e.key === 'ArrowUp')    { e.preventDefault(); qsMove(-1); }
    else if (e.key === 'Enter')      { e.preventDefault(); qsNavigateTo(e.ctrlKey); }
    else if (e.key === 'Escape')     { qsClose(); }
  });

  on(qsResultsEl, 'mousemove', function (e) {
    var item = e.target.closest('.qs-item');
    if (!item) return;
    var idx = parseInt(item.dataset.idx, 10);
    if (idx === qsActiveIdx) return;
    $$('.qs-item', qsResultsEl).forEach(function (el) { el.classList.remove('qs-selected'); });
    item.classList.add('qs-selected');
    qsActiveIdx = idx;
  });

  on(qsResultsEl, 'click', function (e) {
    var item = e.target.closest('.qs-item');
    if (!item) return;
    window.location.href = item.dataset.url;
    qsClose();
  });

  on(qsBackdrop, 'click', function (e) {
    if (e.target === qsBackdrop) qsClose();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && qsBackdrop && qsBackdrop.classList.contains('qs-open')) qsClose();
  });

  /* -----------------------------------------------------------------------
     5. TOC GENERATION
     Reads headings from #markdown-body, populates #toc-nav
  ----------------------------------------------------------------------- */
  var markdownBody = $('#markdown-body');
  var tocNav = $('#toc-nav');

  var tocEnabled = !window.VAULTEX_CONFIG || window.VAULTEX_CONFIG.toc !== false;
  if (markdownBody && tocNav && tocEnabled) {
    var tocDepth = (window.VAULTEX_CONFIG && window.VAULTEX_CONFIG.tocDepth) || 3;
    var tocMaxLevel = Math.min(tocDepth, 6);
    var tocSelectors = [];
    for (var tl = 1; tl <= tocMaxLevel; tl++) tocSelectors.push('h' + tl);
    var headings = $$(tocSelectors.join(', '), markdownBody);

    if (headings.length === 0) {
      /* Leave the empty placeholder */
    } else {
      tocNav.innerHTML = ''; /* clear empty placeholder */

      headings.forEach(function (h, idx) {
        /* Ensure each heading has an id */
        if (!h.id) {
          h.id = 'heading-' + idx + '-' + h.textContent.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 50);
        }

        var level = parseInt(h.tagName[1], 10);
        var link = document.createElement('a');
        link.href = '#' + h.id;
        link.className = 'toc-item';
        link.dataset.level = level;
        link.textContent = h.textContent;

        link.addEventListener('click', function (e) {
          e.preventDefault();
          h.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        tocNav.appendChild(link);
      });

      /* Active heading tracking via IntersectionObserver */
      var tocLinks = $$('.toc-item', tocNav);

      if ('IntersectionObserver' in window) {
        var headingMap = new WeakMap();
        headings.forEach(function (h, i) {
          headingMap.set(h, tocLinks[i]);
        });

        var activeLink = null;

        var observer = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            var link = headingMap.get(entry.target);
            if (!link) return;
            if (entry.isIntersecting) {
              if (activeLink) activeLink.classList.remove('active');
              activeLink = link;
              link.classList.add('active');
              /* Scroll toc to keep active item visible */
              link.scrollIntoView({ block: 'nearest' });
            }
          });
        }, {
          rootMargin: '-10% 0px -80% 0px',
          threshold: 0
        });

        headings.forEach(function (h) { observer.observe(h); });
      }
    }
  }

  /* -----------------------------------------------------------------------
     5. SEARCH  (SearchHeader · SearchToolbar · ResultsList · FileGroup · MatchCard)
  ----------------------------------------------------------------------- */
  var searchInput   = $('#search-input');
  var searchResults = $('#search-results');
  var noResults     = $('#search-no-results');
  var resultsCount  = $('#search-results-count');
  var searchToolbar = $('#search-toolbar');
  var matchCaseBtn  = $('#search-match-case');
  var clearBtn      = $('#search-clear');
  var sortSelect    = $('#search-sort');
  var searchData    = null;
  var searchTimeout = null;
  var matchCase     = false;

  /* --- Load search.xml once --- */
  fetch('/search.xml')
    .then(function (r) { if (!r.ok) throw 0; return r.text(); })
    .then(function (xml) {
      var doc = new DOMParser().parseFromString(xml, 'text/xml');
      searchData = Array.from(doc.querySelectorAll('entry')).map(function (e) {
        function txt(tag) { return (e.querySelector(tag) || {}).textContent || ''; }
        return { title: txt('title'), url: txt('url'), content: txt('content'), date: txt('published') };
      });
    })
    .catch(function () {});

  /* --- Utilities --- */
  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* Decode HTML entities that survive XML parsing (e.g. &quot; &amp; &#39;) */
  function decodeEntities(s) {
    return s
      .replace(/&amp;/g,  '&').replace(/&lt;/g,  '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g,  "'").replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, function (_, n) { return String.fromCharCode(+n); });
  }

  /* Strip all HTML tags then decode entities → plain readable text */
  function toPlain(html) {
    return decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
  }

  /* Build a combined regex for all terms */
  function makeRe(terms, cs) {
    var parts = terms.filter(Boolean).map(escRe);
    return parts.length ? new RegExp('(' + parts.join('|') + ')', cs ? 'g' : 'gi') : null;
  }

  /*
   * renderWithHighlight — split text at match boundaries so each part is
   * escaped independently, then wrap hits in <em>. This avoids the
   * "highlight inside HTML entity" bug from the escHtml-first approach.
   */
  function renderWithHighlight(text, terms, cs) {
    var re = makeRe(terms, cs);
    if (!re) return escHtml(text);
    var out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(text)) !== null) {
      out += escHtml(text.slice(last, m.index));
      out += '<em class="search-highlight">' + escHtml(m[0]) + '</em>';
      last = m.index + m[0].length;
    }
    return out + escHtml(text.slice(last));
  }

  /*
   * extractExcerpts — context-window approach.
   * Find all match positions in plain text, merge nearby windows,
   * return at most maxN trimmed excerpts with leading/trailing ellipsis.
   */
  function extractExcerpts(plain, terms, cs, maxN) {
    var CTX = 130;
    var re  = makeRe(terms, cs);
    if (!re) return [plain.slice(0, 260)];

    /* collect positions */
    var hits = [], m;
    re.lastIndex = 0;
    while ((m = re.exec(plain)) !== null) {
      hits.push(m.index);
      if (hits.length > 300) break; /* safety cap */
    }
    if (!hits.length) return [plain.slice(0, 260)];

    /* merge nearby positions into windows */
    var windows = [];
    var wS = Math.max(0, hits[0] - CTX);
    var wE = Math.min(plain.length, hits[0] + CTX);
    for (var i = 1; i < hits.length; i++) {
      var nS = Math.max(0, hits[i] - CTX);
      if (nS <= wE + 30) {
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

  /* --- Main search function --- */
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

      var excerpts = extractExcerpts(plain, terms, matchCase, 7);
      groups.push({ title: decodeEntities(post.title), url: post.url, date: post.date,
                    excerpts: excerpts, count: excerpts.length });
    });

    /* Sort */
    var sv = sortSelect ? sortSelect.value : 'name-asc';
    var sortFns = {
      'name-asc':      function (a, b) { return a.title.localeCompare(b.title); },
      'name-desc':     function (a, b) { return b.title.localeCompare(a.title); },
      'modified-desc': function (a, b) { return new Date(b.date) - new Date(a.date); },
      'modified-asc':  function (a, b) { return new Date(a.date) - new Date(b.date); },
      'created-desc':  function (a, b) { return new Date(b.date) - new Date(a.date); },
      'created-asc':   function (a, b) { return new Date(a.date) - new Date(b.date); }
    };
    if (sortFns[sv]) groups.sort(sortFns[sv]);

    /* SearchToolbar */
    var total = groups.reduce(function (s, g) { return s + g.count; }, 0);
    if (resultsCount) resultsCount.textContent = groups.length === 0 ? '0 results' : total + ' result' + (total !== 1 ? 's' : '');
    if (toolbar)      toolbar.hidden = false;
    if (noResults)    noResults.hidden = groups.length > 0;
    if (!searchResults) return;

    /* ResultsList → FileGroups → MatchCards */
    searchResults.innerHTML = groups.map(function (g) {
      var cards = g.excerpts.map(function (ex) {
        return '<div class="match-card">' +
          '<a href="' + escHtml(g.url) + '" class="match-card-link">' +
            renderWithHighlight(ex, terms, matchCase) +
          '</a></div>';
      }).join('');

      var chevronSvg = '<svg class="file-group-chevron" viewBox="0 0 24 24" width="10" height="10" ' +
        'fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">' +
        '<polyline points="6 9 12 15 18 9"/></svg>';

      return '<div class="file-group" data-open="true">' +
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

  /* --- SearchHeader interactions --- */
  on(searchInput, 'input', function () {
    if (clearBtn) clearBtn.hidden = !searchInput.value;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () { doSearch(searchInput.value); }, 200);
  });

  on(clearBtn, 'click', function () {
    if (searchInput) { searchInput.value = ''; searchInput.focus(); }
    if (clearBtn)    clearBtn.hidden = true;
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

  on(sortSelect, 'change', function () {
    if (searchInput && searchInput.value) doSearch(searchInput.value);
  });

  /* Ctrl+K / Cmd+K */
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openLeft();
      activateSidebarTab('search');
      if (searchInput) { setTimeout(function () { searchInput.focus(); searchInput.select(); }, 60); }
    }
  });

  /* -----------------------------------------------------------------------
     6. RESPONSIVE: Handle window resize
  ----------------------------------------------------------------------- */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!isMobile()) {
        /* On desktop: restore stored state */
        if (recall('left-open') !== '0') {
          sidebarLeft && sidebarLeft.classList.remove('collapsed');
          toggleLeftBtn && toggleLeftBtn.classList.add('active');
        }
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      } else {
        /* On mobile: always collapse sidebars */
        closeLeft();
        closeRight();
      }
    }, 150);
  });

  /* -----------------------------------------------------------------------
     7. SMOOTH SCROLL for anchor links within the post
  ----------------------------------------------------------------------- */
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
  }

  /* -----------------------------------------------------------------------
     8. EXTERNAL LINK: open in new tab (safety net if Hexo setting is off)
  ----------------------------------------------------------------------- */
  if (markdownBody) {
    $$('a', markdownBody).forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href.startsWith('http://') || href.startsWith('https://')) {
        if (a.hostname !== window.location.hostname) {
          a.setAttribute('rel', 'noopener noreferrer');
          /* target="_blank" already set by Hexo config */
        }
      }
    });
  }

  /* -----------------------------------------------------------------------
     CUSTOM TOOLTIP
  ----------------------------------------------------------------------- */
  var tip = document.createElement('div');
  tip.className = 'vault-tooltip';
  document.body.appendChild(tip);

  var tipTarget  = null;
  var tipSaved   = '';
  var tipTimer   = null;

  function tipShow(el) {
    tipSaved = el.getAttribute('title') || '';
    if (!tipSaved) return;
    el.removeAttribute('title');
    tipTarget = el;
    tip.textContent = tipSaved;
    var r = el.getBoundingClientRect();
    var pos = el.dataset.tooltipPos || 'bottom';
    tip.dataset.dir = pos;
    if (pos === 'right') {
      tip.style.left      = Math.round(r.right + 10) + 'px';
      tip.style.top       = Math.round(r.top + r.height / 2) + 'px';
      tip.style.transform = 'translateY(-50%)';
    } else if (pos === 'left') {
      tip.style.left      = Math.round(r.left - 10) + 'px';
      tip.style.top       = Math.round(r.top + r.height / 2) + 'px';
      tip.style.transform = 'translate(-100%, -50%)';
    } else {
      tip.style.left      = Math.round(r.left + r.width / 2) + 'px';
      tip.style.top       = Math.round(r.bottom + 10) + 'px';
      tip.style.transform = 'translateX(-50%)';
    }
    tip.classList.add('is-visible');
  }

  function tipHide() {
    clearTimeout(tipTimer);
    if (tipTarget) { tipTarget.setAttribute('title', tipSaved); tipTarget = null; }
    tip.classList.remove('is-visible');
  }

  on(document.body, 'mouseover', function (e) {
    var el = e.target.closest('[title]');
    if (!el) {
      if (tipTarget && tipTarget.contains(e.target)) return;
      clearTimeout(tipTimer);
      tipHide();
      return;
    }
    if (el === tipTarget) return;
    tipHide();
    tipTimer = setTimeout(function () { tipShow(el); }, 400);
  });

  on(document.body, 'click',   tipHide);
  on(document.body, 'keydown', tipHide);

})();
