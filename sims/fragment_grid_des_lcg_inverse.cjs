'use strict';

/**
 * Tests the source-derived 13/31 LCG as a row/column key schedule for the
 * 32x8 base-60 table, whose 32 rows are candidate 8-byte DES keys and whose
 * 32 text fragments are delimited by the manuscript's 31 13-dot marks.
 *
 * Human solve-path hypothesis:
 *   - the five-dot border ornament supplies the 13/31 recurrence;
 *   - its full-period LCG orders the 32 fragments and/or the 8 bytes in each
 *     candidate DES key;
 *   - the 32x8 numeric table supplies one 8-byte DES key per fragment;
 *   - the 13-dot marks reset the stream at fragment boundaries.
 *
 * This is a finite integration test, not a recovered cipher. It excludes the
 * rejected imageFive reconstruction and adds no free phase or fitted key.
 *
 * Run: node sims/fragment_grid_des_lcg_inverse.cjs
 */
const assert = require('node:assert/strict');
const base = require('./fragment_grid_des_inverse.cjs');

const {
  segments, original, sourceKeys, english, nativeRef,
  desStream, decode, encodeCipher, sliceSplit, plainScore, corpus
} = base;

function lcgOrder(n) {
  const out = [];
  let x = 0;
  for (let i = 0; i < n; i++) {
    out.push(x);
    x = (13 * x + 31) % n;
  }
  assert.equal(new Set(out).size, n, `13/31 LCG must be full-period mod ${n}`);
  return out;
}
function inverseOrder(order) {
  const inv = Array(order.length);
  order.forEach((v, i) => { inv[v] = i; });
  return inv;
}
const identity = n => Array.from({length:n}, (_,i)=>i);
const rowOrders = {
  identity: identity(32),
  lcg: lcgOrder(32),
  inverse: inverseOrder(lcgOrder(32))
};
const columnOrders = {
  identity: identity(8),
  lcg: lcgOrder(8),
  inverse: inverseOrder(lcgOrder(8))
};
const mappings = [];
for (const rowOrder of Object.keys(rowOrders)) {
  for (const columnOrder of Object.keys(columnOrders)) {
    mappings.push({rowOrder, columnOrder});
  }
}
assert.equal(mappings.length, 9);
assert.deepEqual(rowOrders.lcg.slice(0, 8), [0,31,18,9,20,3,6,13]);
assert.deepEqual(columnOrders.lcg, [0,7,2,1,4,3,6,5]);

const modes = [];
for (const stream of ['ctr','ofb'])
for (const salt of ['zero','row'])
for (const reverse of [false,true])
for (const format of ['direct29','diff28'])
for (const reducer of ['mod','scaled'])
for (const sign of [-1,1]) {
  modes.push({stream,salt,reverse,format,reducer,sign});
}
assert.equal(modes.length, 64);

function makePads(mapping, mode) {
  const rows = rowOrders[mapping.rowOrder];
  const columns = columnOrders[mapping.columnOrder];
  return segments.map((segment, fragment) => {
    const sourceRow = sourceKeys.canonical[rows[fragment]];
    let key = Buffer.from(columns.map(column => sourceRow[column]));
    if (mode.reverse) key = Buffer.from(key).reverse();
    return desStream(key, segment.length, fragment, mode);
  });
}
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const c of values) hist[c]++;
  return hist.reduce((sum,n)=>sum+n*(n-1),0)/(values.length*(values.length-1));
}
function search(segs) {
  const results = [];
  for (const mapping of mappings) {
    for (const mode of modes) {
      const pads = makePads(mapping, mode);
      const decoded = decode(segs, pads, mode);
      const {tr,ho} = sliceSplit(decoded);
      results.push({
        ...mapping, mode,
        train: plainScore(tr, english),
        heldout: plainScore(ho, english),
        trainIoc: ioc(tr),
        heldoutIoc: ioc(ho),
        prefix: decoded[0].slice(0,45).map(x=>corpus.translit[x]).join(''),
        decoded
      });
    }
  }
  return results.sort((a,b)=>b.train-a.train);
}
function nativePlant() {
  const truth = {
    rowOrder:'lcg', columnOrder:'lcg',
    mode:{stream:'ctr',salt:'row',reverse:false,format:'diff28',reducer:'scaled',sign:1}
  };
  let offset = 0;
  const native = segments.map(segment => {
    const part = nativeRef.slice(offset, offset + segment.length);
    offset += segment.length;
    return part;
  });
  assert.equal(offset,12956);
  const pads = makePads(truth, truth.mode);
  const cipher = encodeCipher(native, pads, truth.mode);
  const recovered = decode(cipher, pads, truth.mode);
  assert.deepEqual(recovered,native);
  assert.deepEqual(encodeCipher(recovered,pads,truth.mode),cipher);
  const ranked = search(cipher);
  const rank = ranked.findIndex(x =>
    x.rowOrder===truth.rowOrder &&
    x.columnOrder===truth.columnOrder &&
    JSON.stringify(x.mode)===JSON.stringify(truth.mode));
  const {tr,ho} = sliceSplit(recovered);
  return {
    trueModeRank:rank+1,
    recoveredRunes:recovered.flat().length,
    reencryptedRunes:encodeCipher(recovered,pads,truth.mode).flat().length,
    nativeTrain:plainScore(tr,english),
    nativeHeldout:plainScore(ho,english),
    matchedTrain:ranked[rank]?.train,
    matchedHeldout:ranked[rank]?.heldout
  };
}
function main() {
  const results = search(original);
  const best = results[0];
  const raw = sliceSplit(original);
  const first = results.slice(0,10).map(({rowOrder,columnOrder,mode,train,heldout,trainIoc,heldoutIoc,prefix}) =>
    ({rowOrder,columnOrder,mode,train,heldout,trainIoc,heldoutIoc,prefix}));
  console.log(JSON.stringify({
    hypothesis:'13/31 LCG row/column permutation of the original 32x8 grid, then one 8-byte DES key per 13-dot-delimited fragment',
    sourceFixed:{rowOrder:rowOrders.lcg,columnOrder:columnOrders.lcg,
      inverseRowOrder:rowOrders.inverse,inverseColumnOrder:columnOrders.inverse},
    layout:{fragments:segments.length,markers:31,
      unsolvedFragmentLengths:segments.slice(0,28).map(x=>x.length),
      originalRunes:original.flat().length},
    candidateCount:mappings.length*modes.length,
    mappingCount:mappings.length,
    desModeCount:modes.length,
    topTraining:first,
    bestHeldoutFromFrozenTrain:{rowOrder:best.rowOrder,columnOrder:best.columnOrder,
      mode:best.mode,heldout:best.heldout,heldoutIoc:best.heldoutIoc},
    noKeyNative:{train:plainScore(raw.tr,english),heldout:plainScore(raw.ho,english),
      trainIoc:ioc(raw.tr),heldoutIoc:ioc(raw.ho)},
    nativeReference:{train:plainScore(nativeRef.slice(0,6761),english),
      heldout:plainScore(nativeRef.slice(6761,12956),english)},
    positiveControl:nativePlant()
  },null,2));
}
if (require.main===module) main();
module.exports={lcgOrder,inverseOrder,rowOrders,columnOrders,modes,mappings,makePads,search,main};
