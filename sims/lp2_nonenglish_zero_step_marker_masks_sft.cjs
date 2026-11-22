'use strict';
/**
 * SFT: algebraically exact zero-difference plaintext marker under an
 * arbitrary independent nonzero GF29 multiplier at each original rune.
 * Test source-native complete-word mask support over all 29 GP anchors.
 *
 * Windows 11 / Node 22: node sims/lp2_nonenglish_zero_step_marker_masks_sft.cjs
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/lp2-transcription.txt');
const tokenMap = gp.translit.map((s, i) => ({s, i}))
  .sort((a, b) => b.s.length - a.s.length);
const runeMap = new Map(gp.runes.map((s, i) => [s, i]));
/** @param {string} s @returns {number[][]} */
function parseOriginal(s) {
  const words = [];
  let word = '';
  for (const c of s) {
    if (runeMap.has(c)) word += c;
    else if (c === '%' || c === '/' || /\s/u.test(c)) {
      // Unbroken word across a physical page or line.
    } else if (word) {
      words.push([...word].map(x => runeMap.get(x)));
      word = '';
    }
  }
  if (word) words.push([...word].map(x => runeMap.get(x)));
  return words;
}
const original = parseOriginal(transcript.split('%').slice(0, 55).join('%'));
assert.equal(original.length, 2896);
assert.equal(original.reduce((s, w) => s + w.length, 0), 12956);
/** @param {string} originalWord @returns {number[]} */
function encode(originalWord) {
  const s = originalWord.toUpperCase().replace(/Þ/g, 'TH')
    .replace(/Ð/g, 'TH').replace(/Æ/g, 'AE').replace(/Œ/g, 'OE')
    .replace(/[ØǪÖ]/g, 'O').replace(/ỽ/g, 'W')
    .normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  assert.match(s, /^[A-Z]+$/u);
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith('ING', i)) {
      out.push(21);
      i += 3;
    } else if (s.startsWith('IO', i)) {
      out.push(27);
      i += 2;
    } else {
      const token = tokenMap.find(x => s.startsWith(x.s, i));
      assert(token);
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}
const welsh = read('resources/control/pwyll_pendeuic_dyuet_welsh_source.txt')
  .split(/={20,}\r?\n\r?\n/u)[1];
assert(welsh && welsh.startsWith('Pwyll Pendeuic'));
const norse = read('resources/control/havamal_old_norse_source.txt')
  .replace(/^I\.\s*/u, '');
const sources = [
  ['Middle Welsh Pwyll', welsh],
  ['Old Norse Havamal', norse]
];
/** @param {number} x @returns {number} */
const mod29 = x => (x % 29 + 29) % 29;
/**
 * For each P_i=anchor, C_i=C_prev; any other value is a nonzero step.
 * Multipliers can vary independently and remain secret.
 * @param {number[]} plaintext @param {number} anchor
 * @returns {number[]}
 */
function encrypt(plaintext, anchor) {
  let previous = 5;
  return plaintext.map((p, i) => {
    previous = mod29(previous + (i % 28 + 1) * (p - anchor));
    return previous;
  });
}
const p57 = gp.pages[57].indices; // confirmed original unenciphered p57
assert.equal(p57.length, 95);
for (const anchor of [0, 21, 25, 28]) {
  const c = encrypt(p57, anchor);
  for (let i = 0; i < c.length; i++) {
    const preceding = i === 0 ? 5 : c[i - 1];
    const multiplier = i % 28 + 1;
    const inv = Array.from({length: 29}, (_, x) => x)
      .find(x => (x * multiplier) % 29 === 1);
    assert(Number.isInteger(inv));
    assert.equal(mod29(anchor + inv * (c[i] - preceding)), p57[i]);
    assert.equal(c[i] === preceding, p57[i] === anchor);
  }
}
/** @param {number[]} word @returns {number} */
function observedInteriorMask(word) {
  let mask = 0;
  for (let j = 1; j < word.length; j++) {
    if (word[j] === word[j - 1]) mask |= 1 << j;
  }
  return mask;
}
/** @param {number[]} word @param {number} anchor @returns {number} */
function plainInteriorMask(word, anchor) {
  let mask = 0;
  for (let j = 1; j < word.length; j++) {
    if (word[j] === anchor) mask |= 1 << j;
  }
  return mask;
}
const target = original.map(w => ({len:w.length, mask:observedInteriorMask(w)}));
assert.equal(target.reduce((s, x) => s + x.mask.toString(2)
  .replace(/0/g, '').length, 0), 63);

/** @param {string} name @param {string} text */
function evaluate(name, text) {
  const words = (text.match(/\p{L}+/gu) || []).map(encode);
  const all = [];
  for (let x = 0; x < 29; x++) {
    const lookup = Array.from({length: 15}, () => new Set());
    for (const word of words) {
      if (word.length <= 14) {
        lookup[word.length].add(plainInteriorMask(word, x));
      }
    }
    const missing = [];
    let unsupportedLengths = 0;
    for (let i = 0; i < target.length; i++) {
      const t = target[i];
      if (!lookup[t.len].size) unsupportedLengths++;
      else if (!lookup[t.len].has(t.mask)) missing.push(i);
    }
    assert.equal(unsupportedLengths, 3);
    all.push({
      anchor: gp.translit[x], index: x,
      missingMatchedWordMasks: missing.length,
      firstThreeMissingWordIndices: missing.slice(0, 3),
      unsupportedLength14Words: unsupportedLengths
    });
  }
  assert(all.every(x => x.missingMatchedWordMasks > 0));
  return {source: name, sourceWords: words.length,
    anchorCases: all, bestAnchors: all.slice().sort(
      (a, b) => a.missingMatchedWordMasks - b.missingMatchedWordMasks).slice(0, 5)};
}
const results = sources.map(([name, text]) => evaluate(name, text));
console.log(JSON.stringify({model:'C_i=C_(i-1)+k_i*(P_i-anchor) (mod29), k_i=1..28 arbitrary',
  sourceOriginal:{words: 2896, runes:12956, withinWordDoubles:63},
  controls:'95/95 p57 positive inverse and zero-marker checks pass',
  results}, null, 2));
console.log('PASS: 29 anchors x two pinned source registers, all original ciphertext word masks');
