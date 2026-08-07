# Changelog

All notable changes to `livewire-flux-mcp` will be documented in this file.

## 2.3.4 - 2026-08-07

### What's Changed

* docs: update CHANGELOG for 2.3.3 by @github-actions[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/57
* chore(deps-dev): Bump npm-check-updates from 22.2.0 to 22.2.1 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/58
* chore(deps): Bump hono from 4.12.18 to 4.12.23 in the npm_and_yarn group across 1 directory by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/59
* chore(deps): Bump actions/checkout from 6.0.2 to 6.0.3 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/60
* chore(deps-dev): Bump npm-check-updates from 22.2.1 to 22.2.2 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/61
* chore(deps): Bump lewagon/wait-on-check-action from 1.7.0 to 1.8.0 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/62
* chore(deps-dev): Bump npm-check-updates from 22.2.2 to 22.2.3 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/63
* ci: set persist-credentials: false on checkout steps by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/64
* chore(deps): Bump the npm_and_yarn group across 1 directory with 2 updates by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/65
* chore(deps): Bump actions/checkout from 6.0.3 to 7.0.0 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/66
* chore(deps-dev): Bump npm-check-updates from 22.2.3 to 22.2.7 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/67
* chore(deps): Bump lewagon/wait-on-check-action from 1.8.0 to 1.8.1 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/68
* chore(deps): Bump body-parser from 2.2.2 to 2.3.0 in the npm_and_yarn group across 1 directory by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/71
* chore(deps): Bump the npm_and_yarn group across 1 directory with 2 updates by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/72
* chore(deps): Bump actions/checkout from 7.0.0 to 7.0.1 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/73
* chore(deps): Bump @modelcontextprotocol/sdk from 1.29.0 to 1.30.0 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/74
* chore(deps): Bump ip-address from 10.2.0 to 10.4.0 in the npm_and_yarn group across 1 directory by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/75
* fix: source layout names from the site nav when /layouts 404s by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/76
* docs: add per-agent MCP setup instructions by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/77
* feat: ship Flux AI guideline, skill and subagent with an installer by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/78

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.3.3...2.3.4

## 2.3.3 - 2026-05-25

### What's Changed

* docs: update CHANGELOG for 2.3.2 by @github-actions[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/55
* chore(deps): Bump qs from 6.15.1 to 6.15.2 in the npm_and_yarn group across 1 directory by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/56

### New Contributors

* @github-actions[bot] made their first contribution in https://github.com/leMaur/livewire-flux-mcp/pull/55

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.3.2...2.3.3

## 2.3.2 - 2026-05-22

### What's Changed

* chore(deps): Bump peter-evans/create-pull-request from 7.0.11 to 8.1.1 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/54
* chore(deps): Bump lewagon/wait-on-check-action from 1.3.4 to 1.7.0 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/53

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.3.1...2.3.2

## 2.3.1 - 2026-05-21

Republishes the v2.3.0 contents to npm. The v2.3.0 release (cut earlier today) merged cleanly but the Publish workflow failed at the `Update package version` step: that step ran `npm version 2.3.0 --no-git-tag-version`, and npm exits 1 with `Version not changed` when the value is unchanged. The 2.3.0 PR had pre-bumped `package.json` to `2.3.0`, so the bump-to-same-value tripped the gate and v2.3.0 never reached npm. The v2.3.0 tag is permanently burned by GitHub's Immutable Releases (same surface that burned v2.2.0).

### Fixed

* Publish workflow's `Update package version` step is now idempotent — it reads the current `package.json` version, compares it to the tag, and only invokes `npm version` on mismatch. Future contributors can pre-bump `package.json` in a PR without breaking the publish gate.

### Changed

* `package.json` version field aligned with the workflow's tag-driven contract (no longer pre-bumped in feature PRs).

## 2.3.0 - 2026-05-21

### Added

* `version` argument on `fetch_flux_docs`, `list_flux_components`, and `list_flux_layouts` (`'v1' | 'v2'`, default `'v2'`). `v2` preserves current behavior against `fluxui.dev`; `v1` routes to the legacy `v1.fluxui.dev` host.
* `tier` argument on `list_flux_components` (`'free' | 'pro' | 'all'`, default `'all'`). Filters the listing by paid tier. On v1, the argument is ignored because Flux v1 had no Pro tier.
* Pro-component notice prepended to `fetch_flux_docs` output when the fetched page is a paid Flux component (detected via the literal `Flux Pro component` marker on the page).
* Graceful `Flux layouts are not available in v1` response on `list_flux_layouts` when `version='v1'`; no HTTP request is made in that case.

### Changed

* `list_flux_components` now fetches `/components` instead of `/docs` — more direct, fewer hops.
* SSRF allowlist on the documentation fetcher widened to `fluxui.dev` + `v1.fluxui.dev`. The Heroicons GitHub allowlist is unchanged.

### Deprecated

* `search` parameter on `fetch_flux_docs` — kept in the schema for backward compatibility with 2.2.x callers but accepted-and-ignored at the handler level. The previous line-based filter returned incoherent fragments; downstream LLMs filter the full document better at the consumer end. Scheduled for removal in 3.0.

## 2.2.1 - 2026-05-20

### What's Changed

* security: land 11 of 14 pentest findings (CRITICAL F-INJECT1 + 10 others) by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/47
* security: close remaining 3 pentest findings (F-SSRF1 F-DOS2 F-INFO1) by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/48
* ci: open PR instead of direct push for CHANGELOG updates by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/49

#### Note on versioning

Supersedes the failed `v2.2.0` release (the publish workflow was blocked by `Publishing`-environment policy that excluded tag refs, and the changelog workflow was blocked by `main` branch protection forbidding direct pushes). Both root causes are fixed: env policy now accepts tag refs via custom branch policies (`v*`, `[0-9]*.[0-9]*.[0-9]*`); changelog workflow now opens a PR via `peter-evans/create-pull-request@v7`. F-SC1 required-reviewer + F-SC4 branch protection both preserved.

The published package payload is byte-identical to what `v2.2.0` was supposed to ship (the `.github/` workflow change is not part of the npm tarball).

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.18...2.2.1

## 2.1.18 - 2026-05-20

### What's Changed

* chore(deps): Bump hono from 4.12.12 to 4.12.14 in the npm_and_yarn group across 1 directory by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/39
* chore(deps): Bump npm-check-updates from 20.0.0 to 20.0.2 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/40
* chore(deps): Bump dependabot/fetch-metadata from 3.0.0 to 3.1.0 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/41
* chore(deps): Bump hono from 4.12.14 to 4.12.18 in the npm_and_yarn group across 1 directory by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/42
* chore(deps): Bump fast-uri from 3.1.0 to 3.1.2 in the npm_and_yarn group across 1 directory by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/43
* test+ci: real tests against index.js, gated by new Test workflow by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/44
* deps: drop node-fetch, move npm-check-updates to dev, declare engines by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/45
* harden: timeout + User-Agent + optional GITHUB_TOKEN + isError on errors by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/46

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.17...2.1.18

## 2.1.17 - 2026-04-09

### What's Changed

* fix: resolve CodeQL incomplete-url-substring-sanitization alerts by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/33
* chore(deps): Bump @modelcontextprotocol/sdk from 1.27.1 to 1.28.0 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/36
* chore(deps): Bump @modelcontextprotocol/sdk from 1.28.0 to 1.29.0 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/38
* chore(deps): Bump dependabot/fetch-metadata from 2.5.0 to 3.0.0 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/34

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.16...2.1.17

## 2.1.16 - 2026-03-19

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.15...2.1.16

## 2.1.15 - 2026-03-19

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.14...2.1.15

## 2.1.14 - 2026-03-06

### What's Changed

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.13...2.1.14

## 2.1.13 - 2026-03-02

### What's Changed

* chore(deps): Bump @modelcontextprotocol/sdk from 1.26.0 to 1.27.1 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/28
* chore(deps): Bump npm-check-updates from 19.4.1 to 19.6.2 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/29
* chore(deps): Bump hono from 4.12.1 to 4.12.2 in the npm_and_yarn group across 1 directory by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/27

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.12...2.1.13

## 2.1.12 - 2026-02-22

### What's Changed

* chore(deps): Bump npm-check-updates from 19.3.2 to 19.4.1 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/25
* chore(deps): Bump the npm_and_yarn group across 1 directory with 2 updates by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/26

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.11...2.1.12

## 2.1.11 - 2026-02-15

### What's Changed

* chore(deps): Bump qs from 6.14.1 to 6.14.2 in the npm_and_yarn group across 1 directory by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/23

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.10...2.1.11

## 2.1.10 - 2026-02-05

### What's Changed

* chore(deps): Bump hono from 4.11.4 to 4.11.7 in the npm_and_yarn group across 1 directory by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/20
* chore(deps): Bump npm-check-updates from 19.3.1 to 19.3.2 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/21

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.9...2.1.10

## 2.1.9 - 2026-01-24

### What's Changed

* chore(deps): Bump @modelcontextprotocol/sdk from 1.25.2 to 1.25.3 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/19

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.8...2.1.9

## 2.1.8 - 2026-01-24

### What's Changed

* chore(deps): Bump @modelcontextprotocol/sdk from 1.25.2 to 1.25.3 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/19

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.7...2.1.8

## 2.1.7 - 2026-01-14

### What's Changed

* chore(deps): Bump dependabot/fetch-metadata from 2.4.0 to 2.5.0 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/17
* chore(deps): Bump hono from 4.11.3 to 4.11.4 in the npm_and_yarn group across 1 directory by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/18

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.6...2.1.7

## 2.1.6 - 2026-01-08

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.5...2.1.6

## 2.1.5 - 2026-01-06

### What's Changed

* chore(deps): Bump stefanzweifel/git-auto-commit-action from 6 to 7 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/8
* chore(deps): Bump actions/setup-node from 5 to 6 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/9
* chore(deps): Bump actions/checkout from 5 to 6 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/10
* chore(deps): Bump @modelcontextprotocol/sdk from 0.4.0 to 1.24.0 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/11
* Update GitHub Actions workflow for publishing package by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/12
* Implement OIDC authentication for npm publishing by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/13
* Refactor publish workflow to remove OIDC steps by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/14

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.4...2.1.5

## 2.1.4 - 2025-12-03

### What's Changed

* Refactor publish workflow to remove OIDC steps by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/14

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.3...2.1.4

## 2.1.3 - 2025-12-03

### What's Changed

* Implement OIDC authentication for npm publishing by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/13

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.2...2.1.3

## 2.1.2 - 2025-12-03

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.1...2.1.2

## 2.1.1 - 2025-12-03

### What's Changed

* Update GitHub Actions workflow for publishing package by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/12

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.1.0...2.1.1

## 2.1.0 - 2025-12-03

### What's Changed

* chore(deps): Bump stefanzweifel/git-auto-commit-action from 6 to 7 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/8
* chore(deps): Bump actions/setup-node from 5 to 6 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/9
* chore(deps): Bump actions/checkout from 5 to 6 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/10
* chore(deps): Bump @modelcontextprotocol/sdk from 0.4.0 to 1.24.0 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/11

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.0.1...2.1.0

## 2.0.1 - 2025-09-10

### What's changed

* chore: Update publish workflow to adjust npm versioning and publishing (93897738) — by Maurizio

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/2.0.0...2.0.1

## 2.0.0 - 2025-09-10

### What's Changed

* feat: Add support for Flux layout documentation and tools (3839ed2) — by Maurizio
* chore: Add `package-lock.json` for dependency management (ae25178) — by Maurizio
* chore: Remove Docker support and related assets (24f1c7e) — by Maurizio
* chore: Update project version and improve usage documentation (1905499) — by Maurizio
* chore: Update package.json metadata for consistency (1ba9344) — by Maurizio
* chore: Add GitHub Actions workflow for package publishing (15504c9) — by Maurizio
* chore: Update README badges and add additional project info (cd3af62) — by Maurizio
* chore: Add contribution and security guidelines, update README (531b18b) — by Maurizio

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/1.1.1...2.0.0

## 1.1.1 - 2025-08-02

### What's Changed

* Add Heroicons information to flux icon component documentation by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/5

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/1.1.0...1.1.1

## 1.1.0 - 2025-08-02

### What's Changed

* Update MCP server to use components URL structure and enhance reference section support by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/1
* Add changelog with GitHub releases and project templates by @leMaur in https://github.com/leMaur/livewire-flux-mcp/pull/2
* Bump dependabot/fetch-metadata from 2.0.0 to 2.4.0 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/4
* Bump stefanzweifel/git-auto-commit-action from 5 to 6 by @dependabot[bot] in https://github.com/leMaur/livewire-flux-mcp/pull/3

### New Contributors

* @leMaur made their first contribution in https://github.com/leMaur/livewire-flux-mcp/pull/1
* @dependabot[bot] made their first contribution in https://github.com/leMaur/livewire-flux-mcp/pull/4

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/1.0.1...1.1.0

## [1.0.1] - 2025-08-01

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/compare/1.0.0...1.0.1

## [1.0.0] - 2025-08-01

Initial release

**Full Changelog**: https://github.com/leMaur/livewire-flux-mcp/commits/1.0.0
