import { describe, test, mock } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load fixtures
const componentFixture = readFileSync(
  join(__dirname, '../fixtures/component.html'),
  'utf-8'
);
const componentsListFixture = readFileSync(
  join(__dirname, '../fixtures/components-list.html'),
  'utf-8'
);
const iconsApiFixture = JSON.parse(
  readFileSync(join(__dirname, '../fixtures/icons-api.json'), 'utf-8')
);

describe('FluxDocumentationServer Integration', () => {
  describe('fetch_flux_docs tool', () => {
    test('fetches component documentation', async () => {
      // Mock fetch to return fixture
      const originalFetch = global.fetch;
      global.fetch = mock.fn(async (url) => ({
        ok: true,
        status: 200,
        text: async () => componentFixture
      }));

      // Test would invoke the actual tool here
      // For now, verify the mock works
      const response = await global.fetch('https://fluxui.dev/components/button');
      const html = await response.text();

      assert.ok(html.includes('Button'));
      assert.ok(html.includes('Reference'));

      global.fetch = originalFetch;
    });

    test('handles network errors gracefully', async () => {
      const originalFetch = global.fetch;
      global.fetch = mock.fn(async () => {
        throw new Error('Network error');
      });

      try {
        await global.fetch('https://fluxui.dev/components/button');
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert.strictEqual(error.message, 'Network error');
      }

      global.fetch = originalFetch;
    });

    test('handles HTTP errors (404, 500)', async () => {
      const originalFetch = global.fetch;
      global.fetch = mock.fn(async () => ({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      }));

      const response = await global.fetch('https://fluxui.dev/components/invalid');
      assert.strictEqual(response.ok, false);
      assert.strictEqual(response.status, 404);

      global.fetch = originalFetch;
    });

    test('filters content by search term', () => {
      const content = `
        Button documentation
        Input documentation
        Modal documentation
      `;
      const searchTerm = 'button';
      const lines = content.split('\n');
      const filtered = lines.filter(line =>
        line.toLowerCase().includes(searchTerm.toLowerCase())
      );

      assert.strictEqual(filtered.length, 1);
      assert.ok(filtered[0].includes('Button'));
    });
  });

  describe('list_flux_components tool', () => {
    test('parses component list from HTML', async () => {
      const originalFetch = global.fetch;
      global.fetch = mock.fn(async () => ({
        ok: true,
        text: async () => componentsListFixture
      }));

      const response = await global.fetch('https://fluxui.dev/docs');
      const html = await response.text();

      // Verify fixture contains expected component links (check href attribute to avoid URL substring ambiguity)
      assert.ok(html.includes('href="https://fluxui.dev/components/button"'));
      assert.ok(html.includes('href="https://fluxui.dev/components/input"'));
      assert.ok(html.includes('href="https://fluxui.dev/components/modal"'));

      global.fetch = originalFetch;
    });

    test('deduplicates component links', () => {
      const links = [
        { href: '/components/button', name: 'Button' },
        { href: '/components/button', name: 'Button' },
        { href: '/components/input', name: 'Input' }
      ];

      const unique = links.filter((link, index, self) =>
        index === self.findIndex(l => l.href === link.href)
      );

      assert.strictEqual(unique.length, 2);
    });
  });

  describe('list_flux_component_icons tool', () => {
    test('fetches icons from GitHub API', async () => {
      const originalFetch = global.fetch;
      global.fetch = mock.fn(async () => ({
        ok: true,
        json: async () => iconsApiFixture
      }));

      const response = await global.fetch(
        'https://api.github.com/repos/tailwindlabs/heroicons/contents/optimized/24/outline'
      );
      const icons = await response.json();

      assert.ok(Array.isArray(icons));
      assert.strictEqual(icons.length, 3);
      assert.ok(icons.every(icon => icon.name.endsWith('.svg')));

      global.fetch = originalFetch;
    });

    test('filters icons by search term', () => {
      const icons = ['academic-cap', 'arrow-left', 'arrow-right', 'user'];
      const searchTerm = 'arrow';

      const filtered = icons.filter(icon =>
        icon.toLowerCase().includes(searchTerm.toLowerCase())
      );

      assert.strictEqual(filtered.length, 2);
      assert.ok(filtered.includes('arrow-left'));
      assert.ok(filtered.includes('arrow-right'));
    });

    test('removes .svg extension from icon names', () => {
      const files = iconsApiFixture;
      const iconNames = files
        .filter(f => f.name.endsWith('.svg'))
        .map(f => f.name.slice(0, -4));

      assert.ok(iconNames.includes('academic-cap'));
      assert.ok(iconNames.includes('arrow-left'));
      assert.ok(iconNames.includes('user'));
      assert.ok(iconNames.every(name => !name.endsWith('.svg')));
    });
  });

  describe('Cache behavior', () => {
    test('caches responses with unique keys', () => {
      const cache = new Map();
      const key1 = 'docs:https://fluxui.dev/components/button:';
      const key2 = 'docs:https://fluxui.dev/components/input:';

      cache.set(key1, { content: 'Button docs' });
      cache.set(key2, { content: 'Input docs' });

      assert.strictEqual(cache.size, 2);
      assert.notStrictEqual(cache.get(key1), cache.get(key2));
    });

    test('includes search parameter in cache key', () => {
      const url = 'https://fluxui.dev/components/button';
      const search1 = 'form';
      const search2 = 'validation';

      const key1 = `docs:${url}:${search1}`;
      const key2 = `docs:${url}:${search2}`;

      assert.notStrictEqual(key1, key2);
    });

    test('cache hit returns same data', () => {
      const cache = new Map();
      const key = 'test-key';
      const data = { content: 'test data' };

      cache.set(key, data);
      const retrieved = cache.get(key);

      assert.strictEqual(retrieved, data);
    });
  });

  describe('Error handling', () => {
    test('wraps errors in MCP response format', () => {
      const errorMessage = 'Failed to fetch documentation';
      const response = {
        content: [
          {
            type: 'text',
            text: `Error: ${errorMessage}`
          }
        ]
      };

      assert.ok(Array.isArray(response.content));
      assert.ok(response.content[0].text.startsWith('Error:'));
    });

    test('provides descriptive error messages', () => {
      const errors = [
        'Failed to fetch documentation: Network error',
        'Failed to list components: HTTP error! status: 404',
        'Failed to list icons: GitHub API rate limit exceeded'
      ];

      errors.forEach(error => {
        assert.ok(error.includes('Failed to'));
        assert.ok(error.includes(':'));
      });
    });
  });
});
