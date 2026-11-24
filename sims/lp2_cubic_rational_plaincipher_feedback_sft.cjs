'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt"];
const experiment=function experiment(raw,mode,lo,hi){
 const C=JSON.parse(raw[0]),N=JSON.parse(raw[2]),q=29,D=22,mod=x=>(x%q+q)%q,assert=(v,m)=>{if(!v)throw Error(m)};
 const inv=x=>{for(let k=1;k<q;k++)if(mod(k*x)===1)return k;throw Error("singular")},dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
 const rref=(rows,n)=>{let A=rows.map(a=>a.slice()),p=0;for(let j=0;j<n;j++){let k=A.findIndex((a,i)=>i>=p&&a[j]);if(k<0)continue;[A[p],A[k]]=[A[k],A[p]];A[p]=A[p].map(x=>mod(x*inv(A[p][j])));for(let i=0;i<A.length;i++)if(i!==p){let v=A[i][j];if(v)A[i]=A[i].map((x,l)=>mod(x-v*A[p][l]))}p++}return{A,rank:p}};
 const inverse=M=>{let r=rref(M.map((a,i)=>[...a,...Array.from({length:D},(_,j)=>+(i===j))]),D);assert(r.rank===D,"singular basis");return r.A.map(a=>a.slice(D))};
 const parse=t=>t.split(new RegExp("[^"+C.runes.join("")+"]+","u")).filter(Boolean).map(w=>[...w].map(x=>C.runes.indexOf(x)));
 const toks=C.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
 const gp=t=>(t.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S").match(/[A-Z]+(?:['’][A-Z]+)*/g)||[]).map(w=>{w=w.replace(/['’]/g,"");let a=[];for(let i=0;i<w.length;){if(w.startsWith("ING",i)){a.push(21);i+=3}else if(w.startsWith("IO",i)){a.push(27);i+=2}else{let t=toks.find(x=>w.startsWith(x.s,i));assert(t,"unmapped");a.push(t.i);i+=t.s.length}}return a});
 const ow=parse(raw[1].split("%").slice(0,55).join("").replace(/[/\r\n]/g,"")),O=ow.flat(),native=N.sections.flatMap(s=>parse(s.source_text)),gw=gp(raw[3]);assert(ow.length===2896&&O.length===12956&&O.join(",")===C.pages.filter(p=>p.page<56).flatMap(p=>p.indices).join(","),"original source");
 const model=gw.slice(0,Math.floor(gw.length/2)).flat(),hist1=Array(q).fill(.5),hist2=Array.from({length:q},()=>Array(q).fill(.5));
 for(let i=0;i<model.length;i++){hist1[model[i]]++;if(i)hist2[model[i-1]][model[i]]++}
 const log1=hist1.map(x=>Math.log(x/(model.length+q*.5))),log2=hist2.map(a=>{let s=a.reduce((x,y)=>x+y,0);return a.map(x=>Math.log(x/s))});
 let rng=0x33010539;function random(){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng}

 const E=4;
 function spans(ws){let i=0;return ws.map(w=>{let a=i;i+=w.length;return[a,i]})}
 const singles=(ws,cut)=>spans(ws).filter(([a,b])=>a>=3&&b<=cut&&b-a===1).map(([a])=>a);
 const den=id=>[id%29,Math.floor(id/29)%29,Math.floor(id/841)%29];
 function context(c,A,n){let [a,b,d]=A,k=d?3:b?2:a?1:0,F=new Uint8Array(n+3),h=new Uint8Array(n+3),g=new Uint8Array(n+3);
  for(let i=3;i<n+3;i++){F[i]=(c[i-3]+a*F[i-1]+b*F[i-2]+d*F[i-3])%29;h[i]=((i===3?1:0)+a*h[i-1]+b*h[i-2]+d*h[i-3])%29;g[i]=(g[i-1]+h[i])%29}
  return{F,h,g,k}
 }
 const row=(ctx,i)=>{let{F,h,g,k}=ctx,j=i+3,v=[F[j],F[j-1],F[j-2],F[j-3],g[j]];for(let l=0;l<k;l++)v.push(h[j-l]);return v};
 function echelon(rows,n){let A=rows.map(v=>v.slice()),p=0,cols=[];
  for(let j=0;j<n;j++){let k=p;while(k<A.length&&!A[k][j])k++;if(k===A.length)continue;[A[p],A[k]]=[A[k],A[p]];let u=inv(A[p][j]);for(let l=j;l<A[p].length;l++)A[p][l]=A[p][l]*u%29;
   for(let i=0;i<A.length;i++)if(i!==p){let v=A[i][j];if(v)for(let l=j;l<A[i].length;l++)A[i][l]=mod(A[i][l]-v*A[p][l])}
   cols.push(j);p++;if(p===A.length)break}
  return{A,rank:p,cols}
 }
 function inverseN(M){let n=M.length,r=echelon(M.map((a,i)=>a.concat(Array.from({length:n},(_,j)=>+(i===j)))),n);assert(r.rank===n,"singular basis");return r.A.map(a=>a.slice(n))}
 function cover(X,p,seed){
  let rng=seed>>>0;function next(){rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng}
  for(let attempt=0;attempt<10;attempt++){
   let pool=Array.from({length:X.length},(_,i)=>i),B=[];
   for(let i=pool.length-1;i>0;i--){let j=next()%(i+1);[pool[i],pool[j]]=[pool[j],pool[i]]}
   for(let g=0;g<5;g++){
    let chosen=[];for(let i of pool){if(echelon(chosen.concat(i).map(j=>X[j]),p).rank>chosen.length){chosen.push(i);if(chosen.length===p)break}}
    if(chosen.length!==p)break;B.push(chosen);let seen=new Set(chosen);pool=pool.filter(i=>!seen.has(i))
   }
   if(B.length===5)return B;
  }
  return null
 }
 function fitOne(c,ix,id){
  const A=den(id),ctx=context(c,A,ix.at(-1)+1),X=ix.map(i=>row(ctx,i)),D=X[0].length,full=echelon(X,D),p=full.rank,cols=full.cols;
  let e0=[1,...Array(D-1).fill(0)],identifiable=echelon(X.concat([e0]),D).rank===p;
  if(!identifiable)return{status:"unidentified b0",rank:p,D};
  const Z=X.map(x=>cols.map(j=>x[j])),B=cover(Z,p,id+3301);if(!B)return{status:"no disjoint basis cover",rank:p,D};
  assert(cols[0]===0,"b0 pivot");let candidates=new Map(),counts=[0,0],n=X.length;
  for(let S of B){let I=inverseN(S.map(i=>Z[i])),set=new Set(S),extra=Array.from({length:n},(_,i)=>i).filter(i=>!set.has(i));
   let R=extra.map(i=>Array.from({length:p},(_,j)=>mod(Z[i].reduce((s,x,k)=>s+x*I[k][j],0)))),m=R.length,V=new Uint8Array((1<<p)*m);
   for(let z=1;z<(1<<p);z++){let bit=z&-z,k=31-Math.clz32(bit),a=(z-bit)*m,b=z*m;for(let j=0;j<m;j++){let u=V[a+j]+R[j][k];V[b+j]=u>=29?u-29:u}}
   for(let z=0;z<(1<<p);z+=2){counts[0]++;let bad=0;for(let j=0;j<m;j++)if(V[z*m+j]>1&&++bad>E)break;if(bad>E)continue;let v=Array.from({length:p},(_,j)=>(z>>j)&1),u=I.map(x=>dot(x,v));if(!u[0])continue;counts[1]++;let K=Array(D).fill(0);for(let j=0;j<p;j++)K[cols[j]]=u[j];
    let sig=X.map(x=>dot(x,K)),key=sig.join(","),com=sig.map(x=>mod(1-x)).join(",");if(com<key)key=com;
    if(!candidates.has(key))candidates.set(key,{id,A,K,rank:p,D})
   }
  }
  return{status:"covered",rank:p,D,counts,candidates:[...candidates.values()]}
 }
 function emit(c,A,K){const ctx=context(c,A,c.length);return Array.from({length:c.length},(_,i)=>dot(K,row(ctx,i)))}
 function encode(P,A,K){let [a,b,d]=A,c=[],k=K.length-5,u=inv(K[0]);for(let i=0;i<P.length;i++){let v=K[4]+(i<k?K[5+i]:0)+a*(P[i-1]||0)+b*(P[i-2]||0)+d*(P[i-3]||0)+K[1]*(c[i-1]||0)+K[2]*(c[i-2]||0)+K[3]*(c[i-3]||0);c.push(mod((P[i]-v)*u))}return c}
 function stats(p){let h=Array(29).fill(0),s=0;for(let i=0;i<p.length;i++){h[p[i]]++;s+=i?log2[p[i-1]][p[i]]:log1[p[i]]}return{n:p.length,ioc:h.reduce((s,x)=>s+x*(x-1),0)/(p.length*(p.length-1)),mean:s/p.length}}
 function label(c,cut,candidates){let best=null;for(let v of candidates){if(v.rank!==v.D)continue;let p=emit(c.slice(0,cut),v.A,v.K),h=Array.from({length:29},()=>Array(29).fill(0));for(let i=1;i<p.length;i++)h[p[i-1]][p[i]]++;
  for(let a=1;a<29;a++)for(let b=0;b<29;b++){let score=log1[mod(a*p[0]+b)];for(let j=0;j<29;j++)for(let k=0;k<29;k++)if(h[j][k])score+=h[j][k]*log2[mod(a*j+b)][mod(a*k+b)];if(!best||score>best.score)best={...v,score,scale:a,shift:b}}
 }if(!best)return null;
 let p=emit(c,best.A,best.K).map(x=>mod(best.scale*x+best.shift)),sum=best.A.reduce((s,x)=>s+x,0),K=best.K.map(x=>mod(best.scale*x));K[4]=mod(K[4]+best.shift*(1-sum));
 for(let j=0;j<K.length-5;j++)K[5+j]=mod(best.scale*best.K[5+j]+best.shift*best.A.slice(j).reduce((s,x)=>s+x,0));
 assert(encode(p,best.A,K).join(",")===c.join(","),"exact forward replay");
 return{...best,K,P:p,train:stats(p.slice(0,cut)),heldout:stats(p.slice(cut))}
 }
 function run(c,ws,cut,lo,hi){let ix=singles(ws,cut);assert(ix.length===68,"68 singleton sites got "+ix.length);let candidates=[],unresolved=[],rankCounts={},tested=0,enumerated=0,nonconstant=0;
  for(let id=lo;id<hi;id++){let f=fitOne(c,ix,id);tested++;let k=f.rank+"/"+f.D;rankCounts[k]=(rankCounts[k]||0)+1;if(f.status!=="covered"){unresolved.push({id,...f});continue}enumerated+=f.counts[0];nonconstant+=f.counts[1];candidates.push(...f.candidates)}
  return{range:[lo,hi],cut,tested,enumerated,rankCounts,nonconstant,candidates,unresolved}
 }
 const cut=C.pages.filter(p=>p.page<=39).reduce((s,p)=>s+p.indices.length,0);assert(cut===9640,"original boundary");
 if(mode==="original"){let res=run(O,ow,cut,lo,hi);let best=label(O,cut,res.candidates);if(best){delete best.P;res.best=best}return res}
 let start=Math.floor(gw.length/2),n=0,count=0,end=start;for(;end<gw.length;end++){let w=gw[end];if(w.length===1&&n>=3)count++;n+=w.length;if(count===68){end++;break}}
 let words=gw.slice(start,end+500),P=words.flat(),A=[5,11,7],K=[13,2,17,9,18,7,22,15],c=encode(P,A,K),stop=n;
 let res=run(c,words,stop,lo,hi),best=label(c,stop,res.candidates);
 if(best){best.exact=best.P.filter((x,i)=>x===P[i]).length;best.holdExact=best.P.slice(stop).filter((x,i)=>x===P[stop+i]).length;delete best.P}
 return{...res,plant:{trueA:A,trueK:K,expected:P.length,holdExpected:P.length-stop,best}}
};
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8')),process.argv[2]||"original",Number(process.argv[3]||0),Number(process.argv[4]||24389)),null,2));
