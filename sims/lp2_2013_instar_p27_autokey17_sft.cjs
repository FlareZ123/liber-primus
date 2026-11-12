'use strict';
/**
 * Source-frozen 2013 THE INSTAR EMERGENCE p27–32 17-rune Vigenere extension.
 *
 * Director Issue #671; extends #664 only into period-17, plaintext-autokey-17,
 * and ciphertext-autokey-17. The original red p27 offsets 0–16 fix the seed.
 * No search, phase adjustment, special F treatment or boundary reset.
 *
 * Run: node sims/lp2_2013_instar_p27_autokey17_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
function read(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}
const db = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const ink = JSON.parse(read('resources/liber-primus/lp2-ink-annotations.json'));
const transcriptions = read('resources/lp2-transcription.txt').split('%');
const runeToIndex = new Map(db.runes.map((rune, i) => [rune, i]));
const tokens = db.translit.map((token, index) => ({token, index}))
  .sort((a, b) => b.token.length - a.token.length);
/** @param {string} src @returns {number[]} */
function gp(src) {
  const normalized = src.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const all = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const found = tokens.find((x) => word.startsWith(x.token, i));
      assert(found, 'Unmapped GP text: ' + word.slice(i));
      all.push(found.index);
      i += found.token.length;
    }
  }
  return all;
}
/** @param {number} page @returns {number[]} */
function page(page) {
  return db.pages.find((p) => p.page === page).indices;
}
/** @param {number} pageNumber @returns {number[]} */
function redFromStart(pageNumber) {
  const red = ink.pages.find((p) => p.page === pageNumber)
    .red_spans.find((s) => s.length >= 17);
  assert(red);
  const source = page(pageNumber);
  assert.equal(source.slice(red.start, red.start + red.length)
    .map((i) => db.runes[i]).join(''), red.runes);
  return source.slice(red.start);
}
const modeNames = ['repeat17', 'plainAuto17', 'cipherAuto17'];
const original = [27, 28, 29, 30, 31, 32].flatMap(page);
const seed = gp('THE INSTAR EMERGENCE');
const key = original.slice(0, 17).map((c, i) => (c - seed[i] + 29) % 29);
const wrongSource = redFromStart(53);
const wrongKey = wrongSource.slice(0, 17)
  .map((c, i) => (c - seed[i] + 29) % 29);
assert.equal(original.length, 1433);
assert.equal(seed.length, 17);
assert.deepEqual([27, 28, 29, 30, 31, 32].map((n) => page(n).length),
  [234, 269, 277, 263, 269, 121]); // Original physical page lengths.
assert.deepEqual(key, [17, 24, 16, 11, 0, 16, 0, 21, 19, 1, 0, 8, 4, 1, 11, 15, 26]);
assert.deepEqual(original.slice(0, 19), redFromStart(27).slice(0, 19));
assert.equal(wrongSource.length, 51);
/** @param {number[]} C @param {string} mode @param {number[]} K @returns {number[]} */
function decode(C, mode, K) {
  const P = seed.slice();
  for (let i = 17; i < C.length; i++) {
    const k = mode === 'repeat17' ? K[i % 17] :
      mode === 'plainAuto17' ? P[i - 17] : C[i - 17];
    P.push((C[i] - k + 29) % 29);
  }
  return P;
}
/** @param {number[]} P @param {string} mode @param {number[]} K @returns {number[]} */
function encode(P, mode, K) {
  const C = [];
  for (let i = 0; i < P.length; i++) {
    const k = i < 17 ? K[i] : mode === 'repeat17' ? K[i % 17] :
      mode === 'plainAuto17' ? P[i - 17] : C[i - 17];
    C.push((P[i] + k) % 29);
  }
  return C;
}
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const h = Array(29).fill(0);
  for (const n of a) h[n]++;
  return h.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}
const training = gp(read('resources/control/gibran_prophet_58585.txt'));
const shakespeare = gp(read('resources/control/shakespeare_first300k.txt'));
const emerson = gp(read('resources/control/emerson_essays_2944.txt'));
assert.deepEqual([training.length, shakespeare.length, emerson.length],
  [63114, 218800, 324630]);
const tris = new Map(), bis = new Map();
for (let i = 2; i < training.length; i++) {
  const t = training.slice(i - 2, i + 1).join(',');
  const b = training.slice(i - 2, i).join(',');
  tris.set(t, (tris.get(t) || 0) + 1);
  bis.set(b, (bis.get(b) || 0) + 1);
}
/** @param {number[]} a @returns {number} */
function score(a) {
  let sum = 0;
  for (let i = 2; i < a.length; i++) {
    const t = a.slice(i - 2, i + 1).join(',');
    const b = a.slice(i - 2, i).join(',');
    sum += Math.log(((tris.get(t) || 0) + 0.05) /
      ((bis.get(b) || 0) + 29 * 0.05));
  }
  return sum / (a.length - 2);
}
/** @param {number[]} source @returns {number[]} */
function scoresOf150Windows(source) {
  const out = [];
  const width = original.length - 17;
  for (let j = 0; j < 150; j++) {
    const i = Math.floor(j * (source.length - width) / 149);
    out.push(score(source.slice(i, i + width)));
  }
  return out;
}
const controls = scoresOf150Windows(shakespeare)
  .concat(scoresOf150Windows(emerson)).sort((a, b) => a - b);
const nativePlant = seed.concat(shakespeare.slice(1500, 1500 + 1416));
assert.equal(nativePlant.length, 1433);
/**
 * Show authentic page boundaries and word/line breaks (|, /); show GP tokens,
 * so a single NG/TH/EA symbol cannot look like multiple distinct letters.
 * @param {number[]} P
 * @param {number} max
 * @returns {string}
 */
function printed(P, max) {
  let i = 0, result = '';
  for (let n = 27; n <= 32 && i < max; n++) {
    result += '[p' + n + '] ';
    for (const ch of transcriptions[n]) {
      if (runeToIndex.has(ch)) {
        if (i === max) break;
        result += db.translit[P[i++]] + ' ';
      } else if (ch === '-') result += '| ';
      else if (ch === '/') result += '/ ';
      else if (ch === '.') result += '. ';
    }
  }
  return result.trim();
}
let pageStart = 0;
const pageOffsets = [27, 28, 29, 30, 31, 32].map((n) => {
  const out = {page: n, start: pageStart, length: page(n).length};
  pageStart += out.length;
  return out;
});
const results = {};
for (const mode of modeNames) {
  const P = decode(original, mode, key);
  const W = decode(wrongSource, mode, wrongKey);
  const wrongOnOriginal = decode(original, mode, wrongKey);
  const cipherPlant = encode(nativePlant, mode, key);
  assert.deepEqual(decode(cipherPlant, mode, key), nativePlant);
  assert.deepEqual(encode(P, mode, key), original);
  assert.deepEqual(P.slice(0, 17), seed);
  assert.deepEqual(cipherPlant.slice(0, 17), original.slice(0, 17));
  const held = P.slice(17), heldScore = score(held);
  assert(heldScore < controls[0], mode + ' unexpectedly scores as native GP');
  results[mode] = {
    originalWithheldRed17_18: P.slice(17, 19).map((r) => db.translit[r]),
    holdoutLength: held.length, holdoutIoC: ioc(held),
    gibranTrigramLogScore: heldScore,
    wrongP53RedHoldoutLength: W.length - 17,
    wrongP53RedHoldoutIoC: ioc(W.slice(17)),
    wrongP53RedHoldoutTrigramScore: score(W.slice(17)),
    wrongP53DerivedKeyOnP27TrigramScore: score(wrongOnOriginal.slice(17)),
    first200PrintedGp: printed(P, 200),
    positiveNativePlantExact1433: true, originalCipherReencryptionExact1433: true
  };
}
if (require.main === module) console.log(JSON.stringify({
  status: 'PASS',
  source: 'Original LP2 physical pp27-32; p53 RED heading wrong-image control',
  issue: 671,
  originalLength: original.length,
  fixedTitleGp: seed.map((n) => db.translit[n]),
  additiveKey17: key, wrongP53RedKey17: wrongKey,
  pageOffsets,
  scoreDefinition: 'Gibran GP29 trigram conditional log P, alpha=0.05',
  nativeControls: {n: controls.length, min: controls[0],
    median: controls[Math.floor(controls.length / 2)],
    max: controls[controls.length - 1]},
  originalCipherTrigramScore: score(original.slice(17)),
  tests: results,
  conclusion: 'All three frozen original-cipher holdouts score below every independent native GP control; no unknown plaintext'
}, null, 2));
module.exports = {gp, decode, encode, score};
