'use strict';
const fs=require('node:fs');
function run(data,width=12){
 const cp=JSON.parse(data[0]),native=JSON.parse(data[1]);
 const ranges=[[0,2,13],[3,7,16],[8,14,12],[15,22,20],[23,26,16],[27,32,19],[33,39,10],[40,53,8],[54,55,9]];
 const geo=ranges.map(([s,e,o])=>{const pages=cp.pages.filter(p=>p.page>=s&&p.page<=e),c=pages.flatMap(p=>p.indices.slice(p.page===s?o:0));return{range:[s,e,o],N:c.length,cut:c.length-pages.at(-1).indices.length,c};});
 const maxN=Math.max(...geo.map(x=>x.N)), maxCut=Math.max(...geo.map(x=>x.cut));
 const F=[1,2];while(F.at(-1)+F.at(-2)<maxN)F.push(F.at(-1)+F.at(-2));if(F.at(-1)>=maxCut)throw Error("holdout introduces unobserved digit");
 const mask=Array.from({length:maxN},(_,n)=>{let m=0;for(let k=F.length-1;k>=0;k--)if(n>=F[k]){n-=F[k];m|=1<<k;}if(n)throw Error("mask");return m;});
 const mod=x=>((x%29)+29)%29,inv=Array(29).fill(0);for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a*b%29===1)inv[a]=b;
 const labels=cp.translit.map((s,i)=>[s,i]).sort((a,b)=>b[0].length-a[0].length);
 function encode(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replaceAll("QU","CW").replaceAll("V","U").replace(/[KQ]/g,"C").replaceAll("Z","S");while(w.length){const f=w.startsWith("ING")?["ING",21]:w.startsWith("IO")?["IO",27]:labels.find(([l])=>w.startsWith(l));if(!f){w=w.slice(1);continue;}out.push(f[1]);w=w.slice(f[0].length);}}return out;}
 const rmap=new Map(cp.runes.map((r,i)=>[r,i]));
 const refs=[...native.sections.map(s=>Array.from(s.source_text).filter(r=>rmap.has(r)).map(r=>rmap.get(r))),encode(data[2])],donors=[encode(data[3]),encode(data[4])];
 const u=new Float64Array(29).fill(.5),b=new Float64Array(841),t=new Float64Array(24389);
 for(const p of refs)for(let i=0;i<p.length;i++){u[p[i]]++;if(i)b[p[i-1]*29+p[i]]++;if(i>1)t[(p[i-2]*29+p[i-1])*29+p[i]]++;}
 const us=u.reduce((a,b)=>a+b),bu=new Float64Array(29),tu=new Float64Array(841);b.forEach((v,i)=>bu[i/29|0]+=v);t.forEach((v,i)=>tu[i/29|0]+=v);
 const sc1=u.map(v=>Math.log(29*v/us)),sc2=b.map((v,i)=>Math.log(29*(v+5*u[i%29]/us)/(bu[i/29|0]+5))),sc3=t.map((v,i)=>Math.log(29*(v+5*Math.exp(sc2[i%841])/29)/(tu[i/29|0]+5)));
 const qCross=u.reduce((s,x)=>s+(x/us)**2,0), qWithin=F.map(lag=>{let n=0,h=.5;for(const p of refs)for(let i=0;i+lag<p.length;i++){n++;h+=p[i]===p[i+lag];}return h/(n+1);});
 const logFact=new Float64Array(20000);for(let i=1;i<logFact.length;i++)logFact[i]=logFact[i-1]+Math.log(i);
 const act=[];for(let a=1;a<29;a++)for(let b=0;b<29;b++)act.push({a,b,f:Array.from({length:29},(_,x)=>mod(a*x+b)),r:Array.from({length:29},(_,x)=>mod(inv[a]*(x-b)))});
 const specs=F.map((lag,k)=>{const pairs=[];let nCross=0,nWithin=0;for(let i=0;i+lag<maxCut;i++){const j=i+lag;if(mask[i]&(1<<k)||(mask[i]^mask[j])!==(1<<k))continue;const A=geo.flatMap((g,c)=>i<g.cut?[c]:[]),B=geo.flatMap((g,c)=>j<g.cut?[c]:[]);if(!B.length)continue;pairs.push({i,j,A,B});nWithin+=B.length;nCross+=A.length*B.length-B.length;}return{lag,k,pairs,nCross,nWithin};});
 let seed=0x6ad33201;function rnd(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);}
 function shuffle(){const a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
 function enc(P,key,S){return P.map(p=>p.map((v,i)=>{let x=S[v];for(let k=0;k<F.length;k++)if(mask[i]&(1<<k))x=act[key[k]].f[x];return x;}));}
 function peel(C,key){return C.map(p=>p.map((v,i)=>{let x=v;for(let k=F.length-1;k>=0;k--)if(mask[i]&(1<<k))x=act[key[k]].r[x];return x;}));}
 function score(P,held){let s=0,n=0;for(let c=0;c<P.length;c++){const p=P[c],start=held?geo[c].cut:0,end=held?p.length:geo[c].cut;for(let i=start;i<end;i++){s+=i===0?sc1[p[i]]:i===1?sc2[p[0]*29+p[1]]:sc3[(p[i-2]*29+p[i-1])*29+p[i]];n++;}}return s/n;}
 function histScore(Y){const h=Array(29).fill(0);let n=0;for(const y of Y)for(const x of y){h[x]++;n++;}const xs=Array.from({length:29},(_,i)=>i).sort((a,b)=>h[b]-h[a]),ps=Array.from({length:29},(_,i)=>i).sort((a,b)=>u[b]-u[a]),m=Array(29);xs.forEach((x,i)=>m[x]=ps[i]);return{m,ic:h.reduce((s,x)=>s+x*(x-1),0)/(n*(n-1)),mono:h.reduce((s,x,i)=>s+x*sc1[m[i]],0)/n};}
 function monoSolve(Y,init,restarts=6,steps=14000){
  const hist=new Int32Array(24389);for(const y of Y)for(let i=2;i<y.length;i++)hist[(y[i-2]*29+y[i-1])*29+y[i]]++;
  const tr=[];hist.forEach((n,i)=>{if(n)tr.push({a:i/841|0,b:(i/29|0)%29,c:i%29,n});});
  const all=Array.from({length:29},()=>[]);tr.forEach((v,i)=>{for(const x of new Set([v.a,v.b,v.c]))all[x].push(i);});
  const affected=all.map(a=>all.map(b=>[...new Set([...a,...b])]));
  const term=(m,i)=>{const v=tr[i];return v.n*sc3[(m[v.a]*29+m[v.b])*29+m[v.c]];};
  const full=m=>tr.reduce((s,v,i)=>s+term(m,i),0);let best={s:-Infinity,m:null};
  for(let z=0;z<restarts;z++){let m=z===0?init.slice():z%2===0?best.m.slice():shuffle(),s=full(m);for(let k=0;k<steps;k++){const a=rnd(29),b=rnd(29);if(a===b)continue;let v=0;const ix=affected[a][b];for(const i of ix)v-=term(m,i);[m[a],m[b]]=[m[b],m[a]];for(const i of ix)v+=term(m,i);const temp=20*Math.pow(.0125,k/steps);if(v>=0||rnd(1000000)/1000000<Math.exp(v/temp))s+=v;else [m[a],m[b]]=[m[b],m[a]];if(s>best.s)best={s,m:m.slice()};}}return best;
 }
 function fit(C,truth){
  const Y=C.map((p,c)=>Uint8Array.from(p.slice(0,geo[c].cut)));
  let beam=[{Y,key:Array(F.length).fill(null),s:0}],stages=[];
  // High-first peeling. Pool only equal still-active lower digit masks.
  for(let k=F.length-1;k>=0;k--){
   const lag=F[k], bit=1<<k, low=bit-1, slots=new Map(), children=[];
   for(let c=0;c<geo.length;c++)for(let i=0;i<geo[c].cut;i++){
    const m=mask[i]&low;
    if(!slots.has(m))slots.set(m,[[],[]]);
    slots.get(m)[(mask[i]&bit)?1:0].push([c,i]);
   }
   const groups=[...slots.values()].filter(g=>g[0].length&&g[1].length);
   for(let h=0;h<beam.length;h++){
    const s=beam[h], counts=groups.map(g=>g.map(xs=>{const v=new Uint16Array(29);for(const [c,i] of xs)v[s.Y[c][i]]++;return v;}));
    for(let id=0;id<act.length;id++){
     const f=act[id].f;let z=0;
     for(const [A,B] of counts)for(let v=0;v<29;v++){const w=f[v];if(A[v]&&B[w])z+=logFact[A[v]+B[w]]-logFact[A[v]]-logFact[B[w]];}
     children.push({h,id,ss:s.s+z,z});
    }
   }
   children.sort((a,b)=>b.ss-a.ss);
   const rank=truth?children.findIndex(x=>x.id===truth[k]&&beam[x.h].key.every((v,i)=>v===null||v===truth[i]))+1:null;
   stages.push({k,lag,groups:groups.length,sampleA:groups.reduce((s,g)=>s+g[0].length,0),sampleB:groups.reduce((s,g)=>s+g[1].length,0),rank,best:{id:children[0].id,z:children[0].z}});
   beam=children.slice(0,width).map(({h,id,ss})=>{const s=beam[h],Y=s.Y.map(p=>p.map((v,i)=>mask[i]&bit?act[id].r[v]:v)),key=s.key.slice();key[k]=id;return{Y,key,s:ss};});
  }
  const ranked=beam.map(v=>({...v,...histScore(v.Y)})).sort((a,b)=>b.ic-a.ic);
  const rankTruth=truth?ranked.findIndex(x=>x.key.every((v,i)=>v===truth[i]))+1:null;
  const candidates=ranked.slice(0,2).map(v=>{const r=monoSolve(v.Y,v.m),P=peel(C,v.key).map(p=>p.map(x=>r.m[x]));const S=Array(29);r.m.forEach((x,i)=>S[x]=i);if(enc(P,v.key,S).some((p,i)=>p.some((x,j)=>x!==C[i][j])))throw Error("replay");return{key:v.key,alphabet:r.m,ic:v.ic,mono:v.mono,fit:score(P,false),held:score(P,true),P};}).sort((a,b)=>b.fit-a.fit);
  return{stages,rankTruth,top:ranked.slice(0,4).map(({key,ic,mono})=>({key,ic,mono})),winner:candidates[0]};
 }
 const controls=[];
 for(let z=0;z<2;z++){
  let off=z?25000:10000;const P=geo.map(g=>{const p=donors[z].slice(off,off+g.N);off+=g.N+193;if(p.length!==g.N)throw Error("control length");return p;});
  const key=F.map(()=>rnd(812)),S=shuffle(),C=enc(P,key,S),r=fit(C,key),w=r.winner;
  let correct=0,held=0,heldN=0,N=0;for(let c=0;c<P.length;c++)for(let i=0;i<P[c].length;i++){N++;correct+=P[c][i]===w.P[c][i];if(i>=geo[c].cut){heldN++;held+=P[c][i]===w.P[c][i];}}
  controls.push({source:z?"Emerson":"Shakespeare",key,S,correct,N,held,heldN,keyCorrect:w.key.filter((x,i)=>x===key[i]).length,stages:r.stages,rankTruth:r.rankTruth,top:r.top,winner:{...w,P:undefined}});
 }
 const geometry=geo.map(({range,N,cut})=>({range,N,cut}));
 const out={geometry,F,width,qCross,qWithin,controls};
 if(controls.every(x=>x.keyCorrect===F.length&&x.held>=.99*x.heldN)){out.original=fit(geo.map(x=>x.c),null);}else out.originalSkipped="two-control key and held recovery gate failed";
 return out;
}
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module)console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8')),Number(process.argv[2]||12)),null,2));
module.exports=run;
