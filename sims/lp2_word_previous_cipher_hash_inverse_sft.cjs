"use strict";

/**
 * Source-bounded word-to-word keyed cipher inverse.
 *
 * Clue premise: the signed 2016 instruction says the manuscript's WORDS are
 * the map; solved p56 specifies a hash-linked final destination.
 * Hypothesis: each completed printed *ciphertext* word deterministically
 * supplies the next word's key via a standard SHA-256 or SHA-512 digest.
 *
 * No learned secret keys, page addresses, phase offsets, dictionary cribs,
 * hidden punctuation, or re-fitted hashing schemes. The 32 alternatives are
 * declared below. All use original complete cross-page words and unchanged
 * rune order.
 *
 * Tested direct rune arithmetic: P=(C +/- Hbyte) mod29.
 * Tested anti-repeat reading: for within-word nonzero C-Cprev,
 * P=(C-Cprev-1 +/- Hbyte) mod28, and for zero steps P=EA.
 * The latter is a *candidate* rejection/escape convention; the original does
 * not authorize it. The initial rune on each word under this model uses
 * the source-visible previous ciphertext rune, including at word start.
 *
 * Run: node sims/lp2_word_previous_cipher_hash_inverse_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const crypto=require("node:crypto");
const path=require("node:path");
const {parseLP2Words}=require("./lp2_word_pages.cjs");

const ROOT=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(ROOT,name),"utf8");
const db=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const doc=parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
const unknown=doc.words.map(w=>[...w.runes].map(c=>db.runes.indexOf(c)));
assert.equal(doc.words.length,2896);
assert.equal(doc.runeCount,12956);
assert(unknown.every(w=>w.length&&w.every(v=>v>=0)));
const wordsTotal=unknown.reduce((s,w)=>s+w.length,0);
assert.equal(wordsTotal,12956);
const maxWord=Math.max(...unknown.map(w=>w.length));

const mod=(n,m)=>(n%m+m)%m;
/** @param {number[]} a @param {string} representation @returns {Buffer} */
function serialize(a,representation){
  if(representation==="ordinal")return Buffer.from(a);
  if(representation==="runes")return Buffer.from(a.map(x=>db.runes[x]).join(""),"utf8");
  if(representation==="latin")return Buffer.from(a.map(x=>db.translit[x]).join(""),"ascii");
  if(representation==="primes")return Buffer.from(a.map(x=>db.prime[x]).join(","),"ascii");
  throw Error("Unsupported serializer");
}
/** @param {number[]} prev @param {string} representation @param {string} digest */
function key(prev,representation,digest){
  return [...crypto.createHash(digest).update(serialize(prev,representation)).digest()];
}
/**
 * @param {number[][]} cipher
 * @param {{representation:string,digest:string,mode:string,sign:number}} opt
 */
function inverse(cipher,opt){
  const out=[cipher[0].slice()];
  for(let w=1;w<cipher.length;w++){
    const source=cipher[w-1];
    const keyBytes=key(source,opt.representation,opt.digest);
    const segment=cipher[w];
    const plain=[];
    for(let j=0;j<segment.length;j++){
      const pad=keyBytes[j%keyBytes.length];
      if(opt.mode==="add"){
        plain.push(mod(segment[j]+opt.sign*(pad%29),29));
      }else{
        const prev=j?segment[j-1]:source[source.length-1];
        const delta=mod(segment[j]-prev,29);
        plain.push(delta===0?28:mod(delta-1+opt.sign*(pad%28),28));
      }
    }
    out.push(plain);
  }
  return out;
}
/**
 * @param {number[][]} plain
 * @param {{representation:string,digest:string,mode:string,sign:number}} opt
 */
function forward(plain,opt){
  const out=[plain[0].slice()];
  for(let w=1;w<plain.length;w++){
    const source=out[w-1],keyBytes=key(source,opt.representation,opt.digest);
    const segment=[];
    for(let j=0;j<plain[w].length;j++){
      const pad=keyBytes[j%keyBytes.length];
      if(opt.mode==="add"){
        segment.push(mod(plain[w][j]-opt.sign*(pad%29),29));
      }else{
        const prev=j?segment[j-1]:source[source.length-1];
        const p=plain[w][j];
        segment.push(p===28?prev:mod(prev+1+mod(p-opt.sign*(pad%28),28),29));
      }
    }
    out.push(segment);
  }
  return out;
}
/** @param {number[]} a */
function ioc(a){
  const counts=Array(29).fill(0);
  for(const s of a)counts[s]++;
  return counts.reduce((v,n)=>v+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a */
function preview(a){
  return a.slice(0,120).map(i=>db.translit[i]).join("");
}
const opts=[];
for(const digest of ["sha256","sha512"])
for(const representation of ["ordinal","runes","latin","primes"])
for(const mode of ["add","rank28"])
for(const sign of [-1,1])
  opts.push({digest,representation,mode,sign});
assert.equal(opts.length,32);

const source=unknown.slice(1).flat();
const rawIoC=ioc(source);
const records=[];
for(const opt of opts){
  const got=inverse(unknown,opt);
  const decoded=got.slice(1).flat();
  assert.equal(decoded.length,source.length);
  assert.deepEqual(forward(got,opt),unknown);
  const allRecords={
    ...opt,ioc:ioc(decoded),
    first120:preview(decoded)
  };
  records.push(allRecords);
}
records.sort((a,b)=>b.ioc-a.ioc);
assert.equal(rawIoC>0.03&&rawIoC<0.04,true);

// Positive control with natural GP text from already solved PARABLE,
// repeated to fill all original source-word lengths. The *source* first
// word is fixed to original, and remaining words are generated as prose.
// Inverse must exactly reconstruct all subsequent native GP rune symbols
// and forward must exactly match the generated source ciphertext.
const natural=db.pages.find(p=>p.page===57).indices;
assert.equal(natural.length,95);
const plant=[unknown[0].slice()];
let ix=0;
for(let j=1;j<unknown.length;j++){
  const x=[];
  for(let k=0;k<unknown[j].length;k++)x.push(natural[(ix++)%natural.length]);
  plant.push(x);
}
assert.equal(plant.reduce((s,w)=>s+w.length,0),12956);
for(const opt of opts){
  const encrypted=forward(plant,opt);
  const redec=inverse(encrypted,opt);
  assert.deepEqual(redec,plant);
}
const referenceIoC=ioc(plant.slice(1).flat());
assert(referenceIoC>0.055);
assert(records[0].ioc<0.045);
console.log(JSON.stringify({
  observed: {words:unknown.length,runes:wordsTotal,maxWord,
    sourceCiphertextIoC:rawIoC},
  signed2016WordClue:"words are the map, numbers are the direction",
  frozenOptions:opts.length,
  family:"previous ciphertext word SHA256/SHA512 derived arithmetic or rank28 step",
  best:records.slice(0,12),
  iocRange:[Math.min(...records.map(x=>x.ioc)),records[0].ioc],
  independentPositive:{decodedSourceRuneCount:12956,
    exactForwardInverseModels:opts.length,
    authenticSolvedP57RuneIoC:referenceIoC},
  decision:"No plain-GP English recovered under these 32 fixed source-adjacent hash-chain models; lack of native rune concentration excludes these bounded direct readings.",
  limitations:"Source gives no instruction to hash each preceding ciphertext word, choose representation, or use byte-mod29 key digits. Other hash inputs, clocks, stateful ciphers and genuine external keys untested."
},null,2));
