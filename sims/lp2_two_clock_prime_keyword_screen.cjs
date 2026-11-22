#!/usr/bin/env node
"use strict";

// Source-constrained two-clock test:
//   outer stream: phi(prime) mod 29, with collision-triggered re-draw;
//   inner stream: LP1 Vigenere keyword, with an independent phase;
//   literal GP29 F (index 0) does not advance the inner phase.
// No code is imported from the external H1 reference implementation.

const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const RUNES = corpus.translit;
const RUNE_INDEX = new Map(RUNES.map((r, i) => [r, i]));
const MOD = 29;
const mod = (x) => ((x % MOD) + MOD) % MOD;

function encodeWord(word) {
  const w = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < w.length;) {
    const pair = RUNE_INDEX.get(w.slice(i, i + 2));
    if (pair !== undefined) {
      out.push(pair);
      i += 2;
    } else {
      const one = RUNE_INDEX.get(w[i]);
      if (one !== undefined) out.push(one);
      i++;
    }
  }
  return out;
}

function encodeText(text) {
  return (text.match(/[A-Za-z]+/g) || []).flatMap(encodeWord);
}

const reference = encodeText(read("resources/liber-primus/lp1-plaintext-reference.txt"));
const shakespeare = encodeText(read("resources/control/shakespeare_first300k.txt"));
if (reference.length < 900) throw new Error("LP1 reference too short for held-out control");

// Hold out 300 symbols for the positive control; train only on the remaining LP1
// reference plus the independent Shakespeare control corpus.
const training = shakespeare.concat(reference.slice(0, 600), reference.slice(900));
const alpha = 0.35;
const unigram = Array(MOD).fill(0);
const bigram = Array.from({ length: MOD }, () => Array(MOD).fill(0));
for (let i = 0; i < training.length; i++) {
  unigram[training[i]]++;
  if (i) bigram[training[i - 1]][training[i]]++;
}

// Log-likelihood ratio in the same scale as the reference screen:
// 10 * ln(29 * P(next | previous)).
const table = Array.from({ length: MOD + 1 }, () => Array(MOD).fill(0));
for (let b = 0; b < MOD; b++) {
  table[MOD][b] = 10 * Math.log(
    MOD * (unigram[b] + alpha) / (training.length + alpha * MOD)
  );
}
for (let a = 0; a < MOD; a++) {
  for (let b = 0; b < MOD; b++) {
    table[a][b] = 10 * Math.log(
      MOD * (bigram[a][b] + alpha) / (unigram[a] + alpha * MOD)
    );
  }
}

function sievePrimes(count) {
  const limit = 100000;
  const composite = new Uint8Array(limit + 1);
  const primes = [];
  for (let p = 2; p * p <= limit; p++) {
    if (!composite[p]) {
      for (let k = p * p; k <= limit; k += p) composite[k] = 1;
    }
  }
  for (let p = 2; p <= limit && primes.length < count; p++) {
    if (!composite[p]) primes.push(p);
  }
  if (primes.length < count) throw new Error("Prime sieve limit too small");
  return primes;
}

// The source-selected outer library stream is phi(p) = p - 1, reduced mod 29.
const phiPrime = sievePrimes(6000).map((p) => (p - 1) % MOD);

function xorshift32(seed) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

// Synthetic positive control. The inner and outer pointers are independent.
// A literal F (GP29 index 0) is passed unchanged and holds the inner phase.
function plant(plain, keyword, offset, phase, seed, keepProbability = 0.18) {
  const random = xorshift32(seed);
  const cipher = [];
  let outer = 0;
  let inner = phase;
  let rejected = 0;

  for (const p of plain) {
    let q;
    if (p === 0) {
      q = 0;
    } else {
      q = mod(p + keyword[inner]);
      inner = (inner + 1) % keyword.length;
    }

    for (;;) {
      const c = mod(q + phiPrime[offset + outer]);
      outer++;
      if (cipher.length && c === cipher[cipher.length - 1] &&
          random() >= keepProbability) {
        rejected++;
        continue;
      }
      cipher.push(c);
      break;
    }
  }
  return { cipher, rejected, consumed: outer };
}

// Invert the outer collision re-draw. The returned candidates are the
// no-skip, one-rejected-key, and two-rejected-key possibilities.
function outerCandidates(cipherSymbol, previousCipher, offset, outer) {
  const k0 = phiPrime[offset + outer];
  const q0 = mod(cipherSymbol - k0);
  const candidates = [{ q: q0, nextOuter: outer + 1, rejected: 0 }];

  if (previousCipher >= 0) {
    const k1 = phiPrime[offset + outer + 1];
    const q1 = mod(cipherSymbol - k1);
    if (mod(q1 + k0) === previousCipher) {
      candidates.push({ q: q1, nextOuter: outer + 2, rejected: 1 });
    }

    const k2 = phiPrime[offset + outer + 2];
    const q2 = mod(cipherSymbol - k2);
    if (mod(q2 + k0) === previousCipher &&
        mod(q2 + k1) === previousCipher) {
      candidates.push({ q: q2, nextOuter: outer + 3, rejected: 2 });
    }
  }
  return candidates;
}

// Beam state carries independent outer and inner clocks:
// (outer pointer, inner phase, previous plaintext rune).
function decode(cipher, keyword, offset, initialPhase, width = 16, limit = cipher.length) {
  let beam = [{
    outer: 0,
    inner: initialPhase,
    last: MOD,
    score: 0,
    previous: null,
    plainSymbol: -1,
    rejected: 0
  }];

  for (let i = 0; i < limit; i++) {
    const previousCipher = i ? cipher[i - 1] : -1;
    const merged = new Map();

    for (const old of beam) {
      const candidates = outerCandidates(cipher[i], previousCipher, offset, old.outer);
      for (const candidate of candidates) {
        // Ordinary inner Vigenere branch.
        const ordinary = {
          p: mod(candidate.q - keyword[old.inner]),
          nextInner: (old.inner + 1) % keyword.length
        };
        const variants = [ordinary];

        // Literal F branch: q=F is emitted as F without consuming the keyword.
        if (candidate.q === 0) {
          variants.push({ p: 0, nextInner: old.inner });
        }

        for (const variant of variants) {
          const score = old.score + table[old.last][variant.p];
          const state = {
            outer: candidate.nextOuter,
            inner: variant.nextInner,
            last: variant.p,
            score,
            previous: old,
            plainSymbol: variant.p,
            rejected: old.rejected + candidate.rejected
          };
          const id = state.outer + "," + state.inner + "," + state.last;
          const prior = merged.get(id);
          if (!prior || prior.score < score) merged.set(id, state);
        }
      }
    }

    beam = Array.from(merged.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, width);
    if (!beam.length) throw new Error("Beam exhausted at symbol " + i);
  }

  const best = beam[0];
  const plaintext = [];
  for (let state = best; state.previous !== null; state = state.previous) {
    plaintext.push(state.plainSymbol);
  }
  plaintext.reverse();

  return {
    score: best.score,
    scorePerRune: best.score / limit,
    rejected: best.rejected,
    outerConsumed: best.outer,
    plaintext
  };
}

const pages = corpus.pages.filter((p) => p.page <= 55);
const pageStarts = new Map();
let cursor = 0;
for (const page of pages) {
  pageStarts.set(page.page, cursor);
  cursor += page.indices.length;
}
const flatCipher = pages.flatMap((p) => p.indices);
const absolute = (page, offset) => {
  if (!pageStarts.has(page)) throw new Error("Missing page " + page);
  return pageStarts.get(page) + offset;
};

const sectionDefinitions = [
  { name: "p0-to-p3", start: absolute(0, 13), end: absolute(3, 0) },
  { name: "p3-to-p8", start: absolute(3, 16), end: absolute(8, 0) }
];
const windows = sectionDefinitions.map((section) => {
  const sectionLength = section.end - section.start;
  const cipher = flatCipher.slice(section.start, section.start + 300);
  if (sectionLength < 300 || cipher.length !== 300) {
    throw new Error("Section window is incomplete: " + section.name);
  }
  return { name: section.name, sectionLength, cipher };
});

const keywords = [
  { name: "DIVINITY", values: [23, 10, 1, 10, 9, 10, 16, 26] },
  { name: "FIRFUMFERENFE", values: [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18] }
];

const heldOut = reference.slice(600, 900);
const OFFSET_MAX = 4000;
const WIDTH = 16;
const SCREEN_LENGTH = 30;
const SCREEN_THRESHOLD = -4;

function screenWindow(window, keyword) {
  const shortCandidates = [];
  for (let offset = 0; offset <= OFFSET_MAX; offset++) {
    for (let phase = 0; phase < keyword.values.length; phase++) {
      const result = decode(window.cipher, keyword.values, offset, phase, WIDTH, SCREEN_LENGTH);
      if (result.score >= SCREEN_THRESHOLD) {
        shortCandidates.push({ offset, phase, score30: result.score });
      }
    }
  }

  const fullCandidates = shortCandidates.map((candidate) => {
    const result = decode(window.cipher, keyword.values,
      candidate.offset, candidate.phase, WIDTH, 300);
    return {
      ...candidate,
      score300: result.score,
      scorePerRune: result.scorePerRune,
      rejected: result.rejected,
      outerConsumed: result.outerConsumed,
      sample: result.plaintext.slice(0, 48).map((x) => RUNES[x]).join(" ")
    };
  });

  const bestScreen = shortCandidates.slice()
    .sort((a, b) => b.score30 - a.score30)
    .slice(0, 3);
  const bestFull = fullCandidates.slice()
    .sort((a, b) => b.score300 - a.score300)
    .slice(0, 3);

  return {
    window: window.name,
    sectionLength: window.sectionLength,
    screenSurvivors: fullCandidates.length,
    bestScreen,
    bestFull
  };
}

const positiveControls = [];
const screens = [];
for (const keyword of keywords) {
  const planted = plant(heldOut, keyword.values, 1234, 3, 0x15ac1234);
  const recovered = decode(planted.cipher, keyword.values, 1234, 3, WIDTH, 300);
  const accuracy = recovered.plaintext.reduce(
    (n, symbol, i) => n + (symbol === heldOut[i] ? 1 : 0), 0
  ) / heldOut.length;
  if (accuracy !== 1) {
    throw new Error("Positive control failed for " + keyword.name + ": " + accuracy);
  }
  positiveControls.push({
    keyword: keyword.name,
    length: heldOut.length,
    offset: 1234,
    phase: 3,
    plantedRejected: planted.rejected,
    recoveredRejected: recovered.rejected,
    accuracy,
    scorePerRune: recovered.scorePerRune
  });

  for (const window of windows) {
    screens.push({
      keyword: keyword.name,
      ...screenWindow(window, keyword)
    });
  }
}

const output = {
  model: {
    outerStream: "phi(prime) = (prime - 1) mod 29",
    outerClock: "advances on each attempted outer key; collision re-draws do not advance inner phase",
    innerClock: "Vigenere keyword phase advances per plaintext rune",
    literalF: "GP29 symbol 0 passes unchanged and holds inner phase",
    collisionModel: "skip/re-draw, up to two rejected outer keys in the inverse",
    outerSign: 1,
    innerSign: 1,
    atbash: false,
    offsetRange: [0, OFFSET_MAX],
    phaseSearch: "all phases for each keyword",
    beamWidth: WIDTH,
    screenLength: SCREEN_LENGTH,
    screenThreshold: SCREEN_THRESHOLD,
    verificationLength: 300,
    bigramTrainingSymbols: training.length,
    bigramTraining: "Shakespeare first 300k plus LP1 reference excluding the held-out 300-symbol plant",
    score: "10 * ln(29 * P(next | previous)); alpha=0.35"
  },
  positiveControls,
  screens
};

process.stdout.write(JSON.stringify(output, null, 2) + "\n");
