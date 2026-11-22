'use strict';

/**
 * Source-shaped 272-cell prime-wheel / 76-ordinal-carry readout gate.
 *
 * Candidate: p15's exact 16-value clockwise Fibonacci-prime spiral followed
 * by the provisional 256-cell p49-51 base60 table. Traverse this 272-cell
 * ring by the GP prime value of each rune in solved p56 plaintext || clear
 * p57. Whenever the parallel GP ordinal cursor carries through 29, emit the
 * current ring cell modulo 29. The two source sums force 29 complete prime
 * laps and exactly 76 ordinal carries, matching p55's 76 runes.
 *
 * Test only the natural forward ring, positive prime steps, C-K direction,
 * both before/after read conventions, and all eight p55 literal-F masks
 * under the authenticated p56 plaintext-F bypass. Also print two no-bypass
 * diagnostics. This is a bounded candidate gate, not an open key search.
 *
 * Node.js 22+, built-in libraries only:
 *   node sims/lp2_terminal180_272ring_76carry_dualwheel_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const mod = (x, m = 29) => ((x % m) + m) % m;

const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tableSource = JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const transcription = read('resources/liber-primus/lp2-transcription.txt');
const dictionaryText = read('resources/control/english_wordfreq_textblob.txt');
const { readSquare, clockwiseSpiral } = require('./fibonacci_prime_spiral.cjs');

const p15Grid = readSquare();
const p15Coordinates = clockwiseSpiral();
const p15Spiral = p15Coordinates.map(([r, c]) => p15Grid[r][c]);
assert.deepEqual(p15Spiral, [
  3299,3298,3296,3294,3288,3278,3258,3222,
  3152,3038,2838,2472,1820,708,1206,4516
]);
const table256 = tableSource.pages.flatMap(page => page.bytes);
assert.equal(table256.length, 256);
const ring = p15Spiral.concat(table256);
assert.equal(ring.length, 272);
const primeValues = gp.prime;
assert.equal(primeValues.length, 29);

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

const p56Cipher = gp.pages[56].indices;
const p57Clear = gp.pages[57].indices;
const p55Cipher = gp.pages[55].indices;
assert.equal(p56Cipher.length, 85);
assert.equal(p57Clear.length, 95);
assert.equal(p55Cipher.length, 76);

const translitTokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

function gpWord(word) {
  word = word.toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C')
    .replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith('ING', i)) { out.push(21); i += 3; }
    else if (word.startsWith('IO', i)) { out.push(27); i += 2; }
    else {
      const token = translitTokens.find(t => word.startsWith(t.s, i));
      assert.ok(token, 'Unmapped GP-native word: ' + word);
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}

const knownP56Text =
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const knownP56 = knownP56Text.split(' ').flatMap(gpWord);
assert.equal(knownP56.length, 85);
assert.equal(knownP56.indexOf(0), 56);

const p56KeyPrimes = firstPrimes(84);
let p56KeyCursor = 0;
const p56Plain = p56Cipher.map((c, i) => {
  if (i === 56) return 0; // authenticated literal plaintext-F bypass
  return mod(c - (p56KeyPrimes[p56KeyCursor++] - 1));
});
assert.equal(p56KeyCursor, 84);
assert.deepEqual(p56Plain, knownP56);

const terminal = p56Plain.concat(p57Clear);
assert.equal(terminal.length, 180);
const ordinalSum = terminal.reduce((s, x) => s + x, 0);
const primeSum = terminal.reduce((s, x) => s + primeValues[x], 0);
assert.equal(ordinalSum, 2204);
assert.equal(ordinalSum, 29 * 76);
assert.equal(primeSum, 7888);
assert.equal(primeSum, 29 * 272);
assert.equal(primeSum % 272, 0);

function makeKey(readBeforePrimeStep) {
  let ordinalCursor = 0;
  let primeCursor = 0;
  const key = [];
  const events = [];
  for (let i = 0; i < terminal.length; i++) {
    const rune = terminal[i];
    const primeBefore = primeCursor;
    const ordinalTotal = ordinalCursor + rune;
    const carry = ordinalTotal >= 29;
    ordinalCursor = ordinalTotal % 29;
    const primeAfter = mod(primeCursor + primeValues[rune], 272);
    const readIndex = readBeforePrimeStep ? primeBefore : primeAfter;
    if (carry) {
      const value = ring[readIndex];
      key.push(value % 29);
      events.push({
        sourceIndex: i,
        triggerRune: rune,
        primeBefore,
        primeAfter,
        readIndex,
        tableIndex: readIndex >= 16 ? readIndex - 16 : null,
        cellValue: value,
        keyValue: value % 29
      });
    }
    primeCursor = primeAfter;
  }
  assert.equal(ordinalCursor, 0);
  assert.equal(primeCursor, 0);
  assert.equal(key.length, 76);
  return { key, events };
}

const runeMap = new Map(gp.runes.map((rune, index) => [rune, index]));
const p55Source = transcription.split('%')[54];
const p55Words = [];
let partial = [];
for (const glyph of p55Source) {
  if (runeMap.has(glyph)) partial.push(runeMap.get(glyph));
  else if ('-.$&§'.includes(glyph) && partial.length) {
    p55Words.push(partial);
    partial = [];
  }
}
if (partial.length) p55Words.push(partial);
assert.deepEqual(p55Words.map(word => word.length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.deepEqual(p55Words.flat(), p55Cipher);
const fPositions = p55Cipher.flatMap((rune, i) => rune === 0 ? [i] : []);
assert.deepEqual(fPositions, [15,25,41]);

const dictionary = new Map();
for (const word of dictionaryText.match(/^[a-z]+/gmi) || []) {
  const encoded = gpWord(word);
  if (encoded.length > 0 && encoded.length <= 16 &&
      !dictionary.has(encoded.join(','))) {
    dictionary.set(encoded.join(','), word);
  }
}
assert.equal(dictionary.size, 29055);

function scoreWords(plain) {
  let cursor = 0;
  const matches = [];
  for (let wi = 0; wi < p55Words.length; wi++) {
    const length = p55Words[wi].length;
    const word = plain.slice(cursor, cursor + length);
    cursor += length;
    if (wi === 0 || length < 3) continue; // p55 begins with a carried fragment
    const hit = dictionary.get(word.join(','));
    if (hit) matches.push({ wordIndex: wi, word: hit });
  }
  assert.equal(cursor, 76);
  return matches;
}

function scaledIoC(values) {
  const histogram = new Array(29).fill(0);
  values.forEach(value => histogram[value]++);
  return 29 * histogram.reduce((s, n) => s + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

const candidateResults = [];
const readouts = {};
for (const timing of ['before', 'after']) {
  const generated = makeKey(timing === 'before');
  readouts[timing] = generated;
  for (let mask = 0; mask < 8; mask++) {
    let keyCursor = 0;
    const plain = [];
    const contradictions = [];
    for (let i = 0; i < p55Cipher.length; i++) {
      const fIndex = fPositions.indexOf(i);
      const bypass = fIndex >= 0 && Boolean(mask & (1 << fIndex));
      if (bypass) {
        plain.push(0);
        continue;
      }
      const decoded = mod(p55Cipher[i] - generated.key[keyCursor++]);
      if (decoded === 0) contradictions.push(i);
      plain.push(decoded);
    }
    const matches = scoreWords(plain);
    candidateResults.push({
      timing,
      literalFMask: mask,
      keySymbolsConsumed: keyCursor,
      nonBypassedPlaintextFContradictions: contradictions,
      dictionaryWordMatches: matches,
      scaledIoC: scaledIoC(plain),
      output: plain.map(index => gp.translit[index]).join(' ')
    });
  }
}
assert.equal(candidateResults.length, 16);
assert.ok(candidateResults.every(x =>
  x.nonBypassedPlaintextFContradictions.length > 0));
assert.ok(candidateResults.every(x => x.dictionaryWordMatches.length === 0));
const maxFTransparentIoC = Math.max(...candidateResults.map(x => x.scaledIoC));
assert.ok(Math.abs(maxFTransparentIoC - 1.0582456140350878) < 1e-12);

const noBypass = [];
for (const timing of ['before', 'after']) {
  const key = readouts[timing].key;
  const plain = p55Cipher.map((rune, i) => mod(rune - key[i]));
  noBypass.push({
    timing,
    dictionaryWordMatches: scoreWords(plain),
    scaledIoC: scaledIoC(plain),
    plaintextFPositions: plain.flatMap((rune, i) => rune === 0 ? [i] : []),
    output: plain.map(index => gp.translit[index]).join(' ')
  });
}
assert.ok(noBypass.every(x => x.dictionaryWordMatches.length === 0));

const knownAdjudicatedCells = [25,45,50,165,172,175,182,199,215,237,246];
const readCellAudit = Object.fromEntries(Object.entries(readouts).map(([timing, value]) => {
  const tableEvents = value.events.filter(event => event.tableIndex !== null);
  return [timing, {
    p15CellsRead: value.events.length - tableEvents.length,
    tableCellsRead: tableEvents.length,
    knownOriginalPixelAdjudicationsHit: tableEvents
      .filter(event => knownAdjudicatedCells.includes(event.tableIndex))
      .map(event => event.tableIndex),
    tableIndicesRead: tableEvents.map(event => event.tableIndex)
  }];
}));

// Decoder positive: the same generated 76-shift stream round-trips a known
// 76-rune p57 control under the literal-F bypass rule.
const plant = p57Clear.slice(0, 76);
const plantKey = readouts.after.key;
const plantCipher = [];
const plantBypasses = new Set();
let plantKeyCursor = 0;
for (let i = 0; i < plant.length; i++) {
  if (plant[i] === 0) {
    plantCipher.push(0);
    plantBypasses.add(i);
  } else {
    plantCipher.push(mod(plant[i] + plantKey[plantKeyCursor++]));
  }
}
let recoverCursor = 0;
const recoveredPlant = plantCipher.map((rune, i) =>
  plantBypasses.has(i) ? 0 : mod(rune - plantKey[recoverCursor++]));
assert.deepEqual(recoveredPlant, plant);
assert.equal(recoverCursor, plantKeyCursor);

const result = {
  candidate: {
    p05Square272: 'first-party LP1 p05 square has 272 in opposite corners; p05 says primes/totient are sacred',
    terminalRunes: 180,
    ordinalSum,
    ordinalCarries: 76,
    primeSum,
    primeLaps: 29,
    phi272: 128,
    ringConstruction: 'p15 exact clockwise Fibonacci-prime spiral (16 values) || p49-51 provisional base60 table (256 values)',
    ringLength: ring.length,
    ringReadout: 'advance prime cursor by GP prime value; on each ordinal carry read ring cell mod29'
  },
  originalP55: {
    runes: p55Cipher.length,
    wordLengths: p55Words.map(word => word.length),
    ciphertextFPositions: fPositions
  },
  readouts: Object.fromEntries(Object.entries(readouts).map(([timing, value]) => [
    timing, {key: value.key, events: value.events}
  ])),
  p55FTransparentCandidates: {
    count: candidateResults.length,
    allFailLiteralFRule: true,
    minimumNonBypassedFContradictions:
      Math.min(...candidateResults.map(x => x.nonBypassedPlaintextFContradictions.length)),
    maximumDictionaryWordMatches:
      Math.max(...candidateResults.map(x => x.dictionaryWordMatches.length)),
    maximumScaledIoC: maxFTransparentIoC,
    results: candidateResults
  },
  noBypassDiagnostics: noBypass,
  tableInputAudit: {
    sourceNotes: tableSource.source_notes,
    knownOriginalPixelAdjudicatedCellIndices: knownAdjudicatedCells,
    selectedCellAudit: readCellAudit
  },
  positiveControl: {
    source: 'p57 first 76 clear runes',
    recoveredExactly: true,
    plaintextFBypasses: plantBypasses.size
  },
  conclusion: 'The fixed forward 272-ring / 76-carry readout fails on original p55 under the current provisional base60 table and the authentic p56 literal-F rule. The p50 table is not comprehensively pixel-adjudicated, so this is conditional intermediate evidence, not a definitive exclusion of the 272/76 source relation.'
};
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
module.exports = { makeKey, scaledIoC };
