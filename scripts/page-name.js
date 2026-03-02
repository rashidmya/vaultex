'use strict';

const path = require('path');

// Exposes page.name as the post filename (without extension),
// matching Hexo's :name permalink variable.
hexo.extend.filter.register('before_post_render', (data) => {
  data.name = path.basename(data.source, path.extname(data.source));
  return data;
});
