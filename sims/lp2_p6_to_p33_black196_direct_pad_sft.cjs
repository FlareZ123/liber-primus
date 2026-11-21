"use strict";
/** SFT: frozen original p6 full196 one-shot key -> original p33 black196.
 * Precommit workplace/agent5-p6-p33-black-196-rune-direct-key-precommit.md.
 * Node.js 22 CommonJS. Source-exact/read-only, no external modules.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
/** @param {string} name */
const load=name=>JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus",name),"utf8"));
const corpus=load("lp2-corpus.json");
const ink=load("lp2-ink-annotations.json");
/** @param {number} n */
const mod=n=>(n%29+29)%29;
/** @param {number} n */
const page=n=>corpus.pages.find(p=>p.page===n).indices;
/** @param {number[]} a */
function ioc(a){
  const f=Array(29).fill(0);for(const v of a)f[v]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} a */
const translit=a=>a.map(x=>corpus.translit[x]).join("");
/** @param {number[]} ciphertext @param {number[]} key */
function decodeF(ciphertext,key){
  let paths=[{j:0,plain:[],literal:[]}];
  for(let i=0;i<ciphertext.length;i++){
    const next=[];
    for(const s of paths){
      if(ciphertext[i]===0)next.push({j:s.j,plain:s.plain.concat(0),literal:s.literal.concat(i)});
      if(s.j<key.length){
        const p=mod(ciphertext[i]-key[s.j]);
        if(p!==0)next.push({j:s.j+1,plain:s.plain.concat(p),literal:s.literal});
      }
    }
    if(next.length===0)return {paths:[],firstImpossible:i,prior:paths};
    paths=next;
  }
  return {paths,firstImpossible:null,prior:[]};
}
/** @param {number[]} plaintext @param {number[]} key */
function encryptF(plaintext,key){
  let j=0;
  const ciphertext=plaintext.map(p=>p===0?0:mod(p+key[j++]));
  return {ciphertext,consumed:j};
}
const key=page(6);
assert.equal(key.length,196);
const full=page(33);
assert.equal(full.length,214);
const spans=ink.pages.find(p=>p.page===33).red_spans;
assert.deepEqual(spans.map(s=>[s.start,s.length]),[[0,10],[91,8]]);
const excluded=new Set(spans.flatMap(s=>Array.from({length:s.length},(_,i)=>s.start+i)));
const ciphertext=full.filter((_,i)=>!excluded.has(i));
assert.equal(ciphertext.length,196);
const plaintext=ciphertext.map((c,i)=>mod(c-key[i]));
assert.deepEqual(plaintext.map((p,i)=>mod(p+key[i])),ciphertext);
assert.ok(Math.abs(ioc(plaintext)-0.03296703296703297)<1e-12);
const original=decodeF(ciphertext,key);
assert.equal(original.firstImpossible,12);
assert.equal(original.prior.length,1);
assert.equal(original.prior[0].j,12);
assert.deepEqual(original.prior[0].literal,[]);
assert.equal(ciphertext[12],28);
assert.equal(key[12],28);
assert.equal(original.paths.length,0);
const native=Array.from({length:196},(_,i)=>page(57)[i%95]);
const plant=encryptF(native,key);
assert.equal(plant.consumed,190);
const recovered=decodeF(plant.ciphertext,key);
assert.equal(recovered.firstImpossible,null);
assert.equal(recovered.paths.length,612);
assert.ok(recovered.paths.some(s=>s.plain.every((p,i)=>p===native[i])));
console.log(JSON.stringify({
  verdict:"NEGATIVE original 196-rune geometry key / p33 black-body decoder",
  sourceKey:{page:6,runes:key.length},
  originalReceiver:{page:33,redSpans:spans.map(s=>[s.start,s.length]),blackRunes:ciphertext.length},
  direct:{rawIoc:ioc(ciphertext),decodedIoc:ioc(plaintext),first100:translit(plaintext.slice(0,100))},
  FClock:{firstImpossibleZeroBased:original.firstImpossible,matchingCipherAndKey:28,
    completeOriginalCandidates:original.paths.length},
  nativePlant:{cipherF:plant.ciphertext.filter(x=>x===0).length,
    completeCandidates:recovered.paths.length,recoveredExactly:true},
  exactSourceReencryption:true
},null,2));
