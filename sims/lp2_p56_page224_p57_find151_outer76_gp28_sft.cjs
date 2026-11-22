'use strict';

// Original-source, read-only GP28 predecessor-rank receiver selected by
// solved p56 PAGE (prime sum 224) -> table cell 224 (value 151) -> p57 FIND.
// Node.js 22 / Windows 11. No CLI arguments, randomness or file writes.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const resource = (name) =>
  path.join(__dirname, '..', 'resources', 'liber-primus', name);

const corpus = JSON.parse(fs.readFileSync(resource('lp2-corpus.json'), 'utf8'));
const grid = JSON.parse(fs.readFileSync(resource('base60-grid.json'), 'utf8'));
const transcription = fs.readFileSync(resource('lp2-transcription.txt'), 'utf8');
const runeIndex = new Map(corpus.runes.map((rune, index) => [rune, index]));

/** @param {number[]} runeIndices */
const transliterate = (runeIndices) =>
  runeIndices.map((index) => corpus.translit[index]).join('');

/** @param {number[]} runeIndices */
const primeSum = (runeIndices) =>
  runeIndices.reduce((sum, index) => sum + corpus.prime[index], 0);

/** Split on authentic text word/punctuation markers, preserving line/page carries. */
function splitPrintedWords() {
  /** @type {number[][]} */
  const result = [];
  /** @type {number[]} */
  let word = [];

  for (const glyph of transcription) {
    const index = runeIndex.get(glyph);
    if (index !== undefined) {
      word.push(index);
    } else if ('-.$&§'.includes(glyph) && word.length > 0) {
      result.push(word);
      word = [];
    }
  }
  if (word.length > 0) result.push(word);
  return result;
}

/** First n ordinary rational primes (not GP rune-prime ordinals). */
function firstPrimes(n) {
  const values = [];
  for (let p = 2; values.length < n; p++) {
    let prime = true;
    for (let d = 2; d * d <= p; d++) {
      if (p % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) values.push(p);
  }
  return values;
}

/** Authentic p56 operation: shift down by phi(prime), plaintext-F skips the clock. */
function decodeP56() {
  const source = corpus.pages[56].indices;
  const primes = firstPrimes(source.length - 1);
  let clock = 0;
  const plain = source.map((cipher, i) => {
    if (i === 56) {
      assert.equal(cipher, 0, 'Original transparent-F at p56 offset 56');
      return 0;
    }
    return (cipher - (primes[clock++] - 1) % 29 + 29) % 29;
  });
  assert.equal(clock, 84);
  assert.ok(transliterate(plain).startsWith('ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGE'));
  return plain;
}

const allWords = splitPrintedWords();
assert.equal(allWords.length, 2941);
assert.equal(allWords.slice(0, 2896).flat().length, 12956);
const p56Words = allWords.slice(2896, 2921);
const p57Words = allWords.slice(2921);
assert.equal(p56Words.length, 25);
assert.equal(p57Words.length, 20);
assert.equal(p56Words.flat().length, 85);
assert.equal(p57Words.flat().length, 95);

const knownPlainP56 = decodeP56();
let cursor = 0;
const p56 = p56Words.map((word) => {
  const plain = knownPlainP56.slice(cursor, cursor + word.length);
  cursor += word.length;
  return { word: transliterate(plain), sum: primeSum(plain) };
});
const p57 = p57Words.map((word) => ({
  word: transliterate(word),
  sum: primeSum(word),
}));
assert.equal(cursor, 85);
assert.equal(p56.filter((x) => x.word === 'PAGE').length, 2);
assert.equal(p56.find((x) => x.word === 'PAGE').sum, 224);
assert.equal(p57.find((x) => x.word === 'FIND').sum, 151);
assert.equal(p57.find((x) => x.word === 'MUST').sum, 186);
assert.equal(p56.find((x) => x.word === 'HASHES').sum, 316);
assert.equal(p56.find((x) => x.word === 'OUT').sum, 69);
assert.equal(p57.find((x) => x.word === 'DIUINITY').sum, 376);
assert.equal(p57.find((x) => x.word === 'LICE').sum, 184);

const tokens = grid.rows.flat();
assert.equal(tokens.length, 256);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every((row) => row.length === 8));
const bytes = tokens.map((token) =>
  60 * grid.alphabet.indexOf(token[0]) + grid.alphabet.indexOf(token[1])
);
const missingFAlphabet = grid.alphabet.replace('f', '');
const base59 = tokens.map((token) =>
  59 * missingFAlphabet.indexOf(token[0]) +
  missingFAlphabet.indexOf(token[1])
);
assert.deepEqual(
  [tokens[223], bytes[223], tokens[59], bytes[59], tokens[119], bytes[119]],
  ['2V', 151, '19', 69, '34', 184]
);
assert.deepEqual(
  [tokens[150], base59[150], tokens[151], base59[151]],
  ['2X', 151, '39', 186]
);

// The clear parable also has a source-native "shed / emerge" word-sum loop.
// These are source arithmetical facts, not p55 plaintext or a cipher method.
const p57RuneWord = (spelling) =>
  p57Words.find((word) => transliterate(word) === spelling);
const title = p57RuneWord('PARABLE');
const tunnel = p57RuneWord('TUNNELNG');
const divinity = p57RuneWord('DIUINITY');
const like = p57RuneWord('LICE');
const emerge = p57RuneWord('EMERGE');
assert.equal(primeSum(title.slice(1, -1)), primeSum(tunnel));
assert.equal(primeSum(tunnel), 339);
assert.equal(tokens[82], '3L');
assert.equal(bytes[82], primeSum(tunnel.slice(1, -1)));
assert.equal(primeSum(tunnel.slice(1, -1)), 201);
assert.equal(primeSum(divinity.slice(1, -1)), primeSum(like));
assert.equal(primeSum(divinity.slice(1, -1)), 184);
assert.equal(bytes[119], 184);
assert.equal(primeSum(emerge), 300);
assert.equal(tokens[43], '1D');
assert.equal(bytes[43], corpus.prime[like[0]]);
assert.equal(bytes[43], 73);

// The original p57 three stanza sums are the historical prime factors
// of the 2013 PARABLE title. The inferred prime-ordinal link from 201
// lands exactly on stanza three, but does not prescribe a p55 decoder.
const stanzaSums = [
  primeSum(p57Words.slice(1, 8).flat()),
  primeSum(p57Words.slice(8, 14).flat()),
  primeSum(p57Words.slice(14).flat()),
];
assert.deepEqual(stanzaSums, [1259, 1031, 1229]);
assert.equal(stanzaSums.reduce((product, n) => product * n, 1), 1595277641);
const primes205 = firstPrimes(205);
assert.deepEqual([primes205[204], primes205[172], primes205[200]],
  [1259, 1031, 1229]);
assert.deepEqual([bytes[204], bytes[172], bytes[200]], [194, 148, 110]);

// First-party lexical map: PAGE (224) -> table[223] = 151 -> FIND (151).
// The 224th cell is *already* on the 76-cell outer circumference.
const startingCell = primeSum(knownPlainP56.slice(
  p56Words.slice(0, 9).reduce((s, word) => s + word.length, 0),
  p56Words.slice(0, 10).reduce((s, word) => s + word.length, 0)
)) - 1;
assert.equal(startingCell, 223);

const rim = [];
for (let c = 0; c < 8; c++) rim.push(c);
for (let r = 1; r < 32; r++) rim.push(8 * r + 7);
for (let c = 6; c >= 0; c--) rim.push(8 * 31 + c);
for (let r = 30; r >= 1; r--) rim.push(8 * r);
assert.equal(rim.length, 76);
assert.equal(new Set(rim).size, 76);
assert.equal(rim.indexOf(startingCell), 34);

const sourceCipher = corpus.pages[55].indices;
const lastP54 = corpus.pages[54].indices.at(-1);
assert.equal(sourceCipher.length, 76);
assert.equal(typeof lastP54, 'number');

/** @param {number[]} plain @param {number[]} key @param {number} sign */
function encryptRank28(plain, key, sign) {
  let preceding = lastP54;
  return plain.map((symbol, i) => {
    const cipher = symbol === 28
      ? preceding
      : (preceding + 1 + (symbol - sign * key[i] + 28 * 28) % 28) % 29;
    preceding = cipher;
    return cipher;
  });
}

/** @param {number[]} cipher @param {number[]} key @param {number} sign */
function decryptRank28(cipher, key, sign) {
  let preceding = lastP54;
  return cipher.map((symbol, i) => {
    const result = symbol === preceding ? 28 :
      (((symbol - preceding - 1 + 29) % 29) + sign * key[i] + 28 * 28) % 28;
    preceding = symbol;
    return result;
  });
}

/** @param {number[]} values */
function coincidence(values) {
  const counts = Array(29).fill(0);
  for (const index of values) counts[index]++;
  return counts.reduce((sum, v) => sum + v * (v - 1), 0) /
    (values.length * (values.length - 1));
}

const origin = rim.indexOf(startingCell);
const outputs = [];
for (const direction of [1, -1]) {
  const cells = Array.from({ length: 76 }, (_, offset) =>
    rim[(origin + direction * offset + 76) % 76]);
  const key = cells.map((cell) => bytes[cell] % 28);
  for (const sign of [1, -1]) {
    const output = decryptRank28(sourceCipher, key, sign);
    assert.deepEqual(encryptRank28(output, key, sign), sourceCipher);
    assert.equal(output.length, 76);
    outputs.push({ direction, sign, ioc: coincidence(output),
      eaOffsets: output.flatMap((value, i) => value === 28 ? [i] : []),
      roman: transliterate(output), positions: cells });
  }
}
assert.deepEqual(outputs.map((x) => x.eaOffsets), [[59],[59],[59],[59]]);
assert.deepEqual(outputs.map((x) => Number(x.ioc.toFixed(8))),
  [0.04175439, 0.03157895, 0.03157895, 0.03473684]);
assert.equal(outputs[0].roman.startsWith('GIIASNGFNNIFSDLUGCIA'), true);
assert.equal(outputs[3].roman.startsWith('EOOUFLIJUHOPMMMM'), true);


// Count all source word→table→source word links, including non-instruction words.
// The shuffled-multiset null prevents treating that broad link count as evidence.
const allSums = p56.concat(p57).map((x) => x.sum);
const addresses = [...new Set(allSums.map((sum) => (sum - 1) % 256))];
const targets = new Set(allSums);
assert.equal(addresses.length, 36);
assert.equal(targets.size, 37);

/** @param {number[]} tape */
function wordLinks(tape) {
  return addresses.filter((i) => targets.has(tape[i])).length;
}

/** @param {number[]} original */
function shuffledLinkTail(original) {
  let state = 0x33012659;
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
  const trials = 150000;
  const actual = wordLinks(original);
  let atLeast = 0;
  for (let trial = 0; trial < trials; trial++) {
    const tape = original.slice();
    for (let i = tape.length - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [tape[i], tape[j]] = [tape[j], tape[i]];
    }
    if (wordLinks(tape) >= actual) atLeast++;
  }
  return { actual, atLeast, trials };
}
const base60Links = shuffledLinkTail(bytes);
const base59Links = shuffledLinkTail(base59);
assert.deepEqual(base60Links, { actual:4, atLeast:91744, trials:150000 });
assert.deepEqual(base59Links, { actual:6, atLeast:12582, trials:150000 });
console.log('Exact-multiset source-word link controls',
  JSON.stringify({base60:base60Links, base59:base59Links}));

console.log('Authentic word link: p56 PAGE=224 -> base60 cell224 (2V)=151 -> p57 FIND=151');
console.log('Secondary base60 links: HASHES=316 -> OUT=69; DIUINITY=376 -> LICE=184');
console.log('Competing base59 link: FIND=151 -> base59 cell151 (2X)=151, E neighbor MUST=186');
console.log('76-rune p55 receiver: original outer cell223 (rim phase34), exact p54 predecessor');
for (const x of outputs) console.log(JSON.stringify({
  direction:x.direction, sign:x.sign, ioc:x.ioc, eaOffsets:x.eaOffsets,
  decoded:x.roman
}));
console.log('All four complete original GP28 receivers are nonprose. No unknown plaintext/key.');

// Strict directed p56-to-p57 audit: one-based addresses only, no wrap.
// This is distinct from the exploratory combined-page modulo-256 inventory above.
const uniqueWords = (items) => [...new Map(items.map((item) => [item.word, item])).values()];
const strictSources = uniqueWords(p56).filter((item) => item.sum >= 1 && item.sum <= 256);
const strictTargets = uniqueWords(p57).filter((item) => item.sum >= 1 && item.sum <= 256);
assert.equal(strictSources.length, 18);
assert.equal(strictTargets.length, 12);
assert.equal(strictSources.length * strictTargets.length, 216);
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let value = 1;
  for (let i = 1; i <= Math.min(k, n - k); i++) value *= (n - i + 1) / i;
  return value;
}
function hypergeometricPmf(N, K, n) {
  const pmf = Array(n + 1).fill(0), denominator = choose(N, n);
  for (let x = Math.max(0, n - (N - K)); x <= Math.min(n, K); x++)
    pmf[x] = choose(K, x) * choose(N - K, n - x) / denominator;
  return pmf;
}
function convolvePmf(a, b) {
  const result = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++)
    result[i + j] += a[i] * b[j];
  return result;
}
function strictCrossPageNull(values, radix) {
  const targetSums = new Set(strictTargets.map((item) => item.sum));
  const sourceAddresses = strictSources.map((item) => item.sum - 1);
  const targetFlags = values.map((value) => targetSums.has(value));
  const K = targetFlags.filter(Boolean).length, links = [];
  for (const source of strictSources) for (const target of strictTargets) {
    const cell = source.sum - 1;
    if (values[cell] === target.sum) links.push({
      from: source.word, fromSum: source.sum, cell: cell + 1,
      token: tokens[cell], value: values[cell], to: target.word, toSum: target.sum,
    });
  }
  const globalPmf = hypergeometricPmf(256, K, sourceAddresses.length);
  const rowAddressCounts = Array.from({ length: 32 }, (_, row) =>
    sourceAddresses.filter((address) => Math.floor(address / 8) === row).length);
  const rowTargetCounts = Array.from({ length: 32 }, (_, row) =>
    targetFlags.slice(row * 8, row * 8 + 8).filter(Boolean).length);
  let withinRowPmf = [1];
  for (let row = 0; row < 32; row++) if (rowAddressCounts[row])
    withinRowPmf = convolvePmf(withinRowPmf,
      hypergeometricPmf(8, rowTargetCounts[row], rowAddressCounts[row]));
  const page = strictSources.find((item) => item.word === 'PAGE');
  const find = strictTargets.find((item) => item.word === 'FIND');
  const pageCell = page.sum - 1;
  const pairValueMultiplicity = values.filter((value) => value === find.sum).length;
  const pairRowMultiplicity = values.slice(Math.floor(pageCell / 8) * 8,
    Math.floor(pageCell / 8) * 8 + 8).filter((value) => value === find.sum).length;
  return {
    radix, sourceWords: strictSources, targetWords: strictTargets,
    pairOpportunities: strictSources.length * strictTargets.length, links,
    targetValueCellCount: K,
    targetCellIndices: targetFlags.flatMap((flag, i) => flag ? [i + 1] : []),
    global: { pmf: globalPmf, expected: sourceAddresses.length * K / 256,
      pAtLeastOne: globalPmf.slice(1).reduce((sum, p) => sum + p, 0) },
    withinRow: { rowAddressCounts, rowTargetCounts, pmf: withinRowPmf,
      expected: rowAddressCounts.reduce((sum, n, row) => sum + n * rowTargetCounts[row] / 8, 0),
      pAtLeastOne: withinRowPmf.slice(1).reduce((sum, p) => sum + p, 0) },
    prespecifiedPageFindPair: { globalProbability: pairValueMultiplicity / 256,
      withinRowProbability: pairRowMultiplicity / 8 },
  };
}
const strictBase60 = strictCrossPageNull(bytes, 'base60');
const strictBase59 = strictCrossPageNull(base59, 'base59');
assert.deepEqual(strictBase60.links, [{ from:'PAGE',fromSum:224,cell:224,token:'2V',value:151,to:'FIND',toSum:151 }]);
assert.equal(strictBase60.targetValueCellCount, 15);
assert.ok(Math.abs(strictBase60.global.expected - 1.0546875) < 1e-12);
assert.ok(Math.abs(strictBase60.global.pAtLeastOne - 0.675637516747424) < 1e-12);
assert.ok(Math.abs(strictBase60.withinRow.expected - 0.875) < 1e-12);
assert.ok(Math.abs(strictBase60.withinRow.pAtLeastOne - 0.6153182983398438) < 1e-12);
assert.deepEqual(strictBase60.prespecifiedPageFindPair,{globalProbability:1/256,withinRowProbability:1/8});
assert.equal(strictBase59.links.length, 0);
assert.equal(strictBase59.targetValueCellCount, 16);
assert.ok(Math.abs(strictBase59.global.expected - 1.125) < 1e-12);
assert.ok(Math.abs(strictBase59.global.pAtLeastOne - 0.6998637603098571) < 1e-12);
assert.ok(Math.abs(strictBase59.withinRow.expected - 1.875) < 1e-12);
assert.ok(Math.abs(strictBase59.withinRow.pAtLeastOne - 0.897003173828125) < 1e-12);
console.log('Strict directed p56-to-p57 audit',
  JSON.stringify({ base60: strictBase60, base59: strictBase59 }));
