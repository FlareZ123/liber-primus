'use strict';
/**
 * Source-locked red-triangle -> LP2 page55 exact-length key experiment.
 *
 * The already-established red-prime triangle uses physical p40 red8,
 * p15 first red9, p53 red51. The p54 title contributes its eight
 * red runes after the visibly illuminated first A:
 * 8 + 9 + 51 + (9 - 1) = 76, the length of p55.
 *
 * Test complete reversible GP29 direct/differential 76-rune pads,
 * plus the explicit EA/zero-step rank28 alternative. Every candidate
 * uses original source bytes, with no fitted arbitrary key glyphs.
 * Statistical controls refit the ENTIRE 384-model GP29 search.
 *
 * Result is a finite SOURCE-NEGATIVE, NOT a decryption.
 * Run from repository root: node sims/red_triangle_page55_source_inverse.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'lp2-corpus.json'), 'utf8'));
const ink = JSON.parse(fs.readFileSync(path.join(ROOT, 'lp2-ink-annotations.json'), 'utf8'));
const mod = (v, n) => (v % n + n) % n;
const getPage = page => corpus.pages.find(p => p.page === page);
const getInk = page => ink.pages.find(p => p.page === page);

/** @param {number} page @param {number} start @param {number} length */
function red(page, start, length) {
  const span = getInk(page).red_spans.find(s => s.start === start && s.length === length);
  assert.ok(span, 'Exact original red-source span missing');
  const sequence = getPage(page).indices.slice(start, start + length);
  assert.equal(sequence.map(i => corpus.runes[i]).join(''), span.runes);
  return sequence;
}
const a = red(15, 0, 9);
const b = red(40, 0, 8);
const c = red(53, 128, 51);
const title54 = red(54, 0, 9);
assert.equal(title54[0], 24, 'Original illuminated A is the excluded source glyph');
const parts = [a, b, c, title54.slice(1)];
const cipher = getPage(55).indices;
assert.deepEqual(parts.map(x => x.length), [9, 8, 51, 8]);
assert.equal(cipher.length, 76);
const primeSum = seq => seq.reduce((sum, i) => sum + corpus.prime[i], 0);
assert.deepEqual([primeSum(b), primeSum(a), primeSum(c)], [435, 638, 2262]);

/** @param {number[]} seq */
function ioc(seq) {
  const counts = Array(29).fill(0);
  for (const glyph of seq) counts[glyph]++;
  return counts.reduce((v, n) => v + n * (n - 1), 0) /
    (seq.length * (seq.length - 1));
}
/** @param {number[]} src @param {{values:number[],sign:number,mode:string}} setting */
function decode(src, setting) {
  let prev = 0;
  return src.map((glyph, i) => {
    const input = setting.mode === 'relative' ? mod(glyph - prev, 29) : glyph;
    prev = glyph;
    return mod(input + setting.sign * setting.values[i], 29);
  });
}
/** @param {number[]} plain @param {{values:number[],sign:number,mode:string}} setting */
function encode(plain, setting) {
  let prev = 0;
  return plain.map((glyph, i) => {
    const value = mod(glyph - setting.sign * setting.values[i] +
      (setting.mode === 'relative' ? prev : 0), 29);
    prev = value;
    return value;
  });
}
const permutations = [];
/** @param {number[]} left @param {number[]} prefix */
function permute(left, prefix) {
  if (!left.length) { permutations.push(prefix); return; }
  for (let i = 0; i < left.length; i++)
    permute(left.filter((_, j) => j !== i), [...prefix, left[i]]);
}
permute([0, 1, 2, 3], []);
assert.equal(permutations.length, 24);

const models = [];
for (const order of permutations) {
  for (const reverse of [false, true]) {
    const key = order.flatMap(index => reverse ?
      parts[index].slice().reverse() : parts[index]);
    for (const primeKey of [false, true]) {
      const values = key.map(i => primeKey ? corpus.prime[i] % 29 : i);
      for (const sign of [-1, 1]) {
        for (const mode of ['direct', 'relative']) {
          models.push({
            order: order.join(''), reverse, primeKey, sign, mode, values
          });
        }
      }
    }
  }
}
assert.equal(models.length, 384);
const rank = models.map((model, i) => ({i, ioc: ioc(decode(cipher, model))}))
  .sort((x, y) => y.ioc - x.ioc);
const best = models[rank[0].i];
const originalBest = rank[0].ioc;
const frozen = models.find(m => m.order === '0123' && !m.reverse &&
  !m.primeKey && m.sign === -1 && m.mode === 'direct');
const baseline = ioc(decode(cipher, frozen));
const bestPlain = decode(cipher, best);

/** @param {number[]} arr */
function rank28IOC(arr) {
  const out = [];
  const keyMaps = [];
  for (const order of permutations) for (const reverse of [false, true]) {
    const key = order.flatMap(i => reverse ? parts[i].slice().reverse() : parts[i]);
    for (const primeKey of [false, true]) for (const sign of [-1, 1]) {
      const values = key.map(i => (primeKey ? corpus.prime[i] : i) % 28);
      const output = [];
      for (let i = 1; i < arr.length; i++) {
        const step = mod(arr[i] - arr[i - 1], 29);
        output.push(step === 0 ? 28 : mod(step - 1 + sign * values[i], 28));
      }
      out.push(ioc(output));
      keyMaps.push({order: order.join(''), reverse, primeKey, sign});
    }
  }
  const winning = out.indexOf(Math.max(...out));
  return {bestIoC: out[winning], bestModel: keyMaps[winning]};
}
const rank28 = rank28IOC(cipher);

// Full model-refitted, exact-histogram p55 controls. This is exploratory;
// model source selection was informed by the already inspected manuscript.
let state = 0x53221540;
function random() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const nullMaxima = [];
let exceed = 0;
for (let repeat = 0; repeat < 1000; repeat++) {
  const shuffled = cipher.slice();
  for (let j = shuffled.length - 1; j > 0; j--) {
    const k = random() % (j + 1);
    [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
  }
  let max = -1;
  for (const model of models) max = Math.max(max, ioc(decode(shuffled, model)));
  nullMaxima.push(max);
  if (max >= originalBest - 1e-12) exceed++;
}
nullMaxima.sort((x, y) => x - y);

// Source-native solved-Cicada GP English plant. The key is deliberately known
// to the plant only. Wrong keys ALSO satisfy arbitrary-ciphertext roundtrips.
const mapping = new Map(corpus.translit.map((x, i) => [x, i]));
function encodeGP(text) {
  const latin = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/K/g, 'C').replace(/Z/g, 'S')
    .replace(/[^A-Z]/g, '');
  const seq = [];
  for (let i = 0; i < latin.length;) {
    const digraph = mapping.get(latin.slice(i, i + 2));
    if (digraph !== undefined) { seq.push(digraph); i += 2; }
    else {
      const simple = mapping.get(latin[i]);
      assert.notEqual(simple, undefined);
      seq.push(simple); i++;
    }
  }
  return seq;
}
const native = encodeGP('WELCOME PILGRIM TO THE GREAT JOURNEY TOWARD ' +
  'THE END OF ALL THINGS IT IS NOT AN EASY TRIP BUT FOR THOSE WHO ' +
  'FIND THEIR WAY HERE IT IS A NECESSARY ONE').slice(0, 76);
assert.equal(native.length, 76);
for (const mode of ['direct', 'relative']) {
  const chosen = {...frozen, mode};
  const synthetic = encode(native, chosen);
  assert.deepEqual(decode(synthetic, chosen), native);
  assert.deepEqual(encode(decode(synthetic, chosen), chosen), synthetic);
}
assert.deepEqual(encode(decode(cipher, best), best), cipher);
const wrongKey = models.find(m => m.order === '3210' && m.sign === 1);
assert.deepEqual(encode(decode(cipher, wrongKey), wrongKey), cipher);


// A stronger cross-page alignment: the SAME four whole red sources have
// 9+8+51+9=77 runes, while physical p54+p55 has 232+76=308=4*77.
// Because p54 begins with the visually distinguished red A, p54 ends at
// cyclic key position 0 and p55 covers the final 76 positions of the fourth
// cycle. This length relation is exact, but was recognized retrospectively.
const sectionCipher = [...getPage(54).indices, ...cipher];
assert.equal(sectionCipher.length, 4 * 77);
assert.equal(getPage(54).indices.length, 3 * 77 + 1);
assert.equal(getPage(55).indices.length, 77 - 1);
const wholeRedParts = [a, b, c, title54];
const sourceOrders77 = [
  ['physical', [0, 1, 2, 3]],
  ['triangle', [1, 0, 2, 3]],
  ['illum-physical', [3, 0, 1, 2]],
  ['illum-triangle', [3, 1, 0, 2]]
];
const models77 = [];
for (const [sourceOrder, order] of sourceOrders77)
  for (const reverse of [false, true])
    for (const primeKey of [false, true])
      for (const sign of [-1, 1])
        for (const mode of ['direct', 'relative']) {
          const source77 = order.flatMap(i => reverse ?
            wholeRedParts[i].slice().reverse() : wholeRedParts[i]);
          assert.equal(source77.length, 77);
          const cycle = source77.map(i => primeKey ? corpus.prime[i] % 29 : i);
          const values = Array.from({length: 308}, (_, i) => cycle[i % 77]);
          models77.push({sourceOrder, reverse, primeKey, sign, mode, values});
        }
assert.equal(models77.length, 64);
const evaluated77 = models77.map((model, i) =>
  ({i, ioc: ioc(decode(sectionCipher, model))}))
  .sort((x, y) => y.ioc - x.ioc);
const winner77 = models77[evaluated77[0].i];
const best77 = evaluated77[0].ioc;

// Plant a genuine GP-English register from the independently solved Cicada
// welcome page (source file is text, never fitted to unknown LP2). Exactly
// recover all 308 symbols under one chosen original 77-cycle.
const solvedReference = fs.readFileSync(
  path.join(ROOT, 'lp1-plaintext-reference.txt'), 'utf8');
const solvedWelcome = solvedReference.split('### 3\n')[1].split('### 4')[0];
assert.ok(solvedWelcome.includes('WELCOME, PILGRIM'));
const native77 = encodeGP(solvedWelcome).slice(0, 308);
assert.equal(native77.length, 308);
const canonical77 = models77.find(m =>
  m.sourceOrder === 'physical' && !m.reverse && !m.primeKey &&
  m.sign === -1 && m.mode === 'direct');
const planted77 = encode(native77, canonical77);
assert.deepEqual(decode(planted77, canonical77), native77);
assert.deepEqual(encode(decode(planted77, canonical77), canonical77), planted77);
assert.deepEqual(encode(decode(sectionCipher, winner77), winner77), sectionCipher);

let state77 = 0x54771553;
function random77() {
  state77 ^= state77 << 13;
  state77 ^= state77 >>> 17;
  state77 ^= state77 << 5;
  return state77 >>> 0;
}
const refit77 = [];
let exceed77 = 0;
for (let control = 0; control < 1000; control++) {
  const shuffled = sectionCipher.slice();
  for (let j = shuffled.length - 1; j > 0; j--) {
    const k = random77() % (j + 1);
    [shuffled[j], shuffled[k]] = [shuffled[k], shuffled[j]];
  }
  let bestShuffled = -1;
  for (const model of models77)
    bestShuffled = Math.max(bestShuffled, ioc(decode(shuffled, model)));
  refit77.push(bestShuffled);
  if (bestShuffled >= best77 - 1e-12) exceed77++;
}
refit77.sort((x, y) => x - y);
const section77Output = {
  source: 'red p15 9 + red p40 8 + red p53 51 + complete red p54 9',
  sourceRunes: 77,
  section: 'original physical LP2 p54 and p55 concatenated',
  originalSectionRunes: sectionCipher.length,
  originalPageLengths: [getPage(54).indices.length, getPage(55).indices.length],
  period: 77,
  completeCycles: 4,
  sourceOrders: sourceOrders77.map(x => x[0]),
  fullKeyModels: models77.length,
  originalSectionIoC: ioc(sectionCipher),
  maximumDecodedOriginalIoC: best77,
  selectedModel: {
    order: winner77.sourceOrder, reverse: winner77.reverse,
    primeKey: winner77.primeKey, sign: winner77.sign,
    mode: winner77.mode
  },
  refitHistogramShuffles: 1000,
  refitAtLeastAsLarge: exceed77,
  refitAddOneP: (exceed77 + 1) / 1001,
  refitMedian: refit77[499],
  refit95thPercentile: refit77[949],
  positiveOriginalRegister: {
    source: 'verified solved-Cicada welcome excerpt, GP-tokenized',
    exactlyRecoveredRunes: native77.length,
    sourceGPPlainIoC: ioc(native77),
    plantedGP29CipherIoC: ioc(planted77)
  },
  result: 'No authentic unknown plaintext or 77-cycle key recovered.'
};

const output = {
  source: 'LP2 p15 red9 + p40 red8 + p53 red51 + p54 red9 excluding illuminated first A',
  sourceLengths: parts.map(x => x.length),
  section77: section77Output,
  originalP55Runes: cipher.length,
  sourcePrimeSums: [primeSum(a), primeSum(b), primeSum(c)],
  sourceHypothesis: 'four original red-source fragments as a 76-rune direct/differential key',
  gp29Models: models.length,
  rawP55IoC: ioc(cipher),
  physicallyOrderedDirectIoC: baseline,
  bestOriginalIoC: originalBest,
  bestModel: {
    order: best.order, reverseWithinSpans: best.reverse,
    gpPrimeKey: best.primeKey, sign: best.sign, mode: best.mode
  },
  bestOriginalPrefixGP: bestPlain.slice(0, 38).map(x => corpus.translit[x]).join('-'),
  sourcePermutationNulls: 1000,
  refitNullAtLeastOriginal: exceed,
  refitNullAddOneP: (exceed + 1) / 1001,
  refitNullMedian: nullMaxima[499],
  refitNullP95: nullMaxima[949],
  reservedEADifferential28: rank28,
  sourceNativePlant: {
    gpRunes: native.length, roundtripTrueKey: true,
    wrongKeyOriginalRoundtripAlsoPasses: true
  },
  conclusion: 'No readable unknown plaintext or independently identified key; exact-length source clue remains exploratory.'
};
console.log(JSON.stringify(output, null, 2));
