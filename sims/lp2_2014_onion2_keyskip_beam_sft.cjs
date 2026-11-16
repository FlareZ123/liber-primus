#!/usr/bin/env node
'use strict';

// Source-key gate for the externally proposed LP2 ciphertext collision/key-skip model.
// Independent Node implementation of the published skip-aware beam method; see:
// https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round18/L2-filter-leak/RESULTS.md
// https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/campaign18_skip/skipdecode.py
// The external repository is MIT-licensed. This file does not import or copy its code.
//
// This tests only source-order, phase-zero, continuously repeated 2014 Onion2 keys.
// It does not establish that the proposed filter or either key was used by Cicada.
// The alternative ciphertext-value-rewrite model is not inverted here.

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const read = (p) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');
const mod = (n) => ((n % 29) + 29) % 29;
const SUPPRESSION = 0.8129;
const WIDTH = 400;
const SCORE_THRESHOLD = -5.2;
const N = 12956;

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const GP = corpus.translit;
const ciphertext = corpus.pages
  .filter((p) => p.page >= 0 && p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(ciphertext.length, N, 'unexpected original p0-p55 rune count');

const quadgrams = new Map();
let quadgramTotal = 0;
for (const line of read('resources/control/dukotah_english_quadgrams.txt').trim().split('\n')) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 2) continue;
  const count = Number(parts[1]);
  quadgrams.set(parts[0], Math.log10(count));
  quadgramTotal += count;
}
const logTotal = Math.log10(quadgramTotal);
const floor = Math.log10(0.01) - logTotal;
for (const [gram, value] of quadgrams) quadgrams.set(gram, value - logTotal);

const GP_SORTED = GP.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
function englishToGP(text) {
  const s = text.toUpperCase();
  const out = [];
  for (let i = 0; i < s.length;) {
    const hit = GP_SORTED.find((t) => s.startsWith(t.s, i));
    if (hit) {
      out.push(hit.i);
      i += hit.s.length;
      continue;
    }
    const alias = { V: 1, K: 5, Z: 15, Q: 5 }[s[i]];
    if (alias !== undefined) out.push(alias);
    i += 1;
  }
  return out;
}

function xorshift32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

function maxIdenticalRun(key) {
  let run = 1;
  let max = 1;
  for (let i = 1; i < 2 * key.length; i += 1) {
    if (key[i % key.length] === key[(i - 1) % key.length]) run += 1;
    else run = 1;
    if (run > max) max = run;
  }
  return max;
}

function encipherKeyskip(plain, key, sign = -1, seed = 3301) {
  const random = xorshift32(seed);
  const out = [];
  const skips = [];
  let keyIndex = 0;
  let previous = null;
  for (const p of plain) {
    let skipped = 0;
    let c;
    while (true) {
      c = mod(p - sign * key[keyIndex % key.length]);
      if (previous !== null && c === previous && random() < SUPPRESSION) {
        keyIndex += 1;
        skipped += 1;
        continue;
      }
      break;
    }
    out.push(c);
    skips.push(skipped);
    keyIndex += 1;
    previous = c;
  }
  let totalSkips = 0;
  let maxSkip = 0;
  for (const n of skips) {
    totalSkips += n;
    if (n > maxSkip) maxSkip = n;
  }
  return {
    ciphertext: out,
    totalSkips,
    maxSkip,
    doublets: out.slice(1).filter((x, i) => x === out[i]).length
  };
}

function encipherKeyskipOneShot(plain, key, sign = -1, seed = 3301) {
  const random = xorshift32(seed);
  const out = [];
  const skips = [];
  let keyIndex = 0;
  let previous = null;
  for (const p of plain) {
    let skipped = 0;
    let c;
    while (true) {
      if (keyIndex >= key.length) throw new Error('one-shot key exhausted in plant');
      c = mod(p - sign * key[keyIndex]);
      if (previous !== null && c === previous && random() < SUPPRESSION) {
        keyIndex += 1;
        skipped += 1;
        continue;
      }
      break;
    }
    out.push(c);
    skips.push(skipped);
    keyIndex += 1;
    previous = c;
  }
  let totalSkips = 0;
  let maxSkip = 0;
  for (const n of skips) {
    totalSkips += n;
    if (n > maxSkip) maxSkip = n;
  }
  return { ciphertext: out, totalSkips, maxSkip, keyBytesConsumed: keyIndex };
}

// M1 key-skip inverse: for each rune, try 0..maxSkip rejected key draws.
// Every rejected draw must have produced the preceding ciphertext rune.
// The accepted key position determines the candidate plaintext rune.
function beamDecode(C, key, sign, maxSkip, savePath = false, repeatKey = true) {
  const keyStream = repeatKey
    ? Array.from({ length: C.length * (maxSkip + 1) + 8 }, (_, i) => key[i % key.length])
    : key;
  const firstRune = mod(C[0] + sign * keyStream[0]);
  const firstText = GP[firstRune];
  let beam = [{
    score: 0,
    keyIndex: 0,
    tail: firstText,
    charCount: firstText.length,
    previousCipher: C[0]
  }];

  const parentHistory = [];
  const runeHistory = [];

  for (let i = 1; i < C.length; i += 1) {
    const currentCipher = C[i];
    const candidates = [];

    for (let parent = 0; parent < beam.length; parent += 1) {
      const state = beam[parent];
      for (let skipped = 0; skipped <= maxSkip; skipped += 1) {
        const acceptedIndex = state.keyIndex + 1 + skipped;
        if (acceptedIndex >= keyStream.length) break;

        const p = mod(currentCipher + sign * keyStream[acceptedIndex]);
        let valid = true;
        for (let j = state.keyIndex + 1; j < acceptedIndex; j += 1) {
          if (mod(p - sign * keyStream[j]) !== state.previousCipher) {
            valid = false;
            break;
          }
        }
        if (!valid) continue;

        let tail = state.tail;
        let charCount = state.charCount;
        let addedScore = 0;
        for (const ch of GP[p]) {
          tail += ch;
          charCount += 1;
          if (charCount >= 4) addedScore += quadgrams.get(tail.slice(-4)) ?? floor;
          tail = tail.slice(-3);
        }
        candidates.push({
          score: state.score + addedScore,
          keyIndex: acceptedIndex,
          tail,
          charCount,
          previousCipher: currentCipher,
          parent,
          rune: p
        });
      }
    }

    if (candidates.length === 0) return { complete: false, failedAt: i };
    candidates.sort((a, b) => b.score - a.score);
    const next = candidates.slice(0, WIDTH);
    if (savePath) {
      parentHistory.push(Uint16Array.from(next.map((x) => x.parent)));
      runeHistory.push(Uint8Array.from(next.map((x) => x.rune)));
    }
    beam = next;
  }

  const best = beam[0];
  const result = {
    complete: true,
    score: best.score / Math.max(1, best.charCount - 3),
    skips: best.keyIndex - (C.length - 1),
    endKeyIndex: best.keyIndex,
    endKeyOffset: best.keyIndex % key.length
  };

  if (savePath) {
    const pathRunes = new Uint8Array(C.length);
    pathRunes[0] = best.firstRune;
    let index = 0;
    for (let i = C.length - 1; i >= 1; i -= 1) {
      pathRunes[i] = runeHistory[i - 1][index];
      index = parentHistory[i - 1][index];
    }
    result.path = pathRunes;
  }
  return result;
}

const positivePlain = englishToGP(read('resources/control/gibran_prophet_58585.txt')).slice(0, N);
assert.equal(positivePlain.length, N, 'positive-control text is too short');

function positiveControl(key) {
  const maxSkip = maxIdenticalRun(key);
  assert.ok(maxSkip <= 3, 'source key requires an unmodelled skip depth');
  const planted = encipherKeyskip(positivePlain, key, -1, 3301);
  assert.ok(planted.maxSkip <= maxSkip);
  const decoded = beamDecode(planted.ciphertext, key, -1, maxSkip, true);
  assert.ok(decoded.complete, 'positive-control beam failed to complete');
  let matches = 0;
  for (let i = 0; i < N; i += 1) {
    if (decoded.path[i] === positivePlain[i]) matches += 1;
  }
  const recovery = matches / N;
  assert.ok(recovery > 0.98, 'positive-control recovery fell below 98%');
  return {
    recovery,
    score: decoded.score,
    plantedSkips: planted.totalSkips,
    plantedMaxSkip: planted.maxSkip,
    plantedDoublets: planted.doublets
  };
}

function actualPair(key) {
  const maxSkip = maxIdenticalRun(key);
  assert.ok(maxSkip <= 3);
  const plus = beamDecode(ciphertext, key, -1, maxSkip, false); // C = P + K
  const minus = beamDecode(ciphertext, key, +1, maxSkip, false); // C = P - K
  assert.ok(plus.complete && minus.complete);
  assert.ok(plus.score < SCORE_THRESHOLD && minus.score < SCORE_THRESHOLD);
  return {
    maxSkip,
    C_equals_P_plus_K: { score: plus.score, skips: plus.skips, endKeyOffset: plus.endKeyOffset },
    C_equals_P_minus_K: { score: minus.score, skips: minus.skips, endKeyOffset: minus.endKeyOffset }
  };
}

function encipherFtransparent(plain, key, sign = -1) {
  const out = [];
  let keyIndex = 0;
  for (const p of plain) {
    if (p === 0) {
      out.push(0);
      continue;
    }
    if (keyIndex >= key.length) throw new Error('F-transparent one-shot key exhausted');
    out.push(mod(p - sign * key[keyIndex]));
    keyIndex += 1;
  }
  return { ciphertext: out, keyBytesConsumed: keyIndex };
}

function beamFtransparent(C, key, sign, savePath = false) {
  const initial = [];
  // C=F can be either transparent plaintext-F or an encrypted non-F symbol.
  if (C[0] === 0) {
    initial.push({
      score: 0, keyIndex: 0, tail: GP[0], charCount: GP[0].length, firstRune: 0
    });
  }
  if (key.length > 0) {
    const p = mod(C[0] + sign * key[0]);
    if (p !== 0) {
      initial.push({
        score: 0, keyIndex: 1, tail: GP[p], charCount: GP[p].length, firstRune: p
      });
    }
  }
  if (initial.length === 0) return { complete: false, failedAt: 0 };
  let beam = initial;
  const parentHistory = [];
  const runeHistory = [];

  for (let i = 1; i < C.length; i += 1) {
    const candidates = [];
    for (let parent = 0; parent < beam.length; parent += 1) {
      const state = beam[parent];

      // Verified p56 convention: plaintext F is emitted unchanged and consumes no key.
      if (C[i] === 0) {
        let tail = state.tail;
        let charCount = state.charCount;
        let addedScore = 0;
        for (const ch of GP[0]) {
          tail += ch;
          charCount += 1;
          if (charCount >= 4) addedScore += quadgrams.get(tail.slice(-4)) ?? floor;
          tail = tail.slice(-3);
        }
        candidates.push({
          score: state.score + addedScore,
          keyIndex: state.keyIndex,
          tail,
          charCount,
          parent,
          rune: 0,
          firstRune: state.firstRune
        });
      }

      // Every non-F plaintext rune consumes one byte from the one-shot key.
      if (state.keyIndex < key.length) {
        const p = mod(C[i] + sign * key[state.keyIndex]);
        if (p !== 0) {
          let tail = state.tail;
          let charCount = state.charCount;
          let addedScore = 0;
          for (const ch of GP[p]) {
            tail += ch;
            charCount += 1;
            if (charCount >= 4) addedScore += quadgrams.get(tail.slice(-4)) ?? floor;
            tail = tail.slice(-3);
          }
          candidates.push({
            score: state.score + addedScore,
            keyIndex: state.keyIndex + 1,
            tail,
            charCount,
            parent,
            rune: p,
            firstRune: state.firstRune
          });
        }
      }
    }
    if (candidates.length === 0) return { complete: false, failedAt: i };
    candidates.sort((a, b) => b.score - a.score);
    const next = candidates.slice(0, WIDTH);
    if (savePath) {
      parentHistory.push(Uint16Array.from(next.map((x) => x.parent)));
      runeHistory.push(Uint8Array.from(next.map((x) => x.rune)));
    }
    beam = next;
  }

  const best = beam[0];
  const result = {
    complete: true,
    score: best.score / Math.max(1, best.charCount - 3),
    keyBytesConsumed: best.keyIndex
  };
  if (savePath) {
    const pathRunes = new Uint8Array(C.length);
    pathRunes[0] = firstRune;
    let index = 0;
    for (let i = C.length - 1; i >= 1; i -= 1) {
      pathRunes[i] = runeHistory[i - 1][index];
      index = parentHistory[i - 1][index];
    }
    result.path = pathRunes;
  }
  return result;
}

// Exact reachability over all possible key-pointer states; no language-model pruning.
function exactFtransparentReachability(C, key, sign) {
  let states = new Set();
  if (C[0] === 0) states.add(0);
  if (key.length > 0) {
    const p = mod(C[0] + sign * key[0]);
    if (p !== 0) states.add(1);
  }
  if (states.size === 0) return { complete: false, failedAt: 0 };
  for (let i = 1; i < C.length; i += 1) {
    const next = new Set();
    for (const keyIndex of states) {
      if (C[i] === 0) next.add(keyIndex);
      if (keyIndex < key.length) {
        const p = mod(C[i] + sign * key[keyIndex]);
        if (p !== 0) next.add(keyIndex + 1);
      }
    }
    states = next;
    if (states.size === 0) return { complete: false, failedAt: i };
  }
  return {
    complete: true,
    finalKeyIndices: [...states].sort((a, b) => a - b)
  };
}

const blobHex = read('resources/2014-onion2-final-256byte-hex.txt').replace(/\s+/g, '');
assert.match(blobHex, /^[0-9a-f]+$/i);
assert.equal(blobHex.length, 512);
const blobBytes = blobHex.match(/../g).map((x) => parseInt(x, 16));
const blobKey = blobBytes.map((x) => x % 29);

const timing = JSON.parse(read('im-results/lp2-2014-onion2-timing-merged-114.json'));
const intervals = timing.key_streams.S_AB_resolved;
assert.equal(intervals.length, 114);
assert.ok(intervals.every((x) => Number.isInteger(x) && x >= 1 && x <= 7));
const primes = [2, 3, 5, 7, 11, 13, 17];
const timingKeys = [
  { name: 'interval/5', key: intervals },
  { name: 'minutes mod29', key: intervals.map((x) => mod(5 * x)) },
  { name: 'prime(interval/5) mod29', key: intervals.map((x) => primes[x - 1] % 29) }
];

const blobResult = {
  period: blobKey.length,
  uniqueSymbols: new Set(blobKey).size,
  maxIdenticalRun: maxIdenticalRun(blobKey),
  positiveControl: positiveControl(blobKey),
  actual: actualPair(blobKey)
};

const p48 = corpus.pages.find((p) => p.page === 48).indices;
const p49 = corpus.pages.find((p) => p.page === 49).indices;
const pretableSentence = p48.slice(-72).concat(p49.slice(0, 66));
assert.equal(pretableSentence.length, 138, 'p48 final72 + p49 first66 must be the complete 138-rune sentence');

const pretablePlant = encipherKeyskipOneShot(positivePlain.slice(0, 138), blobKey, -1, 3301);
assert.ok(pretablePlant.maxSkip <= maxIdenticalRun(blobKey));
const pretablePositive = beamDecode(
  pretablePlant.ciphertext, blobKey, -1, maxIdenticalRun(blobKey), true, false
);
assert.ok(pretablePositive.complete);
let pretableMatches = 0;
for (let i = 0; i < 138; i += 1) {
  if (pretablePositive.path[i] === positivePlain[i]) pretableMatches += 1;
}
const pretableRecovery = pretableMatches / 138;
assert.ok(pretableRecovery > 0.98);

const pretablePlus = beamDecode(
  pretableSentence, blobKey, -1, maxIdenticalRun(blobKey), false, false
);
const pretableMinus = beamDecode(
  pretableSentence, blobKey, +1, maxIdenticalRun(blobKey), false, false
);
assert.ok(pretablePlus.complete && pretableMinus.complete);
assert.ok(pretablePlus.score < SCORE_THRESHOLD && pretableMinus.score < SCORE_THRESHOLD);

const fTransparentPlain = positivePlain.slice(0, 138);
const fTransparentPlant = encipherFtransparent(fTransparentPlain, blobKey, -1);
const fTransparentPositive = beamFtransparent(fTransparentPlant.ciphertext, blobKey, -1, true);
assert.ok(fTransparentPositive.complete);
let fTransparentMatches = 0;
for (let i = 0; i < 138; i += 1) {
  if (fTransparentPositive.path[i] === fTransparentPlain[i]) fTransparentMatches += 1;
}
const fTransparentRecovery = fTransparentMatches / 138;
const firstFPlain = fTransparentPlain.slice();
firstFPlain[0] = 0;
const firstFPlant = encipherFtransparent(firstFPlain, blobKey, -1);
const firstFDecoded = beamFtransparent(firstFPlant.ciphertext, blobKey, -1, true);
assert.ok(firstFDecoded.complete);
const firstFRecovery = firstFDecoded.path.reduce((n, x, i) => n + (x === firstFPlain[i] ? 1 : 0), 0) / 138;
assert.ok(firstFRecovery > 0.98);
assert.ok(fTransparentRecovery > 0.98);
const fTransparentPlus = exactFtransparentReachability(pretableSentence, blobKey, -1);
const fTransparentMinus = exactFtransparentReachability(pretableSentence, blobKey, +1);
assert.deepEqual(fTransparentPlus, { complete: false, failedAt: 6 });
assert.deepEqual(fTransparentMinus, { complete: false, failedAt: 9 });
const fTransparentGate = {
  positiveControl: {
    recovery: fTransparentRecovery,
    score: fTransparentPositive.score,
    keyBytesConsumed: fTransparentPlant.keyBytesConsumed,
    firstFEdgeRecovery: firstFRecovery
  },
  actualExactReachability: {
    C_equals_P_plus_K: fTransparentPlus,
    C_equals_P_minus_K: fTransparentMinus
  }
};

const pretableOneShot = {
  sourceSpan: 'p48 final 72 runes + p49 first 66 runes',
  runes: pretableSentence.length,
  keyPeriod: blobKey.length,
  positiveControl: {
    recovery: pretableRecovery,
    score: pretablePositive.score,
    plantedSkips: pretablePlant.totalSkips,
    keyBytesConsumed: pretablePlant.keyBytesConsumed
  },
  actual: {
    C_equals_P_plus_K: {
      score: pretablePlus.score,
      skips: pretablePlus.skips,
      keyBytesConsumed: pretablePlus.endKeyIndex + 1
    },
    C_equals_P_minus_K: {
      score: pretableMinus.score,
      skips: pretableMinus.skips,
      keyBytesConsumed: pretableMinus.endKeyIndex + 1
    }
  },
  p56FTransparent: fTransparentGate
};

const timingResults = timingKeys.map(({ name, key }) => ({
  name,
  period: key.length,
  uniqueSymbols: new Set(key).size,
  maxIdenticalRun: maxIdenticalRun(key),
  positiveControl: positiveControl(key),
  actual: actualPair(key)
}));

const random = xorshift32(0x3301);
const randomKey = Array.from({ length: 256 }, () => Math.floor(random() * 29));
const randomMaxSkip = maxIdenticalRun(randomKey);
const randomNull = {
  maxIdenticalRun: randomMaxSkip,
  C_equals_P_plus_K: beamDecode(ciphertext, randomKey, -1, randomMaxSkip, false),
  C_equals_P_minus_K: beamDecode(ciphertext, randomKey, +1, randomMaxSkip, false)
};
assert.ok(randomNull.C_equals_P_plus_K.score < SCORE_THRESHOLD);
assert.ok(randomNull.C_equals_P_minus_K.score < SCORE_THRESHOLD);

const actualDoublets = ciphertext.slice(1).filter((x, i) => x === ciphertext[i]).length;
const output = {
  model: {
    name: 'M1 soft ciphertext collision rejection / key-skip',
    externalHypothesis: 'Dukotah/cicada3301 Campaign XVIII L2-filter-leak',
    suppression: SUPPRESSION,
    expectedSkipsForUniformRandomKey: N * ((1 / 29) * SUPPRESSION) / (1 - (1 / 29) * SUPPRESSION),
    beamWidth: WIDTH,
    scoreThreshold: SCORE_THRESHOLD,
    clock: 'continuous across original pages 0-55',
    sourceKeyStartOffset: 0,
    FHandling: 'M1 uses ordinary GP29; separate one-shot p56 plaintext-F-transparent p48-to-p49 gate is included'
  },
  target: { pages: 'LP2 p0-p55', runes: N, adjacentDoublets: actualDoublets },
  onion2ByteString: blobResult,
  oneShotPretableSentence: pretableOneShot,
  onion2TimingIntervals: timingResults,
  deterministicRandomKeyNull: randomNull,
  scope: 'Forward source order, offset zero, repeated full-book keys, a one-shot 256-byte key for the complete 138-rune p48→49 sentence under M1, and a separate p56 plaintext-F-transparent one-shot test; both arithmetic signs. No page resets, reversal, free phase search, KDF, or value-rewrite inverse.'
};

console.log(JSON.stringify(output, null, 2));
