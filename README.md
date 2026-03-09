# Vaultex

![index](/source/images/showcase.png)

A dark Hexo theme inspired by the Obsidian.md UI/UX. Features a two-sidebar app shell with a file explorer, table of contents, full-text search, and a self-hosted font stack — all with zero external dependencies at runtime.

---

## Features

- **App shell layout** — tab bar, activity bar, left file explorer sidebar, right outline sidebar
- **File explorer** — collapsible sections (Navigation, Categories, Links) with a nested category tree
- **Explorer actions** — auto-reveal current file, expand/collapse all sections
- **Navigation history** — back/forward buttons with sessionStorage-based history tracking
- **Table of contents** — auto-generated from post headings with active heading tracking via IntersectionObserver
- **Full-text search** — sidebar search powered by `search.xml` with match-case toggle, filter panel, sort options, and keyword-highlighted context excerpts
- **Quick switcher** — `Ctrl+O` / `Cmd+O` popup to jump to any post by URL
- **Tag cloud & related posts** — displayed in the right sidebar on post pages
- **Vault switcher** — Obsidian-style vault name button with dropdown in the sidebar footer
- **Help modal** — theme info and links, opened via the `?` button in the sidebar footer
- **Self-hosted fonts** — Inter (variable) + Source Code Pro, no Google Fonts
- **Syntax highlighting** — configurable highlight.js theme via CSS
- **Two post list layouts** — list view or 2-column card grid
- **Mobile responsive** — collapsible sidebars, overlay drawer on small screens
- **Keyboard shortcuts** — `Ctrl+O` / `Cmd+O` opens the quick switcher; `Ctrl+Shift+F` / `Cmd+Shift+F` focuses sidebar search
- **Vercel Analytics** — optional, enabled via config
- **Print styles** — clean print layout
- **Accessible** — ARIA roles, focus management, reduced-motion support

---

## Requirements
- Hexo 6+

---

## Installation

1. Clone or download this theme into your Hexo blog's `themes/` directory:

```bash
git clone https://github.com/rashidmya/vaultex themes/vaultex
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

### Customize

General appearance and identity settings:

```yaml
customize:
  vault_name: My Blog            # Name shown in the sidebar vault switcher
  homepage_subtitle: Recent Notes # Label in the tab bar and breadcrumb on the homepage
  vault_title_position: 2        # 1 = top of sidebar (header), 2 = bottom (Obsidian-style footer)

  favicon: /images/favicon.ico   # Path to favicon (omit to show no favicon)

  logo:
    enabled: true                # Show logo on the homepage instead of the house icon
    url: /images/logo.png        # Path to logo image
    width: 32                    # Display width in px
    height: 32                   # Display height in px

  font_size: 15                  # Base font size in px
  code_font_size: 14             # Code block font size in px
  max_content_width: 720         # Max width of post content area in px
  highlight: obsidian            # Highlight.js theme (must match a file in source/css/_highlight/)
```

### Left Sidebar

```yaml
left_sidebar:
  show_nav_icons: true        # Show icons in the Navigation section
  show_category_icons: true   # Show folder/file icons in the Categories tree
  show_links_icons: true      # Show icons in the Links section

  explorer:
    style: 2                  # 1 = classic (NAVIGATION — uppercase, bold, dividers), 2 = Obsidian-style
    numbers: false            # style 2 only — prefix labels with 00 / 10 / 20 / 30
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

To control how many posts appear per page, set `per_page` in your **root** `_config.yml` (not the theme config):

```yaml
index_generator:
  per_page: 10
```

```yaml
post_list:
  posts_per_row: 1        # 1 = single-column list, 2 = two-column card grid
  show_date: true         # Show post date
  show_tags: true         # Show tag pills
  max_tags: 6             # Max tags shown per post
  show_excerpt: true      # Show post excerpt
  show_thumbnail: true    # Show thumbnail image (requires thumbnail or banner front-matter)
  thumbnail_style: inline # Thumbnail position: left | right | inline
```

### Post

```yaml
post:
  show_thumbnail: true  # Show thumbnail as hero image on individual post pages
```

### Navigation

Customize the links shown in the left sidebar Navigation section:

```yaml
nav_items:
  - label: Home
    path: /
    icon: house
  - label: Archive
    path: /archives/
    icon: archive
```

Available icons match filenames in `source/icons/` (without the `.svg` extension).

### Social Links

Shown in the left sidebar Links section:

```yaml
social_links:
  - label: GitHub
    url: https://github.com/username
    icon: github
  - label: Twitter
    url: https://twitter.com/username
    icon: twitter
```

### Analytics

```yaml
# Vercel Analytics — set to true when deployed on Vercel
vercel_analytics: false
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+O` / `Cmd+O` | Open quick switcher |
| `Ctrl+Shift+F` / `Cmd+Shift+F` | Focus sidebar search |
| `Esc` | Close quick switcher or help modal |

---

## Customization

### Accent color

Edit `source/css/variables.css` to retheme the accent color site-wide.

### Custom icons

Drop any compatible SVG file into `themes/vaultex/source/icons/` and reference it by filename (without `.svg`) anywhere you use the `icon` partial:

```ejs
<%- partial('_partial/icon', { name: 'my-icon', size: 18, sw: 1.5 }) %>
```

---

## Scripts

Hexo scripts in `themes/vaultex/scripts/` run at build time. Each file has a single responsibility:

| File | Type | What it does |
|---|---|---|
| `icons.js` | Helper | Registers `theme_icon(name, opts)` — reads an SVG from `source/icons/<name>.svg`, strips the `<svg>` wrapper, and inlines the inner markup with configurable `size`, `stroke-width`, and CSS class. Results are cached per build. |
| `page-name.js` | Filter (`before_post_render`) | Sets `page.name` to the post's source filename without its extension (e.g. `my-post` for `my-post.md`). Used in breadcrumbs and the tab title. |
| `permalink-sanitizer.js` | Filter (`before_post_render` + `post_permalink`) | Normalises `data.slug` to lowercase kebab-case before Hexo builds the URL, then does a final pass on the generated permalink to strip any remaining unsafe characters or capital letters. |
| `index-co-located-assets.js` | Generator | Serves images and other local files that are referenced inside a post but stored in a shared `assets/` folder next to it, rather than the post-specific asset directory Hexo expects by default. |
| `meta.js` | Helper | Registers `meta(post)` — converts a post's `meta` front-matter array (key=value pairs) into `<meta>` HTML tags for the `<head>`. |
| `thumbnail.js` | Helper | Registers `thumbnail(post)` — returns the post's `thumbnail` or `banner` front-matter value, or an empty string if neither is set. |
| `reading-time.js` | Helper | Registers `reading_time(post)` — strips HTML from `post.content`, counts words, and returns a human-readable estimate (e.g. `"5 min read"`) based on 220 wpm. Minimum value is `"1 min read"`. |

---

## License

MIT — see [LICENSE.MD](LICENSE.MD).
