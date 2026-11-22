'use strict';

/**
 * Windows/Node 22 original-input SFT. LP2 pp49–51's 256 numeral cells
 * under the source-absent-f radix59 form a rooted 256-address in-tree.
 * The 95 leaves equal clear p57's 95 runes. Assign the p57 runes to
 * sorted leaves; combine descendants by addition mod29; test the
 * resulting 256-key table against original p55 and pp54–55.
 *
 * This is a hypothesis test, not an authenticated Cicada instruction.
 * No dependency, shell command or file write is required.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const load = (name) => JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', name), 'utf8'));
const grid = load('base60-grid.json');
const corpus = load('lp2-corpus.json');
const get = (i) => corpus.pages.find((p) => p.page === i).indices;
const tokens = grid.rows.flat();
const a59 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdeghijklmnopqrstuvwx';
const a60 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx';
const mod = (x) => ((x % 29) + 29) % 29;
assert.equal(a59.length, 59);
assert.equal(a60.length, 60);
assert.equal(tokens.length, 256);
function parse(alphabet, base) {
  return tokens.map((s) => {
    const a = alphabet.indexOf(s[0]), b = alphabet.indexOf(s[1]);
    assert(a >= 0 && b >= 0);
    const v = a * base + b;
    assert(v >= 0 && v < 256);
    return v;
  });
}
const V59 = parse(a59, 59), V60 = parse(a60, 60);
assert.equal(new Set(V59).size, 161);
assert.equal(new Set(V60).size, 161);
const indegree = Array(256).fill(0);
const children = Array.from({ length: 256 }, () => []);
V59.forEach((v) => indegree[v]++);
V59.forEach((v, i) => { if (v !== i) children[v].push(i); });
const leaves = indegree.flatMap((v, i) => v ? [] : [i]);
const root = V59.findIndex((v, i) => v === i);
const clear = get(57), c55 = get(55), c54c55 = get(54).concat(c55);
assert.equal(root, 189);
assert.equal(leaves.length, 95);
assert.equal(clear.length, 95);
assert.equal(c55.length, 76);
assert.equal(c54c55.length, 308);
for (let i = 0; i < 256; i++) {
  let v = i, steps = 0;
  while (v !== root && steps++ < 256) v = V59[v];
  assert.equal(v, root, 'not one original rooted tree');
}
/**
 * @param {number[]} source - GP29 values, length 95
 * @param {boolean} primes - replace leaves by source prime values mod29
 * @param {boolean} reverse - use reverse source order on increasing leaf addresses
 * @returns {number[]} 256 GP29 key digits
 */
function keyFromLeaves(source, primes, reverse) {
  const labels = Array(256).fill(-1);
  for (let j = 0; j < 95; j++) {
    const v = source[reverse ? 94-j : j];
    labels[leaves[j]] = primes ? corpus.prime[v] % 29 : v;
  }
  function fill(i) {
    if (labels[i] >= 0) return labels[i];
    labels[i] = mod(children[i].reduce((sum, k) => sum + fill(k), 0));
    return labels[i];
  }
  for (let i = 0; i < 256; i++) fill(i);
  return labels;
}
const apply = (seq, key, sign) => seq.map((v, i) => mod(v + sign * key[i % 256]));
const ioc = (seq) => {
  const freq = new Uint16Array(29);
  seq.forEach((v) => freq[v]++);
  return freq.reduce((s, k) => s + k * (k - 1), 0) / (seq.length * (seq.length - 1));
};
function evaluate(source) {
  let best55 = -Infinity, bestTerminal = -Infinity;
  const cases = [];
  for (const primes of [false, true]) for (const reverse of [false, true]) {
    const key = keyFromLeaves(source, primes, reverse);
    for (const sign of [-1, +1]) {
      const score55 = ioc(apply(c55, key, sign));
      const scoreTerminal = ioc(apply(c54c55, key, sign));
      best55 = Math.max(best55, score55);
      bestTerminal = Math.max(bestTerminal, scoreTerminal);
      cases.push({ primes, reverse, sign, score55, scoreTerminal });
    }
  }
  return { best55, bestTerminal, cases };
}
const original = evaluate(clear);
assert(Math.abs(original.best55 - 0.04245614035087719) < 1e-12);
assert(Math.abs(original.bestTerminal - 0.036592072422691316) < 1e-12);
// Positive: native clear GP29 text of the same 76-rune test length.
const key = keyFromLeaves(clear, false, false), plant = clear.slice(0, 76);
assert.deepEqual(apply(apply(plant, key, +1), key, -1), plant);
const shuffled = clear.slice();
let state = 0x33010095;
const rand = () => {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
};
let exceed55 = 0, exceedTerminal = 0, sum55 = 0, sumTerminal = 0;
const n = 5000;
for (let trial = 0; trial < n; trial++) {
  for (let i = 94; i > 0; i--) {
    const j = rand() % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const result = evaluate(shuffled);
  if (result.best55 >= original.best55) exceed55++;
  if (result.bestTerminal >= original.bestTerminal) exceedTerminal++;
  sum55 += result.best55;
  sumTerminal += result.bestTerminal;
}
assert.equal(exceed55, 779);
assert.equal(exceedTerminal, 506);
console.log(JSON.stringify({
  originalGraph: { cells: 256, distinctTokens: new Set(tokens).size,
    leaves: leaves.length, root, allConverge: true },
  consumer: { clearRunes: clear.length, p55Runes: c55.length,
    terminalRunes: c54c55.length, original },
  rawIoC: { p55: ioc(c55), terminal: ioc(c54c55), clear: ioc(clear) },
  matchedOrderNull: { seed: '0x33010095', trials: n, exceed55, exceedTerminal,
    p55: (exceed55 + 1) / (n + 1),
    terminal: (exceedTerminal + 1) / (n + 1),
    meanBest55: sum55 / n, meanBestTerminal: sumTerminal / n },
  nativePlant: { length: plant.length, recovered: true },
  verdict: 'No plaintext or exceptional source-order signal.'
}, null, 2));
