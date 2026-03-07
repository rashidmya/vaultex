/**
 * Reading Time Helper
 * @description Returns estimated reading time for a post
 * @example
 *     <%- reading_time(post) %>  →  "5 min read"
 */
hexo.extend.helper.register('reading_time', function (post) {
  const content = post.content || '';
  const text = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(' ').length : 0;
  const minutes = Math.max(1, Math.round(words / 220));
  return minutes + ' min read';
});
