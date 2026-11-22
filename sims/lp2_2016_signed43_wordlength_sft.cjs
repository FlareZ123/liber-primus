"use strict";
/**
 * Frozen exact Cicada-signed 2016 43-word LP2 word-length crib.
 * Node 22; run from repository root:
 *   node sims/lp2_2016_signed43_wordlength_sft.cjs
 * No keys, guessed cipher, or new normalization conventions.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const {parseLP2Words,parseSharedCorpus}=require("./lp2_word_pages.cjs");
const root=path.resolve(__dirname,"..");
const bytes=fs.readFileSync(path.join(root,"resources/historical/cicada2016-4gq25-outguess.asc"));
const sha=crypto.createHash("sha256").update(bytes).digest("hex");
assert.equal(bytes.length,1136);
assert.equal(sha,"fe89e77519dfaca998a257ed39c2861303029de2a49183db00eea0fda3a28010");
const asc=bytes.toString("utf8");
assert(asc.startsWith("-----BEGIN PGP SIGNED MESSAGE-----\nHash: SHA1\n\nHello."));
assert(asc.includes("-----BEGIN PGP SIGNATURE-----"));
const body=asc.slice(asc.indexOf("\n\n")+2,asc.indexOf("-----BEGIN PGP SIGNATURE-----"));
/** @param {string} s @returns {string[]} */
function latinWords(s) {
  return (s.match(/[A-Za-z0-9]+/gu)||[])
    .filter(w=>/^[A-Za-z]+$/u.test(w)).map(w=>w.toUpperCase());
}
/** @param {string} word @returns {number} */
function gpLength(word) {
  return (word.match(/TH|NG|EO|OE|AE|IA|EA|[A-Z]/gu)||[]).length;
}
/**
 * @param {number[]} t @param {number[]} s
 * @returns {{span:number,word:number|null,at:number|null}}
 */
function longestExact(t,s) {
  let prior=new Uint16Array(s.length+1),next=new Uint16Array(s.length+1);
  let best={span:0,word:null,at:null};
  for(let i=0;i<t.length;i++) {
    next.fill(0);
    for(let j=0;j<s.length;j++) {
      if(t[i]!==s[j])continue;
      const n=prior[j]+1;
      next[j+1]=n;
      if(n>best.span)best={span:n,word:i-n+1,at:j-n+1};
    }
    [prior,next]=[next,prior];
  }
  return best;
}
/**
 * Frozen historical detector: six exact initial GP lengths, 40-word cap,
 * up to two later mismatches; third mismatch terminates before its position.
 * @param {number[]} t @param {number[]} s
 * @returns {Array<{span:number,errors:number,word:number,at:number}>}
 */
function fuzzy(t,s) {
  const index=new Map(),seed=6,limit=40,hits=[];
  for(let j=0;j+seed<=s.length;j++) {
    const key=s.slice(j,j+seed).join(",");
    if(!index.has(key))index.set(key,[]);
    index.get(key).push(j);
  }
  for(let i=0;i+seed<=t.length;i++) {
    for(const j of index.get(t.slice(i,i+seed).join(","))||[]) {
      let span=seed,errors=0;
      while(span<limit&&i+span<t.length&&j+span<s.length) {
        if(t[i+span]!==s[j+span]) {
          if(errors===2)break;
          errors++;
        }
        span++;
      }
      hits.push({span,errors,word:i,at:j});
    }
  }
  hits.sort((a,b)=>b.span-a.span||a.errors-b.errors||a.word-b.word||a.at-b.at);
  return hits;
}
const words=latinWords(body);
const lengths=words.map(gpLength);
assert.equal(words.length,43);
assert.equal(words[0],"HELLO");
assert.equal(words.at(-1),"OPENPGP");
const original=parseSharedCorpus();
assert.equal(original.words.length,2896);
assert.equal(original.runeCount,12956);
const target=original.words.map(w=>w.length);
// Known solved p57: 19/20 lengths match the independent Latin spelling.
// TUNNELNG versus TUNNELING explains the single mismatch at word 4.
const raw=fs.readFileSync(path.join(root,"resources/lp2-transcription.txt"),"utf8");
const known=parseLP2Words(raw.split("%")[56],1).words.map(w=>w.length);
const solved=latinWords("PARABLE LIKE THE INSTAR TUNNELING TO THE SURFACE WE MUST SHED OUR OWN CIRCUMFERENCES FIND THE DIVINITY WITHIN AND EMERGE").map(gpLength);
assert.equal(known.length,20);
assert.deepEqual(known.flatMap((n,i)=>n===solved[i]?[]:[i]),[4]);
// Same-source native 40-word positive with exactly two length edits.
const plant=lengths.slice(0,40);
plant[12]++;plant[29]++;
assert(fuzzy(plant,lengths).some(h=>h.word===0&&h.at===0&&h.span===40&&h.errors===2));
const exact=longestExact(target,lengths);
const found=fuzzy(target,lengths);
assert.deepEqual(exact,{span:6,word:1851,at:27});
assert.deepEqual(found[0],{span:8,errors:2,word:1851,at:27});
assert.equal(found.filter(h=>h.span>=11).length,0);
// Freeze the same 43 source lengths and permute order, no source replacement.
let seed=201604;
/** @returns {number} */
function random32() {seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
const nullMax=[];
for(let k=0;k<128;k++) {
  const shuffled=lengths.slice();
  for(let j=shuffled.length-1;j>0;j--) {
    const x=random32()%(j+1);
    [shuffled[j],shuffled[x]]=[shuffled[x],shuffled[j]];
  }
  nullMax.push(fuzzy(target,shuffled)[0]?.span||0);
}
nullMax.sort((a,b)=>a-b);
assert.equal(nullMax[63],8);
assert.equal(nullMax.at(-1),12);
console.log("Signed bytes:",bytes.length,"SHA-256",sha);
console.log("Signed source words:",words.length,"GP lengths:",lengths.join(","));
console.log("Original words:",original.words.length,"runes:",original.runeCount);
console.log("Positive controls: p57 19/20 matched, 40/40 planted with two mismatches recovered.");
console.log("Original maximum exact:",JSON.stringify(exact));
console.log("Original maximum fuzzy:",JSON.stringify(found[0]),"source",words.slice(27,35).join(" "));
console.log("128 fixed signed-length shuffle controls median",nullMax[63],"maximum",nullMax.at(-1));
console.log("Original >=11-word fuzzy candidates",found.filter(h=>h.span>=11).length,"; >=20-word qualified",found.filter(h=>h.span>=20).length);
console.log("SFT PASS; no unknown LP2 plaintext crib, key, or decryption.");
