"use strict";
/**
 * Exact source-class GP29 quarter-turn oscillator inversion with all linear
 * public-ciphertext input/output taps, instead of one chosen two-tap drive.
 *
 * A source-defined order-four matrix A, A^2=-I (mod29), gives:
 *     K[t+2] = -K[t] + a*C[t] + b*C[t+1]  (mod29)
 * for some a=L*A*B and b=L*B in GF29. Public ciphertext C drives the state.
 *     C[t] = P[t] + K[t] (mod29).
 *
 * All 29^4=707,281 quadruples (a,b,K0,K1) are searched EXACTLY with
 * algebraic elimination: the two initial seeds only generate independent
 * signed four-phase shifts, whose maximizers are independently enumerable.
 * There are only 29² coefficient loops, and no heldout key optimization.
 *
 * Blind planted native-GP English with true hidden tap/seed recovery and
 * original 12,956-rune GP29 source. Node 22 CommonJS, no writes, no deps.
 * @module onion7_133331_general_oscillator
 */
const assert = require("node:assert/strict");
const { glyphs, holdout, logRatio, mod } =
  require("./onion7_133331_feedback_inverse.cjs");

const M = 29;
const P = 4;
const PHASE = [1, 1, -1, -1];
assert.equal(glyphs.length, 12956);
assert.equal(holdout.length, glyphs.length);
assert.equal(logRatio.length, M);

/**
 * Exact forward stream with arbitrary two public ciphertext taps and
 * two hidden startup keys. Repair is causally synchronized by feeding
 * the actual emitted glyph into future state.
 * @param {number[]} plain
 * @param {{a:number,b:number,s0:number,s1:number}} secret
 * @param {()=>number} random
 * @param {boolean} repair
 */
function encrypt(plain, secret, random, repair = false) {
  const emitted = [], keys = [];
  let repairs = 0;
  for (let t = 0; t < plain.length; t++) {
    const key = t === 0 ? secret.s0 : t === 1 ? secret.s1 :
      mod(-keys[t - 2] + secret.a * emitted[t - 2] +
        secret.b * emitted[t - 1]);
    keys.push(key);
    let c = mod(plain[t] + key);
    if (repair && t && c === emitted[t - 1] && random() < 0.81) {
      c = mod(emitted[t - 1] + 1 + Math.floor(random() * 28));
      repairs++;
    }
    emitted.push(c);
  }
  return { cipher: emitted, repairs };
}

/** @param {number[]} cipher @param {{a:number,b:number,s0:number,s1:number}} secret */
function decrypt(cipher, secret) {
  const output = [], keys = [];
  for (let t = 0; t < cipher.length; t++) {
    const key = t === 0 ? secret.s0 : t === 1 ? secret.s1 :
      mod(-keys[t - 2] + secret.a * cipher[t - 2] +
        secret.b * cipher[t - 1]);
    keys.push(key);
    output.push(mod(cipher[t] - key));
  }
  return output;
}

/** @param {number} initial @returns {()=>number} */
function rng(initial) {
  let x = initial >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

/**
 * Split the entire feedback response into two fixed observable streams.
 * For any secret (a,b,s0,s1):
 *     K[t] = a X[t] + b Y[t] + (-1)^(floor(t/2))*s_(t mod2).
 * @param {number[]} cipher
 */
function responses(cipher) {
  const x = new Uint8Array(cipher.length), y = new Uint8Array(cipher.length);
  for (let t = 2; t < cipher.length; t++) {
    x[t] = mod(cipher[t - 2] - x[t - 2]);
    y[t] = mod(cipher[t - 1] - y[t - 2]);
  }
  return { x, y };
}

/**
 * For a,b fixed, compute the best of all 29² secret seeds analytically.
 * Each of the two seed components appears in disjoint output phases.
 * The summations use the empirical GP29 source log-likelihood ratio.
 * @param {number[][]} hist
 * @returns {{total:number,s0:number,s1:number}}
 */
function optimizeSeeds(hist) {
  let e = -Infinity, o = -Infinity, s0 = 0, s1 = 0;
  for (let seed = 0; seed < M; seed++) {
    let scoreEven = 0, scoreOdd = 0;
    for (let x = 0; x < M; x++) {
      scoreEven += hist[0][x] * logRatio[mod(x - seed)] +
        hist[2][x] * logRatio[mod(x + seed)];
      scoreOdd += hist[1][x] * logRatio[mod(x - seed)] +
        hist[3][x] * logRatio[mod(x + seed)];
    }
    if (scoreEven > e) { e = scoreEven; s0 = seed; }
    if (scoreOdd > o) { o = scoreOdd; s1 = seed; }
  }
  return { total: e + o, s0, s1 };
}

/**
 * One exact search of all 29^4 taps and seeds, using only training half.
 * The single selected key is then evaluated on untouched second half.
 * @param {number[]} cipher
 */
function recover(cipher) {
  const { x, y } = responses(cipher);
  const half = Math.floor(cipher.length / 2);
  const hist = Array.from({ length: P }, () => new Uint16Array(M));
  let best = { train: -Infinity };
  for (let a = 0; a < M; a++) {
    for (let b = 0; b < M; b++) {
      for (const row of hist) row.fill(0);
      for (let t = 0; t < half; t++) {
        const d = mod(cipher[t] - a * x[t] - b * y[t]);
        hist[t & 3][d]++;
      }
      const selected = optimizeSeeds(hist);
      if (selected.total > best.train) {
        best = {
          train: selected.total, a, b,
          s0: selected.s0, s1: selected.s1,
        };
      }
    }
  }
  best.train /= half;
  let held = 0;
  for (let t = half; t < cipher.length; t++) {
    const d = mod(cipher[t] - best.a * x[t] - best.b * y[t]);
    const seed = t & 1 ? best.s1 : best.s0;
    const effectiveSeed = PHASE[t & 3] * seed;
    held += logRatio[mod(d - effectiveSeed)];
  }
  best.heldout = held / (cipher.length - half);
  return best;
}

function run() {
  const original = recover(glyphs);
  const trueKey = { a: 17, b: 12, s0: 13, s1: 11 };
  const random = rng(0x133331);
  const source = encrypt(holdout, trueKey, random, true);
  const positive = recover(source.cipher);
  const inverse = decrypt(source.cipher, trueKey);
  const roundtrip = encrypt(inverse, trueKey, random, false).cipher;
  assert.deepEqual(roundtrip, source.cipher);
  const hits = inverse.filter((value, i) => value === holdout[i]).length;
  assert.equal(hits, holdout.length - source.repairs);
  assert.deepEqual(
    { a: positive.a, b: positive.b, s0: positive.s0, s1: positive.s1 },
    trueKey, "Must blindly recover the original hidden planted parameters");
  assert.ok(positive.heldout > 0.32);
  assert.ok(Math.abs(original.train + 0.8003710576254903) < 1e-10);
  assert.ok(Math.abs(original.heldout + 0.9249369313372019) < 1e-10);
  const decodedOriginal = decrypt(glyphs, original);
  const originalRoundtrip = encrypt(decodedOriginal, original, random).cipher;
  assert.deepEqual(originalRoundtrip, glyphs);
  // The original-wrong-key roundtrip is a mandatory software invariant;
  // it has exactly zero independent historical-key identification value.
  const wrongKey = { a: 2, b: 9, s0: 3, s1: 7 };
  assert.deepEqual(encrypt(decrypt(glyphs, wrongKey), wrongKey,
    random).cipher, glyphs);
  return {
    exactSourceRoots: { titleResidue: 17, idResidue: 12,
      squareResidue: 28, charPoly: "x²+1 over F29" },
    model: "All 29^4 initial-key+two-ciphertext-feedback-tap pairs for one book-continuous 2-register oscillator",
    original: { runes: glyphs.length, modelsExhausted: 29 ** 4,
      selected: original, reencryptedWithWrongKey: glyphs.length },
    nativeEnglishPlant: { modelsExhausted: 29 ** 4,
      trueKey, blindlyRecovered: positive, ciphertextEdits: source.repairs,
      exactPlaintextRuneHits: hits,
      sourceRerenderedCiphertextRunes: roundtrip.length },
    status: "No original LP2 plaintext/key recovered. The entire 2-tap book-continuous GP29 public-feedback order-four oscillator family has negative frozen original-language evidence.",
  };
}

if (require.main === module)
  process.stdout.write(JSON.stringify(run(), null, 2) + "\n");
module.exports = { encrypt, decrypt, responses, optimizeSeeds, recover, run };
