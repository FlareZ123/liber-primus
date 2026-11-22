"use strict";
/**
 * Prospective candidate extension of 2retooz's already-published 38-block
 * 27x27 reading. The only new target data are source-published outgoing
 * block-38 constraints. Search a *source-frozen*, broad superset of next
 * original physical locations, key candidates and 3..27-rune diagonal
 * ciphertext runs. Do not choose an English target word or a handpicked
 * next coordinate. Compare to full dictionary, seeded nulls and a plant.
 *
 * Node 22: node sims/lp2_2026_public_27x27_nextblock_frozen_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const base = path.join(__dirname,"..");
const gp=JSON.parse(fs.readFileSync(path.join(base,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const text=fs.readFileSync(path.join(base,"resources/control/english_wordfreq_textblob.txt"),"utf8");
const source=gp.pages.filter(p=>p.page<3).flatMap(p=>p.indices);
assert.equal(source.length,729);
const tokens=gp.translit.map((s,i)=>({s,i})).sort((x,y)=>y.s.length-x.s.length);
const runeize=raw=>{const s=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");const out=[];for(let j=0;j<s.length;){const hit=tokens.find(x=>s.startsWith(x.s,j));if(!hit)return [];out.push(hit.i);j+=hit.s.length}return out};
const wordByIndices=new Map();
for(const line of text.split(/\r?\n/)){const m=/^([a-z]+)\s+(\d+)$/.exec(line);if(!m)continue;const runes=runeize(m[1]);if(runes.length<5||runes.length>27)continue;const key=runes.join(",");const ex=wordByIndices.get(key);if(!ex||+m[2]>ex.frequency)wordByIndices.set(key,{word:m[1],frequency:+m[2]})}
assert(wordByIndices.size>20000);
const phi=n=>{if(n<1)return null;let m=n,o=n;for(let d=2;d*d<=m;d++)if(m%d===0){o-=Math.floor(o/d);while(m%d===0)m/=d}if(m>1)o-=Math.floor(o/m);return o};
const mu=n=>{if(n<1)return null;let m=n,nf=0;for(let d=2;d*d<=m;d++)if(m%d===0){let exp=0;while(m%d===0){m/=d;exp++}if(exp>1)return 0;nf++}if(m>1)nf++;return nf%2?-1:1};
assert.equal(phi(28),12);assert.equal(phi(27),18);assert.equal(mu(6),1);assert.equal(mu(4),0);
const pos=(r,c)=>(r-1)*27+(c-1);
const grid=(array,r,c)=>array[pos(r,c)];
const keys=(array)=>{
 const out=[];
 for(let r=2;r<=26;r+=2)for(let c=2;c<=26;c+=2)
 for(let radius=2;radius<=12;radius+=2){
  if(c-radius<1||c+radius>27)continue;
  const left=grid(array,r,c-radius),center=grid(array,r,c),right=grid(array,r,c+radius);
  if(left===right||left===0||center===0||right===0)continue;
  for(const reversed of [false,true])for(const mode of ["direct","phi-center"]){
   const sourceKey=reversed?[right,center,left]:[left,center,right];
   const raw=[sourceKey[0],mode==="phi-center"?phi(sourceKey[1]):sourceKey[1],sourceKey[2]];
   if(raw.some(x=>x<1||x>28))continue;
   const sig=raw.map(x=>mu(phi(x)));
   if(sig[0]===0&&sig[1]===1&&sig[2]===0)
    out.push({r,c,radius,reversed,mode,rot:[raw[1],raw[2],raw[0]]});
  }
 }
 return out;
};
const beginnings=[];
for(let r=1;r<=27;r+=2)for(let c=2;c<=26;c+=2){
 const dr=Math.abs(r-8),dc=Math.abs(c-17),d8=Math.min(dr,dc,Math.abs(dr-dc));
 if(d8===0)beginnings.push([r,c]);
}
const paths=[];
for(const [r,c] of beginnings)for(const dr of [-1,1]){
 for(let n=3;n<=27;n+=2){
  if(r+dr*(n-1)<1||r+dr*(n-1)>27||c+(n-1)>27)break;
  paths.push(Array.from({length:n},(_,j)=>pos(r+dr*j,c+j)));
 }
}
assert(beginnings.length>0&&paths.length>0);
const uniqueWords=new Map();
/** @param {number[]} array */
function enumerate(array,{storeMatches=false}={}){
 const candidateKeys=keys(array);let attempted=0,good=0;
 const matches=storeMatches?[]:null;
 const unique=storeMatches?new Map():null;
 for(const key of candidateKeys)for(const pathPositions of paths){
  attempted++;
  const decoded=pathPositions.map((p,j)=>(array[p]-key.rot[j%3]+29)%29);
  const match=wordByIndices.get(decoded.join(","));
  if(match){good++;if(storeMatches){
   unique.set(match.word,(unique.get(match.word)||0)+1);
   if(matches.length<45)matches.push({word:match.word,freq:match.frequency,
     start:[Math.floor(pathPositions[0]/27)+1,pathPositions[0]%27+1],
     end:[Math.floor(pathPositions.at(-1)/27)+1,pathPositions.at(-1)%27+1],
     center:[key.r,key.c],radius:key.radius,orientation:key.reversed?"reversed":"forward",centerOp:key.mode});
  }}
 }
 return {sourceKeys:candidateKeys.length,sourceBeginnings:beginnings.length,
  ciphertextPaths:paths.length,candidatePairings:attempted,
  totalDictionaryHits:good,uniqueEnglishWords:unique?.size,
  matchingWords:matches,wordCounts:unique?Array.from(unique.entries()).slice(0,50):undefined};
}
const observed=enumerate(source,{storeMatches:true});
const seededShuffles=[];
for(let trial=0;trial<12;trial++){
 const arr=source.slice();let s=(0x93a37d19+trial*9176)>>>0;
 for(let i=arr.length-1;i>=1;i--){
  s^=s<<13;s^=s>>>17;s^=s<<5;
  const j=(s>>>0)%(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];
 }
 const r=enumerate(arr);seededShuffles.push({trial,keys:r.sourceKeys,attempted:r.candidatePairings,hits:r.totalDictionaryHits});
}
const plant=source.slice();
const plantedKey=keys(plant)[0], word=runeize("ABOUT");
assert.equal(word.length,5);
const path5=paths.find(v=>v.length===5 && v.length===new Set(v).size);
assert(path5);
for(let j=0;j<word.length;j++)plant[path5[j]]=(word[j]+plantedKey.rot[j%3])%29;
const planted=enumerate(plant,{storeMatches:true});
assert(planted.matchingWords.some(x=>x.word==="about"),"dictionary match failed on planted original-coordinate example");
const report={
 externalClaim:"https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption/tree/ab9d8190e60009179563ac21b2d750271c2782b3",
 input:"Original LP2 pp0–2, source 729 rune indices, unmodified",
 freeze:"Candidate after block38, source Report38 outgoing tuple: source horizontal even/even center even radius nonmirror, key-signature (0,+1,0) phase1; ciphertext diagonal begins (odd row, even col) at exact eight-ray offset0 from previous leftmost (8,17), ends odd row, length>=3, ciphertext leftmost=start",
 dictionaryWordsLength5Plus:wordByIndices.size,
 observed,seededShuffles,
 control:{plaintext:"ABOUT",count:planted.totalDictionaryHits,
  includesPlantedWord:planted.matchingWords.some(x=>x.word==="about"),
  caveat:"Plant overwrites five original ciphertext cells under a chosen source key; it is a detection control, not a new source claim."},
 interpretation:"A next original key and location remain unselected even after frozen 15-report forecast; do not retune the report or infer any unknown plaintext merely from in-sample arithmetic."
};
console.log(JSON.stringify(report,null,2));
