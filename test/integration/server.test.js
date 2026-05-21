import { describe, test, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { FluxDocumentationServer, SimpleCache } from '../../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const okText = (body) => ({
  ok: true,
  status: 200,
  text: async () => body,
});

const okJson = (body) => ({
  ok: true,
  status: 200,
  json: async () => body,
});

const httpError = (status) => ({
  ok: false,
  status,
  statusText: 'error',
});

const buildServer = (fetchImpl) =>
  new FluxDocumentationServer({ fetch: fetchImpl });

describe('FluxDocumentationServer integration', () => {
  describe('fetchFluxDocs', () => {
    test('returns MCP-shaped response with component documentation', async () => {
      const server = buildServer(mock.fn(async () => okText(componentFixture)));

      const result = await server.fetchFluxDocs('button', undefined, undefined);

      assert.ok(Array.isArray(result.content));
      assert.strictEqual(result.content[0].type, 'text');
      assert.match(result.content[0].text, /Documentation from https:\/\/fluxui\.dev\/components\/button/);
      assert.match(result.content[0].text, /Button/);
    });

    test('targets the layouts URL when layout is provided', async () => {
      const fetchSpy = mock.fn(async () => okText(componentFixture));
      const server = buildServer(fetchSpy);

      await server.fetchFluxDocs(undefined, 'header', undefined);

      assert.strictEqual(fetchSpy.mock.callCount(), 1);
      assert.strictEqual(
        fetchSpy.mock.calls[0].arguments[0],
        'https://fluxui.dev/layouts/header'
      );
    });

    test('serves second identical call from cache (only one fetch)', async () => {
      const fetchSpy = mock.fn(async () => okText(componentFixture));
      const server = buildServer(fetchSpy);

      const first = await server.fetchFluxDocs('button', undefined, undefined);
      const second = await server.fetchFluxDocs('button', undefined, undefined);

      assert.strictEqual(fetchSpy.mock.callCount(), 1);
      assert.deepStrictEqual(second, first);
    });

    test('rejects with descriptive error on HTTP 404', async () => {
      const server = buildServer(mock.fn(async () => httpError(404)));

      await assert.rejects(
        () => server.fetchFluxDocs('nope', undefined, undefined),
        /Failed to fetch documentation:.*404/
      );
    });

    test('rejects with descriptive error on network failure', async () => {
      const server = buildServer(
        mock.fn(async () => {
          throw new Error('boom');
        })
      );

      await assert.rejects(
        () => server.fetchFluxDocs('button', undefined, undefined),
        /Failed to fetch documentation:.*boom/
      );
    });
  });

  describe('listFluxComponents', () => {
    test('parses component links from /docs and returns MCP shape', async () => {
      const server = buildServer(
        mock.fn(async () => okText(componentsListFixture))
      );

      const result = await server.listFluxComponents();

      assert.strictEqual(result.content[0].type, 'text');
      assert.match(result.content[0].text, /Available Flux Components/);
      assert.match(result.content[0].text, /button/);
      assert.match(result.content[0].text, /input/);
      assert.match(result.content[0].text, /modal/);
    });

    test('caches the listing across calls', async () => {
      // listFluxComponents now also fetches /pricing (via getProComponents) for
      // Pro-tier annotation on v2. Both calls are cached via withSingleFlight,
      // so the second call to listFluxComponents triggers zero new fetches.
      const fetchSpy = mock.fn(async () => okText(componentsListFixture));
      const server = buildServer(fetchSpy);

      await server.listFluxComponents();
      const firstCallCount = fetchSpy.mock.callCount();

      await server.listFluxComponents();

      assert.strictEqual(fetchSpy.mock.callCount(), firstCallCount);
    });

    test('rejects on HTTP error', async () => {
      const server = buildServer(mock.fn(async () => httpError(500)));

      await assert.rejects(() => server.listFluxComponents(), /Failed to list components/);
    });
  });

  describe('listFluxLayouts', () => {
    test('fetches the layouts index page', async () => {
      const fetchSpy = mock.fn(async () =>
        okText(
          '<a href="https://fluxui.dev/layouts/header">Header</a>' +
          '<a href="https://fluxui.dev/layouts/sidebar">Sidebar</a>'
        )
      );
      const server = buildServer(fetchSpy);

      const result = await server.listFluxLayouts();

      assert.strictEqual(
        fetchSpy.mock.calls[0].arguments[0],
        'https://fluxui.dev/layouts'
      );
      assert.match(result.content[0].text, /Header/);
      assert.match(result.content[0].text, /Sidebar/);
    });
  });

  describe('listFluxComponentIcons', () => {
    test('fetches all 4 variants when none specified', async () => {
      const fetchSpy = mock.fn(async () => okJson(iconsApiFixture));
      const server = buildServer(fetchSpy);

      const result = await server.listFluxComponentIcons(undefined, undefined);

      assert.strictEqual(fetchSpy.mock.callCount(), 4);
      assert.match(result.content[0].text, /OUTLINE/);
      assert.match(result.content[0].text, /SOLID/);
      assert.match(result.content[0].text, /MINI/);
      assert.match(result.content[0].text, /MICRO/);
    });

    test('fetches only one variant when specified', async () => {
      const fetchSpy = mock.fn(async () => okJson(iconsApiFixture));
      const server = buildServer(fetchSpy);

      await server.listFluxComponentIcons('outline', undefined);

      assert.strictEqual(fetchSpy.mock.callCount(), 1);
      assert.match(
        fetchSpy.mock.calls[0].arguments[0],
        /optimized\/24\/outline$/
      );
    });

    test('search filter narrows icon list', async () => {
      const server = buildServer(mock.fn(async () => okJson(iconsApiFixture)));

      const result = await server.listFluxComponentIcons('outline', 'arrow');

      assert.match(result.content[0].text, /arrow-left/);
      assert.doesNotMatch(result.content[0].text, /academic-cap/);
    });

    test('strips .svg from icon names', async () => {
      const server = buildServer(mock.fn(async () => okJson(iconsApiFixture)));

      const result = await server.listFluxComponentIcons('outline', undefined);

      assert.doesNotMatch(result.content[0].text, /\.svg/);
    });

    test('caches results by (variant, search) combination', async () => {
      const fetchSpy = mock.fn(async () => okJson(iconsApiFixture));
      const server = buildServer(fetchSpy);

      await server.listFluxComponentIcons('outline', undefined);
      await server.listFluxComponentIcons('outline', undefined);

      assert.strictEqual(fetchSpy.mock.callCount(), 1);
    });

    test('rejects on GitHub HTTP error', async () => {
      const server = buildServer(mock.fn(async () => httpError(403)));

      await assert.rejects(
        () => server.listFluxComponentIcons('outline', undefined),
        /Failed to list icons/
      );
    });
  });

  describe('FluxDocumentationServer construction', () => {
    test('exposes a SimpleCache instance', () => {
      const server = buildServer(mock.fn(async () => okText('')));
      assert.ok(server.cache instanceof SimpleCache);
    });

    test('defaults to bundled fetch implementation when none injected', () => {
      const server = new FluxDocumentationServer();
      assert.ok(typeof server.fetch === 'function');
    });
  });
});
