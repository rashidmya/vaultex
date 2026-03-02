'use strict';

// Normalize one URL segment: lowercase, remove unsafe chars, collapse separators into "-".
const slugifySegment = (value) => {
  const s = String(value).trim().toLowerCase();
  if (!s) return '';

  const out = [];
  let dash = false;

  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    // Handle encoded space "%20" without decoding the whole string.
    if (c === 37 && s.charCodeAt(i + 1) === 50 && s.charCodeAt(i + 2) === 48) {
      if (out.length && !dash) out.push('-');
      dash = true;
      i += 2;
      continue;
    }
    if ((c >= 97 && c <= 122) || (c >= 48 && c <= 57)) {
      out.push(s[i]);
      dash = false;
      continue;
    }
    // Treat whitespace, "_" and "-" as a single dash separator.
    if ((c === 32 || c === 9 || c === 10 || c === 13 || c === 95 || c === 45) && out.length && !dash) {
      out.push('-');
      dash = true;
    }
  }

  if (dash) out.pop();
  return out.join('');
};

// Sanitize each path segment independently to preserve "/" boundaries.
const sanitizePath = (pathLike) => {
  const parts = String(pathLike).split('/');
  let n = 0;
  const out = new Array(parts.length);
  for (let i = 0; i < parts.length; i++) {
    const seg = slugifySegment(parts[i]);
    if (seg) out[n++] = seg;
  }
  return out.slice(0, n).join('/');
};

// Keep leading/trailing slash shape while cleaning the inner path.
const sanitizePermalink = (value) => {
  const p = String(value);
  const out = sanitizePath(p);
  return out ? `${p[0] === '/' ? '/' : ''}${out}${p[p.length - 1] === '/' ? '/' : ''}` : p;
};

// Ensure generated slug is clean before Hexo builds the final permalink.
hexo.extend.filter.register('before_post_render', (data) => {
  if (data.slug) data.slug = sanitizePath(data.slug);
  else if (data.title) data.slug = slugifySegment(data.title);
  return data;
});

// Final permalink pass to prevent spaces/caps from leaking into URLs.
hexo.extend.filter.register('post_permalink', (permalink) => sanitizePermalink(permalink));
