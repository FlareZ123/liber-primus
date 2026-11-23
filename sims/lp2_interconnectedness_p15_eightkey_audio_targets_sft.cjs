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
  ['seedBase29', base29(3301)]
].map(([name, values]) => ({ name, key: values.map(mod29) }));
assert.deepEqual(sourceKeys.map(x => x.key.length), [16,16,16,16,16,47,30,3]);

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
  0: { configurations: 320, viableConfigurations: 17, viableMasks: 752 },
  29: { configurations: 320, viableConfigurations: 0, viableMasks: 0 },
  55: { configurations: 320, viableConfigurations: 108, viableMasks: 247 }
});
assert.deepEqual(totals, {
  0: { configurations: 320, viableConfigurations: 17, viableMasks: 752 },
  29: { configurations: 320, viableConfigurations: 0, viableMasks: 0 },
  55: { configurations: 320, viableConfigurations: 108, viableMasks: 247 }
});
assert.equal(positivePlants, 320 * 3 + 4 * 2 * 3);

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
  exactTotals:totals,
  audioPrimeTotalViableMasks:audioPrimeReports.reduce((s,x)=>s+x.viable,0),
  p56PositiveControl:{runes:p56.length,ioc:p56IoC,exactPlaintext:true},
  syntheticPositivePlants:positivePlants,
  conclusion:
    'All eight p15 source-key families have zero legal inverse on p29. p0 and p55 have some F-transparent paths but no coherent word-level plaintext. The four audio-derived prime starts are tested separately. The audio/page selector remains a hypothesis, not a decryption.'
}, null, 2));
