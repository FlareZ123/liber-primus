'use strict';
/**
 * Exact, source-typed GP29→Latin26 word-block fiber capacity.
 * The signed 2013 integer BASE29 operation and the signed 2016 "words"
 * instruction suggest a word-boundary-recoverable radix transport.
 * This script tests the original tape, without fitting secret keys or
 * discarding any original page-crossing word. It does not authenticate
 * the proposed transport as Cicada's cipher.
 *
 * Windows 11/Node.js 22:
 * node sims/lp2_wordblock_gp29_latin26_quotient_capacity_original_sft.cjs
 * Read-only and dependency-free.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {parseLP2Words}=require('./lp2_word_pages.cjs');
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const table=JSON.parse(read('resources/liber-primus/lp2-grid-256.json'));
const parsed=parseLP2Words(read('resources/lp2-transcription.txt'),55);
const runeIndex=new Map(gp.runes.map((r,i)=>[r,i]));
const words=parsed.words.map(x=>[...x.runes].map(ch=>{
  const v=runeIndex.get(ch);assert.notEqual(v,undefined);return v;
}));
const original=gp.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(words.length,2896);
assert.equal(parsed.crossPageWords,32);
assert.equal(original.length,12956);
assert.deepEqual(words.flat(),original);
assert.equal(table.bytes.length,256);

/** @param {number[]} values @param {bigint} radix @returns {bigint} */
function integer(values,radix){
  return values.reduce((n,d)=>n*radix+BigInt(d),0n);
}
/** @param {bigint} n @param {bigint} radix @param {number} len @returns {number[]} */
function fixedDigits(n,radix,len){
  const result=Array(len);
  for(let i=len-1;i>=0;i--){result[i]=Number(n%radix);n/=radix;}
  assert.equal(n,0n);return result;
}
/** @param {number} n @returns {number} */
const bits=n=>n;
// GP29 preimage fiber of one source-length L fixed Latin26 remainder:
// q can be any 0<=q< m, because q*26^L+R < 29^L.
/** @param {number[]} block */
function encodeBlock(block){
  const L=block.length;
  const X=integer(block,29n);
  const B=26n**BigInt(L);
  const R=X%B,Q=X/B;
  const m=(29n**BigInt(L)-1n-R)/B+1n;
  assert(Q>=0n&&Q<m);
  const latin=fixedDigits(R,26n,L);
  return {L,B,R,Q,m,latin,raw:block};
}
/** @param {number[][]} sourceWords @param {number} k */
function makeBlocks(sourceWords,k){
  const blocks=[];
  for(let i=0;i<sourceWords.length;i+=k)
    blocks.push(encodeBlock(sourceWords.slice(i,i+k).flat()));
  return blocks;
}
/** @param {ReturnType<typeof makeBlocks>} blocks */
function rankBlocks(blocks){
  let rank=0n,M=1n;
  for(const block of blocks){
    rank=rank*block.m+block.Q;
    M*=block.m;
  }
  assert(rank<M);
  return {rank,M};
}
/** @param {ReturnType<typeof makeBlocks>} blocks @param {bigint} rank */
function decodeBlocks(blocks,rank){
  const values=Array(blocks.length);
  for(let i=blocks.length-1;i>=0;i--){
    const block=blocks[i];
    const Q=rank%block.m;
    rank/=block.m;
    const X=Q*block.B+block.R;
    assert(X <29n**BigInt(block.L));
    values[i]=fixedDigits(X,29n,block.L);
  }
  assert.equal(rank,0n);
  return values.flat();
}
/** @param {number[]} arr @param {number} alphabet */
function stats(arr,alphabet){
  const hist=Array(alphabet).fill(0);
  arr.forEach(n=>hist[n]++);
  return {n:arr.length,ioc:hist.reduce((s,v)=>s+v*(v-1),0)
    /(arr.length*(arr.length-1)),
    top5:hist.slice().sort((a,b)=>b-a).slice(0,5).reduce((s,v)=>s+v,0)};
}
const variants=[1,2,3,4,5,8,words.length].map(k=>{
  const blocks=makeBlocks(words,k);
  const {rank,M}=rankBlocks(blocks);
  assert.deepEqual(decodeBlocks(blocks,rank),original);
  const latin=blocks.flatMap(x=>x.latin);
  const encoded=rank.toString(16).padStart(512,'0');
  const first16=encoded.slice(0,32).match(/../g).map(x=>parseInt(x,16));
  return {k,blocks:blocks.length,requiredBits:M.toString(2).length,
    exactSourceRankBits:rank.toString(2).length,
    withinTableCapacity:M<=2n**2048n,
    originalRankFitsTable:rank<2n**2048n,
    exactLiteralTable:rank<2n**2048n
      &&encoded===table.bytes.map(v=>v.toString(16).padStart(2,'0')).join(''),
    first8RankBytes:first16.slice(0,8),
    ...stats(latin,26),
    first64latin:latin.slice(0,64).map(n=>String.fromCharCode(65+n)).join('')};
});
assert.deepEqual(variants.map(x=>x.requiredBits),[2210,2065,2052,2049,2044,2042,2042]);
assert.deepEqual(variants.map(x=>x.exactSourceRankBits),[2208,2064,2051,2048,2043,2041]);
assert(variants.slice(0,4).every(x=>!x.withinTableCapacity));
assert(variants.slice(4).every(x=>x.withinTableCapacity));
assert(variants.every(x=>!x.exactLiteralTable));
const ones=makeBlocks(words,1),count={};
ones.forEach(x=>{const n=String(x.m);count[n]=(count[n]||0)+1;});
assert.deepEqual(count,{'1':866,'2':1749,'3':247,'4':32,'5':2});
const five=makeBlocks(words,5),{rank,M}=rankBlocks(five);
const hex=rank.toString(16).padStart(512,'0');
assert(rank <2n**2048n);
assert.equal(hex.length,512);
assert.equal(M.toString(2).length,2044);

// Native positive: preserve EXACT original printed word lengths by selecting
// genuine dictionary words of equal length from an independent source.
const reference=(read('resources/control/shakespeare_first300k.txt')
  .toUpperCase().match(/[A-Z]+/g)||[]);
const buckets=new Map();
for(const w of reference){
  if(!buckets.has(w.length))buckets.set(w.length,[]);
  buckets.get(w.length).push(w);
}
const counters=new Map();
const nativeWords=words.map(w=>{
  const bucket=buckets.get(w.length);
  assert(bucket?.length,'Missing genuine language word width '+w.length);
  const at=counters.get(w.length)||0;
  counters.set(w.length,at+1);
  return bucket[at%bucket.length];
});
const synthetic=[];
for(let i=0;i<nativeWords.length;i+=5){
  const joined=nativeWords.slice(i,i+5).join('');
  const L=joined.length;
  const R=integer([...joined].map(c=>c.charCodeAt(0)-65),26n);
  const B=26n**BigInt(L);
  const m=(29n**BigInt(L)-1n-R)/B+1n;
  const Q=m>1n ? m-1n : 0n;
  synthetic.push(fixedDigits(Q*B+R,29n,L));
}
const nativeBlocks=makeBlocks(synthetic,1);
const nativeWordWidths=nativeWords.map(w=>w.length);
assert.deepEqual(nativeWordWidths,words.map(w=>w.length));
const n5=makeBlocks(nativeWords.map((_,i)=>{
  let start=0;
  for(let j=0;j<i;j++) start+=nativeWordWidths[j];
  return synthetic.flat().slice(start,start+nativeWordWidths[i]);
}),5);
const {rank:nrank}=rankBlocks(n5);
assert.deepEqual(decodeBlocks(n5,nrank),synthetic.flat());
const nativeRecovered=n5.flatMap(x=>x.latin)
  .map(v=>String.fromCharCode(65+v)).join('');
assert.equal(nativeRecovered,nativeWords.join(''));
assert.deepEqual(nativeWords.map(w=>w.length),words.map(w=>w.length));
console.log(JSON.stringify({
  context:'GP29 original p0–p55, exact 2896 original printed words, 32 cross-page carries',
  tableBits:2048,
  originalSource:{words:words.length,runes:original.length,preimageMultiplicity:count,
    originalPrintedTableFirst8:table.bytes.slice(0,8)},
  variants,
  plantedNative:{n:12956,words:nativeWords.length,
    recovered:nativeRecovered.length,nonzeroRank:nrank>0n,
    exactGP29Reconstruction:true,latin26:stats([...nativeRecovered].map(c=>c.charCodeAt(0)-65),26)},
  decision:'No original linguistic plaintext. k≤4 full-fiber lossless sidecar requires >2048 bits for this original remainder; canonical k≥5 can fit its own source rank, but no literal printed-table match or creator-selected decoder.'
},null,2));
console.log('PASS: source exact full tape, lossless mixed-radix ranks, legal-fiber theorem and 12,956-Latin-letter source-native positive');
