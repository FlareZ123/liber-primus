'use strict';
/**
 * Director #2103: fixed p28 D4->2016 DIRECTION->ROAD23 source route;
 * exact original-p23 dot-stamp 180 degree rotation -> reversed rune order;
 * authentic solved-p56 prime-totient F-transparent inverse (key start0).
 * Windows Node.js22 SFT, read-only, no key phase or cipher search.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const signed=fs.readFileSync(path.join(ROOT,'resources/historical/cicada2016-4gq25-outguess.asc'),'utf8');
const page=n=>corpus.pages.find(p=>p.page===n).indices;
const mod=x=>((x%29)+29)%29;
const p28=page(28);
assert.deepEqual(p28.slice(142,161),[
  11,14,27,0,10,18,13,28,8,0,12,3,7,28,11,12,10,28,25
]);
const words=[
 [11,14,27,0],[10,18,13,28,8],[0,12,3,7],[28,11,12,10,28,25]
];
const sums=words.map(w=>mod(w.reduce((a,b)=>a+b,0)));
const lengths=words.map(w=>w.length);
assert.deepEqual(sums,[23,19,22,27]);
assert.deepEqual(lengths,[4,5,4,6]);
const hdiff=a=>[mod(a[0]-a[3]),mod(a[1]-a[2])];
assert.deepEqual(hdiff(sums).concat(hdiff(lengths)),[25,26,27,1]);
assert.ok(/their\s+numbers\s+are\s+the\s+direction/i.test(signed));
assert.ok(/their\s+meaning\s+is\s+the\s+road/i.test(signed));
const sourceWords=(
 'HELLO THE PATH LIES EMPTY EPIPHANY SEEKS THE DEVOTED LIBER PRIMUS IS '+
 'THE WAY ITS WORDS ARE THE MAP THEIR MEANING IS THE ROAD AND THEIR '+
 'NUMBERS ARE THE DIRECTION SEEK AND YOU WILL BE FOUND GOOD LUCK '+
 'BEWARE FALSE PATHS VERIFY OPENPGP'
).split(' ');
assert.equal(sourceWords.length,43);
assert.deepEqual([25,26,27,1].map(x=>sourceWords[x]),
 ['THEIR','NUMBERS','ARE','THE']);
assert.equal(sourceWords[23],'ROAD');
assert.equal(sourceWords[29],'DIRECTION');
assert.deepEqual(sourceWords.slice(30,33),['SEEK','AND','YOU']);
/** Authenticated phi(prime)-1 schedule. @returns {number[]} */
function shifts(n){
 const v=[];for(let p=2;v.length<n;p++){
  let prime=true;for(let d=2;d*d<=p;d++)if(p%d===0){prime=false;break;}
  if(prime)v.push(p-1);
 }
 return v;
}
const PHI=shifts(500);
/** @param {number[]} plaintext @returns {number[]} */
function encrypt(plaintext){
 let k=0;return plaintext.map(p=>p===0?0:mod(p+PHI[k++]));
}
const tokens=corpus.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function encode(sentence){
 const result=[];
 for(const word of sentence.split(' ')){
  for(let i=0;i<word.length;){
   const t=tokens.find(t=>word.startsWith(t.s,i));
   assert(t,'No GP rune for '+word.slice(i));
   result.push(t.i);i+=t.s.length;
  }
 }
 return result;
}
const known=encode('AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE');
assert.equal(known.length,85);
assert.deepEqual(encrypt(known),page(56),'Solved p56 must reencrypt 85/85');
/**
 * Exact phi inverse state feasibility, branch on ambiguous ciphertext F.
 * @param {number[]} cipher
 */
function inverse(cipher){
 let states=new Map([[0,1]]);
 for(let i=0;i<cipher.length;i++){
  const next=new Map(),c=cipher[i];
  for(const [k,count] of states){
   if(c===0)next.set(k,(next.get(k)||0)+count);
   if(mod(c-PHI[k])!==0)next.set(k+1,(next.get(k+1)||0)+count);
  }
  if(next.size===0)return{survives:false,firstImpossible:i};
  states=next;
 }
 return{survives:true,firstImpossible:cipher.length,
   paths:[...states.values()].reduce((x,y)=>x+y,0)};
}
const original=page(23);
assert.equal(original.length,213);
const rotated=original.slice().reverse(); // only source-selected p23->p56 180-degree dot-stamp map
const result=inverse(rotated);
assert.deepEqual(result,{survives:false,firstImpossible:17});
const control=inverse(page(56));
assert.equal(control.survives,true);
const p57=page(57);
assert.equal(p57.length,95);
const synthetic=encrypt(p57).reverse();
const plant=inverse(synthetic.reverse());
assert.equal(plant.survives,true);
assert.equal(plant.firstImpossible,p57.length,
  'Planted p57 target must survive all 95 runes');
console.log(JSON.stringify({
 classification:'source-selected p28 route to p23 remains navigation; mirrored p56 cipher cannot decode p23',
 p28Indices:[25,26,27,1],p28Phrase:'THEIR NUMBERS ARE THE',
 signedContinuation:'DIRECTION',sourceRoadOrdinal:23,
 mirroredDots:'p23 -> p56: 180-degree rotation, 0.259252 pixel RMS (existing source gate)',
 originalPhysicalP23RuneCount:original.length,
 composedModel:'reverse entire original p23 rune stream, then solved p56 F-transparent prime-totient key start0',
 originalFirstImpossibleRune:result.firstImpossible,
 originalFullInverse:result.survives,
 authenticP56ControlRunes:known.length,
 nativeP57SyntheticControlRunes:p57.length,
 verdict:'No 100-rune plaintext; contradiction after 17 original runes. Dot geometry does not specify a different value-changing opcode.'
},null,2));
