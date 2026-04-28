'use strict';

const crypto = require('crypto');

const ITERATIONS = 210000;

function encryptHtml(html, password) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);

  const key = crypto.pbkdf2Sync(
    String(password),
    salt,
    ITERATIONS,
    32,
    'sha256'
  );

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(String(html), 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return {
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    data: Buffer.concat([encrypted, tag]).toString('base64'),
    iterations: ITERATIONS
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function buildExcerpt(permalink) {
  return `
<p class="hexo-protected-excerpt">
  This post is password protected.
  <a href="${escapeHtml(permalink)}">Open the post to enter the password.</a>
</p>
`;
}

function buildProtectedHtml(payload, id, permalink) {
  return `
<div id="hexo-protected-${id}" class="hexo-protected-post">
  <div class="hexo-protected-excerpt">
    This post is password protected.
    <a href="${escapeHtml(permalink)}">Open the post to enter the password.</a>
  </div>
</div>

<script>
(() => {
  const root = document.getElementById(${JSON.stringify(`hexo-protected-${id}`)});
  if (!root) return;

  const payload = ${JSON.stringify(payload)};
  const postPermalink = ${JSON.stringify(permalink)};

  function normalizePath(url) {
    try {
      const path = new URL(url, window.location.origin).pathname;
      return path.replace(/\\/+$/, '') || '/';
    } catch {
      return '/';
    }
  }

  const currentPath = normalizePath(window.location.href);
  const postPath = normalizePath(postPermalink);

  // Do not show the password form on homepage, archive, category, tag pages, etc.
  if (currentPath !== postPath) {
    return;
  }

  root.innerHTML = \`
    <style>
      .hexo-protected-box {
        max-width: 520px;
        margin: 2rem auto;
        padding: 1.5rem;
        border: 1px solid #ddd;
        border-radius: 12px;
        text-align: center;
      }

      .hexo-protected-box input {
        width: 100%;
        max-width: 320px;
        padding: 0.75rem;
        margin: 0.75rem 0;
        border: 1px solid #ccc;
        border-radius: 8px;
      }

      .hexo-protected-box button {
        padding: 0.7rem 1.1rem;
        border: 0;
        border-radius: 8px;
        cursor: pointer;
      }

      .hexo-protected-error {
        color: #c00;
        margin-top: 0.75rem;
      }
    </style>

    <div class="hexo-protected-box">
      <h2>Protected Post</h2>
      <p>This post requires a password.</p>

      <form>
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          autocomplete="current-password"
          required
        />
        <br />
        <button type="submit">Unlock</button>
      </form>

      <div class="hexo-protected-error" hidden></div>
    </div>
  \`;

  const form = root.querySelector('form');
  const error = root.querySelector('.hexo-protected-error');

  function base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  }

  async function deriveKey(password, salt, iterations) {
    const encoder = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['decrypt']
    );
  }

  async function decryptPost(password) {
    const salt = base64ToBytes(payload.salt);
    const iv = base64ToBytes(payload.iv);
    const encryptedData = base64ToBytes(payload.data);

    const key = await deriveKey(password, salt, payload.iterations);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encryptedData
    );

    return new TextDecoder().decode(decrypted);
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const password = form.password.value;

    error.hidden = true;
    error.textContent = '';

    try {
      const html = await decryptPost(password);
      root.outerHTML = html;
    } catch {
      error.textContent = 'Incorrect password.';
      error.hidden = false;
    }
  });
})();
</script>
`;
}

hexo.extend.filter.register('after_post_render', function protectPost(data) {
  if (!data.password) return data;

  const permalink = data.permalink || data.path || '#';

  const encrypted = encryptHtml(data.content, data.password);

  const idSource = data.path || data.permalink || data.slug || data.title || Date.now();
  const id = crypto
    .createHash('sha1')
    .update(String(idSource))
    .digest('hex')
    .slice(0, 12);

  data.content = buildProtectedHtml(encrypted, id, permalink);

  // Important:
  // Never put the password form into excerpt/more,
  // otherwise it appears on home/index/archive pages.
  data.excerpt = buildExcerpt(permalink);
  data.more = '';

  delete data.password;

  return data;
});