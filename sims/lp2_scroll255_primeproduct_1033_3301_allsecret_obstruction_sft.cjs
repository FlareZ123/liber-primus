'use strict';
/**
 * Original-source GP29 255-word scroll -> following 255-rune p8 interface.
 *
 * Does an arbitrary secret stationary map of a whole-word prime PRODUCT
 * modulo historically visible 1033 or 3301 explain the candidate GF4/radix59
 * corrected receiver? This is an exact all-secret equality obstruction.
 *
 * Run on Windows 11 / Node.js 22:
 *   node sims/lp2_scroll255_primeproduct_1033_3301_allsecret_obstruction_sft.cjs
 *
 * No files are written. Not a historical decryption.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, '..', 'resources', 'liber-primus');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(dir, file), 'utf8');
const gp = JSON.parse(read('lp2-corpus.json'));
const grid = JSON.parse(read('lp2-grid-256.json'));
const pages = read('lp2-transcription.txt').split('%');
const ri = new Map(gp.runes.map((ch, i) => [ch, i]));
/** @param {number} x @returns {number} */
const mod29 = x => ((x % 29) + 29) % 29;
const words = [];
let word = [];
for (let p = 3; p <= 7; p++) {
  for (const ch of pages[p]) {
    if (ri.has(ch)) word.push(ri.get(ch));
    else if ((ch === '-' || ch === '.') && word.length) {
      words.push(word);
      word = [];
    }
  }
}
if (word.length) words.push(word);
const src = gp.pages.slice(3, 8).flatMap(p => p.indices);
assert.equal(words.length, 255);
assert.equal(src.length, 1145);
assert.deepEqual(words.flat(), src);
const c8 = gp.pages[8].indices;
assert.equal(c8.length, 255);
const sorted = w => [...w].sort((a, b) => a - b).join(',');
const parikh = new Map();
words.forEach((w, i) => {
  const k = sorted(w);
  if (!parikh.has(k)) parikh.set(k, []);
  parikh.get(k).push(i);
});
assert.deepEqual([...parikh.values()].filter(x => x.length > 1),
  [[47, 240], [48, 231], [88, 179], [235, 236]]);
const pairs = [[47, 240], [48, 231], [235, 236], [88, 179]];
assert.deepEqual(words[88], [12, 14]);
assert.deepEqual(words[179], [14, 12]);

/** GF(4)=GF(2)[x]/(x*x+x+1); 2-bit field elements. */
function gf4mul(a, b) {
  let product = 0;
  for (let i = 0; i < 2; i++) {
    if ((b >>> i) & 1) product ^= a;
    a <<= 1;
    if (a & 4) a ^= 7;
  }
  return product;
}
const redFive = [[23, 3], [22, 16, 2, 25],
  [5, 7, 11], [14, 28], [6, 28, 19]];
const products = redFive.map(w => w.reduce((p, x) => p * x % 29, 1));
assert.deepEqual(products, [11, 26, 8, 15, 2]);
assert.deepEqual(gp.pages[7].indices.slice(194), redFive.flat());
const taps = products.slice(0, 4).map(x => x % 4);
let state = [products[4] % 4, 0, 0, 0];
const addr = [];
for (let i = 0; i < 255; i++) {
  addr.push(state.reduce((v, x) => 4 * v + x, 0));
  const feedback = state.reduce((f, x, j) => f ^ gf4mul(x, taps[j]), 0);
  state = [state[1], state[2], state[3], feedback];
}
assert.deepEqual(state, [2, 0, 0, 0]);
assert.equal(new Set(addr).size, 255);
assert(!addr.includes(0));
assert.deepEqual(addr.slice(0, 8), [128, 1, 7, 30, 123, 236, 177, 199]);
const cells = grid.pages.flatMap(p => p.tokens);
assert.equal(cells.length, 256);
assert(!cells.some(x => x.includes('f')));
const alphabet59 = grid.alphabet.replace('f', '');
assert.equal(alphabet59.length, 59);
const byte59 = cells.map(token => 59 * alphabet59.indexOf(token[0]) +
  alphabet59.indexOf(token[1]));
assert(byte59.every(v => v >= 0 && v <= 251));
const corrected = c8.map((v, i) => mod29(v + byte59[addr[i]]));
assert.deepEqual(pairs.map(([i, j]) => [corrected[i], corrected[j]]),
  [[20, 20], [8, 8], [2, 2], [9, 9]]);

/**
 * Exact lower bound on the number of wrong predictions of EVERY deterministic
 * single-symbol map (including all secret nonlinear maps) of source residues.
 * For residue bucket r, the best fixed output is the modal observed output.
 * @param {bigint[]} source
 * @param {number[]} response
 * @param {bigint} divisor
 */
function obstruction(source, response, divisor) {
  /** @type {Map<string, number[]>} */
  const groups = new Map();
  for (let i = 0; i < source.length; i++) {
    const key = (source[i] % divisor).toString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(i);
  }
  let minimumErrors = 0;
  const conflicts = [];
  for (const [residue, positions] of groups) {
    const counts = new Map();
    for (const i of positions) {
      const y = response[i];
      counts.set(y, (counts.get(y) || 0) + 1);
    }
    const errors = positions.length - Math.max(...counts.values());
    minimumErrors += errors;
    if (errors) conflicts.push({ residue, positions,
      outputs: positions.map(i => response[i]), errors });
  }
  return { modulus: divisor.toString(), classes: groups.size,
    unavoidableErrors: minimumErrors, conflictingGroups: conflicts };
}
const primeProducts = words.map(w => w.reduce(
  (v, i) => v * BigInt(gp.prime[i]), 1n));
const expected = [
  [29n, 29, 199], [59n, 58, 183], [60n, 41, 194],
  [256n, 126, 112], [257n, 153, 94],
  [1033n, 220, 29], [3301n, 248, 3],
  [1033n * 3301n, 251, 0]
];
const table = expected.map(([modulus, classes, unavoidableErrors]) => {
  const r = obstruction(primeProducts, corrected, modulus);
  assert.equal(r.classes, classes);
  assert.equal(r.unavoidableErrors, unavoidableErrors);
  return r;
});
const c3301 = table.find(x => x.modulus === '3301');
assert.deepEqual(c3301.conflictingGroups, [
  { residue: '3058', positions: [31, 69], outputs: [2, 25], errors: 1 },
  { residue: '2108', positions: [102, 134], outputs: [1, 2], errors: 1 },
  { residue: '714', positions: [159, 213], outputs: [20, 21], errors: 1 }
]);
assert.equal(parikh.size, 251);

/* Independent source-shaped positive: truly deterministic secret table. */
const planted = primeProducts.map(v => Number((v % 3301n * 17n + 9n) % 29n));
const positive = obstruction(primeProducts, planted, 3301n);
assert.equal(positive.unavoidableErrors, 0);

/* A full residue has 251 classes, allowing an arbitrary 251-entry fit.
 * That perfect map is tautological, not a recovered cipher/hidden key. */
console.log('SCROLL255_PRIME_PRODUCT_RESIDUE_ALLSECRET ' + JSON.stringify({
  sourceWords: words.length, sourceRunes: src.length,
  sourceParikhClasses: parikh.size, targetRunes: c8.length,
  originalFourParikhPairs: pairs, correctedPairValues: pairs.map(([i]) => corrected[i]),
  exactBounds: table.map(x => ({
    modulus: x.modulus, residueClasses: x.classes,
    forcedWrongRrunicOutputs: x.unavoidableErrors,
    contradictoryClasses: x.conflictingGroups.length
  })),
  original3301Contradictions: c3301.conflictingGroups,
  nativePlantedPositiveErrors: positive.unavoidableErrors,
  status: 'No plaintext, author-selected key, or original cipher demonstrated'
}, null, 2));
