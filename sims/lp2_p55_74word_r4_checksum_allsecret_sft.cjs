'use strict';

/**
 * p55 terminal checksum-tape test for the hypothetical Phase57 six-back R4
 * repair channel. Tests every stationary secret GP29 substitution, rather
 * than fitting a lookup to the original text. Original file inputs untouched.
 *
 * Windows 11, Node.js 22: node sims/lp2_p55_74word_r4_checksum_allsecret_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'resources',
  'liber-primus', 'lp2-corpus.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'resources',
  'liber-primus', 'lp2-transcription.txt'), 'utf8');
const alphabet = new Map(corpus.runes.map((rune, index) => [rune, index]));
const mod = value => ((value % 29) + 29) % 29;

/** @returns {number[][]} Words joined across original line and page carries. */
function readWords() {
  const words = [];
  let word = [];
  for (const page of source.split('%').slice(0, 55)) {
    for (const rune of page.replace(/[\/\s]/g, '')) {
      if (alphabet.has(rune)) word.push(alphabet.get(rune));
      else if (word.length) {
        words.push(word);
        word = [];
      }
    }
  }
  if (word.length) words.push(word);
  return words;
}

/** @param {number[]} word @returns {number[]} */
function possibleChecks(word) {
  const hits = [];
  for (let j = 6; j < word.length; j++) {
    const overwritten = mod(24 - 2 * word[j - 6]);
    if (word[j] === overwritten && word[j - 1] !== overwritten) hits.push(j);
  }
  if (!hits.length) return [];
  const checks = new Set();
  for (let mask = 0; mask < (1 << hits.length); mask++) {
    let sum = word.reduce((a, b) => a + b, 0);
    for (let bit = 0; bit < hits.length; bit++) {
      if (mask & (1 << bit)) {
        const j = hits[bit];
        sum += word[j - 1] - word[j];
      }
    }
    checks.add(mod(sum));
  }
  assert.equal(checks.size, 1 << hits.length,
    'Checksum must distinguish every original repair-mask branch');
  return [...checks];
}

/**
 * For each terminal rune, a single stationary (even secret) substitution must
 * select one same checksum value at ALL associated words. Empty intersection
 * for any repeated rune proves that no such global 29-symbol substitution
 * exists, regardless of lookup orientation or dictionary/language choice.
 *
 * @param {number[]} tape
 * @param {number[][]} checks
 * @param {number} offset
 */
function assess(tape, checks, offset) {
  const allowed = new Map();
  const appearances = new Map();
  const firstConflict = new Map();
  for (let i = 0; i < checks.length; i++) {
    const rune = tape[i + offset];
    const vals = new Set(checks[i]);
    appearances.set(rune, (appearances.get(rune) || 0) + 1);
    if (!allowed.has(rune)) {
      allowed.set(rune, vals);
      continue;
    }
    const intersection = new Set([...allowed.get(rune)].filter(value =>
      vals.has(value)));
    if (!intersection.size && allowed.get(rune).size &&
        !firstConflict.has(rune)) firstConflict.set(rune, i);
    allowed.set(rune, intersection);
  }
  return {
    distinctGroups: allowed.size,
    repeatedGroups: [...appearances.values()].filter(n => n > 1).length,
    contradictoryGroups: [...allowed.values()].filter(s => s.size === 0).length,
    firstContradictions: [...firstConflict.entries()].slice(0, 5)
      .map(([symbol, checkIndex]) => ({symbol, checkIndex}))
  };
}

const words = readWords();
const flat = words.flat();
const canonical = corpus.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices);
assert.equal(words.length, 2896);
assert.equal(flat.length, 12956);
assert.deepEqual(flat, canonical);
const affected = words.map(possibleChecks).filter(c => c.length);
assert.equal(affected.length, 74);
assert.deepEqual(affected.reduce((o, c) => {
  o[c.length] = (o[c.length] || 0) + 1;
  return o;
}, {}), {'2': 69, '4': 5});
const terminal = corpus.pages.find(p => p.page === 55).indices;
assert.equal(terminal.length, 76);

const original = [];
for (const reversed of [false, true]) {
  const tape = reversed ? terminal.slice().reverse() : terminal;
  for (let offset = 0; offset <= 2; offset++) {
    const result = assess(tape, affected, offset);
    original.push({reversed, offset, ...result});
    assert.ok(result.contradictoryGroups > 0);
  }
}
assert.deepEqual(original.map(x => x.contradictoryGroups),
  [18, 17, 17, 18, 16, 19]);

// Same original words, but a synthetic authenticated checksum sequence.
// Encoder: check -> (13*check + 7) mod29 is a true permutation.
// Source-selected lookup is deliberately supplied in this positive control.
const synthetic = [5, ...affected.map(c => mod(13 * c[0] + 7)), 23];
const positive = assess(synthetic, affected, 1);
assert.equal(positive.contradictoryGroups, 0);
assert.equal(positive.distinctGroups, new Set(synthetic.slice(1, -1)).size);

console.log(JSON.stringify({
  scope: 'original p0-p55 12,956 GP29 runes, 2,896 joined printed words',
  model: 'R4 T6 ambiguity, GP-index nominal word checksum, 76 terminal runes',
  affectedWords: affected.length,
  terminalRunes: terminal.length,
  alignments: original,
  syntheticSourceSelectedLookupPositive: positive,
  verdict: 'all six original terminal-packet stationary-S-box alignments excluded'
}, null, 2));
console.log('PASS: exact source-conditional impossibility with a planted positive.');
