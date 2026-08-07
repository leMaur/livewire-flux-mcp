# Livewire Flux MCP

[![Npm](https://img.shields.io/npm/v/livewire-flux-mcp?style=flat-square)](https://www.npmjs.com/package/livewire-flux-mcp)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/lemaur/livewire-flux-mcp/github-code-scanning%2Fcodeql?style=flat-square)](https://github.com/leMaur/livewire-flux-mcp/actions/workflows/github-code-scanning/codeql)
[![License](https://img.shields.io/github/license/lemaur/livewire-flux-mcp?style=flat-square&color=yellow)](https://github.com/leMaur/livewire-flux-mcp/blob/main/LICENSE.md)
[![Downloads](https://img.shields.io/npm/d18m/livewire-flux-mcp?style=flat-square)](https://www.npmjs.com/package/livewire-flux-mcp)
[![Sponsor](https://img.shields.io/github/sponsors/lemaur?style=flat-square&color=pink)](https://github.com/sponsors/leMaur)

An MCP (Model Context Protocol) server that provides access to Livewire Flux Components and Layouts from [Livewire&nbsp;Flux](https://fluxui.dev). This server allows AI assistants to fetch and search through Flux component and layout documentation on demand.

> **⚠️ Disclaimer**
> 
> This is a personal project and is not affiliated with Livewire Flux.

## Support Me

Hey folks,

Do you like this package? Do you find it useful, and it fits well in your project?

I am glad to help you, and I would be so grateful if you considered supporting my work.

You can even choose 😃:
* You can [sponsor me 😎](https://github.com/sponsors/leMaur)
* You can [buy me a coffee ☕ or a pizza 🍕](https://github.com/sponsors/leMaur?frequency=one-time&sponsor=leMaur)
* You can "Star ⭐" this repository (it's free BTW 😉)

## What it does

This MCP server scrapes and provides structured access to the Livewire Flux documentation, enabling AI assistants to:

- Fetch documentation for specific Flux components from `https://fluxui.dev/components/`
- Fetch documentation for specific Flux layouts from `https://fluxui.dev/layouts/`
- Access component and layout reference sections with API details, props, and usage patterns
- Search through component and layout documentation content
- List all available Flux components
- Browse and search all available Heroicons for use with flux:icon component
- Access up-to-date documentation directly from the official Flux website
- **High-performance caching** with 24-hour expiration for optimal response times

## Set Up Your Agents

The server runs over stdio and is launched with `npx`, so there is nothing to install
globally. Every agent stores that differently — pick yours below.

<details>
<summary><b>Cursor</b></summary>

One-click install:

[Add `flux-docs` to Cursor](cursor://anysphere.cursor-deeplink/mcp/install?name=flux-docs&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImxpdmV3aXJlLWZsdXgtbWNwIl19)

Or add it by hand to `.cursor/mcp.json` (this project) or `~/.cursor/mcp.json` (every project):

```json
{
    "mcpServers": {
        "flux-docs": {
            "command": "npx",
            "args": ["-y", "livewire-flux-mcp"]
        }
    }
}
```

Cursor has no `cursor mcp add` command — the deeplink and the config file are the two supported routes.

</details>

<details>
<summary><b>Claude Code</b></summary>

```shell
claude mcp add --transport stdio --scope project flux-docs -- npx -y livewire-flux-mcp
```

Everything after `--` is passed to the server verbatim. `--scope project` writes `.mcp.json`
in the project root so the whole team gets it:

```json
{
    "mcpServers": {
        "flux-docs": {
            "command": "npx",
            "args": ["-y", "livewire-flux-mcp"]
        }
    }
}
```

Use `--scope local` (the default) to keep it to yourself, or `--scope user` for every project.
A project-scoped server needs approving the first time you open the project. On Windows, wrap
the command: `-- cmd /c npx -y livewire-flux-mcp`.

</details>

<details>
<summary><b>Codex</b></summary>

```shell
codex mcp add flux-docs -- npx -y livewire-flux-mcp
```

This writes to `~/.codex/config.toml`:

```toml
[mcp_servers.flux-docs]
command = "npx"
args = ["-y", "livewire-flux-mcp"]
```

A project-level `.codex/config.toml` is only read once you have trusted the project.
Verify with `codex mcp list`.

</details>

<details>
<summary><b>Gemini CLI</b></summary>

```shell
gemini mcp add --scope project flux-docs npx -y livewire-flux-mcp
```

Note there is no `--` separator: the command and its arguments follow the server name
directly. This writes `.gemini/settings.json` (use `--scope user` for `~/.gemini/settings.json`):

```json
{
    "mcpServers": {
        "flux-docs": {
            "command": "npx",
            "args": ["-y", "livewire-flux-mcp"]
        }
    }
}
```

`gemini mcp list` reports the server as disconnected until the folder is trusted.

</details>

<details>
<summary><b>GitHub Copilot (VS Code)</b></summary>

Create `.vscode/mcp.json`. Copilot uses `servers`, not `mcpServers`, and each entry declares its type:

```json
{
    "servers": {
        "flux-docs": {
            "type": "stdio",
            "command": "npx",
            "args": ["-y", "livewire-flux-mcp"]
        }
    }
}
```

Or run **MCP: Add Server** from the command palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and choose
the Workspace scope. The CLI equivalent writes to your user profile rather than the workspace:

```shell
code --add-mcp '{"name":"flux-docs","command":"npx","args":["-y","livewire-flux-mcp"]}'
```

Requires VS Code 1.102+ with GitHub Copilot Chat enabled.

</details>

<details>
<summary><b>Junie</b></summary>

Open **Settings → Tools → Junie → MCP Settings** and add the server, or edit
`.junie/mcp/mcp.json` in the project (`~/.junie/mcp/mcp.json` for every project) directly:

```json
{
    "mcpServers": {
        "flux-docs": {
            "command": "npx",
            "args": ["-y", "livewire-flux-mcp"]
        }
    }
}
```

Junie registers MCP servers by editing JSON — there is no CLI command. Project-level servers
are ignored in untrusted projects.

</details>

## Available MCP Tools

The server provides four MCP tools:

1. **`fetch_flux_docs`** - Fetches documentation for components or layouts
   - `component` (optional): Specific component name to fetch docs for
   - `layout` (optional): Specific layout name to fetch docs for (e.g., "header", "sidebar")
   - `version` (optional): Flux major version to target — `'v1'` or `'v2'` (default `'v2'`)
   - Automatically includes reference sections when available
   - Fetches from `https://fluxui.dev/components/{component}` or `https://fluxui.dev/layouts/{layout}` (v2); routes to `https://v1.fluxui.dev/components/{component}` when `version='v1'`
   - When the page is a paid Flux component, a `[NOTICE] This is a Flux Pro component …` line is prepended to the response

2. **`list_flux_components`** - Lists all available Flux components
   - `version` (optional): `'v1'` or `'v2'` (default `'v2'`)
   - `tier` (optional): `'free'`, `'pro'`, or `'all'` (default `'all'`). On `'all'`, each component is annotated `[Pro]` or `[Free]`. On v1, the tier argument is ignored (v1 has no Pro tier).
   - Provides component names and their documentation paths

3. **`list_flux_layouts`** - Lists all available Flux layouts
   - `version` (optional): `'v1'` or `'v2'` (default `'v2'`). On v1 the tool returns a brief "layouts are not available in v1" notice without making any HTTP request.
   - Provides layout names and their documentation paths

4. **`list_flux_component_icons`** - Lists all available Heroicons for flux:icon component
   - `variant` (optional): Filter by icon variant (`outline`, `solid`, `mini`, `micro`)
   - `search` (optional): Search term to filter icon names
   - Fetches actual icon names from Heroicons GitHub repository
   - Provides usage examples, dimensions, and GitHub links for each variant
   - Returns comprehensive list of all available icons with proper Flux syntax

### Example Usage

Once the MCP server is running, AI assistants can use it to:

- Get documentation for a specific component: "Show me the Button component docs"
- Get documentation for a specific layout: "Show me the header layout docs"
- List available components: "What Flux components are available?"
- List available layouts: "What Flux layouts are available?"
- Browse all available icons: "Show me all Heroicons available for flux:icon"
- Search for specific icons: "Find all arrow icons in the outline variant"
- Get icon usage examples: "How do I use the user icon in solid variant?"

The server automatically fetches the latest documentation from fluxui.dev/components, fluxui.dev/layouts, and Heroicons from GitHub, presenting everything in a structured format for easy consumption by AI assistants. When fetching component or layout documentation, it includes both the main content and the reference section with detailed API information.

### Versions

Flux ships in two major versions, and the MCP server supports both:

- **v2** (default) — the current host at `fluxui.dev`. Used when `version` is omitted or set to `'v2'`. Supports components, layouts, and Pro-tier awareness.
- **v1** — the legacy host at `v1.fluxui.dev`. Used when `version='v1'`. Components only — Flux v1 has no `/layouts` route and no Pro tier. `list_flux_layouts` returns a friendly notice on v1 without making any HTTP request; `tier` is ignored on `list_flux_components` for v1.

The `version` argument is accepted on `fetch_flux_docs`, `list_flux_components`, and `list_flux_layouts`. `list_flux_component_icons` is version-independent (Heroicons are not part of Flux versioning).

### Pro tier awareness

A subset of Flux v2 components is only available with a paid Flux Pro license. The MCP server surfaces this in two ways:

- **Notice on fetch.** When `fetch_flux_docs` retrieves a component that is Pro, the response is prepended with a single `[NOTICE] This is a Flux Pro component — requires a paid Flux license.` line.
- **Tier filter on listing.** `list_flux_components` accepts `tier='free'` to hide Pro components, `tier='pro'` to show only Pro ones, or `tier='all'` (default) to list everything with `[Pro]` / `[Free]` annotations next to each name.

The list of Pro components is derived from `fluxui.dev/pricing` with a hardcoded fallback baked into the server, so tier filtering still works correctly if the pricing page is unreachable.

## Manually Registering the MCP Server

If your editor is not one of the six covered in [Set Up Your Agents](#set-up-your-agents), register
the server manually using the following details:

<table>
<tr><td><strong>Command</strong></td><td><code>npx</code></td></tr>
<tr><td><strong>Args</strong></td><td><code>-y livewire-flux-mcp</code></td></tr>
</table>

```json
{
    "mcpServers": {
        "flux-docs": {
            "command": "npx",
            "args": ["-y", "livewire-flux-mcp"]
        }
    }
}
```

`-y` skips the install confirmation on first launch, which a stdio server cannot answer.

## Performance & Caching

The MCP server includes intelligent caching to provide optimal performance:

- **24-hour cache expiration** - Content is cached for 1 day to balance freshness with performance
- **Automatic cache management** - Expired entries are automatically cleaned up
- **Intelligent cache keys** - Different cache entries for different parameters (component, layout, version, tier, variant)
- **GitHub API rate limit protection** - Prevents hitting GitHub API limits when fetching Heroicons
- **Instant responses** - Cached requests return in milliseconds instead of seconds

### Cache Behavior

- **Documentation requests**: Cached per component/layout and version combination
- **Component listings**: Cached globally (refreshed daily)
- **Layout listings**: Cached globally (refreshed daily)
- **Icon listings**: Cached per variant and search combination
- **Cache storage**: In-memory (resets when server restarts)

The caching system is particularly beneficial for the `list_flux_component_icons` tool, which can make up to 4 GitHub API calls per request without caching.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributing

Please see [CONTRIBUTING](.github/CONTRIBUTING.md) for details.

## Security Vulnerabilities

Please review [our security policy](../../security/policy) on how to report security vulnerabilities.

## Credits

- [Maurizio](https://github.com/lemaur)
- [All Contributors](../../contributors)

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.
