'use strict';

/**
 * Original LP2 p7/p8/p50 pointer-graph inverse.
 * Source clue: p8 has 255 runes; pp49-51 print 256 base60-style
 * tokens; p7 ends in M19; p8's red Roman XIXM and red product 3
 * motivate the inverse GF29 powers 19 and 3.
 *
 * This is a bounded, source-visible operation test, not an
 * authenticated Cicada cipher. Read-only Windows Node 22 SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} rel */
const load = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const gp = load('resources/liber-primus/lp2-corpus.json');
const grid = load('resources/liber-primus/lp2-grid-256.json');
const source = grid.pages.flatMap(page => page.tokens);
assert.equal(source.length, 256);

const p7 = gp.pages.find(page => page.page === 7).indices;
const p8 = gp.pages.find(page => page.page === 8).indices;
const p9 = gp.pages.find(page => page.page === 9).indices;
const p57 = gp.pages.find(page => page.page === 57).indices;
assert.equal(p7.at(-1), 19);
assert.equal(p8.length, 255);
assert.deepEqual(p8.slice(0, 4), [14, 10, 14, 19]);
assert.equal(p57.length, 95);

const mod = x => ((x % 29) + 29) % 29;
/** @param {number} x @param {number} exponent */
function power(x, exponent) {
  let y = 1;
  for (; exponent; exponent = Math.floor(exponent / 2), x = mod(x * x)) {
    if (exponent % 2) y = mod(y * x);
  }
  return y;
}
for (let x = 0; x < 29; x++) {
  assert.equal(power(power(x, 3), 19), x, 'GF29 cube/root inversion');
}

/** @param {number[]} next */
function cycles(next) {
  const seen = new Uint8Array(next.length);
  const found = [];
  for (let sourceIndex = 0; sourceIndex < next.length; sourceIndex++) {
    if (seen[sourceIndex]) continue;
    const visitIndex = new Map();
    let cur = sourceIndex;
    while (!seen[cur] && !visitIndex.has(cur)) {
      visitIndex.set(cur, visitIndex.size);
      cur = next[cur];
    }
    if (visitIndex.has(cur)) {
      const nodes = [...visitIndex.keys()].slice(visitIndex.get(cur));
      found.push(nodes);
    }
    for (const i of visitIndex.keys()) seen[i] = 1;
  }
  return found;
}
const edges = {};
for (const radix of ['base59', 'base60']) {
  const alphabet = radix === 'base59' ? grid.alphabet.replace('f', '') : grid.alphabet;
  assert.equal(alphabet.length, radix === 'base59' ? 59 : 60);
  const next = source.map(token => {
    assert.equal(token.length, 2);
    const a = alphabet.indexOf(token[0]);
    const b = alphabet.indexOf(token[1]);
    assert.ok(a >= 0 && b >= 0);
    const address = a * alphabet.length + b;
    assert.ok(address >= 0 && address < 256);
    return address;
  });
  edges[radix] = next;
}
const cycles59 = cycles(edges.base59);
const cycles60 = cycles(edges.base60);
assert.deepEqual(cycles59, [[189]], 'base59 single fixed-point graph');
assert.deepEqual(cycles60.map(c => c.length).sort((a, b) => a - b), [2, 11]);

/**
 * Invert D[i] = P[i] + P[next[i]] over GF29.
 * The base59 map has exactly one fixed point, so 2P[root] = D[root].
 * Every other P[i] is recovered uniquely moving backward from the root.
 * @param {number[]} D
 * @returns {number[]}
 */
function invertPlus(D) {
  assert.equal(D.length, 256);
  const next = edges.base59;
  const plain = Array(256).fill(null);
  /** @param {number} i @returns {number} */
  function solve(i) {
    if (plain[i] !== null) return plain[i];
    if (next[i] === i) return (plain[i] = mod(D[i] * 15));
    return (plain[i] = mod(D[i] - solve(next[i])));
  }
  for (let i = 0; i < 256; i++) solve(i);
  return plain;
}

/** @param {number[]} P @param {number} exponent */
function encrypt(P, exponent) {
  return P.map((x, i) => power(mod(x + P[edges.base59[i]]), exponent));
}
/** @param {number[]} C @param {number} exponent */
function decrypt(C, exponent) {
  const inverseExponent = exponent === 3 ? 19 : exponent === 19 ? 3 : 1;
  return invertPlus(C.map(x => power(x, inverseExponent)));
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const results = [];
for (const [alignment, original] of [
  ['prepend-original-p7-final', [p7.at(-1), ...p8]],
  ['append-original-p9-first', [...p8, p9[0]]],
]) {
  assert.equal(original.length, 256);
  // On the base60 graph a 2-cycle requires C[158] = C[249] under
  // any plain neighbour-sum. The original source fails that equality.
  assert.notEqual(original[158], original[249]);

  for (const [model, exponent] of [
    ['linear', 1], ['GF29-cube', 3], ['GF29-cube-root', 19],
  ]) {
    const recovered = decrypt(original, exponent);
    assert.deepEqual(encrypt(recovered, exponent), original,
      'complete exact original-cipher replay');

    const plant = Array.from({ length: 256 }, (_, i) => p57[i % p57.length]);
    assert.deepEqual(decrypt(encrypt(plant, exponent), exponent), plant,
      'native-GP solved p57 synthetic full-message positive control');

    const body = alignment.startsWith('prepend')
      ? recovered.slice(13) : recovered.slice(12, 255);
    assert.equal(body.length, 243);
    results.push({
      alignment, model, runes: recovered.length,
      ioc: Number(ioc(recovered).toFixed(9)),
      body_ioc: Number(ioc(body).toFixed(9)),
      first37: recovered.slice(0, 37).map(index => gp.translit[index]).join(' '),
      original_replay: true, native_GP_positive_control: true,
    });
  }
}
assert.equal(results.length, 6);
assert.ok(results.every(r => r.body_ioc < 0.04),
  'none of the six original p8 inverses recovers native-GP language frequency');
console.log(JSON.stringify({
  source: 'original p7 terminal M19 + p8 unique 255 rune page; pp49-51 256 tokens',
  graph_base59_cycles: cycles59,
  graph_base60_cycle_lengths: cycles60.map(c => c.length).sort((a,b)=>a-b),
  base60_even_cycle_original_obstruction: 'C[158] != C[249] for both natural p8 alignments',
  clear_p57_ioc: ioc(p57),
  results,
  conclusion: 'Exact reversible full-message tests are negative for native-GP original p8 plaintext; this does not authenticate the pointer-sum operation or radix59.'
}, null, 2));
