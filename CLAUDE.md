# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that provides access to Livewire Flux Components documentation from https://fluxui.dev/docs/. The server runs locally and can be used with `npx` to fetch documentation on demand.

## Development Commands

- `npm install` - Install dependencies
- `npm start` - Start the MCP server
- `npm run dev` - Start the server with file watching for development
- `npx .` - Run the server directly with npx

## Architecture

The project consists of a single main file (`index.js`) that implements:

- **FluxDocumentationServer class**: Main server implementation using MCP SDK
- **Two MCP tools**:
  - `fetch_flux_docs`: Fetches documentation for specific components or searches content
  - `list_flux_components`: Lists all available Flux components from the documentation site
- **Web scraping**: Uses cheerio to parse HTML content from fluxui.dev
- **Content extraction**: Intelligently extracts documentation content from the website

## MCP Tools

1. **fetch_flux_docs**: 
   - Optional `component` parameter for specific component docs
   - Optional `search` parameter to filter content
   - Returns formatted documentation text

2. **list_flux_components**:
   - No parameters required
   - Returns list of available components with their paths

## Dependencies

- `@modelcontextprotocol/sdk`: Core MCP functionality
- `cheerio`: HTML parsing and content extraction
- `node-fetch`: HTTP requests to documentation site