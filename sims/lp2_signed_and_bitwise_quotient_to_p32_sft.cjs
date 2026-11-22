"use strict";
/**
 * SFT for original p29/p30 quotient bitwise-AND key -> untouched p32 GP29.
 * Frozen before outputs in workplace/agent5-signed-and-bitwise-p29-p30-p32-precommit.md.
 * Node.js 22, CommonJS, read-only, no dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
/** @param {number} n */
const mod29=n=>(n%29+29)%29;
/** @param {number} page */
const indices=page=>corpus.pages.find(p=>p.page===page).indices;
/** @param {number[]} p @param {number[]} g */
function divide(p,g){
  const r=p.slice(),q=[];
  const inv=Array.from({length:28},(_,i)=>i+1).find(v=>mod29(v*g[0])===1);
  assert.notEqual(inv,undefined);
  for(let i=0;i<=p.length-g.length;i++){
    const v=mod29(r[i]*inv);q.push(v);
    for(let k=0;k<g.length;k++)r[i+k]=mod29(r[i+k]-v*g[k]);
  }
  assert.deepEqual(r.slice(q.length),[0,0]);
  return q;
}
/** @param {number[]} symbols */
function ioc(symbols){
  const counts=Array(29).fill(0);
  for(const x of symbols)counts[x]++;
  return counts.reduce((a,n)=>a+n*(n-1),0)/(symbols.length*(symbols.length-1));
}
/** @param {number[]} symbols */
const render=symbols=>symbols.map(v=>corpus.translit[v]).join("");
/** @param {number[]} ciphertext @param {number[]} key */
function decodeF(ciphertext,key){
  let paths=[{j:0,plain:[],literal:[]}];
  for(let i=0;i<ciphertext.length;i++){
    const next=[];
    for(const state of paths){
      if(ciphertext[i]===0)next.push({j:state.j,plain:state.plain.concat(0),literal:state.literal.concat(i)});
      if(state.j<key.length){
        const p=mod29(ciphertext[i]-key[state.j]);
        if(p!==0)next.push({j:state.j+1,plain:state.plain.concat(p),literal:state.literal});
      }
    }
    paths=next;
    if(paths.length===0)return {paths,firstImpossible:i};
  }
  return {paths,firstImpossible:null};
}
/** @param {number[]} plaintext @param {number[]} key */
function encryptF(plaintext,key){
  let j=0;
  const text=plaintext.map(p=>{
    if(p===0)return 0;
    const c=mod29(p+key[j]);j++;return c;
  });
  return {text,j};
}
const q29=divide(indices(29),[15,5,27]);
const q30=divide(indices(30),[1,4,20]);
assert.equal(q29.length,275);
assert.equal(q30.length,261);
const key=q30.map((x,i)=>x & q29[i+14]);
const original=indices(32);
assert.equal(original.length,121);
const direct=original.map((cipher,i)=>mod29(cipher-key[i]));
assert.deepEqual(direct.map((p,i)=>mod29(p+key[i])),original);
assert.ok(Math.abs(ioc(direct)-0.03429752066115702)<1e-12);
const native=Array.from({length:121},(_,i)=>indices(57)[i%95]);
const synthetic=native.map((p,i)=>mod29(p+key[i]));
assert.deepEqual(synthetic.map((c,i)=>mod29(c-key[i])),native);
const full=decodeF(original,key);
assert.equal(full.firstImpossible,null);
assert.equal(full.paths.length,3);
assert.deepEqual(full.paths.map(x=>x.literal),[[29],[30],[42]]);
assert.ok(full.paths.every(x=>ioc(x.plain)<0.036));
const encryptedNative=encryptF(native,key);
assert.equal(encryptedNative.j,118);
const recoveredNative=decodeF(encryptedNative.text,key);
assert.equal(recoveredNative.firstImpossible,null);
assert.equal(recoveredNative.paths.length,16);
assert.ok(recoveredNative.paths.some(x=>x.plain.every((p,i)=>p===native[i])));
console.log(JSON.stringify({
  verdict:"NEGATIVE: no original p32 plaintext under precommitted bitwise-AND quotient key",
  actualKeySource:"Q29/G AND Q30/J, aligned at constant terms, original first121 key indices",
  rawIoc:ioc(original),
  directIoc:ioc(direct),
  directTransliteration:render(direct),
  originalFPositions:original.flatMap((x,i)=>x===0?[i]:[]),
  historicFCompleteCandidates:full.paths.map(x=>({literalF:x.literal,keyConsumed:x.j,ioc:ioc(x.plain),plaintext:render(x.plain)})),
  exactSourceReencryption:true,
  nativeDirectPlant:true,
  nativeHistoricFPlant:{paths:recoveredNative.paths.length,recoveredExactly:true}
},null,2));
