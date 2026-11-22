"use strict";
/**
 * Source-fixed nine chapter x 28 phase all-secret predecessor-difference
 * collision invariant, with native GP positive plants.
 * Node.js 22: node sims/q252_nine_chapter_gp28_allsecret_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=x=>fs.readFileSync(path.join(root,x),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const cuts=[0,3,8,15,23,27,33,40,54,56];
const chapters=cuts.slice(0,-1).map((p,i)=>corpus.pages.filter(x=>
  x.page>=p && x.page<cuts[i+1]).flatMap(x=>x.indices));
const N=chapters.reduce((s,c)=>s+c.length,0);
assert.equal(N,12956);
const mod=(x,n)=>(x%n+n)%n;
const source=corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
/** @param {string} text @returns {number[]} */
function gpify(text){
  const result=[];
  for(const input of text.match(/[A-Za-z]+/g)||[]){
    const word=input.toUpperCase().replace(/[KVZQ]/g,x=>
      ({K:"C",V:"U",Z:"S",Q:"C"})[x]);
    for(let i=0;i<word.length;){
      const token=source.find(x=>word.startsWith(x.token,i));
      assert.ok(token,"GP token "+word.slice(i));
      result.push(token.index===28?27:token.index); // EA folded into IA
      i+=token.token.length;
    }
  }
  return result;
}
/** @returns {Uint16Array[]} */
function empty(){return Array.from({length:9*28},()=>new Uint16Array(28));}
const eligible=[],original=empty();
let offset=0;
for(let j=0;j<9;j++){
  for(let i=1;i<chapters[j].length;i++){
    const d=mod(chapters[j][i]-chapters[j][i-1],29);
    if(d===0)continue; // true repeated cipher rune, reserved EA escape
    const slot=j*28+(i-1)%28;
    original[slot][d-1]++;
    eligible.push({j,i,absolute:offset+i,slot,rank:d-1});
  }
  offset+=chapters[j].length;
}
assert.equal(eligible.length,12861);
/** @param {Uint16Array[]} bins */
function collision(bins){
  let equal=0,pairs=0;
  for(const a of bins){
    const n=a.reduce((s,x)=>s+x,0);
    pairs+=n*(n-1);
    equal+=a.reduce((s,x)=>s+x*(x-1),0);
  }
  return {equal,pairs,ioc:equal/pairs};
}
const observed=collision(original);
assert.deepEqual([observed.equal,observed.pairs],[29136,815506]);
/** @param {number[]} native */
function sampleBins(native){
  const bins=empty();
  for(const o of eligible)bins[o.slot][native[o.absolute]]++;
  return bins;
}
const samples=[];
const refs=[
  {name:"Shakespeare",path:"resources/control/shakespeare_first300k.txt",
    starts:[20000,56000,92000,128000,164000]},
  {name:"Gibran",path:"resources/control/gibran_prophet_58585.txt",
    starts:[1000,11000,21000,31000,41000]}
];
let plant;
for(const r of refs){
  const src=gpify(read(r.path));
  for(const begin of r.starts){
    const slice=src.slice(begin,begin+N);
    assert.equal(slice.length,N);
    if(!plant)plant=slice;
    samples.push({source:r.name,start:begin,...collision(sampleBins(slice))});
  }
}
const minimum=Math.min(...samples.map(x=>x.ioc));
const maximum=Math.max(...samples.map(x=>x.ioc));
assert.ok(observed.ioc<0.037 && minimum>0.058);
let seed=0x33012628;
/** @returns {number} */
function random(){
  seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
  return seed>>>0;
}
const keys=Array.from({length:252},()=>{
  const p=Array.from({length:28},(_,i)=>i);
  for(let i=27;i>0;i--){
    const j=random()%(i+1);
    [p[i],p[j]]=[p[j],p[i]];
  }
  return p;
});
const inverse=keys.map(k=>k.map((_,i)=>k.indexOf(i)));
let recovered=0,wrong=0,leaderCount=0,offset2=0;
const positive=empty();
for(let chapter=0;chapter<9;chapter++){
  const orig=chapters[chapter],cipher=[orig[0]];
  leaderCount++;
  for(let i=1;i<orig.length;i++){
    const d=mod(orig[i]-orig[i-1],29);
    const slot=28*chapter+(i-1)%28;
    const plain=d===0?28:plant[offset2+i];
    const c=plain===28?cipher[i-1]:
      mod(cipher[i-1]+1+keys[slot][plain],29);
    cipher.push(c);
    const rank=mod(c-cipher[i-1],29);
    const out=rank===0?28:inverse[slot][rank-1];
    assert.equal(out,plain);
    recovered++;
    if(rank!==0){
      positive[slot][rank-1]++;
      const wrongSlot=(slot+28)%252;
      if(inverse[wrongSlot][rank-1]!==plain)wrong++;
    }
  }
  offset2+=orig.length;
}
assert.equal(leaderCount,9);
assert.equal(recovered,12947);
assert.ok(wrong>11500);
assert.deepEqual(collision(positive),collision(sampleBins(plant)));
const out={
  classification:"negative for 252 arbitrary chapter/phase stationary secret permutations of original nonzero GP29 predecessor steps",
  original:{runes:N,chapters:chapters.map(c=>c.length),GP28Observations:eligible.length,
    reservedZeroSteps:86,slots:252,...observed},
  native:{EA_fold:"source GP EA(28) => IA(27)",controls:samples,
    minIoC:minimum,maxIoC:maximum},
  positive:{separateSecretKeys:252,plantedNonleaderRecovered:recovered,
    intentionallyWrongKeyMismatches:wrong,collisionInvariantPassed:true},
  limits:"Native GP-English only, continuous 28-clock per original source chapter and original 86 doublet exceptions; excludes stationary GP28 per-chapter-per-phase bijections, not non-GP registers or evolving state."
};
console.log(JSON.stringify(out,null,2));
