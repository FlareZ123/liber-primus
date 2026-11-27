// Agent11: exact unknown-q13 F-hold inverse after horizontal source-row mirror.
const fs=require("node:fs");
const path=require("node:path");
function solve(c,t,n){
const assert=(x,m)=>{if(!x)throw Error(m)},Q=13,A=29,mod=x=>(x%29+29)%29;
const mp=new Map(c.runes.map((r,i)=>[r,i])),idx=s=>Array.from(s).filter(x=>mp.has(x)).map(x=>mp.get(x));
const native=n.sections.map(s=>({name:s.name,p:idx(s.source_text)}));
const counts=Array.from({length:A},()=>Array(A).fill(.5));
for(const s of native.slice(2))for(let i=1;i<s.p.length;i++)counts[s.p[i-1]][s.p[i]]++;
const lm=counts.map(row=>{const z=row.reduce((a,b)=>a+b,0);return row.map(x=>Math.log(x/z))});
const score=p=>p.slice(1).reduce((s,x,i)=>s+lm[p[i]][x],0);
const rows=pg=>t.split("%")[pg].split("/").map(idx).filter(x=>x.length);
function mirror(x,lens){let o=0,a=[];for(const l of lens){a.push(...x.slice(o,o+l).reverse());o+=l}assert(o===x.length,"length");return a}
function enc(p,k){let j=0;return p.map(x=>{if(x===0)return 0;const y=mod(x+k[j]);j=(j+1)%Q;return y})}
function optimize(y){
const zero=[];y.forEach((x,i)=>{if(x===0)zero.push(i)});assert(zero.length<=16,"too many masks");
let best=null,legalMasks=0,keysEvaluated=0;
const maskScores=[];
for(let mask=0;mask<2**zero.length;mask++){
const hold=new Set(zero.filter((_,i)=>(mask>>i)&1)),phase=new Int8Array(y.length).fill(-1),bad=Array.from({length:Q},()=>new Uint8Array(A));
let j=0;for(let i=0;i<y.length;i++){if(hold.has(i))continue;phase[i]=j;bad[j][y[i]]=1;j=(j+1)%Q}
const dom=bad.map(b=>Array.from({length:A},(_,k)=>k).filter(k=>!b[k]));if(dom.some(d=>d.length===0))continue;legalMasks++;
const U=Array.from({length:Q},()=>new Float64Array(A)),V=Array.from({length:Q},()=>new Float64Array(A*A));
let constant=0;
for(let i=1;i<y.length;i++){
const a=phase[i-1],b=phase[i],x=y[i-1],z=y[i];
if(a<0&&b<0){constant+=lm[0][0];continue;}
if(a<0){for(const l of dom[b])U[b][l]+=lm[0][mod(z-l)];continue}
if(b<0){for(const k of dom[a])U[a][k]+=lm[mod(x-k)][0];continue}
assert(b===(a+1)%Q,"phase seam");for(const k of dom[a])for(const l of dom[b])V[a][A*k+l]+=lm[mod(x-k)][mod(z-l)];
}
let maskBest=-Infinity,maskKey=null;
for(const start of dom[0]){
keysEvaluated++;
let prev=new Float64Array(A).fill(-Infinity);prev[start]=U[0][start];const back=[];
for(let q=1;q<Q;q++){const cur=new Float64Array(A).fill(-Infinity),bp=new Int8Array(A).fill(-1);
for(const l of dom[q]){let mx=-Infinity,bk=-1;for(const k of dom[q-1]){const s=prev[k]+V[q-1][k*A+l]+U[q][l];if(s>mx){mx=s;bk=k}}cur[l]=mx;bp[l]=bk}prev=cur;back.push(bp)}
for(const last of dom[Q-1]){const s=prev[last]+V[Q-1][last*A+start]+constant;if(s>maskBest){maskBest=s;let k=last;maskKey=new Array(Q);for(let q=Q-1;q>=1;q--){maskKey[q]=k;k=back[q-1][k]}maskKey[0]=k;assert(k===start,"backtrack")}}
}
const p=y.map((x,i)=>phase[i]<0?0:mod(x-maskKey[phase[i]]));assert(p.every((x,i)=>x!==0||hold.has(i)),"zero");assert(enc(p,maskKey).join()===y.join(),"replay");assert(Math.abs(score(p)-maskBest)<1e-8,"score mismatch");
maskScores.push({mask,score:maskBest/(y.length-1)});
if(!best||maskBest>best.rawScore)best={mask,hold:[...hold],key:maskKey,p,rawScore:maskBest,score:maskBest/(y.length-1)};
}
return {zero,legalMasks,totalMasks:2**zero.length,conditionedStarts:keysEvaluated,maskScores,best:best?{...best,text:best.p.map(x=>c.translit[x]).join(" ")}:null}
}
const original=[];for(const pg of [22,23]){const ls=rows(pg),raw=ls.flat(),lens=ls.map(l=>l.length);assert(raw.join()===c.pages[pg].indices.join(),"source");const x=mirror(raw,lens),res=optimize(x);if(res.best)assert(mirror(enc(res.best.p,res.best.key),lens).join()===raw.join(),"full original replay");original.push({pg,lens,...res})}
const lens=rows(22).map(l=>l.length),L=lens.reduce((a,b)=>a+b,0);const K=[0,10,4,0,1,19,0,18,4,18,9,0,18],controls=[];
let seed=3301;function rng(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%29}
for(const s of native.slice(0,2))for(const [id,key] of [[0,K],[1,Array.from({length:Q},rng)],[2,Array.from({length:Q},rng)]]){const p=s.p.slice(0,L),raw=mirror(enc(p,key),lens),res=optimize(mirror(raw,lens));assert(res.best,"plant lost");controls.push({name:s.name,id,key,truthScore:score(p)/(L-1),exactKey:res.best.key.join()===key.join(),exactPlain:res.best.p.join()===p.join(),correct:res.best.p.filter((x,i)=>x===p[i]).length,score:res.best.score,zero:res.zero.length,legalMasks:res.legalMasks,foundKey:res.best.key})}
return {original,controls};
}
const root=path.join(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
console.log(JSON.stringify(solve(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp2-transcription.txt"),JSON.parse(read("resources/external/relikd-solved-gp29-native-v1.json"))),null,2));
