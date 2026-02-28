# Vaultex

A dark Hexo theme inspired by the Obsidian.md UI/UX. Features a two-sidebar app shell with a file explorer, table of contents, full-text search, and a self-hosted font stack — all with zero external dependencies at runtime.

---

## Features

- **App shell layout** — tab bar, activity bar, left file explorer sidebar, right outline sidebar
- **File explorer** — collapsible sections (Navigation, Categories, Recent Notes, Links) with category tree
- **Table of contents** — auto-generated from post headings with active heading tracking via IntersectionObserver
- **Full-text search** — instant sidebar search powered by `search.xml` with keyword highlighting and context excerpts
- **Tag cloud & related posts** — displayed in the right sidebar on post pages
- **Vault switcher** — Obsidian-style vault name button with dropdown in the sidebar footer
- **Self-hosted fonts** — Inter (variable) + Source Code Pro, no Google Fonts
- **Syntax highlighting** — configurable highlight.js theme via CSS
- **Two post list layouts** — list view or 2-column card grid
- **Mobile responsive** — collapsible sidebars, overlay drawer on small screens
- **Keyboard shortcut** — `Ctrl+K` / `Cmd+K` opens search
- **Print styles** — clean print layout
- **Accessible** — ARIA roles, focus management, reduced-motion support

---

## Requirements
- Hexo 6+

---

## Installation

1. Clone or download this theme into your Hexo blog's `themes/` directory:

```bash
git clone https://github.com/username/vaultex themes/vaultex
```

2. Set the theme in your root `_config.yml`:

```yaml
theme: vaultex
```

3. Install the required plugins:

```bash
npm install hexo-generator-search hexo-generator-feed hexo-generator-sitemap
```

4. Add the following to your root `_config.yml` to configure the plugins:

```yaml
# hexo-generator-search
search:
  path: search.xml
  field: post
  content: true

# hexo-generator-feed
feed:
  type: atom
  path: atom.xml
  limit: 20

# hexo-generator-sitemap
sitemap:
  path: sitemap.xml
```

---

## Plugins

| Plugin | Required | Purpose |
|---|---|---|
| `hexo-generator-search` | **Yes** | Generates `search.xml` for the sidebar full-text search |
| `hexo-generator-feed` | No | RSS/Atom feed |
| `hexo-generator-sitemap` | No | XML sitemap for SEO |

---

## Configuration

All options live in `themes/vaultex/_config.yml`.

### General

```yaml
# Name displayed in the sidebar vault switcher
vault_name: My Blog

# Accent color (any CSS hex value)
accent_color: '#7f6df2'

# Vault title position:
#   1 = top of left sidebar (header)
#   2 = bottom of left sidebar (Obsidian-style footer)
vault_title_position: 2
```

### Typography

```yaml
font_size: 16           # Base font size in px
code_font_size: 14      # Code block font size in px
max_content_width: 720  # Max width of post content area in px
```

### Syntax Highlighting

```yaml
# Highlight.js theme name — must match a CSS file in source/css/highlight/
highlight: obsidian
```

### Left Sidebar Explorer

```yaml
# Section label style:
#   1 = classic  (NAVIGATION, CATEGORIES, RECENT NOTES, LINKS — uppercase + dividers)
#   2 = modern   (Navigation, Categories, Recent Notes, Links — no dividers)
sidebar_explorer_style: 2

# Prefix section labels with numbers (00, 10, 20, 30) — style 2 only
sidebar_explorer_numbers: true
```

### Right Sidebar

```yaml
sidebar_right:
  toc: true             # Show table of contents on post pages
  toc_depth: 3          # Max heading level to include (1–6)
  show_related: true    # Show related posts panel
  show_tags_panel: true # Show tag cloud panel
```

### Post List

```yaml
posts_per_row: 1   # 1 = single-column list, 2 = two-column card grid
show_date: true    # Show post date
show_tags: true    # Show tag pills
max_tags: 6        # Max tags shown per post in list
show_excerpt: true # Show post excerpt
```

### Navigation

Customize the links shown in the left sidebar navigation section:

```yaml
nav_items:
  - label: Home
    path: /
    icon: home
  - label: Archive
    path: /archives/
    icon: archive
  - label: Categories
    path: /categories/
    icon: folder
  - label: Tags
    path: /tags/
    icon: tags
```

Available icons match filenames in `source/icons/` (without the `.svg` extension).

### Search

```yaml
search_placeholder: Search...
```

### Social Links

Shown in the activity bar (left edge of the screen):

```yaml
social_links:
  - label: GitHub
    url: https://github.com/username
    icon: github
  - label: Twitter
    url: https://twitter.com/username
    icon: twitter
```

---

## Source Pages

Create these pages in your Hexo `source/` directory to enable the search and tags widgets:
**`source/tags.md`**
```markdown
---
title: Tags
layout: _widget/tags
---
```

**`source/categories.md`**
```markdown
---
title: Categories
layout: categories
---
```

---

## Customization

### Accent color

Override the accent color site-wide via the theme config:

```yaml
accent_color: '#e05c5c'
```

Or override per-page with a `<style>` tag in your post front matter, or globally in `source/css/variables.css`.

### Custom icons

Drop any compatible SVG file into `themes/vaultex/source/icons/` and reference it by filename (without `.svg`) anywhere you use the `icon` partial:

```ejs
<%- partial('_partial/icon', { name: 'my-icon', size: 18, sw: 1.5 }) %>
```

---

## License

MIT — see [LICENSE.MD](LICENSE.MD).
