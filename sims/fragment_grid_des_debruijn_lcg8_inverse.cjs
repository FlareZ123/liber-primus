'use strict';
/**
 * Source-fixed combined row/column DES-key challenge.
 *
 * Row map: the existing black-anchored order BLACK, selected by the p55
 * five-dot motif and the unique black 13-dot event.
 * Column map: the 8-state affine recurrence x <- 13*x + 31 (mod 8).
 *
 * Independent cross-checks:
 *   - the two empty full-text fragments are 8 and 11;
 *   - BLACK[8] = 0 and BLACK[11] = 5;
 *   - the two literal zero bytes are (row 24,col 0) and (row 28,col 5);
 *   - BLACK^-1 maps those rows to fragments 21 and 28;
 *   - fragment 21 has 8 runes and fragment 28 has 5 runes;
 *   - LCG8 places columns 0 and 5 at byte positions 0 and 7.
 *
 * This tests one source-fixed row/column composition, not a recovered cipher.
 * Node.js 22; no third-party dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {desStream, decode, encodeCipher} = require('./fragment_grid_des_inverse.cjs');
const {train, encode} = require('./grid_keyskip_viterbi.cjs');
const {plainScore} = require('./grid_latin_register_inverse.cjs');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const corpus = read('resources/liber-primus/lp2-corpus.json');
const ink = read('resources/liber-primus/lp2-ink-annotations.json');
const grid = read('resources/liber-primus/base60-grid.json');
const all = [], origin = [], start = [];
for (const page of corpus.pages) {
  start[page.page] = all.length;
  for (const c of page.indices) { all.push(c); origin.push(page.page); }
}
assert.equal(all.length, 13136);
const dots = [];
for (const rec of ink.pages) {
  assert.equal(rec.rune_count, corpus.pages[rec.page].indices.length);
  for (const mark of rec.large_punctuation || [])
    if (mark[1] === 13) dots.push(start[rec.page] + mark[0]);
}
dots.sort((a, b) => a - b);
assert.equal(dots.length, 31);
const fragmentIndex = Array(all.length);
let f = 0, di = 0;
for (let p = 0; p < all.length; p++) {
  while (di < dots.length && dots[di] === p) { di++; f++; }
  fragmentIndex[p] = f;
}
assert.equal(di, 31);
assert.equal(fragmentIndex[12955], 27);
assert.equal(fragmentIndex[12956], 28);
const fullSegments = Array.from({length: 32}, () => []);
for (let p = 0; p < all.length; p++)
  fullSegments[fragmentIndex[p]].push({c: all[p], page: origin[p]});
assert.equal(fullSegments.length, 32);
assert.deepEqual(fullSegments.map(s => s.length === 0 ? 1 : 0)
  .map((v, i) => v ? i : -1).filter(i => i >= 0), [8, 11]);
assert.equal(fullSegments[21].length, 8);
assert.equal(fullSegments[28].length, 5);
const segments = fullSegments.slice(0, 28);
assert.equal(segments.reduce((n, s) => n + s.length, 0), 12956);
assert.equal(segments[8].length, 0);
assert.equal(segments[11].length, 0);
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every(row => row.length === 8 &&
  row.every(x => Number.isInteger(x) && x >= 0 && x <= 255)));

const BLACK = [13,26,20,9,18,4,8,16,0,1,2,5,10,21,11,23,14,29,27,22,12,24,17,3,7,15,31,30,28,25,19,6];
assert.equal(BLACK.length, 32);
assert.equal(new Set(BLACK).size, 32);
assert.equal(BLACK[8], 0);
assert.equal(BLACK[11], 5);

const LCG8 = [];
let x = 0;
for (let i = 0; i < 8; i++) {
  LCG8.push(x);
  x = (13 * x + 31) % 8;
}
assert.deepEqual(LCG8, [0,7,2,1,4,3,6,5]);
assert.equal(LCG8.indexOf(0), 0);
assert.equal(LCG8.indexOf(5), 7);

const zeroCells = [];
for (let r = 0; r < 32; r++) for (let c = 0; c < 8; c++)
  if (grid.byte_rows[r][c] === 0) zeroCells.push([r, c]);
assert.deepEqual(zeroCells, [[24,0],[28,5]]);
const zeroAnchors = zeroCells.map(([row, col]) => ({
  row, col,
  fragment: BLACK.indexOf(row),
  columnPosition: LCG8.indexOf(col)
}));
assert.deepEqual(zeroAnchors.map(z => [z.fragment, z.columnPosition]),
  [[21,0],[28,7]]);
assert.deepEqual(zeroAnchors.map(z => fullSegments[z.fragment].length), [8,5]);

const original = segments.map(s => s.map(p => p.c));
const gpTrain = fs.readFileSync(path.join(root, 'resources/control/shakespeare_first300k.txt'), 'utf8');
const english = train(gpTrain.slice(0, 190000));
const nativeRef = encode(gpTrain.slice(205000));
assert(nativeRef.length >= 12956);

const modes = [];
for (const stream of ['ctr', 'ofb'])
  for (const salt of ['zero', 'fragment', 'gridrow'])
    for (const reverse of [false, true])
      for (const format of ['direct29', 'diff28'])
        for (const reducer of ['mod', 'scaled'])
          for (const sign of [-1, 1])
            modes.push({stream, salt, reverse, format, reducer, sign});
assert.equal(modes.length, 96);

function padsFor(mode) {
  return segments.map((seq, frag) => {
    const row = BLACK[frag];
    let key = Buffer.from(LCG8.map(col => grid.byte_rows[row][col]));
    if (mode.reverse) key = Buffer.from(key).reverse();
    const counter = mode.salt === 'zero' ? 0 :
      mode.salt === 'fragment' ? frag : row;
    return desStream(key, seq.length, counter, {
      stream: mode.stream,
      salt: mode.salt === 'zero' ? 'zero' : 'row'
    });
  });
}
function split(decoded) {
  const tr = [], ho = [];
  for (let r = 0; r < decoded.length; r++)
    for (let j = 0; j < decoded[r].length; j++)
      (segments[r][j].page < 28 ? tr : ho).push(decoded[r][j]);
  return {tr, ho};
}
function ioc(vals) {
  const h = Array(29).fill(0);
  for (const c of vals) h[c]++;
  return h.reduce((s, n) => s + n * (n - 1), 0) /
    (vals.length * (vals.length - 1));
}
function translit(vals) { return vals.map(x => corpus.translit[x]).join(''); }
function search(segs) {
  return modes.map(mode => {
    const pads = padsFor(mode);
    const decoded = decode(segs, pads, mode);
    const {tr, ho} = split(decoded);
    const flat = decoded.flat();
    return {
      mode,
      train: plainScore(tr, english),
      heldout: plainScore(ho, english),
      trainIoc: ioc(tr),
      heldoutIoc: ioc(ho),
      prefix: translit(flat.slice(0, 120)),
      decoded,
      pads
    };
  }).sort((a, b) => b.train - a.train);
}
function plant() {
  const truth = {
    stream: 'ctr', salt: 'fragment', reverse: false,
    format: 'diff28', reducer: 'scaled', sign: 1
  };
  const ref = nativeRef.slice(0, 12956);
  let off = 0;
  const native = segments.map(s => {
    const x = ref.slice(off, off + s.length);
    off += s.length;
    return x;
  });
  assert.equal(off, 12956);
  const pads = padsFor(truth);
  const cipher = encodeCipher(native, pads, truth);
  const recovered = decode(cipher, pads, truth);
  assert.deepEqual(recovered, native);
  assert.deepEqual(encodeCipher(recovered, pads, truth), cipher);
  const ranked = search(cipher);
  const rank = ranked.findIndex(x =>
    JSON.stringify(x.mode) === JSON.stringify(truth)) + 1;
  return {
    trueModeRank: rank,
    exactRecovered: recovered.flat().length,
    exactReencrypted: encodeCipher(recovered, pads, truth).flat().length
  };
}
function main() {
  const results = search(original);
  const bestTrain = results[0];
  const bestHoldout = results.slice().sort((a, b) => b.heldout - a.heldout)[0];
  const raw = split(original);
  const output = {
    source: {
      unknownRunes: 12956, fullRunes: 13136, punctuationMarks: 31,
      fragments: 32, emptyFragments: [8,11], gridRows: 32, bytesPerRow: 8
    },
    rowOrder: BLACK,
    columnOrder: LCG8,
    zeroCells,
    zeroAnchors,
    modelCount: modes.length,
    noKeyOriginal: {
      train: plainScore(raw.tr, english),
      heldout: plainScore(raw.ho, english),
      trainIoc: ioc(raw.tr),
      heldoutIoc: ioc(raw.ho)
    },
    bestByTraining: {
      mode: bestTrain.mode, train: bestTrain.train, heldout: bestTrain.heldout,
      trainIoc: bestTrain.trainIoc, heldoutIoc: bestTrain.heldoutIoc,
      prefix: bestTrain.prefix
    },
    bestByHeldout: {
      mode: bestHoldout.mode, train: bestHoldout.train, heldout: bestHoldout.heldout,
      trainIoc: bestHoldout.trainIoc, heldoutIoc: bestHoldout.heldoutIoc,
      prefix: bestHoldout.prefix
    },
    sourceNativePositiveControl: plant()
  };
  console.log(JSON.stringify(output));
}
if (require.main === module) main();
module.exports = {BLACK, LCG8, zeroCells, zeroAnchors, modes, padsFor, search, plant, main};
