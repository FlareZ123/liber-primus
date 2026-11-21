"use strict";

/**
 * Frozen authentic-p56 transparent-F inverse for p29/G quotient key on p30.
 * Precommit: workplace/agent5-p29quotient-p30-p56-transparentF-precommit.md
 * Node.js 22 / CommonJS. Exact exhaustive paths, no external dependencies.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const corpus=JSON.parse(fs.readFileSync(
  path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),
  "utf8"
));
/** @param {number} n */
const mod=(n)=>(n%29+29)%29;
/** @param {number} n */
const page=(n)=>corpus.pages.find(x=>x.page===n).indices;
/** @param {number[]} coefficients */
function divideByG(coefficients){
  const a=coefficients.slice(),out=[];
  const factor=[15,5,27];
  for(let i=0;i<=coefficients.length-factor.length;i++){
    const v=mod(a[i]*2);
    out.push(v);
    for(let j=0;j<3;j++)a[i+j]=mod(a[i+j]-v*factor[j]);
  }
  assert.deepEqual(a.slice(out.length),[0,0]);
  return out;
}

/**
 * Exhaust all legal histories under original p56 plaintext-F transparency.
 * A non-F cipher symbol can never represent plaintext F.
 * @param {number[]} ciphertext
 * @param {number[]} key
 */
function decodeAll(ciphertext,key){
  let states=[{consumed:0,plain:[]}],firstImpossible=null;
  for(let i=0;i<ciphertext.length;i++){
    const next=[];
    for(const state of states){
      if(ciphertext[i]===0){
        next.push({consumed:state.consumed,plain:state.plain.concat(0)});
      }
      if(state.consumed<key.length){
        const candidate=mod(ciphertext[i]-key[state.consumed]);
        if(candidate!==0){
          next.push({consumed:state.consumed+1,plain:state.plain.concat(candidate)});
        }
      }
    }
    states=next;
    if(states.length===0){
      firstImpossible=i;
      break;
    }
  }
  return {states,firstImpossible};
}

/**
 * P56 authentic forward F clock; plaintext F emits F without key step.
 * @param {number[]} plain
 * @param {number[]} key
 */
function encode(plain,key){
  let pos=0;
  const out=[];
  for(const value of plain){
    if(value===0){out.push(0);continue;}
    assert.ok(pos<key.length);
    out.push(mod(value+key[pos]));
    pos++;
  }
  return {ciphertext:out,consumed:pos};
}
const p29=page(29);
const p30=page(30);
const key=divideByG(p29);
assert.equal(key.length,275);
assert.equal(p30.length,263);
const p30CipherFPositions=p30.flatMap((x,i)=>x===0?[i]:[]);
assert.deepEqual(p30CipherFPositions,[70,87,107,124,144,172,175,252]);

const original=decodeAll(p30,key);
assert.equal(original.firstImpossible,13);
assert.equal(original.states.length,0);
assert.equal(p30[13],26);
assert.equal(key[13],26);
assert.equal(mod(p30[13]-key[13]),0);
assert.ok(p30.slice(0,14).every(x=>x!==0));

// Independent source-native positive control; same 275-symbol key.
const solved=page(57);
const native=Array.from({length:263},(_,i)=>solved[i%solved.length]);
const encrypted=encode(native,key);
assert.equal(encrypted.consumed,254);
const recovered=decodeAll(encrypted.ciphertext,key);
assert.equal(recovered.firstImpossible,null);
assert.equal(recovered.states.length,630);
assert.ok(recovered.states.some(x=>
  x.plain.length===native.length&&x.plain.every((v,i)=>v===native[i])
));

console.log(JSON.stringify({
  verdict:"NEGATIVE original p30 inverse is impossible under fixed historic F-transparent clock",
  p29KeyLength:key.length,
  p30Runes:p30.length,
  p30CipherFPositions,
  firstImpossibleOriginalOffsetZeroBased:original.firstImpossible,
  impossibleCipherValue:p30[13],
  sameKeyValue:key[13],
  forcedIllegalPlaintextValue:0,
  firstPossibleLiteralFOffset:p30CipherFPositions[0],
  completedOriginalCandidates:original.states.length,
  nativePlantLength:native.length,
  nativePlantCipherFCount:encrypted.ciphertext.filter(v=>v===0).length,
  nativePlantConsumedKey:encrypted.consumed,
  nativePlantCompleteCandidates:recovered.states.length,
  nativePlantRecoveredExactly:true
},null,2));
