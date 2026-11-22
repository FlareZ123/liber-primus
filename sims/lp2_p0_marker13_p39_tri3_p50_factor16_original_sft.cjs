'use strict';
/**
 * LP2 source-linked 13+3=16 proposed state, exact F16-table-factor gate.
 *
 * First-party visible operands:
 *  p0's 13-dot original marker and a 13-rune K13 local title key candidate;
 *  p39's three red GP rune indices; p49–p51's source 256-digit table has
 *  a known monic degree16 factor F16 in GF(29).
 *
 * The bridge "concatenate 13 and 3, then run a GF29 recurrence" is a
 * speculative human solve-path, never a first-party supplied instruction.
 * Test 16 source-natural, fully specified, reversible registers:
 * two seed orders; native vs reciprocal coefficient direction;
 * seed-at-output vs generated-after-seed key clock; both additive signs.
 * No phase/key fitting, no altered ciphertext, no alternate 13-word crib.
 *
 * Windows Node22 CommonJS, read only, sourced from checked-in data.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const corpus=load('resources/liber-primus/lp2-corpus.json');
const grid=load('resources/liber-primus/lp2-grid-256.json');
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length);
const cipher=pages.flatMap(p=>p.indices);
const p0=corpus.pages.find(p=>p.page===0).indices;
const p39=corpus.pages.find(p=>p.page===39).indices;
const p57=corpus.pages.find(p=>p.page===57).indices;
const mod=x=>((x%29)+29)%29;
assert.equal(cipher.length,12956);
assert.equal(p0.length,262);
assert.equal(p39.length,240);
assert.deepEqual(p39.slice(119,122),[27,5,15]);
assert.equal(grid.bytes.length,256);
assert.equal(crypto.createHash('sha256').update(Buffer.from(grid.bytes)).digest('hex'),
 '3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290');
const F16=[13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1];
const P=grid.bytes.slice(1).map(x=>mod(28*x)).reverse();
const remainder=P.slice();
for(let i=238;i>=0;i--){
  const q=remainder[16+i];
  for(let j=0;j<F16.length;j++)remainder[i+j]=mod(remainder[i+j]-q*F16[j]);
}
assert.ok(remainder.slice(0,16).every(v=>v===0));
const K13=[26,24,8,19,27,24,18,3,0,8,0,16,19];
const G3=p39.slice(119,122);
assert.equal(K13.length+G3.length,16);
const p0LocalCandidate=[18,13,10,13,8,24,9,26,15,18,18,5,15]; // EPIPHANY SEEKS
assert.deepEqual(p0.slice(0,13).map((v,i)=>mod(v-K13[i])),p0LocalCandidate);
function monic(asc){
 const inv=Array.from({length:29},(_,i)=>i).find(i=>mod(i*asc.at(-1))===1);
 assert.ok(inv);
 return asc.map(v=>mod(v*inv));
}
const factors={native:F16,reciprocal:monic(F16.slice().reverse())};
assert.ok(Object.values(factors).every(f=>f.length===17&&f.at(-1)===1));
/**
 * @param {number[]} seed complete state
 * @param {number[]} factor ascending monic coefficient vector
 * @param {number} n including initial seed
 * @returns {number[]}
 */
function expand(seed,factor,n){
 const state=seed.slice(),degree=factor.length-1;
 assert.equal(state.length,degree);
 for(let t=degree;t<n;t++){
   let next=0;
   for(let j=0;j<degree;j++)next-=factor[j]*state[t-degree+j];
   state.push(mod(next));
 }
 return state;
}
function ioc(xs){
 const counts=Array(29).fill(0);
 for(const v of xs)counts[v]++;
 return counts.reduce((a,c)=>a+c*(c-1),0)/(xs.length*(xs.length-1));
}
let p40start=0,p53end=0,cursor=0;
for(const p of pages){
 if(p.page===40)p40start=cursor;
 cursor+=p.indices.length;
 if(p.page===53)p53end=cursor;
}
assert.equal(p53end-p40start,3008);
const originalClear=Array.from({length:cipher.length},(_,i)=>p57[i%95]);
const outcomes=[];
for(const [seedName,seed] of Object.entries({
 marker13_then_p39red3:K13.concat(G3),
 p39red3_then_marker13:G3.concat(K13)
})){
 for(const [factorName,factor] of Object.entries(factors)){
  const entire=expand(seed,factor,cipher.length+16);
  for(const [clockName,key] of Object.entries({
   state_from_first_rune:entire.slice(0,cipher.length),
   after_all_16_seed_runes:entire.slice(16,cipher.length+16)
  })){
   for(const sign of [-1,1]){
    const decoded=cipher.map((v,i)=>mod(v+sign*key[i]));
    assert.ok(decoded.every((v,i)=>mod(v-sign*key[i])===cipher[i]));
    const planted=originalClear.map((v,i)=>mod(v-sign*key[i]));
    assert.deepEqual(planted.map((v,i)=>mod(v+sign*key[i])),originalClear);
    const prefix=decoded.slice(0,70).map(i=>corpus.translit[i]).join(' ');
    outcomes.push({seed:seedName,factor:factorName,clock:clockName,sign,
      fullIoC:ioc(decoded),p0IoC:ioc(decoded.slice(0,262)),
      p40_53IoC:ioc(decoded.slice(p40start,p53end)),
      p0Red13:decoded.slice(0,13).map(i=>corpus.translit[i]).join(''),
      p0BlackFirst80:decoded.slice(13,93).map(i=>corpus.translit[i]).join(' '),
      p40_53First40:decoded.slice(p40start,p40start+40).map(i=>corpus.translit[i]).join(' '),
      sourceNativeRecovered:originalClear.length
    });
   }
  }
 }
}
assert.equal(outcomes.length,16);
assert.ok(outcomes.find(o=>o.seed==='marker13_then_p39red3'&&
 o.factor==='native'&&o.clock==='state_from_first_rune'&&o.sign===-1)
 .p0Red13.startsWith('EPIPHANYSEE'));
const best=outcomes.slice().sort((a,b)=>b.fullIoC-a.fullIoC)[0];
console.log(JSON.stringify({source:{
 ciphertextRunes:cipher.length,p0RuneCount:262,p39RedRunes:G3,
 p50Degree16:F16, p50KnownFactor:true,p0CandidateKey:K13,
 testedFixedRegisters:outcomes.length
},rawOriginalIoC:ioc(cipher),realSolvedP57IoC:ioc(p57),
 bestByFullIoC:best,
 all:outcomes,
 interpretation:'Original p0 K13 remains a retrospective local candidate; state concatenation and F16 recurrence are independent hypotheses, not author evidence.',
 decision:best.fullIoC>0.05?'Investigate original independent holdout coherent prose':
  'No whole-ciphertext native GP plaintext from the complete fixed 13+3/F16 family'
},null,2));
