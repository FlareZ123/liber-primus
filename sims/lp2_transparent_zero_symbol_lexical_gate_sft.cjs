'use strict';
/**
 * All-29-symbol necessary-condition test for a transparent GP29 zero step:
 *   C[i] === C[i-1] if and only if P[i] === secretRune
 * at eligible within-page successor positions.
 * The printed word lengths and physical-page firsts are fixed.
 * Each candidate plaintext word is independently sampled with replacement
 * from the native-GP word pool of the exact same length in a pinned reference.
 * Exact discrete distribution convolution, no random samples or fitted keys.
 *
 * Node.js 22 CommonJS. From repository root:
 *   node sims/lp2_transparent_zero_symbol_lexical_gate_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.join(__dirname, '..');
/** @param {string} p @returns {string} */
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const original = read('resources/lp2-transcription.txt');
const rune = new Map(corpus.runes.map((s, i) => [s, i]));
const refs = {
  Shakespeare: read('resources/control/shakespeare_first300k.txt'),
  Gibran: read('resources/control/gibran_prophet_58585.txt'),
  Emerson: read('resources/control/emerson_essays_2944.txt'),
  Cicada: read('resources/liber-primus/lp1-plaintext-reference.txt')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/(?:^|\n)### [^\n]*\n/g, ' ')
};
const digraphs = {TH:2, NG:21, EO:12, OE:22, AE:25, IA:27, EA:28};
const letters = {A:24,B:17,C:5,D:23,E:18,F:0,G:6,H:8,I:10,J:11,
  K:5,L:20,M:19,N:9,O:3,P:13,Q:5,R:4,S:15,T:16,U:1,V:1,
  W:7,X:14,Y:26,Z:15};
/** @param {string} word @returns {number[]} */
function encode(word) {
  const out = [];
  for (let i=0; i<word.length; i++) {
    const pair = digraphs[word.slice(i,i+2)];
    if (pair !== undefined) {out.push(pair);i++;}
    else {assert.notEqual(letters[word[i]], undefined);out.push(letters[word[i]]);}
  }
  return out;
}
/** @param {string} source @returns {Map<number,number[][]>} */
function nativePools(source) {
  const pools = new Map();
  for (const token of source.toUpperCase().match(/[A-Z]+/g)) {
    const w=encode(token);
    if (!pools.has(w.length)) pools.set(w.length, []);
    pools.get(w.length).push(w);
  }
  return pools;
}
const originals = [];
let active=[], local=0, prev=-1, physical=0, runeCount=0, repeats=0;
function finish() {if (active.length){originals.push(active);active=[];}}
for (const ch of original.split('%').slice(0,55).join('%')) {
  if (rune.has(ch)) {
    const x = rune.get(ch);
    const record={x, eligible:local>0, event:local>0 && x===prev, page:physical};
    active.push(record);
    if (record.event) repeats++;
    runeCount++;local++;prev=x;
  } else if (ch==='%') {physical++;local=0;prev=-1;}
  else if (ch==='/' || /\s/u.test(ch)) {}
  else finish();
}
finish();
assert.equal(originals.length,2896);
assert.equal(runeCount,12956);
assert.equal(repeats,86);
assert.equal(physical,54);
for (let page=0; page<55; page++) {
  const printed = [...original.split('%')[page]]
    .filter(x=>rune.has(x)).map(x=>rune.get(x));
  assert.deepEqual(originals.flat().filter(x=>x.page===page).map(x=>x.x),printed);
}
const observed={total:0,long:0,start:0};
const types = new Map();
for (const word of originals) {
  const L=word.length;
  const mask=word.map(r=>r.eligible?'1':'0').join('');
  const key=L+':'+mask;
  if (!types.has(key))types.set(key,{L,mask,n:0});
  types.get(key).n++;
  for (let j=0;j<L;j++) if(word[j].event) {
    observed.total++;
    if (L>=8)observed.long++;
    if (j===0)observed.start++;
  }
}
assert.deepEqual(observed,{total:86,long:21,start:23});
assert.equal(types.size,41);
/**
 * @param {number[][]} pool
 * @param {{L:number,mask:string,n:number}} group
 * @param {number} q
 * @param {'total'|'long'|'start'} feature
 * @returns {Array<[number,number]>}
 */
function histogram(pool,group,q,feature) {
  const counts=new Map();
  for (const w of pool) {
    let hits=0;
    if (feature==='start') {
      if (group.mask[0]==='1' && w[0]===q) hits=1;
    } else if (feature==='total' || (feature==='long' && group.L>=8)) {
      for (let j=0;j<group.L;j++)
        if (group.mask[j]==='1' && w[j]===q) hits++;
    }
    counts.set(hits,(counts.get(hits)||0)+1);
  }
  return [...counts].map(([k,n])=>[k,n/pool.length]);
}
/**
 * Exact convolution: the terminal bucket absorbs all probabilities above K.
 * For the upper tail, K=threshold. For lower, K=threshold+1.
 * @param {Array<{n:number,h:Array<[number,number]>}>} groups
 * @param {number} threshold
 * @param {'upper'|'lower'} side
 * @returns {number}
 */
function exactTail(groups,threshold,side) {
  const cap=side==='upper'?threshold:threshold+1;
  let states=new Float64Array(cap+1);
  states[0]=1;
  for (const {n,h} of groups) {
    if (h.length===1 && h[0][0]===0)continue;
    for (let a=0;a<n;a++) {
      const next=new Float64Array(cap+1);
      for (let j=0;j<=cap;j++) if (states[j]!==0)
        for(const [k,p] of h)next[Math.min(cap,j+k)]+=states[j]*p;
      states=next;
    }
  }
  if (side==='upper')return states[cap];
  let p=0;
  for(let j=0;j<=threshold;j++)p+=states[j];
  return p;
}
/**
 * Exact probability of the observed long-word EA count, conditional on the
 * observed total count 86. This removes global lexical-frequency variation
 * as a possible explanation of the long-word anomaly.
 * Short and long words are disjoint independent strata in the declared null.
 * @param {Map<number,number[][]>} pools
 */
function conditionedEA(pools) {
  const bins=[[],[]];
  for (const group of types.values()) {
    const pool=pools.get(group.L);
    bins[group.L>=8?1:0].push({
      n:group.n,
      h:histogram(pool,group,28,'total')
    });
  }
  /** @param {Array<{n:number,h:Array<[number,number]>}>} groups */
  function pdf(groups) {
    const limit=observed.total;
    let states=new Float64Array(limit+1);
    states[0]=1;
    for (const {n,h} of groups) {
      if(h.length===1&&h[0][0]===0)continue;
      for(let i=0;i<n;i++) {
        const next=new Float64Array(limit+1);
        for(let j=0;j<=limit;j++)if(states[j]!==0)
          for(const [k,p] of h)if(j+k<=limit)next[j+k]+=states[j]*p;
        states=next;
      }
    }
    return states;
  }
  const short=pdf(bins[0]),long=pdf(bins[1]);
  let denominator=0,numerator=0,expectedNumerator=0;
  for(let count=0;count<=observed.total;count++) {
    const mass=long[count]*short[observed.total-count];
    denominator+=mass;
    expectedNumerator+=count*mass;
    if(count>=observed.long)numerator+=mass;
  }
  assert(denominator>0,'nonempty conditional event');
  return {
    probabilityTotal86:denominator,
    meanLongConditionalOn86:expectedNumerator/denominator,
    probabilityLongAtLeast21Given86:numerator/denominator
  };
}
/**
 * @param {Map<number,number[][]>} pools
 * @param {number} q
 * @returns {{q:number,p:number,gate:string,tests:object}}
 */
function candidate(pools,q) {
  const tests={};
  for (const [feature,target] of Object.entries(observed)) {
    const groups=[];
    let mean=0;
    for (const g of types.values()) {
      const pool=pools.get(g.L);
      assert(pool?.length, 'reference has no native words of length '+g.L);
      const h=histogram(pool,g,q,feature);
      mean+=g.n*h.reduce((v,[k,p])=>v+k*p,0);
      groups.push({n:g.n,h});
    }
    const side=mean>target?'lower':'upper';
    tests[feature]={mean,side,oneSided:exactTail(groups,target,side)};
  }
  const [gate,hit]=Object.entries(tests).sort((a,b)=>a[1].oneSided-b[1].oneSided)[0];
  // Conservative correction for 2 tail directions and 3 frozen features.
  return {q,p:Math.min(1,6*hit.oneSided),gate,tests};
}
/** Deterministic exact encryption and inversion with q=EA on a native plant. */
function plantPositive(pools) {
  const text=originals.flatMap((word,i)=>{
    const pool=pools.get(word.length);
    return pool[(i*17+7)%pool.length].slice();
  });
  const layout=originals.flat();
  assert.equal(text.length,layout.length);
  const cipher=[],decoded=[];
  for(let i=0;i<text.length;i++) {
    const key=(7*i+5)%28;
    if(!layout[i].eligible){
      cipher.push((text[i]+13)%29);
      decoded.push((cipher[i]+16)%29);
    }else{
      const delta=text[i]===28?0:1+(text[i]+key)%28;
      cipher.push((cipher[i-1]+delta)%29);
      const observedDelta=(cipher[i]-cipher[i-1]+29)%29;
      decoded.push(observedDelta===0?28:(observedDelta-1-key+56)%28);
    }
  }
  assert.deepEqual(decoded,text);
  assert.equal(cipher.length,12956);
  return {runes:text.length,exactRecovery:true,plantedEA:text.filter(x=>x===28).length};
}
/**
 * Source-only comparator: select 86 eligible physical page successor positions
 * uniformly without replacement. Under this non-cryptographic null,
 * long-word position mass should predict the observed long-word event count.
 */
function homogeneousSiteNull() {
  const eligible=originals.flat().filter(r=>r.eligible).length;
  const longEligible=originals
    .filter(w=>w.length>=8).flat().filter(r=>r.eligible).length;
  const totalEvents=observed.total,actualLong=observed.long;
  // Hypergeometric P(X=0), iterated recurrence for X=1..86.
  let p=1;
  for(let i=0;i<totalEvents;i++)
    p*=(eligible-longEligible-i)/(eligible-i);
  let upper=0;
  for(let k=0;k<=totalEvents;k++) {
    if(k>=actualLong)upper+=p;
    if(k<totalEvents)p*=((longEligible-k)*(totalEvents-k))/
      ((k+1)*(eligible-longEligible-totalEvents+k+1));
  }
  const mean=totalEvents*longEligible/eligible;
  assert.equal(eligible,12901);
  assert.equal(longEligible,3119);
  assert(Math.abs(upper-0.5207793771587872)<1e-9);
  return {eligible,longEligible,mean,observedLong:actualLong,
    pAtLeastObserved:upper};
}
const out={observed,words:originals.length,sourceGroups:types.size,models:29,
  references:{},sourceUniformSiteComparator:homogeneousSiteNull(),
  positive:plantPositive(nativePools(refs.Shakespeare))};
for (const [name,source] of Object.entries(refs)) {
  const pools=nativePools(source);
  const trials=Array.from({length:29},(_,q)=>candidate(pools,q))
    .sort((a,b)=>b.p-a.p);
  assert.equal(trials.length,29);
  assert.equal(trials[0].q,28);
  assert(trials[0].p<0.01,'reference lacks all-label conditional exclusion');
  out.references[name]={
    familywiseCompositeP:trials[0].p,
    strongestSurvivor:trials[0],
    runnerUp:{q:trials[1].q,p:trials[1].p},
    conditionalEA:conditionedEA(pools)
  };
}
console.log(JSON.stringify(out,null,2));
