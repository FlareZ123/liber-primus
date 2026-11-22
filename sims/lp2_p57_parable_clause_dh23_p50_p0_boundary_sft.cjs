"use strict";

/**
 * Original p57 PARABLE prime clauses select the two opposing runes of an
 * authentic original p0 physical 2|7 word boundary using the already
 * signed 2013 DH23 K=2 and a=6 as independent p50 pointer-hop counts.
 *
 * A complete original-table residue-preserving 200k permutation control
 * charges the exact receiver and both source-selected DH clocks.
 * This program reports an ORIGINAL CIPHERTEXT RECEIVER, never a decryption.
 *
 * Windows Node.js 22 SFT:
 *   node sims/lp2_p57_parable_clause_dh23_p50_p0_boundary_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
/** @param {string} filename @returns {string} */
const read = (filename) => fs.readFileSync(path.join(root,filename),"utf8");
/** @param {number[]} xs @returns {number} */
const sum = (xs) => xs.reduce((a,b)=>a+b,0);
/** @param {number} base @param {number} exp @param {number} m @returns {number} */
function powmod(base,exp,m) {
  let r=1;
  for(let i=0;i<exp;i++)r=r*base%m;
  return r;
}
/** @param {number[]} table @param {number} start @param {number} hops @returns {number[]} */
function walk(table,start,hops) {
  const out=[start];
  for(let i=0;i<hops;i++)out.push(table[out[out.length-1]]);
  return out;
}
/** @param {number[]} table @param {number} start @param {number} hops @returns {number} */
function at(table,start,hops) {
  let p=start;
  for(let i=0;i<hops;i++)p=table[p];
  return p;
}

const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed=read("resources/external/2013-tcp-server-signed-source.md");
const message2016=read("resources/historical/cicada2016-4gq25-outguess.asc");
const originalWords=parseSharedCorpus();
assert(signed.includes("BASE29 3301"));
assert(signed.includes("p=23"));
assert(signed.includes("g=5"));
assert(signed.includes("a=6"));
assert(signed.includes("K=2"));
assert(message2016.toUpperCase().includes("EPIPHANY"));
assert(message2016.toUpperCase().includes("DEVOTED"));
const bytes=table.bytes;
const tokens=table.pages.flatMap(p=>p.tokens);
assert.equal(bytes.length,256);
assert.equal(tokens.length,256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const solved=gp.pages[57].indices;
assert.equal(solved.length,95);
const primes=gp.prime;
/** @param {number[]} ids @returns {number} */
const primeSum=(ids)=>sum(ids.map(n=>primes[n]));
// Original solved p57: red PARABLE heading7, then verse lengths 30,30,28.
const clauses=[solved.slice(7,37),solved.slice(37,67),solved.slice(67,95)];
assert.deepEqual(clauses.map(x=>x.length),[30,30,28]);
const sums=clauses.map(primeSum);
assert.deepEqual(sums,[1259,1031,1229]);
assert.equal(sums.reduce((a,b)=>a*b,1),1595277641);
const addresses=sums.map(n=>n%256);
assert.deepEqual(addresses,[235,7,205]);
// The source-signed 2013 worked-exchange operations, frozen before p0.
const p=23,g=5,a=6,b=15,B=19;
const A=powmod(g,a,p),K=powmod(B,a,p);
assert.deepEqual({p,g,a,b,A,B,K},{p:23,g:5,a:6,b:15,A:8,B:19,K:2});
assert.equal(powmod(g,b,p),B);
assert.equal(powmod(A,b,p),K);
// One original-table operation; three distinct authentic source-clause inputs.
const first=walk(bytes,addresses[0],K);
const second=walk(bytes,addresses[1],a);
const third=walk(bytes,addresses[2],1);
assert.deepEqual(first,[235,121,237]);
assert.deepEqual(second,[7,183,81,58,146,92,236]);
assert.deepEqual(third,[205,76]);
assert.deepEqual([bytes[92],bytes[121]],[236,237]);
assert.equal(gp.pages[55].indices.length,76);

// Original physical p0 words, counting both red heading words. Printed wraps
// and blank spaces must not be treated as delimiters. Do not parse guessed
// plaintext or refer to any community crib.
const p0=gp.pages[0].indices;
assert.equal(p0.length,262);
const p0Words=originalWords.byStartPage[0];
assert.equal(p0Words.length,59);
let start=0;
const physical=p0Words.map((w,i)=>{
  const entry={ordinal:i+1,start,length:w.length,end:start+w.length-1};
  start+=w.length;
  return entry;
});
const boundary=physical.findIndex((w,i)=>w.end===236 && physical[i+1]?.start===237);
assert.equal(boundary,51); // 52nd printed word, followed by 53rd
assert.deepEqual(physical.slice(boundary,boundary+2).map(x=>({
  ordinal:x.ordinal,start:x.start,length:x.length,end:x.end
})),[
  {ordinal:52,start:235,length:2,end:236},
  {ordinal:53,start:237,length:7,end:243}
]);
assert.deepEqual(p0.slice(235,244),[8,5,15,22,16,22,21,1,4]);
const oldCandidate="THE DEVOTED";
const cipherBoundary=p0.slice(235,244).map(n=>gp.translit[n]).join("");
assert.equal(cipherBoundary.length>0,true);

// Independent historic signed2016 word-address selector already pointed at
// the same boundary, and does not use the new solved p57 prime clauses.
const oldSignedPointer={EMPTY:92,EPIPHANY:121};
assert.equal(bytes[oldSignedPointer.EMPTY],236);
assert.equal(bytes[oldSignedPointer.EPIPHANY],237);

// Exact fixed original 29-residue null: preserve every original GF29
// coefficient, all historical H/G polynomial divisibilities, original
// full-byte multiset, and each p57 source clause/2013 DH value. Reassign
// only full byte values within positions sharing the same original residue.
// Every control recomputes the full graph and follows the fixed addresses.
const groups=Array.from({length:29},()=>[]);
bytes.forEach((v,i)=>groups[v%29].push(i));
const sample=bytes.slice();
let state=0x33012014;
/** @returns {number} */
function next() {
  state^=state<<13;
  state^=state>>>17;
  state^=state<<5;
  return state>>>0;
}
const trials=200000;
const count={
  firstTo237:0,secondTo236:0,
  orderedTwoSide:0,eitherSide:0,
  thirdTo76:0,orderedTwoSideAndThird:0,
  anyAdjacent:0
};
for(let n=0;n<trials;n++) {
  for(const ids of groups) {
    for(let j=ids.length-1;j>0;j--) {
      const k=next()%(j+1),left=ids[j],right=ids[k];
      [sample[left],sample[right]]=[sample[right],sample[left]];
    }
  }
  const one=at(sample,addresses[0],K);
  const two=at(sample,addresses[1],a);
  const three=at(sample,addresses[2],1);
  if(one===237)count.firstTo237++;
  if(two===236)count.secondTo236++;
  if(one===237&&two===236)count.orderedTwoSide++;
  if((one===237&&two===236)||(one===236&&two===237))count.eitherSide++;
  if(three===76)count.thirdTo76++;
  if(one===237&&two===236&&three===76)count.orderedTwoSideAndThird++;
  if(Math.abs(one-two)===1)count.anyAdjacent++;
}
assert.deepEqual(count,{
  firstTo237:7672,secondTo236:690,orderedTwoSide:21,eitherSide:68,
  thirdTo76:28647,orderedTwoSideAndThird:2,anyAdjacent:1390
});
console.log(JSON.stringify({
  source:{parableClausePrimeSums:sums,base256Addresses:addresses,
    exactId3Product:1595277641,dh23:{p,g,a,b,A,B,K},
    originalTableSha256:"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"},
  sourceWalks:{first,second,third},
  originalP0Receiver:{physicalWord52:physical[boundary],
    physicalWord53:physical[boundary+1],
    originalCipherIndices:p0.slice(235,244),
    originalTranslit:cipherBoundary,
    previousUnprovenCrib:oldCandidate,
    oldSignedWordMap:oldSignedPointer},
  fixedResidueNull:{trials,seed:"0x33012014",count,
    addOneFractions:Object.fromEntries(Object.entries(count)
      .map(([key,v])=>[key,(v+1)/(trials+1)]))},
  conclusion:"Source-selected physical p0 2|7 boundary 236|237 by p57 two distinct prime clauses and signed DH hop counts. No unknown plaintext or general cipher recovered."
},null,2));
