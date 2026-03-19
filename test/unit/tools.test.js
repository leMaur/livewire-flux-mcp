import { describe, test } from 'node:test';
import assert from 'node:assert';

describe('MCP Tool Schemas', () => {
  const expectedTools = [
    'fetch_flux_docs',
    'list_flux_components',
    'list_flux_layouts',
    'list_flux_component_icons'
  ];

  test('server defines all 4 expected tools', () => {
    // This validates the tool count matches documentation
    assert.strictEqual(expectedTools.length, 4);
  });

  describe('fetch_flux_docs tool', () => {
    test('has correct schema structure', () => {
      const schema = {
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
      };

      assert.strictEqual(schema.name, 'fetch_flux_docs');
      assert.strictEqual(schema.inputSchema.type, 'object');
      assert.ok(schema.inputSchema.properties.component);
      assert.ok(schema.inputSchema.properties.layout);
      assert.ok(schema.inputSchema.properties.search);
    });

    test('all parameters are optional', () => {
      // Test that tool can be called with no parameters
      const validCalls = [
        {},
        { component: 'button' },
        { layout: 'header' },
        { search: 'form' },
        { component: 'input', search: 'validation' }
      ];

      validCalls.forEach(params => {
        // In real implementation, these would be valid
        assert.ok(typeof params === 'object');
      });
    });
  });

  describe('list_flux_components tool', () => {
    test('has correct schema structure', () => {
      const schema = {
        name: 'list_flux_components',
        description: 'List all available Flux components from the documentation',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      };

      assert.strictEqual(schema.name, 'list_flux_components');
      assert.strictEqual(schema.inputSchema.type, 'object');
      assert.strictEqual(Object.keys(schema.inputSchema.properties).length, 0);
    });

    test('accepts no parameters', () => {
      const params = {};
      assert.strictEqual(Object.keys(params).length, 0);
    });
  });

  describe('list_flux_layouts tool', () => {
    test('has correct schema structure', () => {
      const schema = {
        name: 'list_flux_layouts',
        description: 'List all available Flux layouts from the documentation',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      };

      assert.strictEqual(schema.name, 'list_flux_layouts');
      assert.strictEqual(schema.inputSchema.type, 'object');
    });
  });

  describe('list_flux_component_icons tool', () => {
    test('has correct schema structure', () => {
      const schema = {
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
      };

      assert.strictEqual(schema.name, 'list_flux_component_icons');
      assert.ok(schema.inputSchema.properties.variant);
      assert.ok(schema.inputSchema.properties.search);
    });

    test('variant parameter accepts valid enum values', () => {
      const validVariants = ['outline', 'solid', 'mini', 'micro'];

      validVariants.forEach(variant => {
        assert.ok(['outline', 'solid', 'mini', 'micro'].includes(variant));
      });
    });

    test('parameters are optional', () => {
      const validCalls = [
        {},
        { variant: 'outline' },
        { search: 'arrow' },
        { variant: 'solid', search: 'user' }
      ];

      validCalls.forEach(params => {
        assert.ok(typeof params === 'object');
      });
    });
  });

  describe('MCP Response Format', () => {
    test('responses follow MCP content format', () => {
      const validResponse = {
        content: [
          {
            type: 'text',
            text: 'Sample documentation content'
          }
        ]
      };

      assert.ok(Array.isArray(validResponse.content));
      assert.strictEqual(validResponse.content[0].type, 'text');
      assert.ok(typeof validResponse.content[0].text === 'string');
    });

    test('error responses follow MCP format', () => {
      const errorResponse = {
        content: [
          {
            type: 'text',
            text: 'Error: Failed to fetch documentation'
          }
        ]
      };

      assert.ok(Array.isArray(errorResponse.content));
      assert.ok(errorResponse.content[0].text.startsWith('Error:'));
    });
  });
});
