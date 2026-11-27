'use strict';
const INPUTS=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt","im-results/lp2-plainprev-fhold-seed-domain-propagation-output.json","im-results/lp2-plainprev-fhold-seed-domain-search-output.json","resources/external/relikd-solved-gp29-native-v1.json"];
function run(raw,options={}){
 const {start=0,count=8,controls=false}=options;
 const gp=JSON.parse(raw[0]),prior=JSON.parse(raw[4]),search=JSON.parse(raw[5]),A=29,ALL=(1<<A)-1,mod=(x,m=A)=>(x+m)%m,bit=x=>31-Math.clz32(x),one=x=>x!==0&&(x&(x-1))===0;
 const assert=(x,m)=>{if(!x)throw Error(m)},sum=x=>x.reduce((a,b)=>a+b,0),tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);let p=[];for(const w0 of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){const w=w0.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,w);p.push(v.i);j+=v.t.length;}}return p}
 const donors=raw.slice(1,4).map(native),train=donors.map(d=>d.slice(0,d.length-16000)),U0=new Float64Array(A).fill(.5),B0=new Float64Array(A*A);
 for(const p of train)for(let i=0;i<p.length;i++){U0[p[i]]++;if(i)B0[p[i-1]*A+p[i]]++;}
 const U=U0.map(x=>x/sum(U0)),B=new Float64Array(A*A);for(let q=0;q<A;q++){const n=sum(B0.subarray(q*A,(q+1)*A));for(let p=0;p<A;p++)B[q*A+p]=(B0[q*A+p]+8*U[p])/(n+8);}
 const L1=U.map(x=>Math.log(A*x)),L2=B.map(x=>Math.log(A*x));
 const frames=gp.pages.filter(p=>p.page<=55&&p.indices.length).map(p=>({page:p.page,c:p.indices}));
 const ranked=prior.trials.filter(t=>t.ok).sort((a,b)=>a.after-b.after),ids=search.batches.flatMap(b=>b.exactResults).filter(t=>t.status==="UNKNOWN").map(t=>t.i);
 // Exact maximum path score for the relaxed domain machine. State q
 // is previous consuming rune; state A+q means previous actual rune F.
 // For each transition, permit any K[q] in its domain independently.
 // Thus the result is an upper bound for every shared permutation.
 function best(C,D,trace=false){
  let s=new Float64Array(2*A),t=s.slice();s.fill(-Infinity);s[0]=0;
  const hist=trace?[]:null;
  for(let i=1;i<C.length;i++){
   t.fill(-Infinity);const d=mod(C[i]-C[i-1]),z=C[i]===0;
   const back=trace?new Int16Array(2*A).fill(-1):null;
   for(let q=0;q<A;q++){
    const a=s[q],b=s[A+q];if(a===-Infinity&&b===-Infinity)continue;
    if(z){const l=i===1?a+L1[0]:a+L2[q*A],h=b+L2[0],v=Math.max(l,h);
     if(v>t[A+q]){t[A+q]=v;if(back)back[A+q]=l>=h?q:A+q;}}
    for(let x=D[q];x;){const k=x&-x;x^=k;const p=mod(d+bit(k));if(!p)continue;
     const l=i===1?a+L1[p]:a+L2[q*A+p],h=b+L2[p],v=Math.max(l,h);
     if(v>t[p]){t[p]=v;if(back)back[p]=l>=h?q:A+q;}}
   }
   if(hist)hist.push(back);
   [s,t]=[t,s];
  }
  let end=0;for(let q=1;q<2*A;q++)if(s[q]>s[end])end=q;
  const score=s[end];if(!trace||!Number.isFinite(score))return {score};
  const P=[];for(let i=hist.length-1;i>=0;i--){P.push(end>=A?0:end);end=hist[i][end];assert(end>=0,"trace");}
  return {score,P:P.reverse()};
 }
 function enc(P,K,iv){let q=0,c=[iv];for(const p of P){c.push(p===0?0:mod(c.at(-1)+p-K[q]));if(p)q=p;}return c}
 function score(P){return sum(P.map((p,i)=>i?L2[P[i-1]*A+p]:L1[p]));}
 let seed=0x42f03429;function rnd(n){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)%n}
 function perm(){const k=Array.from({length:A},(_,q)=>q);for(let i=A-1;i>0;i--){const j=rnd(i+1);[k[i],k[j]]=[k[j],k[i]];}return k}
 if(controls){
  // Exhaust all legal plaintext paths for short ciphertexts with fixed keys.
  let bruteChecks=0,plantChecks=[];
  for(let t=0;t<120;t++){
   const K=perm(),P=Array.from({length:9},()=>rnd(A)),C=enc(P,K,rnd(A)),D=K.map(v=>1<<v);
   let max=-Infinity;function rec(i,q,p){if(i===C.length){max=Math.max(max,score(p));return;}
    if(C[i]===0)rec(i+1,q,[...p,0]);const v=mod(C[i]-C[i-1]+K[q]);if(v)rec(i+1,v,[...p,v]);}
   rec(1,0,[]);const s=best(C,D,true);assert(Math.abs(s.score-max)<1e-8&&enc(s.P,K,C[0]).join()===C.join(),"exact Viterbi");bruteChecks++;
  }
  // Three independent source tails, exact original physical geometry.
  for(let j=0;j<3;j++){
   const K=perm(),pattern=ranked[ids[j*10]].D,used=K.reduce((s,v,q)=>one(pattern[q])?s|(1<<v):s,0),D=K.map((v,q)=>one(pattern[q])?1<<v:ALL&~used);
   let pos=donors[j].length-16000,oracle=0,hard=0,upper=0,n=0,repeats=0;
   for(const f of frames){const P=donors[j].slice(pos,pos+f.c.length-1);pos+=P.length;const C=enc(P,K,f.c[0]);const a=score(P),b=best(C,K.map(v=>1<<v),true),u=best(C,D).score;
    assert(b.score+1e-8>=a&&u+1e-8>=b.score&&enc(b.P,K,C[0]).join()===C.join(),"plant bound");oracle+=a;hard+=b.score;upper+=u;n+=P.length;for(let i=1;i<C.length;i++)if(C[i]===C[i-1])repeats++;}
   plantChecks.push({donor:j,oracle:oracle/n,hard:hard/n,upper:upper/n,n,repeats,fixed:pattern.filter(one).length});
  }
  return {bruteChecks,plantChecks};
 }
 const bitIndex=bit;
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

 // Score-constrained search, not an unconditional legality proof.
 // Branch on row most inconsistently used by the relaxed optimum.
 // Recompute the exact admissible bound after assignment; never prune
 // on a heuristic score, except the explicitly frozen native floor.
 const FLOOR=.65,isTrain=p=>!(p<=2||p>=15&&p<=22);
 const records=JSON.parse(raw[6]).sections.map(s=>({name:s.name,p:Array.from(s.source_text).map(c=>gp.runes.indexOf(c)).filter(x=>x>=0)}));
 function fitKey(source,anchors,D,cap,floor){
  const pages=[...source.filter(f=>anchors.some(a=>a.page===f.page)),...source.filter(f=>!anchors.some(a=>a.page===f.page))];
  const full=prep(pages,anchors,A);
  const short=full.map((f,j)=>{
   if(j<anchors.length)return f;
   let n=0;while(n<f.n&&!f.hold[n])n++;
   return {...f,n,d:f.d.subarray(0,n),hold:f.hold.subarray(0,n),allow:f.allow.subarray(0,n)};
  }).filter(f=>f.n);
  const eligible=source.filter(f=>!anchors.some(a=>a.page===f.page));
  const train=eligible.filter(f=>isTrain(f.page)).sort((a,b)=>b.c.length-a.c.length),hold=eligible.filter(f=>!isTrain(f.page));
  const N=sum(train.map(f=>f.c.length-1)),H=sum(hold.map(f=>f.c.length-1));
  let nodes=0,propDead=0,scoreDead=0,evaluated=0,capped=false,witness=null,rootUpper=null,leaf=0,frameEvals=0;
  function dfs(D,parent){
   if(nodes>=cap){capped=true;return false;}nodes++;
   const prop=propagate(D,short,A);if(!prop.ok){propDead++;return false;}
   const bounds=parent?parent.slice():new Array(train.length).fill(Infinity),cnt=new Int32Array(A*A);
   let upper=parent?sum(parent):Infinity,partial=0;
   for(let j=0;j<train.length;j++){
    const f=train[j],z=best(f.c,D,true);frameEvals++;
    if(!Number.isFinite(z.score)){propDead++;return false;}
    if(parent){upper+=z.score-bounds[j];if(upper<floor*N-1e-7){scoreDead++;return false;}}
    bounds[j]=z.score;partial+=z.score;
    let q=0;
    for(let k=0;k<z.P.length;k++){const p=z.P[k];if(!p)continue;const v=mod(p-f.c[k+1]+f.c[k]+A);cnt[q*A+v]++;q=p;}
   }
   evaluated++;if(rootUpper===null)rootUpper=partial/N;
   if(partial<floor*N-1e-7){scoreDead++;return false;}
   let row=-1,priority=-Infinity;
   for(let q=0;q<A;q++)if(!one(D[q])){
    let n=0,max=0;for(let x=D[q];x;){const b=x&-x,v=bit(b),h=cnt[q*A+v];x^=b;n+=h;max=Math.max(max,h);}
    const s=(n-max)*1024+n-pop(D[q])*.001;if(s>priority){priority=s;row=q;}
   }
   if(row<0){
    leaf++;const p=propagate(D,full,A);if(!p.ok){propDead++;return false;}
    const K=Array.from(D,bit),decoded=hold.map(f=>({page:f.page,...best(f.c,D,true)}));
    for(const f of hold){const z=decoded.find(g=>g.page===f.page);assert(enc(z.P,K,f.c[0]).join()===f.c.join(),"leaf replay");}
    witness={K,train:partial/N,held:sum(decoded.map(t=>t.score))/H,decoded};return true;
   }
   const values=[];for(let x=D[row];x;){const b=x&-x;x^=b;values.push(b);}
   values.sort((a,b)=>cnt[row*A+bit(b)]-cnt[row*A+bit(a)]);
   for(const b of values){const next=D.slice();next[row]=b;for(let q=0;q<A;q++)if(q!==row)next[q]&=~b;if(dfs(next,bounds))return true;if(capped)return false;}
   return false;
  }
  const ok=dfs(Int32Array.from(D),null);
  return {status:ok?"SAT":capped?"UNKNOWN":"BELOW_FLOOR",nodes,propDead,scoreDead,evaluated,rootUpper,leaf,frameEvals,N,H,floor,witness};
 }
 function testOne(j,cap){
  const K=perm(),cost=(q,p)=>U[q]*B[q*A+p];let rate=sum(K.map((p,q)=>cost(q,p)));
  for(let it=0;it<20000&&Math.abs(rate-.00664)>.00001;it++){
   const a=rnd(A),b=rnd(A),nr=rate-cost(a,K[a])-cost(b,K[b])+cost(a,K[b])+cost(b,K[a]);
   if(a!==b&&Math.abs(nr-.00664)<Math.abs(rate-.00664)){[K[a],K[b]]=[K[b],K[a]];rate=nr;}
  }
  let pos=donors[j].length-16000;
  const source=frames.map(f=>{const P=donors[j].slice(pos,pos+f.c.length-1);pos+=P.length;return {page:f.page,c:enc(P,K,f.c[0]),P};});
  const t=ranked[122],anchors=[t.a,t.b].map(a=>({page:a.page,i:a.i,p:source.find(f=>f.page===a.page).P.slice(a.i-1,a.i+11)}));
  const partial=new Int8Array(A).fill(-1);partial[0]=K[0];
  for(const a of anchors){let q=-1;const C=source.find(f=>f.page===a.page).c;
   for(let i=0;i<a.p.length;i++){const p=a.p[i];if(!p)continue;if(q>=0){partial[q]=mod(p-C[a.i+i]+C[a.i+i-1]+A);assert(partial[q]===K[q],"seed row");}q=p;}}
  const D=domains(partial,A),eligible=source.filter(f=>!anchors.some(a=>a.page===f.page)&&isTrain(f.page));
  const oracle=sum(eligible.map(f=>score(f.P)))/sum(eligible.map(f=>f.P.length));
  const out=fitKey(source,anchors,D,cap,FLOOR),repeats=sum(source.map(f=>f.c.slice(1).filter((c,i)=>c===f.c[i]).length));
  let recovered=null;
  if(out.witness){const W=out.witness;recovered={rows:W.K.filter((v,q)=>v===K[q]).length,heldRunes:sum(W.decoded.map(f=>f.P.filter((v,i)=>v===source.find(g=>g.page===f.page).P[i]).length)),heldN:out.H};}
  return {donor:j,fixed:partial.filter(v=>v>=0).length,oracle,repeats,recovered,...out};
 }
 if(options.fitPlant!==undefined)return testOne(options.fitPlant,options.cap??128);
 if(options.fitSeed!==undefined){
  const t=ranked[options.fitSeed],anchors=[t.a,t.b].map(a=>({...a,p:records.find(s=>s.name===a.name).p.slice(a.j,a.j+12)}));
  return {i:options.fitSeed,a:t.a,b:t.b,fixed:t.fixed,...fitKey(frames,anchors,t.D,options.cap??128,FLOOR)};
 }

 const results=[];
 for(const i of ids.slice(start,start+count)){
  const t=ranked[i],D=t.D,used=frames.filter(f=>f.page!==t.a.page&&f.page!==t.b.page);let total=0,n=0,pg=[];
  for(const f of used){const s=best(f.c,D).score;total+=s;n+=f.c.length-1;pg.push({page:f.page,score:s/(f.c.length-1)});}
  results.push({i,a:t.a,b:t.b,k0:t.k0,fixed:t.fixed,mean:total/n,n,pg});
 }
 return {start,count,total:ids.length,results};
}
if(typeof require!=='undefined'&&require.main===module){const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');const raw=INPUTS.map(p=>fs.readFileSync(path.join(root,p),'utf8'));const [mode,i,cap]=process.argv.slice(2);const options=mode==='plant'?{fitPlant:Number(i),cap:Number(cap??128)}:mode==='seed'?{fitSeed:Number(i),cap:Number(cap??128)}:{controls:true};console.log(JSON.stringify(run(raw,options),null,2));}
