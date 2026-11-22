"use strict";
/**
 * The source-printed 32x8 table (LP2 pp49-51) has a 76-cell perimeter
 * and a 180-cell interior. LP2 p55 has exactly 76 ciphertext runes;
 * solved pp56-57 have respectively 85 and 95 original runes (180 total).
 * The solved PARABLE says "shed our own circumferences."
 *
 * Freeze the four literal corner starts and clockwise / anticlockwise ring
 * traversal, and source-historic direct key reductions byte %29 and phi(byte)
 * %29. Test both additive signs against all unmodified p55 runes. Separately,
 * test whether the table's 180 inner bytes encode the known native-GP29
 * plaintext of pp56-57 under any deterministic byte->GP mapping, with no
 * assumptions about plaintext on p55.
 *
 * Node.js 22, CommonJS, source-native. Run from repository root:
 * node sims/lp2_32x8_outer76_p55_instar_source_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const json = name => JSON.parse(fs.readFileSync(path.join(ROOT, name), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const table = json("resources/liber-primus/lp2-grid-256.json");
const bytes = table.bytes;
const page = number => corpus.pages.find(p => p.page === number).indices;
const p55 = page(55), p56Cipher = page(56), p57Clear = page(57);
assert.equal(bytes.length, 256);
assert.deepEqual(table.shape || table.pages.map(x => x.rows), "32 rows by 8 columns across LP2 pages 49, 50, 51");
assert.deepEqual(table.pages.map(x => x.rows), [10, 13, 9]);
assert.equal(p55.length, 76);
assert.equal(p56Cipher.length, 85);
assert.equal(p57Clear.length, 95);
assert.equal(p55.length + p56Cipher.length + p57Clear.length, 256);

const HEIGHT = 32, WIDTH = 8;
const ring = [];
for (let col = 0; col < WIDTH; col++) ring.push(col);
for (let row = 1; row < HEIGHT-1; row++) ring.push(row*WIDTH+WIDTH-1);
for (let col = WIDTH-1; col >= 0; col--) ring.push((HEIGHT-1)*WIDTH+col);
for (let row = HEIGHT-2; row > 0; row--) ring.push(row*WIDTH);
assert.equal(ring.length, 76);
assert.equal(new Set(ring).size, 76);
const shellSet = new Set(ring);
const inner = Array.from({length: 256}, (_, i) => i)
  .filter(index => !shellSet.has(index));
assert.equal(inner.length, 180);
assert.equal(new Set(inner).size, 180);
const corners = [0, 7, 38, 45];
assert.deepEqual(corners.map(position => ring[position]), [0, 7, 255, 248]);
/** @param {number} start @param {boolean} anticlockwise */
function ringOrder(start, anticlockwise) {
  const shifted = ring.slice(start).concat(ring.slice(0, start));
  return anticlockwise ? [shifted[0], ...shifted.slice(1).reverse()] : shifted;
}
/** @param {number} n */
function phi(n) {
  if (n === 0) return 0; // literal byte 0 has no Euler totient
  let rest = n, total = n;
  for (let p = 2; p*p <= rest; p++) {
    if (rest % p === 0) {
      total -= total / p;
      while (rest % p === 0) rest /= p;
    }
  }
  if (rest > 1) total -= total / rest;
  return total;
}
const mod = n => ((n % 29)+29)%29;
const ioc = seq => {
  const counts = Array(29).fill(0);
  for (const v of seq) counts[v]++;
  return counts.reduce((sum, v) => sum+v*(v-1),0)/(seq.length*(seq.length-1));
};
const roman = seq => seq.map(i => corpus.translit[i]).join("");
const results = [];
for (const mapping of ["byte", "totient"]) for (const start of corners) {
  for (const anticlockwise of [false, true]) {
    const ordered = ringOrder(start, anticlockwise);
    const key = ordered.map(index => mod(mapping === "byte" ? bytes[index] : phi(bytes[index])));
    for (const sign of [-1, 1]) {
      const plain = p55.map((value, i) => mod(value + sign*key[i]));
      assert.deepEqual(plain.map((value, i) => mod(value-sign*key[i])), p55);
      const clearPlant = p57Clear.slice(0, 76);
      const cipherPlant = clearPlant.map((value, i) => mod(value-sign*key[i]));
      assert.deepEqual(cipherPlant.map((value, i) => mod(value+sign*key[i])), clearPlant);
      results.push({mapping, startPerimeterOffset: start, anticlockwise, sign,
        ioc: ioc(plain), gpRomanPrefix: roman(plain.slice(0, 24))});
    }
  }
}
assert.equal(results.length, 32);
results.sort((x, y) => y.ioc-x.ioc);
assert.equal(results[0].mapping, "totient");
assert.equal(results[0].startPerimeterOffset, 38);
assert.equal(results[0].anticlockwise, false);
assert.equal(results[0].sign, -1);
assert.ok(Math.abs(results[0].ioc-0.042105263157894736)<1e-13);

// A second, genuinely byte-producing inverse: the printed table retains
// raw bytes 0..255, while each original p55 GP rune has both an ordinal
// 0..28 and an original GP prime weight. Historically used XOR/subtraction
// on the aligned original 76 byte/rune pairs would reveal printable ASCII.
const byteOptions = [];
const byteMod = value => ((value%256)+256)%256;
for (const keyRegister of ["index", "prime"]) {
  const weights = p55.map(value =>
    keyRegister === "index" ? value : corpus.prime[value]);
  for (const operation of ["xor", "byte-minus-rune",
    "byte-plus-rune", "rune-minus-byte"]) {
    for (const start of corners) for (const anticlockwise of [false, true]) {
      const ordered = ringOrder(start, anticlockwise);
      const output = ordered.map((source, index) => {
        const b = bytes[source], k = weights[index];
        switch(operation) {
          case "xor": return b^k;
          case "byte-minus-rune": return byteMod(b-k);
          case "byte-plus-rune": return byteMod(b+k);
          case "rune-minus-byte": return byteMod(k-b);
        }
        throw Error("Unreachable operation");
      });
      const printable = value => value>=32 && value<=126;
      let run=0, longestRun=0;
      for (const value of output) {
        run = printable(value) ? run+1 : 0;
        longestRun=Math.max(longestRun, run);
      }
      byteOptions.push({keyRegister, operation, startPerimeterOffset:start,
        anticlockwise, printableAscii:output.filter(printable).length,
        longestPrintableAsciiRun:longestRun,
        first24:output.slice(0,24).map(value =>
          printable(value) ? String.fromCharCode(value):".").join("")});
    }
  }
}
assert.equal(byteOptions.length,64);
byteOptions.sort((a,b) => b.printableAscii-a.printableAscii
  || b.longestPrintableAsciiRun-a.longestPrintableAsciiRun);
assert.equal(byteOptions[0].printableAscii,37);
assert.equal(byteOptions[0].longestPrintableAsciiRun,5);

// Historically established source-native wording of the original p56
// ciphertext, replicated by sims/authentic_lp2_p56_totient_regression.cjs.
const p56Expected = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
const gp = corpus.translit.map((token, index) => ({token, index}))
  .sort((x, y) => y.token.length-x.token.length);
const p56Known = [];
for (const word of p56Expected.split(" ")) {
  for (let i = 0; i < word.length;) {
    const found = gp.find(({token}) => word.startsWith(token, i));
    assert.ok(found, "Unexpected GP spelling in native source: "+word);
    p56Known.push(found.index);
    i += found.token.length;
  }
}
assert.equal(p56Known.length, 85);
const known = [...p56Known, ...p57Clear];
assert.equal(known.length, 180);
const innerCol = Array.from({length: 180}, (_, i) =>
  inner[(i%30)*6 + Math.floor(i/30)]);
/** Minimum inconsistent observations under an arbitrary deterministic byte->GP map. */
function lookupErrors(indices) {
  const votes = new Map();
  for (let i=0; i<known.length; i++) {
    const b = bytes[indices[i]], symbol = known[i];
    if (!votes.has(b)) votes.set(b, new Map());
    const row = votes.get(b);
    row.set(symbol, (row.get(symbol)||0)+1);
  }
  let errors = 0, clashes = 0;
  for (const row of votes.values()) {
    errors += [...row.values()].reduce((a,b)=>a+b,0)-Math.max(...row.values());
    if (row.size > 1) clashes++;
  }
  return {errors, distinctByteValues: votes.size, conflictingByteValues: clashes,
    fixedByteMod29Matches: indices.filter((position, i) => bytes[position]%29===known[i]).length};
}
const innerMaps = [
  {name:"row-major", indices: inner},
  {name:"row-major-reversed", indices:[...inner].reverse()},
  {name:"column-major", indices: innerCol},
  {name:"column-major-reversed", indices:[...innerCol].reverse()}
].map(x=>({name:x.name,...lookupErrors(x.indices)}));
assert.deepEqual(innerMaps.map(x=>x.errors), [47,49,48,49]);
// A genuine planted arbitrary fixed byte->rune mapping has zero errors.
const syntheticGP = Array.from({length: 256},(_,v)=>(v*17+5)%29);
const control = new Map();
for (let i=0;i<inner.length;i++) {
  const v=bytes[inner[i]],p=syntheticGP[v];
  if (control.has(v)) assert.equal(control.get(v),p);
  else control.set(v,p);
}
console.log(JSON.stringify({
  geometry: {originalGrid: "32x8", total: 256,
    outerPerimeter: ring.length, innerArea: inner.length,
    originalP55Runes: p55.length,
    solvedP56Runes: p56Cipher.length, solvedP57Runes: p57Clear.length,
    outerCornerSourceByteIndices: corners.map(position=>ring[position])},
  directOriginalP55: {sourceIoC: ioc(p55), modelCount: results.length,
    best: results[0], worst: results.at(-1), all: results},
  solvedP56P57InnerMapping: innerMaps,
  originalP55ByteASCII: {modelCount:byteOptions.length,
    best:byteOptions[0], worst:byteOptions.at(-1),
    minPrintableAscii:byteOptions.at(-1).printableAscii,
    maxPrintableAscii:byteOptions[0].printableAscii},
  positive: {ringInverseExact: true, ringPlantRecoveredRunes: 76,
    plantedByteToGPMappingConflicts: 0},
  interpretation: "Source geometric correspondence; no native-GP plaintext from direct shell pad and no deterministic byte->GP explanation of the inner known plaintext."
},null,2));
