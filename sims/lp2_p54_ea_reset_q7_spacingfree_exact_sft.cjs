"use strict";
/** Exact max-sum key search, q7 additive, ciphertext EA resets. No printed word boundaries. */
function experiment(gp,nativeData,raw){
 const N=29,Q=7,mod=x=>(x+N)%N,idx=(a,b,c)=>(a*N+b)*N+c,assert=(b,m)=>{if(!b)throw Error(m)};
 const names=gp.translit,tok=names.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 function native(s){const out=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG").replace(/IO/g,"IA");while(w.length){const t=tok.find(t=>w.startsWith(t.s));assert(t,w);out.push(t.i);w=w.slice(t.s.length)}}return out}
 const un=new Uint32Array(N),bi=new Uint32Array(N*N),tri=new Uint32Array(N**3);
 for(const a of raw.map(native))for(let i=0;i<a.length;i++){un[a[i]]++;if(i>0)bi[a[i-1]*N+a[i]]++;if(i>1)tri[idx(a[i-2],a[i-1],a[i])]++}
 function blend(count,lower,strength){const p=new Float64Array(count.length);for(let i=0;i<count.length;i+=N){let sum=0;for(let a=0;a<N;a++)sum+=count[i+a];for(let a=0;a<N;a++)p[i+a]=(count[i+a]+strength*lower[(i+a)%lower.length])/(sum+strength)}return p}
 const pu=blend(un,new Float64Array(N).fill(1/N),29),pb=blend(bi,pu,8),pt=blend(tri,pb,12),l=[pu.map(Math.log),pb.map(Math.log),pt.map(Math.log)];
 const source=gp.pages.filter(p=>p.page>=54&&p.page<=55).flatMap(p=>p.indices),split=232;
 assert(source.length===308,"source size");const marks=new Set(source.flatMap((x,i)=>x===28?[i]:[]));
 function makeTerms(c,mask,start=0,context=[]){
   let j=start,h=context.map(x=>({c:x,t:-1}));const allowed=Array.from({length:Q},()=>new Set(Array.from({length:N},(_,i)=>i))),terms=[];
   for(let i=0;i<c.length;i++){const x=c[i];if(x===28){j=0;h=[];continue}let e;if(mask.has(i))e={c:0,t:-1};else{e={c:x,t:j};j=(j+1)%Q}h.push(e);if(h.length>3)h.shift();terms.push(h.slice())}
   return {terms,allowed,end:j};
 }
 function factor(c,mask,hold){
  const {terms,allowed,end}=makeTerms(c,mask);
  if(hold)for(const t of terms){const e=t[t.length-1];if(e.t>=0)allowed[e.t].delete(e.c)}
  const ds=allowed.map(x=>[...x]),F=Array.from({length:Q},()=>new Float64Array(N**3));let fixed=0;
  for(const t of terms){const q=t.find(e=>e.t>=0)?.t;if(q===undefined){fixed+=l[t.length-1][t.reduce((s,e)=>s*N+e.c,0)];continue}
   const off=t.map(e=>e.t<0?-1:(e.t-q+Q)%Q);assert(off.every(i=>i<=2),"nonlocal factor");const f=F[q],d0=ds[q],d1=ds[(q+1)%Q],d2=ds[(q+2)%Q];
   for(const a of d0)for(const b of d1)for(const cc of d2){const key=[a,b,cc];let p=0;for(let i=0;i<t.length;i++)p=p*N+(off[i]<0?t[i].c:mod(t[i].c-key[off[i]]));f[idx(a,b,cc)]+=l[t.length-1][p]}
  }
  return {F,ds,fixed,end};
 }
 function optimum(F,ds,fixed){if(ds.some(d=>!d.length))return null;let best=-Infinity,key=null;const n=N*N;
  for(const a of ds[0])for(const b of ds[1]){let cur=new Float64Array(n).fill(-Infinity);const back=[];
   for(const c of ds[2])cur[b*N+c]=F[0][idx(a,b,c)];
   for(let j=3;j<Q;j++){const nxt=new Float64Array(n).fill(-Infinity),prev=new Int8Array(n).fill(-1),f=F[j-2];for(const x of ds[j-2])for(const y of ds[j-1]){const v=cur[x*N+y];if(v===-Infinity)continue;for(const z of ds[j]){const i=y*N+z,w=v+f[idx(x,y,z)];if(w>nxt[i]){nxt[i]=w;prev[i]=x}}}cur=nxt;back[j]=prev}
   for(const x of ds[5])for(const y of ds[6]){const v=fixed+cur[x*N+y]+F[5][idx(x,y,a)]+F[6][idx(y,a,b)];if(v>best){best=v;key=[a,b,-1,-1,-1,x,y];for(let j=6;j>=3;j--)key[j-2]=back[j][key[j-1]*N+key[j]];assert(key[1]===b,"trace")}}
  }return key?{key,score:best}:null;
 }
 function histories(c,hold){const zeros=c.flatMap((x,i)=>x===0?[i]:[]);assert(zeros.length<=8,"control F cap");return Array.from({length:hold?2**zeros.length:1},(_,b)=>new Set(zeros.filter((_,i)=>(b>>i)&1)))}
 function decode(c,key,hold,mask,j=0,ctx=[]){let p=[],score=0,h=ctx.slice();for(let i=0;i<c.length;i++){const x=c[i];if(x===28){p.push(-1);h=[];j=0;continue}let y;if(mask.has(i))y=0;else{y=mod(x-key[j]);if(hold&&y===0)return null;j=(j+1)%Q}p.push(y);h.push(y);if(h.length>3)h.shift();score+=l[h.length-1][h.reduce((s,x)=>s*N+x,0)]}return {p,score,j,ctx:h.slice(-2)}}
 function solve(c,hold){const a=c.slice(0,split),b=c.slice(split),fits=[];for(const mask of histories(a,hold)){const {F,ds,fixed}=factor(a,mask,hold);const v=optimum(F,ds,fixed);if(!v)continue;const d=decode(a,v.key,hold,mask);assert(d&&Math.abs(v.score-d.score)<1e-8,"factor score disagreement");fits.push({...v,mask:[...mask],d,domains:ds.map(x=>x.length)})}
   fits.sort((a,b)=>b.score-a.score);if(!fits.length)return {fits:0};const v=fits[0],hs=histories(b,hold).map(mask=>decode(b,v.key,hold,mask,v.d.j,v.d.ctx)).filter(Boolean).sort((a,b)=>b.score-a.score);return {fits:fits.length,key:v.key,score:v.score,runnerHistoryScore:fits[1]?.score,mask:v.mask,domains:v.domains,train:v.d.p,held:hs[0]?.p??null,heldScore:hs[0]?.score??null,heldHistories:hs.length}}
 const rmap=new Map(gp.runes.map((x,i)=>[x,i]));const sec=nativeData.sections.map(s=>[...s.source_text].filter(x=>rmap.has(x)).map(x=>rmap.get(x)));
 function plant(hold,section,start,seed){let t=0,j=0,r=seed;const p=source.map((_,i)=>marks.has(i)?-1:sec[section][start+t++]);assert(t===297&&p.every(x=>Number.isInteger(x)),"plant length");const ks=Array.from({length:Q},()=>new Set(Array.from({length:N},(_,i)=>i)));
  for(const x of p){if(x<0){j=0;continue}if(hold&&x===0)continue;ks[j].delete(mod(28-x));if(hold)ks[j].delete(mod(-x));j=(j+1)%Q}
  function rand(n){r^=r<<13;r^=r>>>17;r^=r<<5;return (r>>>0)%n}
  const key=ks.map(s=>{const a=[...s];assert(a.length,"key domain");return a[rand(a.length)]});j=0;const c=p.map(x=>{if(x<0){j=0;return 28}if(hold&&x===0)return 0;const y=(x+key[j])%N;j=(j+1)%Q;return y});const fit=solve(c,hold);
  const matches=(a,b)=>a?a.filter((x,i)=>x===b[i]).length:0;return {hold,section,start,seed,truthKey:key,fit,exactKey:fit.key?.join()===key.join(),trainMatch:matches(fit.train,p.slice(0,split)),heldMatch:matches(fit.held,p.slice(split))};
 }
 const controls=[plant(false,3,0,0x19541511),plant(true,1,133,0x19541512)];
 const gate=controls.every(x=>x.exactKey&&x.trainMatch===232&&x.heldMatch===76);return {controls,gate,original:gate?{ordinary:solve(source,false),fhold:solve(source,true)}:null};
}
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt"];
if(typeof require!=="undefined"&&require.main===module){const fs=require("node:fs"),r=files.map(x=>fs.readFileSync(x,"utf8"));console.log(JSON.stringify(experiment(JSON.parse(r[0]),JSON.parse(r[1]),r.slice(2)),null,2))}
