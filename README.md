# Livewire Flux MCP

[![CodeQL](https://github.com/leMaur/livewire-flux-mcp/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/leMaur/livewire-flux-mcp/actions/workflows/github-code-scanning/codeql)

An MCP (Model Context Protocol) server that provides access to Livewire Flux Components from [fluxui.dev](https://fluxui.dev/components/). This server allows AI assistants to fetch and search through Flux component documentation on demand.

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
- Access component reference sections with API details, props, and usage patterns
- Search through component documentation content
- List all available Flux components
- Access up-to-date documentation directly from the official Flux website

## How to use it

### From GitHub Repository

#### Option 1: Clone and Install Locally
```bash
# Clone the repository
git clone https://github.com/lemaur/livewire-flux-mcp.git
cd livewire-flux-mcp

# Install dependencies
npm install
```

#### Option 2: Use npx directly (recommended)
```bash
# Run directly from GitHub without cloning
npx github:lemaur/livewire-flux-mcp
```

#### Option 3: Install globally
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

#### Docker

You can also run the server using Docker:

```bash
# Build the Docker image
npm run docker:build
# or manually:
docker build -t livewire-flux-mcp .

# Run the server in a container
npm run docker:run
# or manually:
docker run --rm livewire-flux-mcp

# Run with custom command
docker run --rm livewire-flux-mcp npm start
```

### Available MCP Tools

The server provides two MCP tools:

1. **`fetch_flux_docs`** - Fetches documentation for components
   - `component` (optional): Specific component name to fetch docs for
   - `search` (optional): Search term to filter content
   - Automatically includes component reference sections when available
   - Fetches from `https://fluxui.dev/components/{component}`

2. **`list_flux_components`** - Lists all available Flux components
   - No parameters required
   - Returns components with `https://fluxui.dev/components/` prefix
   - Provides component names and their documentation paths

### Example Usage

Once the MCP server is running, AI assistants can use it to:

- Get documentation for a specific component: "Show me the Button component docs"
- Search for content: "Find all components related to forms"
- List available components: "What Flux components are available?"

The server automatically fetches the latest documentation from fluxui.dev/components and presents it in a structured format for easy consumption by AI assistants. When fetching component documentation, it includes both the main content and the reference section with detailed API information.

## Integration with Claude Code

### Adding the MCP Server

#### Method 1: Add from GitHub (recommended)
```bash
# Add server directly from GitHub repository
claude mcp add flux-docs npx github:lemaur/livewire-flux-mcp
```

#### Method 2: Add locally installed version
```bash
# If you cloned the repo locally
claude mcp add flux-docs node /path/to/livewire-flux-mcp/index.js

# If installed globally
claude mcp add flux-docs livewire-flux-mcp
```

#### Method 3: Add with Docker
```bash
# Add using Docker (requires Docker to be installed)
claude mcp add flux-docs docker run --rm livewire-flux-mcp
```

### Configuration Scopes

Choose the appropriate scope for your needs:

- **Local** (default): Only available in current project
- **Project**: Shared with team via `.mcp.json` file
- **User**: Available across all your projects

```bash
# Add with specific scope
claude mcp add --scope project flux-docs npx github:lemaur/livewire-flux-mcp
```

### Using the Tools in Claude Code

Once added, you can use the MCP tools in your conversations:

1. **List available components:**
   ```
   Use the list_flux_components tool to show me all available Flux components
   ```

2. **Get specific component documentation:**
   ```
   Use fetch_flux_docs to get documentation for the Button component
   ```

3. **Search documentation:**
   ```
   Use fetch_flux_docs to search for "form validation" in the Flux docs
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
