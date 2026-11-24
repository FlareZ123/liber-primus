/** Soft-phase EM predictive period pilot. Run from repository root. */
const fs=require('node:fs');
function experiment(lp1,gold){
 const A=29,ix=new Map(gold.runes.map((r,i)=>[r,i])),extract=s=>Array.from(s).filter(x=>ix.has(x)).map(x=>ix.get(x)),sections=gold.sections.map(s=>extract(s.source_text)),mod=x=>(x+A)%A;
 function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
 function enc(p,key){let j=0;return p.map(x=>x===0?0:mod(x+key[j++%key.length]));}
 const w=extract(lp1.split("%").slice(1,3).join("%")),k=extract(lp1.split("$")[5]),wk=[23,10,1,10,9,10,16,26],kk=[0,10,4,0,1,19,0,18,4,18,9,0,18],eq=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 if(!eq(enc(sections[1],wk),w)||!eq(enc(sections[5],kk),k))throw Error("authentic mismatch "+sections.map(s=>s.length)+" "+w.length+" "+k.length);
 function freq(ex){let n=Array(A).fill(.5);sections.forEach((s,i)=>{if(!ex.includes(i))s.forEach(x=>n[x]++);});let t=n.reduce((a,b)=>a+b,0);return n.map(x=>x/t);}
 const pm=Array.from({length:A},(_,c)=>Array.from({length:A},(_,d)=>mod(c-d)));
 function emissions(pi,f,q){let e=new Float64Array(q*A);for(let j=0;j<q;j++)for(let c=0;c<A;c++){let v=0;for(let d=0;d<A;d++)if(d!==c)v+=pi[j*A+d]*f[pm[c][d]];e[j*A+c]=v;}return e;}
 function pass(C,e,f,q,initial,stats){
  let n=C.length,F=new Float64Array((n+1)*q),sc=new Float64Array(n),ll=0;if(initial)F.set(initial);else F[0]=1;
  for(let t=0;t<n;t++){let c=C[t],s=0,b=t*q,b1=b+q;for(let j=0;j<q;j++){let a=F[b+j];if(c===0)F[b1+j]+=a*f[0];F[b1+(j+1)%q]+=a*e[j*A+c];}for(let j=0;j<q;j++)s+=F[b1+j];if(!s)return {ll:-Infinity,end:null};sc[t]=s;ll+=Math.log(s);for(let j=0;j<q;j++)F[b1+j]/=s;}
  const end=F.slice(n*q);if(!stats)return {ll,end};
  let counts=new Float64Array(q*A),B=new Float64Array(q).fill(1),N=new Float64Array(q);
  for(let t=n-1;t>=0;t--){let c=C[t],s=sc[t];for(let j=0;j<q;j++){let a=e[j*A+c]*B[(j+1)%q];counts[j*A+c]+=F[t*q+j]*a/s;N[j]=(a+(c===0?f[0]*B[j]:0))/s;}[B,N]=[N,B];}
  return {ll,end,counts};
 }
 function fit(C,f,q,seed){
  let random=rng(seed),pi=new Float64Array(q*A);for(let j=0;j<q;j++){let s=0;for(let d=0;d<A;d++){let v=-Math.log(Math.max(1e-12,random()));pi[j*A+d]=v;s+=v;}for(let d=0;d<A;d++)pi[j*A+d]/=s;}
  for(let it=0;it<45;it++){
   const e=emissions(pi,f,q),z=pass(C,e,f,q,null,true),newpi=new Float64Array(q*A);
   for(let j=0;j<q;j++){let s=0;for(let d=0;d<A;d++){let n=0;for(let c=0;c<A;c++)if(c!==d&&e[j*A+c]>0)n+=z.counts[j*A+c]*f[pm[c][d]]/e[j*A+c];let v=pi[j*A+d]*n+.005;newpi[j*A+d]=v;s+=v;}for(let d=0;d<A;d++)newpi[j*A+d]/=s;}
   pi=newpi;
  }
  let e=emissions(pi,f,q),z=pass(C,e,f,q,null,false),key=Array.from({length:q},(_,j)=>{let b=0;for(let d=1;d<A;d++)if(pi[j*A+d]>pi[j*A+b])b=d;return b;});
  return {pi,key,conf:key.reduce((s,d,j)=>s+pi[j*A+d],0)/q,train:z.ll,end:z.end};
 }
 function primitive(key){for(let d=1;d<=key.length;d++)if(key.length%d===0&&key.every((x,i)=>x===key[i%d]))return d;}
 function test(name,C,f,trueKey,seed){
  const n=C.length,b=Math.floor(.65*n),v=Math.floor(.82*n),train=C.slice(0,b),valid=C.slice(b,v),hold=C.slice(v),rows=[];
  for(let q=2;q<=16;q++){
   let best=null;for(let s=0;s<3;s++){let x=fit(train,f,q,(seed+10007*q+7919*s)>>>0);if(!best||x.train>best.train)best=x;}
   let e=emissions(best.pi,f,q),va=pass(valid,e,f,q,best.end,false),ho=pass(hold,e,f,q,va.end,false),key=best.key,hard=new Float64Array(q*A);key.forEach((d,j)=>hard[j*A+d]=1);
   let he=emissions(hard,f,q),ht=pass(train,he,f,q,null,false),hv=ht.end?pass(valid,he,f,q,ht.end,false):{ll:-Infinity,end:null},hh=hv.end?pass(hold,he,f,q,hv.end,false):{ll:-Infinity};
   rows.push({q,primitive:primitive(key),key,conf:best.conf,train:best.train/b,validation:va.ll/valid.length,hold:ho.ll/hold.length,hardTrain:ht.ll/b,hardValidation:hv.ll/valid.length,hardHold:hh.ll/hold.length});
  }
  const uniform=new Float64Array(A).fill(1/A),base=pass(hold,emissions(uniform,f,1),f,1,null,false).ll/hold.length,rank=rows.slice().sort((a,b)=>b.validation-a.validation),win=rank[0];
  return {name,n,split:[b,v-b,n-v],truth:trueKey,baseline:base,winner:win,rows};
 }
 const r6=[10,2,10,4,10,4],r10=[18,5,18,8,18,5,18,8,18,2],pad=Array.from({length:390},rng(779531)).map(x=>Math.floor(x*A));
 return [{name:"WELCOME",C:w,ex:[1],key:wk},{name:"KOAN2",C:k,ex:[5],key:kk},{name:"fresh-repeat-6",C:enc(sections[3].slice(0,390),r6),ex:[3],key:r6},{name:"fresh-repeat-10",C:enc(sections[4].slice(0,500),r10),ex:[4],key:r10},{name:"fresh-uniform-pad",C:enc(sections[3].slice(390,780),pad),ex:[3],key:null}].map((c,i)=>test(c.name,c.C,freq(c.ex),c.key,981243+i*8713));
}
console.log(JSON.stringify(experiment(fs.readFileSync('resources/transcriptions/lp1_wulfic_canonical.txt','utf8'),JSON.parse(fs.readFileSync('resources/external/relikd-solved-gp29-native-v1.json','utf8'))),null,2));
