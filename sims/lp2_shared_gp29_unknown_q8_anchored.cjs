'use strict';
// Algebraic word-conditioned proposals for the strict shared-cycle receiver.
// Injected helpers use the identical pinned dataset and scorer as the baseline.
module.exports=function anchoredTrial(h,pl,seed,steps,restarts,bonus,anchorRate){
 const {rng,scorer,by,TRAIN,mod,maps,dict,key,randomPi,randomK,check,same,encode,decode,sameAction}=h;
 const rand=rng(seed),score=scorer(pl.cipher,bonus),truthScore=score(pl.pi,pl.k),runs=[];
 const train=pl.cipher.slice(0,TRAIN);
 const eligible=train.map((c,g)=>({g,c,words:by[c.length].filter(({w})=>w.every((p,i)=>p!==0||c[i]===0)).map(x=>x.w)})).filter(x=>x.c.length>=3&&x.words.length);
 const pick=a=>a[rand()%a.length],primitive=k=>k.some((v,j)=>v!==k[(j+4)&7]);
 function proposal(){let a=pick(eligible);return {c:a.c,w:pick(a.words),start:rand()%8,g:a.g}}
 function locked(pi,k,avoid){
  const m=maps(pi,k);
  for(let z=0;z<8;z++){
   const a=pick(eligible);if(a.g===avoid)continue;
   const start=rand()%8,w=[];let j=start,ok=true;
   for(let c of a.c){if(c===0&&rand()%2===0){w.push(0);continue}let p=m[j*29+c];if(!p){ok=false;break}w.push(p);j=(j+1)&7}
   if(ok&&dict.has(key(w)))return {c:a.c,w,start,g:a.g};
  }return null;
 }
 function keyFit(pi,k,anchors){
  let out=k.slice(),req=Array(8).fill(-1);
  for(const {c,w,start} of anchors){let j=start;
   for(let i=0;i<c.length;i++){
    if(!w[i]){if(c[i]!==0)return null;continue}
    let v=mod(pi[c[i]]-pi[w[i]]);if(req[j]>=0&&req[j]!==v)return null;
    req[j]=v;j=(j+1)&7;
   }
  }
  for(let j=0;j<8;j++)if(req[j]>=0)out[j]=req[j];
  return primitive(out)?out:null;
 }
 function alphabetFit(pi,k,anchors){
  const adj=Array.from({length:29},()=>[]);
  for(const {c,w,start} of anchors){let j=start;
   for(let i=0;i<c.length;i++){
    let a=w[i],b=c[i];if(!a){if(b!==0)return null;continue}
    let d=k[j];j=(j+1)&7;if((a===b)!==(d===0))return null;
    if(a!==b){adj[a].push([b,d]);adj[b].push([a,mod(-d)])}
   }
  }
  const seen=new Int8Array(29).fill(-1),comps=[],single=[];
  for(let a=0;a<29;a++)if(seen[a]<0){
   const q=[a];seen[a]=0;let mask=1;
   for(let i=0;i<q.length;i++)for(let [b,d] of adj[q[i]]){
    let v=mod(seen[q[i]]+d);
    if(seen[b]>=0){if(seen[b]!==v)return null}
    else{if(mask&(1<<v))return null;mask|=1<<v;seen[b]=v;q.push(b)}
   }
   if(q.length===1&&a!==0)single.push(a);else comps.push(q);
  }
  comps.sort((a,b)=>Number(b.includes(0))-Number(a.includes(0))||b.length-a.length);
  const out=Array(29).fill(-1),opts=comps.map(q=>{
   const shifts=q.includes(0)?[mod(-seen[0])]:Array.from({length:29},(_,i)=>i);
   return shifts.map(t=>{let mask=0,n=0;for(let a of q){let v=mod(seen[a]+t);mask|=1<<v;if(pi[a]===v)n++}return {t,mask,priority:n+rand()/4294967296}}).sort((a,b)=>b.priority-a.priority);
  });
  let nodes=0;
  function pack(i,used){
   if(i===comps.length)return used;if(++nodes>128)return -1;
   for(let o of opts[i])if(!(o.mask&used)){
    for(let a of comps[i])out[a]=mod(seen[a]+o.t);
    let v=pack(i+1,used|o.mask);if(v>=0)return v;
   }return -1;
  }
  let used=pack(0,0);if(used<0)return null;
  for(let a of single)if(!(used&(1<<pi[a]))){out[a]=pi[a];used|=1<<pi[a]}
  let free=[];for(let v=0;v<29;v++)if(!(used&(1<<v)))free.push(v);
  for(let a of single)if(out[a]<0){let i=rand()%free.length;out[a]=free[i];free.splice(i,1)}
  if(new Set(out).size!==29||out[0]!==0)throw Error("pack invariant");
  return out;
 }
 let best=-Infinity,bestPi,bestK;
 for(let r=0;r<restarts;r++){
  let pi=randomPi(rand),k=randomK(rand),s=score(pi,k),initial=s,accepted=0,bestLocal=s;
  let moves={swap:[0,0],key:[0,0],keyAnchor:[0,0],piAnchor:[0,0],lockedKey:[0,0],lockedPi:[0,0]};
  for(let i=0;i<steps;i++){
   let mode=rand()%100,pp=pi.slice(),kk=k.slice(),name;const temp=4*Math.pow(.035,i/steps);
   if(mode<anchorRate){
    const type=rand()%2,useLock=rand()%3===0,a=proposal(),lock=useLock?locked(pi,k,a.g):null,anchors=lock?[a,lock]:[a];
    name=type?(lock?"lockedPi":"piAnchor"):(lock?"lockedKey":"keyAnchor");moves[name][0]++;
    if(type){pp=alphabetFit(pi,k,anchors);if(!pp)continue}
    else{kk=keyFit(pi,k,anchors);if(!kk)continue}
    for(let x of anchors)check(same(encode(x.w,pp,kk,x.start),x.c),"anchor forward invariant");
   }else if(mode<anchorRate+Math.floor((100-anchorRate)*.65)){
    name="swap";moves[name][0]++;let a=1+rand()%28,b=1+rand()%28;[pp[a],pp[b]]=[pp[b],pp[a]];
   }else{name="key";moves[name][0]++;let a=rand()%8;kk[a]=rand()%29;if(!primitive(kk))continue}
   let z=score(pp,kk);
   if(z>=s||rand()/4294967296<Math.exp((z-s)/temp)){pi=pp;k=kk;s=z;accepted++;moves[name][1]++;if(z>bestLocal)bestLocal=z}
   if(s>best){best=s;bestPi=pi.slice();bestK=k.slice()}
  }runs.push({initial,best:bestLocal,accepted,moves});
 }
 const found=pl.cipher.map(c=>decode(c,bestPi,bestK)),actual=pl.cipher.map(c=>decode(c,pl.pi,pl.k));
 return {truthScore,best,pi:bestPi,k:bestK,actionExact:sameAction(bestPi,bestK,pl.pi,pl.k),trainSupported:found.slice(0,TRAIN).filter(v=>v.length).length,trainTruth:found.slice(0,TRAIN).filter((v,i)=>v.some(w=>same(w,pl.truth[i]))).length,holdoutSupported:found.slice(TRAIN).filter(v=>v.length).length,holdoutTruth:found.slice(TRAIN).filter((v,i)=>v.some(w=>same(w,pl.truth[TRAIN+i]))).length,plantedSupported:actual.filter(v=>v.length).length,runs};
};
