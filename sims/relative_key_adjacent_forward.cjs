'use strict';
/**
 * Exact GP-bigram evidence for LP2 pages28/42 sharing one scale-four key
 * with independent adjacent-output-rewrite channels.
 *
 * Fully sum all 29^2 latent plaintext-pair states, marginalizing every
 * uniform key and every permitted repair. Compare against independent keys,
 * while conditioning on both printed rune-word boundary masks.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=require('./relative_key_english_probe.cjs');
const {train,singleLogZ}=require('./relative_key_forward_likelihood.cjs');
const {channels,channelRegression,encrypt}=require('./relative_key_adjacent_repair_beam.cjs');
const ROOT=path.resolve(__dirname,'..');
const M=29,N=31,START=29,END=30,REWRITE=.81;
const mod=x=>((x%M)+M)%M;

/** The output marginal for an independently uniform key symbol. */
function independentEmission(observed,previous){
  if(previous<0)return 1/M;
  return (observed===previous?1-REWRITE:1+REWRITE/28)/M;
}

/**
 * Log Bayes factor P(outputs | shared iid key, independent GP bigram
 * plaintext) / P(outputs | independent iid keys), conditioned on
 * both observed word boundary masks.
 */
function score(A,B,T,prior,shareProbability=1){
  assert.ok(shareProbability>=0&&shareProbability<=1);
  const n=Math.min(A.xs.length,B.xs.length);
  let state=new Float64Array(M*M),temp=new Float64Array(M*M);
  let next=new Float64Array(M*M),logNumerator=0,logIndependent=0;
  for(let t=0;t<n;t++){
    const prevA=t?A.xs[t-1]:-1,prevB=t?B.xs[t-1]:-1;
    const opts=channels(A.xs[t],B.xs[t],prevA,prevB);
    const independent=independentEmission(A.xs[t],prevA)*
      independentEmission(B.xs[t],prevB);
    const w=new Float64Array(M).fill((1-shareProbability)*independent);
    for(const x of opts)w[x.d]+=shareProbability*x.weight/M;
    logIndependent+=Math.log(independent);
    let z=0;
    if(t===0){
      for(let p=0;p<M;p++)for(let q=0;q<M;q++){
        let x=T[START*N+p]*T[START*N+q]*w[mod(p-q)];
        if(A.end[t])x*=T[p*N+END];
        if(B.end[t])x*=T[q*N+END];
        next[p*M+q]=x;z+=x;
      }
    }else{
      for(let p=0;p<M;p++)for(let v=0;v<M;v++){
        let x=0;
        if(A.start[t]){
          for(let u=0;u<M;u++)x+=state[u*M+v];
          x*=T[START*N+p];
        }else{
          for(let u=0;u<M;u++)x+=state[u*M+v]*T[u*N+p];
        }
        temp[p*M+v]=x;
      }
      for(let p=0;p<M;p++)for(let q=0;q<M;q++){
        let x=0;
        if(B.start[t]){
          for(let v=0;v<M;v++)x+=temp[p*M+v];
          x*=T[START*N+q];
        }else{
          for(let v=0;v<M;v++)x+=temp[p*M+v]*T[v*N+q];
        }
        x*=w[mod(p-q)];
        if(A.end[t])x*=T[p*N+END];
        if(B.end[t])x*=T[q*N+END];
        next[p*M+q]=x;z+=x;
      }
    }
    assert.ok(z>0&&Number.isFinite(z),'Bad forward mass at '+t);
    logNumerator+=Math.log(z);
    for(let k=0;k<M*M;k++)next[k]/=z;
    [state,next]=[next,state];
  }
  return logNumerator-prior-logIndependent;
}

/**
 * Position-conditioned independent GP rune model, including the exact
 * adjacent-rewrite channel but excluding across-position language order.
 * This detects the false-positive route where only printed-word slots
 * explain an apparent cross-page key match.
 */
function iidScore(A,B,marginals,shareProbability=1){
  const n=Math.min(A.xs.length,B.xs.length);
  let score=0;
  for(let t=0;t<n;t++){
    const aSlot=(A.start[t]?1:0)+(A.end[t]?2:0);
    const bSlot=(B.start[t]?1:0)+(B.end[t]?2:0);
    const qa=marginals[aSlot],qb=marginals[bSlot];
    const pa=t?A.xs[t-1]:-1,pb=t?B.xs[t-1]:-1;
    const opts=channels(A.xs[t],B.xs[t],pa,pb);
    const emission=new Float64Array(M);
    for(const opt of opts)emission[opt.d]=opt.weight/M;
    let shared=0;
    for(let p=0;p<M;p++)for(let q=0;q<M;q++){
      shared+=qa[p]*qb[q]*emission[mod(p-q)];
    }
    const independent=independentEmission(A.xs[t],pa)*
      independentEmission(B.xs[t],pb);
    const likelihood=(1-shareProbability)+shareProbability*shared/independent;
    assert.ok(likelihood>0);
    score+=Math.log(likelihood);
  }
  return score;
}

/** Source-rune whole words with the exact physical page word masks. */
function matched(mask,heldout,random){
  const byLength=Array.from({length:35},()=>[]);
  for(const w of heldout)if(w.length<35)byLength[w.length].push(w);
  const xs=[];
  for(let i=0;i<mask.xs.length;){
    assert.equal(mask.start[i],true);
    let j=i+1;
    while(j<mask.xs.length&&!mask.start[j])j++;
    const len=j-i;
    let choices=byLength[len];
    if(!mask.end[j-1]){
      choices=[];
      for(let k=len+1;k<35;k++)choices.push(...byLength[k]);
    }
    assert.ok(choices.length>0);
    const word=choices[Math.floor(random()*choices.length)];
    xs.push(...word.slice(0,len));i=j;
  }
  assert.equal(xs.length,mask.xs.length);
  return {...mask,xs};
}

/** Fixed deterministic RNG for reproducible independently masked controls. */
function rng(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}

/** Small standalone model regression, including exact no-repair identity. */
function regression(){
  channelRegression();
  assert.ok(Math.abs(independentEmission(1,-1)-1/29)<1e-14);
  assert.ok(Math.abs(independentEmission(1,1)-.19/29)<1e-14);
  assert.ok(Math.abs(independentEmission(1,2)-(1+.81/28)/29)<1e-14);
}

/** Perform fixed original comparison with source-matched independent controls. */
function study(trials=50){
  regression();
  const source=fs.readFileSync(path.join(ROOT,'resources/control/shakespeare_first300k.txt'),'utf8');
  const training=base.corpusWords(source.slice(0,240000));
  const heldout=base.corpusWords(source.slice(240000));
  const model=train(training),T=model.conditional;
  const A=base.lp2Page(28),B=base.lp2Page(42),n=A.xs.length;
  const prior=singleLogZ(A,T,n)+singleLogZ(B,T,n);
  const actual=score(A,B,T,prior),random=rng(2026111087);
  assert.ok(Math.abs(score(A,B,T,prior,0))<1e-8,
    'Independent-key mixture endpoint must have zero log Bayes factor');
  const half=134;
  const shortA={...A,xs:A.xs.slice(0,half)};
  const shortB={...B,xs:B.xs.slice(0,half)};
  const shortPrior=singleLogZ(A,T,half)+singleLogZ(B,T,half);
  const mixture=Array.from({length:21},(_,i)=>{
    const fraction=i/20;
    const first=score(shortA,shortB,T,shortPrior,fraction);
    const full=score(A,B,T,prior,fraction);
    const iidFirst=iidScore(shortA,shortB,model.marginal,fraction);
    const iidFull=iidScore(A,B,model.marginal,fraction);
    return {fraction,first,heldout:full-first,full,
      iidFirst,iidHeldout:iidFull-iidFirst,iidFull,
      orderIncrement:first-iidFirst,
      orderHeldoutIncrement:(full-first)-(iidFull-iidFirst)};
  });
  const selected=mixture.slice().sort((x,y)=>y.first-x.first)[0];
  const optimalAll=mixture.slice().sort((x,y)=>y.full-x.full)[0];
  const alternativeRegisters=[
    ['Emerson','emerson_essays_2944.txt'],
    ['Gibran','gibran_prophet_58585.txt']
  ].map(([name,filename])=>{
    const words=base.corpusWords(fs.readFileSync(
      path.join(ROOT,'resources/control',filename),'utf8'));
    const externalModel=train(words);
    const transform=externalModel.conditional;
    const modelPrior=singleLogZ(A,transform,n)+singleLogZ(B,transform,n);
    const modelShortPrior=singleLogZ(A,transform,half)+singleLogZ(B,transform,half);
    const alternatives=mixture.map(({fraction})=>{
      const first=score(shortA,shortB,transform,modelShortPrior,fraction);
      const full=score(A,B,transform,modelPrior,fraction);
      const iidFirst=iidScore(shortA,shortB,externalModel.marginal,fraction);
      const iidFull=iidScore(A,B,externalModel.marginal,fraction);
      return {fraction,first,heldout:full-first,full,
        iidFirst,iidHeldout:iidFull-iidFirst,iidFull,
        orderIncrement:first-iidFirst,
        orderHeldoutIncrement:(full-first)-(iidFull-iidFirst)};
    });
    return {name,trainingWords:words.length,
      sourceFrozenFraction:selected.fraction,
      frozen:alternatives.find(x=>x.fraction===selected.fraction),
      selectedBySource:alternatives.slice().sort((x,y)=>y.first-x.first)[0],
      bestFull:alternatives.slice().sort((x,y)=>y.full-x.full)[0]};
  });
  const positive=[],negative=[];
  for(let i=0;i<trials;i++){
    const a=matched(A,heldout,random),b=matched(B,heldout,random);
    const ka=b.xs.map(()=>Math.floor(M*random()));
    const kb=b.xs.map(()=>Math.floor(M*random()));
    const ca=encrypt(a.xs,ka,random);
    const cb=encrypt(b.xs,ka,random);
    const cd=encrypt(b.xs,kb,random);
    positive.push(score({...A,xs:ca.xs},{...B,xs:cb.xs},T,prior));
    negative.push(score({...A,xs:ca.xs},{...B,xs:cd.xs},T,prior));
  }
  const summary=values=>{
    const sorted=values.slice().sort((a,b)=>a-b);
    return {min:sorted[0],median:sorted[Math.floor(sorted.length/2)],
      max:sorted.at(-1),belowOrEqualOriginal:values.filter(v=>v<=actual).length,
      aboveOrEqualOriginal:values.filter(v=>v>=actual).length,
      lowerTailP:(values.filter(v=>v<=actual).length+1)/(values.length+1),
      upperTailP:(values.filter(v=>v>=actual).length+1)/(values.length+1)};
  };
  return {
    model:'shared uniform per-position key plus 0.81 adjacent-repeat output rewrite, GP-bigram source',
    method:'841-state exact forward marginal, no Viterbi, exact printed word starts/ends',
    n,trainingWords:training.length,trials,
    originalLLR:actual,mixture:{trainingLength:half,selected,optimalAll,
      alternativeRegisters,
      grid:mixture},sourceMatchedSharedKey:summary(positive),
    sourceMatchedIndependentKey:summary(negative),
    caveat:'Tests precisely this noise channel, page synchronization, source register and independent key-symbol prior. It neither recovers plaintext nor excludes other nonuniform/keyed schedules.'
  };
}
if(require.main===module)console.log(JSON.stringify(study(),null,2));
module.exports={independentEmission,score,iidScore,regression,study};
