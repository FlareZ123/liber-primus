'use strict';
/**
 * Page-29 source-word-aligned DH frame and source-dependent Q checksum.
 * SFT: node sims/lp2_p29_wordframed_dh29_original_sft.cjs
 * Node.js 22 CommonJS; read-only; no third-party dependencies.
 *
 * This tests a distinct 3|269|2|3 complete-word packet. The earlier
 * 2|269|6 packet slices through genuine printed source words.
 * Neither packet supplies an authenticated cipher consumption rule.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const sections = read('resources/liber-primus/lp2-transcription.txt').split('%');
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translit = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} x @returns {number} */
function inv(x) {
  const y = Array.from({ length: 28 }, (_, i) => i + 1)
    .find(n => mod(n * x) === 1);
  assert.notEqual(y, undefined);
  return y;
}
/** @param {number[]} a @param {number[]} b @returns {number[]} */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => b.forEach((y, j) => {
    out[i + j] = mod(out[i + j] + x * y);
  }));
  return out;
}
/** @param {number[]} a @param {number[]} q @returns {number[]} */
function remainder(a, q) {
  const v = a.slice();
  const qInv = inv(q[0]);
  for (let i = 0; i <= v.length - q.length; i++) {
    const ratio = mod(v[i] * qInv);
    for (let j = 0; j < q.length; j++)
      v[i + j] = mod(v[i + j] - ratio * q[j]);
  }
  return v.slice(-(q.length - 1));
}
/**
 * Original printed complete words, as page-local GP29 rune offsets.
 * Source '-'/'.' are word delimiters, '/' and line breaks are not.
 * @param {number} page @returns {{start:number,len:number}[]}
 */
function words(page) {
  let offset = 0, start = 0, len = 0;
  const out = [], decoded = [];
  const flush = () => {
    if (len) out.push({ start, len });
    len = 0;
  };
  for (const ch of sections[page]) {
    const v = runeIndex.get(ch);
    if (v !== undefined) {
      if (!len) start = offset;
      offset++;
      len++;
      decoded.push(v);
    } else if ('-. $&§'.includes(ch)) flush();
  }
  flush();
  assert.deepEqual(decoded, corpus.pages[page].indices);
  return out;
}
const p28 = corpus.pages[28].indices, p29 = corpus.pages[29].indices;
const w28 = words(28), w29 = words(29);
assert.equal(p28.length, 269);
assert.equal(p29.length, 277);
assert.deepEqual([w29[0].len, w29.at(-2).len, w29.at(-1).len], [3, 2, 3]);
assert.deepEqual(p29.slice(0, 3), [2, 23, 6]);
assert.deepEqual(p29.slice(-5), [18, 12, 6, 8, 19]);
const body = p29.slice(3, -5);
assert.equal(body.length, 269);
assert.equal(w29.slice(1, -2).reduce((s, w) => s + w.len, 0), 269);
// The first word fixes K=2, p=23, a=6 in the archived DH toy example.
const K = p29[0], a = p29[2], e = mod(a * inv(K));
assert.equal(e, 3);
// Original p39 red inscription is GP0 [27,5,15], low-degree first.
const originalRed = corpus.pages[39].indices.slice(119, 122);
assert.deepEqual(originalRed, [27, 5, 15]);
const Ghigh = originalRed.slice().reverse();
const Qhigh = multiply(Ghigh, [1, mod(-e)]);
assert.deepEqual(Qhigh, [15, 18, 12, 6]);
// The final complete source word is exactly the three Q parity symbols;
// with no access to these symbols, the rest fixes them uniquely.
const predictedLastWord = remainder(p29.slice(0, -3).concat([0, 0, 0]), Qhigh)
  .map(x => mod(-x));
assert.deepEqual(predictedLastWord, p29.slice(-3));
assert.deepEqual(remainder(p29, Qhigh), [0, 0, 0]);
assert.deepEqual(p29.slice(-2), [8, 19]); // Signed-2013 DH publics.
assert.deepEqual(p29.slice(-5, -3), [mod(8 - 19), mod(K * a)]);

/** @param {string} input @param {boolean} historical @returns {number[]|null} */
function encodeWord(input, historical) {
  let s = input.toUpperCase().replace(/QU/g, 'CW')
    .replace(/[KQ]/g, 'C').replace(/V/g, 'U').replace(/Z/g, 'S');
  if (historical) s = s.replace(/ING/g, 'NG').replace(/IO/g, 'IA');
  const out = [];
  for (let i = 0; i < s.length;) {
    const t = translit.find(x => s.startsWith(x.s, i));
    if (!t) return null;
    out.push(t.i);
    i += t.s.length;
  }
  return out;
}
const dictMaps = new Map();
for (const line of read('resources/control/english_wordfreq_textblob.txt').split(/\r?\n/)) {
  const m = /^([a-z]+)\s+\d+$/.exec(line);
  if (!m) continue;
  for (const historical of [false, true]) {
    const w = encodeWord(m[1], historical);
    if (!w || w.length > 18) continue;
    if (!dictMaps.has(w.length)) dictMaps.set(w.length, new Map());
    dictMaps.get(w.length).set(w.join(','), w);
  }
}
const dictionary = new Map([...dictMaps].map(([n, map]) => [n, [...map.values()]]));
assert(dictionary.get(6).length > 5000);

const aWords = w28.filter(w => w.start > 0 && w.start + w.len < 269);
const bWords = w29.slice(1, -2).map(w => ({ start: w.start - 3, len: w.len }));
const spans = [];
for (const aa of aWords) for (const bb of bWords) {
  const start = Math.max(aa.start, bb.start);
  const width = Math.min(aa.start + aa.len, bb.start + bb.len) - start;
  if (width >= 6) spans.push({ start, width, aa, bb });
}
spans.sort((a, b) => a.start - b.start);
assert.deepEqual(spans.map(x => x.start), [19, 45, 64, 218, 252]);
assert(spans.every(x => x.width === 6));

/**
 * For C28=s*P28+pad+offsetA, C29=s*P29+gain*pad+offsetB,
 * derive every GP29 relative shift allowed by two full original words.
 * @param {number[]} C28 @param {number[]} C29
 * @param {{start:number,width:number,aa:{start:number,len:number},bb:{start:number,len:number}}} span
 * @param {number} gain @param {number} sign @returns {number[]}
 */
function allowed(C28, C29, span, gain, sign) {
  const { start, width, aa, bb } = span;
  const B = new Set((dictionary.get(bb.len) || [])
    .map(w => w.slice(start - bb.start, start - bb.start + width).join(',')));
  const A = (dictionary.get(aa.len) || [])
    .map(w => w.slice(start - aa.start, start - aa.start + width));
  const delta = Array.from({ length: width },
    (_, i) => mod(C29[start + i] - gain * C28[start + i]));
  const valid = [];
  for (let shift = 0; shift < 29; shift++) {
    if (A.some(w => B.has(w.map((x, i) =>
      mod(gain * x + sign * delta[i] + shift)).join(',')))) valid.push(shift);
  }
  return valid;
}
let survivors = 0, models = 0;
const rejectedBySpan = Array(spans.length).fill(0);
for (let gain = 1; gain < 29; gain++) for (const sign of [1, -1]) {
  const possibilities = spans.map(span => allowed(p28, body, span, gain, sign));
  models++;
  possibilities.forEach((p, i) => { if (!p.length) rejectedBySpan[i]++; });
  const shared = Array.from({ length: 29 }, (_, i) => i)
    .filter(shift => possibilities.every(p => p.includes(shift)));
  if (shared.length) survivors++;
}
assert.equal(models, 56);
assert.equal(survivors, 0);

/** @param {number} seed @returns {() => number} */
function lcg(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
const random = lcg(0x3301293);
/** @param {{start:number,len:number}[]} wordList @returns {number[]} */
function plant(wordList) {
  const out = Array.from({ length: 269 }, () => Math.floor(random() * 29));
  for (const { start, len } of wordList) {
    const choices = dictionary.get(len);
    if (!choices || !choices.length) continue;
    const v = choices[Math.floor(random() * choices.length)];
    for (let j = 0; j < len; j++) out[start + j] = v[j];
  }
  return out;
}
let planted = 0;
for (const gain of [2, 5, 19]) {
  const plainA = plant(aWords), plainB = plant(bWords);
  const pad = Array.from({ length: 269 }, () => Math.floor(random() * 29));
  for (const sign of [1, -1]) {
    const ca = plainA.map((x, i) => mod(sign * x + pad[i] + 7));
    const cb = plainB.map((x, i) => mod(sign * x + gain * pad[i] + 11));
    const expected = mod(sign * (gain * 7 - 11));
    for (const span of spans) {
      assert(allowed(ca, cb, span, gain, sign).includes(expected));
      planted++;
    }
    for (let i = 0; i < 269; i++)
      assert.equal(mod(ca[i] - sign * plainA[i] - 7), pad[i]);
  }
}
assert.equal(planted, 30);
console.log(JSON.stringify({
  passed: true,
  source: 'unchanged original LP2 p28/p29/p39 and two GP29 spelling dictionaries',
  page29: { packet: '3|269|2|3', header: p29.slice(0, 3),
    trailer: p29.slice(-5), predictedLastWord, Qhigh },
  independentSameLengthPages: corpus.pages.filter(p =>
    p.page !== 29 && p.runic_count === 269).map(p => p.page),
  page28Alignment: { spans: spans.map(x => x.start),
    models, survivors, rejectedBySpan, positiveWordOverlaps: planted },
  interpretation: 'No authenticated original unknown-page plaintext or decoder'
}, null, 2));
