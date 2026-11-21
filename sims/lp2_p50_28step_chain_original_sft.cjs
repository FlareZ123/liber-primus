'use strict';

/**
 * Source-frozen LP2 28-step chain and p49-p51 numeric-grid key gate.
 * Read-only Windows-compatible Node.js 22 SFT: node sims/lp2_p50_28step_chain_original_sft.cjs
 *
 * Hypothesis: GP29 ciphertext advances by nonzero steps mod29 for 28
 * plaintext GP symbols, while delta=0 represents rare GP28 (EA).
 * Keyed nonzero steps use the 256 printed table tokens modulo28.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const reference = read('resources/liber-primus/lp1-plaintext-reference.txt');
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length > 0);
const tokens = grid.pages.flatMap((p) => p.tokens);

assert.equal(corpus.translit.length, 29);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((n, p) => n + p.indices.length, 0), 12956);
assert.equal(tokens.length, 256);
assert.equal(grid.alphabet.length, 60);
assert(!tokens.some((s) => s.includes('f')));

const runeOrder = corpus.translit.map((_, i) => i)
  .sort((i, j) => corpus.translit[j].length - corpus.translit[i].length);

/** Greedy historical GP29 transliteration (longest digraph first). */
function toGP(source) {
  const output = [];
  for (const line of source.split('\n')) {
    if (/^\s*#/.test(line) || /^\s*\[/.test(line)) continue;
    for (const match of line.toUpperCase().matchAll(/[A-Z]+/g)) {
      const word = match[0];
      for (let offset = 0; offset < word.length;) {
        const i = runeOrder.find((r) => word.startsWith(corpus.translit[r], offset));
        if (i === undefined) {
          offset++;
        } else {
          output.push(i);
          offset += corpus.translit[i].length;
        }
      }
    }
  }
  return output;
}

const solved = toGP(reference);
assert.equal(solved.length, 3234);
const uni = Array(29).fill(1);
const bi = Array.from({ length: 29 }, () => Array(29).fill(0.3));
for (let i = 0; i < solved.length; i++) {
  uni[solved[i]]++;
  if (i) bi[solved[i - 1]][solved[i]]++;
}
const total = uni.reduce((a, b) => a + b, 0);
const logUni = uni.map((n) => Math.log(n / total));
const logBi = bi.map((row) => {
  const size = row.reduce((a, b) => a + b, 0);
  return row.map((n) => Math.log(n / size));
});

/** The omitted lowercase-f digit is removed from the 60-character alphabet in radix59. */
function gridValues(orderedTokens, base) {
  return orderedTokens.map((s) => {
    const hi = grid.alphabet.indexOf(s[0]);
    const lo = grid.alphabet.indexOf(s[1]);
    assert(hi >= 0 && lo >= 0 && hi !== 41 && lo !== 41);
    return base === 59 ? 59 * hi + lo - Number(lo > 41) : 60 * hi + lo;
  });
}

/**
 * Decode original ciphertext under a fixed 28-step model.
 * One model uses the same key index for every rune independent of word breaks.
 */
function decodePage(indices, values, model, firstClock) {
  let prev = 0;
  const output = [];
  for (let i = 0; i < indices.length; i++) {
    const c = indices[i];
    const delta = ((model.dir * (c - prev)) % 29 + 29) % 29;
    const kpos = (model.reset ? i : firstClock + i) % 256;
    const k = values[model.reverse ? 255 - kpos : kpos] % 28;
    const p = delta === 0 ? 28 : ((delta - 1 + (model.sub ? k : -k)) % 28 + 28) % 28;
    output.push(p);
    prev = c;
  }
  return output;
}

function encodePage(plaintext, values, model, firstClock) {
  let prev = 0;
  const output = [];
  for (let i = 0; i < plaintext.length; i++) {
    const p = plaintext[i];
    const kpos = (model.reset ? i : firstClock + i) % 256;
    const k = values[model.reverse ? 255 - kpos : kpos] % 28;
    const d = p === 28 ? 0 : 1 + ((p - (model.sub ? k : -k)) % 28 + 28) % 28;
    const c = ((prev + model.dir * d) % 29 + 29) % 29;
    output.push(c);
    prev = c;
  }
  return output;
}

function score(values, model) {
  let sum = 0;
  let count = 0;
  let clock = 0;
  for (const pg of pages) {
    const p = decodePage(pg.indices, values, model, clock);
    for (let i = 0; i < p.length; i++) {
      sum += logUni[p[i]];
      if (i) sum += logBi[p[i - 1]][p[i]];
      count++;
    }
    clock += pg.indices.length;
  }
  return sum / count;
}

const models = [];
for (const base of [59, 60])
  for (const reset of [false, true])
    for (const dir of [1, -1])
      for (const reverse of [false, true])
        for (const sub of [false, true])
          models.push({ base, reset, dir, reverse, sub });
assert.equal(models.length, 32);

function best(orderedTokens) {
  const candidates = [];
  for (const base of [59, 60]) {
    const values = gridValues(orderedTokens, base);
    for (const model of models.filter((m) => m.base === base))
      candidates.push({ ...model, score: score(values, model) });
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

const original = best(tokens);
assert.equal(original.base, 59);
assert.equal(original.reset, false);
assert.equal(original.dir, 1);
assert.equal(original.reverse, false);
assert.equal(original.sub, true);
assert(Math.abs(original.score + 8.355942626440667) < 1e-9);

const values = gridValues(tokens, original.base);
let clock = 0;
for (const pg of pages) {
  const recovered = decodePage(pg.indices, values, original, clock);
  assert.deepEqual(encodePage(recovered, values, original, clock), pg.indices);
  clock += pg.indices.length;
}
const nativeControl = solved.slice(0, 300);
assert.deepEqual(
  decodePage(encodePage(nativeControl, values, original, 0), values, original, 0),
  nativeControl
);

// Fixed 128 matched shuffles: preserve all 256 printed token strings, and
// charge BOTH base readings and all 32 orientations in every null trial.
let seed = 0x33012026;
function next() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return seed >>> 0;
}
const nullScores = [];
for (let trial = 0; trial < 128; trial++) {
  const shuffled = tokens.slice();
  for (let j = shuffled.length - 1; j > 0; j--) {
    const k = next() % (j + 1);
    [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
  }
  nullScores.push(best(shuffled).score);
}
nullScores.sort((a, b) => a - b);
const betterOrEqual = nullScores.filter((x) => x >= original.score).length;
assert.equal(betterOrEqual, 118);
assert(Math.abs(nullScores[63] + 8.343598681276122) < 1e-9);

console.log('Source GP plaintext reference runes:', solved.length);
console.log('Original rune-bearing pages and runes:', pages.length, clock);
console.log('Frozen 28-step/table-model configurations:', models.length);
console.log('Best original configuration:', JSON.stringify(original));
console.log('Matched 128 null configurations better or equal:', betterOrEqual);
console.log('Null median:', nullScores[63]);
console.log('Native 300-rune plant/inversion and original-cipher roundtrips: PASS');
console.log('Decision: no original LP2 plaintext or source-selected direct p50 key recovered.');
