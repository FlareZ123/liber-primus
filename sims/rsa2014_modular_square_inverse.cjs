'use strict';
/**
 * Source-fixed modular-squaring original-LP2 inverse for the factored
 * historical Cicada 2014 RSA-432 modulus.
 *
 * This tests a recurrence genuinely distinct from SHA-256-derived
 * AES/ChaCha source-key screens. It makes no claim that the 2014 RSA
 * stage was intended to provide a Liber Primus stream key.
 *
 * Command: node sims/rsa2014_modular_square_inverse.cjs
 * Source split: original pages 0,3,8,23,27,40; train [0,130),
 * hold [130,210). GP-English trigram model is sourced independently.
 * Includes exactly regenerated synthetic GP-language positives.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {viterbi} = require('./grid_stream_collision_viterbi.cjs');
const {train,encode} = require('./grid_keyskip_viterbi.cjs');
const ROOT = path.resolve(__dirname, '..');
/** @param {string} p */
const read = p => fs.readFileSync(path.join(ROOT,p),'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const text = read('resources/control/shakespeare_first300k.txt');
const lm = train(text.slice(0,210000));
const P = 97513779050322159297664671238670850085661086043266591739338007321n;
const Q = 77506098606928780021829964781695212837195959082370473820509360759n;
const N = P*Q;
const PHI = (P-1n)*(Q-1n);
const E = 65537n;
assert.equal(N,7557912574608535164426718292058021255641310207187633095795069445700059210248050757270234679993673844203148013173091173786572116639n);
assert.equal(N.toString(2).length,432);
assert.equal(P%4n,1n);
assert.equal(Q%4n,3n); // This is NOT a Blum integer.
/** @param {bigint} a @param {bigint} m */
function inverse(a,m){
  let t=0n,u=1n,r=m,s=a;
  while(s!==0n){const k=r/s;[t,u]=[u,t-k*u];[r,s]=[s,r-k*s];}
  assert.equal(r,1n);
  return (t%m+m)%m;
}
const D = inverse(E,PHI);
const SEEDS = Object.freeze({
  cicada3301:3301n,
  cicada2014:2014n,
  magic1033:1033n,
  clue79:79n,
  clue53:53n,
  rsaExponent:E,
  factorSum:P+Q,
  factorXor:P^Q,
  totient:PHI,
  rsaPrivate:D
});
const PAGE_IDS=[0,3,8,23,27,40], T=130, H=80;
const CIPHER=PAGE_IDS.map(id=>corpus.pages[id].indices.slice(0,T+H));
assert.ok(CIPHER.every(row=>row.length===T+H));
const KINDS=['low8','high8','mod29','fivebit'];
const CLOCKS=['same','pageAdd','pageXor'];
const MOD=29, KLEN=260;
const mod=x=>(x%MOD+MOD)%MOD;
/** @typedef {{name:string, seed:bigint,kind:string,clock:string,sign:number}} Model */
/** @param {bigint} seed @param {number} page @param {string} clock */
function startState(seed,page,clock){
  const offset=BigInt(page+1);
  const keyed=clock==='same'?seed:
    clock==='pageAdd'?seed+offset:seed^offset;
  return ((keyed%N)+N)%N;
}
/** @param {bigint} seed @param {number} page @param {string} clock @param {string} kind @param {number} n */
function keyStream(seed,page,clock,kind,n=KLEN){
  let x=startState(seed,page,clock);
  const key=[];
  while(key.length<n){
    if(kind==='fivebit'){
      let bits=0;
      for(let j=0;j<5;j++){
        x=x*x%N;
        bits=(bits<<1)|Number(x&1n);
      }
      if(bits<29) key.push(bits);
      continue;
    }
    x=x*x%N;
    key.push(kind==='low8'?Number(x&255n)%29:
      kind==='high8'?Number((x>>424n)&255n)%29:Number(x%29n));
  }
  return key;
}
/** @type {Model[]} */
const MODELS=[];
for(const [name,seed] of Object.entries(SEEDS))
for(const kind of KINDS)
for(const clock of CLOCKS)
for(const sign of [1,-1])
  MODELS.push({name,seed,kind,clock,sign});
assert.equal(MODELS.length,240);
/** @param {number[][]} source */
function evaluate(source){
  const out=[];
  for(const model of MODELS){
    let trainScore=0, holdScore=0, skipCount=0;
    const head=[];
    for(let i=0;i<PAGE_IDS.length;i++){
      const key=keyStream(model.seed,PAGE_IDS[i],model.clock,model.kind);
      const first=viterbi(source[i].slice(0,T),key,model.sign,lm);
      const next=viterbi(source[i].slice(T,T+H),
        key.slice(T+first.skips),model.sign,lm);
      trainScore+=first.score;
      holdScore+=next.score;
      skipCount+=first.skips+next.skips;
      if(i<2) head.push(next.plaintext.slice(0,30)
        .map(x=>corpus.translit[x]).join(''));
    }
    out.push({name:model.name,kind:model.kind,clock:model.clock,
      sign:model.sign,train:trainScore/(PAGE_IDS.length*T),
      heldout:holdScore/(PAGE_IDS.length*H),skips:skipCount,
      holdoutHeads:head});
  }
  return out.sort((a,b)=>b.train-a.train);
}
/** @param {number} seed */
function random(seed){
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
/** @param {Model} model */
function controlPlant(model){
  const plain=encode(text.slice(220000));
  const rand=random(0x20143301);
  const source=[],witness=[];
  for(let pageNo=0;pageNo<PAGE_IDS.length;pageNo++){
    const p=plain.slice(pageNo*(T+H),(pageNo+1)*(T+H));
    const key=keyStream(model.seed,PAGE_IDS[pageNo],model.clock,model.kind);
    const output=[], skip=[];
    let pos=0, prev=-1;
    for(const c of p){
      let next=mod(c+model.sign*key[pos]);
      let rejected=false;
      if(next===prev&&rand()<0.81){
        pos++;
        next=mod(c+model.sign*key[pos]);
        rejected=true;
      }
      output.push(next);
      skip.push(rejected);
      prev=next;
      pos++;
    }
    assert.ok(pos<key.length);
    // Exact original forward re-encryption using preserved true witnesses.
    let idx=0,old=-1;
    for(let i=0;i<p.length;i++){
      if(skip[i]){
        assert.equal(mod(p[i]+model.sign*key[idx]),old);
        idx++;
      }
      const c=mod(p[i]+model.sign*key[idx++]);
      assert.equal(c,output[i]);
      old=c;
    }
    source.push(output);
    witness.push({page:PAGE_IDS[pageNo],truePlain:p,
      skipCount:skip.filter(Boolean).length});
  }
  return {source,witness};
}
function main(){
  const ranked=evaluate(CIPHER);
  const best=ranked[0];
  const truth=MODELS.find(x=>x.name==='cicada3301'&&
    x.kind==='low8'&&x.clock==='pageAdd'&&x.sign===1);
  assert.ok(truth);
  const plant=controlPlant(truth);
  const planted=evaluate(plant.source);
  const top=planted[0];
  const match=top.name===truth.name&&top.kind===truth.kind&&
    top.clock===truth.clock&&top.sign===truth.sign;
  assert.ok(match,'The selected source-key plant should rank first');
  let exact=0, blind=0, total=0;
  for(let i=0;i<PAGE_IDS.length;i++){
    const key=keyStream(truth.seed,PAGE_IDS[i],truth.clock,truth.kind);
    const estimated=viterbi(plant.source[i],key,truth.sign,lm);
    for(let j=0;j<T+H;j++){
      blind+=Number(estimated.plaintext[j]===plant.witness[i].truePlain[j]);
      total++;
    }
    // Exact positive known-witness reproduction already asserted in plant().
    exact+=T+H;
  }
  const report={source:'authentic 2014 Cicada RSA-432 factors',
    modulusBits:432, seeds:Object.keys(SEEDS),
    models:MODELS.length, originalPages:PAGE_IDS,
    prefixFit:T,untouchedContinuation:H,
    bestTrain:best,
    topOriginal:ranked.slice(0,8),
    bestHeldoutExploratory:ranked.slice().sort((a,b)=>
      b.heldout-a.heldout).slice(0,3),
    plant:{truth:{name:truth.name,kind:truth.kind,
      clock:truth.clock,sign:truth.sign},rank1:match,
      trueForwardReencryption:exact, blindRecovered:blind,
      total,skipWitnesses:plant.witness.map(x=>({page:x.page,
        count:x.skipCount})),bestTrain:top.train,
      heldout:top.heldout}};
  console.log(JSON.stringify(report,null,2));
}
if(require.main===module) main();
module.exports={keyStream,startState,controlPlant,evaluate,main};
