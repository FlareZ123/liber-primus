'use strict';

/**
 * Source-constrained reversible GF(29^2) trace projection on the 127 original
 * terminal red/black GP runes. The 256-byte table polynomial is divided
 * exactly by the marked p39 factor (X-24)^2; its 254 quotient coefficients
 * supply 127 field elements under two source-visible pair layouts.
 *
 * The p3 primitive extension specifies u^2=3u+8. The field clock is u^i or
 * z^i (the independent p3/p39 cross-triad root z=23+27u). To avoid losing
 * plaintext at trace-zero positions, use u times the field clock there;
 * this is the first nondegenerate natural projection and is invertible.
 *
 * Every secret affine field offset W in GF841 is tested (all 29^2 keys).
 * The output register is the trace of G_i*(Q_i + W + [P_i,0]).
 * This is a specified experimental cipher, NOT an authenticated LP2 method.
 * No output is considered plaintext solely because it reencrpyts.
 *
 * Node 22, single runnable test:
 * node sims/lp2_red_terminal_127_trace_projection_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} filename @returns {any} */
const readJson = filename => JSON.parse(fs.readFileSync(
  path.join(root, filename), 'utf8'));
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const mod = x => (x % 29 + 29) % 29;
/** @typedef {[number,number]} Field */
/** @param {Field} a @param {Field} b @returns {Field} */
function mul(a, b) {
  return [mod(a[0] * b[0] + 8 * a[1] * b[1]),
    mod(a[0] * b[1] + a[1] * b[0] + 3 * a[1] * b[1])];
}
/** @param {Field} a */
const trace = a => mod(2 * a[0] + 3 * a[1]);
/** @param {number} k */
function inverse(k) {
  assert.notEqual(k, 0);
  for (let v = 1; v < 29; v++) if (mod(v * k) === 1) return v;
  throw Error('nonzero GF29 coordinate is not invertible');
}
/** Exact high-to-low division by X-24, retaining the leading zero. */
function divide(src) {
  const quotient = [mod(src[0])];
  for (let i = 1; i < src.length - 1; i++)
    quotient.push(mod(src[i] + 24 * quotient.at(-1)));
  const remainder = mod(src.at(-1) + 24 * quotient.at(-1));
  assert.equal(remainder, 0);
  return quotient;
}
const coefficient = divide(divide(grid.bytes));
assert.equal(grid.bytes.length, 256);
assert.equal(coefficient.length, 254);
assert.equal(coefficient[0], 0);
const red = corpus.pages.find(p => p.page === 53).indices.slice(128);
const black = corpus.pages.find(p => p.page === 55).indices;
assert.deepEqual([red.length, black.length], [51, 76]);
const observed = red.concat(black);
assert.equal(observed.length, 127);

/**
 * @param {'adjacent'|'halves'} layout
 * @param {'u'|'z'} generator
 * @returns {{factor:number[],source:number[],fieldW1:number[],zeros:number[]}}
 */
function projection(layout, generator) {
  /** @type {Field} */
  const g = generator === 'u' ? [0, 1] : [23, 27];
  /** @type {Field} */
  let power = [1, 0];
  const factor = [], source = [], fieldW1 = [], zeros = [];
  for (let i = 0; i < 127; i++) {
    /** @type {Field} */
    const Q = layout === 'adjacent'
      ? [coefficient[2 * i], coefficient[2 * i + 1]]
      : [coefficient[i], coefficient[i + 127]];
    let effective = power;
    if (trace(power) === 0) {
      // Explicit reversible fallback, no ciphertext fitting.
      effective = mul(power, [0, 1]);
      zeros.push(i);
    }
    const weight = trace(effective);
    assert.notEqual(weight, 0);
    factor.push(weight);
    source.push(trace(mul(effective, Q)));
    fieldW1.push(trace(mul(effective, [0, 1])));
    power = mul(power, g);
  }
  assert.deepEqual(zeros, [15, 45, 75, 105]);
  return { factor, source, fieldW1, zeros };
}

/**
 * Without the reversible fallback, a zero trace factor makes the
 * plaintext rune disappear. These original ciphertext positions then
 * impose exact constraints on the unknown W[1] component even with
 * arbitrary plaintext. Contradictory constraints refute every W.
 * @param {'adjacent'|'halves'} layout
 * @param {'u'|'z'} generator
 * @returns {{positions:number[],forcedW1:number[]}}
 */
function degenerateTraceConstraints(layout, generator) {
  /** @type {Field} */
  const g = generator === 'u' ? [0, 1] : [23, 27];
  /** @type {Field} */
  let power = [1, 0];
  const positions = [], forcedW1 = [];
  for (let i = 0; i < 127; i++) {
    if (trace(power) === 0) {
      /** @type {Field} */
      const Q = layout === 'adjacent'
        ? [coefficient[2 * i], coefficient[2 * i + 1]]
        : [coefficient[i], coefficient[i + 127]];
      const required = mod(observed[i] - trace(mul(power, Q)));
      const fieldW1Coefficient = trace(mul(power, [0, 1]));
      positions.push(i);
      forcedW1.push(mod(required * inverse(fieldW1Coefficient)));
    }
    power = mul(power, g);
  }
  assert.deepEqual(positions, [15, 45, 75, 105]);
  assert(new Set(forcedW1).size > 1);
  return { positions, forcedW1 };
}

/**
 * @param {number[]} text
 * @param {Field} W
 * @param {ReturnType<typeof projection>} t
 */
function encrypt(text, W, t) {
  return text.map((v, i) => mod(t.source[i]
    + t.factor[i] * (v + W[0]) + t.fieldW1[i] * W[1]));
}
/**
 * @param {number[]} cipher
 * @param {Field} W
 * @param {ReturnType<typeof projection>} t
 */
function decrypt(cipher, W, t) {
  return cipher.map((v, i) => mod((v - t.source[i]
    - t.fieldW1[i] * W[1]) * inverse(t.factor[i]) - W[0]));
}
/** @param {string} text @returns {number[]} */
function gpEncode(text) {
  const tokens = new Map(corpus.translit.map((symbol, i) => [symbol, i]));
  const result = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, 'CW').replace(/V/g, 'U')
      .replace(/K/g, 'C').replace(/Z/g, 'S');
    for (let i = 0; i < word.length;) {
      if (tokens.has(word.slice(i, i + 2))) {
        result.push(tokens.get(word.slice(i, i + 2)));
        i += 2;
      } else {
        if (tokens.has(word[i])) result.push(tokens.get(word[i]));
        i++;
      }
    }
  }
  return result;
}
/**
 * An independent source-trained GP29 trigram language reference.
 * @param {number[]} train
 */
function trigram(train) {
  const hist = new Uint32Array(29 ** 3);
  for (let i = 2; i < train.length; i++)
    hist[841 * train[i - 2] + 29 * train[i - 1] + train[i]]++;
  return input => {
    let s = 0;
    for (let i = 2; i < input.length; i++)
      s += Math.log((hist[841 * input[i - 2]
        + 29 * input[i - 1] + input[i]] + 0.1)
        / (train.length - 2 + 0.1 * 29 ** 3));
    return s / (input.length - 2);
  };
}
/** @param {number[]} seq */
function ioc(seq) {
  const h = Array(29).fill(0);
  for (const value of seq) h[value]++;
  return h.reduce((s, n) => s + n * (n - 1), 0)
    / (seq.length * (seq.length - 1));
}
function main() {
  const train = gpEncode(fs.readFileSync(path.join(root,
    'resources/control/emerson_essays_2944.txt'), 'utf8'));
  const heldout = gpEncode(fs.readFileSync(path.join(root,
    'resources/control/gibran_prophet_58585.txt'), 'utf8'));
  assert.equal(train.length, 324630);
  assert.equal(heldout.length, 63114);
  const score = trigram(train);
  const reference = [];
  for (let i = 0; i + 127 <= heldout.length; i += 127)
    reference.push(score(heldout.slice(i, i + 127)));
  reference.sort((a, b) => a - b);
  const controlsMin = reference[0];
  assert(reference.length > 400);

  const sourceSeed = /** @type {Field} */ ([4, 24]);
  const rows = [];
  for (const generator of /** @type {const} */ (['u', 'z'])) {
    for (const layout of /** @type {const} */ (['adjacent', 'halves'])) {
      const t = projection(layout, generator);
      const withoutFallback = degenerateTraceConstraints(layout, generator);
      const expected = {
        'u/adjacent': [9, 22, 25, 12],
        'u/halves': [12, 22, 12, 8],
        'z/adjacent': [17, 4, 0, 12],
        'z/halves': [20, 4, 16, 8]
      };
      assert.deepEqual(withoutFallback.forcedW1,
        expected[generator + '/' + layout]);
      const native = heldout.slice(0, 127);
      const nativeCipher = encrypt(native, sourceSeed, t);
      assert.deepEqual(decrypt(nativeCipher, sourceSeed, t), native);
      // Independent true-source encryption tests that all 127 GP symbols
      // recover; wrong-seed decryptions do not recover the same text.
      assert.notDeepEqual(decrypt(nativeCipher, [sourceSeed[0] + 1,
        sourceSeed[1]], t), native);
      let best = { score: -Infinity, W: [0, 0], plain: [] };
      let sourceSeedScore = -Infinity, nativeBeaters = 0;
      for (let a = 0; a < 29; a++) for (let b = 0; b < 29; b++) {
        const W = /** @type {Field} */ ([a, b]);
        const decoded = decrypt(observed, W, t);
        const value = score(decoded);
        assert(Number.isFinite(value));
        if (value > best.score) best = { score: value, W, plain: decoded };
        if (value >= controlsMin) nativeBeaters++;
        if (a === 4 && b === 24) sourceSeedScore = value;
      }
      assert(best.score < controlsMin - 3);
      rows.push({
        generator, layout, fieldOffsetsTested: 841,
        zeroTracePositions: t.zeros, fallback: 'multiply by original u',
        noFallbackForcedSecretW1: withoutFallback.forcedW1,
        nonFallbackModelValidForAnySecretW: false,
        originalBestTrigram: best.score, originalBestSeed: best.W,
        originalBestIoC: ioc(best.plain),
        originalSourceSeedTrigram: sourceSeedScore,
        scoredAtLeastOneHeldoutNative: nativeBeaters,
        originalBestFirst64: best.plain.slice(0, 64)
          .map(x => corpus.translit[x]).join(' '),
        nativePlaintextExactlyRecovered: native.length
      });
    }
  }
  console.log(JSON.stringify({
    classification: 'bounded all-field-offset original source negative',
    originalCiphertext: {redP53: 51, blackP55: 76, total: 127},
    canonicalTableBytes: 256, quotientCoefficients: 254,
    source: 'p3 field u^2=3u+8, p39 table factor (X-24)^2, p54 Ac24',
    cipherLaw: 'C[i]=Tr(G[i]*(Q[i]+W+[P[i],0])); '
      + 'replace G[i] with G[i]*u only when Tr(G[i])=0',
    trainGP: train.length, independentHeldoutGP: heldout.length,
    native127MinTrigram: controlsMin,
    native127MedianTrigram: reference[Math.floor(reference.length / 2)],
    originalRawTrigram: score(observed), outcomes: rows,
    interpretation: 'source-selectable and invertible trace-output family '
      + 'is not compatible with native GP prose on the original 127-rune block; '
      + 'no unknown plaintext recovered'
  }, null, 2));
}
if (require.main === module) main();
module.exports = { projection, encrypt, decrypt, main };
