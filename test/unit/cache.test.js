import { describe, test } from 'node:test';
import assert from 'node:assert';

// Simple cache implementation for testing
class SimpleCache {
  constructor(ttlMs = 24 * 60 * 60 * 1000) {
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

describe('SimpleCache', () => {
  test('stores and retrieves data', () => {
    const cache = new SimpleCache();
    const testData = { foo: 'bar' };

    cache.set('test-key', testData);
    const result = cache.get('test-key');

    assert.deepStrictEqual(result, testData);
  });

  test('returns null for non-existent keys', () => {
    const cache = new SimpleCache();
    const result = cache.get('non-existent');

    assert.strictEqual(result, null);
  });

  test('expires entries after TTL', () => {
    const shortTTL = 100; // 100ms
    const cache = new SimpleCache(shortTTL);

    cache.set('test-key', 'test-value');

    // Should exist immediately
    assert.strictEqual(cache.get('test-key'), 'test-value');

    // Wait for expiration
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = cache.get('test-key');
        assert.strictEqual(result, null);
        resolve();
      }, shortTTL + 50);
    });
  });

  test('maintains separate entries for different keys', () => {
    const cache = new SimpleCache();

    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    assert.strictEqual(cache.get('key1'), 'value1');
    assert.strictEqual(cache.get('key2'), 'value2');
  });

  test('clear removes all entries', () => {
    const cache = new SimpleCache();

    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();

    assert.strictEqual(cache.get('key1'), null);
    assert.strictEqual(cache.get('key2'), null);
  });

  test('overwrites existing key with new value', () => {
    const cache = new SimpleCache();

    cache.set('key', 'old-value');
    cache.set('key', 'new-value');

    assert.strictEqual(cache.get('key'), 'new-value');
  });

  test('uses default 24-hour TTL', () => {
    const cache = new SimpleCache();
    const expectedTTL = 24 * 60 * 60 * 1000;

    assert.strictEqual(cache.ttl, expectedTTL);
  });
});
