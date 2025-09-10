#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

class SimpleCache {
  constructor(ttlMs = 24 * 60 * 60 * 1000) { // 24 hours default
    this.cache = new Map();
    this.ttl = ttlMs;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

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

    this.cache = new SimpleCache();
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'fetch_flux_docs',
            description: 'Fetch documentation for Livewire Flux components or layouts from fluxui.dev',
            inputSchema: {
              type: 'object',
              properties: {
                component: {
                  type: 'string',
                  description: 'The component name or path to fetch documentation for (optional)',
                },
                layout: {
                  type: 'string',
                  description: 'The layout name to fetch documentation for (e.g., "header", "sidebar") (optional)',
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
          {
            name: 'list_flux_layouts',
            description: 'List all available Flux layouts from the documentation',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'list_flux_component_icons',
            description: 'List all available Heroicons for use with flux:icon component, with variants and usage examples',
            inputSchema: {
              type: 'object',
              properties: {
                variant: {
                  type: 'string',
                  enum: ['outline', 'solid', 'mini', 'micro'],
                  description: 'Filter icons by variant (optional)',
                },
                search: {
                  type: 'string',
                  description: 'Search term to filter icon names (optional)',
                },
              },
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
            return await this.fetchFluxDocs(args.component, args.layout, args.search);
          case 'list_flux_components':
            return await this.listFluxComponents();
          case 'list_flux_layouts':
            return await this.listFluxLayouts();
          case 'list_flux_component_icons':
            return await this.listFluxComponentIcons(args.variant, args.search);
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

  async fetchFluxDocs(component, layout, search) {
    try {
      let url;
      
      if (layout) {
        // Handle layout requests
        url = `https://fluxui.dev/layouts/${layout}`;
      } else {
        // Handle component requests (existing logic)
        const baseUrl = 'https://fluxui.dev/components';
        url = baseUrl;
        
        if (component) {
          url = `${baseUrl}/${component}`;
        }
      }

      // Create cache key based on URL and search parameter
      const cacheKey = `docs:${url}:${search || ''}`;
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
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
      if (component || layout) {
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

      const result = {
        content: [
          {
            type: 'text',
            text: `Documentation from ${url}:\n\n${combinedText}`,
          },
        ],
      };

      // Cache the result
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch documentation: ${error.message}`);
    }
  }

  async listFluxComponents() {
    try {
      const cacheKey = 'components:list';
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

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

      const result = {
        content: [
          {
            type: 'text',
            text: `Available Flux Components:\n\n${componentsList}`,
          },
        ],
      };

      // Cache the result
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      throw new Error(`Failed to list components: ${error.message}`);
    }
  }

  async listFluxLayouts() {
    try {
      const cacheKey = 'layouts:list';
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await fetch('https://fluxui.dev/layouts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Look for layout links with /layouts/ prefix
      const links = [];
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        
        // Filter for links that start with https://fluxui.dev/layouts/
        if (href && text && href.startsWith('https://fluxui.dev/layouts/') && !links.some(l => l.href === href)) {
          links.push({
            name: text,
            href: href,
            path: href.replace('https://fluxui.dev/layouts/', '')
          });
        }
      });

      const layoutsList = links
        .map(link => `- ${link.name} (${link.path})`)
        .join('\n');

      const result = {
        content: [
          {
            type: 'text',
            text: `Available Flux Layouts:\n\n${layoutsList}`,
          },
        ],
      };

      // Cache the result
      this.cache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      throw new Error(`Failed to list layouts: ${error.message}`);
    }
  }

  async listFluxComponentIcons(variant, search) {
    try {
      // Create cache key based on variant and search parameters
      const cacheKey = `icons:${variant || 'all'}:${search || ''}`;
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }

      const variants = {
        outline: {
          path: '24/outline',
          size: '24px',
          style: 'outline',
          usage: '<flux:icon.{name} />'
        },
        solid: {
          path: '24/solid', 
          size: '24px',
          style: 'solid',
          usage: '<flux:icon.{name} variant="solid" />'
        },
        mini: {
          path: '20/solid',
          size: '20px', 
          style: 'solid',
          usage: '<flux:icon.{name} variant="mini" />'
        },
        micro: {
          path: '16/solid',
          size: '16px',
          style: 'solid', 
          usage: '<flux:icon.{name} variant="micro" />'
        }
      };

      const variantsToFetch = variant ? [variant] : Object.keys(variants);
      const allIcons = {};

      for (const variantName of variantsToFetch) {
        const variantConfig = variants[variantName];
        const url = `https://api.github.com/repos/tailwindlabs/heroicons/contents/optimized/${variantConfig.path}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${variantName} icons: ${response.status}`);
        }

        const files = await response.json();
        const iconNames = files
          .filter(file => file.name.endsWith('.svg'))
          .map(file => file.name.slice(0, -4))
          .filter(name => !search || name.toLowerCase().includes(search.toLowerCase()));

        allIcons[variantName] = {
          config: variantConfig,
          icons: iconNames
        };
      }

      let result = 'Available Heroicons for flux:icon component:\n\n';
      
      for (const [variantName, data] of Object.entries(allIcons)) {
        const { config, icons } = data;
        result += `## ${variantName.toUpperCase()} (${config.size} ${config.style})\n`;
        result += `Usage: ${config.usage}\n`;
        result += `GitHub: https://github.com/tailwindlabs/heroicons/tree/master/optimized/${config.path}\n\n`;
        
        if (icons.length === 0) {
          result += `No icons found${search ? ` matching "${search}"` : ''}.\n\n`;
        } else {
          result += `Icons (${icons.length}):\n`;
          const iconList = icons.map(name => `  • ${name}`).join('\n');
          result += `${iconList}\n\n`;
        }
      }

      if (search) {
        result += `\nFiltered by: "${search}"\n`;
      }

      const finalResult = {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };

      // Cache the result
      this.cache.set(cacheKey, finalResult);
      
      return finalResult;
    } catch (error) {
      throw new Error(`Failed to list icons: ${error.message}`);
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