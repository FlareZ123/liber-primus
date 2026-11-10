'use strict';

/**
 * Source-locked pilot: 2014 Onion2 256-byte string as a period-256 additive
 * GP29 key, combined with the independently proposed R4 word-null / T-repair
 * channel. This tests one narrowly specified bridge, not a general LP2 cipher.
 *
 * R4 parameters: q=0.81 collision repair; r=0.4484 one checked null per
 * eligible word, uniformly inserted at any ciphertext slot including edges.
 * Nulls do not consume key. T(x)=(24-2x) mod29 uses ciphertext six positions
 * back within the current word. The inverse uses a greedy local choice between
 * normal and repair interpretations, with a DP over the 256 key-clock states.
 *
 * Positive control: held-out LP1 words, not used to train the trigram model,
 * are encrypted with the exact same channel and recovered. This calibrates
 * the edge-null handling and key-clock DP. The LP2 test is the first 200
 * canonical words (938 runes), book-global clock starting at byte 0.
 *
 * Run: node sims/onion2_r4_wordnull_inverse.cjs
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const timing = JSON.parse(read('resources/cicada2014-onion2-timing.json'));
const serviceSet = JSON.parse(read('resources/cicada-hiddenservice-256-candidates.json'));
const transcription = read('resources/lp2-transcription.txt');
const reference = read('resources/liber-primus/lp1-plaintext-reference.txt');

const MOD = 29;
const Q = 0.81;
const RATE = 0.4484;
const START = 29;
const END = 30;
const VOCAB = 31;
const SMOOTH = 0.3;
const FIRST_WORDS = 200;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ012';
const mod = (x, m) => ((x % m) + m) % m;
const T = (x) => mod(24 - 2 * x, MOD);

const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const allWords = transcription.split('%').slice(0, 55).join('%')
  .split(/[-.&$§]/u)
  .map((s) => [...s].filter((c) => runeIndex.has(c)).map((c) => runeIndex.get(c)))
  .filter((w) => w.length);

assert.equal(allWords.length, 2896);
assert.equal(allWords.reduce((s, w) => s + w.length, 0), 12956);
const cipherWords = allWords.slice(0, FIRST_WORDS);

const referenceLines = reference.split(/\r?\n/u).filter((line) => {
  const s = line.trim();
  return s && !s.startsWith('#') && !s.startsWith('[') && !/^[0-9a-f]{25,}$/iu.test(s);
});
const nativeTokens = (referenceLines.join(' ').match(/[A-Za-z]+/gu) || [])
  .map((w) => w.toUpperCase().replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S'));
const translit = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
const nativeWords = nativeTokens.map((word) => {
  const out = [];
  for (let i = 0; i < word.length;) {
    const token = translit.find((x) => word.startsWith(x.s, i));
    assert.ok(token, 'Unmapped LP1 reference token: ' + word.slice(i));
    out.push(token.i);
    i += token.s.length;
  }
  return out;
}).filter((w) => w.length);

assert.equal(nativeWords.length, 796);
assert.equal(nativeWords.reduce((s, w) => s + w.length, 0), 3248);
assert.equal(corpus.translit.length, MOD);

function trainLanguageModel(words) {
  const tri = new Float64Array(VOCAB ** 3);
  const pair = new Float64Array(VOCAB ** 2);
  for (const word of words) {
    let a = START;
    let b = START;
    for (const c of word) {
      tri[(a * VOCAB + b) * VOCAB + c]++;
      pair[a * VOCAB + b]++;
      a = b;
      b = c;
    }
    tri[(a * VOCAB + b) * VOCAB + END]++;
    pair[a * VOCAB + b]++;
  }
  const logp = new Float64Array(VOCAB ** 3);
  for (let a = 0; a < VOCAB; a++) {
    for (let b = 0; b < VOCAB; b++) {
      const den = pair[a * VOCAB + b] + VOCAB * SMOOTH;
      for (let c = 0; c < VOCAB; c++) {
        logp[(a * VOCAB + b) * VOCAB + c] =
          Math.log((tri[(a * VOCAB + b) * VOCAB + c] + SMOOTH) / den);
      }
    }
  }
  return logp;
}

const trainingWords = nativeWords.slice(0, 636);
const heldoutWords = nativeWords.slice(636);
const logp = trainLanguageModel(trainingWords);

function scoreWord(word) {
  let a = START;
  let b = START;
  let score = 0;
  for (const c of word) {
    score += logp[(a * VOCAB + b) * VOCAB + c];
    a = b;
    b = c;
  }
  return score + logp[(a * VOCAB + b) * VOCAB + END];
}

const nativeHoldoutScore = heldoutWords.reduce((s, w) => s + scoreWord(w), 0) /
  heldoutWords.reduce((s, w) => s + w.length, 0);

const logQ = Math.log(Q);
const logFallback = Math.log(Q / 28);
const logUnfixed = Math.log(1 - Q);
const logNoNull = Math.log(1 - RATE);

/**
 * Decode one ciphertext word at a fixed global key offset and hypothesized
 * null slot. Ciphertext coordinates, including an edge null, determine T(c-6).
 * The local repair choice is greedy under the held-out-trained GP trigram LM.
 */
function decodeWord(word, key, offset, nullSlot, previousWordLast) {
  let a = START;
  let b = START;
  let score = 0;
  let realCount = 0;
  const plaintext = [];

  for (let j = 0; j < word.length; j++) {
    if (j === nullSlot) continue;

    const previousCipher = j === 0 ? previousWordLast : word[j - 1];
    const keyValue = key[(offset + realCount) % 256];
    const normal = mod(word[j] - keyValue, MOD);
    let chosen = normal;
    let eventWeight = 0;

    if (previousCipher !== undefined) {
      if (word[j] === previousCipher) {
        // A would-be doublet that was not repaired.
        eventWeight = logUnfixed;
      } else {
        let repairWeight = null;
        if (j >= 6) {
          const repairedValue = T(word[j - 6]);
          if (repairedValue !== previousCipher && word[j] === repairedValue) {
            repairWeight = logQ;
          } else if (repairedValue === previousCipher) {
            // R4 falls back to a uniformly chosen non-repeat rune.
            repairWeight = logFallback;
          }
        } else {
          repairWeight = logFallback;
        }

        if (repairWeight !== null) {
          const repairedPlain = mod(previousCipher - keyValue, MOD);
          const normalScore = logp[(a * VOCAB + b) * VOCAB + normal];
          const repairedScore = logp[(a * VOCAB + b) * VOCAB + repairedPlain] +
            repairWeight;
          if (repairedScore > normalScore) {
            chosen = repairedPlain;
            eventWeight = repairWeight;
          }
        }
      }
    }

    score += logp[(a * VOCAB + b) * VOCAB + chosen] + eventWeight;
    plaintext.push(chosen);
    a = b;
    b = chosen;
    realCount++;
  }

  score += logp[(a * VOCAB + b) * VOCAB + END];
  return { plaintext, realCount, score };
}

/**
 * Viterbi over the source key's 256 positions. Each cipher word is either
 * unchanged or contains one non-key-consuming null at any slot 0..L-1.
 * The latter includes both leading and trailing edge nulls.
 */
function decode(words, key, allowNull = true) {
  let dp = new Float64Array(256);
  dp.fill(-Infinity);
  dp[0] = 0;
  const back = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const length = word.length;
    const previousWordLast = i ? words[i - 1][words[i - 1].length - 1] : undefined;
    const nextDp = new Float64Array(256);
    nextDp.fill(-Infinity);
    const previousOffset = new Int16Array(256);
    previousOffset.fill(-1);
    const nullSlot = new Int16Array(256);
    nullSlot.fill(-2);

    for (let offset = 0; offset < 256; offset++) {
      if (!Number.isFinite(dp[offset])) continue;

      const noNull = decodeWord(word, key, offset, -1, previousWordLast);
      const noNullPrior = length >= 2 ? logNoNull : 0;
      const nextNoNull = (offset + length) % 256;
      const noNullScore = dp[offset] + noNull.score + noNullPrior;
      if (noNullScore > nextDp[nextNoNull]) {
        nextDp[nextNoNull] = noNullScore;
        previousOffset[nextNoNull] = offset;
        nullSlot[nextNoNull] = -1;
      }

      if (allowNull && length >= 3) {
        let bestNullScore = -Infinity;
        let bestSlot = -1;
        for (let slot = 0; slot < length; slot++) {
          const previousCipher = slot === 0 ? previousWordLast : word[slot - 1];
          if (previousCipher !== undefined && word[slot] === previousCipher) continue;
          const candidate = decodeWord(word, key, offset, slot, previousWordLast);
          const nullSymbolPrior = previousCipher === undefined ? Math.log(29) : Math.log(28);
          const prior = Math.log(RATE) - Math.log(length) - nullSymbolPrior;
          const candidateScore = dp[offset] + candidate.score + prior;
          if (candidateScore > bestNullScore) {
            bestNullScore = candidateScore;
            bestSlot = slot;
          }
        }

        const nextWithNull = (offset + length - 1) % 256;
        if (bestNullScore > nextDp[nextWithNull]) {
          nextDp[nextWithNull] = bestNullScore;
          previousOffset[nextWithNull] = offset;
          nullSlot[nextWithNull] = bestSlot;
        }
      }
    }

    dp = nextDp;
    back.push({ previousOffset, nullSlot });
  }

  let finalOffset = 0;
  for (let i = 1; i < 256; i++) {
    if (dp[i] > dp[finalOffset]) finalOffset = i;
  }

  let currentOffset = finalOffset;
  const choices = new Array(words.length);
  for (let i = words.length - 1; i >= 0; i--) {
    const row = back[i];
    const priorOffset = row.previousOffset[currentOffset];
    assert.ok(priorOffset >= 0, 'Broken key-clock backpointer');
    choices[i] = { offset: priorOffset, slot: row.nullSlot[currentOffset] };
    currentOffset = priorOffset;
  }

  const plaintext = words.map((word, i) => {
    const previousWordLast = i ? words[i - 1][words[i - 1].length - 1] : undefined;
    return decodeWord(word, key, choices[i].offset, choices[i].slot,
      previousWordLast).plaintext;
  });
  const plaintextRunes = plaintext.reduce((s, w) => s + w.length, 0);
  const lmScore = plaintext.reduce((s, w) => s + scoreWord(w), 0);

  return {
    plaintext,
    choices,
    finalOffset,
    objective: dp[finalOffset],
    nulls: choices.filter((x) => x.slot >= 0).length,
    plaintextRunes,
    meanLM: lmScore / plaintextRunes
  };
}

function xorshift(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

function plant(words, key, seed) {
  const random = xorshift(seed);
  const cipher = [];
  const slots = [];
  const offsets = [];
  let previousCipher;
  let keyIndex = 0;

  for (const word of words) {
    offsets.push(keyIndex % 256);
    const insertNull = word.length >= 2 &&
      (random() % 1000000) / 1000000 < RATE;
    const slot = insertNull ? random() % (word.length + 1) : -1;
    slots.push(slot);
    const cipherWord = [];
    let plaintextIndex = 0;

    for (let position = 0; position < word.length + (insertNull ? 1 : 0); position++) {
      if (insertNull && position === slot) {
        let value = random() % MOD;
        while (previousCipher !== undefined && value === previousCipher) {
          value = random() % MOD;
        }
        cipherWord.push(value);
        previousCipher = value;
        continue;
      }

      let value = mod(word[plaintextIndex] + key[keyIndex % 256], MOD);
      if (previousCipher !== undefined && value === previousCipher &&
          (random() % 1000000) / 1000000 < Q) {
        if (position >= 6) {
          const repaired = T(cipherWord[position - 6]);
          if (repaired !== previousCipher) {
            value = repaired;
          } else {
            do { value = random() % MOD; } while (value === previousCipher);
          }
        } else {
          do { value = random() % MOD; } while (value === previousCipher);
        }
      }

      cipherWord.push(value);
      previousCipher = value;
      plaintextIndex++;
      keyIndex++;
    }
    cipher.push(cipherWord);
  }
  return { cipher, slots, offsets };
}

function bytesFromHex(hex) {
  assert.equal(hex.length, 512);
  return Array.from(hex.match(/../g), (x) => parseInt(x, 16));
}

const onion2Bytes = bytesFromHex(timing.final_hex);
const sourceServices = (serviceSet.sourceServices || []).map((s) => ({
  id: s.id,
  bytes: bytesFromHex(s.hex)
}));
assert.ok(sourceServices.some((s) => s.id === 'onion3'));
assert.ok(sourceServices.some((s) => s.id === 'onion4'));

const shuffled = onion2Bytes.slice();
const shuffleRandom = xorshift(0x33012014);
for (let i = shuffled.length - 1; i > 0; i--) {
  const j = shuffleRandom() % (i + 1);
  [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
}

const keyCandidates = [
  { id: 'onion2', bytes: onion2Bytes },
  { id: 'onion2-shuffled', bytes: shuffled },
  ...sourceServices.filter((s) => s.id !== 'onion2')
];
const keyMaps = {
  mod29: (b) => b % MOD,
  scale29: (b) => Math.floor(MOD * b / 256)
};

const positiveKey = onion2Bytes.map(keyMaps.mod29);
const positivePlant = plant(heldoutWords, positiveKey, 0x8c3302);
const positiveDecoded = decode(positivePlant.cipher, positiveKey);
let exactWords = 0;
let exactRunes = 0;
let totalRunes = 0;
let slotHits = 0;
let offsetHits = 0;
for (let i = 0; i < heldoutWords.length; i++) {
  const actual = heldoutWords[i];
  const recovered = positiveDecoded.plaintext[i];
  if (actual.join(',') === recovered.join(',')) exactWords++;
  for (let j = 0; j < actual.length; j++) {
    totalRunes++;
    if (actual[j] === recovered[j]) exactRunes++;
  }
  if (positiveDecoded.choices[i].slot === positivePlant.slots[i]) slotHits++;
  if (positiveDecoded.choices[i].offset === positivePlant.offsets[i]) offsetHits++;
}

const positiveControl = {
  heldoutWords: heldoutWords.length,
  heldoutRunes: totalRunes,
  cipherRunes: positivePlant.cipher.reduce((s, w) => s + w.length, 0),
  insertedNulls: positivePlant.slots.filter((x) => x >= 0).length,
  decodedNulls: positiveDecoded.nulls,
  exactWords,
  exactRunes,
  runeAccuracy: exactRunes / totalRunes,
  nullSlotHits: slotHits,
  keyOffsetHits: offsetHits,
  meanLM: positiveDecoded.meanLM,
  nativeHoldoutMeanLM: nativeHoldoutScore
};

const actualResults = [];
for (const candidate of keyCandidates) {
  for (const [mapName, mapByte] of Object.entries(keyMaps)) {
    const key = candidate.bytes.map(mapByte);
    const result = decode(cipherWords, key, true);
    const noNull = candidate.id === 'onion2' ? decode(cipherWords, key, false) : null;
    actualResults.push({
      key: candidate.id,
      mapping: mapName,
      cipherWords: cipherWords.length,
      cipherRunes: cipherWords.reduce((s, w) => s + w.length, 0),
      selectedNulls: result.nulls,
      plaintextRunes: result.plaintextRunes,
      meanLM: result.meanLM,
      noNullMeanLM: noNull ? noNull.meanLM : undefined,
      first30: result.plaintext.slice(0, 30)
        .map((w) => w.map((x) => corpus.translit[x]).join(''))
        .join(' ')
    });
  }
}

assert.ok(positiveControl.runeAccuracy > 0.90,
  'The held-out R4 positive control did not establish adequate decoder power');

console.log(JSON.stringify({
  model: {
    equation: 'C=P+K mod29',
    keySource: 'resources/cicada2014-onion2-timing.json final_hex',
    keyClock: 'book-global, period 256, starts at byte 0',
    keyMappings: ['byte mod29', 'floor(29*byte/256)'],
    q: Q,
    nullRate: RATE,
    nullSlots: 'uniform 0..L inclusive in plaintext coordinates; leading and trailing edges supported',
    nullConsumesKey: false,
    repair: 'on collision, probability q; T(c[-6]) when available and non-repeat, otherwise random non-repeat',
    inverse: 'greedy local repair choice plus exact DP over key offset modulo 256',
    lp2Scope: 'first 200 canonical words, 938 ciphertext runes'
  },
  languageModel: {
    trainingWords: trainingWords.length,
    trainingRunes: trainingWords.reduce((s, w) => s + w.length, 0),
    holdoutWords: heldoutWords.length,
    holdoutRunes: heldoutWords.reduce((s, w) => s + w.length, 0),
    holdoutMeanLogProbabilityPerRune: nativeHoldoutScore,
    smoothing: SMOOTH
  },
  positiveControl,
  actualResults
}, null, 2));
