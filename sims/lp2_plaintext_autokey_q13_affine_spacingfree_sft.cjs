'use strict';
/** Plaintext-fed GP29 autokey, latent F holds, unknown invertible affine plaintext feedback. */
const files=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function study(inputs,lib,which='both',q=13,seed=0x330113a5){
 const gp=JSON.parse(inputs[0]),native=JSON.parse(inputs[1]),assert=(x,m)=>{if(!x)throw Error(m)};
 const alpha=new Map(gp.translit.map((x,i)=>[x,i]));alpha.set("ING",21);
 const rune=new Map(gp.runes.map((x,i)=>[x,i]));
 const seqs=new Map(native.sections.map(s=>[s.name,Array.from(s.source_text).filter(x=>rune.has(x)).map(x=>rune.get(x))]));
 assert(String(seqs.get("p57_parable"))===String(gp.pages[57].indices),"actual p57");
 function donor(s){const start=/\*\*\* START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[^\r\n]*\*\*\*/i.exec(s);if(start)s=s.slice(start.index+start[0].length);const end=/\*\*\* END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK/i.exec(s);if(end)s=s.slice(0,end.index);let out=[];for(let t of s.match(/[A-Za-z]+/g)||[]){t=t.toUpperCase().replace(/QU/g,"CW").replace(/[KQ]/g,"C").replace(/V/g,"U").replace(/Z/g,"S");while(t.length){let ok=false;for(let n=Math.min(t.length,3);n>=1;n--){const v=alpha.get(t.slice(0,n));if(v!==undefined){out.push(v);t=t.slice(n);ok=true;break}}assert(ok,"native translation");}}return out}
 const train=inputs.slice(2).map(donor).map(p=>p.slice(0,Math.floor(p.length*.7)));
 const lm=lib.train(train),split=232,n=308,mod=x=>((x%29)+29)%29;
 let rng=seed;function rand(n){rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return (rng>>>0)%n}

 function encrypt(P,K,a,b){const k=K.slice();return P.map(x=>{if(x===0)return 0;const c=mod(x+k.shift());k.push(mod(a*x+b));return c})}
 const render=P=>P.map(x=>gp.translit[x]).join("");
 const ALL=(1<<29)-1,inv=Array.from({length:29},(_,a)=>Array.from({length:29},(_,b)=>b).find(b=>mod(a*b)===1));
 function layout(C,mask){const phase=new Int8Array(C.length).fill(-1);let z=0,j=0;for(let i=0;i<C.length;i++){if(C[i]===0&&((mask>>>z++)&1))continue;phase[i]=j++%q}return phase}
 function state(C,phase,a,b,full=false){
  const domains=Array(q).fill(ALL),hb=new Int8Array(q),hs=new Int8Array(q).fill(1),pb=new Int8Array(C.length),ps=new Int8Array(C.length);
  const U=Array.from({length:q},()=>new Float64Array(29));let constant=0;
  for(let i=0;i<C.length;i++){const j=phase[i];if(j<0){constant+=lm.uni[0];continue}
   const u=mod(C[i]-hb[j]),v=mod(-hs[j]);pb[i]=u;ps[i]=v;
   domains[j]&=~(1<<mod(-u*inv[v]));if(!domains[j])return null;
   const scores=U[j];for(let k=0,p=u;k<29;k++,p+=v){if(p>=29)p-=29;scores[k]+=lm.uni[p]}
   hb[j]=mod(a*u+b);hs[j]=mod(a*v);
  }
  let marginal=constant,upper=constant;const d=domains.map((bits,j)=>{const out=[];let m=-Infinity;for(let k=0;k<29;k++)if(bits&(1<<k)){out.push(k);m=Math.max(m,U[j][k])}upper+=m;marginal+=m+Math.log(out.reduce((s,k)=>s+Math.exp(U[j][k]-m),0))-Math.log(29);return out});
  if(!full)return {marginal,upper};
  return {phase,domains:d,values:C.map((_,i)=>phase[i]<0?[0]:d[phase[i]].map(k=>mod(pb[i]+ps[i]*k))),marginal,upper};
 }
 function factors(C,s,order){
  const {phase,domains,values}=s,D=domains.map(x=>x.length),U=D.map(n=>new Float64Array(n)),B=D.map((n,j)=>new Float64Array(n*D[(j+1)%q])),T=order===3?D.map((n,j)=>new Float64Array(n*D[(j+1)%q]*D[(j+2)%q])):null;let constant=0;
  for(let i=0;i<C.length;i++){
   const n=Math.min(i+1,order),start=i-n+1,ph=Array.from(phase.slice(start,i+1)).filter(v=>v>=0),m=ph.length;
   if(!m){constant+=n===1?lm.uni[0]:n===2?lm.bi[0]:lm.tri[0];continue}
   const j=ph[0],out=m===1?U[j]:m===2?B[j]:T[j],v0=values[start],v1=n>=2?values[start+1]:null,v2=n===3?values[start+2]:null;
   if(n===1){for(let a=0;a<v0.length;a++)out[a]+=lm.uni[v0[a]]}
   else if(n===2){let t=0;for(const a of v0)for(const b of v1)out[t++]+=lm.bi[a*29+b]}
   else{let t=0;for(const a of v0)for(const b of v1)for(const c of v2)out[t++]+=lm.tri[(a*29+b)*29+c]}
  }
  if(order===2){for(let j=0;j<q;j++)for(let a=0;a<D[j];a++)for(let b=0;b<D[(j+1)%q];b++)B[j][a*D[(j+1)%q]+b]+=U[j][a];return {D,F:B,constant}}
  for(let j=0;j<q;j++){const db=D[(j+1)%q],dc=D[(j+2)%q];let t=0;for(let a=0;a<D[j];a++)for(let b=0;b<db;b++){const v=U[j][a]+B[j][a*db+b];for(let c=0;c<dc;c++)T[j][t++]+=v}}return {D,F:T,constant};
 }
 function plain(C,s,key){return C.map((_,i)=>s.phase[i]<0?0:s.values[i][s.domains[s.phase[i]].indexOf(key[s.phase[i]])])}
 function marginal(C,s){const S=s.domains.map(x=>new Float64Array(x.length));let z=0;for(let i=0;i<C.length;i++){const ph=s.phase[i];if(ph<0){z+=lm.uni[0];continue}for(let j=0;j<S[ph].length;j++)S[ph][j]+=lm.uni[s.values[i][j]]}for(const v of S){const m=Math.max(...v);z+=m+Math.log(v.reduce((a,b)=>a+Math.exp(b-m),0))-Math.log(29)}return z}
 function frozen(C,split,K,aa,bb){
  let states=new Map([[String.fromCharCode(...K,29,29),{z:0,v:0,path:""}]]),prefixZ=null,peak=1;
  for(let i=0;i<C.length;i++){
   if(i===split)prefixZ=[...states.values()].reduce((z,x)=>lib.logadd(z,x.z),-Infinity);
   const dst=new Map(),c=C[i];
   for(const [key,a] of states){const k=key.charCodeAt(0),x=key.charCodeAt(q),y=key.charCodeAt(q+1),p=mod(c-k);
    const emit=(p,queue)=>{const score=y===29?lm.uni[p]:x===29?lm.bi[y*29+p]:lm.tri[(x*29+y)*29+p],t=queue+String.fromCharCode(y,p),z=a.z+score,v=a.v+score;let b=dst.get(t);if(!b)dst.set(t,{z,v,path:a.path+String.fromCharCode(p)});else{b.z=lib.logadd(b.z,z);if(v>b.v){b.v=v;b.path=a.path+String.fromCharCode(p)}}};
    if(c===0)emit(0,key.slice(0,q));if(p!==0)emit(p,key.slice(1,q)+String.fromCharCode(mod(aa*p+bb)))
   }
   states=dst;peak=Math.max(peak,states.size);if(!states.size)return {legal:false,failedAt:i,peak};if(states.size>100000)return {legal:null,reason:"state budget",failedAt:i,peak}
  }
  const a=[...states.values()],best=a.reduce((x,y)=>x.v>y.v?x:y),P=Array.from(best.path,x=>x.charCodeAt(0));assert(String(encrypt(P,K,aa,bb))===String(C),"full replay");
  return {legal:true,peak,score:(a.reduce((z,x)=>lib.logadd(z,x.z),-Infinity)-prefixZ)/(C.length-split),P};
 }
 function solve(name,C,split,P=null,K=null,aa=null,bb=null){
  const start=Date.now(),pref=C.slice(0,split),z=pref.filter(v=>!v).length;assert(z<=6,"mask cap");let truthMask=null;
  if(P){truthMask=0;let j=0;for(let i=0;i<split;i++)if(pref[i]===0){if(P[i]===0)truthMask|=1<<j;j++}}
  const truth=x=>x.mask===truthMask&&x.a===aa&&x.b===bb;
  const layouts=Array.from({length:2**z},(_,mask)=>layout(pref,mask));
  let ranks=[];for(let mask=0;mask<layouts.length;mask++)for(let a=1;a<29;a++)for(let b=0;b<29;b++){const s=state(pref,layouts[mask],a,b);if(s)ranks.push({mask,a,b,u:s.marginal,upper:s.upper})}
  ranks.sort((a,b)=>b.u-a.u||a.mask-b.mask||a.a-b.a||a.b-b.b);
  const b=ranks.slice(0,128).map(x=>{const s=state(pref,layouts[x.mask],x.a,x.b,true);return {...x,bi:lib.optimize(s,factors(pref,s,2),2).score}}).sort((a,b)=>b.bi-a.bi);
  const t=b.slice(0,12).map(x=>{const s=state(pref,layouts[x.mask],x.a,x.b,true),v=lib.optimize(s,factors(pref,s,3),3),p=plain(pref,s,v.key);assert(Math.abs(v.score-lib.scorePlain(p,lm))<1e-6,"factor score");assert(String(encrypt(p,v.key,x.a,x.b))===String(pref),"prefix replay");return {...x,tri:v.score,key:v.key,p}}).sort((a,b)=>b.tri-a.tri);
  return {name,split,seconds:(Date.now()-start)/1000,zeros:z,totalPairs:layouts.length*812,legalPairs:ranks.length,maxUnigramScore:ranks.reduce((m,x)=>Math.max(m,x.upper),-Infinity)/split,trueUnigramScore:P?P.slice(0,split).reduce((s,p)=>s+lm.uni[p],0)/split:null,truthMask,truthModel:P?[aa,bb]:null,truthRanks:P?[ranks.findIndex(truth)+1,b.findIndex(truth)+1,t.findIndex(truth)+1]:null,truthKey:K,candidates:t.map(x=>{const f=frozen(C,split,x.key,x.a,x.b);return {mask:x.mask,a:x.a,b:x.b,key:x.key,tri:x.tri,prefix:render(x.p),continuation:f.legal?{legal:true,peak:f.peak,score:f.score,suffix:render(f.P.slice(split)),suffixIndices:f.P.slice(split)}:f,truth:P?{mapCorrect:x.a===aa&&x.b===bb,keyCorrect:K.filter((v,i)=>v===x.key[i]).length,prefixCorrect:P.slice(0,split).filter((v,i)=>v===x.p[i]).length,suffixCorrect:f.legal?P.slice(split).filter((v,i)=>v===f.P[split+i]).length:0}:null}})};
 }
 function region(lo,hi,split,cap){
 const target=gp.pages.slice(lo,hi).flatMap(p=>p.indices),n=target.length,controls=[];assert(target.slice(0,split).filter(v=>!v).length===cap,"target F count");
 for(const [name,a,b] of [["0_koan_1",13,2],["0_loss_of_divinity",28,5]]){
  const p=seqs.get(name);let plant=null;
  // Fixed workload selection: earliest native window with <=6 unavoidable zeros;
  // avoid introducing extra primer-dependent zeros. No language score used.
  for(let offset=0;offset+n<=p.length&&!plant;offset++){
   const P=p.slice(offset,offset+n),active=P.slice(0,split).filter(x=>x);
   let forced=split-active.length;for(let j=q;j<active.length;j++)if(!mod(active[j]+a*active[j-q]+b))forced++;
   if(forced>6)continue;
   const K=Array.from({length:q},(_,j)=>{const bad=mod(-active[j]);let k=rand(28);if(k>=bad)k++;return k});
   const C=encrypt(P,K,a,b);assert(C.slice(0,split).filter(v=>!v).length===forced,"zero count");plant={offset,P,K,C};
  }
  if(!plant){controls.push({name,status:"no eligible window"});continue}
  controls.push({offset:plant.offset,...solve(name,plant.C,split,plant.P,plant.K,a,b)});
 }
 return {lo,hi,split,controls,target:solve("original",target,split)};
 }
 return {q,trainLengths:train.map(p=>p.length),terminal:region(54,56,232,3)};
}
if(require.main===module){const fs=require("node:fs"),path=require("node:path"),lib=require("./lp2_fhold_cyclic_ngram_map.cjs");console.log(JSON.stringify(study(files.map(p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8")),lib),null,2));}
module.exports={study,files};
