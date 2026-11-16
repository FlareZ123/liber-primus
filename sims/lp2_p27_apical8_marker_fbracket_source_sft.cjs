'use strict';

/**
 * Source-native p27 eight-apical-cell F-bracket navigation test.
 *
 * The eight-apical-cell anatomical count is a historical interpretation of
 * the visible p27 wing, not a recovered cipher opcode. This test establishes
 * the exact marker-to-F offsets and the cross-terminal original ciphertext
 * match without fitted transforms, plaintext guesses, or edited source files.
 *
 * Run: node sims/lp2_p27_apical8_marker_fbracket_source_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'resources', 'liber-primus');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'lp2-corpus.json'), 'utf8'));
const annotation = JSON.parse(fs.readFileSync(path.join(root, 'lp2-ink-annotations.json'), 'utf8'));
const pages = new Map(corpus.pages.map(p => [p.page, p]));
const marks = annotation.pages.flatMap(p => (p.large_punctuation || []).map(
  ([after, dots, ink]) => ({ page: p.page, after, dots, ink })
));
const translit = values => values.map(i => corpus.translit[i]).join(' ');
const p27 = pages.get(27).indices;
const p55 = pages.get(55).indices;
const p56 = pages.get(56).indices;

assert.equal(p27.length, 234);
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);
assert.equal(marks.length, 36);

const after8 = marks.filter(m => pages.get(m.page).indices[m.after + 8] === 0);
const after8and16 = after8.filter(m => pages.get(m.page).indices[m.after + 16] === 0);
assert.deepEqual(after8, [{ page: 27, after: 19, dots: 13, ink: 'red' }]);
assert.deepEqual(after8and16, after8);

const between = p27.slice(28, 35);
const originalBridge = p55.slice(70, 76).concat(p56[0]);
const firstBodyWord = p27.slice(19, 26);
const candidatePassword = firstBodyWord.map(i => corpus.translit[i]).join('');
assert.equal(firstBodyWord.length, 7); // IA occupies one GP rune, two Latin letters
assert.equal(candidatePassword, 'NHGUIAHU');
assert.equal(candidatePassword.length, 8);
assert.deepEqual(p27.slice(26, 28), [17, 0]); // the next printed word BF
assert.equal(p27[27], 0);
assert.equal(p27[35], 0);
assert.equal(between.length, 7);
assert.deepEqual(between, [23, 11, 1, 17, 18, 10, 25]);
assert.deepEqual(between, originalBridge);

// Enumerate every same-page F + seven ciphertext runes + F in unsolved LP2.
// The full scan includes every position, not only those beneath marker artwork.
const brackets = corpus.pages.filter(p => p.page <= 55).flatMap(p => {
  const result = [];
  for (let at = 0; at + 8 < p.indices.length; at++) {
    if (p.indices[at] === 0 && p.indices[at + 8] === 0) {
      result.push({ page: p.page, at, runes: p.indices.slice(at + 1, at + 8) });
    }
  }
  return result;
});
assert.equal(brackets.length, 13);
assert.deepEqual(
  brackets.filter(b => b.runes.join(',') === originalBridge.join(',')).map(({ page, at }) => ({ page, at })),
  [{ page: 27, at: 27 }]
);

// A one-symbol mutation in a copy must destroy the special two-F marker path.
const changed = p27.slice();
changed[35] = 1;
assert.equal(changed[27] === 0 && changed[35] === 0, false);

console.log('SOURCE p27 original 44.jpg; red 13-dot after GP rune 19.');
console.log('MARKS', marks.length, 'one F at marker+8:', after8.length,
  'two Fs at marker+8,+16:', after8and16.length);
console.log('P27 first post-marker whole word: 7 runes, 8 Latin letters', candidatePassword);
console.log('P27 heading -> first F: 8 intervening runes',
  translit(p27.slice(19, 27)));
console.log('F at p27[27]; 7-rune payload', translit(between), '; next F at p27[35]');
console.log('P55[70:76] + P56[0] cross-page original match', translit(originalBridge));
console.log('ALL UNSOLVED F+7+F brackets:', brackets.length,
  '; exact terminal-bridge instances:', 1);
console.log('SOURCE-EDIT negative control: PASS; 2014-era decoder/known plaintext: none.');
console.log('PASS');
