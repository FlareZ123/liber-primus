"use strict";
/**
 * Source-marked p39 grid-jet autonomous-state candidate, exact original test.
 * Run: node sims/p39_grid_jet_autonomous_state_sft.cjs
 *
 * Interpretation of the red p39 triad [27,5,15]:
 * P(15)=27 and P'(15)=5, where P is the printed 256-byte GF(29) grid
 * polynomial (descending coefficient order). The natural autonomous
 * state model emits P(s), then advances s <- P'(s).
 *
 * This examines a clue-constrained, finite, reversible additive cipher.
 * It neither asserts that a derivative clock is intended nor recovers LP2.
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} file @returns {any} */
function json(file){return JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));}
/** @param {number} x @returns {number} */
function mod(x){return ((x%29)+29)%29;}
/** @param {number[]} coeff @returns {number[]} */
function derivative(coeff){
  return coeff.slice(0,-1).map((v,i)=>mod(v*(coeff.length-1-i)));
}
/** @param {number[]} coeff @param {number} x @returns {number} */
function valueAt(coeff,x){return coeff.reduce((v,c)=>mod(v*x+c),0);}
const grid=json("resources/liber-primus/lp2-grid-256.json").bytes;
const corpus=json("resources/liber-primus/lp2-corpus.json");
const ink=json("resources/liber-primus/lp2-ink-annotations.json");
const shakespeare=fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8");
assert.equal(grid.length,256);
assert.equal(crypto.createHash("sha256").update(Buffer.from(grid)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const coeff=grid.map(x=>mod(x)),d=derivative(coeff);
const K=Array.from({length:29},(_,x)=>valueAt(coeff,x));
const N=Array.from({length:29},(_,x)=>valueAt(d,x));
const triad=ink.pages.find(p=>p.page===39).red_spans
  .filter(x=>x.length===3).map(x=>Array.from(x.runes,ch=>corpus.runes.indexOf(ch)));
assert.deepEqual(triad,[[27,5,15]]);
assert.deepEqual([K[15],N[15],15],triad[0]);
assert.deepEqual([K[14],N[14]],[27,5]);
assert.equal(N[27],27);
assert.deepEqual(N.map((x,i)=>x===0?i:-1).filter(x=>x>=0),[13,24]);
assert.deepEqual([K[13],K[24]],[8,0]);
/** @param {number} seed @returns {{lead:number,period:number,cycle:number[]}} */
function orbit(seed){
  const seen=new Map(),route=[];
  let state=seed;
  while(!seen.has(state)){
    seen.set(state,route.length);
    route.push(state);
    state=N[state];
  }
  const lead=seen.get(state);
  return {lead,period:route.length-lead,cycle:route.slice(lead)};
}
const orbits=Array.from({length:29},(_,seed)=>orbit(seed));
assert.equal(Math.max(...orbits.map(o=>o.lead)),6);
assert.equal(orbits.filter(o=>o.period===1).length,7);
assert.equal(orbits.filter(o=>o.period===5).length,22);
assert.deepEqual(orbit(15),{lead:3,period:5,cycle:[16,21,12,3,7]});
assert.deepEqual(orbit(27),{lead:0,period:1,cycle:[27]});
const streamEquivalence=new Map();
for(let seed=0;seed<29;seed++){
  let state=seed;
  const key=[];
  for(let i=0;i<20;i++){key.push(K[state]);state=N[state];}
  const fingerprint=key.join(",");
  if(!streamEquivalence.has(fingerprint))streamEquivalence.set(fingerprint,[]);
  streamEquivalence.get(fingerprint).push(seed);
}
assert.equal(streamEquivalence.size,27);
assert.deepEqual([...streamEquivalence.values()].filter(a=>a.length>1),[[14,15],[21,25]]);
const pages=corpus.pages.filter(p=>p.page<=55).map(p=>p.indices);
const original=pages.flat();
assert.equal(original.length,12956);
/**
 * @param {number[][]} groups
 * @param {number} seed
 * @param {number} sign
 * @param {boolean} pageReset
 * @returns {{plain:number[],pad:number[]}}
 */
function decode(groups,seed,sign,pageReset){
  const plain=[],pad=[];
  let state=seed;
  for(const group of groups){
    if(pageReset)state=seed;
    for(const c of group){
      pad.push(K[state]);
      plain.push(mod(c+sign*K[state]));
      state=N[state];
    }
  }
  return {plain,pad};
}
/** @param {number[]} a @returns {number} */
function ioc(a){
  const freq=Array(29).fill(0);
  for(const x of a)freq[x]++;
  return freq.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));
}
/** @param {string} text @returns {number[]} */
function gpEncode(text){
  const map=new Map(corpus.translit.map((s,i)=>[s,i])),out=[];
  for(let word of text.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<word.length;){
      const pair=word.slice(i,i+2);
      if(map.has(pair)){out.push(map.get(pair));i+=2;}
      else {if(map.has(word[i]))out.push(map.get(word[i]));i++;}
    }
  }
  return out;
}
const gp=gpEncode(shakespeare);
assert(gp.length>162956);
const trigram=new Uint32Array(29**3),bigram=new Uint32Array(29**2);
for(let i=2;i<100000;i++){
  trigram[gp[i-2]*841+gp[i-1]*29+gp[i]]++;
  bigram[gp[i-2]*29+gp[i-1]]++;
}
const model=new Float64Array(29**3);
for(let i=0;i<model.length;i++)
  model[i]=Math.log((trigram[i]+0.25)/(bigram[Math.floor(i/29)]+7.25));
/** @param {number[]} a @returns {number} */
function score(a){
  let sum=0;
  for(let i=2;i<a.length;i++)sum+=model[a[i-2]*841+a[i-1]*29+a[i]];
  return sum/(a.length-2);
}
const tests=[];
for(const pageReset of [false,true])
  for(const sign of [-1,1])
    for(let seed=0;seed<29;seed++){
      const {plain,pad}=decode(pages,seed,sign,pageReset);
      assert.deepEqual(plain.map((v,i)=>mod(v-sign*pad[i])),original);
      tests.push({seed,sign,pageReset,score:score(plain),ioc:ioc(plain)});
    }
assert.equal(tests.length,116);
tests.sort((a,b)=>b.score-a.score);
const rawScore=score(original);
assert(Math.abs(rawScore-(-4.147504344592278))<1e-9);
assert(Math.abs(tests[0].score-(-4.147576973676416))<1e-9);
assert(tests[0].score<rawScore);
const sourceSeed=tests.filter(t=>t.seed===15);
assert.equal(sourceSeed.length,4);
const native=gp.slice(150000,150000+original.length);
const nativePad=decode([Array(original.length).fill(0)],15,1,false).plain;
const planted=native.map((v,i)=>mod(v+nativePad[i]));
const recovered=decode([planted],15,-1,false).plain;
const wrong=decode([planted],27,-1,false).plain;
assert.deepEqual(recovered,native);
assert(score(recovered)>-3.0);
assert(score(wrong)<-4.0);
console.log(JSON.stringify({
  classification:"One finite source-jet autonomous GP29 additive model rejected on original LP2",
  originalGridSHA256:"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
  p39Triad:triad[0],sourceJet:[K[15],N[15],15],
  sourceSeedOrbit:orbit(15),sourceSeedPadFirst8:[27,4,10,2,14,5,3,1],
  derivativeClock:{maxTransient:6,fixedPoint:27,cycle5:[16,21,12,3,7],
    inFixedBasin:7,inFiveCycleBasin:22,distinctSeedKeystreams:27,
    indistinguishableSeedPairs:[[14,15],[21,25]]},
  original:{runes:original.length,rawScore,rawIoC:ioc(original),
    candidates:tests.length,best:tests[0],sourceSeed,roundtrips:true},
  nativeControl:{runes:native.length,score:score(native),ioc:ioc(native),
    plantedRoundtrip:true,wrongSeed27Score:score(wrong)},
  recoveredUnknownPlaintext:false
},null,2));
