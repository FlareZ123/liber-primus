'use strict';

// Source-frozen p32-word -> p50-table address -> GP29 additive-key test.
// Run from repository root: node sims/p32_wordprime_linear_table_address_key_sft.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tableData = JSON.parse(read('resources/liber-primus/base60-grid.json'));
const transcription = read('resources/lp2-transcription.txt');

const page32 = transcription.split('%')[32].replace(/\/\s*/g, '');
const words = page32.split(/[.\-&$§]+/u)
  .map(part => [...part].filter(r => /[\u16A0-\u16FF]/u.test(r)).join(''))
  .filter(Boolean);
const primeByRune = new Map(corpus.runes.map((r, i) => [r, corpus.prime[i]]));
const wordSums = words.map(word =>
  [...word].reduce((sum, rune) => sum + primeByRune.get(rune), 0));

const expectedSums = [
  73, 125, 267, 613, 191, 184, 14, 540, 458, 535, 183,
  442, 196, 497, 160, 446, 98, 203, 96, 348, 160, 216
];
assert.equal(words.length, 22, 'p32 visible-word count, including incoming carry');
assert.deepEqual(wordSums, expectedSums);
assert.equal(tableData.byte_rows.length, 32);
assert.ok(tableData.byte_rows.every(row => row.length === 8));
const table = tableData.byte_rows.flat();
assert.equal(table.length, 256);
assert.ok(table.every(x => Number.isInteger(x) && x >= 0 && x <= 255));

const allUnknown = corpus.pages.filter(p => p.page >= 0 && p.page <= 55)
  .flatMap(p => p.indices);
const p33to39 = corpus.pages.filter(p => p.page >= 33 && p.page <= 39)
  .flatMap(p => p.indices);
const p55Body = corpus.pages.find(p => p.page === 55).indices.slice(1);
const solved57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(allUnknown.length, 12956);
assert.equal(p33to39.length, 1680);
assert.equal(p55Body.length, 75, 'p55 complete-word body after the incoming p54 carry');

const mod = (n, m) => ((n % m) + m) % m;
function ioc(sequence) {
  const counts = Array(29).fill(0);
  for (const value of sequence) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (sequence.length * (sequence.length - 1));
}
function adjacentRepeats(sequence) {
  let count = 0;
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] === sequence[i - 1]) count++;
  }
  return count;
}
function decrypt(cipher, key, sign) {
  return cipher.map((value, i) => mod(value + sign * key[i % key.length], 29));
}
function encrypt(plain, key, sign) {
  return plain.map((value, i) => mod(value - sign * key[i % key.length], 29));
}
function transliterate(sequence, limit = 180) {
  return sequence.slice(0, limit).map(value => corpus.translit[value]).join(' ');
}

const keyCandidates = [0, 1].map(addressBase => {
  const addresses = wordSums.map(sum => mod(sum - addressBase, 256));
  const bytes = addresses.map(address => table[address]);
  const key = bytes.map(byte => byte % 29);
  return {
    addressBase: addressBase === 0 ? 'zero-based: sum mod 256' : 'one-based: (sum - 1) mod 256',
    addresses,
    bytes,
    bytesHex: bytes.map(byte => byte.toString(16).padStart(2, '0')).join(''),
    key,
    keyTransliteration: key.map(value => corpus.translit[value]).join(' ')
  };
});

const results = [];
for (const candidate of keyCandidates) {
  for (const sign of [-1, 1]) {
    for (const [targetName, target] of [
      ['all unknown LP2 pp0-55', allUnknown],
      ['immediate following section pp33-39', p33to39],
      ['p55 complete-word body after incoming carry', p55Body]
    ]) {
      const plain = decrypt(target, candidate.key, sign);
      const plant = Array.from({ length: target.length },
        (_, i) => solved57[i % solved57.length]);
      const plantedCipher = encrypt(plant, candidate.key, sign);
      assert.deepEqual(decrypt(plantedCipher, candidate.key, sign), plant);
      assert.deepEqual(encrypt(plain, candidate.key, sign), target);
      results.push({
        addressBase: candidate.addressBase,
        operation: sign === -1 ? 'P = C - K mod 29' : 'P = C + K mod 29',
        target: targetName,
        runeCount: target.length,
        ioc: ioc(plain),
        adjacentRepeats: adjacentRepeats(plain),
        first180: transliterate(plain)
      });
    }
  }
}


const skipTarget = corpus.pages.filter(p => p.page >= 33 && p.page <= 55)
  .flatMap(p => p.indices);
const p33to39Skip = corpus.pages.filter(p => p.page >= 33 && p.page <= 39)
  .flatMap(p => p.indices);
const p55PrefixLength = corpus.pages.filter(p => p.page >= 33 && p.page < 55)
  .reduce((sum, p) => sum + p.indices.length, 0);
const p55BodyStart = p55PrefixLength + 1;
const p57PlantPlain = corpus.pages.find(p => p.page === 57).indices.slice(0, 75);
const rejectionProbability = 13 / 16;
const maxAdvance = 5; // At most four rejected key positions per emitted rune.

const digraphs = { TH: 2, NG: 21, EO: 12, OE: 22, AE: 25, IA: 27, EA: 28 };
const englishLetters = {
  A: 24, B: 17, C: 5, D: 23, E: 18, F: 0, G: 6, H: 8, I: 10,
  J: 11, K: 5, L: 20, M: 19, N: 9, O: 3, P: 13, Q: 5, R: 4,
  S: 15, T: 16, U: 1, V: 1, W: 7, X: 14, Y: 26, Z: 15
};
function encodeEnglish(source) {
  const letters = source.toUpperCase().replace(/[^A-Z]/g, '');
  const out = [];
  for (let i = 0; i < letters.length; i++) {
    const pair = digraphs[letters.slice(i, i + 2)];
    if (pair !== undefined) {
      out.push(pair);
      i++;
    } else {
      out.push(englishLetters[letters[i]]);
    }
  }
  return out;
}
function trainEnglishTrigram(source) {
  const sequence = encodeEnglish(source);
  const uni = new Uint32Array(29);
  const bi = new Uint32Array(29 * 29);
  const tri = new Uint32Array(29 * 29 * 29);
  for (let i = 0; i < sequence.length; i++) {
    uni[sequence[i]]++;
    if (i > 0) bi[sequence[i - 1] * 29 + sequence[i]]++;
    if (i > 1) tri[(sequence[i - 2] * 29 + sequence[i - 1]) * 29 + sequence[i]]++;
  }
  const U = new Float64Array(29);
  const B = new Float64Array(29 * 29);
  const T = new Float64Array(29 * 29 * 29);
  for (let x = 0; x < 29; x++) U[x] = Math.log((uni[x] + 1) / (sequence.length + 29));
  for (let x = 0; x < 29; x++) for (let z = 0; z < 29; z++) {
    B[x * 29 + z] = Math.log((bi[x * 29 + z] + 12 * Math.exp(U[z])) / (uni[x] + 12));
  }
  for (let x = 0; x < 29; x++) for (let y = 0; y < 29; y++) for (let z = 0; z < 29; z++) {
    const index = (x * 29 + y) * 29 + z;
    T[index] = Math.log((tri[index] + 9 * Math.exp(B[y * 29 + z])) / (bi[x * 29 + y] + 9));
  }
  return { U, B, T };
}
const englishModel = trainEnglishTrigram(read('resources/control/shakespeare_first300k.txt'));

function solveFixedPlaintextKeyskip(cipher, key, sign, trace = true, offset = 0) {
  const width = key.length;
  const length = cipher.length;
  const stateCount = width * maxAdvance;
  const negativeInfinity = -1e100;
  const decode = (value, position) => mod(value + sign * key[mod(position, width)], 29);
  const back = trace
    ? Array.from({ length }, () => new Int32Array(stateCount).fill(-1))
    : null;
  let previous = new Float64Array(stateCount).fill(negativeInfinity);

  const firstPlain = decode(cipher[0], offset);
  for (let advance = 1; advance <= maxAdvance; advance++) {
    const currentPosition = mod(offset + advance, width);
    const currentPlain = decode(cipher[1], currentPosition);
    let valid = true;
    for (let skipped = 1; skipped < advance; skipped++) {
      if (mod(currentPlain - sign * key[mod(offset + skipped, width)], 29) !== cipher[0]) {
        valid = false;
        break;
      }
    }
    if (!valid) continue;
    const logProbability = (advance - 1) * Math.log(rejectionProbability) +
      (cipher[1] === cipher[0] ? Math.log(1 - rejectionProbability) : 0);
    const state = currentPosition * maxAdvance + advance - 1;
    previous[state] = englishModel.U[firstPlain] +
      englishModel.B[firstPlain * 29 + currentPlain] + logProbability;
  }

  for (let i = 2; i < length; i++) {
    const next = new Float64Array(stateCount).fill(negativeInfinity);
    const currentCipher = cipher[i];
    const previousCipher = cipher[i - 1];
    for (let state = 0; state < stateCount; state++) {
      const baseScore = previous[state];
      if (baseScore <= negativeInfinity / 2) continue;
      const oldPosition = Math.floor(state / maxAdvance);
      const previousAdvance = state % maxAdvance + 1;
      const twoBackPosition = mod(oldPosition - previousAdvance, width);
      const plainTwoBack = decode(cipher[i - 2], twoBackPosition);
      const plainPrevious = decode(previousCipher, oldPosition);

      for (let advance = 1; advance <= maxAdvance; advance++) {
        const currentPosition = mod(oldPosition + advance, width);
        const currentPlain = decode(currentCipher, currentPosition);
        let valid = true;
        for (let skipped = 1; skipped < advance; skipped++) {
          if (mod(currentPlain - sign * key[mod(oldPosition + skipped, width)], 29) !== previousCipher) {
            valid = false;
            break;
          }
        }
        if (!valid) continue;

        const logProbability = (advance - 1) * Math.log(rejectionProbability) +
          (currentCipher === previousCipher ? Math.log(1 - rejectionProbability) : 0);
        const nextState = currentPosition * maxAdvance + advance - 1;
        const trigramIndex = (plainTwoBack * 29 + plainPrevious) * 29 + currentPlain;
        const score = baseScore + englishModel.T[trigramIndex] + logProbability;
        if (score > next[nextState]) {
          next[nextState] = score;
          if (trace) back[i][nextState] = state;
        }
      }
    }
    previous = next;
  }

  let bestScore = negativeInfinity;
  let bestState = -1;
  for (let state = 0; state < stateCount; state++) {
    if (previous[state] > bestScore) {
      bestScore = previous[state];
      bestState = state;
    }
  }
  if (bestState < 0) return { score: -Infinity, scorePerRune: -Infinity };

  if (!trace) return { score: bestScore, scorePerRune: bestScore / length };

  const plaintext = new Array(length);
  let skippedCount = 0;
  let state = bestState;
  for (let i = length - 1; i >= 1; i--) {
    const currentPosition = Math.floor(state / maxAdvance);
    const advance = state % maxAdvance + 1;
    plaintext[i] = decode(cipher[i], currentPosition);
    skippedCount += advance - 1;
    state = back[i][state];
  }
  plaintext[0] = decode(cipher[0], offset);
  return {
    score: bestScore,
    scorePerRune: bestScore / length,
    plaintext,
    skippedCount
  };
}

function plantFixedPlaintextKeyskip(plaintext, key, sign, seed = 0x3301ad42) {
  let state = seed >>> 0;
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  let position = 0;
  let previousCipher = -1;
  let skippedCount = 0;
  const cipher = [];
  for (const plain of plaintext) {
    let skipped = 0;
    let value = mod(plain - sign * key[mod(position, key.length)], 29);
    while (previousCipher >= 0 && value === previousCipher && skipped < 4 &&
      random() < rejectionProbability) {
      position++;
      skipped++;
      skippedCount++;
      value = mod(plain - sign * key[mod(position, key.length)], 29);
    }
    cipher.push(value);
    previousCipher = value;
    position++;
  }
  return { cipher, skippedCount };
}

let shuffleState = 0x20261113;
function shuffleRandom() {
  shuffleState ^= shuffleState << 13;
  shuffleState ^= shuffleState >>> 17;
  shuffleState ^= shuffleState << 5;
  return (shuffleState >>> 0) / 4294967296;
}
function shuffledKey(key) {
  const copy = key.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(shuffleRandom() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
const skipAwareResults = [];
for (const candidate of keyCandidates) {
  for (const sign of [-1, 1]) {
    const planted = plantFixedPlaintextKeyskip(p57PlantPlain, candidate.key, sign);
    const positive = solveFixedPlaintextKeyskip(planted.cipher, candidate.key, sign, true);
    const positiveRecovered = positive.plaintext.filter((value, i) => value === p57PlantPlain[i]).length;
    const decoded = solveFixedPlaintextKeyskip(skipTarget, candidate.key, sign, true);
    const nullScores = [];
    for (let replicate = 0; replicate < 20; replicate++) {
      const shuffled = shuffledKey(candidate.key);
      nullScores.push(solveFixedPlaintextKeyskip(skipTarget, shuffled, sign, false).scorePerRune);
    }
    const sortedNulls = nullScores.slice().sort((a, b) => a - b);
    const originalRank = [...nullScores, decoded.scorePerRune]
      .sort((a, b) => b - a).indexOf(decoded.scorePerRune) + 1;
    const p55BodyPlain = decoded.plaintext.slice(p55BodyStart, p55BodyStart + 75);
    skipAwareResults.push({
      addressBase: candidate.addressBase,
      operation: sign === -1 ? 'P = C - K with key skips' : 'P = C + K with key skips',
      target: 'continuous pp33-55, 4,996 runes, key phase 0 at p33',
      rejectionProbability: rejectionProbability,
      maxRejectedKeysPerRune: maxAdvance - 1,
      decodedIoC: ioc(decoded.plaintext),
      decodedAdjacentRepeats: adjacentRepeats(decoded.plaintext),
      selectedSkipCount: decoded.skippedCount,
      englishTrigramScorePerRune: decoded.scorePerRune,
      p33to39Preview: transliterate(decoded.plaintext.slice(0, 180)),
      p55BodyPreview: transliterate(p55BodyPlain, 75),
      p55BodyIoC: ioc(p55BodyPlain),
      positiveControl: {
        plantedSkips: planted.skippedCount,
        recoveredOf75: positiveRecovered,
        exactRecovery: positiveRecovered === p57PlantPlain.length
      },
      shuffledKeyNull: {
        replicates: nullScores.length,
        seed: '0x20261113',
        min: sortedNulls[0],
        median: sortedNulls[10],
        max: sortedNulls[19],
        rankAmongOriginalPlusNulls: originalRank,
        nullsBeatenByOriginal: nullScores.filter(score => decoded.scorePerRune > score).length
      }
    });
  }
}

const output = {
  evidenceClass: 'bounded source-motivated original-input negative',
  sourceInstruction: 'Authenticated 2016 text: words are the map; their numbers are the direction',
  proposedMap: 'the 22 words visible on p32, including the incoming carry, index the 256-entry p49-51 row-major byte table by GP-prime word sum',
  conditionalInput: 'the table values are the repository’s provisional base60-to-byte interpretation',
  keyDerivation: 'table[sum mod 256] or table[(sum - 1) mod 256], then each selected byte mod 29',
  source: {
    p32VisibleWords: words.length,
    p32WordPrimeSums: wordSums,
    tableDimensions: [32, 8],
    tableEntries: table.length,
    addressCandidates: keyCandidates
  },
  targets: {
    unknownBookRunes: allUnknown.length,
    followingSectionRunes: p33to39.length,
    p55CompleteWordBodyRunes: p55Body.length,
    rawBookIoC: ioc(allUnknown),
    rawBookAdjacentRepeats: adjacentRepeats(allUnknown),
    rawP33to39IoC: ioc(p33to39),
    rawP33to39AdjacentRepeats: adjacentRepeats(p33to39),
    solvedP57ControlIoC: ioc(solved57)
  },
  results,
  skipAware: skipAwareResults,
  conclusion: 'Neither source-fixed address convention and neither additive sign produces language-like GP29 plaintext on the whole unknown book or the immediately following p33-39 section. This rejects only this linear table-address key and periodic additive consumer.'
};
console.log(JSON.stringify(output, null, 2));
