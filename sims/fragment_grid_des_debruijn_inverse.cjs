'use strict';
/**
 * Source-selected de Bruijn row assignment for the 32×8 grid/DES-fragment
 * hypothesis. This is a bounded follow-up to fragment_grid_des_inverse.cjs:
 * fragment i uses the canonical 8-byte key in black-anchored row BLACK[i].
 * It adds no fitted row permutation, cipher offset, or unknown key.
 * Run from repository root: node sims/fragment_grid_des_debruijn_inverse.cjs
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
const segments = Array.from({length: 32}, () => []);
for (let p = 0; p < 12956; p++) segments[fragmentIndex[p]].push({c: all[p], page: origin[p]});
assert.equal(segments.reduce((n, s) => n + s.length, 0), 12956);
assert.equal(segments.slice(0, 28).reduce((n, s) => n + s.length, 0), 12956);
assert.equal(grid.byte_rows.length, 32);
assert(grid.byte_rows.every(row => row.length === 8 && row.every(x => Number.isInteger(x) && x >= 0 && x <= 255)));

// Source-fixed order: state/row sequence with zero at the eighth (empty) fragment.
const BLACK = [13,26,20,9,18,4,8,16,0,1,2,5,10,21,11,23,14,29,27,22,12,24,17,3,7,15,31,30,28,25,19,6];
assert.equal(BLACK.length, 32);
assert.equal(BLACK[8], 0);
assert.equal(new Set(BLACK).size, 32);
const original = segments.slice(0, 28).map(s => s.map(p => p.c));
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
  return segments.slice(0, 28).map((seq, frag) => {
    const row = BLACK[frag];
    let key = Buffer.from(grid.byte_rows[row]);
    if (mode.reverse) key = Buffer.from(key).reverse();
    const counter = mode.salt === 'zero' ? 0 : mode.salt === 'fragment' ? frag : row;
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
  return h.reduce((s, n) => s + n * (n - 1), 0) / (vals.length * (vals.length - 1));
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
      trainIoc: ioc(tr), heldoutIoc: ioc(ho),
      prefix: translit(flat.slice(0, 120)),
      decoded,
      pads
    };
  }).sort((a, b) => b.train - a.train);
}
function plant() {
  const truth = {stream: 'ctr', salt: 'fragment', reverse: false, format: 'diff28', reducer: 'scaled', sign: 1};
  const ref = nativeRef.slice(0, 12956);
  let off = 0;
  const native = segments.slice(0, 28).map(s => {
    const x = ref.slice(off, off + s.length); off += s.length; return x;
  });
  assert.equal(off, 12956);
  const pads = padsFor(truth);
  const cipher = encodeCipher(native, pads, truth);
  const recovered = decode(cipher, pads, truth);
  assert.deepEqual(recovered, native);
  assert.deepEqual(encodeCipher(recovered, pads, truth), cipher);
  const ranked = search(cipher);
  const rank = ranked.findIndex(x => JSON.stringify(x.mode) === JSON.stringify(truth)) + 1;
  return {trueModeRank: rank, exactRecovered: recovered.flat().length, exactReencrypted: encodeCipher(recovered, pads, truth).flat().length};
}
function main() {
  const results = search(original);
  const bestTrain = results[0];
  const bestHoldout = results.slice().sort((a, b) => b.heldout - a.heldout)[0];
  const bestIoc = results.slice().sort((a, b) => b.trainIoc + b.heldoutIoc - a.trainIoc - a.heldoutIoc)[0];
  const raw = split(original);
  const output = {
    source: {grid: 'resources/liber-primus/base60-grid.json', rows: 32, bytesPerRow: 8,
      originalUnknownRunes: 12956, punctuationMarks: 31, nonemptyCipherFragments: 28},
    mapping: 'fragment i -> canonical grid row BLACK[i]',
    blackAnchoredOrder: BLACK,
    modelCount: modes.length,
    noKeyOriginal: {trainIoc: ioc(raw.tr), heldoutIoc: ioc(raw.ho)},
    bestByTraining: {mode: bestTrain.mode, train: bestTrain.train, heldout: bestTrain.heldout,
      trainIoc: bestTrain.trainIoc, heldoutIoc: bestTrain.heldoutIoc, prefix: bestTrain.prefix},
    bestByHeldout: {mode: bestHoldout.mode, train: bestHoldout.train, heldout: bestHoldout.heldout,
      trainIoc: bestHoldout.trainIoc, heldoutIoc: bestHoldout.heldoutIoc, prefix: bestHoldout.prefix},
    bestCombinedIoC: {mode: bestIoc.mode, trainIoc: bestIoc.trainIoc, heldoutIoc: bestIoc.heldoutIoc,
      prefix: bestIoc.prefix},
    sourceNativePositiveControl: plant()
  };
  console.log(JSON.stringify(output, null, 2));
}
if (require.main === module) main();
module.exports = {BLACK, modes, padsFor, search, plant, main};
