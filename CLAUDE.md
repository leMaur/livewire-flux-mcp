# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that provides access to Livewire Flux Components documentation from https://fluxui.dev/docs/. The server runs locally and can be used with `npx` to fetch documentation on demand.

## Development Commands

- `npm install` - Install dependencies
- `npm start` - Start the MCP server
- `npm run dev` - Start the server with file watching for development
- `npm test` - Run the test suite (Node built-in runner)
- `npx .` - Run the server directly with npx
- `node index.js install --path <dir> --dry-run` - Preview the AI-artifact installer

## Architecture

The project consists of a single main file (`index.js`) that implements:

- **FluxDocumentationServer class**: Main server implementation using MCP SDK
- **Four MCP tools** (see below)
- **Version-aware host routing**: `getBaseUrl(version)` returns `https://fluxui.dev` (v2, default) or `https://v1.fluxui.dev` (v1)
- **Pro-tier awareness**: `getProComponents()` scrapes `fluxui.dev/pricing` with a hardcoded fallback set so the listing's `tier` filter still works offline
- **Web scraping**: Uses cheerio to parse HTML content from fluxui.dev
- **Content extraction**: Intelligently extracts documentation content from the website

## MCP Tools

1. **fetch_flux_docs**:
   - Optional `component` parameter for specific component docs
   - Optional `layout` parameter for layout docs (e.g. `header`, `sidebar`)
   - Optional `version` parameter (`'v1' | 'v2'`, default `'v2'`)
   - Prepends a `[NOTICE]` line when the page is a paid Flux Pro component

2. **list_flux_components**:
   - Optional `version` parameter (`'v1' | 'v2'`, default `'v2'`)
   - Optional `tier` parameter (`'free' | 'pro' | 'all'`, default `'all'`). Ignored on v1.
   - Returns list of available components with their paths, annotated `[Pro]` / `[Free]` on v2

3. **list_flux_layouts**:
   - Optional `version` parameter (`'v1' | 'v2'`, default `'v2'`)
   - Returns layouts with names and paths
   - On v1, returns a "not available" notice without making any HTTP request
   - Sources names via `collectLayoutLinks()`: tries `/layouts` first, then falls back to
     `/components`. The `/layouts` index 404s upstream as of 2026-08 while `/layouts/{name}`
     still resolves, and layout links appear in the site-wide nav on every page. Keeping the
     index first means the tool repairs itself if Flux restores it.

4. **list_flux_component_icons**:
   - Optional `variant` parameter (`outline | solid | mini | micro`)
   - Optional `search` parameter to filter icon names
   - Version-independent (Heroicons are not part of Flux versioning)

## AI Artifacts & Installer

`resources/` holds the guidance shipped to consumers, laid out to match Laravel Boost's own
convention:

- `resources/boost/skills/fluxui-development/SKILL.md` — on-demand skill. The frontmatter
  `name` **must stay `fluxui-development`**: that string is the override key Boost uses, so
  changing it silently hands control back to Boost's bundled skill (which routes Flux lookups
  to `search-docs`). A unit test asserts this.
- `resources/boost/guidelines/core.blade.php` — always-loaded guideline block.
- `resources/agents/flux-ui-builder.md` — Claude Code subagent.

`install.js` copies them into a consumer project (`.ai/skills/…`, `.ai/guidelines/fluxui-{free,pro}/…`,
`.claude/agents/…`). It is imported lazily from `index.js` only when `process.argv[2] === 'install'`,
so the stdio server path is unaffected — a bare invocation must always produce a clean stdio server
with nothing on stdout.

Boost only auto-discovers third-party guidelines/skills from **Composer** packages, so an npm
package can never be picked up automatically; the installer writes to Boost's documented *custom*
guideline/skill paths instead. Guideline writes merge behind `{{-- livewire-flux-mcp:begin --}}`
markers and never clobber existing content; whole-file artifacts carry
`<!-- livewire-flux-mcp:managed -->` so a re-run may replace them while user-authored files are
refused without `--force`.

## Dependencies

- `@modelcontextprotocol/sdk`: Core MCP functionality
- `cheerio`: HTML parsing and content extraction
- Native `fetch` (Node 20+): HTTP requests to documentation sites