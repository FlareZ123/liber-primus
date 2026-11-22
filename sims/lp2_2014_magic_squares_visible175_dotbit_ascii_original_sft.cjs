"use strict";
/**
 * A source-typed binary message test: original 175 ink marks and the
 * pre-2014 three historical 5x7x5 magic squares, followed by 7-bit ASCII.
 * Node.js 22 CommonJS; read-only. No prose or key fitting is performed.
 * This is a hypothesis, not an authenticated Cicada cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT,name),"utf8");
const inventory = JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const matrices = read("resources/cicada2014-openpuff-magic-squares.txt").trim()
  .split(/\r?\n\s*\r?\n/).map(block=>block.trim().split(/\r?\n/)
    .map(line=>line.trim().split(/\s+/).map(x=>Number(x)&1)));
assert.deepEqual(matrices.map(m=>m.length),[5,7,5]);
assert(matrices.every(m=>m.every(row=>row.length===m.length)));
const sourceSquares = read("resources/cicada2014-openpuff-magic-squares.txt").trim()
  .split(/\r?\n\s*\r?\n/).map(block=>block.trim().split(/\s+/).map(Number));
assert.deepEqual(sourceSquares.map(x=>x.slice(0,Math.sqrt(x.length))
  .reduce((a,b)=>a+b,0)),[3301,1033,1033]);

const excluded = new Set([57,58,59,60,125]);
assert.equal(inventory.events.length,180);
const marks=inventory.events.filter(e=>!excluded.has(e.index));
assert.equal(marks.length,175);
const physicalDotCount=e=>e.large_mark?.dot_count
  ??(e.index===91?1:e.index===127||e.symbol==="⁚"?3:4);
const dots=marks.map(physicalDotCount);
const hist={};
for(const n of dots)hist[n]=(hist[n]||0)+1;
assert.deepEqual(hist,{"1":1,"3":5,"4":138,"10":3,"13":28});
const sourceBits=dots.map(n=>n&1);
assert.equal(sourceBits.reduce((a,b)=>a+b,0),34);
assert.equal(marks[0].rune_offset,13);
assert.equal(marks.at(-1).rune_offset,12956);

/** @param {number[][]} matrix 0/1 GF(2) square. @returns {number[][]} */
function inverse2(matrix){
  const n=matrix.length;
  const a=matrix.map((row,i)=>row.slice().concat(Array.from({length:n},(_,j)=>Number(i===j))));
  for(let col=0;col<n;col++){
    const pivot=a.findIndex((r,i)=>i>=col&&r[col]===1);
    assert(pivot>=col,"source matrix singular modulo2");
    [a[col],a[pivot]]=[a[pivot],a[col]];
    for(let i=0;i<n;i++)if(i!==col&&a[i][col])
      for(let j=col;j<2*n;j++)a[i][j]^=a[col][j];
  }
  return a.map(row=>row.slice(n));
}
const inverses=matrices.map(inverse2);
const at=(a,b,c)=>a*35+b*5+c;
/** @param {number[]} input 175 literal bits
 *  @param {number[][]} matrix GF2 5x5, 7x7 or 5x5
 *  @param {number} axis 0..2.
 */
function transformAxis(input,matrix,axis){
  const output=input.slice();
  for(let index=0;index<175;index++){
    const xyz=[Math.floor(index/35),Math.floor(index/5)%7,index%5];
    const target=xyz[axis];
    let bit=0;
    for(let i=0;i<matrix.length;i++){
      xyz[axis]=i;
      bit^=matrix[target][i]&input[at(...xyz)];
    }
    output[index]=bit;
  }
  return output;
}
/** @param {number[]} input @param {number} mask */
function decode(input,mask){
  return [0,1,2].reduce((v,axis)=>
    transformAxis(v,mask&(1<<axis)?matrices[axis]:inverses[axis],axis),input);
}
/** @param {number[]} input @param {number} mask */
function encode(input,mask){
  return [2,1,0].reduce((v,axis)=>
    transformAxis(v,mask&(1<<axis)?inverses[axis]:matrices[axis],axis),input);
}
function sevenBitOrder(bits,layout){
  if(layout==="flat")return bits.slice();
  assert.equal(layout,"middle");
  const reordered=[];
  for(let a=0;a<5;a++)for(let c=0;c<5;c++)for(let b=0;b<7;b++)
    reordered.push(bits[at(a,b,c)]);
  return reordered;
}
function inverseSevenOrder(bits,layout){
  if(layout==="flat")return bits.slice();
  assert.equal(layout,"middle");
  const out=Array(175).fill(0);
  let k=0;
  for(let a=0;a<5;a++)for(let c=0;c<5;c++)for(let b=0;b<7;b++)
    out[at(a,b,c)]=bits[k++];
  return out;
}
/** @param {number[]} bits @param {boolean} reversed */
function sevenDecode(bits,reversed){
  assert.equal(bits.length,175);
  const values=[];
  for(let i=0;i<175;i+=7){
    const word=bits.slice(i,i+7);
    if(reversed)word.reverse();
    values.push(word.reduce((value,bit)=>(value<<1)|bit,0));
  }
  return values;
}
function sevenEncode(values,reversed){
  assert.equal(values.length,25);
  const out=[];
  for(const value of values){
    assert(Number.isInteger(value)&&value>=0&&value<=127);
    const chunk=Array.from({length:7},(_,i)=>(value>>(6-i))&1);
    if(reversed)chunk.reverse();
    out.push(...chunk);
  }
  return out;
}
function inspect(values){
  const printable=values.filter(v=>v>=32&&v<=126).length;
  const ascii=values.map(v=>v>=32&&v<=126?String.fromCharCode(v):".").join("");
  const letters=values.filter(v=>v>=65&&v<=90||v>=97&&v<=122).length;
  const longestLetters=(ascii.match(/[A-Za-z]+/g)||[]).reduce((m,w)=>Math.max(m,w.length),0);
  return {printable,letters,longestLetters,ascii};
}
const results=[];
for(let mask=0;mask<8;mask++){
  const transformed=decode(sourceBits,mask);
  assert.deepEqual(encode(transformed,mask),sourceBits);
  for(const layout of ["flat","middle"])
    for(const reverseBits of [false,true])
      for(const invert of [false,true]){
        const bits=sevenBitOrder(transformed,layout).map(v=>v^Number(invert));
        const values=sevenDecode(bits,reverseBits);
        assert.deepEqual(sevenEncode(values,reverseBits),bits);
        results.push({mask,layout,reverseBits,invert,...inspect(values)});
      }
}
assert.equal(results.length,64);
results.sort((a,b)=>b.printable-a.printable||b.letters-a.letters);
// The output cannot be called plaintext from printable fractions alone.
assert(results.every(v=>v.longestLetters<12));
assert(results.every(v=>v.printable<25));
for(let mask=0;mask<8;mask++)for(const layout of ["flat","middle"])
  for(const reverseBits of [false,true])for(const invert of [false,true]){
    const phrase="WITHINTHEDEEPWEBISAPAGEOK"; // 25 characters, source-known words
    assert.equal(phrase.length,25);
    const bytes=[...phrase].map(ch=>ch.charCodeAt(0));
    const encoded=sevenEncode(bytes,reverseBits).map(v=>v^Number(invert));
    const planted=encode(inverseSevenOrder(encoded,layout),mask);
    const restored=sevenDecode(sevenBitOrder(decode(planted,mask),layout)
      .map(v=>v^Number(invert)),reverseBits);
    assert.deepEqual(restored,bytes);
  }
console.log(JSON.stringify({
  originalVisibleMarks:175,excludedNonphysicalIndices:[...excluded],
  physicalInkCounts:hist,oddDotBits:34,
  historicalSquareGF2Ranks:[5,7,5],
  interpretations:results.length,topCandidates:results.slice(0,12),
  maximumPrintable:results[0].printable,
  maximumContiguousLatinLetters:Math.max(...results.map(x=>x.longestLetters)),
  exactOriginalReencodes:8,exactNativePositivePlants:64,
  newUnknownLP2Plaintext:false,
  decision:"No independently readable 25-character seven-bit instruction in the frozen original parity/tensor family."
},null,2));
