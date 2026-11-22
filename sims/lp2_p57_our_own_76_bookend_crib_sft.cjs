'use strict';

/**
 * Source-authored p57 phrase OUR OWN -> 76 -> 76-runic terminal/p50 ring.
 * Anchored six-rune Vigenere crib test on the repeated p27/p55 DJU-BEI.
 *
 * Run: node sims/lp2_p57_our_own_76_bookend_crib_sft.cjs
 * All original runes remain intact; native-GP positive plants verify the
 * plaintext-F transparent, non-key-consuming cipher semantics.
 *
 * The source supplies the words, prime values, images, and repeated sequence.
 * The claim that p27/p55 encrypt OUR OWN is explicitly a hypothesis.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const base = path.join(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(base, 'lp2-corpus.json'), 'utf8'));
const transcription = fs.readFileSync(path.join(base, 'lp2-transcription.txt'), 'utf8');
const mod = n => ((n % 29) + 29) % 29;
const runeIndex = new Map(corpus.runes.map((glyph, i) => [glyph, i]));
const latinIndex = new Map(corpus.translit.map((symbol, i) => [symbol, i]));
const page = number => corpus.pages.find(p => p.page === number).indices;
const phrase = ['O', 'U', 'R', 'O', 'W', 'N'].map(g => latinIndex.get(g));
const primeParts = phrase.map(i => corpus.prime[i]);
assert.deepEqual(phrase, [3, 1, 4, 3, 7, 9]);
assert.deepEqual(primeParts, [7, 3, 11, 7, 19, 29]);
assert.equal(primeParts.reduce((a, b) => a + b, 0), 76);

function printedWords(section) {
  const out = [];
  let w = [];
  for (const char of section.replace(/[\/\s]/g, '')) {
    if (runeIndex.has(char)) w.push(runeIndex.get(char));
    else if (w.length) { out.push(w); w = []; }
  }
  if (w.length) out.push(w);
  return out;
}

const sections = transcription.split('%');
const finalWords = printedWords(sections.at(-1));
assert.equal(finalWords.length, 20);
assert.deepEqual(finalWords.flat(), page(57));
const targetPair = finalWords.findIndex((word, i) =>
  i + 1 < finalWords.length &&
  word.join(',') === phrase.slice(0, 3).join(',') &&
  finalWords[i + 1].join(',') === phrase.slice(3).join(','));
assert.equal(targetPair, 11);
const sixBySix = [];
const sum76 = [];
for (let i = 0; i + 1 < finalWords.length; i++) {
  const a = finalWords[i], b = finalWords[i + 1];
  if (a.length === 3 && b.length === 3) sixBySix.push(i);
  const primeSum = [...a, ...b].reduce((total, x) => total + corpus.prime[x], 0);
  if (primeSum === 76) sum76.push(i);
}
assert.deepEqual(sixBySix, [targetPair]);
assert.deepEqual(sum76, [targetPair]);

// Original table dimensions are 32x8. Ring = 2*(32+8)-4=76.
assert.equal(2 * (32 + 8) - 4, 76);
assert.equal(page(55).length, 76);
assert.equal(page(56).length, 85);
assert.equal(page(57).length, 95);

const p27 = page(27);
const p55 = page(55);
const tail55 = p55.slice(70, 76);
const echo27 = p27.slice(28, 34);
assert.deepEqual(tail55, [23, 11, 1, 17, 18, 10]);
assert.deepEqual(echo27, tail55);
assert.deepEqual(printedWords(sections.at(-3)).slice(-2).map(w => w.length), [3, 3]);

// Frozen and reproducible six-rune Vigenere key implied by the crib.
// No key fitting to p55 or p27 away from the six printed anchor runes.
const key = tail55.map((cipher, i) => mod(cipher - phrase[i]));
assert.deepEqual(key, [20, 10, 26, 14, 11, 1]);

// A distinct source-selected attempt to OBTAIN the same key, without using
// the unknown p55 plaintext: treat the six GP primes 7,3,11,7,19,29 as
// clockwise hop lengths on the genuine original 32x8 / 76-cell circumference.
// One byte per outgoing hop, or one summed residue per arc, yields six values.
const table = JSON.parse(fs.readFileSync(path.join(base, 'base60-grid.json'), 'utf8'));
assert.equal(table.rows.length, 32);
assert.ok(table.rows.every(row => row.length === 8));
const tableBytes = table.rows.flat().map(token =>
  60 * table.alphabet.indexOf(token[0]) + table.alphabet.indexOf(token[1]));
assert.equal(tableBytes.length, 256);
const ring = [];
for (let col = 0; col < 8; col++) ring.push(col);
for (let row = 1; row < 32; row++) ring.push(row * 8 + 7);
for (let col = 6; col >= 0; col--) ring.push(31 * 8 + col);
for (let row = 30; row >= 1; row--) ring.push(row * 8);
assert.equal(ring.length, 76);
assert.equal(new Set(ring).size, 76);
const rim = ring.map(i => tableBytes[i]);
const departure = [];
const arcChecks = [];
let at = 0;
for (const size of primeParts) {
  departure.push(at);
  arcChecks.push(mod(rim.slice(at, at + size).reduce((a, b) => a + b, 0)));
  at += size;
}
assert.equal(at, 76);
const departureKey = departure.map(i => rim[i] % 29);
assert.deepEqual(departure, [0, 7, 10, 21, 28, 47]);
assert.deepEqual(departureKey, [0, 9, 17, 10, 18, 19]);
assert.deepEqual(arcChecks, [0, 18, 28, 22, 15, 6]);
assert.equal(departureKey.filter((x, i) => x === key[i]).length, 0);
assert.equal(arcChecks.filter((x, i) => x === key[i]).length, 0);
// Source-length positive: a genuine six-byte key written at the original
// six prime-hop cells would be extracted exactly by the same source reader.
const plantedRim = rim.slice();
for (let i = 0; i < key.length; i++) plantedRim[departure[i]] = key[i];
assert.deepEqual(departure.map(i => plantedRim[i] % 29), key);

/**
 * Invert with the authentic solved-LP1 plaintext-F transparency semantics.
 * A ciphertext F may be literal unencrypted F (no key use), or encryption
 * of a non-F plaintext symbol (consume one key), so branch explicitly.
 *
 * @param {number[]} cipher
 * @param {number} anchor
 * @returns {{startPhase:number, phase:number, plain:number[], skips:number[]}[]}
 */
function candidates(cipher, anchor) {
  let states = Array.from({ length: 6 }, (_, startPhase) => ({
    startPhase, phase: startPhase, plain: [], skips: []
  }));
  for (let pos = 0; pos < cipher.length; pos++) {
    const next = [];
    for (const state of states) {
      const decoded = mod(cipher[pos] - key[state.phase]);
      if (decoded !== 0 &&
          (pos < anchor || pos >= anchor + 6 ||
           decoded === phrase[pos - anchor])) {
        next.push({
          startPhase: state.startPhase,
          phase: (state.phase + 1) % key.length,
          plain: state.plain.concat(decoded),
          skips: state.skips
        });
      }
      if (cipher[pos] === 0 &&
          (pos < anchor || pos >= anchor + 6 ||
           phrase[pos - anchor] === 0)) {
        next.push({
          startPhase: state.startPhase,
          phase: state.phase,
          plain: state.plain.concat(0),
          skips: state.skips.concat(pos)
        });
      }
    }
    states = next;
    assert.ok(states.length < 100000, 'Unexpectedly large honest F branch');
  }
  return states;
}

/**
 * Source-era non-consuming transparent-F additive GP29 encryption.
 * @param {number[]} plain
 * @param {number} startPhase
 * @returns {number[]}
 */
function encrypt(plain, startPhase) {
  let phase = startPhase;
  return plain.map(p => {
    if (p === 0) return 0;
    const c = mod(p + key[phase]);
    phase = (phase + 1) % key.length;
    return c;
  });
}

function ioc(values) {
  const counts = new Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((n, v) => n + v * (v - 1), 0) /
    (values.length * (values.length - 1));
}

/** Make real solved p57 native-GP text plant with fixed anchor and F bypass. */
function positive(len, anchor) {
  const original = page(57);
  const plain = Array.from({ length: len }, (_, i) => original[i % original.length]);
  plain.splice(anchor, phrase.length, ...phrase);
  const consumedBefore = plain.slice(0, anchor).filter(x => x !== 0).length;
  // Required adjustment is modulo six, not modulo29.
  const actualStartPhase = (6 - (consumedBefore % 6)) % 6;
  const cipher = encrypt(plain, actualStartPhase);
  assert.deepEqual(cipher.slice(anchor, anchor + 6), tail55);
  const possibilities = candidates(cipher, anchor);
  assert.ok(possibilities.some(state =>
    state.startPhase === actualStartPhase &&
    state.plain.every((symbol, i) => symbol === plain[i])));
  return possibilities.length;
}

const original = [];
for (const [number, start] of [[55, 70], [27, 28]]) {
  const ciphertext = page(number);
  const possible = candidates(ciphertext, start);
  assert.equal(possible.length, number === 55 ? 1 : 6);
  for (const s of possible) assert.deepEqual(
    encrypt(s.plain, s.startPhase), ciphertext);
  const holdout = s => s.plain.filter((_, i) =>
    i < start || i >= start + phrase.length);
  const top = possible.slice().sort((a, b) => ioc(holdout(b)) - ioc(holdout(a)))[0];
  original.push({
    page: number, originalCiphertextRunes: ciphertext.length,
    anchoredCribRunes: 6, permissibleInversions: possible.length,
    inputIoC: ioc(ciphertext),
    bestHoldoutIoC: ioc(holdout(top)),
    bestStartPhase: top.startPhase,
    bestBypassSites: top.skips,
    bestHoldoutFirst50: top.plain.slice(0, 50).map(i => corpus.translit[i]).join(' '),
    plantedNativePositiveBranches: positive(ciphertext.length, start)
  });
}
assert.ok(Math.abs(original[0].bestHoldoutIoC - 0.03643892339544513) < 1e-12);
assert.ok(Math.abs(original[1].bestHoldoutIoC - 0.03562871937553134) < 1e-12);
assert.equal(original[0].bestHoldoutIoC < 0.05, true);
assert.equal(original[1].bestHoldoutIoC < 0.05, true);
console.log(JSON.stringify({
  sourceClue: {
    primeParts, sum: 76,
    uniqueThreePlusThreePair: 'OUR OWN',
    printedP57Words: finalWords.length, recoveredP57Runes: page(57).length,
    p55Runes: p55.length, p50BorderCells: 76,
    sourceBookendP55Local70: tail55.map(i => corpus.translit[i]).join(' '),
    sourceBookendP27Local28: echo27.map(i => corpus.translit[i]).join(' '),
    hypothesizedSixKey: key,
    clockwisePrimeArcLengths: primeParts,
    tablePrimeHopPositions: departure,
    originalTableDepartureKey: departureKey,
    originalTableArcSums: arcChecks,
    plantedHopKeyRecovered: true
  },
  clearP57IoC: ioc(page(57)), original
}, null, 2));
console.log('PASS: sourced 76 geometry, anchored original Vigenere/skip inverse, native positives.');
