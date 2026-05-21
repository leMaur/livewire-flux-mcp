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

    test('has component, layout, and version properties (all optional)', () => {
      assert.ok(tool.inputSchema.properties.component);
      assert.ok(tool.inputSchema.properties.layout);
      assert.ok(tool.inputSchema.properties.version);
      assert.strictEqual(tool.inputSchema.required, undefined);
    });

    test('component, layout, and version params are strings', () => {
      assert.strictEqual(tool.inputSchema.properties.component.type, 'string');
      assert.strictEqual(tool.inputSchema.properties.layout.type, 'string');
      assert.strictEqual(tool.inputSchema.properties.version.type, 'string');
    });

    test('search property is preserved as a deprecated no-op (semver compat)', () => {
      // Removing the arg outright would be a breaking change for 2.2.x clients.
      // It is accepted-but-ignored at the handler level until 3.0.
      assert.ok(tool.inputSchema.properties.search);
      assert.match(
        tool.inputSchema.properties.search.description,
        /deprecated/i
      );
    });

    test('version enum is exactly v1 and v2', () => {
      assert.deepStrictEqual(
        tool.inputSchema.properties.version.enum,
        ['v1', 'v2']
      );
    });
  });

  describe('list_flux_components', () => {
    const tool = byName('list_flux_components');

    test('exists', () => {
      assert.ok(tool);
    });

    test('has version and tier properties', () => {
      assert.ok(tool.inputSchema.properties.version);
      assert.ok(tool.inputSchema.properties.tier);
    });

    test('tier enum is exactly free, pro, all', () => {
      assert.deepStrictEqual(
        tool.inputSchema.properties.tier.enum,
        ['free', 'pro', 'all']
      );
    });
  });

  describe('list_flux_layouts', () => {
    const tool = byName('list_flux_layouts');

    test('exists', () => {
      assert.ok(tool);
    });

    test('has a version property', () => {
      assert.ok(tool.inputSchema.properties.version);
      assert.deepStrictEqual(
        tool.inputSchema.properties.version.enum,
        ['v1', 'v2']
      );
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
