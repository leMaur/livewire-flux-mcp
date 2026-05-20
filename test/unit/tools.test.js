import { describe, test } from 'node:test';
import assert from 'node:assert';
import { TOOL_DEFINITIONS } from '../../index.js';

const byName = (name) => TOOL_DEFINITIONS.find((t) => t.name === name);

describe('MCP Tool Schemas', () => {
  test('exports exactly 4 tools', () => {
    assert.strictEqual(TOOL_DEFINITIONS.length, 4);
  });

  test('each tool has name, description, inputSchema.type=object', () => {
    for (const tool of TOOL_DEFINITIONS) {
      assert.ok(typeof tool.name === 'string' && tool.name.length > 0);
      assert.ok(typeof tool.description === 'string' && tool.description.length > 0);
      assert.strictEqual(tool.inputSchema.type, 'object');
      assert.ok(typeof tool.inputSchema.properties === 'object');
    }
  });

  describe('fetch_flux_docs', () => {
    const tool = byName('fetch_flux_docs');

    test('exists', () => {
      assert.ok(tool, 'fetch_flux_docs tool must be defined');
    });

    test('has component, layout, search properties (all optional)', () => {
      assert.ok(tool.inputSchema.properties.component);
      assert.ok(tool.inputSchema.properties.layout);
      assert.ok(tool.inputSchema.properties.search);
      assert.strictEqual(tool.inputSchema.required, undefined);
    });

    test('all three params are strings', () => {
      assert.strictEqual(tool.inputSchema.properties.component.type, 'string');
      assert.strictEqual(tool.inputSchema.properties.layout.type, 'string');
      assert.strictEqual(tool.inputSchema.properties.search.type, 'string');
    });
  });

  describe('list_flux_components', () => {
    const tool = byName('list_flux_components');

    test('exists', () => {
      assert.ok(tool);
    });

    test('takes no parameters', () => {
      assert.strictEqual(Object.keys(tool.inputSchema.properties).length, 0);
    });
  });

  describe('list_flux_layouts', () => {
    const tool = byName('list_flux_layouts');

    test('exists', () => {
      assert.ok(tool);
    });

    test('takes no parameters', () => {
      assert.strictEqual(Object.keys(tool.inputSchema.properties).length, 0);
    });
  });

  describe('list_flux_component_icons', () => {
    const tool = byName('list_flux_component_icons');

    test('exists', () => {
      assert.ok(tool);
    });

    test('variant enum is exactly the four supported variants', () => {
      assert.deepStrictEqual(
        tool.inputSchema.properties.variant.enum,
        ['outline', 'solid', 'mini', 'micro']
      );
    });

    test('search property is a string', () => {
      assert.strictEqual(tool.inputSchema.properties.search.type, 'string');
    });
  });
});
