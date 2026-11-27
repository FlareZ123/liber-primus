'use strict';
// Exact seeded full-page receiver using the same domain propagation as the prior SFT.
function run(gp,native,prior,options={}){
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

 function exactSearch(D,frames,m,cap){
  const all=(1<<m)-1,rot=(x,d)=>((x<<d)|(x>>>(m-d)))&all;
  // Full anchored frames plus necessary initial zero-free prefixes.
  // A complete candidate must pass exact full-frame replay.
  const short=frames.map((f,j)=>{
   if(j<2)return f;
   let n=0;while(n<f.n&&!f.hold[n])n++;
   return {...f,n,d:f.d.subarray(0,n),hold:f.hold.subarray(0,n),allow:f.allow.subarray(0,n)};
  }).filter(f=>f.n);
  let nodes=0,visited=0,dead=0,leaves=0,capped=false,witness=null;
  function quick(D){
   for(const f of short){let q=0;for(let i=0;i<f.n;i++){
    if(f.hold[i]||!one(D[q]))break;
    q=mod(f.d[i]+bitIndex(D[q]),m);
    if(!(f.allow[i]&(1<<q)))return false;
   }}
   return true;
  }
  function leaf(D){
   leaves++;
   for(const f of frames){
    let S=1;
    for(let i=0;i<f.n;i++){
     let next=f.hold[i]?S:0;const a=f.allow[i],d=f.d[i];
     if(a){for(let x=S;x;){const b=x&-x;x^=b;next|=rot(D[bitIndex(b)],d)&a;}}
     S=next;if(!S)return false;
    }
   }
   witness=Array.from(D,bitIndex);return true;
  }
  function dfs(D){
   if(nodes>=cap){capped=true;return false;}nodes++;
   if(!quick(D)){dead++;return false;}
   const fixed=Array.from(D).filter(one).length;
   const p=propagate(D,fixed>=m-4?frames:short,m);visited+=p.visited;
   if(!p.ok){dead++;return false;}
   let row=-1,best=100,counts=new Uint8Array(m);
   for(const f of short){let q=0;for(let i=0;i<f.n;i++){
    if(f.hold[i])break;
    if(!one(D[q])){counts[q]++;break;}
    q=mod(f.d[i]+bitIndex(D[q]),m);
   }}
   for(let q=0;q<m;q++){
    const n=pop(D[q]);if(n>1&&(n<best||n===best&&counts[q]>counts[row])){best=n;row=q;}
   }
   if(row<0)return leaf(D);
   for(let x=D[row];x;){const b=x&-x;x^=b;const next=D.slice();next[row]=b;for(let q=0;q<m;q++)if(q!==row)next[q]&=~b;if(dfs(next))return true;if(capped)return false;}
   return false;
  }
  const sat=dfs(D.slice());return {status:sat?"SAT":capped?"UNKNOWN":"UNSAT",nodes,visited,dead,leaves,witness};
 }
 if(options.controls){
  let searchControls={SAT:0,UNSAT:0,nodes:0};
  for(let m=3;m<=7;m++)for(let t=0;t<24;t++){
   const K=perm(m),fixed=K.map(v=>rand(4)===0?v:-1),pages=[],anchors=[];
   for(let page=0;page<3;page++){
    const P=Array.from({length:8+rand(5)},()=>rand(m));
    const c=t%2===0?encode(P,K,rand(m),m):Array.from({length:P.length+1},()=>rand(m));
    pages.push({page,c});if(page<2)anchors.push({page,i:2,p:P.slice(1,4)});
   }
   let truth=false;enumerate(m,k=>{
    if(k.every((v,q)=>fixed[q]<0||v===fixed[q])&&pages.every(f=>exact(f.c,k,anchors.filter(a=>a.page===f.page),m)))truth=true;
   });
   const frames=prep(pages,anchors,m),s=exactSearch(domains(fixed,m),frames,m,100000);
   assert(s.status===(truth?"SAT":"UNSAT"),"search disagrees with exhaustive truth");
   if(s.witness)assert(pages.every(f=>exact(f.c,s.witness,anchors.filter(a=>a.page===f.page),m)),"search witness");
   searchControls[s.status]++;searchControls.nodes+=s.nodes;
  }
  return searchControls;
 }
 const ranked=prior.trials.filter(t=>t.ok).sort((a,b)=>a.after-b.after);
 const start=options.start??0,count=options.count??10,cap=options.cap??256,exactResults=[];
 for(let i=start;i<Math.min(start+count,ranked.length);i++){
  const t=ranked[i],anchors=[t.a,t.b].map(a=>({...a,p:records.find(r=>r.name===a.name).p.slice(a.j,a.j+12)}));
  const pages=[...original.filter(f=>anchors.some(a=>a.page===f.page)),...original.filter(f=>!anchors.some(a=>a.page===f.page))];
  const frames=prep(pages,anchors,29),result=exactSearch(Int32Array.from(t.D),frames,29,cap);
  exactResults.push({i,a:t.a,b:t.b,k0:t.k0,fixed:t.fixed,after:t.after,...result});
 }
 return {start,count,cap,total:ranked.length,exactResults};
}
if(typeof require!=='undefined'&&require.main===module){
 const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
 const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
 const args=process.argv.slice(2);
 const options=args[0]==='controls'?{controls:true}:{start:Number(args[0]??0),count:Number(args[1]??10),cap:Number(args[2]??256)};
 console.log(JSON.stringify(run(read('resources/liber-primus/lp2-corpus.json'),read('resources/external/relikd-solved-gp29-native-v1.json'),read('im-results/lp2-plainprev-fhold-seed-domain-propagation-output.json'),options),null,2));
}
