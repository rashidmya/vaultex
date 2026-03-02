'use strict';

const fs = require('node:fs');
const path = require('node:path');

const LOCAL_REF_RE = /(?:!\[[^\]]*]\(([^)]+)\))|(?:<img[^>]+src=["']([^"']+)["'])/gi;
const SKIP_PREFIX_RE = /^(?:[a-z][a-z0-9+.-]*:|\/|#|data:|\/\/)/i;

function normalizeRef(ref) {
  if (!ref) return '';
  const q = ref.indexOf('?');
  const h = ref.indexOf('#');
  let end = ref.length;
  if (q !== -1 && q < end) end = q;
  if (h !== -1 && h < end) end = h;
  const clean = ref.slice(0, end).trim().replace(/\\/g, '/');
  if (!clean || SKIP_PREFIX_RE.test(clean) || clean.includes('..')) return '';
  return clean.replace(/^\.\/+/, '');
}

function collectLocalRefs(raw) {
  if (!raw || raw.indexOf('.') === -1) return [];
  const out = [];
  const seen = new Set();
  LOCAL_REF_RE.lastIndex = 0;

  let match = null;
  while ((match = LOCAL_REF_RE.exec(raw))) {
    const ref = normalizeRef(match[1] || match[2]);
    if (!ref || seen.has(ref)) continue;
    seen.add(ref);
    out.push(ref);
  }
  return out;
}

hexo.extend.generator.register('index-co-located-assets', function (locals) {
  const routes = [];
  const sourceRoot = hexo.source_dir;
  const dirHasAssets = new Map();
  const fileExists = new Map();
  const routeSeen = new Set();

  locals.posts.forEach((post) => {
    const refs = collectLocalRefs(post.raw);
    if (!refs.length) return;

    const postSourceAbs = path.join(sourceRoot, post.source);
    const postDir = path.dirname(postSourceAbs);
    const postAssetsDir = path.join(postDir, path.basename(postSourceAbs, path.extname(postSourceAbs)));
    const sharedAssetsDir = path.join(postDir, 'assets');

    const postPath = post.path.startsWith('/') ? post.path.slice(1) : post.path;
    const postBase = postPath.endsWith('/') ? postPath : `${postPath}/`;

    for (let i = 0; i < refs.length; i++) {
      const ref = refs[i];
      const routePath = `${postBase}${ref}`;
      if (routeSeen.has(routePath)) continue;

      // Keep native post-asset behavior untouched when the file already exists there.
      const nativeAbs = path.join(postAssetsDir, ref);
      let exists = fileExists.get(nativeAbs);
      if (exists === undefined) {
        exists = fs.existsSync(nativeAbs);
        fileExists.set(nativeAbs, exists);
      }
      if (exists) continue;

      let hasShared = dirHasAssets.get(sharedAssetsDir);
      if (hasShared === undefined) {
        hasShared = fs.existsSync(sharedAssetsDir);
        dirHasAssets.set(sharedAssetsDir, hasShared);
      }
      if (!hasShared) continue;

      const sharedAbs = path.join(sharedAssetsDir, ref);
      exists = fileExists.get(sharedAbs);
      if (exists === undefined) {
        exists = fs.existsSync(sharedAbs);
        fileExists.set(sharedAbs, exists);
      }
      if (!exists) continue;

      routeSeen.add(routePath);
      routes.push({
        path: routePath,
        data: () => fs.createReadStream(sharedAbs)
      });
    }
  });

  return routes;
});
