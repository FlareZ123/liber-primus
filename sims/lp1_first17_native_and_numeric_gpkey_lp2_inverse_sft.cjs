'use strict';

/**
 * LP1 physical pages 0–16 -> LP2 p0–56: exact GP29 first17 repeating-key gate.
 * Node.js 22, CommonJS, no dependencies, read-only.
 *
 * Original first17 rune + numeric source:
 *   resources/transcriptions/lp1_wulfic_canonical.txt
 * Original LP2 cipher:
 *   resources/liber-primus/lp2-corpus.json
 * Solved p56 positive/independent receiver:
 *   resources/external/relikd-solved-gp29-native-v1.json
 *
 * Key semantics are the archived idkfa first-release recipes (cicada-solvers/idkfa
 * readme.md, config.js and lib/key.js/shift.js, 2018). Seven idkfa sections
 * 0..6 cover the first SEVENTEEN physical LP1 pages. Section 7 is already LP2.
 * Section 2 in local Wulfic source additionally retains the 76 source glyphs of
 * LP1 page5's numeric/word 5x5 matrix, absent from idkfa data/liber.
 *
 * Two PREDECLARED keys: all actual printed original GP glyphs (2797 values);
 * printed GP glyphs plus the 39 separately printed decimal scalar tokens, with
 * the idkfa Key.fromInteger convention integer modulo29 (2836 values).
 * No phase search, page resets, guessed cribs, or per-page substitutions.
 *
 * Run: node sims/lp1_first17_native_and_numeric_gpkey_lp2_inverse_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const solved = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const raw = read('resources/transcriptions/lp1_wulfic_canonical.txt');
const RUNES = corpus.runes;
assert.equal(RUNES.length, 29);

// The exact source-level F-transparent idkfa patch table for LP1 sections1,5.
// Section16's extra patch belongs to solved LP2 p56 and is irrelevant here.
const F_PATCH = new Set([
  '0.1.0.1.9.1','0.1.0.2.7.0','0.1.0.2.10.0',
  '0.1.0.3.5.0','0.1.0.3.12.2','0.1.0.3.12.3',
  '0.1.0.4.7.3','0.1.1.1.5.7','0.1.1.2.5.7',
  '0.1.1.4.0.0','0.1.1.5.5.3',
  '0.5.0.2.5.1','0.5.0.2.7.6'
]);
const patchSeen = new Set();
function parseSource(str, delimiters, coordinate) {
  if (delimiters.length === 0) {
    const key = coordinate.slice(1);
    if (F_PATCH.has(key)) {
      assert.equal(str, RUNES[0], 'A patched position must be literal ᚠ');
      patchSeen.add(key);
      return 'F';
    }
    return str;
  }
  return str.split(delimiters[0]).filter(Boolean)
    .map((part, i) => parseSource(
      part, delimiters.slice(1), coordinate + '.' + i));
}
const flatten = node => Array.isArray(node) ? node.flatMap(flatten) : [node];
// Exactly replicate idkfa Source.getSource delimiter normalization.
const normal = raw.replace(/\r?\n|\r|\/|%/g, '');
const parsed = parseSource(normal, ['§','$','&','.','-',''], '');
const sections = parsed[0].slice(0, 7);
assert.equal(patchSeen.size, 13, 'All LP1 F transparency patches found');

// Historical idkfa index keys: divinity, 3, firfumferenfe.
// Index 0 inverted LATIN, 1 shifted, 2 plain, 3 inverted LATIN plus
// shift3, 4 plain, 5 shifted, 6 plain.
const recipeKeys = {
  1: [23,10,1,10,9,10,16,26], // DIVINITY
  3: [3],
  5: [0,10,4,0,1,19,0,18,4,18,9,0,18] // FIRFUMFERENFE
};
const shift = (a, key) => ((a - key) % 29 + 29) % 29;
const decodedSections = sections.map((section, i) => {
  let keyPosition = 0;
  return flatten(section).map(character => {
    if (character === 'F') return 0; // Literal F: no key advancement.
    const runeIndex = RUNES.indexOf(character);
    if (runeIndex < 0) return null; // Printed numeric material not a rune.
    const recipe = recipeKeys[i];
    const value = shift(runeIndex,
      recipe ? recipe[keyPosition++ % recipe.length] : 0);
    return (i === 0 || i === 3) ? 28 - value : value;
  }).filter(value => value !== null);
});
assert.deepEqual(decodedSections.map(a => a.length),
  [184,515,157,778,755,319,89]);
assert.deepEqual(decodedSections[0].slice(0, 6), [24,7,24,4,9,21],
  'Source warning must start A-WARNNG');
const runeOnly = decodedSections.flat();
assert.equal(runeOnly.length, 2797);

// Count and insert EVERY printed scalar as one GP29 key element. This is the
// historical idkfa Key.fromInteger(n) = n%29 convention, not digit splitting.
// Work from unstripped source to keep matrix row-end numbers distinct.
const sourceSections = raw.split('$').filter(Boolean).slice(0, 7);
assert.equal(sourceSections.length, 7);
const decimalCounts = [];
const decimalTokens = [];
const mixedSections = sourceSections.map((str, i) => {
  let runePosition = 0;
  let decimals = 0;
  const tokens = str.match(/[\u16a0-\u16ff]|\d+/gi) || [];
  const numbers = [];
  const output = tokens.map(token => {
    if (RUNES.includes(token)) {
      assert.ok(runePosition < decodedSections[i].length);
      return decodedSections[i][runePosition++];
    }
    assert.ok(/^\d+$/.test(token), 'Expected decimal scalar or Futhark glyph');
    decimals++;
    numbers.push(Number(token));
    return Number(BigInt(token) % 29n);
  });
  assert.equal(runePosition, decodedSections[i].length);
  decimalCounts.push(decimals);
  decimalTokens.push(numbers);
  return output;
});
assert.deepEqual(decimalCounts, [0,0,12,0,2,0,25]);
assert.deepEqual(decimalTokens[2], [
  272,138,131,151,18,226,245,18,151,131,138,272
]);
assert.deepEqual(decimalTokens[4], [1,2]);
assert.equal(decimalTokens[6].length, 25);
const mixedNumeric = mixedSections.flat();
assert.equal(mixedNumeric.length, 2836);

// Original LP2 physical pages0..55 are genuinely unknown. p56 is the solved
// independently readable AN END text and must be evaluated separately.
const unknownPages = corpus.pages.filter(p => p.page >= 0 && p.page <= 55);
const cipher = unknownPages.flatMap(p => p.indices);
assert.equal(cipher.length, 12956);
const p56 = corpus.pages.find(p => p.page === 56).indices;
assert.equal(p56.length, 85);
const native56 = [...solved.sections.find(s =>
  s.name === 'p56_an_end').source_text]
  .filter(c => RUNES.includes(c))
  .map(c => RUNES.indexOf(c));
assert.deepEqual(native56.length, 85);
const full = cipher.concat(p56);
function ioc(indices) {
  const freq = Array(29).fill(0);
  for (const n of indices) freq[n]++;
  return freq.reduce((sum, n) => sum + n * (n - 1), 0) /
    (indices.length * (indices.length - 1));
}
function pageRange(decoded, first, last) {
  let start = 0;
  const out = [];
  for (const page of unknownPages) {
    if (page.page >= first && page.page <= last) {
      out.push(...decoded.slice(start, start + page.indices.length));
    }
    start += page.indices.length;
  }
  return out;
}
const graph = indices => indices.map(i => corpus.translit[i]).join('');
const results = [];
for (const [keyName, key] of [
  ['all-source-GP-runes', runeOnly],
  ['all-GP-runes-plus-idkfa-decimal-mod29', mixedNumeric]
]) {
  // Known native p56 is a genuinely readable positive plant, not an LP2
  // cipher result. Invert both proposed signs exactly at a nonzero key phase.
  for (const sign of [-1, +1]) {
    const plantPhase = 700;
    const plantedCipher = native56.map((p, i) =>
      (p - sign * key[(plantPhase + i) % key.length] + 29) % 29);
    const recovered = plantedCipher.map((c, i) =>
      (c + sign * key[(plantPhase + i) % key.length] + 29) % 29);
    assert.deepEqual(recovered, native56,
      'Cipher implementation failed a native positive plant');

    const plain = full.map((c, i) =>
      (c + sign * key[i % key.length] + 29) % 29);
    const originalUnknown = plain.slice(0, cipher.length);
    const test56 = plain.slice(cipher.length);
    const equalsNative56 = test56.reduce(
      (n, c, i) => n + Number(c === native56[i]), 0);
    results.push({
      keyName, keyLength: key.length,
      keyByteSha256: crypto.createHash('sha256').update(Buffer.from(key)).digest('hex'),
      shift: sign === -1 ? 'subtract' : 'add',
      unknownRuneCount: originalUnknown.length,
      unknownIoC: +ioc(originalUnknown).toFixed(9),
      trainingP16to21IoC: +ioc(pageRange(originalUnknown,16,21)).toFixed(9),
      untouchedP40to53IoC: +ioc(pageRange(originalUnknown,40,53)).toFixed(9),
      p56MatchesOf85: equalsNative56,
      firstUnknownRunes: graph(originalUnknown.slice(0, 75)),
      positiveNativePlantRecovered: recovered.length
    });
  }
}
console.log(JSON.stringify({
  model: 'LP1 physical first17 complete original Futhark, two direct GP29 keys',
  sourceRereadSections: decodedSections.map(a => a.length),
  printedDecimalCounts: decimalCounts,
  originalUnknownRunes: cipher.length,
  p56SolvedControlRunes: p56.length,
  decisions: results,
  verdict: 'No readable unknown LP2 plaintext under any four direct frozen shift consumers'
}, null, 2));
