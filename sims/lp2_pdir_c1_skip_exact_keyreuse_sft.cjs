'use strict';

/**
 * Exact key-cancellation gate for external pointer-direction comparator c=1
 * under the skip retry model.
 *
 * Source family:
 *   direction = parity of previous ciphertext word's GP-prime sum;
 *   c=1 means a backward word has no collision comparator on its first rune.
 *
 * For h0/m2/c1 and h1/m0/c1, every forward->backward turn reads exactly the
 * same hidden key index on the previous word's final emitted rune and the new
 * word's first rune, even when the previous final rune required skip retries.
 * Thus Cfirst-Clast = Pfirst-Plast (mod 29) on those turns, independent of the
 * 581 candidate key streams, pointer start, additive sign, and secret key.
 *
 * Read-only original-source SFT. CommonJS, Node.js 22, no dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

/** @param {string} relativePath */
function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const gibran = read('resources/control/gibran_prophet_58585.txt');
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const prime = corpus.prime || corpus.primes;
const runeMap = new Map(corpus.runes.map((rune, index) => [rune, index]));
const spellMap = new Map(corpus.translit.map((spelling, index) => [spelling, index]));
const digraphs = corpus.translit
  .filter(spelling => spelling.length > 1)
  .sort((a, b) => b.length - a.length);

/** @param {string} text */
function sourceWords(text) {
  /** @type {number[][]} */
  const words = [];
  /** @type {number[]} */
  let word = [];

  function finish() {
    if (word.length) {
      words.push(word);
      word = [];
    }
  }

  for (const glyph of text.split('%').slice(0, 55).join('%')) {
    if (runeMap.has(glyph)) {
      word.push(runeMap.get(glyph));
    } else if (glyph === '%' || glyph === '/' || /\s/u.test(glyph)) {
      // Formatting separators do not end a printed word.
    } else {
      finish();
    }
  }
  finish();
  return words;
}

/** @param {string} text */
function encodedEnglish(text) {
  const rawWords = text.match(/[A-Za-z]+/g) || [];
  return rawWords.map(raw => {
    const normalized = raw.toUpperCase()
      .replace(/QU/g, 'CW')
      .replace(/K/g, 'C')
      .replace(/V/g, 'U')
      .replace(/Z/g, 'S');
    const encoded = [];
    for (let offset = 0; offset < normalized.length;) {
      const digraph = digraphs.find(value => normalized.startsWith(value, offset));
      if (digraph) {
        encoded.push(spellMap.get(digraph));
        offset += digraph.length;
      } else if (spellMap.has(normalized[offset])) {
        encoded.push(spellMap.get(normalized[offset]));
        offset++;
      } else {
        offset++;
      }
    }
    return encoded;
  }).filter(word => word.length);
}

/** @param {number[]} word */
function gpSum(word) {
  return word.reduce((sum, rune) => sum + prime[rune], 0);
}

/** @param {number} seed */
function random(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Score only source-selected forward->backward turns. These are the exact
 * c=1 skip-model key-cancellation sites for both conventions tested below.
 *
 * @param {number[][]} ciphertextWords
 * @param {number[]} weights
 */
function turnScore(ciphertextWords, weights) {
  const histogram = Array(29).fill(0);
  let previousDirection = 1;

  for (let index = 1; index < ciphertextWords.length; index++) {
    const direction = gpSum(ciphertextWords[index - 1]) % 2 === 0 ? 1 : -1;
    if (previousDirection === 1 && direction === -1) {
      const residue = (
        ciphertextWords[index][0] -
        ciphertextWords[index - 1][ciphertextWords[index - 1].length - 1] +
        29
      ) % 29;
      histogram[residue]++;
    }
    previousDirection = direction;
  }

  const count = histogram.reduce((sum, value) => sum + value, 0);
  const score = histogram.reduce(
    (sum, occurrences, residue) => sum + occurrences * weights[residue],
    0
  );
  return { count, score, histogram };
}

/**
 * Exact external skip-model forward planter for comparator c=1.
 * h controls the pre-read backward step, m controls interword movement.
 *
 * @param {number[][]} nativeWords
 * @param {number} seed
 * @param {number} h
 * @param {number} m
 */
function plant(nativeWords, seed, h, m) {
  const rng = random(seed);
  const key = Uint8Array.from(
    { length: 50000 },
    () => Math.floor(rng() * 29)
  );

  let pointer = 20000;
  let previousCipher = null;
  let previousDirection = null;
  let previousLastKey = null;
  const cipherWords = [];
  let forwardBackwardTurns = 0;
  let exactReuses = 0;

  for (let wordIndex = 0; wordIndex < nativeWords.length; wordIndex++) {
    const direction = wordIndex === 0
      ? 1
      : (gpSum(cipherWords[wordIndex - 1]) % 2 === 0 ? 1 : -1);

    if (previousDirection !== null) {
      pointer += m === 2 ? direction : (m === 1 ? previousDirection : 0);
    }
    if (direction < 0 && h === 1) {
      pointer--;
    }

    /** @type {number[]} */
    const cipherWord = [];
    /** @type {number[]} */
    const emittedKeyIndices = [];

    for (let runeIndex = 0; runeIndex < nativeWords[wordIndex].length; runeIndex++) {
      const plain = nativeWords[wordIndex][runeIndex];

      // External comparator c=1: first rune of a backward word has no
      // comparator. All forward runes compare with the previous emitted rune.
      const comparator = direction > 0
        ? previousCipher
        : (runeIndex === 0 ? null : previousCipher);

      let cipher;
      let keyIndex;
      let attempts = 0;
      do {
        keyIndex = pointer;
        assert.ok(keyIndex >= 0 && keyIndex < key.length);
        cipher = (plain + key[keyIndex]) % 29;
        pointer += direction;
        attempts++;
      } while (
        comparator !== null &&
        cipher === comparator &&
        rng() < 0.81 &&
        attempts < 6
      );

      assert.equal(cipher, (plain + key[keyIndex]) % 29);
      cipherWord.push(cipher);
      emittedKeyIndices.push(keyIndex);
      previousCipher = cipher;
    }

    if (previousDirection === 1 && direction === -1) {
      forwardBackwardTurns++;
      assert.equal(
        emittedKeyIndices[0],
        previousLastKey,
        'c=1 skip-model forward->backward turn must reuse exact emitted key index'
      );
      exactReuses++;
    }

    cipherWords.push(cipherWord);
    previousDirection = direction;
    previousLastKey = emittedKeyIndices[emittedKeyIndices.length - 1];
  }

  return {
    cipherWords,
    forwardBackwardTurns,
    exactReuses
  };
}

const source = sourceWords(transcript);
assert.equal(source.length, 2896);
assert.equal(source.flat().length, 12956);
assert.deepEqual(
  source.flat(),
  corpus.pages.filter(page => page.page <= 55).flatMap(page => page.indices)
);

const gibranWords = encodedEnglish(gibran);
const shakespeareWords = encodedEnglish(shakespeare);
assert.equal(gibranWords.length, 15733);
assert.equal(shakespeareWords.length, 55407);

const counts = Array(29).fill(1);
for (let index = 1; index < shakespeareWords.length; index++) {
  const residue = (
    shakespeareWords[index][0] -
    shakespeareWords[index - 1][shakespeareWords[index - 1].length - 1] +
    29
  ) % 29;
  counts[residue]++;
}
const total = counts.reduce((sum, value) => sum + value, 0);
const weights = counts.map(count => Math.log(29 * count / total));

const original = turnScore(source, weights);
assert.equal(original.count, 734);
assert.ok(Math.abs(original.score - (-22.130215165462026)) < 1e-8);

const byLength = new Map();
for (const word of gibranWords) {
  const length = word.length;
  if (!byLength.has(length)) {
    byLength.set(length, []);
  }
  byLength.get(length).push(word);
}

/**
 * @param {number} trial
 */
function matchedNativeWords(trial) {
  const used = new Map();
  return source.map(sourceWord => {
    const length = sourceWord.length;
    const options = byLength.get(length);
    assert.ok(options && options.length);
    const ordinal = used.get(length) || 0;
    used.set(length, ordinal + 1);
    return options[(ordinal * 67 + trial * 131) % options.length];
  });
}

const results = [];
for (const convention of [
  { name: '021', h: 0, m: 2 },
  { name: '101', h: 1, m: 0 }
]) {
  const scores = [];
  let reuses = 0;
  let turns = 0;

  for (let trial = 0; trial < 100; trial++) {
    const native = matchedNativeWords(trial);
    assert.deepEqual(native.map(word => word.length), source.map(word => word.length));
    const planted = plant(
      native,
      0x513301 + trial * 271 + convention.h * 100003 + convention.m * 70001,
      convention.h,
      convention.m
    );
    const scored = turnScore(planted.cipherWords, weights);
    assert.equal(scored.count, planted.forwardBackwardTurns);
    assert.equal(planted.exactReuses, planted.forwardBackwardTurns);
    scores.push(scored.score);
    reuses += planted.exactReuses;
    turns += planted.forwardBackwardTurns;
  }

  scores.sort((a, b) => a - b);
  const atOrBelowOriginal = scores.filter(score => score <= original.score).length;
  assert.equal(reuses, turns);
  assert.equal(atOrBelowOriginal, 0);

  results.push({
    convention: convention.name,
    comparator: 'c=1',
    retryModel: 'skip',
    original: {
      exactKeyCancellationSites: original.count,
      nativeVsFlatLLR: original.score
    },
    matchedNativePlants: {
      count: scores.length,
      minimum: scores[0],
      median: scores[49],
      maximum: scores[99],
      atOrBelowOriginal,
      exactEmittedKeyReuseFraction: reuses / turns
    }
  });
}

console.log(JSON.stringify({
  hypothesis: 'A_prev_G direction with c=1 skip-model exact forward->backward key cancellation',
  sourceWords: source.length,
  sourceRunes: source.flat().length,
  result: results,
  scope: 'Exact for skip retries in conventions 021 and 101; coin retries and other direction rules remain outside this gate'
}, null, 2));


/**
 * Score the exact c=1 coin-model subset. A coin collision on the preceding
 * forward rune can break emitted-key reuse only when that rune's initial
 * ciphertext equals its comparator. If the final visible ciphertext differs
 * from the preceding emitted ciphertext, then either no collision occurred or
 * a replacement emitted from a later key index; in both cases the post-rune
 * pointer is exactly one step after the key that actually emitted the rune.
 *
 * @param {number[][]} ciphertextWords
 * @param {number[]} weights
 */
function coinSafeTurnScore(ciphertextWords, weights) {
  const histogram = Array(29).fill(0);
  let previousDirection = 1;

  for (let index = 1; index < ciphertextWords.length; index++) {
    const direction = gpSum(ciphertextWords[index - 1]) % 2 === 0 ? 1 : -1;
    if (previousDirection === 1 && direction === -1) {
      const previousWord = ciphertextWords[index - 1];
      const previousFinal = previousWord[previousWord.length - 1];
      const priorEmitted = previousWord.length >= 2
        ? previousWord[previousWord.length - 2]
        : ciphertextWords[index - 2][ciphertextWords[index - 2].length - 1];

      if (previousFinal !== priorEmitted) {
        const residue = (
          ciphertextWords[index][0] - previousFinal + 29
        ) % 29;
        histogram[residue]++;
      }
    }
    previousDirection = direction;
  }

  const count = histogram.reduce((sum, value) => sum + value, 0);
  const score = histogram.reduce(
    (sum, occurrences, residue) => sum + occurrences * weights[residue],
    0
  );
  return { count, score, histogram };
}

/**
 * External c=1 coin-retry planter. A repeated initial ciphertext consumes one
 * extra key value as the coin. With probability 0.81 it then emits a
 * replacement using the following key value.
 *
 * @param {number[][]} nativeWords
 * @param {number} seed
 * @param {number} h
 * @param {number} m
 */
function plantCoin(nativeWords, seed, h, m) {
  const rng = random(seed);
  const key = Uint8Array.from(
    { length: 50000 },
    () => Math.floor(rng() * 29)
  );

  let pointer = 20000;
  let previousCipher = null;
  let previousDirection = null;
  let previousLastKey = null;
  const cipherWords = [];
  let exactSelectedTurns = 0;
  let exactSelectedReuses = 0;

  for (let wordIndex = 0; wordIndex < nativeWords.length; wordIndex++) {
    const direction = wordIndex === 0
      ? 1
      : (gpSum(cipherWords[wordIndex - 1]) % 2 === 0 ? 1 : -1);

    let priorFinal = null;
    let priorComparator = null;
    if (wordIndex > 0) {
      const priorWord = cipherWords[wordIndex - 1];
      priorFinal = priorWord[priorWord.length - 1];
      priorComparator = priorWord.length >= 2
        ? priorWord[priorWord.length - 2]
        : cipherWords[wordIndex - 2][cipherWords[wordIndex - 2].length - 1];
    }

    if (previousDirection !== null) {
      pointer += m === 2 ? direction : (m === 1 ? previousDirection : 0);
    }
    if (direction < 0 && h === 1) {
      pointer--;
    }

    /** @type {number[]} */
    const cipherWord = [];
    /** @type {number[]} */
    const emittedKeyIndices = [];

    for (let runeIndex = 0; runeIndex < nativeWords[wordIndex].length; runeIndex++) {
      const plain = nativeWords[wordIndex][runeIndex];
      const comparator = direction > 0
        ? previousCipher
        : (runeIndex === 0 ? null : previousCipher);

      let keyIndex = pointer;
      assert.ok(keyIndex >= 0 && keyIndex < key.length);
      let cipher = (plain + key[keyIndex]) % 29;
      pointer += direction;

      if (comparator !== null && cipher === comparator) {
        pointer += direction; // spend the coin key value
        if (rng() < 0.81) {
          keyIndex = pointer;
          assert.ok(keyIndex >= 0 && keyIndex < key.length);
          cipher = (plain + key[keyIndex]) % 29;
          pointer += direction;
        }
      }

      assert.equal(cipher, (plain + key[keyIndex]) % 29);
      cipherWord.push(cipher);
      emittedKeyIndices.push(keyIndex);
      previousCipher = cipher;
    }

    if (
      previousDirection === 1 &&
      direction === -1 &&
      priorFinal !== priorComparator
    ) {
      exactSelectedTurns++;
      assert.equal(
        emittedKeyIndices[0],
        previousLastKey,
        'coin-safe c=1 turn must reuse the exact emitted key index'
      );
      exactSelectedReuses++;
    }

    cipherWords.push(cipherWord);
    previousDirection = direction;
    previousLastKey = emittedKeyIndices[emittedKeyIndices.length - 1];
  }

  return {
    cipherWords,
    exactSelectedTurns,
    exactSelectedReuses
  };
}

const coinOriginal = coinSafeTurnScore(source, weights);
const coinResults = [];
for (const convention of [
  { name: '021', h: 0, m: 2 },
  { name: '101', h: 1, m: 0 }
]) {
  const scores = [];
  let reuses = 0;
  let turns = 0;

  for (let trial = 0; trial < 100; trial++) {
    const native = matchedNativeWords(trial);
    const planted = plantCoin(
      native,
      0x733101 + trial * 313 + convention.h * 110003 + convention.m * 90001,
      convention.h,
      convention.m
    );
    const scored = coinSafeTurnScore(planted.cipherWords, weights);
    assert.equal(scored.count, planted.exactSelectedTurns);
    assert.equal(planted.exactSelectedReuses, planted.exactSelectedTurns);
    scores.push(scored.score);
    reuses += planted.exactSelectedReuses;
    turns += planted.exactSelectedTurns;
  }

  scores.sort((a, b) => a - b);
  coinResults.push({
    convention: convention.name,
    comparator: 'c=1',
    retryModel: 'coin',
    exactVisibleCondition: 'preceding forward final ciphertext differs from its comparator',
    original: {
      exactKeyCancellationSites: coinOriginal.count,
      nativeVsFlatLLR: coinOriginal.score
    },
    matchedNativePlants: {
      count: scores.length,
      minimum: scores[0],
      median: scores[49],
      maximum: scores[99],
      atOrBelowOriginal: scores.filter(score => score <= coinOriginal.score).length,
      exactEmittedKeyReuseFraction: reuses / turns
    }
  });
}
console.log(JSON.stringify({
  hypothesis: 'A_prev_G c=1 coin-model exact visible-clean key cancellation',
  result: coinResults
}, null, 2));
