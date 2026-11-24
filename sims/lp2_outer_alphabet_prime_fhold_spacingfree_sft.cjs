"use strict";
const fs=require("node:fs");
function experiment(c,n){
  const mod=x=>((x%29)+29)%29;
  const sections=n.sections.map(s=>({name:s.name,p:[...s.source_text].map(x=>n.runes.indexOf(x)).filter(x=>x>=0)}));
  const train=sections.filter((s,i)=>![1,3,7].includes(i));
  const un=new Float64Array(29).fill(1),bi=new Float64Array(29*29),tri=new Float64Array(29**3),bc=new Float64Array(29),tc=new Float64Array(29*29);
  for(const {p} of train)for(let i=0;i<p.length;i++){const a=p[i];un[a]++;if(i>0){bi[p[i-1]*29+a]++;bc[p[i-1]]++;}if(i>1){const k=p[i-2]*29+p[i-1];tri[k*29+a]++;tc[k]++;}}
  const total=un.reduce((a,b)=>a+b),pr=Array.from(un,x=>x/total),log=pr.map(Math.log);
  const bprob=(a,b)=>(bi[a*29+b]+10*pr[b])/(bc[a]+10);
  const tprob=(a,b,d)=>(tri[(a*29+b)*29+d]+10*bprob(b,d))/(tc[a*29+b]+10);
  const logTri=Float64Array.from({length:29**3},(_,i)=>Math.log(tprob(Math.floor(i/841),Math.floor(i/29)%29,i%29)));
  const logBi=Float64Array.from({length:841},(_,i)=>Math.log(bprob(Math.floor(i/29),i%29)));
  function score(p,ctx=[]){let a=ctx.at(-2),b=ctx.at(-1),s=0;for(const d of p){s+=a!==undefined?logTri[(a*29+b)*29+d]:b!==undefined?logBi[b*29+d]:log[d];a=b;b=d;}return s;}
  const primes=[];for(let x=2;primes.length<2000;x++){let good=true;for(const p of primes){if(p*p>x)break;if(x%p===0){good=false;break;}}if(good)primes.push(x);}
  const shifts=primes.map(x=>mod(x-1));
  const id=Array.from({length:29},(_,i)=>i);
  function enc(p,key,start=0){let j=start;const forward=id.map(x=>key.indexOf(x));return p.map(x=>x===0?0:forward[mod(x+shifts[j++])]);}
  function decMask(ct,key,mask,start=0){let j=start,z=0;const p=[];for(const v of ct){if(v===0&&((mask>>>z++)&1)){p.push(0);continue;}const x=mod(key[v]-shifts[j++]);if(x===0)return null;p.push(x);}return {p,j};}
  function hung(w){const N=29,u=new Float64Array(N+1),v=new Float64Array(N+1),p=new Int32Array(N+1),way=new Int32Array(N+1);
    for(let i=1;i<=N;i++){p[0]=i;let j0=0;const minv=new Float64Array(N+1).fill(Infinity),used=new Uint8Array(N+1);do{used[j0]=1;let i0=p[j0],delta=Infinity,j1=0;for(let j=1;j<=N;j++)if(!used[j]){const cur=-w[(i0-1)*N+j-1]-u[i0]-v[j];if(cur<minv[j]){minv[j]=cur;way[j]=j0;}if(minv[j]<delta){delta=minv[j];j1=j;}}for(let j=0;j<=N;j++){if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else minv[j]-=delta;}j0=j1;}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0);}
    const key=new Array(N);for(let j=1;j<=N;j++)key[p[j]-1]=j-1;return key;
  }
  const bad=-1e6;
  function refine(ct,cand){
    let cur=cand,iterations=0;
    for(;iterations<40;iterations++){
      let winner=cur;
      for(let a=1;a<29;a++)for(let b=a+1;b<29;b++){
        const key=cur.key.slice();[key[a],key[b]]=[key[b],key[a]];
        const d=decMask(ct,key,cur.mask);if(!d)continue;
        const t=score(d.p);
        if(t>winner.t+1e-9)winner={key,mask:cur.mask,t,...d};
      }
      if(winner===cur)break;
      cur=winner;
    }
    return {...cur,iterations};
  }
  function fit(ct,cap=16,doRefine=true){
    const z=ct.filter(x=>x===0).length;if(z>cap)return {z,skipped:true};
    let feasible=0,bestUni=-Infinity,bestTri=null;const keys=new Set(),top=[];
    for(let mask=0;mask<(1<<z);mask++){
      const freq=new Uint16Array(841);let j=0,h=0,zi=0;
      for(const x of ct){if(x===0&&((mask>>>zi++)&1)){h++;continue;}freq[x*29+shifts[j++]]++;}
      const w=new Float64Array(841);
      for(let r=0;r<29;r++)for(let k=0;k<29;k++){if((r===0)!==(k===0)||freq[r*29+k]){w[r*29+k]=bad;continue;}let s=0;for(let x=0;x<29;x++)if(freq[r*29+x])s+=freq[r*29+x]*log[mod(k-x)];w[r*29+k]=s;}
      const key=hung(w);if(key.some((k,r)=>w[r*29+k]===bad))continue;
      feasible++;keys.add(key.join(","));
      const s=h*log[0]+key.reduce((a,k,r)=>a+w[r*29+k],0);
      if(s>bestUni)bestUni=s;
      const d=decMask(ct,key,mask);if(!d)throw Error("assignment legality");
      const t=score(d.p);
      const cand={key,mask,t,...d};
      if(!bestTri||t>bestTri.t)bestTri=cand;
      if(doRefine&&(top.length<16||t>top.at(-1).t)){top.push(cand);top.sort((a,b)=>b.t-a.t);if(top.length>16)top.pop();}
    }
    const beforeRefine=bestTri?.t/ct.length;
    if(doRefine)for(const cand of top){const improved=refine(ct,cand);if(improved.t>bestTri.t+1e-9)bestTri=improved;}
    return {z,feasible,masks:1<<z,distinctKeys:keys.size,bestUni:Number.isFinite(bestUni)?bestUni/ct.length:null,beforeRefine,refinedStarts:top.length,bestTri};
  }
  function predict(ct,fit){const z=ct.filter(x=>x===0).length;if(z>16)return {skipped:true,z};if(!fit)return null;let best=null,legal=0;for(let mask=0;mask<(1<<z);mask++){const d=decMask(ct,fit.key,mask,fit.j);if(!d)continue;legal++;const s=score(d.p,fit.p.slice(-2));if(!best||s>best.s)best={...d,s,mask};}return {legal,best};}
  function compact(a){if(!a)return null;const {p,...rest}=a;return rest;}
  function readout(p){return p.map(x=>c.translit[x]).join(" ");}
  function equal(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i]);}
  function randomPerm(seed){let x=seed>>>0,k=id.slice();for(let i=28;i>1;i--){x^=x<<13;x^=x>>>17;x^=x<<5;const j=1+(x>>>0)%i;[k[i],k[j]]=[k[j],k[i]];}return k;}
  function trial(name,ct,cut,truth=null,key=null){
    const f=fit(ct.slice(0,cut));const h=predict(ct.slice(cut),f.bestTri);const full=fit(ct,16,false);
    const b=f.bestTri,tail=h?.best;const plain=b&&tail?b.p.concat(tail.p):null;
    const replay=plain?equal(enc(plain,b.key),ct):null;
    if(plain&&!replay)throw Error("replay");
    return {name,n:ct.length,cut,ctZeros:ct.filter(x=>!x).length,prefix:{...f,bestTri:b?{...compact(b),readout:readout(b.p),avgTri:b.t/cut}:null},holdout:h?{legal:h.legal,skipped:h.skipped,best:tail?{...compact(tail),readout:readout(tail.p),avgTri:tail.s/(ct.length-cut)}:null}:null,full:{z:full.z,skipped:full.skipped,feasible:full.feasible,masks:full.masks,bestUni:full.bestUni,distinctKeys:full.distinctKeys},replay,truth:truth?{knownKey:key,matchedKey:b&&key?b.key.filter((x,i)=>x===key[i]).length:null,prefixMatched:b?b.p.filter((x,i)=>x===truth[i]).length:null,holdoutMatched:tail?tail.p.filter((x,i)=>x===truth[cut+i]).length:null,avgNativeUni:truth.reduce((s,x)=>s+log[x],0)/truth.length,avgNativeTri:score(truth)/truth.length}:null};
  }
  const p56=sections[7].p,auth=c.pages[56].indices;
  if(!equal(enc(p56,id),auth))throw Error("authentic control mismatch");
  const targets=[trial("authentic-p56",auth,60,p56,id)];
  for(const [i,seed] of [[1,0x13c1cada],[3,0x29c1cada]]){const p=sections[i].p.slice(0,308),k=randomPerm(seed);targets.push(trial("plant-"+sections[i].name,enc(p,k),208,p,k));}
  targets.push(trial("original-p54-55",c.pages.slice(54,56).flatMap(x=>x.indices),208));
  targets.push(trial("original-p40-41",c.pages.slice(40,42).flatMap(x=>x.indices).slice(0,300),200));
  targets.push(trial("original-p0-2-black-body-first300",c.pages.slice(0,3).flatMap(x=>x.indices).slice(13,313),200));
  return {method:"outer F-fixing ciphertext alphabet permutation after authentic prime-minus-one shift; latent F; exact per-mask unigram assignment, then top-16 prefix trigram local-swap refinement; frozen key/cursor suffix",training:train.map(s=>s.name),authenticReplay:true,targets};
}
const c=JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json","utf8"));
const n=JSON.parse(fs.readFileSync("resources/external/relikd-solved-gp29-native-v1.json","utf8"));
console.log(JSON.stringify(experiment(c,n),null,2));
