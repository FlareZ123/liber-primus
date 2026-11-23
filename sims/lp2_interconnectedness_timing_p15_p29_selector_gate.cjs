'use strict';

// Audio-timing selector hypothesis and exact p15 -> p29 key-transfer gate.
// Run from repository root: node sims/lp2_interconnectedness_timing_p15_p29_selector_gate.cjs
// The audio measurements are transcribed from the cited secondary report;
// this script does not claim to re-download or independently authenticate the MP3.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, 'resources/liber-primus/lp2-corpus.json'), 'utf8'
));
const page = n => corpus.pages.find(p => p.page === n);
const mod29 = x => ((x % 29) + 29) % 29;

function firstPrimes(count) {
  const out = [];
  for (let n = 2; out.length < count; n++) {
    let prime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { prime = false; break; }
    }
    if (prime) out.push(n);
  }
  return out;
}
function primePi(n) {
  let count = 0;
  for (let x = 2; x <= n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) {
      if (x % d === 0) { prime = false; break; }
    }
    if (prime) count++;
  }
  return count;
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
function toGpRunes(words) {
  const tokens = corpus.translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of words.split(' ')) {
    for (let at = 0; at < word.length;) {
      const match = tokens.find(({ token }) => word.startsWith(token, at));
      assert.ok(match, 'No GP spelling for ' + word.slice(at));
      out.push(match.index);
      at += match.token.length;
    }
  }
  return out;
}

// Exact inverse of the solved p56 plaintext-F-bypass rule.
// sign=-1 means subtract the key in decryption; sign=+1 means add it.
// A ciphertext F can be literal F (no key consumed) or an encrypted
// non-F (key consumed). A key-consuming branch may never yield plaintext F.
function decodeF(ciphertext, keyAt, sign, literalMask) {
  let used = 0;
  let fOrdinal = 0;
  const plaintext = [];
  for (const value of ciphertext) {
    if (value === 0) {
      const literal = (literalMask >> fOrdinal) & 1;
      fOrdinal++;
      if (literal) {
        plaintext.push(0);
        continue;
      }
    }
    const decoded = mod29(value + sign * keyAt(used));
    if (decoded === 0) return null;
    plaintext.push(decoded);
    used++;
  }
  return { plaintext, used };
}
function encodeF(plaintext, keyAt, sign) {
  let used = 0;
  return plaintext.map(value => value === 0
    ? 0
    : mod29(value - sign * keyAt(used++)));
}
function enumerateAllMasks(ciphertext, keyAt, sign) {
  const fCount = ciphertext.filter(value => value === 0).length;
  assert.ok(fCount <= 30, 'Bit-mask enumeration bound exceeded');
  let viable = 0;
  let best = null;
  for (let mask = 0; mask < (1 << fCount); mask++) {
    const decoded = decodeF(ciphertext, keyAt, sign, mask);
    if (!decoded) continue;
    viable++;
    assert.deepEqual(encodeF(decoded.plaintext, keyAt, sign), ciphertext);
    const score = ioc(decoded.plaintext);
    if (!best || score > best.ioc) {
      best = {
        mask,
        ioc: score,
        used: decoded.used,
        gp: decoded.plaintext.map(value => corpus.translit[value]).join('')
      };
    }
  }
  return { fCount, masks: 1 << fCount, viable, best };
}

// Secondary-source audio measurements. SECRA reports that the archived,
// PGP-verified 2014 MP3 has these decoded sample counts at 44.1 kHz.
const audio = {
  sampleRate: 44100,
  totalSamplesPerChannel: 12222720,
  repeatedNoiseLagSamples: 11559607,
  mpegFrameSamples: 1152,
  sha256: '1ce3839b4a62462d9009c4469acc189b523e1bdcf338cb49cda1cd7bb4efffc6'
};
const durationSeconds = audio.totalSamplesPerChannel / audio.sampleRate;
const repeatSeconds = audio.repeatedNoiseLagSamples / audio.sampleRate;
const tailSeconds = durationSeconds - repeatSeconds;
const [frameQuotient, frameRemainder] = [
  Math.floor(audio.repeatedNoiseLagSamples / audio.mpegFrameSamples),
  audio.repeatedNoiseLagSamples % audio.mpegFrameSamples
];

const title = 'INTERCONNECTEDNESS';
const titleGpSum = Array.from(title).reduce((sum, letter) => {
  const index = corpus.translit.indexOf(letter);
  assert.ok(index >= 0, 'Title letter absent from GP alphabet: ' + letter);
  return sum + corpus.prime[index];
}, 0);
const reversedTitleSum = Number(String(titleGpSum).split('').reverse().join(''));

const pages = corpus.pages.filter(p => p.page >= 0 && p.page <= 57);
const lengthMatches = length => pages.filter(p => p.runic_count === length)
  .map(p => p.page);
assert.deepEqual(lengthMatches(262), [0]);
assert.deepEqual(lengthMatches(277), [29]);
assert.deepEqual(lengthMatches(85), [56]);
assert.equal(page(0).runic_count, 262);
assert.equal(page(15).page, 15);
assert.equal(page(29).runic_count, 277);
assert.equal(page(55).page, 55);
assert.equal(page(56).runic_count, 85);
assert.equal(titleGpSum, 772);
assert.equal(reversedTitleSum, 277);
assert.equal(Math.round(durationSeconds), 277);
assert.equal(Math.round(repeatSeconds), 262);
assert.equal(Math.round(tailSeconds), 15);
assert.equal(primePi(277), 59);
assert.equal(primePi(262), 55);
assert.equal(primePi(frameRemainder), 85);
assert.equal(frameQuotient, 10034);
assert.equal(frameRemainder, 439);

const p29 = page(29).indices;
const p29FPositions = p29.map((value, index) => value === 0 ? index : -1)
  .filter(index => index >= 0);
assert.equal(p29.length, 277);
assert.deepEqual(p29FPositions, [40, 87, 88, 90, 184, 222, 234, 246]);
const p29MaskCount = 1 << p29FPositions.length;
assert.equal(p29MaskCount, 256);

const primes = firstPrimes(1600);
const p15Fibonacci = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
const p15PrimeOrdinals = p15Fibonacci.map(value => value + 1);
assert.deepEqual(p15PrimeOrdinals,
  [1, 2, 3, 4, 6, 9, 14, 22, 35, 56, 90, 145, 234, 378, 611, 988]);
const p15Primes = p15PrimeOrdinals.map(ordinal => primes[ordinal - 1]);
assert.deepEqual(p15Primes,
  [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817]);
const p15TotientPeriod16 = p15Primes.map(value => mod29(value - 1));
assert.deepEqual(p15TotientPeriod16,
  [1, 2, 4, 6, 12, 22, 13, 20, 3, 1, 27, 16, 1, 11, 11, 15]);

// Gate A: use each p15 Fibonacci-prime ordinal as the starting rank for the
// authentic p56 consecutive-prime-totient stream, on p29. Exhaust all signs
// and all 256 original ciphertext-F interpretations for every start.
const ordinalStartResults = [];
for (const start of p15PrimeOrdinals) {
  for (const sign of [-1, +1]) {
    const keyAt = used => primes[start - 1 + used] - 1;
    const result = enumerateAllMasks(p29, keyAt, sign);
    ordinalStartResults.push({
      startOrdinal: start,
      firstPrime: primes[start - 1],
      sign,
      ...result
    });
  }
}
assert.equal(ordinalStartResults.length, 32);
assert.equal(ordinalStartResults.reduce((sum, result) => sum + result.viable, 0), 0);

// Gate B: use the sixteen p15 prime-totient values as a repeating key.
// Give every phase and both signs, with complete original F-bypass masks.
const period16Results = [];
for (let phase = 0; phase < 16; phase++) {
  for (const sign of [-1, +1]) {
    const keyAt = used => p15TotientPeriod16[(used + phase) % 16];
    const result = enumerateAllMasks(p29, keyAt, sign);
    period16Results.push({ phase, sign, ...result });
  }
}
assert.equal(period16Results.length, 32);
assert.equal(period16Results.reduce((sum, result) => sum + result.viable, 0), 0);

// Positive controls for every tested source-key consumer: synthetic 277-rune
// plaintexts with five literal Fs and no encrypted non-F outputs.
function positivePlant(keyAt, sign) {
  const literalFPositions = new Set([7, 53, 111, 166, 220]);
  let used = 0;
  const plaintext = [];
  for (let i = 0; i < 277; i++) {
    if (literalFPositions.has(i)) {
      plaintext.push(0);
      continue;
    }
    let value = mod29(sign * keyAt(used) + 1);
    if (value === 0) value = mod29(sign * keyAt(used) + 2);
    assert.notEqual(value, 0);
    plaintext.push(value);
    used++;
  }
  const ciphertext = encodeF(plaintext, keyAt, sign);
  assert.deepEqual(ciphertext.map((value, index) =>
    literalFPositions.has(index) ? value : value), ciphertext);
  assert.equal(ciphertext.filter(value => value === 0).length, 5);
  const decoded = decodeF(ciphertext, keyAt, sign, 31);
  assert.ok(decoded);
  assert.deepEqual(decoded.plaintext, plaintext);
  return true;
}
for (const start of p15PrimeOrdinals) {
  for (const sign of [-1, +1]) {
    const keyAt = used => primes[start - 1 + used] - 1;
    assert.ok(positivePlant(keyAt, sign));
  }
}
for (let phase = 0; phase < 16; phase++) {
  for (const sign of [-1, +1]) {
    const keyAt = used => p15TotientPeriod16[(used + phase) % 16];
    assert.ok(positivePlant(keyAt, sign));
  }
}

// Authentic solved-p56 positive control: exact 85-rune plaintext, original
// prime-totient schedule, and the established literal-F mask (bit 3).
const expectedP56Words =
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const expectedP56 = toGpRunes(expectedP56Words);
const p56Cipher = page(56).indices;
assert.equal(p56Cipher.length, 85);
assert.deepEqual(p56Cipher.map((value, index) => value === 0 ? index : -1)
  .filter(index => index >= 0), [35, 47, 51, 56, 74]);
const authenticP56KeyAt = used => primes[used] - 1;
const authenticP56 = decodeF(p56Cipher, authenticP56KeyAt, -1, 8);
assert.ok(authenticP56);
assert.deepEqual(authenticP56.plaintext, expectedP56);
assert.deepEqual(encodeF(expectedP56, authenticP56KeyAt, -1), p56Cipher);

console.log(JSON.stringify({
  audioMeasurements: {
    ...audio,
    durationSeconds,
    repeatSeconds,
    tailSeconds,
    roundedSelectors: {
      totalDuration: Math.round(durationSeconds),
      repeatLag: Math.round(repeatSeconds),
      durationMinusLag: Math.round(tailSeconds)
    },
    frameQuotient,
    frameRemainder
  },
  derivedCrossArtifactSelectors: {
    titleGpSum,
    reversedTitleSum,
    primeCounts: {
      pi277: primePi(277),
      pi262: primePi(262),
      pi439: primePi(439)
    },
    uniquePageLengthMatches: {
      262: lengthMatches(262),
      277: lengthMatches(277),
      85: lengthMatches(85)
    },
    proposedRoute: {
      p29FromDurationAndTitle: 277,
      p0FromRepeatLag: 262,
      p15FromTail: 15,
      p55FromPrimeCountOf262: 55,
      p56FromPrimeCountOfFrameRemainder439: 85
    }
  },
  p29: {
    originalRunes: p29.length,
    ciphertextFPositions: p29FPositions,
    masksPerConfiguration: p29MaskCount,
    p15OrdinalStartGate: {
      configurations: ordinalStartResults.length,
      totalMasksTested: ordinalStartResults.length * p29MaskCount,
      viableOriginalMasks: 0,
      results: ordinalStartResults.map(({startOrdinal, firstPrime, sign, viable}) =>
        ({startOrdinal, firstPrime, sign, viable}))
    },
    p15Period16TotientGate: {
      configurations: period16Results.length,
      totalMasksTested: period16Results.length * p29MaskCount,
      viableOriginalMasks: 0,
      results: period16Results.map(({phase, sign, viable}) => ({phase, sign, viable}))
    }
  },
  controls: {
    p56AuthenticCipher: 'PASS: original 85-rune solved plaintext and re-encryption',
    p15OrdinalPlants: 'PASS: all 32 synthetic F-transparent positive plants',
    p15Period16Plants: 'PASS: all 32 synthetic F-transparent positive plants'
  },
  conclusion:
    'The timing/page-selector pattern is a hypothesis, not a decryption. Both direct p15-to-p29 consumers of the solved p56 prime-totient/F-bypass rule are exactly impossible on the original p29 ciphertext.'
}, null, 2));
