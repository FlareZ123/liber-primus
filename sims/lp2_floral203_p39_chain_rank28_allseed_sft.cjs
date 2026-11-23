'use strict';

/**
 * Original LP2 floral 16 x 203 complete GF29 double-root / GP28 chain cipher gate.
 * Every row is tested under both chain orientations and all 29^2 initial states.
 * Uses only checked-in original derived transcriptions and solved rune controls.
 * Windows Node.js 22, CommonJS, read-only, no packages.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file */
function load(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}
const corpus = load('resources/liber-primus/lp2-corpus.json');
const ink = load('resources/liber-primus/lp2-ink-annotations.json');
const grid = load('resources/liber-primus/lp2-grid-256.json');
const solved = load('resources/external/relikd-solved-gp29-native-v1.json');

/** @param {number} n */
function mod29(n) { return ((n % 29) + 29) % 29; }
/** @param {number} n */
function mod28(n) { return ((n % 28) + 28) % 28; }

/**
 * @param {number} a
 * @param {number} b
 * @returns {number[]}
 */
function key203(a, b) {
  const key = [a, b];
  for (let i = 2; i < 203; i++) {
    key.push(mod29(19 * key[i - 1] + 4 * key[i - 2]));
  }
  return key;
}

/**
 * Reversible GP28 nonrepeat-chain inverse:
 * C0=P0; EA index28 maps to an unchanged ciphertext rune;
 * every other P maps bijectively onto nonzero GF29 increments 1..28.
 * The original GP29 two-state pad contributes k_i mod28.
 * @param {number[]} ciphertext 203 original symbols
 * @param {number[]} key GF29 recurrence values
 * @param {1|-1} sign sign of key in the forward encoder
 * @returns {number[]}
 */
function decrypt(ciphertext, key, sign) {
  const output = [ciphertext[0]];
  for (let i = 1; i < ciphertext.length; i++) {
    const step = mod29(ciphertext[i] - ciphertext[i - 1]);
    output.push(step === 0 ? 28 : mod28(step - 1 - sign * (key[i] % 28)));
  }
  return output;
}

/**
 * @param {number[]} plaintext
 * @param {number[]} key
 * @param {1|-1} sign
 * @returns {number[]}
 */
function encrypt(plaintext, key, sign) {
  const output = [plaintext[0]];
  for (let i = 1; i < plaintext.length; i++) {
    const step = plaintext[i] === 28
      ? 0
      : 1 + mod28(plaintext[i] + sign * (key[i] % 28));
    output.push(mod29(output[i - 1] + step));
  }
  return output;
}

/** @param {number[]} xs @returns {number} */
function equalPairs(xs) {
  const hist = new Uint16Array(29);
  for (const x of xs) {
    assert.ok(Number.isInteger(x) && x >= 0 && x <= 28);
    hist[x]++;
  }
  let count = 0;
  for (const n of hist) count += n * (n - 1) / 2;
  return count;
}

const red39 = corpus.pages.find((p) => p.page === 39).indices.slice(119, 122);
assert.deepEqual(red39, [27, 5, 15]);
assert.equal(mod29(27 + 5 * 24 + 15 * 24 * 24), 0);
assert.equal(mod29(5 + 30 * 24), 0);
assert.equal(grid.pages.flatMap((p) => p.tokens)[0], '3N');
assert.equal(grid.pages.flatMap((p) => p.bytes)[0], 203);

const expected = new Map([[40, [{ start: 0, length: 8 }]],
  [53, [{ start: 128, length: 51 }]],
  [54, [{ start: 0, length: 9 }]]]);
const marks = new Map(ink.pages.map((p) => [p.page, p.red_spans || []]));
const black = [];
for (let p = 40; p <= 55; p++) {
  const page = corpus.pages.find((r) => r.page === p);
  const actual = marks.get(p) || [];
  assert.deepEqual(actual.map((s) => ({ start: s.start, length: s.length })),
    expected.get(p) || []);
  for (let i = 0; i < page.indices.length; i++) {
    if (actual.some((s) => i >= s.start && i < s.start + s.length)) continue;
    black.push(page.indices[i]);
  }
}
assert.equal(black.length, 3248);
const rows = Array.from({ length: 16 },
  (_, i) => black.slice(203 * i, 203 * (i + 1)));

const best = [];
for (let row = 0; row < 16; row++) {
  const candidates = [{ pairs: -1, a: -1, b: -1 }, { pairs: -1, a: -1, b: -1 }];
  for (let a = 0; a < 29; a++) {
    for (let b = 0; b < 29; b++) {
      const key = key203(a, b);
      for (const [si, sign] of [-1, 1].entries()) {
        const plaintext = decrypt(rows[row], key, /** @type {1|-1} */ (sign));
        const pairs = equalPairs(plaintext);
        if (pairs > candidates[si].pairs) candidates[si] = { pairs, a, b };
      }
    }
  }
  for (const [si, sign] of [-1, 1].entries()) {
    const winner = candidates[si];
    const key = key203(winner.a, winner.b);
    assert.deepEqual(encrypt(decrypt(rows[row], key, /** @type {1|-1} */ (sign)),
      key, /** @type {1|-1} */ (sign)), rows[row]);
  }
  best.push(candidates);
  console.log('Original black row ' + row + ': max equality pairs sign-='
    + candidates[0].pairs + ' sign+=' + candidates[1].pairs
    + ' / 20503; seeds ' + candidates.map((x) => x.a + ',' + x.b).join(' ; '));
}
const observed = best.map((pair) => pair.map((x) => x.pairs));
const expectedPairs = [
  [830, 829], [859, 857], [825, 819], [835, 844],
  [865, 874], [827, 802], [852, 874], [810, 817],
  [837, 849], [812, 821], [822, 842], [812, 830],
  [820, 825], [855, 840], [813, 809], [836, 852]
];
assert.deepEqual(observed, expectedPairs);

const index = new Map(solved.runes.map((r, i) => [r, i]));
/** @param {string} source */
function nativeRunes(source) {
  return Array.from(source).filter((r) => index.has(r)).map((r) => index.get(r));
}
let windows = 0;
let referenceMinimum = Infinity;
let referenceMaximum = -1;
const solvedSources = [];
for (const section of solved.sections) {
  const tokens = nativeRunes(section.source_text);
  let n = 0, localMin = Infinity, localMax = -1;
  for (let start = 0; start + 203 <= tokens.length; start++) {
    const pairs = equalPairs(tokens.slice(start, start + 203));
    localMin = Math.min(localMin, pairs);
    localMax = Math.max(localMax, pairs);
    n++;
  }
  if (!n) continue;
  solvedSources.push({ name: section.name, windows: n, minPairs: localMin });
  windows += n;
  referenceMinimum = Math.min(referenceMinimum, localMin);
  referenceMaximum = Math.max(referenceMaximum, localMax);
}
assert.equal(windows, 1561);
assert.equal(referenceMinimum, 1096);
assert.equal(referenceMaximum, 1529);
const originalUpper = Math.max(...observed.flat());
assert.equal(originalUpper, 874);
assert.ok(originalUpper < referenceMinimum);

// Actual 203-rune source-native solved WELCOME plant. The same encoder
// generates a low-repeat chain, and this decoder recovers all 203 source runes.
const native = nativeRunes(solved.sections.find((s) => s.name === '0_welcome')
  .source_text).slice(0, 203);
assert.equal(native.length, 203);
assert.equal(equalPairs(native), 1154);
const secretKey = key203(4, 9);
const planted = encrypt(native, secretKey, 1);
assert.deepEqual(decrypt(planted, secretKey, 1), native);
assert.ok(equalPairs(native) > originalUpper);

console.log(JSON.stringify({
  status: 'PASS',
  original: 'p40-55 3248 exact black runes / 16 x 203',
  source: 'p39 G=15(x-24)^2; p50 first radix60 value 203',
  model: 'GP29-root24-autonomous key; GP28 nonzero-step chaining; EA repeat escape',
  exhaustiveOriginalDecodes: 16 * 841 * 2,
  originalMaxEqualPairs: observed,
  originalOverallMaximum: originalUpper,
  solvedNative203RuneWindows: windows,
  solvedNativeMinimumPairs: referenceMinimum,
  solvedNativeMaximumPairs: referenceMaximum,
  solvedSources,
  positive: '203/203 original solved WELCOME runes recovered and replayed',
  inference: 'This exact GP28 chain class is disfavored for native GP English under all independent per-row IVs; no unknown plaintext'
}, null, 2));
