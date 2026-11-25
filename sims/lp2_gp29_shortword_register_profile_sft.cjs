'use strict';

/**
 * Descriptive GP29 two-rune word-frequency comparison.
 * Reproduction: node sims/lp2_gp29_shortword_register_profile_sft.cjs
 *
 * This is not a cipher attack and does not identify a plaintext language.
 * Inputs and interpretation were frozen in workplace/agent44-20261125-shortword-register-prereg.md.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const tokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

function printedWords(s) {
  const out = [];
  let word = '';
  for (const ch of s) {
    if (/[\u16A0-\u16FF]/u.test(ch)) word += ch;
    else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
      // Physical page and line boundaries can continue a printed rune group.
    } else if (word) {
      out.push(word);
      word = '';
    }
  }
  if (word) out.push(word);
  return out;
}

function tokenizeSource(s) {
  return s.match(/\p{L}+/gu) || [];
}

function normalizeSpelling(original) {
  return original.toUpperCase().replace(/Þ/g, 'TH').replace(/Ð/g, 'TH')
    .replace(/Æ/g, 'AE').replace(/Œ/g, 'OE')
    .replace(/[ØǪÖ]/g, 'O').replace(/ỽ/g, 'W').replace(/Ẏ/g, 'Y')
    .normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
}

function encode(word) {
  const s = normalizeSpelling(word);
  assert.match(s, /^[A-Z]+$/u, 'non-GP glyph in source word: ' + word);
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) {
      out.push(21);
      i += 3;
    } else if (s.startsWith('IO', i)) {
      out.push(27);
      i += 2;
    } else {
      const token = tokens.find(value => s.startsWith(value.s, i));
      assert(token, 'unknown GP29 transliteration in ' + word + ': ' + s.slice(i));
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}

function percentile(sorted, p) {
  return sorted[Math.floor((sorted.length - 1) * p)];
}

function summarize(name, lengths) {
  assert(lengths.length > 0, name + ' has no source words');
  const twoRuneCount = lengths.filter(n => n === 2).length;
  const result = {
    name,
    words: lengths.length,
    twoRuneCount,
    f2: twoRuneCount / lengths.length
  };
  const width = 2896;
  if (lengths.length >= width) {
    const windows = [];
    let count = 0;
    for (let i = 0; i < width; i++) if (lengths[i] === 2) count++;
    for (let start = 0; start + width <= lengths.length; start++) {
      if (start > 0) {
        if (lengths[start - 1] === 2) count--;
        if (lengths[start + width - 1] === 2) count++;
      }
      windows.push(count / width);
    }
    windows.sort((a, b) => a - b);
    Object.assign(result, {
      windows: windows.length,
      min: windows[0],
      p05: percentile(windows, 0.05),
      median: percentile(windows, 0.50),
      p95: percentile(windows, 0.95),
      max: windows[windows.length - 1]
    });
  }
  return result;
}

const transcript = read('resources/lp2-transcription.txt');
const lp2Text = transcript.split('%').slice(0, 55).join('%');
const lp2Words = printedWords(lp2Text);
const lp2Lengths = lp2Words.map(w => Array.from(w).length);
assert.equal(lp2Words.length, 2896);
assert.equal(lp2Lengths.reduce((a, b) => a + b, 0), 12956);

const beowulf = JSON.parse(read('resources/control/beowulf_oe_gp_profile_corrected.json'))
  .allSourceGpWordLengths;
assert.equal(beowulf.length, 10885);

const norseText = read('resources/control/havamal_old_norse_source.txt')
  .replace(/^I\.\s*/u, '');
const norse = tokenizeSource(norseText).map(w => encode(w).length);
assert.equal(norse.length, 3588);

const welshParts = read('resources/control/pwyll_pendeuic_dyuet_welsh_source.txt')
  .split(/={20,}\r?\n\r?\n/u);
assert.equal(welshParts.length, 2);
const welsh = tokenizeSource(welshParts[1]).map(w => encode(w).length);
assert.equal(welsh.length, 7847);

const latin = read('resources/control/latin-vulgate-gp-wholewords.txt')
  .split(/\r?\n/u)
  .filter(line => /^[0-9A-S]+$/u.test(line))
  .map(line => line.length);
assert.equal(latin.length, 39835);

const results = [
  summarize('LP2 first55', lp2Lengths),
  summarize('Old English Beowulf', beowulf),
  summarize('Old Norse Havamal', norse),
  summarize('Middle Welsh Pwyll', welsh),
  summarize('Latin Vulgate excerpts', latin)
];
assert.deepEqual(results.map(r => [r.words, r.twoRuneCount]), [
  [2896, 448],
  [10885, 1453],
  [3588, 846],
  [7847, 1529],
  [39835, 6869]
]);

console.log(JSON.stringify({
  metric: 'fraction of source-native GP29 word units with exactly two runes',
  windowWords: 2896,
  results,
  interpretation: 'descriptive only; LP2 group status unresolved; no language or plaintext identified'
}, null, 2));
console.log('PASS: source counts, GP29 normalization and frozen comparison');
