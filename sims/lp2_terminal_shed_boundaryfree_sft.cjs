'use strict';
const fs=require('node:fs'),path=require('node:path');
const {INPUTS,SEEDS,experiment}=require('./lp2_terminal_shed_permutation_lexical_sft.cjs');
function infer(K){
 const mod=x=>(x%29+29)%29, inv=x=>{for(let j=1;j<29;j++)if(mod(x*j)===1)return j;throw Error("inverse")},assert=(x,m)=>{if(!x)throw Error(m)},id=x=>x.join(",");
 const n=76,q=29,m=38;
 function spanForm(L){let a=L.map((x,i)=>{const r=new Int32Array(n+m);r.set(x.slice(0,n));r[n+i]=1;return r}),rank=0;
   for(let j=n-1;j>=0;j--){let t=rank;while(t<a.length&&!a[t][j])t++;if(t===a.length)continue;[a[t],a[rank]]=[a[rank],a[t]];let f=inv(a[rank][j]);for(let k=0;k<a[rank].length;k++)a[rank][k]=mod(a[rank][k]*f);for(let t=0;t<a.length;t++)if(t!==rank&&a[t][j]){let f=a[t][j];for(let k=0;k<a[t].length;k++)a[t][k]=mod(a[t][k]-f*a[rank][k])}rank++}
   assert(rank===m,"rank");const end=r=>{for(let j=n-1;j>=0;j--)if(r[j])return j;throw Error("zero")},start=r=>{for(let j=0;j<n;j++)if(r[j])return j;throw Error("zero")};
   for(let j=0;j<n;j++){const s=a.filter(r=>start(r)===j).sort((x,y)=>end(x)-end(y));if(s.length>1){const r=s[0];for(const b of s.slice(1)){let f=mod(b[j]*inv(r[j]));for(let k=j;k<b.length;k++)b[k]=mod(b[k]-f*r[k])}}}
   a.sort((x,y)=>end(x)-end(y));return a.map(r=>({start:start(r),end:end(r),support:Array.from(r.slice(0,n)).flatMap((v,i)=>v?[[i,v]]:[]),transform:Array.from(r.slice(n))}));
 }
 const spans=spanForm(K.L),adj=Array.from({length:n},()=>[]);
 for(const [r,s] of spans.entries())if(s.support.length===2){const [[i,a],[j,b]]=s.support;assert(a===28&&b===1,"pair form");adj[i].push({to:j,r,sign:1});adj[j].push({to:i,r,sign:-1})}
 const seen=new Set(),comps=[];for(let i=0;i<n;i++)if(!seen.has(i)){let members=[],queue=[i];seen.add(i);while(queue.length){let j=queue.shift();members.push(j);for(const e of adj[j])if(!seen.has(e.to)){seen.add(e.to);queue.push(e.to)}}members.sort((a,b)=>a-b);comps.push(members)}
 comps.sort((a,b)=>b.length-a.length||a[0]-b[0]);const top=comps.slice(0,2);
 assert(top[0].length===18&&top[1].length===14,"dominant components");
 const fixed=top.flatMap((c,j)=>c.map(i=>({i,j}))).sort((a,b)=>a.i-b.i);
 function rhsFor(C55,H){const C=[...C55,...K.orig.slice(n)];const base=K.deps.map(v=>{let s=0;for(let i=0;i<256;i++)s+=v[i]*H[C[i]];for(let i=n;i<256;i++)s-=v[i]*K.known[i-n];return mod(s)});return spans.map(s=>mod(s.transform.reduce((v,a,i)=>v+a*base[i],0)))}
 function offsets(rhs){const d=Array(n).fill(null);for(const c of top){const root=c[0],queue=[root];d[root]=0;while(queue.length){const i=queue.shift();for(const e of adj[i]){const v=mod(d[i]+e.sign*rhs[e.r]);if(d[e.to]===null){d[e.to]=v;queue.push(e.to)}else assert(d[e.to]===v,"pair cycle")}}}return d}
 const train=K.donors.map(d=>d.slice(0,Math.floor(d.length*.8)).flat()),held=K.donors.map(d=>d.slice(Math.floor(d.length*.8)).flat());
 const models=new Map();
 function model(gaps){const key=id(gaps);if(models.has(key))return models.get(key);const k=gaps.length,contexts=q**k,cnt=new Uint32Array(contexts*q),tot=new Uint32Array(contexts);let back=k?model(gaps.slice(1)):null;
   for(const tape of train)for(let i=k?gaps[0]:0;i<tape.length;i++){let c=0;for(const g of gaps)c=c*q+tape[i-g];cnt[c*q+tape[i]]++;tot[c]++}
   const log=new Float32Array(cnt.length),alpha=k?12:14.5,bc=k?q**(k-1):1;
   for(let c=0;c<contexts;c++)for(let x=0;x<q;x++){let p=k?Math.exp(back.log[(c%bc)*q+x]):1/q;log[c*q+x]=Math.log((cnt[c*q+x]+alpha*p)/(tot[c]+alpha))}
   const o={gaps,log};models.set(key,o);return o;
 }
 const registers=fixed.map((f,i)=>{const previous=fixed.slice(Math.max(0,i-3),i);return{f,previous,model:model(previous.map(x=>f.i-x.i))}});
 function score(d,b,c){const v=[b,c];let s=0;for(const r of registers){let context=0;for(const p of r.previous)context=context*q+((v[p.j]+d[p.i])%q);let x=(v[r.f.j]+d[r.f.i])%q;s+=r.model.log[context*q+x]}return s}
 function rank(C55,truth=null){const cand=[];for(const [h,H] of K.Hs.entries()){const rhs=rhsFor(C55,H),d=offsets(rhs);for(let b=0;b<q;b++)for(let c=0;c<q;c++)cand.push({h,b,c,score:score(d,b,c)})}cand.sort((a,b)=>b.score-a.score||a.h-b.h||a.b-b.b||a.c-b.c);const trueRank=truth?cand.findIndex(x=>x.h===truth.h&&x.b===truth.b&&x.c===truth.c)+1:null;return{candidates:cand,trueRank,trueScore:truth?cand[trueRank-1].score:null}}
 let rng=0x3301f55;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return(rng>>>0)%n}
 const knownBasis=[...K.basis.entries()].filter(([j,b])=>b.v.slice(0,n).every(x=>x===0)).sort((a,b)=>b[0]-a[0]);
 assert(knownBasis.length===161,"known basis");
 function makePad(H){const p=Int32Array.from({length:K.cols},()=>rand(q));for(const [j,b] of knownBasis){let y=0;for(let i=n;i<256;i++)y+=b.v[i]*(K.known[i-n]-H[K.orig[i]]);for(let k=j+1;k<K.cols;k++)y-=b.a[k]*p[k];p[j]=mod(y)}
 const pad=K.rows.map(a=>mod(a.reduce((s,x,i)=>s+x*p[i],0)));assert(pad.slice(n).every((x,i)=>mod(x+H[K.orig[n+i]])===K.known[i]),"known replay");return pad}
 const controls=[];
 for(let d=0;d<3;d++)for(let repeat=0;repeat<2;repeat++){
   const h=(d*17+repeat*7)%58,H=K.Hs[h],pad=makePad(H),start=rand(held[d].length-n+1),P=held[d].slice(start,start+n),C55=P.map((x,i)=>H.indexOf(mod(x-pad[i]))),truth={h,b:P[top[0][0]],c:P[top[1][0]]};
   const result=rank(C55,truth),best=result.candidates[0];assert(C55.every(x=>x>=0),"plant encryption");const rr=rhsFor(C55,H);assert(spans.every((r,i)=>mod(r.support.reduce((s,[j,a])=>s+a*P[j],0))===rr[i]),"plant parity");
   controls.push({d,repeat,start,P,C55,truth,rank:result.trueRank,trueScore:result.trueScore,best,top10:result.candidates.slice(0,10)});
 }
 const originalRank=rank(K.orig.slice(0,n));const original=originalRank.candidates.slice(0,32).map(c=>{const d=offsets(rhsFor(K.orig.slice(0,n),K.Hs[c.h])),p=Array(n).fill(null);for(const f of fixed)p[f.i]=mod(d[f.i]+(f.j===0?c.b:c.c));return {...c,p,pattern:p.map(x=>x===null?"·":K.translit[x]).join(" ")}});
 return{original,spans,comps,top,fixed,models:models.size,controls,trainLengths:train.map(x=>x.length),holdoutLengths:held.map(x=>x.length)};
}
const raw=INPUTS.map(p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8'));
console.log(JSON.stringify(infer(experiment(raw,SEEDS,true)),null,2));
