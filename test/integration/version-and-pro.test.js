import { describe, test, mock } from 'node:test';
import assert from 'node:assert';
import {
  FluxDocumentationServer,
  getBaseUrl,
} from '../../index.js';

const okText = (body) => ({
  ok: true,
  status: 200,
  text: async () => body,
});

const buildServer = (fetchImpl) =>
  new FluxDocumentationServer({ fetch: fetchImpl });

// Minimal HTML fixtures inlined so this file is self-contained.
const componentsListHtmlV2 =
  '<!doctype html><html><body><nav>' +
  '<a href="/components/button">Button</a>' +
  '<a href="/components/chart">Chart</a>' +
  '</nav></body></html>';

const pricingHtmlMentioningChart =
  '<!doctype html><html><body>' +
  '<main>Pro components include Chart, Editor, Kanban.</main>' +
  '</body></html>';

const proComponentHtml =
  '<!doctype html><html><body>' +
  '<main>This component is only available in the Pro version of Flux. ' +
  'Flux Pro component documentation here.</main>' +
  '</body></html>';

const freeComponentHtml =
  '<!doctype html><html><body>' +
  '<main>Documentation for the Button component (free tier).</main>' +
  '</body></html>';

describe('getBaseUrl', () => {
  test('returns the v1 host when version="v1"', () => {
    assert.strictEqual(getBaseUrl('v1'), 'https://v1.fluxui.dev');
  });

  test('returns the v2 host when version="v2"', () => {
    assert.strictEqual(getBaseUrl('v2'), 'https://fluxui.dev');
  });

  test('defaults to the v2 host when version is undefined', () => {
    assert.strictEqual(getBaseUrl(undefined), 'https://fluxui.dev');
  });
});

describe('version routing', () => {
  test('fetchFluxDocs("button", undefined, "v1") targets the v1 host', async () => {
    const fetchSpy = mock.fn(async () => okText(freeComponentHtml));
    const server = buildServer(fetchSpy);

    await server.fetchFluxDocs('button', undefined, 'v1');

    assert.strictEqual(fetchSpy.mock.callCount(), 1);
    const url = fetchSpy.mock.calls[0].arguments[0];
    // Trailing slash ensures we match the host exactly, not "v1.fluxui.dev.attacker.com"
    // (CodeQL js/incomplete-url-substring-sanitization).
    assert.ok(
      url.startsWith('https://v1.fluxui.dev/'),
      `expected v1 host, got ${url}`
    );
  });

  test('listFluxLayouts("v1") returns the not-available message without fetching', async () => {
    const fetchSpy = mock.fn(async () => okText('<html></html>'));
    const server = buildServer(fetchSpy);

    const result = await server.listFluxLayouts('v1');

    assert.strictEqual(fetchSpy.mock.callCount(), 0);
    assert.match(
      result.content[0].text,
      /layouts are not available in v1/i
    );
  });
});

describe('tier filtering on listFluxComponents', () => {
  // Build a fetch impl that serves /components from one fixture and /pricing
  // from another, so listFluxComponents + getProComponents can both succeed.
  const tieredFetch = () =>
    mock.fn(async (url) => {
      if (url.endsWith('/pricing')) {
        return okText(pricingHtmlMentioningChart);
      }
      if (url.endsWith('/components')) {
        return okText(componentsListHtmlV2);
      }
      throw new Error(`unexpected fetch url in test: ${url}`);
    });

  test('tier="free" excludes Pro components and keeps free ones', async () => {
    const server = buildServer(tieredFetch());

    const result = await server.listFluxComponents('v2', 'free');
    const text = result.content[0].text;

    assert.match(text, /button/i);
    assert.doesNotMatch(text, /chart/i);
  });

  test('tier="pro" keeps Pro components and excludes free ones', async () => {
    const server = buildServer(tieredFetch());

    const result = await server.listFluxComponents('v2', 'pro');
    const text = result.content[0].text;

    assert.match(text, /chart/i);
    assert.doesNotMatch(text, /button/i);
  });

  test('v1 does not leak [Pro]/[Free] annotations or call /pricing', async () => {
    // v1 had no Pro tier. The listing must not annotate, the tier arg is
    // ignored, and /pricing must never be fetched on v1.
    const fetchSpy = mock.fn(async (url) => {
      if (url.endsWith('/pricing')) {
        throw new Error('v1 must NEVER fetch /pricing');
      }
      return okText(componentsListHtmlV2);
    });
    const server = buildServer(fetchSpy);

    const result = await server.listFluxComponents('v1', 'pro');
    const text = result.content[0].text;

    assert.doesNotMatch(text, /\[Pro\]/);
    assert.doesNotMatch(text, /\[Free\]/);
    assert.match(text, /not applicable on v1/i);
    // Sanity: at most one fetch (the /components index), zero to /pricing.
    const pricingCalls = fetchSpy.mock.calls.filter((c) =>
      String(c.arguments[0]).endsWith('/pricing')
    );
    assert.strictEqual(pricingCalls.length, 0);
  });
});

describe('Pro-component notice on fetchFluxDocs', () => {
  test('prepends [NOTICE] when the page contains "Flux Pro component"', async () => {
    const server = buildServer(mock.fn(async () => okText(proComponentHtml)));

    const result = await server.fetchFluxDocs('chart', undefined, 'v2');
    const text = result.content[0].text;

    assert.ok(
      text.startsWith('[NOTICE]'),
      `expected text to start with [NOTICE], got: ${text.slice(0, 60)}`
    );
    assert.match(text, /Pro component/);
  });

  test('does not prepend [NOTICE] when the page is free', async () => {
    const server = buildServer(mock.fn(async () => okText(freeComponentHtml)));

    const result = await server.fetchFluxDocs('button', undefined, 'v2');
    const text = result.content[0].text;

    assert.doesNotMatch(text, /\[NOTICE\]/);
  });
});

describe('getProComponents fallback', () => {
  test('returns the hardcoded fallback Set when the fetch throws', async () => {
    const server = buildServer(
      mock.fn(async () => {
        throw new Error('network down');
      })
    );

    const result = await server.getProComponents();

    assert.ok(result instanceof Set);
    assert.ok(result.has('chart'), 'expected fallback to include "chart"');
    assert.ok(result.has('editor'), 'expected fallback to include "editor"');
    assert.ok(result.has('kanban'), 'expected fallback to include "kanban"');
  });
});
