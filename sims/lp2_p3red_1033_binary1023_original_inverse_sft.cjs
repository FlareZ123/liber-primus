"use strict";
/** Agent8 original source p3-red → p7 1023-rune interval; cuneiform 1033
 * defines x^10+x^3+1 primitive GF2 LFSR. All 1023 seeds, two GP29
 * readouts, and source-conditioned GP28 no-repeat decoder. Windows Node22. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const src=corpus.pages.find(p=>p.page===3).indices;
const scroll=[...src.slice(122),...[4,5,6,7].flatMap(n=>corpus.pages.find(p=>p.page===n).indices)];
assert.deepEqual([3,4,5,6,7].map(n=>corpus.pages.find(p=>p.page===n).indices.length),[217,261,263,196,208]);
assert.equal(scroll.length,1023);
assert.deepEqual(src.slice(119,122),[13,23,2]);
const triadSeed=(13*29*29+23*29+2)%1023;
const binarySeed=13*32+23;
assert.equal(binarySeed,439);
assert.equal(triadSeed,349);
const poly=1033;
assert.equal(poly,(1<<10)|(1<<3)|1);
const step=s=>{let v=s<<1;return (v&1024)?(v^poly):v;};
let cur=1;const states=[],seen=new Set();
do{assert.ok(cur>0&&cur<1024&&!seen.has(cur));states.push(cur);seen.add(cur);cur=step(cur);}while(cur!==1);
assert.equal(states.length,1023);
assert.equal(seen.size,1023);
assert.equal(step(states[1022]),1);
const mod=(n,q)=>((n%q)+q)%q;
const phaseOf=new Map(states.map((v,i)=>[v,i]));
const seedPhase=s=>phaseOf.get(s);
const spell=x=>x.map(v=>corpus.translit[v]).join("");
function ioc(x){const f=Array(29).fill(0);for(const v of x)f[v]++;return f.reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1));}
function transform(text,phase,mode,sign,forward){
 const out=[], N=text.length;
 let prev=src[121];
 for(let i=0;i<N;i++){
  const s=states[(phase+i)%1023];
  let v;
  if(mode==="index29"||mode==="high5"){
   const k=mode==="index29"?s%29:(s>>5)%29;
   v=mod(text[i]+(forward?-sign:sign)*k,29);
  } else {
   const k=s%28;
   if(forward){
    v=text[i]===28?prev:mod(prev+1+mod(text[i]-sign*k,28),29);
   }else{
    const d=mod(text[i]-prev,29);
    v=d===0?28:mod(d-1+sign*k,28);
   }
  }
  out.push(v);
  prev=forward?v:text[i];
 }
 return out;
}
const test=corpus.pages.find(p=>p.page===57).indices;
assert.equal(test.length,95);
const genuine=Array.from({length:1023},(_,i)=>test[i%test.length]);
const results=[];
for(const mode of ["index29","high5","successor28"]){
 for(const sign of [-1,1]){
  const all=[];
  for(let phase=0;phase<1023;phase++){
   const dec=transform(scroll,phase,mode,sign,false);
   all.push({phase,ioc:ioc(dec)});
  }
  all.sort((a,b)=>b.ioc-a.ioc);
  const best=all[0];
  const fixed=all.find(x=>x.phase===seedPhase(binarySeed));
  const triad=all.find(x=>x.phase===seedPhase(triadSeed));
  const original=transform(scroll,best.phase,mode,sign,false);
  assert.deepEqual(transform(original,best.phase,mode,sign,true),scroll);
  const truePhase=seedPhase(binarySeed);
  const cipherPlant=transform(genuine,truePhase,mode,sign,true);
  const plainPlant=transform(cipherPlant,truePhase,mode,sign,false);
  assert.deepEqual(plainPlant,genuine);
  assert.ok(ioc(plainPlant)>0.04);
  results.push({
   mode,sign,
   maxOriginalIoC:best.ioc,
   bestOriginalPhase:best.phase,
   bestSourceSeed439IoC:fixed.ioc,
   otherSourceSeed349IoC:triad.ioc,
   topFive:all.slice(0,5),
   bestOriginalPrefix:spell(original.slice(0,180)),
   originalUntouchedLast200IoC:ioc(original.slice(-200)),
   solvedNativePlantIoC:ioc(plainPlant),
   originalFullReencryption:"1023/1023",
   plantedNativeRecovery:"1023/1023"
  });
 }
}
const sourceRawIoC=ioc(scroll);
console.log(JSON.stringify({
 originalSource:"LP2 physical p3 red triad local119..121, tail p3 local122..216 + complete p4-7, 1023 runes",
 laterPrintedNumber1033:"0b10000001001, primitive x^10+x^3+1 over GF2",
 period:states.length,
 rubySource:[13,23,2],
 sourceSeedCandidate439:seedPhase(binarySeed),
 sourceSeedCandidate349:seedPhase(triadSeed),
 originalRawIoC:sourceRawIoC,
 fullyExhaustiveSeedCount:1023,
 results,
 conclusion:"Conditional original-cipher result for source-typed binary LFSR model; no authentic plaintext unless original readout is readable and matched to control",
},null,2));
