'use strict';
const fs=require('node:fs');
function run(data,mode="all",width=256){
const cp=JSON.parse(data[0]),native=JSON.parse(data[1]),target=cp.pages.filter(p=>p.page>=15&&p.page<=22).flatMap(p=>p.indices.slice(p.page===15?20:0)),N=target.length,cut=1752;
const mod=x=>((x%29)+29)%29,inv=Array(29).fill(0);for(let a=1;a<29;a++)for(let b=1;b<29;b++)if(a*b%29===1)inv[a]=b;
const fib=[1,2];while(fib.at(-1)+fib.at(-2)<N)fib.push(fib.at(-1)+fib.at(-2));const masks=Array.from({length:N},(_,i)=>{let b=0;for(let k=fib.length-1;k>=0;k--)if(i>=fib[k]){i-=fib[k];b|=1<<k;}return b;});
const primes=[];for(let x=2;primes.length<=fib.at(-1);x++)if(primes.every(p=>p*p>x||x%p))primes.push(x);
const vals=[0,...fib].map(j=>Math.abs(3301-primes[j])%29),slopes=[vals[0],...vals.slice(1).map(x=>mod(x*inv[vals[0]]))],sourceB=[2,...fib.map(j=>mod((primes[j]-2)*inv[slopes[0]]))],source=[sourceB[0],...sourceB.slice(1).map((b,k)=>mod(slopes[0]*b+(1-slopes[k+1])*sourceB[0]))];
const rm=new Map(cp.runes.map((r,i)=>[r,i])),labels=cp.translit.map((s,i)=>[s.toUpperCase(),i]).sort((a,b)=>b[0].length-a[0].length);
function encode(s){let arr=[];for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replaceAll("QU","CW").replaceAll("V","U").replace(/[KQ]/g,"C").replaceAll("Z","S");while(w.length){let f=w.startsWith("ING")?["ING",21]:w.startsWith("IO")?["IO",27]:labels.find(([l])=>w.startsWith(l));if(!f){w=w.slice(1);continue;}arr.push(f[1]);w=w.slice(f[0].length);}}return arr;}
const refs=[...native.sections.map(s=>Array.from(s.source_text).filter(r=>rm.has(r)).map(r=>rm.get(r))),encode(data[2]),encode(data[3])],em=encode(data[4]);
const u=new Float64Array(29).fill(.5),b=new Float64Array(841),t=new Float64Array(24389);for(const a of refs)for(let i=0;i<a.length;i++){u[a[i]]++;if(i>0)b[a[i-1]*29+a[i]]++;if(i>1)t[(a[i-2]*29+a[i-1])*29+a[i]]++;}
const us=u.reduce((x,y)=>x+y),bu=new Float64Array(29),tu=new Float64Array(841);b.forEach((v,i)=>bu[Math.floor(i/29)]+=v);t.forEach((v,i)=>tu[Math.floor(i/29)]+=v);
const sc1=u.map(v=>Math.log(29*v/us)),sc2=b.map((v,i)=>Math.log(29*(v+10*u[i%29]/us)/(bu[Math.floor(i/29)]+10))),sc3=t.map((v,i)=>Math.log(29*(v+10*Math.exp(sc2[i%841])/29)/(tu[Math.floor(i/29)]+10)));
function term(a,i){return i===0?sc1[a[i]]:i===1?sc2[a[0]*29+a[1]]:sc3[(a[i-2]*29+a[i-1])*29+a[i]];}
function score(a,s,e){let z=0;for(let i=s;i<e;i++)z+=term(a,i);return z/(e-s);}

const eq=fib.map(lag=>{let n=0,h=.5;for(const p of refs)for(let i=0;i+lag<p.length;i++){n++;if(p[i]===p[i+lag])h++;}return h/(n+1);});
let seed=0xc52ad9ba;function rnd(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);}
function shuffle(){const a=Array.from({length:29},(_,i)=>i);for(let i=28;i;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function geom(rev){const order=Array.from({length:16},(_,k)=>rev?15-k:k);const rows=masks.map(m=>{let a=1,h=Array(16).fill(0);for(const k of order)if(m&(1<<k)){h[k]=a;a=mod(a*slopes[k+1]);}return{a,iv:inv[a],h:h.map(v=>mod(v*inv[a]))};});const flags=Array.from({length:16},(_,k)=>rows.slice(0,cut).flatMap((r,i)=>r.h[k]?[[i,r.h[k]]]:[]));return {order,rows,flags,specs:order.map(k=>({k,pairs:masks.slice(0,cut-fib[k]).flatMap((m,i)=>(m^(masks[i+fib[k]]))===(1<<k)&&!(m&(1<<k))?[[i,i+fib[k]]]:[])}))};}
function enc(p,key,perm,g){return p.map((v,i)=>{let x=perm[v];for(const k of g.order.slice().reverse())if(masks[i]&(1<<k))x=mod(slopes[k+1]*x+key[k]);return x;});}
function peel(c,key,g){return c.map((v,i)=>{const r=g.rows[i];return mod(r.iv*v-r.h.reduce((s,x,k)=>s+x*key[k],0));});}
function mono(y){const hist=Array(29).fill(0);for(const x of y)hist[x]++;const xorder=Array.from({length:29},(_,i)=>i).sort((a,b)=>hist[b]-hist[a]),porder=Array.from({length:29},(_,i)=>i).sort((a,b)=>u[b]-u[a]);const m=Array(29);xorder.forEach((x,i)=>m[x]=porder[i]);return{value:hist.reduce((s,n,i)=>s+n*sc1[m[i]],0)/y.length,m,ic:hist.reduce((s,n)=>s+n*(n-1),0)/(y.length*(y.length-1))};}
function icRefine(c,key,g,random=false){key=key.slice();const y=peel(c.slice(0,cut),key,g);let h=new Int32Array(29);for(const x of y)h[x]++;const v=h=>h.reduce((s,x)=>s+x*x,0);const order=Array.from({length:16},(_,i)=>i);for(let sweep=0;sweep<18;sweep++){if(random)for(let i=15;i;i--){let j=rnd(i+1);[order[i],order[j]]=[order[j],order[i]];}let change=false;for(const k of order){const f=g.flags[k],base=h.slice();for(const [i,cf] of f)base[y[i]]--;let best=v(h),bd=0,bh=h;for(let d=1;d<29;d++){let t=base.slice();for(const [i,cf] of f)t[mod(y[i]-cf*d)]++;let z=v(t);if(z>best){best=z;bd=d;bh=t;}}if(bd){for(const [i,cf] of f)y[i]=mod(y[i]-cf*bd);h=bh;key[k]=mod(key[k]+bd);change=true;}}if(!change)break;}return{key,y,...mono(y)};}
function solve(y,base,restarts=8,steps=16000){
const all=Array.from({length:29},()=>[]),counts=new Map();
for(let i=2;i<y.length;i++){const x=(y[i-2]*29+y[i-1])*29+y[i];counts.set(x,(counts.get(x)||0)+1);}
const tr=Array.from(counts,([v,n])=>({a:Math.floor(v/841),b:Math.floor(v/29)%29,c:v%29,n}));
tr.forEach((v,i)=>{for(const x of new Set([v.a,v.b,v.c]))all[x].push(i);});
const term3=(m,i)=>{const v=tr[i];return v.n*sc3[(m[v.a]*29+m[v.b])*29+m[v.c]];};
const full=m=>tr.reduce((s,v,i)=>s+term3(m,i),0);
const pairs=Array.from({length:29},(_,a)=>Array.from({length:29},(_,b)=>Array.from(new Set([...all[a],...all[b]]))));
let best={value:-Infinity,m:null};for(let restart=0;restart<restarts;restart++){
let m=restart===0?base.slice():restart%2===0?best.m.slice():shuffle(),s=full(m);
for(let step=0;step<steps;step++){let a=rnd(29),b=rnd(29);if(a===b)continue;let old=0,newv=0;const ix=pairs[a][b];for(const i of ix)old+=term3(m,i);[m[a],m[b]]=[m[b],m[a]];for(const i of ix)newv+=term3(m,i);const d=newv-old,temp=15*Math.pow(.015,step/steps);if(d>=0||rnd(1000000)/1000000<Math.exp(d/temp)){s+=d;}else [m[a],m[b]]=[m[b],m[a]];if(s>best.value){best={value:s,m:m.slice()};}}
}return best;
}
function fit(c,g,truth){
let beam=[{y:Uint8Array.from(c.slice(0,cut)),key:Array(16).fill(0),s:0}],truthRanks=[];let peeled=[];
for(const {k,pairs} of g.specs){const children=[],a=slopes[k+1],weight=Math.log(eq[k]*28/(1-eq[k]));for(let h=0;h<beam.length;h++){const s=beam[h],hist=new Uint16Array(29);for(const [i,j] of pairs)hist[mod(s.y[j]-a*s.y[i])]++;for(let d=0;d<29;d++)children.push({h,d,s:s.s+weight*hist[d]});}
children.sort((a,b)=>b.s-a.s);
if(truth){let ix=children.findIndex(x=>x.d===truth[k]&&peeled.every(j=>beam[x.h].key[j]===truth[j]));truthRanks.push(ix<0?null:ix+1);}
beam=children.slice(0,width).map(({h,d,s})=>{const v=beam[h],key=v.key.slice(),y=v.y.slice();key[k]=d;for(let i=0;i<cut;i++)if(masks[i]&(1<<k))y[i]=mod((y[i]-d)*inv[a]);return{key,y,s};});peeled.push(k);
}
const rank=beam.map(v=>({...v,...mono(v.y)})).sort((a,b)=>b.ic-a.ic);
const seen=new Set(),pool=[];for(const v of rank){const signature=v.key.slice(0,15).join(",");if(!seen.has(signature)){pool.push(v);seen.add(signature);}if(pool.length===16)break;}
const ref=pool.flatMap((v,i)=>[icRefine(c,v.key,g),icRefine(c,v.key,g,true)]).sort((a,b)=>b.ic-a.ic);const uniq=ref.filter((v,i)=>ref.findIndex(w=>w.key.every((x,k)=>x===v.key[k]))===i);
return{truthRanks,truthICRank:truth?uniq.findIndex(v=>v.key.every((x,i)=>x===truth[i]))+1:null,top:uniq.slice(0,4).map(({key,value,ic})=>({key,value,ic})),best:uniq.slice(0,1).map(v=>{const q=solve(v.y,v.m);const p=peel(c,v.key,g).map(x=>q.m[x]);const perm=Array(29);q.m.forEach((x,i)=>perm[x]=i);if(enc(p,v.key,perm,g).some((x,i)=>x!==c[i]))throw Error("replay");return{key:v.key,perm:q.m,fit:score(p,0,cut),held:score(p,cut,N),p};})[0]};
}
const out={eq,width,controls:[],original:[]};
for(const rev of [false,true]){if(mode!=="all"&&mode!==String(Number(rev)))continue;const g=geom(rev);const p=em.slice(65000+Number(rev)*N,65000+(Number(rev)+1)*N);const key=Array.from({length:16},()=>rnd(29)),perm=shuffle(),c=enc(p,key,perm,g),f=fit(c,g,key);out.controls.push({rev,key,truthRanks:f.truthRanks,truthICRank:f.truthICRank,correct:f.best.p.filter((x,i)=>x===p[i]).length,heldCorrect:f.best.p.slice(cut).filter((x,i)=>x===p[i+cut]).length,fit:f.best.fit,held:f.best.held,top:f.top});
if(f.truthICRank===1&&f.best.p.filter((x,i)=>x===p[i]).length>0.98*N)out.original.push({rev,...fit(target,g,null)});else out.original.push({rev,skipped:"plant gate failed"});
}return out;}

const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
if(require.main===module)console.log(JSON.stringify(run(paths.map(p=>fs.readFileSync(p,'utf8')),process.argv[2]||'all',Number(process.argv[3]||256)),null,2));
module.exports=run;
