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
// The source primitive field admits a canonical index-dependent
// multiplicative keystream, g^(i+48), of period 256. Test both its direct
// field multiplication and its additive-exponent interpretation against
// all original bytes with no tunable phase, key or initial vector.
const fieldMask = Array.from({length:256},(_,i)=>
  byExponent[(i+phase)%256]);
const dynamicReadouts = [];
for(const kind of ['exponent-stream','field-unit-stream']){
  const recovered = grid.bytes.map((byte,i) => kind==='exponent-stream'
    ? (exponentFor.get(byte+1)-i-phase+512)%256
    : ((byte+1)*byExponent[(256-(i+phase)%256)%256])%P-1);
  const reencoded = recovered.map((byte,i) => kind==='exponent-stream'
    ? byExponent[(byte+i+phase)%256]-1
    : ((byte+1)*fieldMask[i])%P-1);
  assert.deepEqual(reencoded,grid.bytes);
  const plantedCipher=planted.map((byte,i) => kind==='exponent-stream'
    ? byExponent[(byte+i+phase)%256]-1
    : ((byte+1)*fieldMask[i])%P-1);
  const plantRecovered=plantedCipher.map((byte,i)=>
    kind==='exponent-stream'
      ? (exponentFor.get(byte+1)-i-phase+512)%256
      : ((byte+1)*byExponent[(256-(i+phase)%256)%256])%P-1);
  assert.deepEqual(plantRecovered,planted);
  const ascii=content(recovered);
  dynamicReadouts.push({kind,originalPrintableASCII:printable(recovered),
    originalGP29ByteCount:recovered.filter(x=>x<29).length,
    first32Hex:Buffer.from(recovered.slice(0,32)).toString('hex'),
    originalASCII80:ascii.slice(0,80),
    maxAlphabeticRun:Math.max(0,...(ascii.match(/[A-Za-z]+/g)||[])
      .map(x=>x.length)),
    exactOriginalInverse256:true,plantedSolvedP57Inverse256:true});
}
assert(dynamicReadouts.every(x=>x.maxAlphabeticRun<=3));

// A 256-point Fermat/number-theoretic transform is the canonical
// full-length operation when the source words yield modulus 257 and a
// primitive 256th root 38. Test forward and inverse frequency directions,
// with the printed phase 48 only for positioning the readout.
const inverseRoots=byExponent.map((_,i)=>byExponent[(256-i)%256]);
/** @param {number[]} input @param {boolean} inverse */
function transform(input,inverse=false){
  assert.equal(input.length,256);
  const powers=inverse?inverseRoots:byExponent;
  const out=Array(256).fill(0);
  for(let k=0;k<256;k++){
    let sum=0;
    for(let i=0;i<256;i++)
      sum=(sum+input[i]*powers[(i*k)%256])%P;
    out[k]=inverse?sum*256%P:sum;
  }
  return out;
}
assert.deepEqual(transform(transform(grid.bytes),true),grid.bytes);
assert.deepEqual(transform(transform(planted),true),planted);
const finiteFourierReadouts=[];
for(const inverse of [false,true]){
  const coefficients=transform(grid.bytes,inverse);
  const restored=transform(coefficients,!inverse);
  assert.deepEqual(restored,grid.bytes);
  const rotated=coefficients.map((_,i)=>coefficients[(i+phase)%256]);
  const ascii=content(rotated);
  finiteFourierReadouts.push({
    direction:inverse?'inverse':'forward',
    printableASCII:printable(rotated),
    GP29ByteCount:rotated.filter(x=>x<29).length,
    fieldElement256Count:rotated.filter(x=>x===256).length,
    asciiFirst80:ascii.slice(0,80),
    first16FieldValues:rotated.slice(0,16),
    maxAlphabeticRun:Math.max(0,...(ascii.match(/[A-Za-z]+/g)||[])
      .map(x=>x.length)),
    exactOriginalRoundTrip256:true
  });
}
assert(finiteFourierReadouts.every(x=>x.maxAlphabeticRun<=3));

// The original numerical source is printed as 32 physical rows of
// 8 cells. GF257's 256th root 38 supplies primitive 32nd and 8th roots,
// so test all four fixed direct/inverse axis orientations of the natural
// 32x8 tensor-product Fermat transform.
/** @param {number[]} data @param {number} length
 * @param {number} exponentStep @param {boolean} inverse */
function axisTransform(data,length,exponentStep,inverse){
  const inverseFactor=length===8?225:249;
  return Array.from({length},(_,k)=>{
    let acc=0;
    for(let j=0;j<length;j++){
      const power=((inverse?-1:1)*k*j*exponentStep%256+256)%256;
      acc=(acc+data[j]*byExponent[power])%P;
    }
    return inverse?acc*inverseFactor%P:acc;
  });
}
/** @param {number[]} input @param {boolean} inverseRows
 * @param {boolean} inverseColumns */
function transform2D(input,inverseRows,inverseColumns){
  const afterColumns=Array(256).fill(0);
  for(let r=0;r<32;r++){
    const transformed=axisTransform(input.slice(8*r,8*r+8),8,32,
      inverseColumns);
    for(let c=0;c<8;c++)afterColumns[8*r+c]=transformed[c];
  }
  const afterRows=Array(256).fill(0);
  for(let c=0;c<8;c++){
    const column=Array.from({length:32},(_,r)=>afterColumns[8*r+c]);
    const transformed=axisTransform(column,32,8,inverseRows);
    for(let r=0;r<32;r++)afterRows[8*r+c]=transformed[r];
  }
  return afterRows;
}
const tensorFourierReadouts=[];
for(const inverseRows of [false,true])
  for(const inverseColumns of [false,true]){
    const transformed=transform2D(grid.bytes,inverseRows,inverseColumns);
    const original=transform2D(transformed,!inverseRows,!inverseColumns);
    assert.deepEqual(original,grid.bytes);
    const plantedCipher=transform2D(planted,inverseRows,inverseColumns);
    const plantedRestored=transform2D(plantedCipher,!inverseRows,!inverseColumns);
    assert.deepEqual(plantedRestored,planted);
    const ascii=content(transformed);
    const matches=ascii.match(/[A-Za-z]+/g)||[];
    tensorFourierReadouts.push({
      rows:inverseRows?'inverse':'forward',
      columns:inverseColumns?'inverse':'forward',
      originalPrintableASCII:printable(transformed),
      originalGP29ByteCount:transformed.filter(x=>x<29).length,
      originalFieldElement256Count:transformed.filter(x=>x===256).length,
      first48ASCII:ascii.slice(0,48),
      longestAlphabeticRun:matches.reduce((m,x)=>Math.max(m,x.length),0),
      originalExactRoundTrip:true,plantedSolvedP57RoundTrip:true
    });
  }

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
  sourceFieldStreamDecoders:dynamicReadouts,
  sourceFermatTransform:finiteFourierReadouts,
  source32x8TensorFermatTransform:tensorFourierReadouts,
  originalExactReverse256:true,
  plantedSolvedP57ExactReverse256:true,
  conclusion:'Original discrete-log, full-period field streams, two index traversals, both 256-point transforms and the four physical 32x8 field transforms return nontext and untyped data. The source algebra is a structural lead, not an authenticated cipher or plaintext.'
},null,2));
