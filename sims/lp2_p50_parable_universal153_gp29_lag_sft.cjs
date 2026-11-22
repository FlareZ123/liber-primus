// Exact 153-byte universal Blum-state period => original GP29 repeated-pad gate.
// Native GP29 reference controls are sourced from independently solved Cicada text.
// Windows Node22: node sims/lp2_p50_parable_universal153_gp29_lag_sft.cjs
'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const corpus=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/lp2-corpus.json'),'utf8'));
const solved=JSON.parse(fs.readFileSync(path.join(root,'resources/external/relikd-solved-gp29-native-v1.json'),'utf8'));
const table=JSON.parse(fs.readFileSync(path.join(root,'resources/liber-primus/base60-grid.json'),'utf8'));
const runeToIndex=new Map(corpus.runes.map((x,i)=>[x,i]));
const original=corpus.pages.filter((p)=>p.page<=55&&p.indices.length).map((p)=>p.indices);
const native=solved.sections.map((section)=>({
  name:section.name,
  indices:Array.from(section.source_text).filter((ch)=>runeToIndex.has(ch)).map((ch)=>runeToIndex.get(ch))
}));
assert.equal(original.reduce((s,p)=>s+p.length,0),12956);

/**
 * @param {number[]} indices
 * @param {number} lag
 * @returns {{count:number,comparisons:number}}
 */
function matches(indices,lag){
 let count=0;
 for(let i=0;i+lag<indices.length;i++)if(indices[i]===indices[i+lag])count++;
 return {count,comparisons:Math.max(indices.length-lag,0)};
}
/** @param {{count:number,comparisons:number}[]} counts */
function aggregate(counts){
 return counts.reduce((a,b)=>({count:a.count+b.count,comparisons:a.comparisons+b.comparisons}),
   {count:0,comparisons:0});
}
const lag=153;
const originalResult=aggregate(original.map((indices)=>matches(indices,lag)));
const solvedResult=aggregate(native.map((section)=>matches(section.indices,lag)));
assert.deepEqual(originalResult,{count:161,comparisons:4836});
assert.deepEqual(solvedResult,{count:113,comparisons:1792});
const byte60=table.byte_rows.flat();
const alphabet59=table.alphabet.replace('f','');
const byte59=table.rows.flat().map((v)=>
  59*alphabet59.indexOf(v[0])+alphabet59.indexOf(v[1]));
assert.deepEqual(matches(byte60,lag),{count:0,comparisons:103});
assert.deepEqual(matches(byte59,lag),{count:0,comparisons:103});

// Demonstrate exact keystream cancellation under a changing period153
// GP29 additive key without relying on a language model or correlation fit.
const planted=native.find((x)=>x.indices.length>=300).indices.slice(0,300);
const periodKey=Array.from({length:lag},(_,i)=>(7*i*i+13*i+5)%29);
const cipher=planted.map((value,i)=>(value+periodKey[i%lag])%29);
assert.deepEqual(matches(cipher,lag),matches(planted,lag));
assert.deepEqual(cipher.map((c,i)=>(c-periodKey[i%lag]+29)%29),planted);

// Locked source-shaped reference sampling: select each original page's full
// runic length as a contiguous window of genuinely solved GP29 text.
let rng=0x2013b1a5;
/** @returns {number} */
function random(){
 rng^=rng<<13;
 rng^=rng>>>17;
 rng^=rng<<5;
 return rng>>>0;
}
const nativePool=native.map((section)=>section.indices);
const draws=2000;
const samples=[];
for(let trial=0;trial<draws;trial++){
 let eq=0,total=0;
 for(const page of original){
  const options=nativePool.filter((source)=>source.length>=page.length);
  assert.ok(options.length>0);
  const weights=options.map((source)=>source.length-page.length+1);
  const count=weights.reduce((s,v)=>s+v,0);
  let chosen=random()%count;
  let selection=options[0];
  for(let i=0;i<options.length;i++){
   if(chosen<weights[i]){selection=options[i];break;}
   chosen-=weights[i];
  }
  const start=random()%(selection.length-page.length+1);
  const result=matches(selection.slice(start,start+page.length),lag);
  eq+=result.count;
  total+=result.comparisons;
 }
 assert.equal(total,originalResult.comparisons);
 samples.push(eq);
}
samples.sort((a,b)=>a-b);
const under=samples.filter((x)=>x<=originalResult.count).length;
const mean=samples.reduce((s,x)=>s+x,0)/samples.length;
console.log(JSON.stringify({
  mathematicalPremise:'BBS with Parable modulus 1259*1031 has after-transient state period dividing 1224 bits, exactly153 octets',
  original:originalResult,
  originalRatio:originalResult.count/originalResult.comparisons,
  solvedNative:solvedResult,
  solvedNativeRatio:solvedResult.count/solvedResult.comparisons,
  note:'within-original-page lag153 comparison, no chapter-reset assumption',
  plantedPeriod153:{clear:matches(planted,lag),encrypted:matches(cipher,lag)},
  sourceShapedNativeControls:{draws,meanRepeats:mean,min:samples[0],
    q05:samples[Math.floor(draws*0.05)],median:samples[Math.floor(draws/2)],
    q95:samples[Math.floor(draws*0.95)],samplesAtOrBelowOriginal:under}
},null,2));
console.log('PASS: exact original BBS period153 native-language cancellation gate');
