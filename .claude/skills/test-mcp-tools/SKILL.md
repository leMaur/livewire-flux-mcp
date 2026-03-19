---
name: test-mcp-tools
description: Test MCP server tools with stdio transport and validate responses
disable-model-invocation: true
---

Test MCP tools for the Livewire Flux MCP server.

## Workflow

1. **Read index.js** to understand tool schemas and implementation
2. **Create or update test file** in `test/` directory
3. **Test each tool**:
   - `fetch_flux_docs` (with/without component, layout, search)
   - `list_flux_components`
   - `list_flux_layouts`
   - `list_flux_component_icons` (with/without variant, search)
4. **Validate**:
   - Response schema matches tool definition
   - Cache behavior (repeated calls should be faster)
   - Error handling (invalid URLs, network failures)
   - Content parsing accuracy
5. **Run tests** with `npm test`
6. **Show results** and coverage summary

## Test Framework

Use Node.js built-in test runner (no external dependencies needed):

```javascript
import { test, describe } from 'node:test';
import assert from 'node:assert';
```

## Test Categories

### Unit Tests (test/unit/)
- `cache.test.js` - SimpleCache class (TTL, expiration, key generation)
- `tools.test.js` - Tool schema validation and parameter handling

### Integration Tests (test/integration/)
- `server.test.js` - Full server with stdio transport
- `fetch.test.js` - Real HTTP requests (with mocking)

## Cache Testing

Test the SimpleCache class:
- **TTL expiration**: Verify entries expire after 24 hours
- **Key generation**: Ensure unique keys for different params
- **Data persistence**: Get/set operations work correctly
- **Cache hits**: Repeated calls return cached data

## Example Test Structure

```javascript
describe('fetch_flux_docs tool', () => {
  test('fetches component documentation', async () => {
    // Arrange: mock fetch
    // Act: call tool
    // Assert: validate response
  });

  test('caches responses', async () => {
    // First call: slow (network)
    // Second call: fast (cache hit)
  });

  test('handles errors gracefully', async () => {
    // Mock network failure
    // Verify error message format
  });
});
```

## Success Criteria

- All 4 tools have test coverage
- Cache behavior is verified
- Error cases are tested
- Tests run with `npm test`
- No external test dependencies (use Node.js built-in)
