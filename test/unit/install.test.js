import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseInstallArgs,
  detectFluxEdition,
  findVendorGuideline,
  composeGuideline,
  planInstall,
  runInstall,
  GUIDELINE_MARKER_BEGIN,
  GUIDELINE_MARKER_END,
  MANAGED_MARKER,
} from '../../install.js';

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const SKILL_DEST = join('.ai', 'skills', 'fluxui-development', 'SKILL.md');
const PRO_GUIDELINE_DEST = join('.ai', 'guidelines', 'fluxui-pro', 'core.blade.php');
const FREE_GUIDELINE_DEST = join('.ai', 'guidelines', 'fluxui-free', 'core.blade.php');
const AGENT_DEST = join('.claude', 'agents', 'flux-ui-builder.md');

let projectDir;
const silent = () => {};

function write(relPath, contents) {
  const full = join(projectDir, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents, 'utf-8');
  return full;
}

function read(relPath) {
  return readFileSync(join(projectDir, relPath), 'utf-8');
}

function composerWith(packages) {
  return JSON.stringify({ require: packages }, null, 2);
}

beforeEach(() => {
  projectDir = mkdtempSync(join(tmpdir(), 'flux-mcp-install-'));
});

afterEach(() => {
  rmSync(projectDir, { recursive: true, force: true });
});

describe('shipped artifacts', () => {
  // The override is keyed on the frontmatter `name`. If this string ever drifts, Boost's
  // bundled fluxui-development skill silently wins again and the MCP server is bypassed.
  test('skill frontmatter name is exactly fluxui-development', () => {
    const skill = readFileSync(
      join(PACKAGE_ROOT, 'resources', 'boost', 'skills', 'fluxui-development', 'SKILL.md'),
      'utf-8'
    );

    const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/);
    assert.ok(frontmatter, 'SKILL.md must start with YAML frontmatter');

    const name = frontmatter[1].match(/^name:\s*(.+)$/m);
    assert.ok(name, 'frontmatter must declare a name');
    assert.strictEqual(name[1].trim(), 'fluxui-development');
  });

  test('skill and subagent carry the managed marker', () => {
    for (const relPath of [
      join('resources', 'boost', 'skills', 'fluxui-development', 'SKILL.md'),
      join('resources', 'agents', 'flux-ui-builder.md'),
    ]) {
      const contents = readFileSync(join(PACKAGE_ROOT, relPath), 'utf-8');
      assert.ok(contents.includes(MANAGED_MARKER), `${relPath} must include the managed marker`);
    }
  });

  test('subagent declares Claude Code frontmatter', () => {
    const agent = readFileSync(join(PACKAGE_ROOT, 'resources', 'agents', 'flux-ui-builder.md'), 'utf-8');
    const frontmatter = agent.match(/^---\n([\s\S]*?)\n---/);

    assert.ok(frontmatter, 'subagent must start with YAML frontmatter');
    assert.match(frontmatter[1], /^name:\s*flux-ui-builder$/m);
    assert.match(frontmatter[1], /^description:\s*\S/m);
  });
});

describe('parseInstallArgs', () => {
  test('reads flags and both --path forms', () => {
    assert.deepStrictEqual(parseInstallArgs(['--path', '/tmp/x', '--dry-run', '--force']), {
      path: '/tmp/x',
      boost: false,
      claude: false,
      dryRun: true,
      force: true,
      help: false,
      unknown: [],
      errors: [],
    });

    assert.strictEqual(parseInstallArgs(['--path=/tmp/y']).path, '/tmp/y');
    assert.strictEqual(parseInstallArgs(['--boost']).boost, true);
    assert.strictEqual(parseInstallArgs(['--claude']).claude, true);
    assert.strictEqual(parseInstallArgs(['-h']).help, true);
  });

  test('collects unknown options instead of throwing', () => {
    assert.deepStrictEqual(parseInstallArgs(['--nope']).unknown, ['--nope']);
  });

  // Without this guard `--path --dry-run` installs for real into a directory named
  // "--dry-run", which is the worst possible reading of a dry run.
  test('refuses to let --path swallow the following flag', () => {
    const swallowed = parseInstallArgs(['--path', '--dry-run']);

    assert.strictEqual(swallowed.path, null);
    assert.strictEqual(swallowed.dryRun, true);
    assert.strictEqual(swallowed.errors.length, 1);

    assert.strictEqual(parseInstallArgs(['--path']).errors.length, 1);
    assert.strictEqual(parseInstallArgs(['--path=']).errors.length, 1);
  });
});

describe('detectFluxEdition', () => {
  test('maps livewire/flux-pro to fluxui-pro', () => {
    write('composer.json', composerWith({ 'livewire/flux-pro': '^2.0' }));
    assert.strictEqual(detectFluxEdition(projectDir), 'fluxui-pro');
  });

  test('maps livewire/flux to fluxui-free', () => {
    write('composer.json', composerWith({ 'livewire/flux': '^2.0' }));
    assert.strictEqual(detectFluxEdition(projectDir), 'fluxui-free');
  });

  test('prefers pro when both are required, matching Boost precedence', () => {
    write('composer.json', composerWith({ 'livewire/flux': '^2.0', 'livewire/flux-pro': '^2.0' }));
    assert.strictEqual(detectFluxEdition(projectDir), 'fluxui-pro');
  });

  test('finds packages declared in require-dev', () => {
    write('composer.json', JSON.stringify({ 'require-dev': { 'livewire/flux': '^2.0' } }));
    assert.strictEqual(detectFluxEdition(projectDir), 'fluxui-free');
  });

  test('returns null with no composer.json, no flux, or unreadable json', () => {
    assert.strictEqual(detectFluxEdition(projectDir), null);

    write('composer.json', composerWith({ 'laravel/framework': '^13.0' }));
    assert.strictEqual(detectFluxEdition(projectDir), null);

    write('composer.json', '{ not json');
    assert.strictEqual(detectFluxEdition(projectDir), null);
  });
});

describe('findVendorGuideline', () => {
  test('finds the blade guideline shipped inside the flux package', () => {
    write(join('vendor', 'livewire', 'flux-pro', 'resources', 'boost', 'guidelines', 'core.blade.php'), 'FLUX OWN');
    const found = findVendorGuideline(projectDir, 'fluxui-pro');

    assert.ok(found);
    assert.strictEqual(found.content, 'FLUX OWN');
  });

  test('falls back to the markdown extension', () => {
    write(join('vendor', 'livewire', 'flux', 'resources', 'boost', 'guidelines', 'core.md'), 'FREE OWN');
    assert.strictEqual(findVendorGuideline(projectDir, 'fluxui-free').content, 'FREE OWN');
  });

  test('returns null when the package ships none', () => {
    assert.strictEqual(findVendorGuideline(projectDir, 'fluxui-pro'), null);
  });
});

describe('composeGuideline', () => {
  test('wraps our block in markers', () => {
    const result = composeGuideline('OUR BLOCK');

    assert.ok(result.startsWith(GUIDELINE_MARKER_BEGIN));
    assert.ok(result.includes('OUR BLOCK'));
    assert.ok(result.includes(GUIDELINE_MARKER_END));
  });

  test('keeps existing content below our block', () => {
    const result = composeGuideline('OUR BLOCK', 'THEIR CONTENT');

    assert.ok(result.includes('THEIR CONTENT'));
    assert.ok(result.indexOf('OUR BLOCK') < result.indexOf('THEIR CONTENT'));
  });

  test('replaces a previous block rather than stacking them', () => {
    const first = composeGuideline('BLOCK V1', 'THEIR CONTENT');
    const second = composeGuideline('BLOCK V2', first);

    assert.ok(!second.includes('BLOCK V1'));
    assert.ok(second.includes('BLOCK V2'));
    assert.ok(second.includes('THEIR CONTENT'));
    assert.strictEqual(second.split(GUIDELINE_MARKER_BEGIN).length - 1, 1);
  });

  test('is idempotent', () => {
    const once = composeGuideline('OUR BLOCK', 'THEIR CONTENT');
    assert.strictEqual(composeGuideline('OUR BLOCK', once), once);
  });

  test('replaces the block in place, preserving surrounding bytes exactly', () => {
    const existing = `ABOVE\n\n${GUIDELINE_MARKER_BEGIN}\nOLD\n${GUIDELINE_MARKER_END}\n\nBELOW\n`;
    const result = composeGuideline('NEW', existing);

    assert.ok(result.startsWith('ABOVE\n\n'), 'content above the block must keep its position');
    assert.ok(result.endsWith('\n\nBELOW\n'), 'content below the block must keep its trailing bytes');
    assert.ok(result.includes('NEW'));
    assert.ok(!result.includes('OLD'));
  });

  // Ambiguous markers mean we cannot tell which span is ours — deleting the wrong one
  // would silently destroy user content.
  test('refuses malformed, duplicated or out-of-order markers', () => {
    const duplicated = `${GUIDELINE_MARKER_BEGIN}\nA\n${GUIDELINE_MARKER_END}\n${GUIDELINE_MARKER_BEGIN}\nB\n${GUIDELINE_MARKER_END}`;
    const partial = `${GUIDELINE_MARKER_BEGIN}\nA\n`;
    const reversed = `${GUIDELINE_MARKER_END}\nA\n${GUIDELINE_MARKER_BEGIN}`;

    for (const broken of [duplicated, partial, reversed]) {
      assert.throws(() => composeGuideline('NEW', broken), /malformed/);
    }
  });

  test('--force resolves malformed markers by replacing the whole span', () => {
    const duplicated = `${GUIDELINE_MARKER_BEGIN}\nA\n${GUIDELINE_MARKER_END}\n${GUIDELINE_MARKER_BEGIN}\nB\n${GUIDELINE_MARKER_END}`;
    const result = composeGuideline('NEW', duplicated, { force: true });

    assert.strictEqual(result.split(GUIDELINE_MARKER_BEGIN).length - 1, 1);
    assert.ok(!result.includes('\nA\n') && !result.includes('\nB\n'));
  });
});

describe('planInstall target selection', () => {
  test('composer.json alone selects boost only', () => {
    write('composer.json', composerWith({ 'livewire/flux': '^2.0' }));
    const plan = planInstall({ path: projectDir });

    assert.strictEqual(plan.boost, true);
    assert.strictEqual(plan.claude, false);
  });

  test('.claude/ alone selects the subagent too', () => {
    mkdirSync(join(projectDir, '.claude'), { recursive: true });
    const plan = planInstall({ path: projectDir });

    assert.strictEqual(plan.claude, true);
  });

  test('explicit --claude suppresses boost autodetection', () => {
    write('composer.json', composerWith({ 'livewire/flux': '^2.0' }));
    const plan = planInstall({ path: projectDir, claude: true });

    assert.strictEqual(plan.boost, false);
    assert.strictEqual(plan.claude, true);
  });

  test('an unrecognised directory still gets the boost artifacts', () => {
    const plan = planInstall({ path: projectDir });
    assert.strictEqual(plan.boost, true);
  });
});

describe('runInstall', () => {
  test('installs skill and pro guideline for a flux-pro project', () => {
    write('composer.json', composerWith({ 'livewire/flux-pro': '^2.0' }));

    const code = runInstall(['--path', projectDir], { log: silent });

    assert.strictEqual(code, 0);
    assert.ok(existsSync(join(projectDir, SKILL_DEST)));
    assert.ok(existsSync(join(projectDir, PRO_GUIDELINE_DEST)));
    assert.ok(!existsSync(join(projectDir, FREE_GUIDELINE_DEST)));
    assert.match(read(SKILL_DEST), /^name:\s*fluxui-development$/m);
  });

  test('writes both guideline keys when the edition is unknown', () => {
    runInstall(['--path', projectDir], { log: silent });

    assert.ok(existsSync(join(projectDir, PRO_GUIDELINE_DEST)));
    assert.ok(existsSync(join(projectDir, FREE_GUIDELINE_DEST)));
  });

  test("preserves the flux package's own guideline below our block", () => {
    write('composer.json', composerWith({ 'livewire/flux-pro': '^2.0' }));
    write(
      join('vendor', 'livewire', 'flux-pro', 'resources', 'boost', 'guidelines', 'core.blade.php'),
      '## Flux\n\nOfficial Flux guidance that must survive.'
    );

    runInstall(['--path', projectDir], { log: silent });
    const guideline = read(PRO_GUIDELINE_DEST);

    assert.ok(guideline.includes('Official Flux guidance that must survive.'));
    assert.ok(guideline.indexOf(GUIDELINE_MARKER_BEGIN) < guideline.indexOf('Official Flux guidance'));
  });

  test("preserves a user's pre-existing guideline instead of clobbering it", () => {
    write('composer.json', composerWith({ 'livewire/flux-pro': '^2.0' }));
    write(PRO_GUIDELINE_DEST, '## House rules\n\nAlways use Flux components.');

    const code = runInstall(['--path', projectDir], { log: silent });

    assert.strictEqual(code, 0);
    assert.ok(read(PRO_GUIDELINE_DEST).includes('Always use Flux components.'));
  });

  test('is idempotent — a second run changes nothing', () => {
    write('composer.json', composerWith({ 'livewire/flux-pro': '^2.0' }));
    write(
      join('vendor', 'livewire', 'flux-pro', 'resources', 'boost', 'guidelines', 'core.blade.php'),
      'VENDOR CONTENT'
    );
    mkdirSync(join(projectDir, '.claude'), { recursive: true });

    runInstall(['--path', projectDir], { log: silent });
    const first = [SKILL_DEST, PRO_GUIDELINE_DEST, AGENT_DEST].map(read);

    const code = runInstall(['--path', projectDir], { log: silent });
    const second = [SKILL_DEST, PRO_GUIDELINE_DEST, AGENT_DEST].map(read);

    assert.strictEqual(code, 0);
    assert.deepStrictEqual(second, first);
    assert.strictEqual(second[1].split(GUIDELINE_MARKER_BEGIN).length - 1, 1);
  });

  test('installs the subagent when .claude/ exists', () => {
    mkdirSync(join(projectDir, '.claude'), { recursive: true });

    runInstall(['--path', projectDir, '--claude'], { log: silent });

    assert.ok(existsSync(join(projectDir, AGENT_DEST)));
    assert.match(read(AGENT_DEST), /^name:\s*flux-ui-builder$/m);
  });

  test('--dry-run writes nothing', () => {
    write('composer.json', composerWith({ 'livewire/flux': '^2.0' }));

    const code = runInstall(['--path', projectDir, '--dry-run'], { log: silent });

    assert.strictEqual(code, 0);
    assert.ok(!existsSync(join(projectDir, SKILL_DEST)));
    assert.ok(!existsSync(join(projectDir, FREE_GUIDELINE_DEST)));
  });

  test('refuses to replace an unmanaged skill, and --force overrides', () => {
    write('composer.json', composerWith({ 'livewire/flux': '^2.0' }));
    write(SKILL_DEST, '---\nname: fluxui-development\n---\n\nMy own skill.');

    const refused = runInstall(['--path', projectDir], { log: silent });

    assert.strictEqual(refused, 1);
    assert.strictEqual(read(SKILL_DEST), '---\nname: fluxui-development\n---\n\nMy own skill.');

    const forced = runInstall(['--path', projectDir, '--force'], { log: silent });

    assert.strictEqual(forced, 0);
    assert.ok(read(SKILL_DEST).includes(MANAGED_MARKER));
  });

  // A half-installed project is worse than an uninstalled one: if any step is refused,
  // nothing at all should land.
  test('a single refusal prevents every other write', () => {
    write('composer.json', composerWith({ 'livewire/flux': '^2.0' }));
    write(SKILL_DEST, 'My own skill.');

    const code = runInstall(['--path', projectDir], { log: silent });

    assert.strictEqual(code, 1);
    assert.ok(!existsSync(join(projectDir, FREE_GUIDELINE_DEST)), 'guideline must not be written');
  });

  test('a quoted managed marker in prose does not transfer ownership', () => {
    write('composer.json', composerWith({ 'livewire/flux': '^2.0' }));
    write(SKILL_DEST, 'Docs mentioning `<!-- livewire-flux-mcp:managed -->` inline. Still mine.');

    assert.strictEqual(runInstall(['--path', projectDir], { log: silent }), 1);
    assert.ok(read(SKILL_DEST).includes('Still mine.'));
  });

  test('refuses a destination that symlinks outside the project', () => {
    const outside = mkdtempSync(join(tmpdir(), 'flux-mcp-outside-'));
    try {
      write('composer.json', composerWith({ 'livewire/flux': '^2.0' }));
      symlinkSync(outside, join(projectDir, '.ai'), 'dir');

      const code = runInstall(['--path', projectDir], { log: silent });

      assert.strictEqual(code, 1);
      assert.ok(!existsSync(join(outside, 'skills')), 'must not write through the symlink');
    } finally {
      rmSync(outside, { recursive: true, force: true });
    }
  });

  test('rejects a --path that is not an existing directory', () => {
    const file = write('not-a-dir.txt', 'x');

    assert.strictEqual(runInstall(['--path', file], { log: silent }), 1);
    assert.strictEqual(runInstall(['--path', join(projectDir, 'nope')], { log: silent }), 1);
  });

  test('reports unknown options with a non-zero exit code', () => {
    assert.strictEqual(runInstall(['--wat'], { log: silent }), 1);
    assert.strictEqual(runInstall(['--wat', '--help'], { log: silent }), 1);
  });

  test('--path with a missing value fails instead of installing into cwd', () => {
    assert.strictEqual(runInstall(['--path'], { log: silent }), 1);
    assert.strictEqual(runInstall(['--path', '--dry-run'], { log: silent }), 1);
  });

  test('--help prints usage without writing', () => {
    const lines = [];
    const code = runInstall(['--help'], { log: (line) => lines.push(line) });

    assert.strictEqual(code, 0);
    assert.match(lines.join('\n'), /Usage:/);
  });
});
