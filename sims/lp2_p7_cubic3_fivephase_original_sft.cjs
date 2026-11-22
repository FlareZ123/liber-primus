'use strict';
/**
 * Original LP2 SFT: a source-keyed, nonlinear three-cipher-predecessor GP29
 * machine with a five-phase clock. This is an explicitly limited hypothesis:
 * the original artwork supplies five numeric operands, but does not authorize
 * the chosen cubic update or assert a reset. All outputs are provisional.
 *
 * Windows 11, Node.js 22: node sims/lp2_p7_cubic3_fivephase_original_sft.cjs
 * Read-only; no external packages or generated files.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/lp2-transcription.txt');
const runeToIndex = new Map(gp.runes.map((r, i) => [r, i]));
/** @param {number} n @returns {number} */
const mod = n => (n % 29 + 29) % 29;
/** @param {number} n @returns {number} */
const phase5 = n => (n % 5 + 5) % 5;

/** @returns {number[]} The actual five p7 red-word index products. */
function redProducts() {
  const p7 = transcription.split('%')[7];
  const red = p7.split('&')[1];
  const words = red.match(/[\u16a0-\u16ff]+/gu);
  assert.deepEqual(words.map(w => [...w].length), [2, 4, 3, 2, 3]);
  const out = words.map(w => [...w].reduce((a, r) => {
    assert(runeToIndex.has(r));
    return mod(a * runeToIndex.get(r));
  }, 1));
  assert.deepEqual(out, [11, 26, 8, 15, 2]);
  return out;
}
const five = redProducts();
const pages = gp.pages.filter(p => p.page <= 55);
const starts = new Map();
const ciphertext = [];
for (const p of pages) {
  starts.set(p.page, ciphertext.length);
  ciphertext.push(...p.indices);
}
assert.equal(ciphertext.length, 12956);
const clockEpoch = starts.get(3);

/** @returns {{start:number,len:number}[]} */
function completeWords() {
  const input = transcription.split('%').slice(0, 55).join('%');
  const spans = [];
  let count = 0;
  let start = 0;
  for (const ch of input) {
    if (runeToIndex.has(ch)) {
      if (count === 0) start = spans.length
        ? spans.at(-1).start + spans.at(-1).len : 0;
      count++;
    } else if (ch === '%' || ch === '/' || /\s/u.test(ch)) {
      // Original line-wrap and page-wrap can occur inside words.
    } else if (count) {
      spans.push({ start, len: count });
      count = 0;
    }
  }
  if (count) spans.push({ start, len: count });
  assert.equal(spans.length, 2896);
  assert.equal(spans.at(-1).start + spans.at(-1).len, 12956);
  return spans;
}
const words = completeWords();

/** @param {number[]} data @returns {number[]} */
function historySeed(data) {
  assert.equal(data.length, 3);
  return data.slice();
}
/**
 * @param {number[]} input
 * @param {number} offset Absolute source rune offset
 * @param {number[]} past The three ciphertext runes before the interval,
 * in chronological order from oldest to newest.
 * @returns {number[]}
 */
function decode(input, offset, past) {
  const h = historySeed(past);
  const output = [];
  for (let j = 0; j < input.length; j++) {
    const phase = phase5(offset + j - clockEpoch);
    const prod = mod(h[0] * h[1] * h[2]);
    output.push(mod(input[j] - prod - five[phase]));
    h.shift();
    h.push(input[j]);
  }
  return output;
}
/**
 * @param {number[]} plain
 * @param {number} offset
 * @param {number[]} past
 * @returns {number[]}
 */
function encode(plain, offset, past) {
  const h = historySeed(past);
  const output = [];
  for (let j = 0; j < plain.length; j++) {
    const phase = phase5(offset + j - clockEpoch);
    const prod = mod(h[0] * h[1] * h[2]);
    const c = mod(plain[j] + prod + five[phase]);
    output.push(c);
    h.shift();
    h.push(c);
  }
  return output;
}
/** @param {number[]} source @returns {{n:number,ioc:number,top5:number}} */
function stats(source) {
  const n = source.length;
  const hist = Array(29).fill(0);
  for (const v of source) hist[v]++;
  const ioc = hist.reduce((s, v) => s + v * (v - 1), 0) / (n * (n - 1));
  const top5 = hist.slice().sort((a, b) => b - a)
    .slice(0, 5).reduce((a, b) => a + b, 0);
  return { n, ioc: Number(ioc.toFixed(11)), top5 };
}
/** @param {number[]} arr @returns {string} */
const transliterate = arr => arr.map(v => gp.translit[v]).join(' ');
/** @param {number} p @param {number} afterLast */
function originalTest(p, afterLast) {
  const lo = starts.get(p), hi = starts.get(afterLast);
  const actual = ciphertext.slice(lo, hi);
  const past = ciphertext.slice(lo - 3, lo);
  const plain = decode(actual, lo, past);
  assert.deepEqual(encode(plain, lo, past), actual);
  return { startPage: p, endPage: afterLast - 1, offset: lo,
    ...stats(plain), beginning: transliterate(plain.slice(0, 100)),
    last60: transliterate(plain.slice(-60)) };
}

const original = [originalTest(3, 6), originalTest(6, 8),
  originalTest(3, 8), originalTest(16, 22)];
assert.equal(original[2].n, 1145);
assert.equal(original[3].n, 1613);

/** @param {string} word @returns {number[]} */
function nativeEncode(word) {
  const text = word.toUpperCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  assert.match(text, /^[A-Z]+$/u);
  const ranked = gp.translit.map((token, i) => ({ token, i }))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (let i = 0; i < text.length;) {
    if (text.startsWith('ING', i)) {
      out.push(21); i += 3;
    } else if (text.startsWith('IO', i)) {
      out.push(27); i += 2;
    } else {
      const item = ranked.find(x => text.startsWith(x.token, i));
      assert(item, 'Cannot encode ' + text.slice(i));
      out.push(item.i); i += item.token.length;
    }
  }
  return out;
}
// Frozen source-native controls; no unknown ciphertext fit is involved.
const solved = gp.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);
const native = (read('resources/control/shakespeare_first300k.txt')
  .match(/\p{L}+/gu) || []).flatMap(nativeEncode);
assert(native.length >= 1613);
const controls = [
  { name: 'solved-p57', plain: solved, offset: 0 },
  { name: 'Shakespeare-1145', plain: native.slice(0, 1145), offset: starts.get(3) },
  { name: 'Shakespeare-1613', plain: native.slice(0, 1613), offset: starts.get(16) }
];
const positive = controls.map(obj => {
  const past = [gp.runes.length - 1, 2, 17];
  const encrypted = encode(obj.plain, obj.offset, past);
  const decoded = decode(encrypted, obj.offset, past);
  assert.deepEqual(decoded, obj.plain);
  return { name: obj.name, ...stats(obj.plain), recovered: decoded.length };
});
console.log(JSON.stringify({
  hypothesis: 'P=C-Cprev1*Cprev2*Cprev3-K[(i-start_p3)%5] mod29',
  coefficientSource: 'Original p7 five complete red words, GP29 rune-index products',
  five, clockEpoch, printedWords: words.length,
  state: 'continuous across all original pages and printed words; previous three actual ciphertext runes',
  original, positive
}, null, 2));
console.log('PASS: exact original replay on all four windows; source-native planted positives exact');
