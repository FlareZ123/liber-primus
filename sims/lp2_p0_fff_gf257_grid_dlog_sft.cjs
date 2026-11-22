'use strict';

/**
 * Original p0 unique FFF run -> GF257 value-map receiver on p50.
 *
 * The historical HTML 133/331 address path lands on p0 word40. The three
 * complete F-headed source words have GP-prime sums 257,295,48. Treat those
 * in printed order as prime field modulus, primitive group generator
 * 295 mod257 =38, and exponent offset48. The group has exactly 256 units,
 * matching the printed 256-byte p50 table without fitting a key/phase.
 * Test an exact reversible discrete-log byte reader against all 256
 * original bytes. No historical document independently specifies GF257.
 *
 * Windows 11 / Node.js22 CommonJS source SFT, no file writes.
 * node sims/lp2_p0_fff_gf257_grid_dlog_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname,'..');
/** @param {string} name */
const read = name => fs.readFileSync(path.join(ROOT,name),'utf8');
/** @param {string} name */
const json = name => JSON.parse(read(name));
const book = json('resources/liber-primus/lp2-corpus.json');
const grid = json('resources/liber-primus/lp2-grid-256.json');
const html = read('resources/historical/stage11-2014-index.html');
assert.equal(Number(html.match(/<title>(\d+)<\/title>/)[1]),133);
assert.equal(Number(html.match(/<div id="(\d+)">/)[1]),331);
assert.deepEqual([grid.bytes[133],grid.bytes[331%256]],[141,177]);
const words = [
  book.pages[0].indices.slice(177,183),
  book.pages[0].indices.slice(183,189),
  book.pages[0].indices.slice(189,192)
];
assert.deepEqual(words.map(w => w[0]),[0,0,0]);
assert.deepEqual(words.map(w=>w.length),[6,6,3]);
const sums = words.map(word=>word.reduce((s,i)=>s+book.prime[i],0));
assert.deepEqual(sums,[257,295,48]);
const [P,sourceG,phase] = sums;
const generator = sourceG % P;
assert.equal(generator,38);
assert.equal(grid.bytes.length,256);
assert.equal(P-1,grid.bytes.length);

// In the finite field F257, the nonzero multiplicative elements are
// {1,...,256}. Powers of 38 visit every element exactly once.
const byExponent = [];
const exponentFor = new Map();
let power = 1;
for(let i=0;i<P-1;i++){
  assert(!exponentFor.has(power),'historical source g must be primitive');
  exponentFor.set(power,i);
  byExponent.push(power);
  power=(power*generator)%P;
}
assert.equal(power,1);
assert.equal(exponentFor.size,256);
assert.equal(byExponent[128],256);
assert.equal(byExponent[256-1]*generator%P,1);

/** @param {number[]} values */
function decode(values) {
  return values.map(value => {
    assert(Number.isInteger(value)&&value>=0&&value<=255);
    return (exponentFor.get(value+1)-phase+256)%256;
  });
}
/** @param {number[]} values */
function encode(values) {
  return values.map(value => {
    assert(Number.isInteger(value)&&value>=0&&value<=255);
    return byExponent[(value+phase)%256]-1;
  });
}
assert.deepEqual(encode(decode(grid.bytes)),grid.bytes);
const planted=Array.from({length:256},(_,i)=>book.pages[57].indices[i%95]);
assert.equal(book.pages[57].indices.length,95);
assert.deepEqual(decode(encode(planted)),planted);
const output=decode(grid.bytes);
/** @param {number[]} values */
const printable=values=>values.filter(x=>x>=32&&x<=126).length;
/** @param {number[]} values */
const content=values=>values.map(x=>x>=32&&x<=126?String.fromCharCode(x):'.').join('');
// The same source primitive root also defines a unique 256-position
// permutation. Read the original printed grid in the two fixed traversal
// directions with the source phase 48. The index receiver is independent
// of the byte-value discrete-log receiver above.
const indexOrders = [
  ['forward',Array.from({length:256},(_,i)=>
    byExponent[(i+phase)%256]-1)],
  ['backward',Array.from({length:256},(_,i)=>
    byExponent[(phase-i+256)%256]-1)]
];
assert(indexOrders.every(([,order])=>new Set(order).size===256));
const indexReadouts=indexOrders.map(([direction,order])=>{
  const values=order.map(index=>grid.bytes[index]);
  // A permutation must return all original raw cells under its inverse.
  const restored=Array(256).fill(0);
  order.forEach((index,i)=>{restored[index]=values[i];});
  assert.deepEqual(restored,grid.bytes);
  const preview=content(values.slice(0,80));
  const maxAlphabeticRun=Math.max(0,...(content(values)
    .match(/[A-Za-z]+/g)||[]).map(x=>x.length));
  return {direction,asciiHead:preview,printableASCII:printable(values),
    maxAlphabeticRun,originalExactRoundTrip256:true};
});
assert(indexReadouts.every(x=>x.maxAlphabeticRun<=3));
const signatures=[
  ['PDF',[0x25,0x50,0x44,0x46]],
  ['PNG',[0x89,0x50,0x4e,0x47]],
  ['ZIP',[0x50,0x4b,0x03,0x04]],
  ['gzip',[0x1f,0x8b]],
  ['JPEG',[0xff,0xd8,0xff]]
].filter(([,sig])=>sig.every((b,i)=>output[i]===b)).map(([n])=>n);
assert.equal(signatures.length,0);
console.log(JSON.stringify({
  source:'historical HTML(133,331) -> p0 FFF 257/295/48 -> GF257 primitive generator38',
  originalP50SHA256:crypto.createHash('sha256')
    .update(Buffer.from(grid.bytes)).digest('hex'),
  sourceWordIndices:[40,41,42],
  sourceWordGp:words.map(w=>w.map(i=>book.translit[i]).join('')),
  sourcePrimeSums:sums,
  primitiveGroupSize:exponentFor.size,
  originalFirst32Hex:Buffer.from(output.slice(0,32)).toString('hex'),
  originalASCII48:content(output.slice(0,48)),
  originalPrintableASCII:printable(output),
  originalGP29ByteCount:output.filter(x=>x<29).length,
  fileHeaders:signatures,
  sourceFieldIndexTraversal:indexReadouts,
  originalExactReverse256:true,
  plantedSolvedP57ExactReverse256:true,
  conclusion:'Both 256-byte discrete-log value and source-power index readouts are nontext and untyped. The field-group source remains a structural lead, not authenticated cipher or plaintext.'
},null,2));
