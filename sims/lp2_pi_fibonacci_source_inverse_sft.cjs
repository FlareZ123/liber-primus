"use strict";

/**
 * Source-motivated PI/Fibonacci full original-cipher inverse gate.
 * Single runnable file: node sims/lp2_pi_fibonacci_source_inverse_sft.cjs
 * Inputs are the canonical LP2 ciphertext and pinned Gibran-GP controls.
 * No fitted arbitrary phases: test exactly sixteen source Fibonacci ordinals.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const originalPages = Array.from({length: 56}, (_, page) => {
  const entry = corpus.pages.find(item => item.page === page);
  return entry ? entry.indices : [];
}).filter(page => page.length);
assert.equal(originalPages.length, 55);
assert.equal(originalPages.flat().length, 12956);

const gpTokens = corpus.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);

/** Greedily encode independently pinned English prose as native GP29. */
function gpEnglish(text) {
  const runes = [];
  for (const rawWord of text.match(/[A-Za-z]+/g) || []) {
    const normalized = rawWord.toUpperCase().replace(/[VKZQ]/g,
      character => ({V: "U", K: "C", Z: "S", Q: "C"})[character]);
    for (let i = 0; i < normalized.length;) {
      const token = gpTokens.find(item => normalized.startsWith(item.token, i));
      if (!token) break;
      runes.push(token.index);
      i += token.token.length;
    }
  }
  return runes;
}

const source = fs.readFileSync(path.join(root,
  "resources", "control", "gibran_prophet_58585.txt"), "utf8");
const native = gpEnglish(source);
const frequencies = Array(29).fill(0);
for (const rune of native) frequencies[rune]++;
const logProbs = frequencies.map(value =>
  Math.log((value + 0.5) / (native.length + 14.5)));

/** Integer square root for sufficiently large exact positive BigInts. */
function isqrt(value) {
  let x = 1n << BigInt(Math.ceil(value.toString(2).length / 2));
  for (;;) {
    const next = (x + value / x) >> 1n;
    if (next >= x) return x;
    x = next;
  }
}

/** Chudnovsky binary splitting: exact terms P, Q, T for pi. */
function split(a, b) {
  if (b - a === 1) {
    if (!a) return [1n, 1n, 13591409n];
    const k = BigInt(a);
    const P = (6n * k - 5n) * (2n * k - 1n) * (6n * k - 1n);
    const Q = k * k * k * 10939058860032000n;
    let T = P * (13591409n + 545140134n * k);
    if (a % 2) T = -T;
    return [P, Q, T];
  }
  const mid = Math.floor((a + b) / 2);
  const [p1, q1, t1] = split(a, mid);
  const [p2, q2, t2] = split(mid, b);
  return [p1 * p2, q1 * q2, t1 * q2 + p1 * t2];
}

const piPrecision = 25000;
const scale = 10n ** BigInt(piPrecision);
const [, denominator, numerator] = split(
  0, Math.floor(piPrecision / 14.181647462) + 2);
const pi = 426880n * isqrt(10005n * scale * scale)
  * denominator / numerator;
const decimalPi = pi.toString();
assert(decimalPi.startsWith(
  "314159265358979323846264338327950288419716939937510582097494"),
  "pi high-precision source failed exact decimal regression");

/** Decimal pi's fractional digits interpreted in an arbitrary integer base. */
function piFraction(radix, count) {
  let remainder = pi - 3n * scale;
  const result = [];
  for (let i = 0; i < count; i++) {
    remainder *= BigInt(radix);
    result.push(Number(remainder / scale));
    remainder %= scale;
  }
  return result;
}
const pi29 = piFraction(29, 15000);
const pi28 = piFraction(28, 15000);
const pi10 = decimalPi.slice(1).split("").map(Number);
assert.deepEqual(pi29.slice(0, 17),
  [4, 3, 2, 8, 23, 0, 12, 19, 26, 22, 19, 26, 12, 11, 9, 18, 4]);
assert.deepEqual(pi28.slice(0, 17),
  [3, 27, 0, 6, 21, 18, 24, 19, 25, 21, 27, 10, 7, 7, 4, 7, 11]);

const fibonacci = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144,
  233, 377, 610, 987];
const keySources = [
  {name: "pi29", kind: "direct29", key: pi29},
  {name: "piDecimal", kind: "direct29", key: pi10},
  {name: "pi28", kind: "step28", key: pi28},
  {name: "piDecimal", kind: "step28", key: pi10}
];

/**
 * Decode original ciphertext without fitting any key bytes.
 * direct29: plaintext = cipher +/- pi_digit mod29.
 * step28: cipher delta zero => literal EA, otherwise delta-1 +/- key mod28;
 * no key consumed on each page head or on a zero ciphertext step.
 * @param {number[][]} pages
 * @param {{name:string,kind:string,key:number[]}} sourceKey
 * @param {boolean} reset
 * @param {number} phase
 * @param {number} sign
 */
function scoreModel(pages, sourceKey, reset, phase, sign) {
  const logScore = [0, 0];
  const lengths = [0, 0];
  const counts = [Array(29).fill(0), Array(29).fill(0)];
  let clock = 0;
  for (let page = 0; page < pages.length; page++) {
    if (reset) clock = 0;
    const group = page < 28 ? 0 : 1;
    const symbols = pages[page];
    for (let i = 0; i < symbols.length; i++) {
      let plain;
      if (sourceKey.kind === "direct29") {
        const keyIndex = phase + clock++;
        assert(keyIndex < sourceKey.key.length);
        plain = (symbols[i] + sign * sourceKey.key[keyIndex] + 290) % 29;
      } else if (i === 0) {
        plain = symbols[0];
      } else if (symbols[i] === symbols[i - 1]) {
        plain = 28;
      } else {
        const keyIndex = phase + clock++;
        assert(keyIndex < sourceKey.key.length);
        const step = (symbols[i] - symbols[i - 1] + 29) % 29;
        plain = (step - 1 + sign * sourceKey.key[keyIndex] + 280) % 28;
      }
      counts[group][plain]++;
      logScore[group] += logProbs[plain];
      lengths[group]++;
    }
  }
  return {
    source: sourceKey.name, kind: sourceKey.kind, pageReset: reset,
    phase, sign,
    train: logScore[0] / lengths[0],
    holdout: logScore[1] / lengths[1],
    holdoutIoC: counts[1].reduce((sum, n) => sum + n * (n - 1), 0)
      / (lengths[1] * (lengths[1] - 1))
  };
}

/** True forward/reverse control for both proposed reversible registers. */
function positiveControls() {
  const plain = native.slice(0, 1000);
  const directCipher = plain.map((rune, i) => (rune - pi29[i] + 29) % 29);
  const directRecovered = directCipher.map((rune, i) =>
    (rune + pi29[i]) % 29);
  assert.deepEqual(directRecovered, plain);

  const previousCipher = [plain[0]];
  let keyClock = 0;
  for (let i = 1; i < plain.length; i++) {
    const previous = previousCipher.at(-1);
    if (plain[i] === 28) {
      previousCipher.push(previous);
    } else {
      const nonzeroStep = 1 + (plain[i] - pi28[keyClock++] + 280) % 28;
      previousCipher.push((previous + nonzeroStep) % 29);
    }
  }
  let recoveredClock = 0;
  const recovered = [previousCipher[0]];
  for (let i = 1; i < previousCipher.length; i++) {
    if (previousCipher[i] === previousCipher[i - 1]) {
      recovered.push(28);
    } else {
      const step = (previousCipher[i] - previousCipher[i - 1] + 29) % 29;
      recovered.push((step - 1 + pi28[recoveredClock++] + 280) % 28);
    }
  }
  assert.deepEqual(recovered, plain);
  return {direct: directRecovered.length, step: recovered.length,
    stepKeyConsumed: keyClock};
}

const trials = [];
for (const sourceKey of keySources) {
  for (const reset of [true, false]) {
    for (const phase of fibonacci) {
      for (const sign of [-1, 1]) {
        trials.push(scoreModel(originalPages, sourceKey, reset, phase, sign));
      }
    }
  }
}
assert.equal(trials.length, 256);
const byTraining = trials.slice().sort((a, b) => b.train - a.train);
const byHoldout = trials.slice().sort((a, b) => b.holdout - a.holdout);
const top = byTraining[0];
assert.equal(top.source, "pi28");
assert.equal(top.kind, "step28");
assert.equal(top.pageReset, false);
assert.equal(top.phase, 8);
assert.equal(top.sign, -1);
assert(Math.abs(top.train - (-4.2308512389596205)) < 1e-10);
assert(Math.abs(top.holdout - (-4.286048950541107)) < 1e-10);
assert(byHoldout[0].holdout < -4.2);
const nativeMean = frequencies.reduce((total, n, index) =>
  total + n * logProbs[index], 0) / native.length;
assert(nativeMean > -3.1 && nativeMean < -2.8);
const control = positiveControls();
console.log(JSON.stringify({
  status: "All 256 source-motivated direct pi/Fibonacci original-input keys negative",
  originalRunes: 12956, piDecimalDigits: piPrecision,
  originalCipherMean: originalPages.flat().reduce((sum, rune) =>
    sum + logProbs[rune], 0) / 12956,
  nativeGpReferenceMean: nativeMean, bestTraining: byTraining.slice(0, 4),
  retrospectivelyBestHoldout: byHoldout.slice(0, 2), control
}, null, 2));
console.log("PASS: pi digits independently regenerated; original/plant forward inverse checked.");