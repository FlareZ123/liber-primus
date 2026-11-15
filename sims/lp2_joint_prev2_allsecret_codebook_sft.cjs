'use strict';
/**
 * All-secret 841-row GP29 two-ciphertext-history substitution invariant.
 *
 * C_i = perm[C_(i-2), C_(i-1)](P_i), i >= 2, one fixed secret bijection
 * per 29x29 predecessor state, page-reset with two arbitrary initial runes.
 * A first difference or other state-dependent bijective output relabeling
 * leaves the tested same-state collisions unchanged.
 *
 * Source corpus: original LP2 p0..55 (runeless p50 omitted).
 * Controls: nine authentic solved GP29 sections; frozen Shakespeare/Latin
 * source files, normalized into the same 29-rune alphabet.
 * Node.js 22 / CommonJS / no dependencies or fitted keys.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

/** @param {string} p @returns {string} */
function read(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }
/** @param {string} p @returns {any} */
function json(p) { return JSON.parse(read(p)); }

const corpus = json('resources/liber-primus/lp2-corpus.json');
const solved = json('resources/external/relikd-solved-gp29-native-v1.json');
const unknown = corpus.pages.filter((p) => p.page <= 55 && p.indices.length)
  .map((p) => p.indices);
const originalSizes = unknown.map((p) => p.length);
assert.equal(unknown.length, 55);
assert.equal(originalSizes.reduce((n, x) => n + x, 0), 12956);
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const known = solved.sections.map((part) => Array.from(part.source_text)
  .filter((r) => runeIndex.has(r)).map((r) => runeIndex.get(r)));
assert.equal(known.length, 9);
assert.equal(known.flat().length, 2979);

/** @param {number[]} tape @returns {number[][]} */
function packOriginalSizes(tape) {
  assert.ok(tape.length >= 12956);
  let start = 0;
  return originalSizes.map((n) => {
    const out = tape.slice(start, start + n);
    start += n;
    return out;
  });
}

/** @returns {number[]} */
function nativeShakespeare() {
  const source = read('resources/control/shakespeare_first300k.txt');
  const tokens = corpus.translit.slice().sort((a, b) => b.length - a.length);
  const lookup = new Map(corpus.translit.map((r, i) => [r, i]));
  const out = [];
  for (const originalWord of source.match(/[a-zA-Z]+/g)) {
    const word = originalWord.toUpperCase().replace(/QU/g, 'CW')
      .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      const symbol = tokens.find((r) => word.startsWith(r, i));
      assert.ok(symbol, 'Unmapped source-language letter');
      out.push(lookup.get(symbol));
      i += symbol.length;
    }
  }
  assert.ok(out.length >= 12956);
  return out;
}

/** @returns {number[]} */
function nativeLatin() {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRS';
  const out = [];
  const lines = read('resources/control/latin-vulgate-gp-wholewords.txt')
    .split(/\r?\n/);
  for (const line of lines) {
    if (!/^[0-9A-S]+$/.test(line)) continue;
    for (const symbol of line) out.push(alphabet.indexOf(symbol));
  }
  assert.ok(out.length >= 12956);
  return out;
}

/**
 * @param {number[][]} groups
 * @returns {{runes:number,states:number,pairedStates:number,
 *   unorderedPairs:number,matchingPairs:number,normalizedIoC:number,
 *   maxSingleOutput:number}}
 */
function stateCollision(groups) {
  const rows = Array.from({length: 841}, () => new Uint16Array(29));
  let runes = 0;
  for (const group of groups) {
    for (let i = 2; i < group.length; i++) {
      rows[group[i - 2] * 29 + group[i - 1]][group[i]]++;
      runes++;
    }
  }
  let allPairsTwice = 0, equalPairsTwice = 0;
  let states = 0, pairedStates = 0, maxSingleOutput = 0;
  for (const row of rows) {
    let n = 0, max = 0;
    for (const count of row) {
      equalPairsTwice += count * (count - 1);
      n += count;
      if (count > max) max = count;
    }
    if (n) states++;
    if (n >= 2) pairedStates++;
    maxSingleOutput += max;
    allPairsTwice += n * (n - 1);
  }
  assert.ok(allPairsTwice > 0);
  return {runes, states, pairedStates,
    unorderedPairs: allPairsTwice / 2,
    matchingPairs: equalPairsTwice / 2,
    normalizedIoC: 29 * equalPairsTwice / allPairsTwice,
    maxSingleOutput};
}

/** @param {number} seed @returns {()=>number} */
function seededRng(seed) {
  let x = seed | 0;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x >>> 0; };
}

/** @param {number} seed @returns {{forward:number[][],reverse:number[][]}} */
function secretRows(seed) {
  const next = seededRng(seed);
  const forward = [], reverse = [];
  for (let s = 0; s < 841; s++) {
    const row = Array.from({length: 29}, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = next() % (i + 1);
      [row[i], row[j]] = [row[j], row[i]];
    }
    const inv = Array(29);
    for (let i = 0; i < 29; i++) inv[row[i]] = i;
    assert.equal(new Set(row).size, 29);
    forward.push(row); reverse.push(inv);
  }
  return {forward, reverse};
}

/**
 * @param {number[][]} groups
 * @param {{forward:number[][],reverse:number[][]}} key
 * @returns {number[][]}
 */
function encryptAndVerify(groups, key) {
  return groups.map((p) => {
    const c = p.slice(0, 2);
    for (let i = 2; i < p.length; i++) {
      const state = c[i - 2] * 29 + c[i - 1];
      c.push(key.forward[state][p[i]]);
    }
    const recovered = c.slice(0, 2);
    for (let i = 2; i < c.length; i++) {
      const state = c[i - 2] * 29 + c[i - 1];
      recovered.push(key.reverse[state][c[i]]);
    }
    assert.deepEqual(recovered, p);
    return c;
  });
}

const original = stateCollision(unknown);
assert.equal(original.runes, 12846);
assert.equal(original.states, 840);
assert.equal(original.pairedStates, 836);
assert.equal(original.unorderedPairs, 100584);
assert.equal(original.matchingPairs, 3511);
assert.equal(original.maxSingleOutput, 2010);

const controls = {
  solvedCicada: known,
  Shakespeare: packOriginalSizes(nativeShakespeare()),
  LatinVulgate: packOriginalSizes(nativeLatin()),
};
const observedControls = {};
for (const [name, groups] of Object.entries(controls)) {
  const values = [];
  for (let seed = 0; seed < 20; seed++) {
    const key = secretRows(0x3301ae00 + seed);
    const cipher = encryptAndVerify(groups, key);
    values.push(stateCollision(cipher).normalizedIoC);
  }
  values.sort((a, b) => a - b);
  assert.ok(values[0] > original.normalizedIoC);
  observedControls[name] = {
    sections: groups.length, sourceRunes: groups.flat().length,
    testedIndependentSecretKeys: values.length,
    minimum: values[0], median: values[10], maximum: values.at(-1),
  };
}
assert.ok(observedControls.Shakespeare.minimum > 1.8);
assert.ok(observedControls.LatinVulgate.minimum > 2.2);
assert.ok(observedControls.solvedCicada.minimum > 1.7);

console.log(JSON.stringify({
  model: '841 arbitrary but stationary GP29 bijection rows indexed by both previous ciphertext runes',
  original, nativePositiveControls: observedControls,
  conclusion: 'Original fixed-row conditional frequency is uniform-like, unlike native English/Latin planted text; no plaintext, key or page decoder is claimed.',
}, null, 2));
