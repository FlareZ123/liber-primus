'use strict';
/**
 * Original LP2 plaintext-recovery attempt under one arbitrary invertible
 * GP29 alphabet per quoted passage: preserve exact same-symbol equality
 * pattern, independent of every secret 29! substitution.
 * Searches 20 consecutive original GP runes against original-source-native
 * Gibran/Shakespeare/Emerson controls, no hand-picked crib.
 * Node22 CommonJS, read-only.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const gp=require('../resources/liber-primus/lp2-corpus.json');
const ROOT=path.join(__dirname,'..');
const read=x=>fs.readFileSync(path.join(ROOT,x),'utf8');
const srcTokens=gp.translit.map((token,n)=>({token,n})).sort((a,b)=>b.token.length-a.token.length);
function encode(s){
 const str=s.toUpperCase().replace(/QU/g,'CW').replace(/V/g,'U')
  .replace(/K/g,'C').replace(/Z/g,'S').replace(/Q/g,'C');
 const ret=[];
 for(const word of str.match(/[A-Z]+/g)||[]){
  for(let i=0;i<word.length;){
   const t=srcTokens.find(z=>word.startsWith(z.token,i));
   assert(t);
   ret.push(t.n);i+=t.token.length;
  }
 }
 return ret;
}
const refs=[
 ['Gibran','resources/control/gibran_prophet_58585.txt'],
 ['Shakespeare','resources/control/shakespeare_first300k.txt'],
 ['Emerson','resources/control/emerson_essays_2944.txt']
].map(([label,file])=>({label,gp:encode(read(file))}));
const W=20;
/** @param {number[]} a @param {number} offset */
function pattern(a,offset){
 const m=new Int8Array(29).fill(-1);
 let k=0,s='';
 for(let i=offset;i<offset+W;i++){
  const v=a[i];
  if(m[v]===-1)m[v]=k++;
  s+=String.fromCharCode(65+m[v]);
 }
 return s;
}
const index=new Map();
let queries=0;
for(const page of gp.pages.filter(x=>x.page<=55&&x.indices.length)){
 for(let i=0;i+W<=page.indices.length;i++){
  const signature=pattern(page.indices,i);
  const a=index.get(signature)||[];
  a.push({page:page.page,offset:i});
  index.set(signature,a);queries++;
 }
}
const hits=[], sourceWindows={};
for(const source of refs){
 let n=0;
 for(let i=0;i+W<=source.gp.length;i++){
  n++;
  const k=pattern(source.gp,i);
  const original=index.get(k);
  if(!original)continue;
  for(const o of original){
   if(hits.length>=200)break;
   const target=gp.pages.find(x=>x.page===o.page).indices;
   const left=target.slice(o.offset,o.offset+W);
   const right=source.gp.slice(i,i+W);
   /** @type {Map<number,number>} */
   const f=new Map(),rev=new Map();
   for(let z=0;z<W;z++){
    if(f.has(left[z]))assert.equal(f.get(left[z]),right[z]);
    else {assert(!rev.has(right[z]));f.set(left[z],right[z]);rev.set(right[z],left[z]);}
   }
   let extension=0;
   while(o.offset+W+extension<target.length&&i+W+extension<source.gp.length){
    const cipher=target[o.offset+W+extension],plain=source.gp[i+W+extension];
    if((f.has(cipher)&&f.get(cipher)!==plain)||(rev.has(plain)&&rev.get(plain)!==cipher))break;
    f.set(cipher,plain);rev.set(plain,cipher);extension++;
   }
   hits.push({page:o.page,originalOffset:o.offset,
     reference:source.label,sourceOffset:i,length:W+extension,
     shiftIndependentPattern:k,
     originalGP:left.map(x=>gp.translit[x]).join(''),
     nativeGP:right.map(x=>gp.translit[x]).join(''),
     sharedSymbols:f.size});
  }
 }
 sourceWindows[source.label]=n;
}
hits.sort((a,b)=>b.length-a.length);
const control=refs[0].gp.slice(70,70+W);
const plant=control.map(x=>(7*x+3)%29);
assert.equal(pattern(control,0),pattern(plant,0));
const corrupt=plant.slice();corrupt[0]=corrupt[1];
assert.notEqual(pattern(control,0),pattern(corrupt,0));
console.log('ORIGINAL_ANYALPHABET_KNOWNPLAINTEXT '+JSON.stringify({
 searchedOriginalRunes:12956,fullBookOriginalWindows:queries,
 originalDistinctPatterns:index.size,nativeReferenceWindows:sourceWindows,
 consecutiveRuneThreshold:W,totalMatches:hits.length,top:hits.slice(0,30),
 plant:{allTwentyMatched:true,oneCorruptionRejected:true}
}));
