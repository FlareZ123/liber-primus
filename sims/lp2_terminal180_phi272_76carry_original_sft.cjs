'use strict';

/**
 * Original LP2 272-ring / 76-carry readout with Euler's totient on the
 * pointed-to cell. Source-selected primitives: GP primes and totient,
 * p15 Fibonacci-prime spiral, p50 32x8 sexagesimal byte table, terminal
 * known p56/p57, and the original p55 76-rune ciphertext.
 *
 * The combination remains a hypothesis, not an attested Cicada decoder.
 * Read-only Windows/Node 22 single-file test with detailed JSON logging.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const load = file => fs.readFileSync(path.join(ROOT, file), 'utf8');
const mod = (x, n = 29) => ((x % n) + n) % n;

const gp = JSON.parse(load('resources/liber-primus/lp2-corpus.json'));
const grid = JSON.parse(load('resources/liber-primus/lp2-grid-256.json'));
const transcript = load('resources/liber-primus/lp2-transcription.txt');
const wordSource = load('resources/control/english_wordfreq_textblob.txt');
const { readSquare, clockwiseSpiral } = require('./fibonacci_prime_spiral.cjs');

function phi(n) {
  if (!Number.isInteger(n) || n <= 0) return null;
  let remainder = n;
  let value = n;
  for (let divisor = 2; divisor * divisor <= remainder; divisor++) {
    if (remainder % divisor !== 0) continue;
    while (remainder % divisor === 0) remainder /= divisor;
    value -= value / divisor;
  }
  if (remainder > 1) value -= value / remainder;
  return value;
}

function primes(count) {
  const list = [];
  for (let n = 2; list.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { isPrime = false; break; }
    }
    if (isPrime) list.push(n);
  }
  return list;
}

const tokens = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
function encodeWord(text) {
  const value = text.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < value.length;) {
    if (value.startsWith('ING', i)) { out.push(21); i += 3; }
    else if (value.startsWith('IO', i)) { out.push(27); i += 2; }
    else {
      const token = tokens.find(t => value.startsWith(t.s, i));
      assert.ok(token, 'Unmapped GP spelling ' + value);
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}

const cipher56 = gp.pages[56].indices;
const clear57 = gp.pages[57].indices;
const cipher55 = gp.pages[55].indices;
assert.deepEqual([cipher56.length, clear57.length, cipher55.length],
  [85, 95, 76]);
let consumed = 0;
const historicalPrimes = primes(84);
const plain56 = cipher56.map((value, i) => i === 56
  ? 0 : mod(value - (historicalPrimes[consumed++] - 1)));
assert.equal(consumed, 84);
const known56 = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'
  .split(' ').flatMap(encodeWord);
assert.deepEqual(plain56, known56);

const terminal = plain56.concat(clear57);
assert.equal(terminal.length, 180);
assert.equal(terminal.reduce((a, b) => a + b, 0), 29 * 76);
assert.equal(terminal.reduce((a, b) => a + gp.prime[b], 0), 29 * 272);

const spiral = clockwiseSpiral().map(([r, c]) => readSquare()[r][c]);
assert.deepEqual(spiral,
  [3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
   3152, 3038, 2838, 2472, 1820, 708, 1206, 4516]);
const ring = spiral.concat(grid.pages.flatMap(page => page.bytes));
assert.equal(ring.length, 272);

function readCarries(beforeStep) {
  let ordinal = 0;
  let primeCursor = 0;
  const events = [];
  for (let i = 0; i < terminal.length; i++) {
    const rune = terminal[i];
    const oldCursor = primeCursor;
    primeCursor = mod(primeCursor + gp.prime[rune], 272);
    ordinal += rune;
    if (ordinal >= 29) {
      ordinal -= 29;
      const ringIndex = beforeStep ? oldCursor : primeCursor;
      events.push({ sourceRune: i, ringIndex, sourceValue: ring[ringIndex],
        totient: phi(ring[ringIndex]) });
    }
  }
  assert.equal(ordinal, 0);
  assert.equal(primeCursor, 0);
  assert.equal(events.length, 76);
  return events;
}

const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const p55Source = transcript.split('%')[54];
const printedWords = [];
let fragment = [];
for (const ch of p55Source) {
  if (runeIndex.has(ch)) fragment.push(runeIndex.get(ch));
  else if ('-.$&§'.includes(ch) && fragment.length) {
    printedWords.push(fragment);
    fragment = [];
  }
}
if (fragment.length) printedWords.push(fragment);
assert.deepEqual(printedWords.map(x => x.length),
  [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
assert.deepEqual(printedWords.flat(), cipher55);

const dictionary = new Map();
for (const text of wordSource.match(/^[a-z]+/gmi) || []) {
  const values = encodeWord(text);
  if (values.length && values.length <= 16 && !dictionary.has(values.join(','))) {
    dictionary.set(values.join(','), text);
  }
}
assert.equal(dictionary.size, 29055);

function wordHits(plain) {
  const hits = [];
  let offset = 0;
  for (let w = 0; w < printedWords.length; w++) {
    const n = printedWords[w].length;
    if (w > 0 && n >= 3) {
      const hit = dictionary.get(plain.slice(offset, offset + n).join(','));
      if (hit) hits.push({ word: w, spelling: hit });
    }
    offset += n;
  }
  assert.equal(offset, 76);
  return hits;
}
function scaledIoc(values) {
  const bins = Array(29).fill(0);
  values.forEach(x => bins[x]++);
  return 29 * bins.reduce((sum, n) => sum + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}

const fixedFPositions = cipher55.flatMap((v, i) => v === 0 ? [i] : []);
assert.deepEqual(fixedFPositions, [15,25,41]);
const records = [];
let sourceUndefined = [];
for (const before of [true, false]) {
  const events = readCarries(before);
  const zeros = events.filter(e => e.totient === null);
  if (zeros.length) {
    sourceUndefined = zeros;
    records.push({ timing: before ? 'before' : 'after',
      defined: false, nullTotientEvents: zeros });
    continue;
  }
  const key = events.map(e => mod(e.totient));
  for (let mask = 0; mask < 8; mask++) {
    let keyCursor = 0;
    const output = [];
    const contradictions = [];
    for (let i = 0; i < cipher55.length; i++) {
      const fi = fixedFPositions.indexOf(i);
      if (fi !== -1 && (mask & (1 << fi))) {
        output.push(0);
      } else {
        const value = mod(cipher55[i] - key[keyCursor++]);
        if (value === 0) contradictions.push(i);
        output.push(value);
      }
    }
    records.push({ timing: 'before', literalFMask: mask,
      keyConsumed: keyCursor, contradictions,
      hits: wordHits(output), scaledIoc: scaledIoc(output),
      plaintext: output.map(v => gp.translit[v]).join(' ') });
  }
  // Genuine 76-rune clear-p57 method-positive under the same source key.
  const known = clear57.slice(0, 76);
  let pos = 0;
  const encrypted = known.map(p => p === 0 ? 0 : mod(p + key[pos++]));
  let decryptPosition = 0;
  const recovered = encrypted.map((c, i) => known[i] === 0
    ? 0 : mod(c - key[decryptPosition++]));
  assert.deepEqual(recovered, known);
  assert.equal(decryptPosition, pos);
}
assert.equal(records.length, 9);
assert.equal(sourceUndefined.length, 1);
assert.deepEqual(sourceUndefined[0], {
  sourceRune: sourceUndefined[0].sourceRune, ringIndex: 245,
  sourceValue: 0, totient: null
});
assert.equal(records.filter(r => r.timing === 'before').length, 8);
assert.equal(records.filter(r => r.timing === 'before'
  && !r.contradictions.length).length, 6);
assert.ok(records.filter(r => r.timing === 'before')
  .every(r => r.hits.length === 0));
const outcome = {
  original: { unknown55: 76, terminalKnown: 180,
    originalFPositions: fixedFPositions, dictionaryForms: dictionary.size },
  operator: 'K = phi(value at 272-ring position on each GP-ordinal carry)',
  source: 'LP1 totient cue; p15 Fibonacci-prime spiral; printed p50 bytes',
  ringTiming: ['before', 'after'], sourceUndefined, records,
  originalPlaintextRecovered: false,
  p57PlantedExactRoundtrip: true
};
process.stdout.write(JSON.stringify(outcome, null, 2) + '\n');
