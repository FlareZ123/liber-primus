'use strict';

// Finite source-key extension for the Interconnectedness timing hypothesis.
// Tests all eight p15-derived key streams and four audio-derived prime starts
// on the three page targets p0, p29, p55. Exact F-bypass feasibility is
// dynamic-programmed; only viable configurations have their F masks enumerated.
// Run from repository root: node sims/lp2_interconnectedness_p15_eightkey_audio_targets_sft.cjs

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const page = n => corpus.pages.find(p => p.page === n);
const mod29 = x => ((x % 29) + 29) % 29;

function firstPrimes(count) {
  const out = [];
  for (let p = 2; out.length < count; p++) {
    let prime = true;
    for (let d = 2; d * d <= p; d++) {
      if (p % d === 0) { prime = false; break; }
    }
    if (prime) out.push(p);
  }
  return out;
}
function base29(n) {
  const digits = [];
  do { digits.unshift(n % 29); n = Math.floor(n / 29); } while (n > 0);
  return digits;
}
function eulerPhi(n) {
  let remainder = n;
  let result = n;
  for (let p = 2; p * p <= remainder; p++) {
    if (remainder % p === 0) {
      while (remainder % p === 0) remainder /= p;
      result -= result / p;
    }
  }
  if (remainder > 1) result -= result / remainder;
  return result;
}
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
function decodeF(ciphertext, keyAt, sign, mask) {
  let used = 0;
  let fOrdinal = 0;
  const plaintext = [];
  for (const value of ciphertext) {
    if (value === 0) {
      const literal = (mask >> fOrdinal) & 1;
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

// Exact DP over key-consumption states. This is equivalent to considering
// every F mask, but avoids enumerating masks for configurations that fail.
function hasLegalPath(ciphertext, keyAt, sign) {
  let states = new Set([0]);
  for (const value of ciphertext) {
    const next = new Set();
    for (const used of states) {
      if (value === 0) next.add(used); // literal plaintext F bypass
      if (mod29(value + sign * keyAt(used)) !== 0)
        next.add(used + 1); // key-consuming branch must decode to non-F
    }
    if (next.size === 0) return false;
    states = next;
  }
  return true;
}
function wordLengthsForPage(pageNumber) {
  // The transcription omits the rune-less numeric-table p50. Pages p51+
  // therefore appear one chunk earlier than their LP2 page number.
  const chunks = transcription.split('%');
  const chunkIndex = pageNumber <= 49 ? pageNumber : pageNumber - 1;
  assert.ok(chunks[chunkIndex], 'Missing transcription chunk for p' + pageNumber);
  const lengths = chunks[chunkIndex].split('-')
    .map(segment => [...segment].filter(ch => runeIndex.has(ch)).length)
    .filter(length => length > 0);
  assert.equal(lengths.reduce((sum, n) => sum + n, 0), page(pageNumber).indices.length);
  return lengths;
}
function runeWordsForPage(pageNumber) {
  const chunks = transcription.split('%');
  const chunkIndex = pageNumber <= 49 ? pageNumber : pageNumber - 1;
  assert.ok(chunks[chunkIndex], 'Missing transcription chunk for p' + pageNumber);
  return chunks[chunkIndex].split('-')
    .map(segment => [...segment].filter(ch => runeIndex.has(ch)).map(ch => runeIndex.get(ch)))
    .filter(word => word.length > 0);
}
function wordsFromPlaintext(plaintext, lengths) {
  let at = 0;
  const words = lengths.map(length => {
    const word = plaintext.slice(at, at + length)
      .map(value => corpus.translit[value]).join('').toLowerCase();
    at += length;
    return word;
  });
  assert.equal(at, plaintext.length);
  return words;
}
function enumerateMasks(ciphertext, keyAt, sign, lengths, dictionary) {
  const fCount = ciphertext.filter(value => value === 0).length;
  assert.ok(fCount <= 30);
  const maskCount = 1 << fCount;
  let viable = 0;
  let bestIoC = null;
  let bestDictionary = null;
  for (let mask = 0; mask < maskCount; mask++) {
    const decoded = decodeF(ciphertext, keyAt, sign, mask);
    if (!decoded) continue;
    viable++;
    assert.deepEqual(encodeF(decoded.plaintext, keyAt, sign), ciphertext);
    const words = wordsFromPlaintext(decoded.plaintext, lengths);
    const matches = words.filter(word => dictionary.has(word));
    const candidate = {
      mask,
      ioc: ioc(decoded.plaintext),
      dictionaryMatches: matches.length,
      matchedWords: matches,
      words,
      gp: decoded.plaintext.map(value => corpus.translit[value]).join(''),
      used: decoded.used
    };
    if (!bestIoC || candidate.ioc > bestIoC.ioc) bestIoC = candidate;
    if (!bestDictionary ||
        candidate.dictionaryMatches > bestDictionary.dictionaryMatches ||
        (candidate.dictionaryMatches === bestDictionary.dictionaryMatches &&
         candidate.ioc > bestDictionary.ioc)) bestDictionary = candidate;
  }
  return { fCount, masks: maskCount, viable, bestIoC, bestDictionary };
}
function positivePlant(length, keyAt, sign) {
  const literalFPositions = new Set([
    7, Math.floor(length * 0.2), Math.floor(length * 0.4),
    Math.floor(length * 0.6), Math.floor(length * 0.8)
  ]);
  let used = 0;
  const plaintext = [];
  for (let i = 0; i < length; i++) {
    if (literalFPositions.has(i)) {
      plaintext.push(0);
      continue;
    }
    let value = mod29(sign * keyAt(used) + 1);
    if (value === 0) value = mod29(sign * keyAt(used) + 2);
    plaintext.push(value);
    used++;
  }
  const ciphertext = encodeF(plaintext, keyAt, sign);
  assert.equal(ciphertext.filter(value => value === 0).length, 5);
  const decoded = decodeF(ciphertext, keyAt, sign, 31);
  assert.ok(decoded);
  assert.deepEqual(decoded.plaintext, plaintext);
  return true;
}

const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const controlText = read('resources/control/gibran_prophet_58585.txt').toLowerCase();
const dictionary = new Set(controlText.match(/[a-z]+/g) || []);
for (const word of (
  'a an the of to in is be by for and or but as at not if when which who what with from on up down through within there exists will shall can cannot must do does has have had he she it they we you me him her them us our your their its one all some no yes so very more most less than then now here where why how this that these those each every any'
).split(' ')) dictionary.add(word);

const fibonacci = [0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987];
const primeTable = firstPrimes(2800);
const p15Primes = fibonacci.map(n => primeTable[n]);
const printed = p15Primes.map(p => Math.abs(3301 - p));
const sourceKeys = [
  ['printed16', printed],
  ['prime16', p15Primes],
  ['totient16', p15Primes.map(p => p - 1)],
  ['fibonacci16', fibonacci],
  ['ordinal16', fibonacci.map(n => n + 1)],
  ['printedBase29', printed.flatMap(base29)],
  ['primeBase29', p15Primes.flatMap(base29)],
  ['seedBase29', base29(3301)],
  ['phiN16', printed.map(eulerPhi)],
  ['phiNminus1_16', printed.map(n => eulerPhi(n) - 1)],
  ['phiNplus1_16', printed.map(n => eulerPhi(n) + 1)]
].map(([name, values]) => ({ name, key: values.map(mod29) }));
assert.deepEqual(sourceKeys.map(x => x.key.length), [16,16,16,16,16,47,30,3,16,16,16]);

const audioPrimeSeeds = [
  { prime: 173, ordinal: 40, source: 'repeat-lag MP3-frame quotient 10034 = 29×2×173' },
  { prime: 257, ordinal: 55, source: '55th prime from pi(262)=55' },
  { prime: 263, ordinal: 56, source: '56th-prime off-by-one sensitivity' },
  { prime: 439, ordinal: 85, source: 'MP3-frame remainder 439; pi(439)=85' }
];
for (const seed of audioPrimeSeeds) {
  assert.equal(primeTable[seed.ordinal - 1], seed.prime);
}

const targets = [0, 29, 55].map(pageNumber => ({
  pageNumber,
  ciphertext: page(pageNumber).indices,
  wordLengths: wordLengthsForPage(pageNumber)
}));
const keyFamilyReports = [];
let positivePlants = 0;
for (const target of targets) {
  const configurations = [];
  for (const sourceKey of sourceKeys) {
    let viableConfigurations = 0;
    let viableMasks = 0;
    let bestIoC = null;
    let bestDictionary = null;
    const fCount = target.ciphertext.filter(value => value === 0).length;
    const masksPerConfiguration = 1 << fCount;
    for (const sign of [-1, +1]) {
      for (let phase = 0; phase < sourceKey.key.length; phase++) {
        const keyAt = used => sourceKey.key[(used + phase) % sourceKey.key.length];
        assert.ok(positivePlant(target.ciphertext.length, keyAt, sign));
        positivePlants++;
        if (!hasLegalPath(target.ciphertext, keyAt, sign)) continue;
        viableConfigurations++;
        const result = enumerateMasks(
          target.ciphertext, keyAt, sign, target.wordLengths, dictionary
        );
        viableMasks += result.viable;
        const config = { key: sourceKey.name, phase, sign, ...result };
        if (result.bestIoC && (!bestIoC || result.bestIoC.ioc > bestIoC.ioc))
          bestIoC = { ...result.bestIoC, key: sourceKey.name, phase, sign };
        if (result.bestDictionary &&
            (!bestDictionary ||
             result.bestDictionary.dictionaryMatches > bestDictionary.dictionaryMatches ||
             (result.bestDictionary.dictionaryMatches === bestDictionary.dictionaryMatches &&
              result.bestDictionary.ioc > bestDictionary.ioc)))
          bestDictionary = { ...result.bestDictionary, key: sourceKey.name, phase, sign };
        configurations.push({
          key: sourceKey.name, phase, sign,
          viableMasks: result.viable,
          bestIoC: result.bestIoC?.ioc ?? null,
          bestDictionaryMatches: result.bestDictionary?.dictionaryMatches ?? 0
        });
        assert.equal(result.viable, masksPerConfiguration === 1 ? 1 : result.viable);
      }
    }
    keyFamilyReports.push({
      page: target.pageNumber,
      key: sourceKey.name,
      period: sourceKey.key.length,
      configurations: 2 * sourceKey.key.length,
      viableConfigurations,
      viableMasks,
      bestIoC: bestIoC ? {
        key: bestIoC.key, phase: bestIoC.phase, sign: bestIoC.sign,
        mask: bestIoC.mask, ioc: bestIoC.ioc, words: bestIoC.words
      } : null,
      bestDictionary: bestDictionary ? {
        key: bestDictionary.key, phase: bestDictionary.phase, sign: bestDictionary.sign,
        mask: bestDictionary.mask, ioc: bestDictionary.ioc,
        dictionaryMatches: bestDictionary.dictionaryMatches,
        matchedWords: bestDictionary.matchedWords,
        words: bestDictionary.words
      } : null,
      viableConfigurationsDetail: configurations
    });
  }
}

// Audio-derived prime starts, interpreted as first prime in the authentic
// p56 consecutive-prime-totient stream. All F masks are enumerated.
const audioPrimeReports = [];
for (const target of targets) {
  const fCount = target.ciphertext.filter(value => value === 0).length;
  const masksPerConfiguration = 1 << fCount;
  for (const seed of audioPrimeSeeds) {
    for (const sign of [-1, +1]) {
      const keyAt = used => primeTable[seed.ordinal - 1 + used] - 1;
      assert.ok(positivePlant(target.ciphertext.length, keyAt, sign));
      positivePlants++;
      const possible = hasLegalPath(target.ciphertext, keyAt, sign);
      const result = possible
        ? enumerateMasks(target.ciphertext, keyAt, sign, target.wordLengths, dictionary)
        : { fCount, masks: masksPerConfiguration, viable: 0, bestIoC: null, bestDictionary: null };
      audioPrimeReports.push({
        page: target.pageNumber,
        seedPrime: seed.prime,
        startOrdinal: seed.ordinal,
        source: seed.source,
        sign,
        ...result
      });
    }
  }
}

// The p0 physical-ink adjudication fixes a thirteen-rune red heading,
// followed by a thirteen-dot mark and black body beginning at offset 13.
// Test the visible red header as a repeating additive key on its own body,
// and on the audio-selected p29/p55 targets.
const p0HeaderKey = page(0).indices.slice(0, 13);
assert.equal(p0HeaderKey.length, 13);
const headerTargets = [
  {
    label: 'p0-black-body',
    page: 0,
    ciphertext: page(0).indices.slice(13),
    wordLengths: [page(0).indices.length - 13]
  },
  {
    label: 'p29',
    page: 29,
    ciphertext: page(29).indices,
    wordLengths: targets.find(x => x.pageNumber === 29).wordLengths
  },
  {
    label: 'p55',
    page: 55,
    ciphertext: page(55).indices,
    wordLengths: targets.find(x => x.pageNumber === 55).wordLengths
  }
];
const p0HeaderKeyReports = [];
for (const target of headerTargets) {
  let viableConfigurations = 0;
  let viableMasks = 0;
  let bestIoC = null;
  let bestDictionary = null;
  const configurations = [];
  for (let phase = 0; phase < 13; phase++) {
    for (const sign of [-1, +1]) {
      const keyAt = used => p0HeaderKey[(used + phase) % 13];
      assert.ok(positivePlant(target.ciphertext.length, keyAt, sign));
      positivePlants++;
      if (!hasLegalPath(target.ciphertext, keyAt, sign)) continue;
      viableConfigurations++;
      const result = enumerateMasks(
        target.ciphertext, keyAt, sign, target.wordLengths, dictionary
      );
      viableMasks += result.viable;
      if (result.bestIoC && (!bestIoC || result.bestIoC.ioc > bestIoC.ioc))
        bestIoC = { ...result.bestIoC, phase, sign };
      if (result.bestDictionary &&
          (!bestDictionary ||
           result.bestDictionary.dictionaryMatches > bestDictionary.dictionaryMatches ||
           (result.bestDictionary.dictionaryMatches === bestDictionary.dictionaryMatches &&
            result.bestDictionary.ioc > bestDictionary.ioc)))
        bestDictionary = { ...result.bestDictionary, phase, sign };
      configurations.push({
        phase, sign, viableMasks: result.viable,
        bestIoC: result.bestIoC?.ioc ?? null,
        bestDictionaryMatches: result.bestDictionary?.dictionaryMatches ?? 0
      });
    }
  }
  p0HeaderKeyReports.push({
    target: target.label,
    page: target.page,
    runes: target.ciphertext.length,
    Fcount: target.ciphertext.filter(value => value === 0).length,
    configurations: 26,
    viableConfigurations,
    viableMasks,
    bestIoC: bestIoC ? {
      phase: bestIoC.phase, sign: bestIoC.sign, mask: bestIoC.mask,
      ioc: bestIoC.ioc, gp: bestIoC.gp, words: bestIoC.words
    } : null,
    bestDictionary: bestDictionary ? {
      phase: bestDictionary.phase, sign: bestDictionary.sign,
      mask: bestDictionary.mask, ioc: bestDictionary.ioc,
      dictionaryMatches: bestDictionary.dictionaryMatches,
      matchedWords: bestDictionary.matchedWords,
      words: bestDictionary.words
    } : null,
    viableConfigurationsDetail: configurations
  });
}
assert.deepEqual(p0HeaderKeyReports.map(x => ({
  target: x.target,
  viableConfigurations: x.viableConfigurations,
  viableMasks: x.viableMasks
})), [
  { target: 'p0-black-body', viableConfigurations: 1, viableMasks: 30 },
  { target: 'p29', viableConfigurations: 0, viableMasks: 0 },
  { target: 'p55', viableConfigurations: 9, viableMasks: 35 }
]);

// The 17 transcription fragments on p55 consist of one incoming
// one-rune continuation plus 16 page-local words. Test the 16-cell p15
// spiral as a fixed permutation of those 16 local words.
const p55WordArrays = runeWordsForPage(55);
assert.equal(p55WordArrays.length, 17);
assert.equal(p55WordArrays[0].length, 1);
assert.deepEqual(p55WordArrays.flat(), page(55).indices);
const p55LocalWords = p55WordArrays.slice(1);
assert.equal(p55LocalWords.length, 16);
const p15SpiralOrder = [5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12];
const p15InverseOrder = Array(16);
p15SpiralOrder.forEach((cell, position) => { p15InverseOrder[cell] = position; });
const p55WordDirections = [
  {
    direction: 'spiral',
    words: [p55WordArrays[0], ...p15SpiralOrder.map(i => p55LocalWords[i])]
  },
  {
    direction: 'inverse',
    words: [p55WordArrays[0], ...p15InverseOrder.map(i => p55LocalWords[i])]
  }
];
const p15TotientPeriod16 = p15Primes.map(p => mod29(p - 1));
const p55WordTranspositionReports = [];
for (const direction of p55WordDirections) {
  const ciphertext = direction.words.flat();
  const lengths = direction.words.map(word => word.length);
  let configurations = 0;
  let viableConfigurations = 0;
  let viableMasks = 0;
  let bestIoC = null;
  let bestDictionary = null;
  for (const startOrdinal of fibonacci.map(n => n + 1)) {
    for (const sign of [-1, +1]) {
      configurations++;
      const keyAt = used => primeTable[startOrdinal - 1 + used] - 1;
      assert.ok(positivePlant(ciphertext.length, keyAt, sign));
      positivePlants++;
      if (!hasLegalPath(ciphertext, keyAt, sign)) continue;
      viableConfigurations++;
      const result = enumerateMasks(ciphertext, keyAt, sign, lengths, dictionary);
      viableMasks += result.viable;
      if (result.bestIoC && (!bestIoC || result.bestIoC.ioc > bestIoC.ioc))
        bestIoC = { ...result.bestIoC, startOrdinal, sign, family: 'prime-ordinal-start' };
      if (result.bestDictionary &&
          (!bestDictionary ||
           result.bestDictionary.dictionaryMatches > bestDictionary.dictionaryMatches ||
           (result.bestDictionary.dictionaryMatches === bestDictionary.dictionaryMatches &&
            result.bestDictionary.ioc > bestDictionary.ioc)))
        bestDictionary = { ...result.bestDictionary, startOrdinal, sign, family: 'prime-ordinal-start' };
    }
  }
  for (let phase = 0; phase < 16; phase++) {
    for (const sign of [-1, +1]) {
      configurations++;
      const keyAt = used => p15TotientPeriod16[(used + phase) % 16];
      assert.ok(positivePlant(ciphertext.length, keyAt, sign));
      positivePlants++;
      if (!hasLegalPath(ciphertext, keyAt, sign)) continue;
      viableConfigurations++;
      const result = enumerateMasks(ciphertext, keyAt, sign, lengths, dictionary);
      viableMasks += result.viable;
      if (result.bestIoC && (!bestIoC || result.bestIoC.ioc > bestIoC.ioc))
        bestIoC = { ...result.bestIoC, phase, sign, family: 'period16-totient' };
      if (result.bestDictionary &&
          (!bestDictionary ||
           result.bestDictionary.dictionaryMatches > bestDictionary.dictionaryMatches ||
           (result.bestDictionary.dictionaryMatches === bestDictionary.dictionaryMatches &&
            result.bestDictionary.ioc > bestDictionary.ioc)))
        bestDictionary = { ...result.bestDictionary, phase, sign, family: 'period16-totient' };
    }
  }
  p55WordTranspositionReports.push({
    direction: direction.direction,
    runes: ciphertext.length,
    wordLengths: lengths,
    configurations,
    viableConfigurations,
    viableMasks,
    bestIoC: bestIoC ? {
      family: bestIoC.family, phase: bestIoC.phase ?? null,
      startOrdinal: bestIoC.startOrdinal ?? null, sign: bestIoC.sign,
      mask: bestIoC.mask, ioc: bestIoC.ioc, words: bestIoC.words
    } : null,
    bestDictionary: bestDictionary ? {
      family: bestDictionary.family, phase: bestDictionary.phase ?? null,
      startOrdinal: bestDictionary.startOrdinal ?? null, sign: bestDictionary.sign,
      mask: bestDictionary.mask, ioc: bestDictionary.ioc,
      dictionaryMatches: bestDictionary.dictionaryMatches,
      matchedWords: bestDictionary.matchedWords, words: bestDictionary.words
    } : null
  });
}
assert.deepEqual(p55WordTranspositionReports.map(x => ({
  direction: x.direction, viableMasks: x.viableMasks
})), [
  { direction: 'spiral', viableMasks: 37 },
  { direction: 'inverse', viableMasks: 38 }
]);

function decodeWordShift(cipherWords, key, sign, mask) {
  let fOrdinal = 0;
  const out = [cipherWords[0].slice()]; // incoming continuation is not one of the 16 keyed words
  for (let wordIndex = 0; wordIndex < 16; wordIndex++) {
    const outWord = [];
    for (const value of cipherWords[wordIndex + 1]) {
      if (value === 0) {
        const literal = (mask >> fOrdinal) & 1;
        fOrdinal++;
        if (literal) { outWord.push(0); continue; }
      }
      const decoded = mod29(value + sign * key[wordIndex]);
      if (decoded === 0) return null;
      outWord.push(decoded);
    }
    out.push(outWord);
  }
  return out;
}
function encodeWordShift(plainWords, key, sign) {
  return [
    plainWords[0].slice(),
    ...plainWords.slice(1).map((word, index) =>
      word.map(value => value === 0 ? 0 : mod29(value - sign * key[index])))
  ];
}
function positiveWordShiftPlant(key, sign) {
  const plainWords = p55WordArrays.map((word, wordIndex) =>
    word.map((_, runeIndex) => mod29(wordIndex * 7 + runeIndex * 11 + 1)));
  // Three literal F positions, matching the original p55 F count.
  for (const [wordIndex, runeIndex] of [[1,0],[5,1],[9,0]]) plainWords[wordIndex][runeIndex] = 0;
  const ciphertextWords = encodeWordShift(plainWords, key, sign);
  const decodedWords = decodeWordShift(ciphertextWords, key, sign, 7);
  assert.deepEqual(decodedWords, plainWords);
  return true;
}
const p55WordShiftReports = [];
const wordShiftFamilies = [
  { name: 'printed16', values: printed },
  { name: 'prime16', values: p15Primes },
  { name: 'totient16', values: p15Primes.map(p => p - 1) },
  { name: 'phiN16', values: printed.map(eulerPhi) }
];
for (const family of wordShiftFamilies) {
  const key = p15SpiralOrder.map(i => mod29(family.values[i]));
  let viableMasks = 0;
  let bestIoC = null;
  let bestWords = null;
  for (const sign of [-1, +1]) {
    assert.ok(positiveWordShiftPlant(key, sign));
    positivePlants++;
    for (let mask = 0; mask < 8; mask++) {
      const decodedWords = decodeWordShift(p55WordArrays, key, sign, mask);
      if (!decodedWords) continue;
      viableMasks++;
      const flattened = decodedWords.flat();
      const words = decodedWords.map(word => word.map(value => corpus.translit[value]).join('').toLowerCase());
      const candidate = { mask, sign, ioc: ioc(flattened), words };
      if (!bestIoC || candidate.ioc > bestIoC.ioc) bestIoC = candidate;
      if (!bestWords || candidate.words.filter(w => dictionary.has(w)).length >
          bestWords.words.filter(w => dictionary.has(w)).length) bestWords = candidate;
    }
  }
  p55WordShiftReports.push({
    family: family.name,
    keyInSpiralOrder: key,
    viableMasks,
    bestIoC: bestIoC ? { mask: bestIoC.mask, sign: bestIoC.sign, ioc: bestIoC.ioc, words: bestIoC.words } : null,
    bestDictionary: bestWords ? {
      mask: bestWords.mask, sign: bestWords.sign, ioc: bestWords.ioc,
      dictionaryMatches: bestWords.words.filter(w => dictionary.has(w)).length,
      words: bestWords.words
    } : null
  });
}
assert.deepEqual(p55WordShiftReports.map(x => ({
  family: x.family, viableMasks: x.viableMasks
})), [
  { family: 'printed16', viableMasks: 8 },
  { family: 'prime16', viableMasks: 0 },
  { family: 'totient16', viableMasks: 0 },
  { family: 'phiN16', viableMasks: 0 }
]);

// Exact expected totals freeze the current result and guard against accidental
// changes to source arrays, word segmentation, F semantics, or sign convention.
const totals = Object.fromEntries([0,29,55].map(n => {
  const rows = keyFamilyReports.filter(x => x.page === n);
  return [n, {
    configurations: rows.reduce((s,x)=>s+x.configurations,0),
    viableConfigurations: rows.reduce((s,x)=>s+x.viableConfigurations,0),
    viableMasks: rows.reduce((s,x)=>s+x.viableMasks,0)
  }];
}));
assert.deepEqual(totals, {
  0: { configurations: 416, viableConfigurations: 27, viableMasks: 954 },
  29: { configurations: 416, viableConfigurations: 1, viableMasks: 4 },
  55: { configurations: 416, viableConfigurations: 143, viableMasks: 332 }
});
assert.deepEqual(totals, {
  0: { configurations: 320, viableConfigurations: 17, viableMasks: 752 },
  29: { configurations: 320, viableConfigurations: 0, viableMasks: 0 },
  55: { configurations: 320, viableConfigurations: 108, viableMasks: 247 }
});
assert.equal(positivePlants, 416 * 3 + 4 * 2 * 3 + 13 * 2 * 3 + 2 * (16 * 2 + 16 * 2) + 4 * 2);

// Authentic solved p56 positive control.
const expectedP56Words =
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const tokens = corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
const expectedP56 = [];
for (const word of expectedP56Words.split(' ')) {
  for (let at=0; at<word.length;) {
    const match = tokens.find(x=>word.startsWith(x.token,at));
    assert.ok(match);
    expectedP56.push(match.index);
    at += match.token.length;
  }
}
const p56 = page(56).indices;
const p56KeyAt = used => primeTable[used] - 1;
const p56Decoded = decodeF(p56, p56KeyAt, -1, 8);
assert.ok(p56Decoded);
assert.deepEqual(p56Decoded.plaintext, expectedP56);
assert.deepEqual(encodeF(expectedP56, p56KeyAt, -1), p56);
const p56IoC = ioc(expectedP56);

const primeStarts=audioPrimeReports.map(x=>({
  page:x.page,prime:x.seedPrime,sign:x.sign,viableMasks:x.viable
}));
const summaries=targets.map(target=>({
  page:target.pageNumber,
  runes:target.ciphertext.length,
  wordCount:target.wordLengths.length,
  Fcount:target.ciphertext.filter(value=>value===0).length,
  sourceKeyFamilies:keyFamilyReports.filter(x=>x.page===target.pageNumber).map(x=>({
    key:x.key,period:x.period,configurations:x.configurations,
    viableConfigurations:x.viableConfigurations,viableMasks:x.viableMasks,
    bestIoC:x.bestIoC ? {
      key:x.bestIoC.key,phase:x.bestIoC.phase,sign:x.bestIoC.sign,
      mask:x.bestIoC.mask,ioc:x.bestIoC.ioc,words:x.bestIoC.words
    } : null,
    bestDictionary:x.bestDictionary ? {
      key:x.bestDictionary.key,phase:x.bestDictionary.phase,sign:x.bestDictionary.sign,
      mask:x.bestDictionary.mask,ioc:x.bestDictionary.ioc,
      dictionaryMatches:x.bestDictionary.dictionaryMatches,
      matchedWords:x.bestDictionary.matchedWords,words:x.bestDictionary.words
    } : null
  })),
  audioPrimeStarts:audioPrimeReports.filter(x=>x.page===target.pageNumber).map(x=>({
    prime:x.seedPrime,ordinal:x.startOrdinal,sign:x.sign,viableMasks:x.viable,
    bestIoC:x.bestIoC?.ioc ?? null,
    bestDictionaryMatches:x.bestDictionary?.dictionaryMatches ?? 0
  }))
}));

console.log(JSON.stringify({
  sourceKeys:sourceKeys.map(x=>({name:x.name,period:x.key.length,key:x.key})),
  audioPrimeSeeds,
  targetSummaries:summaries,
  p0RedHeaderKeyTests:p0HeaderKeyReports,
  p55WordTranspositionTests:p55WordTranspositionReports,
  p55WordwiseCaesarTests:p55WordShiftReports,
  exactTotals:totals,
  audioPrimeTotalViableMasks:audioPrimeReports.reduce((s,x)=>s+x.viable,0),
  p56PositiveControl:{runes:p56.length,ioc:p56IoC,exactPlaintext:true},
  syntheticPositivePlants:positivePlants,
  conclusion:
    'All eleven p15 source-key families (including Euler-totient transforms of the printed grid values) have only four legal masks on p29. p0 and p55 have some F-transparent paths but no coherent word-level plaintext. The p0 red13 header as a repeating key likewise yields no coherent plaintext on its black body, p29, or p55. The p55 16-word/p15 16-cell mapping and word-wise Caesar consumers also fail. The four audio-derived prime starts are tested separately. The audio/page selector remains a hypothesis, not a decryption.'
}, null, 2));
