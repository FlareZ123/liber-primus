'use strict';

/**
 * Original LP2 all-state MT19937 direct-step low-two-bit inverse.
 * The C++ companion solves 19,968 symbolic raw-state bits by GF(2) elimination.
 * Four clock policies, two GP28 encodings and two signs are frozen.
 *
 * Run from repository root: node sims/lp2_mt19937_fullstate_original_sft.cjs
 * Requirements: Node 22 and a C++20-capable g++ executable on PATH.
 * Writes only to an owned temporary directory and removes it afterward.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, page) => n + page.indices.length, 0), 12956);
let steps = 0;
let zeros = 0;
const log = Array(29).fill(-1);
let current = 1;
for (let exponent = 0; exponent < 28; exponent += 1) {
  assert.equal(log[current], -1);
  log[current] = exponent;
  current = (current * 15) % 29;
}
assert.equal(current, 1);

/**
 * A GP29 difference is a 28-way MT word only under the tested assumption.
 * A '?' consumes a generator draw without revealing its low two bits.
 * @param {'ordinal'|'exponent'} encoding
 * @param {1|-1} sign
 * @param {boolean} pageIV
 * @param {boolean} zeroDraw
 * @returns {string}
 */
function encodeObservations(encoding, sign, pageIV, zeroDraw) {
  let stream = '';
  for (const page of pages) {
    const runes = page.indices;
    if (pageIV) stream += '?';
    for (let i = 1; i < runes.length; i += 1) {
      let delta = (runes[i] - runes[i - 1] + 29) % 29;
      if (delta === 0) {
        if (zeroDraw) stream += '?';
        continue;
      }
      if (sign < 0) delta = 29 - delta;
      const value = encoding === 'ordinal' ? delta - 1 : log[delta];
      assert.ok(value >= 0 && value <= 27);
      stream += String(value & 3);
    }
  }
  return stream;
}

for (const page of pages) {
  steps += page.indices.length - 1;
  for (let i = 1; i < page.indices.length; i += 1) {
    if (page.indices[i] === page.indices[i - 1]) zeros += 1;
  }
}
assert.equal(steps, 12901);
assert.equal(zeros, 86);

const cases = [];
for (const encoding of ['ordinal', 'exponent']) {
  for (const sign of [1, -1]) {
    for (const pageIV of [false, true]) {
      for (const zeroDraw of [false, true]) {
        const label = encoding + '_' + (sign > 0 ? 'plus' : 'minus') + '_' +
          (pageIV ? 'pageIV' : 'noIV') + '_' +
          (zeroDraw ? 'zeroDraw' : 'zeroSkip');
        const stream = encodeObservations(encoding, sign, pageIV, zeroDraw);
        const expectedLength = 12901 - 86 + (zeroDraw ? 86 : 0) +
          (pageIV ? 55 : 0);
        assert.equal(stream.length, expectedLength);
        cases.push({ label, stream });
      }
    }
  }
}
assert.equal(cases.length, 16);

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'lp2-mt19937-'));
try {
  const source = path.join(root, 'sims', 'lp2_mt19937_fullstate_inverse.cpp');
  const binary = path.join(temporary, process.platform === 'win32' ? 'mt19937.exe' : 'mt19937');
  const build = spawnSync('g++', ['-std=c++20', '-O3', source, '-o', binary], {
    encoding: 'utf8',
    timeout: 120000
  });
  assert.equal(build.status, 0, 'C++20 compile failed: ' + (build.error || build.stderr));

  const raw = cases.map(({ label, stream }) => label + '\t' + stream).join('\n') + '\n';
  const run = spawnSync(binary, [], {
    input: raw,
    encoding: 'utf8',
    timeout: 12 * 60 * 1000,
    maxBuffer: 3 * 1024 * 1024
  });
  assert.equal(run.status, 0, 'Exact-state solver failed: ' + (run.error || run.stderr));
  const rows = run.stdout.trim().split(/\r?\n/);
  assert.equal(rows.length, cases.length, run.stdout);
  let survivors = 0;
  for (let i = 0; i < cases.length; i += 1) {
    const line = rows[i];
    const groups = /^CASE (\S+) observed (\d+) draws (\d+) rank (\d+) original_violations (\d+) first_violation (-?\d+) planted_violations (\d+) seconds ([\d.]+)$/.exec(line);
    assert.ok(groups, 'Unrecognized exact-state line: ' + line);
    const [ , name, observedText, drawsText, rankText, errorsText, firstText, plantedText ] = groups;
    const { label, stream } = cases[i];
    assert.equal(name, label);
    assert.equal(Number(drawsText), stream.length);
    assert.equal(Number(observedText), stream.length - [...stream].filter((x) => x === '?').length);
    assert.ok(Number(rankText) >= 19000, 'Underconstrained case: ' + line);
    assert.equal(Number(plantedText), 0, 'Real MT19937 positive failed: ' + line);
    if (Number(errorsText) === 0) {
      survivors += 1;
      process.stdout.write('POSSIBLE STATE CANDIDATE: ' + line + '\n');
    } else {
      assert.ok(Number(firstText) >= 0, 'Missing contradiction index: ' + line);
      process.stdout.write(line + '\n');
    }
  }
  process.stdout.write(
    'EXACT INVERSION: ' + cases.length + ' source-fixed cases, ' + survivors +
    ' compatible original streams; every case passed a genuine std::mt19937 seeded control.\n'
  );
  if (survivors > 0) {
    process.stdout.write(
      'CAUTION: compatible two-bit streams require full-word modulo-28' +
      ' output validation before any plaintext claim.\n'
    );
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
