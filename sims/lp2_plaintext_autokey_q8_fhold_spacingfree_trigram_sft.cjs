'use strict';
const fs=require('node:fs'),path=require('node:path');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
function experiment(corpus,nativeJson,shakespeare,gibran){
 const gp=JSON.parse(corpus),native=JSON.parse(nativeJson),q=8,A=29,mod=x=>(x+29)%29;
 const assert=(x,m)=>{if(!x)throw Error(m)},rune=new Map(gp.runes.map((x,i)=>[x,i]));
 const names=["0_welcome","0_koan_1","0_loss_of_divinity","jpg107-167"];
 const solved=native.sections.map(s=>({name:s.name,p:Array.from(s.source_text.match(/[\u16a0-\u16ff]/gu)||[],x=>rune.get(x))}));
 const tokens=gp.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);
 function latin(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w){const t=tokens.find(t=>w.startsWith(t[0]));if(!t)throw Error("GP encode "+w);out.push(t[1]);w=w.slice(t[0].length)}}return out}
 const train=[latin(shakespeare),latin(gibran),...solved.filter(s=>!names.includes(s.name)).map(s=>s.p)];
 const u=new Float64Array(A).fill(1),b=new Float64Array(A*A),t=new Float64Array(A*A*A);
 for(const p of train)for(let i=0;i<p.length;i++){u[p[i]]++;if(i)b[p[i-1]*A+p[i]]++;if(i>1)t[(p[i-2]*A+p[i-1])*A+p[i]]++;}
 const sum=u.reduce((a,v)=>a+v,0),pu=Array.from(u,x=>x/sum),lu=pu.map(Math.log),pb=new Float64Array(A*A),lb=new Float64Array(A*A),lt=new Float64Array(A*A*A);
 for(let i=0;i<A;i++){let s=0;for(let j=0;j<A;j++)s+=b[i*A+j];for(let j=0;j<A;j++){pb[i*A+j]=(b[i*A+j]+5*pu[j])/(s+5);lb[i*A+j]=Math.log(pb[i*A+j])}}
 for(let i=0;i<A*A;i++){let s=0;for(let j=0;j<A;j++)s+=t[i*A+j];for(let j=0;j<A;j++)lt[i*A+j]=Math.log((t[i*A+j]+12*pb[(i%A)*A+j])/(s+12))}
 function score(p,context=[]){const a=context.concat(p);let s=0;for(let i=context.length;i<a.length;i++)s+=i===0?lu[a[i]]:i===1?lb[a[i-1]*A+a[i]]:lt[(a[i-2]*A+a[i-1])*A+a[i]];return s;}
 function enc(p,key){let k=key.slice();return p.map(x=>{if(x===0)return 0;const c=mod(x+k[0]);k=k.slice(1).concat(x);return c})}
 function decode(c,key,hold){let k=key.slice(),p=[];for(let i=0;i<c.length;i++){if(hold.has(i)){if(c[i]!==0)return null;p.push(0);continue}const v=mod(c[i]-k[0]);if(v===0)return null;p.push(v);k=k.slice(1).concat(v)}return {p,k}}
 function optimize(c,holds){
  const phase=new Int8Array(c.length).fill(-1),positions=Array.from({length:q},()=>[]);let consuming=0;
  for(let i=0;i<c.length;i++)if(!holds.has(i)){const r=consuming++%q;phase[i]=r;positions[r].push(i)}
  const keys=Array.from({length:q},()=>[]),values=Array(c.length);
  for(let r=0;r<q;r++){
   for(let key=0;key<A;key++){let k=key,trajectory=[];for(const i of positions[r]){k=mod(c[i]-k);if(!k)break;trajectory.push(k)}if(trajectory.length===positions[r].length){keys[r].push(key);for(let j=0;j<trajectory.length;j++){const i=positions[r][j];if(!values[i])values[i]=[];values[i].push(trajectory[j])}}}
   if(!keys[r].length)return null;
  }
  const d=keys.map(x=>x.length),F=Array.from({length:q},(_,r)=>new Float64Array(d[r]*d[(r+1)%q]*d[(r+2)%q])),U=d.map(n=>new Float64Array(n)),B=d.map((n,r)=>new Float64Array(n*d[(r+1)%q]));let constant=0;
  for(let i=0;i<c.length;i++){
   const start=Math.max(0,i-2),pos=[];for(let j=start;j<=i;j++)if(phase[j]>=0)pos.push(j);
   const n=pos.length,r=n?phase[pos[0]]:0;for(let j=0;j<n;j++)assert(phase[pos[j]]===(r+j)%q,"factor phase");
   // Values for all physical positions in this trigram, including known F.
   const p0=start<i-1?start:-1,p1=start<i?i-1:-1,p2=i;
   const idx0=p0>=0?pos.indexOf(p0):-1,idx1=p1>=0?pos.indexOf(p1):-1,idx2=pos.indexOf(p2);
   const val=(p,idx,a,b,c)=>idx<0?0:values[p][idx===0?a:idx===1?b:c];
   function s(a,b,c){const z=val(p2,idx2,a,b,c);if(i===0)return lu[z];const y=val(p1,idx1,a,b,c);if(i===1)return lb[y*A+z];const x=val(p0,idx0,a,b,c);return lt[(x*A+y)*A+z]}
   if(n===0)constant+=s(0,0,0);
   else if(n===1){for(let a=0;a<d[r];a++)U[r][a]+=s(a,0,0)}
   else if(n===2){const d1=d[(r+1)%q];for(let a=0;a<d[r];a++)for(let b=0;b<d1;b++)B[r][a*d1+b]+=s(a,b,0)}
   else {const d1=d[(r+1)%q],d2=d[(r+2)%q];for(let a=0;a<d[r];a++)for(let b=0;b<d1;b++)for(let z=0;z<d2;z++)F[r][(a*d1+b)*d2+z]+=s(a,b,z)}
  }
  for(let r=0;r<q;r++){const d1=d[(r+1)%q],d2=d[(r+2)%q];for(let a=0;a<d[r];a++)for(let b=0;b<d1;b++){const v=U[r][a]+B[r][a*d1+b];for(let z=0;z<d2;z++)F[r][(a*d1+b)*d2+z]+=v}}
  let best=-Infinity,bestKey=null;
  // Exact cyclic third-order DP conditioned on the first two lane values.
  for(let x0=0;x0<d[0];x0++)for(let x1=0;x1<d[1];x1++){
   let prev=new Float64Array(d[0]*d[1]).fill(-Infinity);prev[x0*d[1]+x1]=0;const parents=[];
   for(let r=0;r<q-2;r++){
    const da=d[r],db=d[r+1],dc=d[r+2],next=new Float64Array(db*dc).fill(-Infinity),par=new Int16Array(db*dc).fill(-1),f=F[r];
    for(let a=0;a<da;a++)for(let b=0;b<db;b++){
     const v=prev[a*db+b];if(v===-Infinity)continue;
     const base=(a*db+b)*dc;
     for(let z=0;z<dc;z++){const k=b*dc+z,w=v+f[base+z];if(w>next[k]){next[k]=w;par[k]=a}}
    }
    prev=next;parents.push(par);
   }
   for(let a=0;a<d[6];a++)for(let b=0;b<d[7];b++){
    const v=prev[a*d[7]+b]+F[6][(a*d[7]+b)*d[0]+x0]+F[7][(b*d[0]+x0)*d[1]+x1]+constant;
    if(v>best){best=v;const idx=Array(q);idx[6]=a;idx[7]=b;for(let r=5;r>=0;r--)idx[r]=parents[r][idx[r+1]*d[r+2]+idx[r+2]];assert(idx[0]===x0&&idx[1]===x1,"cycle traceback");bestKey=idx.map((x,r)=>keys[r][x]);}
   }
  }
  const decoded=decode(c,bestKey,holds);assert(decoded&&Math.abs(score(decoded.p)-best)<1e-7,"factor score invariant");
  return {score:best,key:bestKey,holds:[...holds],p:decoded.p,end:decoded.k,domainSizes:d};
 }
 function masks(c){const z=c.flatMap((v,i)=>v===0?[i]:[]);assert(z.length<=12,"F mask cap");return Array.from({length:2**z.length},(_,mask)=>new Set(z.filter((_,j)=>mask&(1<<j))))}
 function attack(c){
  const a=c.slice(0,205),b=c.slice(205),rank=[];for(const h of masks(a)){const r=optimize(a,h);if(r)rank.push(r)}
  rank.sort((x,y)=>y.score-x.score);const fit=rank[0];if(!fit)return {fitMasks:masks(a).length,legalMasks:0};
  assert(String(enc(fit.p,fit.key))===String(a),"exact prefix replay");
  let best=null;for(const h of masks(b)){const r=decode(b,fit.end,h);if(!r)continue;const s=score(r.p,fit.p.slice(-2));if(!best||s>best.score)best={...r,score:s,holds:[...h]}}
  if(best)assert(String(enc(fit.p.concat(best.p),fit.key))===String(c),"exact full replay");
  return {fitMasks:masks(a).length,legalMasks:rank.length,fit,held:best,runnerMask:rank[1]?.score,heldMasks:masks(b).length};
 }
 const controls=[];
 for(let n=0;n<names.length;n++){
  const source=solved.find(x=>x.name===names[n]).p;let p=source.slice(0,308);let seed=0x6a09e667+n*1009,chosen=null;
  function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%29}
  for(let attempt=0;attempt<200;attempt++){const key=Array.from({length:q},rng),c=enc(p,key),z=c.slice(0,205).filter(x=>x===0).length,actual=p.slice(0,205).filter(x=>x===0).length;if(z<=8&&z>actual&&c.slice(205).filter(x=>x===0).length<=12){chosen={key,c,attempt};break}}
  if(!chosen){for(let offset=16;offset+308<=source.length;offset+=16){const candidate=source.slice(offset,offset+308),key=Array.from({length:q},rng),c=enc(candidate,key),z=c.slice(0,205).filter(x=>x===0).length,actual=candidate.slice(0,205).filter(x=>x===0).length;if(z<=8&&z>actual&&c.slice(205).filter(x=>x===0).length<=12){p=candidate;chosen={key,c,attempt:null,offset};break}}}
  if(!chosen){controls.push({name:names[n],status:"no bounded plant"});continue}
  const r=attack(chosen.c),match=(x,y)=>x?x.filter((v,i)=>v===y[i]).length:0;
  controls.push({name:names[n],plantAttempt:chosen.attempt,offset:chosen.offset||0,trueKey:chosen.key,fitMasks:r.fitMasks,legalMasks:r.legalMasks,fitScore:r.fit?.score/205,fitKey:r.fit?.key,fitMatches:match(r.fit?.p,p.slice(0,205)),heldScore:r.held?.score/103,heldMatches:match(r.held?.p,p.slice(205)),heldMasks:r.heldMasks,fitMaskMargin:r.fit&&r.runnerMask!==undefined?r.fit.score-r.runnerMask:null});
 }
 const target=gp.pages.slice(54,56).flatMap(x=>x.indices);assert(target.length===308,"original length");
 const r=attack(target);const global=[];for(const h of masks(target)){const s=optimize(target,h);if(s)global.push(s)}global.sort((a,b)=>b.score-a.score);const g=global[0];assert(g&&String(enc(g.p,g.key))===String(target),"global replay");const translit=p=>p?.map(x=>gp.translit[x]).join("");
 return {trainLengths:train.map(x=>x.length),controls,original:{globalMasks:masks(target).length,globalLegalMasks:global.length,globalScore:g.score/target.length,globalKey:g.key,globalHolds:g.holds,globalPlain:translit(g.p),globalReplay:target.length,fitMasks:r.fitMasks,legalMasks:r.legalMasks,fitKey:r.fit?.key,fitScore:r.fit?.score/205,fitHolds:r.fit?.holds,fitPlain:translit(r.fit?.p),fitMaskMargin:r.fit&&r.runnerMask!==undefined?r.fit.score-r.runnerMask:null,heldMasks:r.heldMasks,heldScore:r.held?.score/103,heldPlain:translit(r.held?.p),heldHolds:r.held?.holds,exactReplay:r.held?308:0}};
}
console.log(JSON.stringify(experiment(...["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt"].map(read)),null,2));
