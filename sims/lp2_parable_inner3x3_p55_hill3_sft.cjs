"use strict";
/**
 * Source-selected PARABLE inner 3x3 p50 table -> Hill3 inverse on original
 * p55 75-complete-word runes. The p57 "shed circumference" wording,
 * source 3-clause prime ordinals, and p55 75=25*3 source geometry fix
 * this one direct family. Two documented radices and both orientations.
 * Node 22, Windows CommonJS, read-only SFT.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const read = p => fs.readFileSync(path.resolve(__dirname, "..", p),"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid=JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const words=read("resources/liber-primus/lp2-transcription.txt").split("%");
const toks=grid.pages.flatMap(p=>p.tokens), q=29;
const mod=x=>(x%q+q)%q;
function inv(a){for(let j=1;j<q;j++)if(mod(a*j)===1)return j;throw Error("singular");}
function primesBelow(n){let k=0;for(let x=2;x<=n;x++){let ok=true;for(let d=2;d*d<=x;d++)if(x%d===0){ok=false;break;}if(ok)k++;}return k;}
const p57=gp.pages[57].indices;
const sums=[p57.slice(7,37),p57.slice(37,67),p57.slice(67,95)].map(a=>a.reduce((s,i)=>s+gp.prime[i],0));
assert.deepEqual(sums,[1259,1031,1229]);const ranks=sums.map(primesBelow);
assert.deepEqual(ranks,[205,173,201]);
assert.deepEqual(ranks.map(i=>[Math.floor(i/8),i%8]),[[25,5],[21,5],[25,1]]);
const corner=ranks[1]+ranks[2]-ranks[0];
assert.equal(corner,169);
const inner=Array.from({length:3},(_,r)=>Array.from({length:3},(_,c)=>toks[(22+r)*8+2+c]));
assert.deepEqual(inner,[["2k","2t","2O"],["0J","1L","0c"],["2d","1T","2u"]]);
const payload=gp.pages[55].indices;
assert.equal(payload.length,76);
assert.equal(payload[0],21);
const ciphertext=payload.slice(1);assert.equal(ciphertext.length,75);
const runeSet=new Map(gp.runes.map((x,i)=>[x,i]));
const rx=new RegExp("["+gp.runes.join("")+"]+","gu");
const wordList=[...words[54].matchAll(rx)].map(m=>[...m[0]].map(c=>runeSet.get(c)));
assert.equal(wordList.flat().length,76);
assert.equal(wordList[0].length,1);
const lengths=[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
// Two physical line-wrap joins are source words; the transcription splits them.
assert.equal(lengths.reduce((a,b)=>a+b,0),75);
const latin=gp.translit.map((str,i)=>({str,i})).sort((a,b)=>b.str.length-a.str.length);
const dictionary=new Set();
for(const m of read("resources/control/english_wordfreq_textblob.txt").matchAll(/^[A-Za-z]+/gmu)){
 const x=m[0].toUpperCase().replace(/ING/gu,"NG").replace(/K|Q/gu,"C").replace(/V/gu,"U").replace(/Z/gu,"S");
 let i=0,indices=[];
 while(i<x.length){const k=latin.find(t=>x.startsWith(t.str,i));if(!k){indices=[];break;}indices.push(k.i);i+=k.str.length;}
 if(indices.length)dictionary.add(indices.join(","));
}
assert(dictionary.size>20000);
function hits(a){
 let n=0,matched=0,offset=0,examples=[];
 for(const size of lengths){
   if(size>=4){
     n++;
     const x=a.slice(offset,offset+size);
     if(dictionary.has(x.join(","))){matched++;examples.push(x.map(i=>gp.translit[i]).join(""));}
   }
   offset+=size;
 }
 return {n,matched,examples};
}
function ioc(xs){
 const v=new Int32Array(q);
 for(const x of xs)v[x]++;
 return v.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));
}
function matrix(radix){
 const a=radix===60?grid.alphabet:grid.alphabet.replace("f","");
 assert.equal(a.length,radix);
 return inner.map(row=>row.map(token=>mod(radix*a.indexOf(token[0])+a.indexOf(token[1]))));
}
function inverseMatrix(M){
 const A=M.map((row,i)=>[...row,...[0,1,2].map(j=>+(i===j))]);
 for(let j=0;j<3;j++){
   let p=j;while(p<3&&A[p][j]===0)p++;
   if(p>=3)return null;
   if(p!==j)[A[p],A[j]]=[A[j],A[p]];
   const s=inv(A[j][j]);
   for(let k=0;k<6;k++)A[j][k]=mod(s*A[j][k]);
   for(let i=0;i<3;i++)if(i!==j){
     const t=A[i][j];
     for(let k=0;k<6;k++)A[i][k]=mod(A[i][k]-t*A[j][k]);
   }
 }
 return A.map(row=>row.slice(3));
}
function apply(a,M,orientation){
 assert.equal(a.length%3,0);
 const result=[];
 for(let i=0;i<a.length;i+=3){
  const block=a.slice(i,i+3);
  for(let j=0;j<3;j++){
    const value=orientation==="column"?M[j].reduce((s,k,l)=>s+k*block[l],0):
      M.reduce((s,row,l)=>s+block[l]*row[j],0);
    result.push(mod(value));
  }
 }
 return result;
}
const control=gp.pages[57].indices.slice(0,75);
assert.equal(control.length,75);
const scores=[];
for(const radix of [59,60]){
  const M=matrix(radix), Mi=inverseMatrix(M);
  assert(Mi);
  for(const orientation of ["column","row"]){
    const decoded=apply(ciphertext,Mi,orientation);
    assert.deepEqual(apply(decoded,M,orientation),ciphertext);
    const planted=apply(control,M,orientation);
    assert.deepEqual(apply(planted,Mi,orientation),control);
    scores.push({
      radix,orientation,key:M,inverseKey:Mi,
      originalRoundtrip:75,positiveRecovered:75,
      originalIoC:ioc(ciphertext),decodedIoC:ioc(decoded),
      longWordHits:hits(decoded),
      firstWords:(() => {let p=0;const names=[];for(const l of lengths.slice(0,9)){names.push(decoded.slice(p,p+l).map(i=>gp.translit[i]).join(""));p+=l;}return names;})(),
      decodedIndices:decoded
    });
  }
}
assert.equal(scores.length,4);
console.log(JSON.stringify({
  status:"PASS",n:75,sourceRoots:ranks,derivedCorner:corner,
  sourceInner3x3:inner,receiver:"p55 all 75 intact-body runes in 25 contiguous GP29 triplets",
  scores,
  caveat:"This is a bounded source-selected linear test, not a historical instruction to use Hill3."
},null,2));
