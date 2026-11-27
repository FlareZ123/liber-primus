'use strict';
// Original LP2 p33 exact 49-word multiplicative checksum zero-mask gate.
// Does the authentic 2014 Stage7 7x7/1033 square supply cellwise products
// of one fixed, arbitrary GP-rune-value map modulo 29?
// Even noninjective maps with arbitrary numeric rune values are granted.
// The original square orientation is unknown: test all eight dihedral views.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const d=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const ink=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-ink-annotations.json'),'utf8'));
const trans=fs.readFileSync(path.join(root,'resources/liber-primus/lp2-transcription.txt'),'utf8');
const squares=fs.readFileSync(path.join(root,'resources/cicada2014-openpuff-magic-squares.txt'),'utf8');
assert.equal(d.pages[33].indices.length,214);
assert.equal(d.pages[34].indices.length,261);
const p33ink=ink.pages.find(p=>p.page===33);
assert.deepEqual(p33ink.red_spans.map(s=>[s.start,s.length]),[[0,10],[91,8]]);
const sourceRunes=new Set(d.runes), raw=trans.split('%')[33];
let offset=0,word=[],words=[];
function flush(){if(word.length){words.push(word);word=[];}}
for(const ch of raw){
 if(sourceRunes.has(ch))word.push(offset++);
 else if('-.&$'.includes(ch))flush();
}
flush();assert.equal(offset,214);
const red=new Set(p33ink.red_spans.flatMap(s=>Array.from({length:s.length},(_,i)=>s.start+i)));
const black=words.filter(w=>w.every(i=>!red.has(i))).map(w=>w.map(i=>d.pages[33].indices[i]));
assert.equal(black.length,49);
assert.equal(black.flat().length,196);
assert.deepEqual(black[48],[17]); // original p33 ends with B, no separator
assert.deepEqual(d.pages[34].indices.slice(0,2),[19,17]); // M B carry
black[48]=black[48].concat(d.pages[34].indices.slice(0,2));
assert.equal(black.flat().length,198);
const groups=squares.trim().split(/\r?\n\s*\r?\n/);
assert.equal(groups.length,3);
const M=groups[1].trim().split(/\s+/).map(Number);
assert.equal(M.length,49);
for(let k=0;k<7;k++){
 assert.equal(M.slice(k*7,k*7+7).reduce((a,b)=>a+b,0),1033);
 assert.equal(Array.from({length:7},(_,j)=>M[j*7+k]).reduce((a,b)=>a+b,0),1033);
}
const d4=[
 (i,j)=>[i,j],(i,j)=>[j,6-i],(i,j)=>[6-i,6-j],(i,j)=>[6-j,i],
 (i,j)=>[6-i,j],(i,j)=>[i,6-j],(i,j)=>[j,i],(i,j)=>[6-j,6-i]
];
function zeroGate(target){
 assert.equal(target.length,black.length);
 const nonzero=new Set();
 for(let i=0;i<target.length;i++)if(target[i]%29!==0)for(const rune of black[i])nonzero.add(rune);
 const zeroCells=target.map((value,i)=>value%29===0?i:-1).filter(i=>i>=0);
 const possibleZero=zeroCells.map(i=>black[i].filter(rune=>!nonzero.has(rune)));
 return {forcedNonzeroRuneCount:nonzero.size,zeroCells,
         zeroCellsWithNoPossibleZeroFactor:zeroCells.filter((i,j)=>possibleZero[j].length===0),
         feasibleZeroMask:possibleZero.every(candidates=>candidates.length>0)};
}
const outcomes=d4.map((morph,k)=>{
 const target=M.map((_,i)=>{const [r,c]=morph(Math.floor(i/7),i%7);return M[r*7+c];});
 const result=zeroGate(target);
 assert.equal(result.forcedNonzeroRuneCount,29);
 assert.equal(result.zeroCells.length,2);
 assert.equal(result.zeroCellsWithNoPossibleZeroFactor.length,2);
 assert.equal(result.feasibleZeroMask,false);
 return {orientation:k,...result};
});
// Positive: derive authentic native prime-valued word products from those same
// original complete 49 word shapes, under a stationary codebook.
const trueMap=d.prime.map(p=>p%29);
const generated=black.map(word=>word.reduce((a,rune)=>a*trueMap[rune]%29,1));
const positive=zeroGate(generated);
assert.equal(positive.feasibleZeroMask,true);
assert.ok(positive.zeroCells.length>0);
for(let i=0;i<black.length;i++){
 const v=black[i].reduce((a,rune)=>a*trueMap[rune]%29,1);
 assert.equal(v,generated[i]);
}
console.log(JSON.stringify({
 original:'LP2 p33 49 complete black words across p34 carry',
 target:'2014 Stage7 order7 sum1033 source square modulo29',
 orientations:outcomes,
 sourceNativePositive:{zeroCells:positive.zeroCells.length,feasible:positive.feasibleZeroMask},
 conclusion:'No stationary GP29 rune-to-GF29 multiplicative word checksum in any D4 alignment'
},null,2));