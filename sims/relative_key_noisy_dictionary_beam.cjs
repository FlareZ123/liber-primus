'use strict';
/**
 * Noisy two-time-pad inversion for LP2 page28/page42.
 *
 * Candidate: C28=4*P28+K, C42=4*P42+K (mod29). Independently on
 * each page, a proposed repeated output is rerouted uniformly to another
 * rune with probability .81, while always spending that key symbol.
 * Hence observed D=22*(C28-C42) may differ from P28-P42 at ~5.6% of
 * positions, invalidating hard difference constraints in strict decoders.
 *
 * We augment the dual GP-word-trie automaton with a per-symbol corruption
 * channel, and reconstruct both candidate plaintext streams with beam search.
 * Positive controls use a genuinely shared random key plus *independent*
 * post-key collision repairs. The early hypothesis is not a recovered key.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=require('./relative_key_english_probe.cjs');
const {trainTrigram}=require('./relative_key_trigram_probe.cjs');
const {trainDictionary,step}=require('./relative_key_dictionary_beam.cjs');
const ROOT=path.resolve(__dirname,'..');
const MOD=29,SCALE=4,INV=22,ORIGINAL_REPAIR=.81;
const GP=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8')).translit;
const mod=x=>((x%MOD)+MOD)%MOD;
/** @param {number} seed */
function rng(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}

/**
 * Add a candidate to a beam-compatible state map.
 * Keep the best score at equal (automaton states, error count).
 * @param {Map<string,object>} unique
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 * @param {number} cost
 * @param {boolean} corrupt
 */
function insert(unique,parent,a,b,cost,corrupt) {
  const e=parent.errors+(corrupt?1:0);
  const score=parent.score+a.score+b.score+cost;
  const key=a.node+','+b.node+','+e;
  const old=unique.get(key);
  if(!old||score>old.score)unique.set(key,{
    a:a.node,b:b.node,score,prev:parent,p:a.rune,q:b.rune,
    errors:e,oovWords:parent.oovWords+a.oov+b.oov,corrupt
  });
}

/**
 * Solve a product word-trie state sequence with observed independent repair.
 *
 * @param {{xs:number[],start:boolean[],end:boolean[]}} A
 * @param {{xs:number[],start:boolean[],end:boolean[]}} B
 * @param {ReturnType<typeof trainDictionary>} dict
 * @param {Float64Array} lm
 * @param {{beam?:number,noisyTop?:number,epsilon?:number,errorBudget?:number}} cfg
 */
function invertNoisy(A,B,dict,lm,cfg={}){
  const beam=cfg.beam??800,noisyTop=cfg.noisyTop??14,epsilon=cfg.epsilon??0.056;
  const perErrorBeam=cfg.perErrorBeam??96;
  const errorBudget=cfg.errorBudget??26;
  const n=Math.min(A.xs.length,B.xs.length),logExact=Math.log(1-epsilon);
  const logWrong=Math.log(epsilon/28);
  assert.ok(n>0);assert.equal(mod(SCALE*INV),1);
  const D=Array.from({length:n},(_,i)=>mod(INV*(A.xs[i]-B.xs[i])));
  let states=[{a:0,b:0,score:0,prev:null,p:-1,q:-1,errors:0,oovWords:0}];
  let peakUnique=0,expanded=0;
  for(let t=0;t<n;t++){
    const unique=new Map(),d=D[t],endA=A.end[t],endB=B.end[t];
    for(const state of states){
      if((A.start[t]&&state.a!==0)||(B.start[t]&&state.b!==0))continue;
      const ca=Array.from({length:MOD},(_,r)=>step(state.a,r,endA,dict,lm,true)
        .map(z=>({...z,rune:r})));
      const cb=Array.from({length:MOD},(_,r)=>step(state.b,r,endB,dict,lm,true)
        .map(z=>({...z,rune:r})));
      for(let p=0;p<MOD;p++){
        const q=mod(p-d);
        for(const a of ca[p])for(const b of cb[q]){
          insert(unique,state,a,b,logExact,false);expanded++;
        }
      }
      if(state.errors>=errorBudget)continue;
      const shortlistA=ca.flat().sort((x,y)=>y.score-x.score).slice(0,noisyTop);
      const shortlistB=cb.flat().sort((x,y)=>y.score-x.score).slice(0,noisyTop);
      for(const a of shortlistA)for(const b of shortlistB){
        if(mod(a.rune-b.rune)===d)continue;
        insert(unique,state,a,b,logWrong,true);expanded++;
      }
    }
    if(!unique.size)return {status:'no-path',at:t,n,beam};
    peakUnique=Math.max(peakUnique,unique.size);
    // Keep all error-count strata alive. An unstratified global beam
    // loses the true no-error path and can score worse than its own submodel.
    const layer=Array.from({length:errorBudget+1},()=>[]);
    for(const item of unique.values())layer[item.errors].push(item);
    states=layer.flatMap((items,e)=>items.sort((a,b)=>b.score-a.score)
      .slice(0,e===0?beam:perErrorBeam));
  }
  const best=states[0],p=new Uint8Array(n),q=new Uint8Array(n),err=[];
  let node=best;
  for(let t=n-1;t>=0;t--){
    p[t]=node.p;q[t]=node.q;if(node.corrupt)err.push(t);
    node=node.prev;
  }
  err.reverse();
  const text=(r,starts)=>Array.from(r,(v,i)=>(starts[i]?' ':'')+GP[v]).join('').trim();
  const sharedA=Array.from(p,(v,i)=>mod(A.xs[i]-SCALE*v));
  const sharedB=Array.from(q,(v,i)=>mod(B.xs[i]-SCALE*v));
  const disagreements=sharedA.filter((v,i)=>v!==sharedB[i]).length;
  assert.equal(disagreements,best.errors);
  return {status:'success',n,score:best.score,errors:best.errors,
    errorSites:err,oovWords:best.oovWords,peakUnique,expanded,beam,noisyTop,perErrorBeam,
    p:Array.from(p),q:Array.from(q),pText:text(p,A.start),qText:text(q,B.start),
    keyA:sharedA,keyB:sharedB,
    sharedKeyFraction:1-best.errors/n};
}

/**
 * Shared-key encryption with independent duplicate avoidance per page.
 * Key always advances even when a repeated candidate is replaced.
 * @param {number[]} p
 * @param {number[]} key
 * @param {()=>number} random
 */
function crypt(p,key,random){
  const xs=[],repaired=[];
  for(let i=0;i<p.length;i++){
    const candidate=mod(SCALE*p[i]+key[i]),prev=i?xs[i-1]:-1;
    let value=candidate,wasRepaired=false;
    if(candidate===prev&&random()<ORIGINAL_REPAIR){
      value=mod(candidate+1+Math.floor(random()*28));wasRepaired=true;
    }
    xs.push(value);if(wasRepaired)repaired.push(i);
  }
  return {xs,repaired};
}

function study({beam=800,noisyTop=14,epsilon=.056,errorBudget=26,perErrorBeam=96}={}){
  const source=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
  const trainWords=base.corpusWords(source.slice(0,240000));
  const testWords=base.corpusWords(source.slice(240000));
  const dict=trainDictionary(trainWords),lm=trainTrigram(trainWords);
  const A=base.lp2Page(28),B=base.lp2Page(42);
  assert.equal(A.xs.length,269);assert.equal(B.xs.length,272);
  const pa=base.stream(testWords.slice(0,400),269),pb=base.stream(testWords.slice(500,900),269);
  assert.equal(pa.xs.length,269);assert.equal(pb.xs.length,269);
  const random=rng(2026111003),key=pa.xs.map(()=>Math.floor(random()*MOD));
  const ca=crypt(pa.xs,key,random),cb=crypt(pb.xs,key,random);
  const plantA={...pa,xs:ca.xs},plantB={...pb,xs:cb.xs};
  const cfg={beam,noisyTop,epsilon,errorBudget,perErrorBeam};
  const planted=invertNoisy(plantA,plantB,dict,lm,cfg);
  const aCorrect=planted.status==='success'?
    planted.p.filter((x,i)=>x===pa.xs[i]).length/269:null;
  const bCorrect=planted.status==='success'?
    planted.q.filter((x,i)=>x===pb.xs[i]).length/269:null;
  const actual=invertNoisy(A,B,dict,lm,cfg);
  const baseline=invertNoisy(A,B,dict,lm,{...cfg,epsilon:0.000001,errorBudget:0});
  return {hypothesis:'C28-C42=4(P28-P42)+postkey-repair-error mod29',
    dictionarySize:dict.vocabulary,trainingTokens:trainWords.length,
    epsilon,repairQ:ORIGINAL_REPAIR,configuration:cfg,
    positive:{n:269,repairedPage28:ca.repaired,repairedPage42:cb.repaired,
      actualCorruptSites:ca.xs.filter((_,i)=>mod(pa.xs[i]-pb.xs[i])!==
      mod(INV*(ca.xs[i]-cb.xs[i]))).length,
      accuracyA:aCorrect,accuracyB:bCorrect,
      inferredErrors:planted.errors,plantScore:planted.score,
      opening:planted.pText?.slice(0,120)},
    real:{n:actual.n,score:actual.score,errors:actual.errors,
      errorSites:actual.errorSites,sharedKeyFraction:actual.sharedKeyFraction,
      peakUnique:actual.peakUnique,expanded:actual.expanded,
      page28:actual.pText?.slice(0,440),page42:actual.qText?.slice(0,440)},
    exactCase:{score:baseline.score,errors:baseline.errors,
      page28:baseline.pText?.slice(0,200)},
    caveat:'The inferred common key agrees only where the model forces matching residues. Recovered natural language and independent key prediction, not this tautological fit, are required to establish a solution.'};
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={invertNoisy,crypt,study};
