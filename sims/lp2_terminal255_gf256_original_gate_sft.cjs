'use strict';
/**
 * Original terminal 255-body / 256-grid gate. Native GP29, no dependencies.
 * Run: node sims/lp2_terminal255_gf256_original_gate_sft.cjs
 *
 * Identifies which hypotheses survive the exact physical p54/p55 carry:
 * (1) grid as a complete GF(256) state cycle plus one sentinel;
 * (2) any fixed hidden byte-to-rune map over all 180 known terminal positions;
 * (3) any fixed hidden byte-to-GP29-additive-mask map over the same positions.
 * Tests the eight printed rectangular-shell paths and physical grid interior.
 * A stateful/operator-dependent key is outside the stated family.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
/** @param {string} p @returns {any} */
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const corpus=read('resources/liber-primus/lp2-corpus.json');
const grid=read('resources/liber-primus/lp2-grid-256.json');
const bytes=grid.bytes;
const p54=corpus.pages[54].indices;
const p55=corpus.pages[55].indices;
const p56=corpus.pages[56].indices;
const p57=corpus.pages[57].indices;
assert.deepEqual([bytes.length,p55.length,p56.length,p57.length],[256,76,85,95]);
assert.equal(corpus.translit[p55[0]],'NG');
assert.equal(p55.slice(1).length+p56.length+p57.length,255);
const byteCounts=Array(256).fill(0);
for(const b of bytes)byteCounts[b]++;
const distinct=byteCounts.filter(n=>n>0).length;
const zeros=bytes.flatMap((b,i)=>b===0?[i]:[]);
assert.equal(distinct,161);
assert.deepEqual(zeros,[192,229]);
assert.equal(byteCounts[1],0);
// Every 255-cycle of the nonzero elements of GF(256) is injective.
// Removing any one source byte leaves at most 161 distinct observations,
// rather than 255; remapping the entire byte alphabet cannot fix this.
assert(distinct<255);
assert(zeros.length>1);
/** @param {number} a @param {number} b @returns {number} */
function gfMul(a,b){
  let p=0;
  for(let bit=0;bit<8;bit++){
    if(b&1)p^=a;
    const high=a&128;
    a=(a<<1)&255;
    if(high)a^=0x1b;
    b>>=1;
  }
  return p;
}
// Positive GF(256) 255-nonzero-group plant using the established AES
// polynomial x^8+x^4+x^3+x+1 and primitive field element 0x03.
let state=1;
const group=[0];
for(let i=0;i<255;i++){group.push(state);state=gfMul(state,3);}
assert.equal(state,1);
assert.equal(new Set(group).size,256);
assert.equal(group.filter(x=>x===0).length,1);
/** @param {number} x @returns {number} */
const mod=x=>(x%29+29)%29;
/** @param {number} n @returns {number[]} */
function primes(n){
  const result=[];
  for(let v=2;result.length<n;v++){
    if(result.every(p=>p*p>v||v%p!==0))result.push(v);
  }
  return result;
}
const keyPrimes=primes(100);
let primeClock=0;
const plain56=p56.map((c,i)=>i===56?0:mod(c-(keyPrimes[primeClock++]-1)));
/** @param {string} input @returns {number[]} */
function gp(input){
  const tokens=corpus.translit.map((text,index)=>({text,index}))
    .sort((a,b)=>b.text.length-a.text.length);
  const output=[];
  for(const word of input.split(' ')){
    for(let i=0;i<word.length;){
      const token=tokens.find(t=>word.startsWith(t.text,i));
      assert(token,'Unrecognized GP token at '+word.slice(i));
      output.push(token.index);
      i+=token.text.length;
    }
  }
  return output;
}
assert.deepEqual(plain56,
  gp('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE'));
const knownPlain=plain56.concat(p57);
const knownCipher=p56.concat(p57);
const knownMask=knownCipher.map((c,i)=>mod(c-knownPlain[i]));
assert.equal(knownPlain.length,180);
assert.equal(knownMask.slice(85).filter(x=>x!==0).length,0);
/** @param {number[]} X @param {number[]} Y */
function optimalMap(X,Y){
  assert.equal(X.length,Y.length);
  const h=new Map();
  for(let i=0;i<X.length;i++){
    if(!h.has(X[i]))h.set(X[i],new Map());
    const counts=h.get(X[i]);
    counts.set(Y[i],(counts.get(Y[i])||0)+1);
  }
  const matches=[...h.values()].reduce((sum,counts)=>
    sum+Math.max(...counts.values()),0);
  return {
    distinctInputs:h.size,
    contradictions:X.length-matches,
    inconsistentByteClasses:[...h.values()].filter(m=>m.size>1).length
  };
}
const rings=[];
for(let layer=0;layer<4;layer++){
  const ring=[],top=layer,bottom=31-layer,left=layer,right=7-layer;
  for(let x=left;x<=right;x++)ring.push(8*top+x);
  for(let y=top+1;y<=bottom;y++)ring.push(8*y+right);
  for(let x=right-1;x>=left;x--)ring.push(8*bottom+x);
  for(let y=bottom-1;y>top;y--)ring.push(8*y+left);
  rings.push(ring);
}
assert.deepEqual(rings.map(r=>r.length),[76,68,60,52]);
const corners=[[0,0],[0,7],[31,7],[31,0]];
/** @param {number} corner @param {number} direction */
function shellPath(corner,direction){
  const [cy,cx]=corners[corner];
  return rings.flatMap((ring,layer)=>{
    const y=Math.max(layer,Math.min(31-layer,cy));
    const x=Math.max(layer,Math.min(7-layer,cx));
    const start=ring.indexOf(y*8+x);
    return ring.map((_,i)=>ring[(start+direction*i+ring.length*2)%ring.length]);
  });
}
const orientations=[];
for(let corner=0;corner<4;corner++){
  for(const direction of [-1,1]){
    const positions=shellPath(corner,direction);
    assert.equal(new Set(positions).size,256);
    const input=positions.slice(76).map(i=>bytes[i]);
    orientations.push({
      corner,direction,
      rune:optimalMap(input,knownPlain),
      additive:optimalMap(input,knownMask)
    });
  }
}
assert.deepEqual(orientations.map(x=>x.rune.contradictions),
  [48,50,47,48,49,51,46,50]);
assert.deepEqual(orientations.map(x=>x.additive.contradictions),
  [34,32,31,34,32,34,30,36]);
const rowMajor=[];
for(let y=1;y<31;y++)for(let x=1;x<7;x++)rowMajor.push(bytes[8*y+x]);
assert.equal(rowMajor.length,180);
const rowResult={
  rune:optimalMap(rowMajor,knownPlain),
  additive:optimalMap(rowMajor,knownMask)
};
assert.equal(rowResult.rune.contradictions,47);
assert.equal(rowResult.additive.contradictions,37);
// Fully reversible positive 256-rune native-GP encryption plant,
// with a hidden deterministic byte-to-mask codebook and all 256 source cells.
// This demonstrates that the original-input contradiction is decisive.
const path0=shellPath(0,1), mask=bytes.map(b=>(7*b+11)%29);
const naturalPlant=Array.from({length:256},(_,i)=>knownPlain[i%knownPlain.length]);
const plantCipher=naturalPlant.map((p,i)=>mod(p+mask[path0[i]]));
assert.deepEqual(
  plantCipher.map((c,i)=>mod(c-mask[path0[i]])),naturalPlant);
assert.deepEqual(
  plantCipher.map((c,i)=>mod(c-mask[path0[i]])+mask[path0[i]]).map(mod),
  plantCipher);
assert.equal(optimalMap(path0.slice(76).map(i=>bytes[i]),
  plantCipher.slice(76).map((c,i)=>mod(c-naturalPlant[i+76]))).contradictions,0);
const result={
  source:{body255:p55.length-1+p56.length+p57.length,
    inheritedRune:corpus.translit[p55[0]],fullGrid:bytes.length,
    distinctBytes:distinct,duplicateExcess:256-distinct,zeroIndices:zeros,
    byte1Present:byteCounts[1]!==0},
  claim:'Literal 255-nonzero-state GF256 cycle plus one zero sentinel impossible',
  known:{p56:plain56.length,p57:p57.length,total:knownPlain.length},
  layouts:orientations,rowMajorInterior:rowResult,
  positive:{
    gf256PrimitiveCycleDistinct:new Set(group).size,
    gp29AdditivePlantExactRoundtrip:true
  },
  outcome:'No authentic p55 plaintext or source-selected full-grid cipher recovered'
};
console.log(JSON.stringify(result,null,2));
