/**
 * Source-selected p47->p23 state-line transfer under authentic solved-p56 semantics.
 * Node.js 22 / CommonJS, read-only.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources','liber-primus','lp2-corpus.json'),'utf8'));
const transcription=fs.readFileSync(path.join(root,'resources','transcriptions','lp2-image-corrected.txt'),'utf8');
const mod=(v)=>((v%29)+29)%29;
function isPrime(n){if(n<2)return false;for(let d=2;d*d<=n;d+=1)if(n%d===0)return false;return true;}
function nthPrime(rank){let count=0;for(let n=2;;n+=1){if(!isPrime(n))continue;if(++count===rank)return n;}}
function T(cardinal){return mod(nthPrime(cardinal)-1);}
const pages=transcription.split('%').map(p=>p.trim()).filter(Boolean);
const words=pages[23].split('/').map(l=>l.replace(/\s+/g,'').trim()).filter(Boolean)[0].split(/[-.]/).filter(Boolean);
const lengths=words.map(w=>[...w].length);
assert.deepEqual(lengths,[2,6,3,5,4]);
const key=lengths.map(T);
assert.deepEqual(key,[2,12,4,10,6]);
const p23=corpus.pages.find(p=>p.page===23);
const start=lengths.reduce((a,b)=>a+b,0);
assert.equal(start,20);
const body=p23.indices.slice(start);
assert.equal(body.length,193);
function inverseStates(cipher,shifts){
  let states=[{keyIndex:0,plain:[]}],trace=[];
  for(let i=0;i<cipher.length;i+=1){
    const C=cipher[i],next=[];
    for(const st of states){
      if(C===0)next.push({keyIndex:st.keyIndex,plain:[...st.plain,0]});
      const k=shifts[st.keyIndex%shifts.length],P=mod(C-k);
      if(P!==0)next.push({keyIndex:st.keyIndex+1,plain:[...st.plain,P]});
    }
    trace.push({offset:i,cipher:C,before:states.length,after:next.length});
    states=next;
    if(states.length===0)break;
  }
  return {states,trace};
}
const original=inverseStates(body,key);
assert.equal(original.states.length,0);
assert.equal(original.trace.length,7);
assert.deepEqual(original.trace.at(-1),{offset:6,cipher:12,before:1,after:0});
const prefix=body.slice(0,6).map((C,i)=>mod(C-key[i%key.length]));
assert.deepEqual(prefix,[11,24,15,18,6,9]);
function encrypt(plain,shifts){
  let j=0;
  return plain.map(P=>{
    if(P===0)return 0;
    const C=mod(P+shifts[j%shifts.length]);
    j+=1;
    return C;
  });
}
const native=corpus.pages.find(p=>p.page===57).indices;
assert.equal(native.length,95);
const control=inverseStates(encrypt(native,key),key);
assert.equal(control.trace.length,native.length);
assert(control.states.some(st=>st.plain.length===native.length&&st.plain.every((v,i)=>v===native[i])));
const output={
  hypothesis:'p47-predicted p23 line -> T(cardinals) -> repeating solved-p56 shifts on following p23 text',
  line1Lengths:lengths,key,receiver:{page:23,startRuneOffset:start,length:body.length},
  authenticInverse:'P=C-k mod29; plaintext F=0 is transparent and does not consume key',
  decodedPrefixGP0:prefix,decodedPrefixTranslit:prefix.map(v=>corpus.translit[v]).join(''),
  collapse:original.trace.at(-1),
  nativeP57Plant:{runes:native.length,completeLegalPaths:control.states.length,containsOriginalPlaintext:true},
  conclusion:'rejected'
};
console.log(JSON.stringify(output,null,2));
fs.writeFileSync(path.join(process.env.RUNNER_TEMP||process.cwd(),'source-test-output.json'),JSON.stringify(output,null,2)+'\n');
