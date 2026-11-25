'use strict';
const fs=require('node:fs'), path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function encode(gp,s){const out=[];const tok=gp.translit.map((x,i)=>[x,i]).sort((a,b)=>b[0].length-a[0].length);for(let w of s.toUpperCase().match(/[A-Z]+/g)||[]){w=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let i=0;i<w.length;){if(w.startsWith("ING",i)){out.push(21);i+=3;continue}if(w.startsWith("IO",i)){out.push(27);i+=2;continue}const t=tok.find(x=>w.startsWith(x[0],i));if(!t)throw Error(w);out.push(t[1]);i+=t[0].length}}return out}
function experiment(gp,docs){
const ranges=[[0,2],[3,7],[8,14],[15,22],[23,26],[27,32],[33,39],[40,53],[54,55]];
const K=5,taps=[[1,2],[5,6]],mul=Array.from({length:29},(_,a)=>Int16Array.from({length:29},(_,b)=>a*b%29));
function bound(rows,q,lags,reset){const m=Math.max(...lags),group=Array.from({length:q},()=>[[],[],[]]);let free=0;for(const row of (reset?rows:[rows.flat()])){free+=Math.min(row.length,m);for(let i=m;i<row.length;i++){let g=group[i%q];g[0].push(row[i]);g[1].push(row[i-lags[0]]);g[2].push(row[i-lags[1]])}}const per=[],arg=[];for(const [v,x,y] of group){let cap=Array(K).fill(0),best=Array(K).fill(null),h=new Int32Array(29);for(let a=0;a<29;a++)for(let b=0;b<29;b++){h.fill(0);const A=mul[a],B=mul[b];for(let i=0;i<v.length;i++)h[(v[i]-A[x[i]]-B[y[i]]+58)%29]++;let sorted=Array.from(h).sort((a,b)=>b-a),s=0;for(let k=0;k<K;k++){s+=sorted[k];if(s>cap[k]){cap[k]=s;best[k]=[a,b]}}}per.push(cap);arg.push(best)}return {n:rows.flat().length,free,per,arg,cap:Array.from({length:K},(_,i)=>free+per.reduce((s,p)=>s+p[i],0))}}
function profile(x){let f=Array(29).fill(0);for(const v of x)f[v]++;let sum=0;return f.sort((a,b)=>b-a).slice(0,K).map(v=>sum+=v)}
function window(d,n,cap){let f=Array(29).fill(0),min=Array(K).fill(Infinity),survive=0;for(let i=0;i<d.length;i++){f[d[i]]++;if(i>=n)f[d[i-n]]--;if(i>=n-1){let s=0,pass=true,top=f.slice().sort((a,b)=>b-a);for(let k=0;k<K;k++){s+=top[k];min[k]=Math.min(min[k],s);if(s>cap[k])pass=false}if(pass)survive++}}return{min,survive,windows:d.length-n+1}}
const pages=gp.pages.filter(p=>p.page<56);if(pages.flatMap(p=>p.indices).length!==12956)throw Error("corpus");
const all=pages.map(p=>p.indices),results=[];
for(const q of [8,13,29])for(const lag of taps)for(const reset of [false,true]){
const whole=bound(all,q,lag,reset);const chapters=ranges.map(([a,b])=>{const r=bound(pages.filter(p=>p.page>=a&&p.page<=b).map(p=>p.indices),q,lag,reset);return{range:[a,b],n:r.n,cap:r.cap}});const privateCap=Array.from({length:K},(_,k)=>chapters.reduce((a,c)=>a+c.cap[k],0));results.push({q,lag,reset,n:whole.n,whole:whole.cap,privateCap,chapters})}
const mins={};for(const n of new Set([12956,...results[0].chapters.map(x=>x.n)])){mins[n]=docs.map(d=>window(d,n,Array(K).fill(Infinity)).min)}
for(const r of results){r.wholeRejected=mins[12956].map(m=>m.some((v,k)=>v>r.whole[k]));r.privateRejected=mins[12956].map(m=>m.some((v,k)=>v>r.privateCap[k]));r.chapterRejectCounts=docs.map((_,i)=>r.chapters.filter(c=>mins[c.n][i].some((v,k)=>v>c.cap[k])).length)}
let seed=330112;const rng=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);const rand=n=>Math.floor(rng()*n);function perm(){let a=Array.from({length:29},(_,i)=>i);for(let i=28;i>0;i--){let j=rand(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const controls=[];for(let j=0;j<3;j++){const q=[8,13,29][j],lag=taps[j%2],m=Math.max(...lag),p=docs[j].slice(10000,10000+1500),A=Array.from({length:q},()=>rand(29)),B=Array.from({length:q},()=>rand(29)),P=Array.from({length:q},perm),I=P.map(a=>{let b=[];a.forEach((x,i)=>b[x]=i);return b}),c=p.slice(0,m);for(let i=m;i<p.length;i++){let t=i%q;c.push((P[t][p[i]]+A[t]*c[i-lag[0]]+B[t]*c[i-lag[1]])%29)}const rec=c.slice(0,m);for(let i=m;i<c.length;i++){let t=i%q;rec.push(I[t][(c[i]-A[t]*c[i-lag[0]]-B[t]*c[i-lag[1]]+1624)%29])}if(!p.every((x,i)=>x===rec[i]))throw Error("replay");const b=bound([c],q,lag,false).cap,truth=profile(p);if(truth.some((x,i)=>x>b[i]))throw Error("bound");controls.push({q,lag,cap:b,truth,recovered:p.length})}
return {results,mins,controls,docLengths:docs.map(d=>d.length)}
}
const gp=JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const docs=["resources/control/emerson_essays_2944.txt","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt"].map(p=>encode(gp,read(p)));
console.log(JSON.stringify(experiment(gp,docs),null,2));
