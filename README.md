# Livewire Flux MCP

An MCP (Model Context Protocol) server that provides access to Livewire Flux Components documentation from [fluxui.dev](https://fluxui.dev/docs/). This server allows AI assistants to fetch and search through Flux component documentation on demand.

## What it does

This MCP server scrapes and provides structured access to the Livewire Flux documentation, enabling AI assistants to:

- Fetch documentation for specific Flux components
- Search through component documentation content
- List all available Flux components
- Access up-to-date documentation directly from the official Flux website

## How to use it

### Installation

```bash
npm install
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

The server provides two MCP tools:

1. **`fetch_flux_docs`** - Fetches documentation for components
   - `component` (optional): Specific component name to fetch docs for
   - `search` (optional): Search term to filter content

2. **`list_flux_components`** - Lists all available Flux components
   - No parameters required
   - Returns a list of components with their documentation paths

### Example Usage

Once the MCP server is running, AI assistants can use it to:

- Get documentation for a specific component: "Show me the Button component docs"
- Search for content: "Find all components related to forms"
- List available components: "What Flux components are available?"

The server automatically fetches the latest documentation from fluxui.dev and presents it in a structured format for easy consumption by AI assistants.