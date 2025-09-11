# Livewire Flux MCP

[![Npm](https://img.shields.io/npm/v/livewire-flux-mcp?style=flat-square)](https://www.npmjs.com/package/livewire-flux-mcp)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/lemaur/livewire-flux-mcp/github-code-scanning%2Fcodeql?style=flat-square)](https://github.com/leMaur/livewire-flux-mcp/actions/workflows/github-code-scanning/codeql)
[![License](https://img.shields.io/github/license/lemaur/livewire-flux-mcp?style=flat-square&color=yellow)](https://github.com/leMaur/livewire-flux-mcp/blob/main/LICENSE.md)
![Downloads](https://img.shields.io/npm/d18m/livewire-flux-mcp?style=flat-square)
[![Sponsor](https://img.shields.io/github/sponsors/lemaur?style=flat-square&color=pink)](https://github.com/sponsors/leMaur)

An MCP (Model Context Protocol) server that provides access to Livewire Flux Components and Layouts from [fluxui.dev](https://fluxui.dev/). This server allows AI assistants to fetch and search through Flux component and layout documentation on demand.

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

## Available MCP Tools

The server provides four MCP tools:

1. **`fetch_flux_docs`** - Fetches documentation for components or layouts
   - `component` (optional): Specific component name to fetch docs for
   - `layout` (optional): Specific layout name to fetch docs for (e.g., "header", "sidebar")
   - `search` (optional): Search term to filter content
   - Automatically includes reference sections when available
   - Fetches from `https://fluxui.dev/components/{component}` or `https://fluxui.dev/layouts/{layout}`

2. **`list_flux_components`** - Lists all available Flux components
   - No parameters required
   - Returns components with `https://fluxui.dev/components/` prefix
   - Provides component names and their documentation paths

3. **`list_flux_layouts`** - Lists all available Flux layouts
   - No parameters required
   - Returns layouts with `https://fluxui.dev/layouts/` prefix
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
- Search for content: "Find all components related to forms"
- List available components: "What Flux components are available?"
- List available layouts: "What Flux layouts are available?"
- Browse all available icons: "Show me all Heroicons available for flux:icon"
- Search for specific icons: "Find all arrow icons in the outline variant"
- Get icon usage examples: "How do I use the user icon in solid variant?"

The server automatically fetches the latest documentation from fluxui.dev/components, fluxui.dev/layouts, and Heroicons from GitHub, presenting everything in a structured format for easy consumption by AI assistants. When fetching component or layout documentation, it includes both the main content and the reference section with detailed API information.

## Manually Registering the MCP Server

Sometimes you may need to manually register the Livewire Flux MCP server with your editor of choice. 
You should register the MCP server using the following details:

<table>
<tr><td><strong>Command</strong></td><td><code>npx</code></td></tr>
<tr><td><strong>Args</strong></td><td><code>livewire-flux-mcp</code></td></tr>
</table>

```json
{
    "mcpServers": {
        "flux-docs": {
            "command": "npx",
            "args": ["livewire-flux-mcp"]
        }
    }
}
```

## Performance & Caching

The MCP server includes intelligent caching to provide optimal performance:

- **24-hour cache expiration** - Content is cached for 1 day to balance freshness with performance
- **Automatic cache management** - Expired entries are automatically cleaned up
- **Intelligent cache keys** - Different cache entries for different parameters (component, search, variant)
- **GitHub API rate limit protection** - Prevents hitting GitHub API limits when fetching Heroicons
- **Instant responses** - Cached requests return in milliseconds instead of seconds

### Cache Behavior

- **Documentation requests**: Cached per component/layout and search term combination
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
