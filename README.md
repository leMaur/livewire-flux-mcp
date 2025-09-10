# Livewire Flux MCP

[![CodeQL](https://github.com/leMaur/livewire-flux-mcp/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/leMaur/livewire-flux-mcp/actions/workflows/github-code-scanning/codeql)

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

## How to use it

### From npm (recommended)

#### Option 1: Use npx directly
```bash
# Run directly from npm without installing
npx livewire-flux-mcp
```

#### Option 2: Install globally
```bash
# Install globally from npm
npm install -g livewire-flux-mcp

# Then run from anywhere
livewire-flux-mcp
```

### From GitHub Repository

#### Option 3: Clone and Install Locally
```bash
# Clone the repository
git clone https://github.com/lemaur/livewire-flux-mcp.git
cd livewire-flux-mcp

# Install dependencies
npm install
```

#### Option 4: Use npx with GitHub
```bash
# Run directly from GitHub without cloning
npx github:lemaur/livewire-flux-mcp
```

#### Option 5: Install globally from GitHub
```bash
# Install globally from GitHub
npm install -g github:lemaur/livewire-flux-mcp

# Then run from anywhere
livewire-flux-mcp
```

### Running the server

#### Start the MCP server:
```bash
npm start
```

#### Development mode with file watching:
```bash
npm run dev
```

#### Run directly with npx:
```bash
npx .
```


### Available MCP Tools

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

## Integration with Claude Code

### Adding the MCP Server

#### Method 1: Add from npm (recommended)
```bash
# Add server directly from npm
claude mcp add flux-docs npx livewire-flux-mcp
```

#### Method 2: Add from GitHub
```bash
# Add server directly from GitHub repository
claude mcp add flux-docs npx github:lemaur/livewire-flux-mcp
```

#### Method 3: Add locally installed version
```bash
# If you cloned the repo locally
claude mcp add flux-docs node /path/to/livewire-flux-mcp/index.js

# If installed globally from npm or GitHub
claude mcp add flux-docs livewire-flux-mcp
```


### Configuration Scopes

Choose the appropriate scope for your needs:

- **Local** (default): Only available in current project
- **Project**: Shared with team via `.mcp.json` file
- **User**: Available across all your projects

```bash
# Add with specific scope
claude mcp add --scope project flux-docs npx livewire-flux-mcp
```

### Using the Tools in Claude Code

Once added, you can use the MCP tools in your conversations:

1. **List available components:**
   ```
   Use the list_flux_components tool to show me all available Flux components
   ```

2. **List available layouts:**
   ```
   Use the list_flux_layouts tool to show me all available Flux layouts
   ```

3. **Get specific component documentation:**
   ```
   Use fetch_flux_docs to get documentation for the Button component
   ```

4. **Get specific layout documentation:**
   ```
   Use fetch_flux_docs to get documentation for the header layout
   ```

5. **Search documentation:**
   ```
   Use fetch_flux_docs to search for "form validation" in the Flux docs
   ```

6. **Browse all available icons:**
   ```
   Use list_flux_component_icons to show me all available Heroicons
   ```

7. **Search for specific icons:**
   ```
   Use list_flux_component_icons with search "arrow" to find arrow-related icons
   ```

8. **Filter icons by variant:**
   ```
   Use list_flux_component_icons with variant "solid" to show only solid icons
   ```

### Managing the Server

```bash
# List all MCP servers
claude mcp list

# Remove the server
claude mcp remove flux-docs

# View server logs
claude mcp logs flux-docs
```
