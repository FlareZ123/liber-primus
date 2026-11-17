'use strict';

/**
 * Native-GP word-shape gate for the source p56 prime-totient/collision-skip
 * cipher with a secret cyclic/Latin substitution tableau in either operator order.
 *
 * The original 2014 p56 additive prime-totient stream selects the 29-row
 * circulant constructions T[row][plain]=(sigma[plain]+sign*row) mod29
 * and T[row][plain]=sigma((plain+sign*row) mod29).
 * The duplicate-output skip is hypothetical, q=0.81, and consumes another
 * prime state. This experiment does NOT claim that Cicada authored it.
 *
 * NATIVE CONTROLS: exact source 2,896 printed word lengths, Gibran and
 * Shakespeare source-native GP29 word pools, random secret GP29 permutations,
 * reversible 29-state emission on the recorded true key path, and both signs.
 * The measured tests are original within-word lag5 equality, S5 equality,
 * and fixed historical DH6/p39 T6 affine echo, plus an adjacent-repeat check.
 *
 * Run on Windows Node22: node sims/lp2_h2_cyclic_lag5_original_sft.cjs
 * Source-only; read-only; deterministic; no dependencies.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = name => fs.readFileSync(path.join(root,name),'utf8');
const gp = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const N=29, LENGTH=12956, TRIALS=500, q=0.81;
const RUNIC=/[\u16A0-\u16FF]/u;
const lengths=[];
let count=0,total=0;
for(const ch of read('resources/liber-primus/lp2-transcription.txt')
  .split('%').slice(0,55).join('%')){
  if(RUNIC.test(ch)){count++;total++;}
  else if(ch==='/' || ch==='%' || /\s/u.test(ch)){}
  else if(count){lengths.push(count);count=0;}
}
if(count)lengths.push(count);
assert.equal(lengths.length,2896);
assert.equal(total,LENGTH);
const original=gp.pages.filter(p=>p.page<56).flatMap(p=>p.indices);
assert.equal(original.length,LENGTH);
const tokens=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);

/** @param {string} input @returns {number[]} */
function gpWord(input){
  const w=input.toUpperCase().replace(/QU/g,'CW')
    .replace(/V/g,'U').replace(/[KQ]/g,'C').replace(/Z/g,'S');
  const out=[];
  for(let i=0;i<w.length;){
    if(w.startsWith('ING',i)){out.push(21);i+=3;}
    else if(w.startsWith('IO',i)){out.push(27);i+=2;}
    else{
      const t=tokens.find(t=>w.startsWith(t.s,i));
      assert(t,'unmapped GP source: '+w.slice(i));
      out.push(t.i);
      i+=t.s.length;
    }
  }
  return out;
}

/** @param {string} content */
function pools(content){
  const buckets=Array.from({length:30},()=>[]);
  for(const w of content.match(/[A-Za-z]+/g)||[]){
    const values=gpWord(w);
    if(values.length<30)buckets[values.length].push(values);
  }
  for(const len of lengths)assert(buckets[len].length>0,'missing word length '+len);
  return buckets;
}
const sources=[
  {name:'Gibran',buckets:pools(read('resources/control/gibran_prophet_58585.txt'))},
  {name:'Shakespeare',buckets:pools(read('resources/control/shakespeare_first300k.txt'))}
];
const composite=new Uint8Array(700001),clock=[];
for(let n=2;n<composite.length && clock.length<45000;n++){
  if(composite[n])continue;
  clock.push((n-1)%N);
  if(n*n<composite.length)
    for(let j=n*n;j<composite.length;j+=n)composite[j]=1;
}
assert.equal(clock.length,45000);

/** @param {number} seed */
function random(seed){
  let state=seed>>>0;
  const uniform=()=>{
    state^=state<<13;state^=state>>>17;state^=state<<5;
    return (state>>>0)/4294967296;
  };
  return {uniform,int:n=>Math.floor(uniform()*n)};
}
/** @param {number[]} C */
function stats(C){
  const counts=Array(N).fill(0);
  for(const c of C)counts[c]++;
  const ioc=counts.reduce((s,v)=>s+v*(v-1),0)/(C.length*(C.length-1));
  let adjacent=0,lag5=0,t6=0,s5=0,total5=0,total6=0,off=0;
  for(const len of lengths){
    for(let j=0;j<len;j++){
      const i=off+j;
      if(j>0 && C[i]===C[i-1])adjacent++;
      if(j>=5){
        total5++;
        if(C[i]===C[i-5])lag5++;
        if(C[i]===15 && C[i-5]===15)s5++;
      }
      if(j>=6){
        total6++;
        if(C[i]===((24-2*C[i-6])%N+N)%N)t6++;
      }
    }
    off+=len;
  }
  assert.equal(off,LENGTH);
  return {ioc,adjacent,lag5,s5,t6,total5,total6};
}
const baseline=stats(original);
assert.deepEqual({
  n:LENGTH,words:lengths.length,adjacent:baseline.adjacent,
  lag5:baseline.lag5,s5:baseline.s5,t6:baseline.t6,
  total5:baseline.total5,total6:baseline.total6
},{n:12956,words:2896,adjacent:63,lag5:104,s5:11,t6:80,
  total5:2105,total6:1290});
/** @param {number[][]} buckets @param {-1|1} sign @param {number} seed @param {'before'|'after'} placement */
function trial(buckets,sign,seed,placement){
  const rng=random(seed);
  const P=new Uint8Array(LENGTH);
  let offset=0;
  for(const len of lengths){
    P.set(buckets[len][rng.int(buckets[len].length)],offset);
    offset+=len;
  }
  const sigma=Array.from({length:N},(_,i)=>i);
  for(let i=N-1;i>0;i--){
    const j=rng.int(i+1);
    [sigma[i],sigma[j]]=[sigma[j],sigma[i]];
  }
  const inverse=Array(N);
  sigma.forEach((v,i)=>{inverse[v]=i;});
  const C=new Uint8Array(LENGTH);
  let cursor=0,previous=-1,skips=0;
  const emit=(p,j)=>placement==='before'
    ?(sigma[p]+sign*clock[j]+N)%N
    :sigma[(p+sign*clock[j]+N)%N];
  const decode=(cipher,j)=>placement==='before'
    ?inverse[(cipher-sign*clock[j]+N)%N]
    :(inverse[cipher]-sign*clock[j]+N)%N;
  for(let i=0;i<LENGTH;i++){
    let z=emit(P[i],cursor);
    while(z===previous && rng.uniform()<q){
      cursor++;skips++;
      z=emit(P[i],cursor);
    }
    const recovered=decode(z,cursor);
    assert.equal(recovered,P[i],'true secret-table + key-path positive failed');
    C[i]=z;
    previous=z;
    cursor++;
  }
  return {...stats(C),skips};
}
const result={classification:'original-cipher feature gate, not plaintext recovery',
  model:'single hidden Latin/circulant GP29 tableau; both GP29 permutation/prime-shift orders, p56 phi(prime) rows, q=.81 duplicate rejection',
  original:baseline,nativeShapeWords:lengths.length,trialsPerSignSourcePlacement:TRIALS,experiments:[]};
for(const placement of ['before','after']){
  for(const [s,source] of sources.entries()){
    for(const sign of [1,-1]){
      const seed=(0x330148cc ^ (sign===1?0:0x7f16) ^ (s?0x3112aafe:0)
        ^ (placement==='after'?0x4aa53301:0))>>>0;
      const tests=[];
      for(let i=0;i<TRIALS;i++)
        tests.push(trial(source.buckets,sign,(seed+i*0x9e3779b9)>>>0,placement));
    const fields={};
    for(const key of ['ioc','adjacent','lag5','s5','t6','skips']){
      const xs=tests.map(x=>x[key]).sort((a,b)=>a-b);
      fields[key]={
        min:xs[0],median:xs[Math.floor(TRIALS/2)],max:xs.at(-1),
        mean:xs.reduce((a,b)=>a+b,0)/TRIALS,
        geOriginal:key==='skips'?null:xs.filter(x=>x>=baseline[key]).length
      };
    }
    result.experiments.push({source:source.name,sign,seed,placement,fields});
    }
  }
}
console.log(JSON.stringify(result,null,2));
