// Installer for the AI guidelines, skill and subagent shipped with this package.
//
// Laravel Boost only auto-discovers third-party guidelines and skills from *Composer*
// packages (it reads composer.json, then looks in vendor/{pkg}/resources/boost/…), so an
// npm package can never be picked up automatically. Instead we write into the paths Boost
// documents for *custom* guidelines and skills, which take precedence over the bundled ones:
//
//   .ai/skills/fluxui-development/SKILL.md        overrides Boost's fluxui-development skill
//   .ai/guidelines/fluxui-{free,pro}/core.blade.php   overrides the matching Flux guideline
//
// The skill override is deliberate: Boost's bundled version routes Flux lookups to its own
// `search-docs` tool and carries a hardcoded component list, so without replacing it this
// MCP server is never consulted.
//
// This module is imported lazily by index.js, only for `livewire-flux-mcp install`, so the
// stdio server path never pays for it.

import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const PACKAGE_ROOT = dirname(fileURLToPath(import.meta.url));

// Blade comment: invisible once Boost renders the guideline.
export const GUIDELINE_MARKER_BEGIN = '{{-- livewire-flux-mcp:begin --}}';
export const GUIDELINE_MARKER_END = '{{-- livewire-flux-mcp:end --}}';
// HTML comment: marks a whole file as owned by this installer, so a re-run may safely
// replace it while a file the user wrote themselves is left alone. Matched on its own line
// so that merely quoting the marker in prose does not transfer ownership.
export const MANAGED_MARKER = '<!-- livewire-flux-mcp:managed -->';
const MANAGED_MARKER_LINE = /^[ \t]*<!-- livewire-flux-mcp:managed -->[ \t]*$/m;

const SOURCES = {
  guideline: join(PACKAGE_ROOT, 'resources', 'boost', 'guidelines', 'core.blade.php'),
  skill: join(PACKAGE_ROOT, 'resources', 'boost', 'skills', 'fluxui-development', 'SKILL.md'),
  agent: join(PACKAGE_ROOT, 'resources', 'agents', 'flux-ui-builder.md'),
};

const USAGE = `livewire-flux-mcp install — install the Flux AI guideline, skill and subagent

Usage:
  npx livewire-flux-mcp install [options]

Options:
  --path <dir>   Target project directory (default: current directory)
  --boost        Install the Boost guideline + skill (default: when composer.json exists)
  --claude       Install the Claude Code subagent (default: when .claude/ exists)
  --dry-run      Report what would change without writing anything
  --force        Replace an existing file this installer does not manage
  -h, --help     Show this message

Writes:
  .ai/skills/fluxui-development/SKILL.md          (replaces Boost's bundled skill)
  .ai/guidelines/fluxui-{free,pro}/core.blade.php (merged, never clobbered)
  .claude/agents/flux-ui-builder.md
`;

/** Raised when a destination cannot be written safely. Surfaced as a refusal, never a crash. */
export class InstallRefusal extends Error {}

export function parseInstallArgs(argv = []) {
  const options = {
    path: null,
    boost: false,
    claude: false,
    dryRun: false,
    force: false,
    help: false,
    unknown: [],
    errors: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--path': {
        const value = argv[i + 1];
        // Without this guard `--path --dry-run` would silently consume the next flag and
        // install into a directory literally named "--dry-run".
        if (value === undefined || value.startsWith('-')) {
          options.errors.push('--path requires a directory argument');
        } else {
          options.path = value;
          i += 1;
        }
        break;
      }
      case '--boost':
        options.boost = true;
        break;
      case '--claude':
        options.claude = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '-h':
      case '--help':
        options.help = true;
        break;
      default:
        if (arg.startsWith('--path=')) {
          const value = arg.slice('--path='.length);
          if (value === '') {
            options.errors.push('--path requires a directory argument');
          } else {
            options.path = value;
          }
        } else {
          options.unknown.push(arg);
        }
    }
  }

  return options;
}

function readJsonIfPresent(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8'));
  } catch {
    return null;
  }
}

/**
 * Which Flux guideline key applies, mirroring Boost's PackageRegistry:
 *   livewire/flux     -> fluxui-free
 *   livewire/flux-pro -> fluxui-pro
 * Boost excludes the free package when the pro one is present, so pro wins.
 * Returns null when neither is required, in which case we install both (only the one
 * matching the installed package is ever read).
 */
export function detectFluxEdition(targetDir) {
  const composer = readJsonIfPresent(join(targetDir, 'composer.json'));
  if (!composer) return null;

  const required = {
    ...(composer.require ?? {}),
    ...(composer['require-dev'] ?? {}),
  };

  if (Object.hasOwn(required, 'livewire/flux-pro')) return 'fluxui-pro';
  if (Object.hasOwn(required, 'livewire/flux')) return 'fluxui-free';
  return null;
}

/**
 * Flux ships its own core guideline inside its Composer package; Boost resolves it from
 * there because Flux is first-party. Overriding without merging would delete it, so find
 * it and keep it.
 */
export function findVendorGuideline(targetDir, edition) {
  const vendorPackage = edition === 'fluxui-pro' ? 'livewire/flux-pro' : 'livewire/flux';
  const base = join(targetDir, 'vendor', ...vendorPackage.split('/'), 'resources', 'boost', 'guidelines');

  for (const ext of ['.blade.php', '.md']) {
    const candidate = join(base, `core${ext}`);
    if (existsSync(candidate)) {
      return { path: candidate, content: readFileSync(candidate, 'utf-8') };
    }
  }

  return null;
}

function indexesOf(haystack, needle) {
  const found = [];
  let from = 0;
  for (;;) {
    const at = haystack.indexOf(needle, from);
    if (at === -1) return found;
    found.push(at);
    from = at + needle.length;
  }
}

/**
 * Build the guideline file: our block, delimited by markers, with everything else preserved
 * byte for byte.
 *
 * - No markers present: prepend our block, leave the rest untouched.
 * - Exactly one well-formed pair: replace that span *in place*, so surrounding content keeps
 *   its position and whitespace.
 * - Anything else (partial, duplicated or out-of-order markers): refuse, because we cannot
 *   tell which span is ours. `force` falls back to replacing first-begin..last-end.
 */
export function composeGuideline(block, existingContent = '', { force = false } = {}) {
  const ours = `${GUIDELINE_MARKER_BEGIN}\n${block.trim()}\n${GUIDELINE_MARKER_END}`;
  const existing = existingContent ?? '';

  if (existing.trim() === '') return `${ours}\n`;

  const begins = indexesOf(existing, GUIDELINE_MARKER_BEGIN);
  const ends = indexesOf(existing, GUIDELINE_MARKER_END);

  if (begins.length === 0 && ends.length === 0) {
    return `${ours}\n\n${existing}`;
  }

  const wellFormed = begins.length === 1 && ends.length === 1 && ends[0] > begins[0];

  if (!wellFormed && !force) {
    throw new InstallRefusal(
      'the existing guideline has malformed livewire-flux-mcp markers ' +
      `(${begins.length} begin, ${ends.length} end) — fix or remove them, or re-run with --force`
    );
  }

  const start = begins.length > 0 ? begins[0] : ends[0];
  const stop = ends.length > 0
    ? ends[ends.length - 1] + GUIDELINE_MARKER_END.length
    : begins[begins.length - 1] + GUIDELINE_MARKER_BEGIN.length;

  return existing.slice(0, start) + ours + existing.slice(Math.max(start, stop));
}

/**
 * Refuse to write anywhere that resolves outside the project. Walks up to the nearest
 * existing ancestor so a symlinked `.ai` or `.claude` is caught before anything is written.
 */
function assertWithinProject(targetDir, destination) {
  let probe = destination;
  while (!existsSync(probe) && dirname(probe) !== probe) {
    probe = dirname(probe);
  }

  const realProject = realpathSync(targetDir);
  const realProbe = realpathSync(probe);

  if (realProbe !== realProject && !realProbe.startsWith(realProject + sep)) {
    throw new InstallRefusal(
      `resolves outside the project (${realProbe}) — refusing to follow it`
    );
  }
}

function isOwnedByInstaller(contents) {
  return MANAGED_MARKER_LINE.test(contents);
}

function planFullFileWrite({ targetDir, source, destination, force }) {
  const desired = readFileSync(source, 'utf-8');
  assertWithinProject(targetDir, destination);

  if (!existsSync(destination)) {
    return { action: 'create', destination, content: desired, ownership: 'absent' };
  }

  if (lstatSync(destination).isDirectory()) {
    throw new InstallRefusal('a directory already exists at this path');
  }

  const current = readFileSync(destination, 'utf-8');
  if (current === desired) {
    return { action: 'unchanged', destination, content: desired, ownership: 'identical' };
  }

  // Only replace files this installer wrote, unless the user insists.
  if (!isOwnedByInstaller(current) && !force) {
    throw new InstallRefusal(
      'file already exists and was not created by this installer (use --force to replace it)'
    );
  }

  return { action: 'update', destination, content: desired, ownership: 'managed' };
}

function planGuidelineWrite({ targetDir, edition, force }) {
  const block = readFileSync(SOURCES.guideline, 'utf-8');
  const destination = join(targetDir, '.ai', 'guidelines', edition, 'core.blade.php');
  assertWithinProject(targetDir, destination);

  let base = '';
  let mergedFrom = null;

  if (existsSync(destination)) {
    if (lstatSync(destination).isDirectory()) {
      throw new InstallRefusal('a directory already exists at this path');
    }
    base = readFileSync(destination, 'utf-8');
    mergedFrom = 'existing';
  } else {
    const vendor = findVendorGuideline(targetDir, edition);
    if (vendor) {
      base = vendor.content;
      mergedFrom = relative(targetDir, vendor.path);
    }
  }

  const content = composeGuideline(block, base, { force });

  if (existsSync(destination) && base === content) {
    return { action: 'unchanged', destination, content, mergedFrom };
  }

  return {
    action: existsSync(destination) ? 'update' : 'create',
    destination,
    content,
    mergedFrom,
  };
}

function attempt(label, fn) {
  try {
    return { label, ...fn() };
  } catch (error) {
    if (error instanceof InstallRefusal) {
      return { label, action: 'refused', reason: error.message };
    }
    throw error;
  }
}

/**
 * Decide every file operation without touching disk. Exported so tests (and --dry-run)
 * can assert the plan directly.
 */
export function planInstall(options = {}) {
  const targetDir = resolve(options.path ?? process.cwd());
  const explicit = options.boost || options.claude;

  const wantsBoost = options.boost || (!explicit && existsSync(join(targetDir, 'composer.json')));
  const wantsClaude = options.claude || (!explicit && existsSync(join(targetDir, '.claude')));

  // Nothing recognisable: still install the Boost-shaped artifacts, since `.ai/` is the
  // documented home for custom guidelines and skills.
  const boost = wantsBoost || (!wantsBoost && !wantsClaude);

  const steps = [];
  const edition = detectFluxEdition(targetDir);

  if (boost) {
    steps.push(attempt('skill', () => planFullFileWrite({
      targetDir,
      source: SOURCES.skill,
      destination: join(targetDir, '.ai', 'skills', 'fluxui-development', 'SKILL.md'),
      force: options.force,
    })));

    // With neither Flux package required we cannot tell which key Boost will read, so
    // write both. Boost only ever loads the one matching the installed package.
    const editions = edition ? [edition] : ['fluxui-free', 'fluxui-pro'];
    for (const key of editions) {
      steps.push(attempt(`guideline (${key})`, () => planGuidelineWrite({
        targetDir,
        edition: key,
        force: options.force,
      })));
    }
  }

  if (wantsClaude) {
    steps.push(attempt('subagent', () => planFullFileWrite({
      targetDir,
      source: SOURCES.agent,
      destination: join(targetDir, '.claude', 'agents', 'flux-ui-builder.md'),
      force: options.force,
    })));
  }

  return { targetDir, edition, boost, claude: wantsClaude, steps };
}

/**
 * Re-check between planning and writing. The window is small, but it is the difference
 * between "we decided this file was ours" and "this file is still ours".
 */
function stillSafeToWrite(step, force) {
  if (step.ownership === 'managed' || step.ownership === undefined) return true;
  if (!existsSync(step.destination)) return true;
  if (force) return true;

  const current = readFileSync(step.destination, 'utf-8');
  return current === step.content || isOwnedByInstaller(current);
}

export function runInstall(argv = [], { log = console.log, cwd } = {}) {
  const options = parseInstallArgs(argv);

  if (options.errors.length > 0) {
    log(`${options.errors[0]}\n`);
    log(USAGE);
    return 1;
  }

  if (options.unknown.length > 0) {
    log(`Unknown option: ${options.unknown[0]}\n`);
    log(USAGE);
    return 1;
  }

  if (options.help) {
    log(USAGE);
    return 0;
  }

  const targetPath = options.path ?? cwd ?? process.cwd();
  const resolvedTarget = resolve(targetPath);

  if (existsSync(resolvedTarget) && !statSync(resolvedTarget).isDirectory()) {
    log(`Not a directory: ${resolvedTarget}`);
    return 1;
  }
  if (!existsSync(resolvedTarget)) {
    log(`No such directory: ${resolvedTarget}`);
    return 1;
  }

  const plan = planInstall({ ...options, path: resolvedTarget });
  const { targetDir, edition, steps } = plan;

  log(`livewire-flux-mcp install${options.dryRun ? ' (dry run)' : ''}`);
  log(`  project: ${targetDir}`);
  log(`  flux edition: ${edition ?? 'not detected — installing both guideline keys'}`);
  log('');

  const refused = steps.filter((step) => step.action === 'refused');

  // Fail before writing anything: a partially installed project is worse than none.
  if (refused.length > 0) {
    for (const step of steps) {
      const shown = step.destination ? relative(targetDir, step.destination) : step.label;
      if (step.action === 'refused') {
        log(`  ✗ ${step.label} — ${step.reason}`);
      } else {
        log(`  · ${shown} (${step.action}, not attempted)`);
      }
    }
    log('');
    log('Nothing was written. Resolve the entries marked ✗, or re-run with --force.');
    return 1;
  }

  for (const step of steps) {
    const shown = relative(targetDir, step.destination) || step.destination;

    if (step.action === 'unchanged') {
      log(`  = ${shown} (already up to date)`);
      continue;
    }

    const suffix = step.mergedFrom ? `, merged with ${step.mergedFrom}` : '';
    log(`  ${options.dryRun ? '·' : '✔'} ${shown} (${step.action}${suffix})`);

    if (options.dryRun) continue;

    if (!stillSafeToWrite(step, options.force)) {
      log(`  ✗ ${shown} changed on disk since planning — skipped`);
      return 1;
    }

    mkdirSync(dirname(step.destination), { recursive: true });
    writeFileSync(step.destination, step.content, 'utf-8');
  }

  log('');

  if (options.dryRun) {
    log('Dry run — no files were written.');
    return 0;
  }

  if (plan.boost) {
    log('Next: run `php artisan boost:update` so Boost picks up the guideline and skill.');
  }

  return 0;
}
