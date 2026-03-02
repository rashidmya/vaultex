'use strict';

/**
 * icons.js — Hexo helper: theme_icon(name, opts)
 *
 * Loads SVG inner content from themes/vaultex/source/icons/<name>.svg.
 * Falls back to an inline path registry for icons without files.
 * Results are cached in memory for the lifetime of the build.
 */

const fs   = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../source/icons');

/* Icon key → svg filename (only for names that differ from the filename) */
const FILE_MAP = {
  'home':        'house',
  'chevron':     'chevron-down',
  'close':       'x',
  'circle-help': 'circle-question-mark',
  'refresh':     'refresh-cw',
};

const cache = {};

function getInner(name) {
  if (cache[name] !== undefined) return cache[name];

  const fileName = FILE_MAP[name] || name;
  try {
    const raw   = fs.readFileSync(path.join(ICONS_DIR, fileName + '.svg'), 'utf8');
    const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>[\s\S]*$/, '').trim();
    cache[name] = inner;
  } catch (_) {
    cache[name] = '';
  }

  return cache[name];
}

hexo.extend.helper.register('theme_icon', function (name, opts) {
  opts = opts || {};
  const size  = opts.size != null ? opts.size : 16;
  const cls   = opts.cls  || '';
  const sw    = opts.sw   != null ? opts.sw   : 2;
  const inner = getInner(name);
  const clsAttr = cls ? ` class="${cls}"` : '';
  return `<svg${clsAttr} viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
});
