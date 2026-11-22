'use strict';
/**
 * Exact adjacent-doublet emission inversion for the proposed shared scale-4
 * LP2 page28/page42 key. Conditional on the already-observed previous glyph,
 * a raw repeated glyph is rewritten with probability 0.81 to one of the
 * other 28 runes; otherwise it is emitted unchanged.
 *
 * Marginalize the unknown uniform shared key at each position. Only up to
 * four plaintext differences are legal after the two independent repairs.
 * Viterbi over a GP dictionary/trigram product recovers candidate plaintext,
 * a compatible key, and a concrete repair history. This is a hypothesis test,
 * not an assumed Cicada mechanism.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=require('./relative_key_english_probe.cjs');
const {trainTrigram}=require('./relative_key_trigram_probe.cjs');
const {trainDictionary,step}=require('./relative_key_dictionary_beam.cjs');
const ROOT=path.resolve(__dirname,'..');
const MOD=29,SCALE=4,INV=22,REWRITE=.81;
const GP=JSON.parse(fs.readFileSync(path.join(ROOT,'resources/liber-primus/lp2-corpus.json'),'utf8')).translit;
const mod=x=>((x%MOD)+MOD)%MOD;

/** Probability of output given raw symbol and previous observed symbol. */
function emit(observed,previous,raw){
  if(previous<0)return observed===raw?1:0;
  if(raw!==previous)return observed===raw?1:0;
  return observed===raw?1-REWRITE:REWRITE/28;
}

/**
 * Collapse all exact raw-key assignments to four or fewer relative
 * plaintext differences; retain the highest-weight raw assignment as an
 * explicit witness. Each assignment corresponds to exactly one common key.
 */
function channels(observedA,observedB,previousA,previousB){
  const candidatesA=previousA>=0&&previousA!==observedA?
    [observedA,previousA]:[observedA];
  const candidatesB=previousB>=0&&previousB!==observedB?
    [observedB,previousB]:[observedB];
  const grouped=new Map();
  for(const rawA of candidatesA)for(const rawB of candidatesB){
    const weight=emit(observedA,previousA,rawA)*emit(observedB,previousB,rawB);
    if(!weight)continue;
    const d=mod(INV*(rawA-rawB));
    let o=grouped.get(d);
    if(!o){o={d,weight:0,top:0,rawA,rawB};grouped.set(d,o);}
    o.weight+=weight;
    if(weight>o.top){o.top=weight;o.rawA=rawA;o.rawB=rawB;}
  }
  return [...grouped.values()].map(o=>({...o,logWeight:Math.log(o.weight)}));
}

/** Validate the exact channel likelihood against enumeration of 29 keys. */
function channelRegression(){
  let seed=3301;
  const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%29;};
  for(let test=0;test<300;test++){
    const a=rnd(),b=rnd(),previousA=test%7===0?-1:rnd();
    const previousB=test%7===0?-1:rnd();
    const p=rnd(),q=rnd(),d=mod(p-q),opts=channels(a,b,previousA,previousB);
    const expectation=opts.find(x=>x.d===d)?.weight??0;
    let brute=0;
    for(let k=0;k<MOD;k++)brute+=
      emit(a,previousA,mod(SCALE*p+k))*emit(b,previousB,mod(SCALE*q+k));
    assert.ok(Math.abs(expectation-brute)<1e-12,
      'Exact key marginal failed at test '+test);
  }
}

/**
 * Maximum-likelihood dictionary/trigram candidate under the exact
 * locally marginalized repair channel. Unknown common key is uniform.
 * @param {{xs:number[],start:boolean[],end:boolean[]}} A
 * @param {{xs:number[],start:boolean[],end:boolean[]}} B
 * @param {ReturnType<typeof trainDictionary>} dict
 * @param {Float64Array} lm
 * @param {number} beam
 */
function invert(A,B,dict,lm,beam=2200){
  const n=Math.min(A.xs.length,B.xs.length);
  let states=[{a:0,b:0,score:0,prev:null,p:-1,q:-1,rawA:-1,rawB:-1,oov:0}];
  let peak=0,expanded=0;
  for(let t=0;t<n;t++){
    const cs=channels(A.xs[t],B.xs[t],t?A.xs[t-1]:-1,t?B.xs[t-1]:-1);
    const unique=new Map();
    for(const state of states){
      if((A.start[t]&&state.a!==0)||(B.start[t]&&state.b!==0))continue;
      const ca=Array.from({length:MOD},(_,p)=>step(state.a,p,A.end[t],dict,lm,true));
      const cb=Array.from({length:MOD},(_,q)=>step(state.b,q,B.end[t],dict,lm,true));
      for(const ch of cs)for(let p=0;p<MOD;p++){
        const q=mod(p-ch.d);
        for(const x of ca[p])for(const y of cb[q]){
          const score=state.score+x.score+y.score+ch.logWeight;
          const id=x.node+','+y.node;
          const old=unique.get(id);
          if(!old||score>old.score)unique.set(id,{
            a:x.node,b:y.node,score,prev:state,p,q,
            rawA:ch.rawA,rawB:ch.rawB,
            oov:state.oov+x.oov+y.oov
          });
          expanded++;
        }
      }
    }
    if(!unique.size)return {status:'no-path',at:t,n};
    peak=Math.max(peak,unique.size);
    states=[...unique.values()].sort((x,y)=>y.score-x.score).slice(0,beam);
  }
  const best=states[0],p=new Uint8Array(n),q=new Uint8Array(n),key=new Uint8Array(n);
  const repairsA=[],repairsB=[];
  let node=best;
  for(let t=n-1;t>=0;t--){
    p[t]=node.p;q[t]=node.q;
    key[t]=mod(node.rawA-SCALE*node.p);
    assert.equal(key[t],mod(node.rawB-SCALE*node.q));
    assert.ok(emit(A.xs[t],t?A.xs[t-1]:-1,node.rawA)>0);
    assert.ok(emit(B.xs[t],t?B.xs[t-1]:-1,node.rawB)>0);
    if(node.rawA!==A.xs[t])repairsA.push(t);
    if(node.rawB!==B.xs[t])repairsB.push(t);
    node=node.prev;
  }
  const spell=(r,starts)=>Array.from(r,(v,i)=>(starts[i]?' ':'')+GP[v]).join('').trim();
  return {status:'success',n,score:best.score,beam,peak,expanded,oov:best.oov,
    inferredRepairA:repairsA.reverse(),inferredRepairB:repairsB.reverse(),
    p:Array.from(p),q:Array.from(q),key:Array.from(key),
    page28:spell(p,A.start),page42:spell(q,B.start)};
}

/** Deterministic pseudorandom source for independently held-out plants. */
function rng(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}

/** Construct a GP-English stream with the exact physical word-length masks. */
function matched(mask,heldout,random){
  const byLength=Array.from({length:35},()=>[]);
  for(const word of heldout)if(word.length<byLength.length)byLength[word.length].push(word);
  const xs=[];
  for(let i=0;i<mask.xs.length;){
    assert.equal(mask.start[i],true);
    let stop=i+1;
    while(stop<mask.xs.length&&!mask.start[stop])stop++;
    const len=stop-i;
    let possibilities=byLength[len];
    if(!mask.end[stop-1]){
      possibilities=[];
      for(let k=len+1;k<byLength.length;k++)possibilities.push(...byLength[k]);
    }
    assert.ok(possibilities.length>0,'No held-out word for rune length '+len);
    const selected=possibilities[Math.floor(random()*possibilities.length)];
    xs.push(...selected.slice(0,len));i=stop;
  }
  assert.equal(xs.length,mask.xs.length);
  return {...mask,xs};
}

/** Original post-key rewrite generator, matching the exact inverse channel. */
function encrypt(plain,key,random){
  const xs=[],repaired=[];
  for(let i=0;i<plain.length;i++){
    const raw=mod(SCALE*plain[i]+key[i]);
    let out=raw;
    if(i&&raw===xs[i-1]&&random()<REWRITE){
      out=mod(raw+1+Math.floor(28*random()));
      repaired.push(i);
    }
    xs.push(out);
  }
  return {xs,repaired};
}

function study(){
  channelRegression();
  const source=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
  const training=base.corpusWords(source.slice(0,240000));
  const heldout=base.corpusWords(source.slice(240000));
  const dict=trainDictionary(training),lm=trainTrigram(training);
  const A=base.lp2Page(28),B=base.lp2Page(42);
  const random=rng(2026111004);
  const pa=matched(A,heldout,random),pb=matched(B,heldout,random);
  const common=pb.xs.map(()=>Math.floor(MOD*random()));
  const independent=pb.xs.map(()=>Math.floor(MOD*random()));
  const ca=encrypt(pa.xs,common,random),cb=encrypt(pb.xs,common,random);
  const cd=encrypt(pb.xs,independent,random);
  const good=invert({...A,xs:ca.xs},{...B,xs:cb.xs},dict,lm);
  const decoy=invert({...A,xs:ca.xs},{...B,xs:cd.xs},dict,lm);
  const actual=invert(A,B,dict,lm);
  const n=good.n;
  return {
    model:'C_j=4P_j+K, independently rewrite adjacent raw-output repeats q=0.81',
    channel:'29-key exact marginal per aligned position, maximum-score dictionary/trigram plaintext pair',
    trainingWords:training.length,lexicon:dict.vocabulary,
    trueKeyControl:{
      n,score:good.score,
      recoveryA:good.p.filter((v,i)=>v===pa.xs[i]).length/n,
      recoveryB:good.q.filter((v,i)=>v===pb.xs[i]).length/n,
      keyRecovery:good.key.filter((v,i)=>v===common[i]).length/n,
      realRepairsA:ca.repaired,realRepairsB:cb.repaired,
      inferredRepairsA:good.inferredRepairA,inferredRepairsB:good.inferredRepairB,
      openingA:good.page28.slice(0,170),openingB:good.page42.slice(0,170)
    },
    independentKeyDecoy:{score:decoy.score,
      inferredA:decoy.inferredRepairA.length,inferredB:decoy.inferredRepairB.length},
    original:{score:actual.score,n:actual.n,peak:actual.peak,expanded:actual.expanded,
      inferredRepairsA:actual.inferredRepairA,inferredRepairsB:actual.inferredRepairB,
      page28:actual.page28,page42:actual.page42},
    warning:'Language-optimized strings and inferred keys are only candidates until exact original ciphertext reconstruction and heldout external evidence agree.'
  };
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={emit,channels,channelRegression,invert,encrypt,study};
