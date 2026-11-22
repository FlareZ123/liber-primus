'use strict';

/**
 * All-internal-state, all-secret 28-label GP29 difference decoder for
 * the low-two-bit output of a single MT19937 state.
 * Unknown codebook is an unrestricted 56-bit set of GP28 -> F2^2 mappings.
 * True permutations impose seven words per each of the four binary outputs.
 * The algorithm rejects a model if all 56 codebook bits are forced zero.
 *
 * Run: node sims/lp2_mt19937_unknown_codebook_original_sft.cjs
 * Requires Node22 and g++ C++20. Only temporary native compilation output.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const base = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(base, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZab';
assert.equal(alphabet.length, 28);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);
let zeros = 0;
for (const p of pages) {
  for (let i = 1; i < p.indices.length; i += 1) {
    if (p.indices[i] === p.indices[i - 1]) zeros += 1;
  }
}
assert.equal(zeros, 86);

/**
 * Produce the exact GP29 successor symbol stream.
 * Opaque '?' consumes a 32-bit MT output with unobserved low bits.
 * @param {boolean} pageIV
 * @param {boolean} zeroDraw
 * @returns {string}
 */
function symbols(pageIV, zeroDraw) {
  let stream = '';
  for (const page of pages) {
    if (pageIV) stream += '?';
    for (let i = 1; i < page.indices.length; i += 1) {
      const delta = (page.indices[i] - page.indices[i - 1] + 29) % 29;
      if (delta === 0) {
        if (zeroDraw) stream += '?';
      } else {
        stream += alphabet[delta - 1];
      }
    }
  }
  return stream;
}

const cases = [];
for (const pageIV of [false, true]) {
  for (const zeroDraw of [false, true]) {
    const label = (pageIV ? 'pageIV' : 'noIV') + '_' +
      (zeroDraw ? 'zeroDraw' : 'zeroSkip');
    const stream = symbols(pageIV, zeroDraw);
    assert.equal(stream.length, 12815 + (pageIV ? 55 : 0) +
      (zeroDraw ? 86 : 0));
    cases.push({ label, stream });
  }
}
assert.equal(cases.length, 4);

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lp2-mt-codebook-'));
try {
  const source = path.join(base, 'sims', 'lp2_mt19937_unknown_codebook_inverse.cpp');
  const binary = path.join(directory, process.platform === 'win32' ? 'mt-codebook.exe' : 'mt-codebook');
  const compile = spawnSync('g++', ['-std=c++20', '-O3', source, '-o', binary], {
    encoding: 'utf8', timeout: 120000
  });
  assert.equal(compile.status, 0, 'Compile failed: ' + (compile.error || compile.stderr));

  const input = cases.map((x) => x.label + '\t' + x.stream).join('\n') + '\n';
  const result = spawnSync(binary, [], {
    encoding: 'utf8', input, maxBuffer: 1048576, timeout: 8 * 60 * 1000
  });
  assert.equal(result.status, 0, 'Exact solver failed: ' + (result.error || result.stderr));
  const lines = result.stdout.trim().split(/\r?\n/);
  assert.equal(lines.length, cases.length);
  let ruledOut = 0;
  for (let i = 0; i < cases.length; i += 1) {
    const line = lines[i];
    const g = /^CASE (\S+) observed (\d+) draws (\d+) original_rank (\d+) original_nullity (\d+) original_forcedzero (\d+) planted_rank (\d+) planted_nullity (\d+) planted_forcedzero (\d+) seconds ([\d.]+)$/.exec(line);
    assert.ok(g, 'Malformed exact-state output: ' + line);
    assert.equal(g[1], cases[i].label);
    assert.equal(Number(g[2]), 12815);
    assert.equal(Number(g[3]), cases[i].stream.length);
    assert.ok(Number(g[4]) >= 19000);
    assert.equal(Number(g[9]), 28,
      'Genuine std::mt19937 secret-bijective-codebook positive must recover 28 freely selectable 1 bits: ' + line);
    if (Number(g[6]) === 56) ruledOut += 1;
    process.stdout.write((Number(g[6]) === 56 ? 'EXCLUDED ' : 'REMAINS POSSIBLE ') + line + '\n');
  }
  process.stdout.write('RESULT: ' + ruledOut + '/4 source-clock models exclude ALL stationary' +
    ' secret 28-to-2-bit codebooks; every genuine generator+unknown-permutation plant passed.\n');
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}
