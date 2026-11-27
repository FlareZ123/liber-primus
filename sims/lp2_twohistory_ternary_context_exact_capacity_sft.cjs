'use strict';
const fs=require('node:fs');
const paths=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function run(corpus,donors){
 const Q=29,check=(x,m)=>{if(!x)throw Error(m)},pages=corpus.pages.slice(0,56).map(p=>p.indices),N=pages.reduce((s,x)=>s+x.length,0);
 const pop=x=>{x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0f0f0f0f)*0x01010101)>>>24};
 function solve(row,limit=406){
  const sets=[];let L=0;
  for(let a=0;a<Q;a++)for(let b=a+1;b<Q;b++){const v=Array.from({length:Q},(_,i)=>row[a][i]+row[b][i]);L=Math.max(L,...v);sets.push({a,b,v,s:v.reduce((s,x)=>s+x,0)})}
  for(const z of sets){z.m=new Int32Array(L);for(let x=0;x<Q;x++)for(let k=0;k<z.v[x];k++)z.m[k]|=1<<x}
  sets.sort((a,b)=>b.s-a.s);sets.length=Math.min(sets.length,limit);
  let best=-1,win=[],n=sets.length,evals=0;
  for(let i=0;i<n-2;i++){const u=sets[i];if(u.s+sets[i+1].s+sets[i+2].s<=best)break;const gain=new Int16Array(n);let maxGain=0;for(let j=i+1;j<n;j++){let g=0;for(let k=0;k<L;k++)g+=pop(sets[j].m[k]&~u.m[k]);gain[j]=g;maxGain=Math.max(maxGain,g)}if(u.s+2*maxGain<=best)continue;
   for(let j=i+1;j<n-1;j++){const base=u.s+gain[j];if(base+maxGain<=best)continue;const v=sets[j],m=new Int32Array(L);for(let k=0;k<L;k++)m[k]=u.m[k]|v.m[k];for(let t=j+1;t<n;t++){if(base+gain[t]<=best)continue;let s=base;const w=sets[t];for(let k=0;k<L;k++)s+=pop(w.m[k]&~m[k]);evals++;if(s>best){best=s;win=[u,v,w]}}}}
  check(win.length===3,"winner");check(Array.from({length:Q},(_,b)=>Math.max(...win.map(z=>z.v[b]))).reduce((s,x)=>s+x,0)===best,"direct score");
  if(limit<406){let naive=-1;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)for(let k=j+1;k<n;k++){let s=0;for(let b=0;b<Q;b++)s+=Math.max(sets[i].v[b],sets[j].v[b],sets[k].v[b]);naive=Math.max(naive,s)}check(naive===best,"naive crosscheck")}
  return {best,sets:win.map(z=>[z.a,z.b]),h:Array.from({length:Q},(_,b)=>{let v=win.map(z=>z.v[b]);return v.indexOf(Math.max(...v))}),evals,L}
 }
 function capacity(pp){const H=Array.from({length:Q},()=>Array.from({length:Q},()=>new Int32Array(Q)));let free=0;for(const x of pp){free+=Math.min(2,x.length);for(let i=2;i<x.length;i++)H[x[i-1]][x[i]][x[i-2]]++}
 const rows=H.map(row=>{solve(row,12);return solve(row)});const cap=free+rows.reduce((s,r)=>s+r.best,0);
 const inv=rows.map(r=>r.sets.map(([u,v])=>{let t=Array(Q).fill(-1);t[u]=18;t[v]=3;const rest=Array.from({length:Q},(_,i)=>i).filter(i=>i!==18&&i!==3);let j=0;for(let k=0;k<Q;k++)if(t[k]<0)t[k]=rest[j++];return t}));
 let selected=0,replay=0;for(const x of pp)for(let i=0;i<x.length;i++){let t=i<2?null:inv[x[i-1]][rows[x[i-1]].h[x[i-2]]],p=t?t[x[i]]:18;selected+=Number(p===18||p===3);if(t){check(t.indexOf(p)===x[i],"inverse replay");replay++}}
 check(selected===cap,"sharp witness");return {cap,free,replay,rows,inv,naiveCrosschecks:Q}
 }
 const tok=corpus.translit.map((x,i)=>[i===21?"ING":i===27?"IO":x,i]);tok.push(["NG",21],["IA",27]);tok.sort((a,b)=>b[0].length-a[0].length);
 function encode(s){let a=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){const t=tok.find(([x])=>w.startsWith(x,i));check(t,"spelling");a.push(t[1]);i+=t[0].length}}return a}
 function histogram(a){const h=Array(Q).fill(0);for(const x of a)h[x]++;return h}
 function top2(h){let a=0,b=0;for(let i=1;i<Q;i++){let v=h[i];if(v>=a){b=a;a=v}else if(v>b)b=v}return a+b}
 function mins(a){let h=histogram(a.slice(0,N)),min=Infinity,at=-1;for(let i=0;i<=a.length-N;i++){const v=top2(h);if(v<min){min=v;at=i}if(i<a.length-N){h[a[i]]--;h[a[i+N]]++}}return {windows:a.length-N+1,minTop2NonF:min,offset:at}}
 let seed=0x3301cafe;const rand=n=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)%n};
 function perm(){const a=Array.from({length:Q},(_,i)=>i);for(let i=Q-1;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
 function plant(p){const h=Array.from({length:Q},()=>Array.from({length:Q},()=>rand(3))),S=Array.from({length:Q},()=>[perm(),perm(),perm()]);let off=0,replay=0;const cc=pages.map(x=>{const a=p.slice(off,off+x.length);off+=x.length;const c=a.slice(0,2);for(let i=2;i<a.length;i++){let t=S[c[i-1]][h[c[i-1]][c[i-2]]];c.push(t[a[i]]);check(t.indexOf(c[i])===a[i],"native replay");replay++}return c});const bound=capacity(cc);const trueTop2=top2(histogram(p));check(trueTop2<=bound.cap,"plant false rejection");return {trueTop2,cap:bound.cap,replay,naiveCrosschecks:bound.naiveCrosschecks}}
 const original=capacity(pages);check(N===12956&&original.free===110&&original.cap===2423,"pinned original exact cap");
 const controls=donors.map(({name,text})=>{const a=encode(text),m=mins(a);check(m.minTop2NonF>original.cap,"finite donor gate");return {name,...m,plant:plant(a.slice(0,N))}});
 return {N,original,controls};
}
const out=run(JSON.parse(fs.readFileSync(paths[0],'utf8')),paths.slice(1).map(name=>({name,text:fs.readFileSync(name,'utf8')})));
console.log(JSON.stringify(out,null,2));
