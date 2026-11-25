// Source-fixed graph-affine red-event inverse. Run from repository root with Node.js.
"use strict";
const fs=require("node:fs");
function experiment(grid,ink,corpus){
 const q=29,mod=x=>((x%q)+q)%q,inv=x=>{for(let i=1;i<q;i++)if(mod(x*i)===1)return i;throw Error("singular")};
 const check=(x,m)=>{if(!x)throw Error(m)};
 const tokens=grid.pages.flatMap(p=>p.tokens);
 const ev=ink.pages.flatMap(p=>[...(p.red_spans??[]).flatMap(s=>Array.from(s.runes,(r,j)=>({page:p.page,pos:s.start+j,c:corpus.runes.indexOf(r),marker:false}))),...(p.large_punctuation??[]).filter(x=>x[1]===13).map(x=>({page:p.page,pos:x[0],marker:true}))].sort((a,b)=>a.pos-b.pos||(a.marker?-1:1)));
 check(tokens.length===256&&ev.length===256&&ev.filter(e=>e.marker).length===31,"length");
 for(const e of ev)if(!e.marker)check(e.c===corpus.pages.find(p=>p.page===e.page).indices[e.pos],"source agreement");
 const train=ev.flatMap((e,i)=>!e.marker&&e.page===56?[[i,[24,9,18,9,23][e.pos]]]:[]);
 const test=ev.flatMap((e,i)=>!e.marker&&e.page===57?[[i,corpus.pages.find(p=>p.page===57).indices[e.pos]]]:[]);
 check(train.length===5&&test.length===7,"anchors");
 const p57=corpus.pages.find(p=>p.page===57).indices;
 function gauss(rows,k){
  const A=rows.map(x=>x.map(mod));let rank=0;const piv=[];
  for(let j=0;j<k;j++){let i=rank;while(i<A.length&&A[i][j]===0)i++;if(i===A.length)continue;[A[i],A[rank]]=[A[rank],A[i]];const s=inv(A[rank][j]);A[rank]=A[rank].map(x=>mod(x*s));for(i=0;i<A.length;i++)if(i!==rank&&A[i][j]){const t=A[i][j];A[i]=A[i].map((x,l)=>mod(x-t*A[rank][l]))}piv.push(j);rank++}
  for(let i=rank;i<A.length;i++)if(A[i][k])return null;
  const particular=Array(k).fill(0);for(let i=0;i<rank;i++)particular[piv[i]]=A[i][k];
  const free=Array.from({length:k},(_,i)=>i).filter(j=>!piv.includes(j));
  const basis=free.map(j=>{const v=Array(k).fill(0);v[j]=1;for(let i=0;i<rank;i++)v[piv[i]]=mod(-A[i][j]);return v});
  return {rank,particular,basis,free};
 }
 function model(radix){
  const abc=radix===60?grid.alphabet:grid.alphabet.replace("f","");
  const f=tokens.map(t=>radix*abc.indexOf(t[0])+abc.indexOf(t[1]));
  check(f.every(x=>x>=0&&x<256),"address");
  const pred=Array.from({length:256},()=>[]);f.forEach((j,i)=>pred[j].push(i));
  const marks=ev.flatMap((e,i)=>e.marker?[i]:[]);
  const roots=[],seen=new Set();
  for(let i=0;i<256;i++){if(seen.has(i))continue;const path=[],local=new Map();let v=i;while(!seen.has(v)&&!local.has(v)&&!ev[v].marker){local.set(v,path.length);path.push(v);v=f[v]}if(local.has(v))roots.push(Math.min(...path.slice(local.get(v))));path.forEach(j=>seen.add(j))}
  const k=2+roots.length; // M, d, root(s)
  const unit=j=>Array.from({length:k+1},(_,i)=>+(i===j));
  const evaluate=(e,v)=>mod(e[k]+v.reduce((s,x,j)=>s+x*e[j],0));
  const anchors=(expr,pairs)=>pairs.map(([i,p])=>[...expr[i].slice(0,k),mod(p-expr[i][k])]);
  function build(C,a,b){
   const ai=inv(a), expr=Array(256), queue=[];
   for(const m of marks){expr[m]=unit(0);queue.push(m)}
   roots.forEach((m,j)=>{expr[m]=unit(j+2);queue.push(m)});
   for(let h=0;h<queue.length;h++){const v=queue[h];for(const i of pred[v])if(!expr[i]){
    const e=expr[v].map(x=>mod(-b*ai*x));e[1]=mod(e[1]-ai);e[k]=mod(e[k]+ai*C[i]);expr[i]=e;queue.push(i)
   }}
   check(queue.length===256,"complete inverse");
   const closure=roots.map(i=>{const e=expr[i].map((x,j)=>mod(a*x+b*expr[f[i]][j]));e[1]=mod(e[1]+1);return [...e.slice(0,k),mod(C[i]-e[k])]});
   return {expr,closure};
  }
  function solve(C, tr, te, truth){
   let fit=0,fitStates=0,full=0,fullStates=0,fitPredicts=0,fitAmbiguous=0;
   const candidates=[];let trueRetained=false,truthRecovered=false;
   for(let a=1;a<q;a++)for(let b=1;b<q;b++){
    const {expr,closure}=build(C,a,b), rows=closure.concat(anchors(expr,tr));
    const S=gauss(rows,k);if(!S)continue;
    fit++;fitStates+=q**S.free.length;
    const deterministic=te.every(([i])=>S.basis.every(v=>mod(v.reduce((s,x,j)=>s+x*expr[i][j],0))===0));
    if(deterministic&&te.every(([i,p])=>evaluate(expr[i],S.particular)===p))fitPredicts++;else if(!deterministic)fitAmbiguous++;
    const T=gauss(rows.concat(anchors(expr,te)),k);if(!T)continue;
    full++;fullStates+=q**T.free.length;
    const P=expr.map(e=>evaluate(e,T.particular));
    check(ev.every((e,i)=>e.marker?P[i]===T.particular[0]:C[i]===mod(a*P[i]+b*P[f[i]]+T.particular[1])),"replay");
    const invariant=expr.every(e=>T.basis.every(v=>mod(v.reduce((s,x,j)=>s+x*e[j],0))===0));
    if(truth&&a===truth.a&&b===truth.b){trueRetained=true;truthRecovered=invariant&&P.every((p,i)=>p===truth.P[i])}
    if(candidates.length<12)candidates.push({a,b,params:T.particular,free:T.free.length,plaintextInvariant:invariant,runes:P.filter((_,i)=>!ev[i].marker).map(x=>corpus.translit[x]).join("")})
   }
   return {fit,fitStates,full,fullStates,fitPredicts,fitAmbiguous,trueRetained,truthRecovered,candidates};
  }
  const C=ev.map(e=>e.marker?null:e.c);
  const controls=[];
  for(let j=0;j<3;j++){
   const a=[1,7,19][j],b=[1,13,28][j],M=[13,21,4][j],d=[0,17,5][j];let pos=0;
   const P=ev.map(e=>e.marker?M:p57[(pos+++j*23)%p57.length]);
   for(const [i,p] of train.concat(test))P[i]=p;
   const synth=P.map((p,i)=>ev[i].marker?null:mod(a*p+b*P[f[i]]+d));
   const out=solve(synth,train,test,{a,b,P});
   check(out.trueRetained,"true key lost");
   controls.push({a,b,M,d,...out,candidates:out.candidates.slice(0,2)});
  }
  return {radix,roots,parameters:k,original:solve(C,train,test),controls};
 }
 return {events:ev.length,anchors:{train,test},models:[model(59),model(60)]};
}
const paths=["resources/liber-primus/lp2-grid-256.json","resources/liber-primus/lp2-ink-annotations.json","resources/liber-primus/lp2-corpus.json"];
console.log(JSON.stringify(experiment(...paths.map(p=>JSON.parse(fs.readFileSync(p,"utf8")))),null,2));
