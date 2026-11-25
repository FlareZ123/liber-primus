"use strict";
/**
 * Plaintext-driven circular elimination. Unlike the ciphertext-driven route,
 * the next physical address is latent at ciphertext F and must be solved jointly.
 */
function experiment(raw,nativeRaw){
 const gp=JSON.parse(raw),gold=JSON.parse(nativeRaw),prime=gp.prime;
 const assert=(v,m)=>{if(!v)throw Error(m)},eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const mod=(x,n=29)=>(x%n+n)%n;
 const ix=new Map(gp.runes.map((r,i)=>[r,i])),extract=s=>[...s].filter(x=>ix.has(x)).map(x=>ix.get(x));
 const ps=[];for(let n=2;ps.length<19000;n++){let ok=true;for(const p of ps){if(p*p>n)break;if(n%p===0){ok=false;break}}if(ok)ps.push(n)}
 const keys=[{name:"p56",K:ps.map(p=>(p-1)%29),periodic:false},{name:"WELCOME",K:[23,10,1,10,9,10,16,26],periodic:true},{name:"KOAN",K:[0,10,4,0,1,19,0,18,4,18,9,0,18],periodic:true}];
 const advance=(key,k)=>key.periodic?(k+1)%key.K.length:k+1;
 const move=(pos,x,dir,n)=>mod(pos+(dir===1?prime[x]-1:-prime[x]),n);
 function pack(P,key,origin,dir){
  let remaining=Array.from(P.keys()),C=Array(P.length),pos=0,k=origin;
  for(const x of P){
   C[remaining[pos]]=x===0?0:mod(x+key.K[k]);
   if(x!==0)k=advance(key,k);
   remaining.splice(pos,1);if(remaining.length)pos=move(pos,x,dir,remaining.length);
  }return C;
 }
 const held=new Set(["0_welcome","jpg107-167","p56_an_end","p57_parable"]);
 const H=new Float64Array(31*31*29),T=new Float64Array(31*31);
 for(const s of gold.sections.filter(s=>!held.has(s.name))){let a=29,b=30;for(const x of extract(s.source_text)){let h=a*31+b;H[h*29+x]++;T[h]++;a=b;b=x}}
 const logs=Float64Array.from(H,(x,i)=>Math.log((x+.25)/(T[Math.floor(i/29)]+7.25)));
 const score=P=>{let a=29,b=30,s=0;for(const x of P){s+=logs[(a*31+b)*29+x];a=b;b=x}return s/P.length};
 // Explicit DFS with mutation/restoration of the remaining-address list.
 // Each frame holds the next choice at that address. All literal-F and
 // consuming-F alternatives are enumerated. The cap is a computational
 // scope boundary, never an infeasibility result.
 function solve(C,key,origin,dir,cap=200000){
  const rem=Array.from(C.keys()),P=[],stack=[];
  let nodes=0,maxPrefix=0,complete=0,top=null,capped=false;
  function frame(pos,k,a,b,s){
   const address=rem[pos],c=C[address],options=[];
   if(c===0)options.push([0,k]);
   const x=mod(c-key.K[k]);if(x!==0)options.push([x,advance(key,k)]);
   rem.splice(pos,1);
   return {pos,address,options,next:0,a,b,s};
  }
  stack.push(frame(0,origin,29,30,0));
  while(stack.length){
   const f=stack.at(-1);
   // Return from a selected branch before selecting the next one.
   if(P.length===stack.length)P.pop();
   if(f.next>=f.options.length){rem.splice(f.pos,0,f.address);stack.pop();continue}
   if(++nodes>cap){capped=true;break}
   const [x,k]=f.options[f.next++];P.push(x);
   const s=f.s+logs[(f.a*31+f.b)*29+x];maxPrefix=Math.max(maxPrefix,P.length);
   if(!rem.length){complete++;if(!top||s>top.total)top={total:s,score:s/C.length,P:P.slice()};continue}
   stack.push(frame(move(f.pos,x,dir,rem.length),k,f.b,x,s));
  }
  if(top)assert(eq(pack(top.P,key,origin,dir),C),"complete branch replay");
  return {nodes,maxPrefix,complete,capped,top};
 }
 const solved=Object.fromEntries(gold.sections.map(s=>[s.name,extract(s.source_text)]));
 const controls=[];
 for(const [name,k,o,d] of [["0_welcome",0,117,1],["jpg107-167",0,219,-1],["p57_parable",1,3,1],["p56_an_end",2,7,-1]]){
  const P=solved[name],C=pack(P,keys[k],o,d),r=solve(C,keys[k],o,d,1000000);
  assert(r.complete>0,"true native control path lost");
  controls.push({name,key:keys[k].name,origin:o,dir:d,length:P.length,truthScore:score(P),nodes:r.nodes,complete:r.complete,capped:r.capped,topScore:r.top.score,recovered:r.top.P.filter((x,i)=>x===P[i]).length});
 }
 const bounds=[0,3,8,15,23,27,33,40,54,56],rows=[];
 for(let ch=0;ch<9;ch++){
  const start=bounds[ch],end=bounds[ch+1],C=gp.pages.filter(p=>p.page>=start&&p.page<end).flatMap(p=>p.indices);
  for(const dir of [1,-1])for(const key of keys){
   const origins=key.periodic?key.K.length:(ch===8?3302:1);
   let nodes=0,full=0,complete=0,capped=0,maxPrefix=0,best=null,origin0=null;
   for(let origin=0;origin<origins;origin++){
    const r=solve(C,key,origin,dir,200000);nodes+=r.nodes;full+=Number(r.complete>0);complete+=r.complete;capped+=Number(r.capped);maxPrefix=Math.max(maxPrefix,r.maxPrefix);
    if(origin===0)origin0={prefix:r.maxPrefix,complete:r.complete,capped:r.capped};
    if(r.top&&(!best||r.top.score>best.score))best={origin,score:r.top.score,indices:r.top.P,prefix:r.top.P.slice(0,80).map(x=>gp.translit[x]).join(""),complete:r.complete};
   }
   rows.push({chapter:start+"-"+(end-1),length:C.length,dir,key:key.name,origins,nodes,full,complete,capped,maxPrefix,origin0,best});
  }
 }
 return {description:"plaintext rune GP prime chooses next remaining address; all latent F choices change both address and clock",controls,rows};
}
if(typeof module!=="undefined"&&require.main===module){const fs=require("node:fs"),path=require("node:path"),r=p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8");console.log(JSON.stringify(experiment(r("resources/liber-primus/lp2-corpus.json"),r("resources/external/relikd-solved-gp29-native-v1.json")),null,2));}
