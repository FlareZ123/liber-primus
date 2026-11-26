#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
function main(corpus,grid,native){
 const q=29,h=13,w=8,N=h*w,L=Math.log(q),mod=x=>(x%q+q)%q,assert=(x,m)=>{if(!x)throw Error(m)},inv=x=>{for(let y=1;y<q;y++)if(mod(x*y)===1)return y;throw Error("zero inverse")};
 const opening=corpus.pages.slice(0,3).flatMap(p=>p.indices),k=opening.slice(14+49*h,14+50*h);assert(opening.length===729&&opening[13]===2&&k.length===13&&mod(k.reduce((s,x)=>s+x,0))===0,"row 50");
 const p50=grid.pages.find(p=>p.page===50);assert(p50.rows===h&&p50.cols===w&&p50.tokens.length===N,"panel");
 const matrix=(s)=>Array.from({length:h},(_,i)=>Array.from({length:h},(_,j)=>k[mod13(j+s*i)]));
 function mod13(x){return (x%h+h)%h}
 function inverse(A){const b=A.map((r,i)=>[...r,...Array.from({length:h},(_,j)=>+(i===j))]);for(let i=0;i<h;i++){const j=b.findIndex((r,j)=>j>=i&&r[i]);assert(j>=i,"rank-one completion singular");[b[i],b[j]]=[b[j],b[i]];const a=inv(b[i][i]);b[i]=b[i].map(x=>mod(a*x));for(let j=0;j<h;j++)if(j!==i){const a=b[j][i];b[j]=b[j].map((x,t)=>mod(x-a*b[i][t]));}}return b.map(r=>r.slice(h));}
 function mult(M,x){return Array.from({length:N},(_,i)=>mod(M[Math.floor(i/w)].reduce((s,a,j)=>s+a*x[j*w+i%w],0)))}
 function means(x){return Array.from({length:w},(_,j)=>mod(inv(h)*Array.from({length:h},(_,i)=>x[i*w+j]).reduce((s,a)=>s+a,0)))}
 const add=(x,b)=>x.map((a,i)=>mod(a+b[i%w]));
 const eq=(a,b)=>a.every((x,i)=>x===b[i]);
 const sections=native.sections.map(s=>({name:s.name,x:[...s.source_text].map(c=>native.runes.indexOf(c)).filter(i=>i>=0)}));
 const held=["0_warning","jpg107-167","p56_an_end","p57_parable"];
 const training=sections.filter(s=>!held.includes(s.name)),uni=Array(q).fill(.5),bi=Array.from({length:q},()=>Array(q).fill(.5));
 for(const {x} of training){for(const a of x)uni[a]++;for(let i=1;i<x.length;i++)bi[x[i-1]][x[i]]++;}
 const norm=a=>{const n=a.reduce((s,x)=>s+x,0);return a.map(x=>Math.log(x/n)+L)},U=norm(uni),B=bi.map(norm);
 const order={row:Array.from({length:N},(_,i)=>i),column:Array.from({length:N},(_,i)=>(i%h)*w+Math.floor(i/h))};
 function score(x,ord){const y=ord.map(i=>x[i]);return y.slice(1).reduce((s,a,i)=>s+B[y[i]][a],U[y[0]])}
 function lse(a){const m=Math.max(...a);return m===-Infinity?m:m+Math.log(a.reduce((s,x)=>s+Math.exp(x-m),0))}
 function infer(x,ord){
   const un=Array.from({length:w},()=>Array(q).fill(0)),E=Array.from({length:w},()=>Array(q*q).fill(0));
   const i=ord[0];for(let a=0;a<q;a++)un[i%w][a]+=U[mod(x[i]+a)];
   for(let t=1;t<N;t++){const i=ord[t-1],j=ord[t],a=i%w,b=j%w;
    if(a===b){for(let u=0;u<q;u++)un[a][u]+=B[mod(x[i]+u)][mod(x[j]+u)];}
    else{assert((a+1)%w===b,"unexpected pair");for(let u=0;u<q;u++)for(let v=0;v<q;v++)E[a][u*q+v]+=B[mod(x[i]+u)][mod(x[j]+v)];}
   }
   let best=-Infinity,key=null;const totals=[];
   for(let first=0;first<q;first++){
    let sum=Array(q).fill(-Infinity),mx=Array(q).fill(-Infinity);sum[first]=mx[first]=un[0][first];const back=[];
    for(let a=0;a<w-1;a++){const ns=[],nm=[],bp=[];for(let v=0;v<q;v++){const vals=[];let max=-Infinity,ix=0;for(let u=0;u<q;u++){const e=E[a][u*q+v]+un[a+1][v];vals.push(sum[u]+e);const z=mx[u]+e;if(z>max){max=z;ix=u;}}ns.push(lse(vals));nm.push(max);bp.push(ix);}sum=ns;mx=nm;back.push(bp);}
    totals.push(lse(sum.map((v,u)=>v+E[w-1][u*q+first])));
    for(let u=0;u<q;u++){const z=mx[u]+E[w-1][u*q+first];if(z>best){best=z;key=Array(w);key[w-1]=u;for(let a=w-2;a>=0;a--)key[a]=back[a][key[a+1]];assert(key[0]===first,"backtrack");}}
   }
   const p=add(x,key);assert(Math.abs(score(p,ord)-best)<1e-8,"score mismatch");return {key,map:best,marginal:lse(totals)-w*L,p}
 }
 const fmt=(x,ord)=>ord.map(i=>corpus.translit[x[i]]).join(" ");
 const outputs=[],controls=[];
 for(const s of [-1,1]){
   const M=matrix(s),A=M.map(r=>r.map(v=>mod(v+inv(h)))),Ai=inverse(A);
   for(const alphabet of [grid.alphabet,grid.alphabet.replace("f","")]){
    const radix=alphabet.length,values=p50.tokens.map(t=>radix*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));assert(values.every(v=>v>=0&&v<256),"byte values");
    const c=values.map(mod),mu=means(c),x=mult(Ai,c),quot=values.map(v=>Math.floor(v/q));assert(eq(mult(A,x),c)&&eq(means(x),mu),"completion");
    for(const [name,ord] of Object.entries(order)){
     const res=infer(x,ord),fixed=score(x,ord),replay=add(mult(M,res.p),mu);assert(eq(replay,c)&&eq(replay.map((v,i)=>v+q*quot[i]),values),"byte replay");
     outputs.push({sign:s,radix,order:name,means:mu,fixedScore:fixed,mapScore:res.map,logBF:res.marginal,offsets:res.key,fixedReadout:fmt(x,ord),relaxedReadout:fmt(res.p,ord)});
     if(radix===60){for(const section of sections.filter(z=>held.includes(z.name)&&z.x.length>=N)){
       for(let start=0;start+N<=section.x.length;start+=N){
        const truth=Array(N);ord.forEach((i,j)=>truth[i]=section.x[start+j]);
        const plant=add(mult(M,truth),mu),base=mult(Ai,plant),rec=infer(base,ord);
        assert(eq(add(mult(M,rec.p),mu),plant),"control replay");
        controls.push({sign:s,order:name,section:section.name,start,correct:rec.p.filter((v,i)=>v===truth[i]).length,mapScore:rec.map,logBF:rec.marginal,trueScore:score(truth,ord)});
       }
     }}
    }
   }
 }
 return{row50:k,trainingRunes:training.reduce((s,z)=>s+z.x.length,0),original:outputs,controls};
}
const inputs=["resources/liber-primus/lp2-corpus.json","resources/liber-primus/lp2-grid-256.json","resources/external/relikd-solved-gp29-native-v1.json"].map(p=>JSON.parse(fs.readFileSync(p,"utf8")));
console.log(JSON.stringify(main(...inputs),null,2));
