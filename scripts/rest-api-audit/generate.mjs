/** Reconcile pinned official facts with observed, reachable product handlers and existing tests. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const capture = resolve(process.argv[2] ?? '.workspace/workstreams/rest-api-coverage-audit');
const output = resolve(process.argv[3] ?? 'docs/rest-api-coverage');
const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
const factsBytes = await readFile(new URL('../../docs/rest-api-coverage/official-operations.json', import.meta.url));
const facts = JSON.parse(factsBytes);
const lock = await readJson(new URL('../../docs/rest-api-coverage/source-lock.json', import.meta.url));
assert.equal(createHash('sha256').update(factsBytes).digest('hex'), lock.projectionSha256);
const probe = await readJson(resolve(capture, 'probe.json'));
const probeLock = await readJson(resolve(capture, 'probe-lock.json'));
for (const [file, expected] of Object.entries(probeLock.sourceFileHashes)) {
  assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'), expected, 'Stale audit evidence: ' + file);
}
const observed = (await readFile(resolve(capture, 'test-requests.ndjson'), 'utf8')).trim().split('\n').map(JSON.parse);
const canonical = text => {
  let index = 0;
  return text.replace(/\{[^}]+\}/g, () => `{p${++index}}`);
};
const factsById = new Map(facts.map(row => [row.id, row]));
assert.equal(factsById.size, facts.length);

// Match exact literal name/description pairs, then scan the balanced declaration call.
// This narrow scanner is intentionally limited to the current product declaration style.
const sources = [];
const exports = new Map();
const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const lineAt = (text, offset) => text.slice(0, offset).split('\n').length;
for (const file of (await readdir('src')).filter(file => file.endsWith('.ts')).sort()) {
  const path = 'src/' + file;
  const text = await readFile(path, 'utf8');
  const imports = new Map();
  for (const match of text.matchAll(/import\s*\{([^}]+)\}\s*from\s*"(\.\/[^"\n]+)"/g)) {
    const module = match[2];
    if (/cli-support|presentation/.test(module)) continue;
    for (const entry of match[1].split(',')) {
      const symbol = entry.trim();
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(symbol)) imports.set(symbol, {
        file: 'src/' + module.slice(2).replace(/\.js$/, '.ts'), symbol,
      });
    }
  }
  for (const match of text.matchAll(/export\s+(?:(?:async\s+)?function|const)\s+([A-Za-z_][A-Za-z0-9_]*)/g)) {
    exports.set(path + '#' + match[1], path + ':' + lineAt(text, match.index));
  }
  sources.push({ path, text, imports });
}
async function declarationFor(probeRow, request) {
  const leaf = probeRow.syntax.split(' ').filter(token => !token.startsWith('<')).at(-1);
  const syntax = leaf + (probeRow.syntax.includes('<') ? ' ' + probeRow.syntax.slice(probeRow.syntax.indexOf('<')) : '');
  const pattern = new RegExp('\\b[A-Za-z_][A-Za-z0-9_]*\\(\\s*' +
    escapeRegex(JSON.stringify(syntax)) + '\\s*,\\s*' + escapeRegex(JSON.stringify(probeRow.description)) + '\\s*,', 'g');
  const candidates = [];
  for (const source of sources) {
    for (const match of source.text.matchAll(pattern)) {
      let depth = 1, quote = '', escaped = false;
      let end = match.index + match[0].length;
      for (; end < source.text.length && depth; end++) {
        const char = source.text[end];
        if (quote) {
          if (escaped) escaped = false;
          else if (char === '\\') escaped = true;
          else if (char === quote) quote = '';
        } else if ('"\'`'.includes(char)) quote = char;
        else if (char === '(') depth++;
        else if (char === ')') depth--;
      }
      assert.equal(depth, 0, 'Unbalanced declaration: ' + probeRow.syntax);
      const body = source.text.slice(match.index + match[0].length, end);
      const serviceFunctions = [...source.imports.values()].filter(ref =>
        new RegExp('\\b' + escapeRegex(ref.symbol) + '\\b').test(body)).map(ref => ({
          ...ref, location: exports.get(ref.file + '#' + ref.symbol) ?? null,
        }));
      candidates.push({ location: source.path + ':' + lineAt(source.text, match.index), serviceFunctions });
    }
  }
  if (candidates.length > 1) {
    const matching = [];
    for (const candidate of candidates) {
      let called;
      const connection = { baseUrl: 'https://audit.example.test/context/', token: 'synthetic-audit-token',
        fetch: async (url, init) => { called = (init.method ?? 'GET') + ' ' + new URL(url).pathname.slice('/context'.length); throw new Error('Audit locator captured'); } };
      const args = [...probeRow.syntax.matchAll(/<([^>]+)>/g)].map(match => 'audit-' + match[1].toLowerCase());
      for (const ref of candidate.serviceFunctions) {
        const module = await import(`file://${root}/dist/${ref.file.replace(/\.ts$/, '.js')}`);
        try { await module[ref.symbol](connection, ...args, {}); } catch { /* A capture stops before any real transport. */ }
      }
      if (called === request.method + ' ' + request.path) matching.push(candidate);
    }
    candidates.splice(0, candidates.length, ...matching);
  }
  assert.equal(candidates.length, 1, 'Ambiguous declaration: ' + probeRow.syntax);
  assert(candidates[0].serviceFunctions.length > 0, 'No concrete service function: ' + probeRow.syntax);
  return candidates[0];
}
const bindings = new Map();
for (const row of probe.filter(row => !row.workflow)) {
  assert(Object.values(row.surfaces).every(surface => surface.passed && surface.requests === 1), row.syntax);
  assert(row.deniedBeforeHttp, row.syntax);
  assert.equal(row.requests.length, 1);
  const request = row.requests[0];
  const id = canonical(request.operation);
  assert(factsById.has(id), id);
  const fact = factsById.get(id);
  assert.equal(row.permission, fact.permissionCategory, id);
  assert(!bindings.has(id), 'Duplicate operation binding: ' + id);
  bindings.set(id, { command: row.syntax + (row.direct ? ' --direct' : ''),
    permission: row.permission, options: row.options, ...await declarationFor(row, request),
    callStack: request.stack, surfaces: row.surfaces, deniedBeforeHttp: true });
}
const boundary = new Map();
const matchers = facts.map(row => ({ row, pattern: new RegExp('^' + row.method + ' ' + row.path.replace(/\./g, '\\.').replace(/\{[^}]+\}/g, '[^/]+') + '$') }));
for (const call of observed) {
  const key = call.method + ' /' + call.path;
  const matches = matchers.filter(({ pattern }) => pattern.test(key));
  if (!matches.length) continue; // Intentionally malformed synthetic inputs are not official operations.
  matches.sort((a, b) => (a.row.path.match(/\{/g) ?? []).length - (b.row.path.match(/\{/g) ?? []).length);
  const id = matches[0].row.id;
  const files = boundary.get(id) ?? new Set();
  if (call.testFile?.startsWith('tests/')) files.add(call.testFile);
  for (const frame of call.frames) {
    const location = /\((tests\/[^:]+:\d+):\d+\)/.exec(frame)?.[1];
    if (location && !/cli-fixture|cases\.ts/.test(location)) files.add(location);
  }
  boundary.set(id, files);
}
const operationRows = facts.map(fact => {
  const binding = bindings.get(fact.id);
  const testLocations = [...(boundary.get(fact.id) ?? [])].sort();
  const supported = new Set((binding?.options ?? []).map(option => option.split(' ')[0]).map(flag =>
    flag === '--page-size' ? '$top' : flag === '--start' ? '$skip' : flag.slice(2)));
  const unsupported = binding ? fact.queryParameters.filter(parameter => !supported.has(parameter)) : [];
  const unsupportedBodyControls = fact.id === 'POST /api/commands' ? ['comment', 'visibility', 'caret', 'silent', 'runAs'] : [];
  const disputed = binding ? fact.disputedQueryParameters.filter(parameter => !supported.has(parameter)) : [];
  const status = !binding ? 'missing' : disputed.length ? 'uncertain' : unsupported.length || unsupportedBodyControls.length ? 'partial' : 'covered';
  return { ...fact, status, reason: !binding ? 'No shipped service handler reaches this METHOD/path. Generic transport, projections and command-language effects do not count.'
      : status === 'uncertain' ? 'The action is shipped and tested, but completeness is uncertain: the reference parameter table declares fields for DELETE while OpenAPI and Request syntax omit it; the CLI has no DELETE projection option.'
      : status === 'partial' ? 'The core action is shipped and observed; explicit public request controls remain unavailable.'
      : 'The core action and documented query dimensions are exposed and observed. This is operation coverage, not exhaustive schema/value or version conformance.',
    binding: binding ?? null,
    unsupportedQueryParameters: unsupported, disputedUnsupportedQueryParameters: disputed, unsupportedBodyControls,
    verification: { existingOffline: binding ? (testLocations.length ? 'exercised-in-passing-suite' : 'evidence-gap') : 'no-shipped-handler',
      testLocations, generatedSurfaceSmoke: binding ? 'passed' : 'not-applicable', liveService: 'not-run', independentReview: 'not-performed' },
    availableInDefaultReadOnlyProfile: binding?.permission === 'ReadOnly',
    requiresExplicitUpdateGrant: binding?.permission === 'Update',
  };
});
const count = rows => ({ total: rows.length,
  covered: rows.filter(row => row.status === 'covered').length,
  partial: rows.filter(row => row.status === 'partial').length,
  missing: rows.filter(row => row.status === 'missing').length,
  uncertain: rows.filter(row => row.status === 'uncertain').length });
const groups = [...new Set(facts.map(row => row.group))].sort();
const summary = { baselineHead: probeLock.head, dateUTC: '2026-11-08',
  ...count(operationRows), reached: bindings.size,
  byPermission: Object.fromEntries(['ReadOnly', 'Update'].map(permission => [permission, count(operationRows.filter(row => row.permissionCategory === permission))])),
  byGroup: Object.fromEntries(groups.map(group => [group, count(operationRows.filter(row => row.group === group))])),
  workflowLeaves: probe.filter(row => row.workflow).map(row => row.syntax),
  testOnlyTransportOperations: [...boundary.keys()].filter(id => !bindings.has(id)).sort(),
  verificationEvidenceGaps: operationRows.filter(row => row.binding && row.verification.existingOffline === 'evidence-gap').map(row => row.id),
};
assert.equal(summary.total, 282);
assert.equal(summary.covered + summary.partial + summary.missing + summary.uncertain, summary.total);
assert.equal(summary.reached, 118);
assert.deepEqual(summary.verificationEvidenceGaps, []);
assert.deepEqual(summary.testOnlyTransportOperations, ['DELETE /api/issues/{p1}']);
await mkdir(output, { recursive: true });
await writeFile(resolve(output, 'coverage.json'), JSON.stringify(operationRows, null, 2) + '\n');
await writeFile(resolve(output, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
const columns = ['id', 'group', 'permissionCategory', 'status', 'command', 'declaration', 'serviceFunctions', 'unsupportedQueryParameters', 'unsupportedBodyControls', 'disputedUnsupportedQueryParameters', 'tests', 'reference'];
const rows = operationRows.map(row => [row.id, row.group, row.permissionCategory, row.status,
  row.binding?.command ?? '', row.binding?.location ?? '',
  row.binding?.serviceFunctions.map(fn => fn.symbol + '@' + fn.location).join(';') ?? '',
  row.unsupportedQueryParameters.join(';'), row.unsupportedBodyControls.join(';'), row.disputedUnsupportedQueryParameters.join(';'),
  row.verification.testLocations.join(';'), row.reference]);
await writeFile(resolve(output, 'coverage.tsv'), [columns, ...rows].map(row => row.join('\t')).join('\n') + '\n');
console.log(JSON.stringify(summary, null, 2));
