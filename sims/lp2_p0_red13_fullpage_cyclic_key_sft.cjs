"use strict";
/** Original full p0 262-rune K13 Vigenere and true historical plaintext-F clock.
 * Precommit workplace/agent5-p0-red13-epiphany-repeat-key-fullpage-precommit.md.
 * Read-only Node.js 22 CommonJS standalone test; no packages.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
/** @param {number} x */
const mod=x=>(x%29+29)%29;
/** @param {number} n */
const page=n=>corpus.pages.find(x=>x.page===n).indices;
/** @param {number[]} symbols */
function ioc(symbols){
  const f=Array(29).fill(0);for(const x of symbols)f[x]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(symbols.length*(symbols.length-1));
}
/** @param {number[]} symbols */
const text=symbols=>symbols.map(x=>corpus.translit[x]).join("");
/**
 * @param {number[]} ciphertext
 * @param {number[]} key
 * @param {number[] | null} redCrib
 */
function decodeF(ciphertext,key,redCrib){
  let states=[{j:0,plain:[],literal:[]}];
  for(let i=0;i<ciphertext.length;i++){
    const next=[];
    for(const state of states){
      if(ciphertext[i]===0 && (redCrib===null || i>=redCrib.length || redCrib[i]===0))
        next.push({j:state.j,plain:state.plain.concat(0),literal:state.literal.concat(i)});
      const p=mod(ciphertext[i]-key[state.j%key.length]);
      if(p!==0 && (redCrib===null || i>=redCrib.length || p===redCrib[i]))
        next.push({j:state.j+1,plain:state.plain.concat(p),literal:state.literal});
    }
    if(next.length===0)return {states:[],firstImpossible:i,prior:states};
    states=next;
  }
  return {states,firstImpossible:null,prior:[]};
}
/** @param {number[]} plaintext @param {number[]} key */
function encryptF(plaintext,key){
  let j=0;
  const ciphertext=plaintext.map(p=>{
    if(p===0)return 0;
    const value=mod(p+key[j%key.length]);j++;return value;
  });
  return {ciphertext,consumed:j};
}
const C=page(0);
assert.equal(C.length,262);
const title=[18,13,10,13,8,24,9,26,15,18,18,5,15];
const key=title.map((p,i)=>mod(C[i]-p));
assert.deepEqual(key,[26,24,8,19,27,24,18,3,0,8,0,16,19]);
// Independent frozen p15 characteristic-polynomial LFSR gate on same exact key.
const sourceCharacteristic=[1,14,27,10,7];
const recurrenceResidual=Array.from({length:9},(_,i)=>mod(
  key[i+4]+sourceCharacteristic[1]*key[i+3]
  +sourceCharacteristic[2]*key[i+2]
  +sourceCharacteristic[3]*key[i+1]
  +sourceCharacteristic[4]*key[i]
));
assert.deepEqual(recurrenceResidual,[3,3,24,1,0,2,7,21,4]);
assert.ok(recurrenceResidual.some(x=>x!==0));
const direct=C.map((v,i)=>mod(v-key[i%13]));
assert.deepEqual(direct.slice(0,title.length),title);
assert.deepEqual(direct.map((p,i)=>mod(p+key[i%13])),C);
assert.ok(Math.abs(ioc(direct)-0.03477523324851569)<1e-12);
const originalTransparent=decodeF(C,key,title);
assert.equal(originalTransparent.firstImpossible,57);
assert.equal(originalTransparent.states.length,0);
assert.equal(originalTransparent.prior.length,1);
assert.equal(originalTransparent.prior[0].j,56);
assert.deepEqual(originalTransparent.prior[0].literal,[17]);
assert.equal(C[57],27);
assert.equal(key[56%13],27);
assert.equal(mod(C[57]-key[56%13]),0);
const native=title.concat(Array.from({length:249},(_,i)=>page(57)[i%95]));
const planted=encryptF(native,key);
assert.equal(planted.consumed,255);
assert.deepEqual(planted.ciphertext.slice(0,13),C.slice(0,13));
const recovered=decodeF(planted.ciphertext,key,title);
assert.equal(recovered.firstImpossible,null);
assert.equal(recovered.states.length,116);
assert.ok(recovered.states.some(s=>s.plain.every((x,i)=>x===native[i])));
console.log(JSON.stringify({
  verdict:"NEGATIVE: original p0 repeating GP29 red13 key fails exact full-body decoder",
  originalRunes:C.length,title:text(title),key,
  p15CharacteristicLfsrGate:{sourceCharacteristic,recurrenceResidual,passes:false},
  directIoc:ioc(direct),directBlackFirst120:text(direct.slice(13,133)),
  transparentF:{firstImpossibleOffset:originalTransparent.firstImpossible,
    priorFSkip:originalTransparent.prior[0].literal,
    keyIndex:56%13,cipherAndKey:27,forcedIllegalPlainF:true,completedPaths:0},
  positive:{sameAuthenticTitleCipher:true,nativePlantCompletePaths:recovered.states.length,
    recoveredNativeExactly:true},
  originalDirectForwardExact:true
},null,2));
