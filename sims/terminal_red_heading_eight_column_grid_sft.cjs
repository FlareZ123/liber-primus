"use strict";
/**
 * P53 black/red + p54 enlarged initial + p55 tree: source-locked 256 runes.
 * P54's eight other red heading runes supply a stable 8-column keyword
 * for the 32x8 printed numeral table. This gates only literal GP29
 * table-pad interpretations, not arbitrary keys or steganography.
 *
 * Run: node sims/terminal_red_heading_eight_column_grid_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {any} */
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const grid = load("resources/liber-primus/lp2-grid-256.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const page = n => corpus.pages.find(p => p.page === n);
const inkPage = n => ink.pages.find(p => p.page === n);
const p53 = page(53).indices, p54 = page(54).indices, p55 = page(55).indices;
assert.deepEqual(inkPage(53).red_spans.map(x => [x.start,x.length]),[[128,51]]);
assert.deepEqual(inkPage(54).red_spans.map(x => [x.start,x.length]),[[0,9]]);
assert.equal((inkPage(55).red_spans || []).length,0);
assert.deepEqual([p53.length,p54.length,p55.length],[179,232,76]);
assert.equal(p54[0],24); // Original enlarged ᚪ / A
const sourceCipher = [...p53,p54[0],...p55];
const columnKey = p54.slice(1,9);
assert.equal(sourceCipher.length,256);
assert.equal(columnKey.length,8);
const keyOrder = columnKey.map((v,i) => ({v,i}))
  .sort((a,b) => a.v-b.v || a.i-b.i).map(x => x.i);
assert.deepEqual(keyOrder,[4,6,5,0,7,1,2,3]);
const mod = n => ((n % 29)+29)%29;
const runeText = values => values.map(v => corpus.translit[mod(v)]).join("");
const ioc = values => {
  const hist = Array(29).fill(0);
  for (const v of values) hist[mod(v)]++;
  return hist.reduce((sum,n) => sum + n*(n-1),0)/
    (values.length * (values.length-1));
};
assert.equal(grid.bytes.length,256);
const bytes = grid.bytes;
const pads = {
  "original-row-major": bytes,
  "keyword-row-major": Array.from({length:32},(_,r) =>
    keyOrder.map(col => bytes[r*8+col])).flat(),
  "keyword-column-major": keyOrder.flatMap(col =>
    Array.from({length:32},(_,r) => bytes[r*8+col])),
  "keyword-inverse-columnar": Array.from({length:32},(_,r) =>
    Array.from({length:8},(_,col) => bytes[keyOrder[col]*32+r])).flat()
};
/** @param {number[]} xs @param {number[]} pad @param {-1|1} sign */
const transform = (xs,pad,sign) => xs.map((v,i) => mod(v + sign*pad[i]));
const results = [];
for (const [name,pad] of Object.entries(pads)) {
  assert.equal(pad.length,256);
  for (const sign of [-1,1]) {
    const output = transform(sourceCipher,pad,sign);
    const recovered = transform(output,pad,-sign);
    assert.deepEqual(recovered,sourceCipher);
    results.push({
      traversal:name, sign, ioc256:ioc(output),
      iocFirst128:ioc(output.slice(0,128)),
      iocLast128:ioc(output.slice(128)),
      prefixGP:runeText(output.slice(0,48))
    });
  }
}
/** @param {string} txt @returns {number[]} */
function encodeNative(txt) {
  const names = corpus.translit.map((s,i) => ({s,i}))
    .sort((a,b) => b.s.length-a.s.length);
  const out = [];
  for (let w of txt.toUpperCase().match(/[A-Z]+/g)||[]) {
    w=w.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
    for (let i=0;i<w.length;) {
      const match = names.find(x => w.startsWith(x.s,i));
      assert(match,"GP spellable native control token");
      out.push(match.i);
      i+=match.s.length;
    }
  }
  return out;
}
const native = encodeNative(fs.readFileSync(path.join(root,
  "resources/control/gibran_prophet_58585.txt"),"utf8"));
assert(native.length>256);
const plant = native.slice(1024,1280);
assert.equal(plant.length,256);
for (const [name,pad] of Object.entries(pads)) {
  const encrypted = transform(plant,pad,+1);
  assert.deepEqual(transform(encrypted,pad,-1),plant, name);
}
assert.deepEqual(results.map(x => Number(x.ioc256.toFixed(8))),
  [0.03425245,0.03281250,0.03477328,0.03523284,
    0.03541667,0.03367034,0.03382353,0.03596814]);
console.log(JSON.stringify({
  classification:"source-linked finite negative; no unknown plaintext or key",
  original:{
    p53Black:128,p53Red:51,p54OversizedA:1,p55Runes:76,
    p54EightRedKeywordGP:runeText(columnKey),
    keywordColumns:keyOrder,tableShape:[32,8],
    ciphertextRunes:sourceCipher.length,
    rawIoC:ioc(sourceCipher)
  },
  positive:{
    nativeGpRunes:plant.length,nativeGpIoC:ioc(plant),
    exactlyRecoveredAcrossFourTraversals:true
  },
  finiteOriginal:results,
  scope:"Four source-plausible 8-column table traversals and two GP29 additive signs. No original plaintext; does not exclude another original byte/rune coupling."
},null,2));
