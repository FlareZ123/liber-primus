"use strict";
/** Original source p3-red1023 == 1033 GF2 primitive LFSR m-sequence:
 * exhaustive 1023 phases and all possible secret GP29 rune→binary maps,
 * with independent authentic binary plant, Windows Node22 CJS. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const c=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../resources/liber-primus/lp2-corpus.json"),"utf8"));
const pp=n=>c.pages.find(p=>p.page===n).indices;
assert.deepEqual(pp(3).slice(119,122),[13,23,2]);
const original=[...pp(3).slice(122),...[4,5,6,7].flatMap(pp)];
assert.equal(original.length,1023);
const modPoly=1033,step=s=>{const x=s<<1;return x&1024?x^modPoly:x;};
const states=[];const seen=new Set();let s=1;
do{assert.ok(s>0&&s<1024&&!seen.has(s));seen.add(s);states.push(s);s=step(s);}while(s!==1);
assert.equal(states.length,1023);
assert.equal(new Set(states.map(x=>x&1)).size,2);
assert.equal(states.reduce((n,x)=>n+(x&1),0),512);
/** @param {number[]} stream */
function exhaustive(stream){
 let matches=0,maxPrefix=0,winningPhase=null,maxPhase=0;
 const histogram=Array(1024).fill(0);
 for(let phase=0;phase<1023;phase++){
  const assigned=Array(29).fill(-1);
  let i=0;
  for(;i<1023;i++){
   const rune=stream[i],bit=states[(phase+i)%1023]&1;
   const prior=assigned[rune];
   if(prior!==-1 && prior!==bit)break;
   assigned[rune]=bit;
  }
  histogram[i]++;
  if(i>maxPrefix){maxPrefix=i;maxPhase=phase;}
  if(i===1023){matches++;winningPhase=phase;}
 }
 return {matches,maxPrefix,maxPhase,winningPhase,histogram};
}
const source=exhaustive(original);
assert.equal(source.matches,0,"original cannot be one fixed-rune-to-bit 1033 msequence");
const bits=states.map(x=>x&1);
const planted=bits.map(x=>x?27:5);
const control=exhaustive(planted);
assert.ok(control.matches>=1&&control.maxPrefix===1023);
assert.deepEqual([...new Set(planted)].sort((a,b)=>a-b),[5,27]);
console.log(JSON.stringify({
 source:"p3 red triad ends at offset122, p3 tail95 + p4–7 928 = original1023 runes",
 primitiveBinaryPolynomial:1033,
 polynomial:"X^10+X^3+1",
 order:states.length,
 halfOnes:512,halfZeros:511,
 theorem:"All nonzero GF2-linear observables of a primitive x generator differ only by a phase; all 1023 starting states also included. Every one of 29 rune-to-bit assignments is granted secretly and checked by repeated glyph consistency.",
 original:{sourceMatches:source.matches,maxOriginalConsistentPrefix:source.maxPrefix,maxPhase:source.maxPhase,firstImpossibleAtOrBefore:source.maxPrefix},
 planted:{binaryGPMapping:"bit0->GP5, bit1->GP27",sourceMatches:control.matches,full1023:control.maxPrefix===1023,winnerPhase:control.winningPhase},
 conclusion:"Original cannot be a static GP29 symbolwise 1033 primitive binary m-sequence under any secret rune-to-bit code or phase; dynamic state remains unexcluded",
},null,2));
