'use strict';
/**
 * Original LP2 GP29 -> GP30 (29 runes plus literal SPACE) context-map capacity.
 * Each state is allowed an entirely secret, independent injective mapping
 * from 29 ciphertext rune values to 29 of the 30 output symbols.
 *
 * A state can send only one input rune to SPACE. This script computes the
 * exact tight all-key SPACE and five-letter mass bounds, constructs witness
 * decoders, and verifies full original-cipher inverse / forward replay.
 *
 * Run on Windows 11 / Node.js 22:
 *   node sims/lp2_gp30_ciphertext_history_space_capacity_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/lp2-transcription.txt');
const original = transcript.split('$').slice(0, 8).join('$');
const gp = new Map(corpus.runes.map((x, i) => [x, i]));
const pages = corpus.pages.filter((p) => p.page <= 55).sort((a, b) => a.page - b.page);
const originalRunes = pages.flatMap((p) => p.indices);
const visualChapterStarts = [0, 3, 8, 15, 23, 27, 33, 40, 54];

/** @type {Array<{runes:number[],cross:boolean}>} */
const words = [];
let pending = [];
let crossed = false;
const flush = () => {
  if (pending.length) words.push({ runes: pending, cross: crossed });
  pending = [];
  crossed = false;
};
for (const ch of original) {
  if (gp.has(ch)) pending.push(gp.get(ch));
  else if (ch === '%') {
    if (pending.length) crossed = true;
  } else if (ch === '-' || ch === '.' || ch === '&' || ch === '$') flush();
}
flush();
const flattened = words.flatMap((w) => w.runes);
assert.deepEqual(flattened, originalRunes, 'All printed complete words must reconstruct the original ciphertext');
assert.equal(originalRunes.length, 12956);
assert.equal(words.length, 2896);
assert.equal(words.filter((w) => w.cross).length, 32);
assert.equal(words.filter((w) => w.runes.length === 1).length, 83);
assert.equal(words.filter((w) => w.runes.length === 2).length, 448);

/** @type {Array<{page:number,chapter:number,length:number,position:number}>} */
const frames = [];
const physical = pages.flatMap((p) => Array(p.indices.length).fill(p.page));
let offset = 0;
for (const w of words) {
  for (let position = 0; position < w.runes.length; position++) {
    const page = physical[offset];
    const chapter = visualChapterStarts.filter((start) => start <= page).length - 1;
    frames.push({ page, chapter, length: w.runes.length, position });
    offset++;
  }
}
assert.equal(offset, 12956);

const feature = (frame, field) => String(frame[field]);

/**
 * @typedef {'global'|'word'|'page'|'chapter'} Reset
 * @typedef {'page'|'chapter'|'length'|'position'} FrameFeature
 * @param {number} k Previous ciphertext symbols retained within reset scope.
 * @param {Reset} reset Source-visible reset boundary.
 * @param {FrameFeature[]} fields Additional freely keyed visible features.
 * @returns {{k:number,reset:Reset,fields:string,classes:number,spaces:number,top5:number,
 *            output:number[],witnessFirst:number[],witnessLast:number[]}}
 */
function evaluate(k, reset, fields = []) {
  assert.ok(Number.isInteger(k) && k >= 0 && k <= 3);
  /** @type {Map<string,number[]>} */
  const stateCounts = new Map();
  const labels = [];
  let scopeStart = 0;

  /**
   * @param {number[]} tape Cipher rune history: original or decoded inverse.
   * @param {number} index
   * @param {number} start
   * @returns {string}
   */
  function stateKey(tape, index, start) {
    const metadata = fields.map((field) => feature(frames[index], field));
    const history = tape.slice(Math.max(index - k, start), index);
    return metadata.join(',') + '|' + history.join(',');
  }

  /**
   * @param {number} index
   * @returns {boolean}
   */
  function resetHere(index) {
    if (index === 0) return true;
    const current = frames[index];
    const previous = frames[index - 1];
    return (reset === 'word' && current.position === 0) ||
      (reset === 'page' && current.page !== previous.page) ||
      (reset === 'chapter' && current.chapter !== previous.chapter);
  }

  for (let i = 0; i < originalRunes.length; i++) {
    if (resetHere(i)) scopeStart = i;
    const key = stateKey(originalRunes, i, scopeStart);
    labels.push(key);
    if (!stateCounts.has(key)) stateCounts.set(key, Array(29).fill(0));
    stateCounts.get(key)[originalRunes[i]]++;
  }

  let spaces = 0;
  let top5 = 0;
  const modal = new Map();
  for (const [key, counts] of stateCounts) {
    const sorted = counts.slice().sort((a, b) => b - a);
    spaces += sorted[0];
    top5 += sorted.slice(0, 5).reduce((a, b) => a + b, 0);
    modal.set(key, counts.indexOf(sorted[0]));
  }

  // Every table is a 29-to-30 injection: modal source rune -> SPACE (29).
  // All other source runes -> their unchanged GP index. This realizes the
  // exact upper bound on total SPACEs in the original finite register.
  const decoded = originalRunes.map((x, i) => (x === modal.get(labels[i]) ? 29 : x));
  assert.equal(decoded.filter((x) => x === 29).length, spaces);

  // Independent online inverse. It recomputes each state ONLY from previously
  // recovered ciphertext runes and unchanged public word/page framing.
  const replay = [];
  scopeStart = 0;
  for (let i = 0; i < decoded.length; i++) {
    if (resetHere(i)) scopeStart = i;
    const key = stateKey(replay, i, scopeStart);
    const special = modal.get(key);
    assert.notEqual(special, undefined);
    const plain = decoded[i];
    assert.ok(plain === 29 || (plain >= 0 && plain < 29 && plain !== special));
    replay.push(plain === 29 ? special : plain);
  }
  assert.deepEqual(replay, originalRunes);
  return {
    k, reset, fields: fields.join('+') || 'none',
    classes: stateCounts.size, spaces, top5,
    output: decoded, witnessFirst: decoded.slice(0, 32), witnessLast: decoded.slice(-32)
  };
}

const cases = [
  ...[0, 1, 2, 3].map((k) => [k, 'global', []]),
  ...[0, 1, 2, 3].map((k) => [k, 'word', []]),
  ...[0, 1, 2].map((k) => [k, 'chapter', []]),
  ...[0, 1, 2].map((k) => [k, 'page', []]),
  ...[0, 1, 2].map((k) => [k, 'word', ['length']]),
  ...[0, 1, 2].map((k) => [k, 'word', ['position']]),
  ...[0, 1, 2].map((k) => [k, 'word', ['chapter']]),
  ...[0, 1].map((k) => [k, 'word', ['page']])
];
const expected = [
  [1, 492, 2375], [30, 717, 3147], [842, 2021, 7032], [9948, 10076, 12956],
  [1, 492, 2375], [30, 695, 0], [867, 1848, 0], [5190, 5643, 0],
  [9, 562, 2645], [270, 1267, 4832], [5675, 6125, 12726],
  [55, 767, 3325], [1645, 2790, 9224], [11227, 11282, 12956],
  [14, 598, 0], [378, 1355, 0], [4920, 5454, 0],
  [14, 561, 0], [309, 1175, 0], [3718, 4249, 0],
  [9, 562, 0], [270, 1237, 0], [4583, 5147, 0],
  [55, 767, 0], [1638, 2668, 0]
];
assert.equal(cases.length, expected.length);

/**
 * Compute a long contiguous original holdout under original **global**
 * context, so prior runes immediately before the window are kept.
 * @param {number} firstPage
 * @param {number} lastPage
 * @param {number} k
 * @returns {{firstPage:number,lastPage:number,k:number,n:number,classes:number,spaces:number,top5:number}}
 */
function windowBound(firstPage, lastPage, k) {
  let begin = 0;
  let end = 0;
  let pos = 0;
  for (const page of pages) {
    if (page.page === firstPage) begin = pos;
    pos += page.indices.length;
    if (page.page === lastPage) end = pos;
  }
  assert.ok(begin < end);
  const groups = new Map();
  for (let i = begin; i < end; i++) {
    const key = originalRunes.slice(Math.max(0, i - k), i).join(',');
    if (!groups.has(key)) groups.set(key, Array(29).fill(0));
    groups.get(key)[originalRunes[i]]++;
  }
  let spaces = 0;
  let top5 = 0;
  for (const hist of groups.values()) {
    const sorted = hist.slice().sort((a, b) => b - a);
    spaces += sorted[0];
    top5 += sorted.slice(0, 5).reduce((a, b) => a + b, 0);
  }
  return { firstPage, lastPage, k, n: end - begin, classes: groups.size, spaces, top5 };
}

console.log('Source PASS: 12,956 ciphertext runes; 2,896 complete words; 32 real page carries.');
const summary = [];
cases.forEach(([k, reset, fields], i) => {
  const row = evaluate(k, reset, fields);
  const [classes, spaces, top5] = expected[i];
  assert.equal(row.classes, classes, 'Context state class count case ' + i);
  assert.equal(row.spaces, spaces, 'Maximal SPACE count case ' + i);
  if (top5) assert.equal(row.top5, top5, 'Top-five bound case ' + i);
  summary.push({
    k: row.k, reset: row.reset, fields: row.fields,
    classes: row.classes, spaceMax: row.spaces,
    spacePct: Number((100 * row.spaces / originalRunes.length).toFixed(5)),
    topFiveMax: row.top5,
    topFivePct: Number((100 * row.top5 / originalRunes.length).toFixed(5))
  });
});
console.log('All-key bounds with complete inverse witnesses:');
for (const row of summary) console.log(JSON.stringify(row));

const holds = [
  windowBound(16, 21, 1),
  windowBound(16, 21, 2),
  windowBound(40, 53, 1),
  windowBound(40, 53, 2)
];
assert.deepEqual(holds.map((h) => [h.n, h.classes, h.spaces, h.top5]), [
  [1613, 29, 164, 612],
  [1613, 713, 768, 1599],
  [3008, 29, 235, 958],
  [3008, 806, 982, 2837]
]);
console.log('Original p16–21 / p40–53 holdout bounds:');
holds.forEach((h) => console.log(JSON.stringify(h)));

const parable = corpus.pages.find((p) => p.page === 57).indices;
const p57Count = Array(29).fill(0);
parable.forEach((x) => p57Count[x]++);
const p57TopFive = p57Count.sort((a, b) => b - a).slice(0, 5).reduce((a, b) => a + b, 0);
assert.deepEqual([parable.length, p57TopFive], [95, 46]);
console.log('Authentic solved PARABLE p57: 46/95 GP top-five letters (48.42105%), 19/114 GP30 SPACE tokens (16.66667%).');
console.log('PASS: all ' + cases.length + ' original all-secret bounds and 29-to-30 exact inverse witnesses.');
