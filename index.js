#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

class FluxDocumentationServer {
  constructor() {
    this.server = new Server(
      {
        name: 'livewire-flux-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'fetch_flux_docs',
            description: 'Fetch documentation for Livewire Flux components from fluxui.dev',
            inputSchema: {
              type: 'object',
              properties: {
                component: {
                  type: 'string',
                  description: 'The component name or path to fetch documentation for (optional)',
                },
                search: {
                  type: 'string',
                  description: 'Search term to find specific documentation (optional)',
                },
              },
            },
          },
          {
            name: 'list_flux_components',
            description: 'List all available Flux components from the documentation',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'fetch_flux_docs':
            return await this.fetchFluxDocs(args.component, args.search);
          case 'list_flux_components':
            return await this.listFluxComponents();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async fetchFluxDocs(component, search) {
    try {
      const baseUrl = 'https://fluxui.dev/components';
      let url = baseUrl;
      
      if (component) {
        url = `${baseUrl}/${component}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract main content
      const content = $('main, .prose, .documentation, .content').first();
      let text = '';
      
      if (content.length > 0) {
        text = content.text().trim();
      } else {
        // Fallback to body content
        text = $('body').text().trim();
      }

      // Extract reference section if component is specified
      let referenceText = '';
      if (component) {
        // Look for reference section by ID or heading
        const referenceSection = $('#reference, h2:contains("Reference"), h3:contains("Reference")').next();
        if (referenceSection.length > 0) {
          referenceText = referenceSection.text().trim();
        } else {
          // Alternative approach: look for content after "Reference" heading
          $('h1, h2, h3, h4').each((i, el) => {
            const headingText = $(el).text().toLowerCase();
            if (headingText.includes('reference')) {
              let nextElement = $(el).next();
              let sectionContent = '';
              
              // Collect content until next heading or end
              while (nextElement.length > 0 && !nextElement.is('h1, h2, h3, h4')) {
                sectionContent += nextElement.text().trim() + '\n';
                nextElement = nextElement.next();
              }
              
              if (sectionContent.trim()) {
                referenceText = sectionContent.trim();
                return false; // Break the loop
              }
            }
          });
        }
      }

      // Combine main content with reference section
      let combinedText = text;
      if (referenceText) {
        combinedText = `${text}\n\n--- REFERENCE SECTION ---\n\n${referenceText}`;
      }

      // If search term is provided, filter content
      if (search) {
        const lines = combinedText.split('\n');
        const filteredLines = lines.filter(line => 
          line.toLowerCase().includes(search.toLowerCase())
        );
        combinedText = filteredLines.join('\n');
      }

      return {
        content: [
          {
            type: 'text',
            text: `Documentation from ${url}:\n\n${combinedText}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to fetch documentation: ${error.message}`);
    }
  }

  async listFluxComponents() {
    try {
      const response = await fetch('https://fluxui.dev/docs');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Look for component links with /components/ prefix
      const links = [];
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        
        // Filter for links that start with https://fluxui.dev/components/
        if (href && text && href.startsWith('https://fluxui.dev/components/') && !links.some(l => l.href === href)) {
          links.push({
            name: text,
            href: href,
            path: href.replace('https://fluxui.dev/components/', '')
          });
        }
      });

      const componentsList = links
        .map(link => `- ${link.name} (${link.path})`)
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `Available Flux Components:\n\n${componentsList}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list components: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Livewire Flux MCP server running on stdio');
  }
}

const server = new FluxDocumentationServer();
server.run().catch(console.error);