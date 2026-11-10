'use strict';
/**
 * Does a fixed word-local reversal before shared-pad encryption explain
 * LP2 pages 28/42 better than the known forward-word hypothesis?
 *
 * Both original pages are tested without using their plaintext. Four fixed
 * orientation pairs (forward/reverse for each page) are compared against
 * authentic source-disjoint Shakespeare word samples with exact word masks.
 * D=C28-C42=4(P28-P42) mod29 under the candidate common pad.
 * All 29^n compatible plaintext pairs are marginalized in O(29^2*n).
 *
 * This is a conditional structural test, not an original key recovery.
 * Usage: node sims/relative_key_word_reversal_marginal.cjs
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {corpusWords,lp2Page}=require('./relative_key_english_probe.cjs');
const prior=require('./relative_key_forward_likelihood.cjs');
const M=29, W=31, START=29, END=30, INVERSE4=22;
const mod=n=>(n%M+M)%M;
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function random(seed){let s=seed>>>0;return ()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};}
function reverseWords(words){return words.map(w=>w.slice().reverse());}
function singleModel(page,model,n){return prior.singleLogZ(page,model.conditional,n);}
/**
 * Exact 29-state marginalization with an independent language model for
 * each original page. All probabilities computed from source text only.
 * @param {{xs:number[],start:boolean[],end:boolean[]}} a
 * @param {{xs:number[],start:boolean[],end:boolean[]}} b
 * @param {{conditional:Float64Array}} am
 * @param {{conditional:Float64Array}} bm
 * @param {number} shift
 * @returns {number}
 */
function exactPair(a,b,am,bm,shift=0){
  const n=Math.min(a.xs.length,b.xs.length);
  const A=am.conditional,B=bm.conditional;
  const denominator=singleModel(a,am,n)+singleModel(b,bm,n);
  let old=new Float64Array(M),next=new Float64Array(M),log=0;
  for(let t=0;t<n;t++){
    const k=(t+shift)%b.xs.length;
    const d=mod(INVERSE4*(a.xs[t]-b.xs[k]));
    const previousD=t?mod(INVERSE4*(a.xs[t-1]-b.xs[(t+shift-1)%b.xs.length])):0;
    let z=0;
    for(let p=0;p<M;p++){
      const q=mod(p-d);
      let v=0;
      if(t===0){v=A[START*W+p]*B[START*W+q];}
      else for(let s=0;s<M;s++){
        const r=mod(s-previousD);
        const x=a.start[t]?A[START*W+p]:A[s*W+p];
        const y=b.start[t]?B[START*W+q]:B[r*W+q];
        v+=old[s]*x*y;
      }
      if(a.end[t])v*=A[p*W+END];
      if(b.end[t])v*=B[q*W+END];
      next[p]=v;z+=v;
    }
    assert.ok(z>0);
    log+=Math.log(z);
    for(let p=0;p<M;p++)next[p]/=z;
    [old,next]=[next,old];
  }
  return log-denominator+n*Math.log(M);
}
function iidPair(a,b,am,bm,shift=0){
  const n=Math.min(a.xs.length,b.xs.length);
  let log=0;
  for(let t=0;t<n;t++){
    const d=mod(INVERSE4*(a.xs[t]-b.xs[(t+shift)%b.xs.length]));
    const av=am.marginal[(a.start[t]?1:0)+(a.end[t]?2:0)];
    const bv=bm.marginal[(b.start[t]?1:0)+(b.end[t]?2:0)];
    let x=0;
    for(let p=0;p<M;p++)x+=av[p]*bv[mod(p-d)];
    log+=Math.log(M*x);
  }
  return log;
}
function score(a,b,am,bm,shift=0){
  const forward=exactPair(a,b,am,bm,shift);
  const iid=iidPair(a,b,am,bm,shift);
  return {forward,iid,excess:forward-iid};
}
function matched(mask,english,rnd,reverse=false){
  const byLength=new Map();
  for(const w of english){
    let a=byLength.get(w.length);if(!a)byLength.set(w.length,a=[]);a.push(w);
  }
  const all=[],indices=[];
  for(let at=0;at<mask.xs.length;){
    assert.equal(mask.start[at],true);
    let to=at+1;
    while(to<mask.xs.length&&!mask.start[to])to++;
    const len=to-at,possibles=[];
    if(mask.end[to-1])possibles.push(...(byLength.get(len)||[]));
    else for(const [size,rows] of byLength)if(size>len)possibles.push(...rows);
    assert.ok(possibles.length,'No heldout GP word at length '+len);
    let pick=possibles[Math.floor(rnd()*possibles.length)].slice();
    if(reverse)pick.reverse();
    all.push(...pick.slice(0,len));
    at=to;
  }
  assert.equal(all.length,mask.xs.length);
  return {...mask,xs:all};
}
function encryptShared(a,b,rnd){
  const n=Math.min(a.xs.length,b.xs.length);
  const key=Array.from({length:Math.max(a.xs.length,b.xs.length)},()=>Math.floor(rnd()*M));
  return [{...a,xs:a.xs.map((x,i)=>mod(4*x+key[i]))},
          {...b,xs:b.xs.map((x,i)=>mod(4*x+key[i]))}];
}
function run(){
  const source=read('resources/control/shakespeare_first300k.txt');
  const training=corpusWords(source.slice(0,240000));
  const holdout=corpusWords(source.slice(240000));
  const models=[prior.train(training),prior.train(reverseWords(training))];
  const a=lp2Page(28),b=lp2Page(42);
  const cells=[];
  const actual=[];
  for(let oa=0;oa<2;oa++)for(let ob=0;ob<2;ob++){
    const name=(oa?'reverse':'forward')+'/'+(ob?'reverse':'forward');
    const all=Array.from({length:b.xs.length},(_,shift)=>score(a,b,models[oa],models[ob],shift));
    const at=all[0],ranks={};
    for(const k of ['forward','iid','excess'])
      ranks[k]=1+all.slice(1).filter(x=>x[k]>=at[k]).length;
    cells.push({name,oa,ob,original:at,rotationRanks:ranks,
      maximumControlShiftExcess:Math.max(...all.slice(1).map(x=>x.excess)),
      bestShiftByExcess:all.map((x,i)=>[i,x.excess]).sort((x,y)=>y[1]-x[1])[0][0]});
    actual.push(at);
  }
  const largestActual=Math.max(...actual.map(x=>x.excess));
  const allShiftMax=[];
  for(let shift=1;shift<b.xs.length;shift++){
    let best=-Infinity;
    for(let oa=0;oa<2;oa++)for(let ob=0;ob<2;ob++)
      best=Math.max(best,score(a,b,models[oa],models[ob],shift).excess);
    allShiftMax.push(best);
  }
  const random= random(0x3301c5a7),controlTrials=150;
  const controls=Array.from({length:4},()=>[]);
  const wrongModels=Array.from({length:4},()=>[]);
  for(let t=0;t<controlTrials;t++){
    const oa=t%2,ob=(t>>1)%2;
    const p=matched(a,holdout,random,Boolean(oa)),q=matched(b,holdout,random,Boolean(ob));
    const [ca,cb]=encryptShared(p,q,random);
    for(let i=0;i<4;i++){
      const mi=i>>1,mj=i&1;
      const v=score(ca,cb,models[mi],models[mj]).excess;
      controls[i].push(v);
      if(mi!==oa||mj!==ob)wrongModels[i].push(v);
    }
  }
  const summary=controls.map((xs,i)=>{
    const same=xs.filter((_,j)=>((j%2)*2+((j>>1)%2))===i);
    const wrong=wrongModels[i];
    const stat=rows=>({n:rows.length,mean:rows.reduce((s,x)=>s+x,0)/rows.length,
      median:rows.slice().sort((x,y)=>x-y)[Math.floor(rows.length/2)],
      minimum:Math.min(...rows),maximum:Math.max(...rows)});
    return {name:cells[i].name,sourceModelCorrect:stat(same),
      sourceModelIncorrect:stat(wrong),
      realExcess:cells[i].original.excess,
      sourceTrueKeyLowerTailP:(1+same.filter(v=>v<=cells[i].original.excess).length)/(same.length+1)};
  });
  const check=prior.forwardLLR(a,b,models[0].conditional,INVERSE4,0,
    prior.singleLogZ(a,models[0].conditional,269)+prior.singleLogZ(b,models[0].conditional,269));
  assert.ok(Math.abs(check-cells[0].original.forward)<1e-7,'Existing forward baseline changed');
  assert.ok(Math.abs(cells[0].original.forward+1.643180)<0.001,'Existing real score drift');
  const result={
    model:'source-matched exact two-time-pad with word-local reversal before shared factor-four pad',
    sourcePages:[28,42],nAligned:269,
    orientations:cells,rotationNull:{
      candidateStatistic:'maximum forward-minus-slotIID across all four fixed reversal combinations',
      original:largestActual,n:b.xs.length-1,
      mean:allShiftMax.reduce((s,x)=>s+x,0)/allShiftMax.length,
      max:Math.max(...allShiftMax),
      pUpper:(1+allShiftMax.filter(x=>x>=largestActual).length)/(allShiftMax.length+1)
    },
    controlTrials,positiveControls:summary,
    caveat:'Selected page pair, scale and reversal possibility are exploratory. Independent pad is not recovered; any putative original decipherment must meet text and re-encryption gates.'
  };
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={run,score,exactPair,iidPair,matched};
