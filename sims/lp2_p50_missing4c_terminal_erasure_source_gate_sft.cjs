'use strict';

/**
 * Original-input source gate for Director #2376.
 *
 * A missing 4C in the original 256-cell p50 panel has the conditional
 * dual-radix chain hex(4C)=76; base60(4C)=252; T[252]='30'=180.
 * The three terminal original pages contain 76 unknown + 85+95 known GP29
 * runes. Does the source also specify a full reversible [256,180] codec?
 *
 * This does NOT invent RS, a byte-to-rune coercion, or a private key.
 * It checks the strongest natural direct stationary alphabet bridge and
 * constructs two contradictory yet fully reversible [256,180] systematic
 * linear codes using the 180 genuine known runes. Neither is Cicada-sourced.
 *
 * Windows 11 / Node 22, from repo root:
 *   node sims/lp2_p50_missing4c_terminal_erasure_source_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const corpus = require('../resources/liber-primus/lp2-corpus.json');
const table = require('../resources/liber-primus/lp2-grid-256.json');
const solved = require('../resources/external/relikd-solved-gp29-native-v1.json');

const mod29 = n => (n % 29 + 29) % 29;
const runeToIndex = new Map(corpus.runes.map((ch, i) => [ch, i]));
/** @param {string} raw */
function onlyRunes(raw) {
  return [...raw].flatMap(ch =>
    runeToIndex.has(ch) ? [runeToIndex.get(ch)] : []);
}
const p55 = corpus.pages.find(page => page.page === 55).indices;
const originalP56 = corpus.pages.find(page => page.page === 56).indices;
const originalP57 = corpus.pages.find(page => page.page === 57).indices;
const p56 = onlyRunes(solved.sections.find(s =>
  s.name === 'p56_an_end').source_text);
const p57 = onlyRunes(solved.sections.find(s =>
  s.name === 'p57_parable').source_text);
const known = p56.concat(p57);
assert.deepEqual([p55.length, p56.length, p57.length, known.length],
  [76, 85, 95, 180]);
assert.deepEqual(p57, originalP57);
assert.equal(p55.length + known.length, 256);

// Recover the actual solved p56 via the original successive-prime totient
// mechanism, including the F/0 bypass at source position 56.
const primes = [];
for (let n = 2; primes.length < 85; n += 1) {
  if (primes.every(p => p * p > n || n % p !== 0)) primes.push(n);
}
let clock = 0;
const regen56 = p56.map(value =>
  value === 0 ? 0 : mod29(value + primes[clock++] - 1));
assert.deepEqual(regen56, originalP56);
assert.equal(clock, 84);
assert.deepEqual(p56.map((v, i) => v === 0 ? i : -1)
  .filter(i => i >= 0), [56]);

const tokens = table.pages.flatMap(page => page.tokens);
assert.equal(table.shape, '32 rows by 8 columns across LP2 pages 49, 50, 51');
assert.deepEqual(table.pages.map(page => page.tokens.length), [80, 104, 72]);
assert.equal(tokens.length, 256);
assert.equal(tokens.includes('4C'), false);
assert.equal(parseInt('4C', 16), 76);
assert.equal(4 * 60 + table.alphabet.indexOf('C'), 252);
assert.equal(tokens[252], '30');
assert.equal(3 * 60, 180);
assert.equal(parseInt('4C', 16) + 3 * 60, 256);

/**
 * Direct GP29 glyph/byte correspondence is possible only if every occurrence
 * of each GP29 glyph agrees on its printed byte, and every printed byte agrees
 * on the corresponding GP29 glyph. This gate grants an arbitrary secret
 * symbol mapping in EITHER direction; no specific key is fitted.
 *
 * @param {number[]} bytes - The natural last-180-cell numeric suffix.
 */
function stationaryBridge(bytes) {
  const byRune = new Map();
  const byByte = new Map();
  for (let i = 0; i < known.length; i += 1) {
    const rune = known[i], byte = bytes[76 + i];
    if (!byRune.has(rune)) byRune.set(rune, new Set());
    if (!byByte.has(byte)) byByte.set(byte, new Set());
    byRune.get(rune).add(byte);
    byByte.get(byte).add(rune);
  }
  const runeConflicts = [...byRune.values()]
    .filter(values => values.size > 1).length;
  const byteConflicts = [...byByte.values()]
    .filter(values => values.size > 1).length;
  return {
    knownRuneTypes: byRune.size,
    suffixByteTypes: byByte.size,
    runeToByteConflicts: runeConflicts,
    byteToRuneConflicts: byteConflicts,
  };
}
const bridges = {};
for (const radix of [59, 60]) {
  const alphabet = radix === 59 ?
    table.alphabet.replace('f', '') : table.alphabet;
  assert.equal(alphabet.length, radix);
  const bytes = tokens.map(token => {
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert(hi >= 0 && lo >= 0);
    const value = radix * hi + lo;
    assert(value >= 0 && value <= 255);
    return value;
  });
  if (radix === 60) assert.deepEqual(bytes, table.bytes);
  const result = stationaryBridge(bytes);
  assert.deepEqual(result, {
    knownRuneTypes: 23,
    suffixByteTypes: 129,
    runeToByteConflicts: 21,
    byteToRuneConflicts: 42,
  });
  bridges[radix] = result;
}
const plantMap = Array.from({length: 29}, (_, rune) => 7 * rune + 13);
assert.equal(new Set(plantMap).size, 29);
assert.deepEqual(stationaryBridge(
  Array(76).fill(0).concat(known.map(v => plantMap[v]))),
  {knownRuneTypes:23,suffixByteTypes:23,
    runeToByteConflicts:0,byteToRuneConflicts:0});

/**
 * A fixed systematic [256,180] LINEAR code over GF29, recovering exactly
 * the first 76 erased symbols from the last 180 known symbols. These two
 * different fully specified encoders are purely mathematical counterexamples:
 * the source never selects either one.
 *
 * @param {number[]} values - The 180 known GF29 symbols.
 * @param {'A'|'B'} model
 */
function encode(values, model) {
  assert.equal(values.length, 180);
  assert(values.every(value => Number.isInteger(value) && value >= 0 && value < 29));
  const parity = Array.from({length:76}, (_, i) =>
    model === 'A' ? values[i] : values[(i + 85) % 180]);
  return parity.concat(values);
}
/** @param {number[]} codeword @param {'A'|'B'} model */
function restore(codeword, model) {
  assert.equal(codeword.length, 256);
  const knownPart = codeword.slice(76);
  const reconstructed = encode(knownPart, model);
  assert.deepEqual(reconstructed, codeword);
  return reconstructed.slice(0, 76);
}
const A = encode(known, 'A'), B = encode(known, 'B');
assert.notDeepEqual(A.slice(0,76), B.slice(0,76));
assert.deepEqual(A.slice(76), B.slice(76));
assert.deepEqual(restore(A, 'A'), A.slice(0, 76));
assert.deepEqual(restore(B, 'B'), B.slice(0, 76));
assert.notDeepEqual(A.slice(0,76), p55);
assert.notDeepEqual(B.slice(0,76), p55);
assert(A.every(v => Number.isInteger(v) && v >= 0 && v < 29));
assert(B.every(v => Number.isInteger(v) && v >= 0 && v < 29));

console.log(JSON.stringify({
  source: 'Original p49-51 32x8 panel, untouched p55, authenticated p56/p57 GP29',
  observed: {missingToken:'4C',hex:76,base60Index:252,
    printedT252:tokens[252],base60Value:180,
    originalUnknown:76,originalKnown:180,totalCells:256},
  p56ExactTotientForwardPositive: true,
  stationaryDirectBridge: bridges,
  unspecifiedCodeExhibit:{
    family:'two distinct fixed linear systematic [256,180] GF29 encoders',
    bothRecoverFirst76FromLast180:true,
    first12A:A.slice(0,12),first12B:B.slice(0,12),
    sourceSelectsNeither:true,
  },
  decision:'No authored field, byte/rune serialization, parity-check matrix, ' +
    'erasure opcode or terminal receiver selection: 76+180 alone has no ' +
    'unique p55 inverse; no authentic plaintext.',
},null,2));
console.log('PASS');
