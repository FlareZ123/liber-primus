'use strict';
/**
 * Exact domain propagation for two native crib seeds. Every page is
 * a literal-F-held state machine. Domains are shared all-different K.
 * Forward/backward relaxed supports imply row and inverse-column
 * restrictions on mandatory consuming transitions. A matching SCC
 * filter removes all assignments absent from every perfect matching.
 */
function run(gp,native,prior){
 const assert=(x,m)=>{if(!x)throw Error(m)};
 const records=native.sections.map(s=>({name:s.name,p:Array.from(s.source_text).map(c=>gp.runes.indexOf(c)).filter(x=>x>=0)}));
 const original=gp.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>({page:p.page,c:p.indices}));
 const mod=(x,m)=>(x+2*m)%m,one=x=>x!==0&&(x&(x-1))===0,bitIndex=x=>31-Math.clz32(x);
 function pop(x){let n=0;while(x){x&=x-1;n++;}return n;}
 function prep(pages,anchors,m){
  return pages.map(f=>{
   const n=f.c.length-1,d=new Uint8Array(n),hold=new Uint8Array(n),allow=new Int32Array(n);
   const A=(1<<m)-1,N=A&~1;
   for(let i=0;i<n;i++){
    d[i]=mod(f.c[i+1]-f.c[i],m);let forced=-1;
    for(const a of anchors)if(a.page===f.page&&i+1>=a.i&&i+1<a.i+a.p.length){forced=a.p[i+1-a.i];break;}
    hold[i]=f.c[i+1]===0&&forced<=0?1:0;
    allow[i]=forced===0?0:forced>0?1<<forced:N;
   }
   return {page:f.page,n,d,hold,allow};
  });
 }
 function domains(K,m){
  const all=(1<<m)-1;let used=0;for(const k of K)if(k>=0){if(used&(1<<k))return null;used|=1<<k;}
  return Int32Array.from(K,k=>k>=0?1<<k:all&~used);
 }
 function filterMatching(D,m){
  // Perfect matching via augmenting paths; exact SCC filtering on the
  // directed graph of alternating row-to-owner edges.
  const owner=new Int8Array(m).fill(-1),seen=new Uint8Array(m);
  function augment(q){
   for(let x=D[q];x;){const b=x&-x,v=bitIndex(b);x^=b;
    if(seen[v])continue;seen[v]=1;
    if(owner[v]<0||augment(owner[v])){owner[v]=q;return true;}
   }
   return false;
  }
  const order=Array.from({length:m},(_,q)=>q).sort((a,b)=>pop(D[a])-pop(D[b]));
  for(const q of order){seen.fill(0);if(!augment(q))return -1;}
  const R=new Int32Array(m);
  for(let q=0;q<m;q++)for(let x=D[q];x;){const b=x&-x,v=bitIndex(b);x^=b;R[q]|=1<<owner[v];}
  for(let k=0;k<m;k++)for(let q=0;q<m;q++)if(R[q]&(1<<k))R[q]|=R[k];
  let change=0;
  for(let q=0;q<m;q++)for(let x=D[q];x;){const b=x&-x,v=bitIndex(b);x^=b;
   if(!(R[owner[v]]&(1<<q))){D[q]&=~b;change++;}
  }
  return change;
 }
 function propagate(D,frames,m){
  const ALL=(1<<m)-1,rot=(x,d)=>((x<<d)|(x>>>(m-d)))&ALL;
  let sweeps=0,removals=0,visited=0;
  while(true){
   sweeps++;let change=filterMatching(D,m);
   if(change<0)return {ok:false,reason:"matching",sweeps,removals,visited};
   const r=Array.from({length:m},(_,d)=>Int32Array.from(D,x=>rot(x,d)));
   for(const f of frames){
    const F=new Int32Array(f.n+1),B=new Int32Array(f.n+1);F[0]=1;B[f.n]=ALL;visited+=f.n;
    for(let i=0;i<f.n;i++){
     let next=f.hold[i]?F[i]:0;const a=f.allow[i],rr=r[f.d[i]];
     if(a){let c=0;for(let x=F[i];x;){const bit=x&-x;x^=bit;c|=rr[bitIndex(bit)];}next|=c&a;}
     F[i+1]=next;if(!next)return {ok:false,reason:"forward",page:f.page,at:i+1,sweeps,removals,visited};
    }
    for(let i=f.n-1;i>=0;i--){
     let prev=f.hold[i]?B[i+1]:0;const target=f.allow[i]&B[i+1];
     if(target){const v=rot(target,(m-f.d[i])%m);
      for(let q=0;q<m;q++)if(D[q]&v)prev|=1<<q;
     }
     B[i]=prev;
    }
    if(!(B[0]&1))return {ok:false,reason:"backward",page:f.page,sweeps,removals,visited};
    for(let i=0;i<f.n;i++){
     const S=F[i],T=B[i+1];if(f.hold[i]&&(S&T))continue;
     const v=rot(f.allow[i]&T,(m-f.d[i])%m);
     let rows=0,values=0;
     for(let x=S;x;){const bit=x&-x,q=bitIndex(bit);x^=bit;const a=D[q]&v;if(a){rows|=bit;values|=a;}}
     if(!rows)return {ok:false,reason:"mandatory_edge",page:f.page,at:i+1,sweeps,removals,visited};
     if(one(rows)){
      const q=bitIndex(rows),old=D[q];D[q]&=values;change+=pop(old^D[q]);
     }
     if(one(values)){
      for(let q=0;q<m;q++)if(!(rows&(1<<q))&&(D[q]&values)){D[q]&=~values;change++;}
     }
    }
   }
   removals+=change;
   if(!change)return {ok:true,sweeps,removals,visited};
  }
 }
 function exact(C,K,anchors,m){
  const f=prep([{page:0,c:C}],anchors.map(a=>({...a,page:0})),m)[0];let states=new Set([0]);
  for(let i=0;i<f.n;i++){let next=new Set();for(const q of states){if(f.hold[i])next.add(q);const p=mod(f.d[i]+K[q],m);if(f.allow[i]&(1<<p))next.add(p);}states=next;if(!states.size)return false;}
  return true;
 }
 function enumerate(m,fn){
  const K=new Array(m),rec=(q,used)=>{if(q===m){fn(K.slice());return;}for(let v=0;v<m;v++)if(!(used&(1<<v))){K[q]=v;rec(q+1,used|(1<<v));}};rec(0,0);
 }
 let seed=0x3143ab;function rand(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n;}
 function perm(m){const K=Array.from({length:m},(_,i)=>i);for(let i=m-1;i>0;i--){let j=rand(i+1);[K[i],K[j]]=[K[j],K[i]];}return K;}
 function encode(P,K,iv,m){let q=0,c=[iv];for(const p of P){c.push(p===0?0:mod(c.at(-1)+p-K[q],m));if(p)q=p;}return c;}
 // Exhaustive soundness: no real solution may lose an assigned edge.
 // Nonempty propagated domains need not imply existence of a legal key.
 let small={cases:0,feasible:0,infeasible:0,provedUnsat:0,solutions:0};
 for(let m=3;m<=7;m++)for(let t=0;t<24;t++){
  const K=perm(m),P=Array.from({length:8+rand(5)},()=>rand(m)),C=t%2===0?encode(P,K,rand(m),m):Array.from({length:P.length+1},()=>rand(m));
  const a={page:0,i:2,p:P.slice(1,4)},fixed=K.map(v=>rand(4)===0?v:-1),D=domains(fixed,m),F=prep([{page:0,c:C}],[a],m);
  let truths=[];enumerate(m,k=>{if(k.every((v,q)=>fixed[q]<0||v===fixed[q])&&exact(C,k,[a],m))truths.push(k);});
  const s=propagate(D,F,m);small.cases++;small.solutions+=truths.length;
  if(truths.length){small.feasible++;assert(s.ok&&truths.every(k=>k.every((v,q)=>D[q]&(1<<v))),"propagation lost a solution");}
  else{small.infeasible++;if(!s.ok)small.provedUnsat++;}
 }
 // Apply exact full-page support to all surviving two-crib seeds.
 const trials=[];
 for(const pair of prior.L12.viablePairs){
  const anchors=[pair.a,pair.b].map(a=>({...a,p:records.find(r=>r.name===a.name).p.slice(a.j,a.j+12)}));
  const pages=[...original.filter(f=>anchors.some(a=>a.page===f.page)),...original.filter(f=>!anchors.some(a=>a.page===f.page))];
  const F=prep(pages,anchors,29);
  for(let x=pair.mask;x;){const b=x&-x,k0=bitIndex(b);x^=b;
   const K=pair.K.slice();K[0]=k0;const D=domains(K,29),before=Array.from(D).reduce((s,x)=>s+pop(x),0);
   const s=propagate(D,F,29);
   trials.push({a:pair.a,b:pair.b,k0,K,before,after:Array.from(D).reduce((s,x)=>s+pop(x),0),fixed:Array.from(D).filter(one).length,D:Array.from(D),...s});
  }
 }
 return {small,trials};
}
if(typeof require!=='undefined'&&require.main===module){
 const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
 const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
 console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json'),read('im-results/lp2-plainprev-fhold-native-multicrib-output.json')),null,2));
}
