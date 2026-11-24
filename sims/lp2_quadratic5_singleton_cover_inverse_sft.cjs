'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt"];
const experiment=function experiment(raw){
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
 function row(c,i){let x=c.slice(i-5,i).reverse(),a=[c[i],...x];for(let j=0;j<5;j++)for(let k=j;k<5;k++)a.push(mod(x[j]*x[k]));return [...a,1]}
 function encrypt(P,K,iv){let c=iv.slice(),u=inv(K[0]);for(let p of P){c.push(0);let i=c.length-1,v=dot(K,row(c,i));c[i]=mod((p-v)*u)}return c.slice(5)}
 const decode=(c,K)=>Array.from({length:c.length-5},(_,i)=>dot(K,row(c,i+5)));
 function spans(ws){let i=0;return ws.map(w=>{let a=i;i+=w.length;return[a,i]})}
 const singles=(ws,cut)=>spans(ws).filter(([a,b])=>a>=5&&b<=cut&&b-a===1).map(([a])=>a);
 const ioc=a=>{let h=new Uint32Array(q);for(let x of a)h[x]++;return h.reduce((s,x)=>s+x*(x-1),0)/(a.length*(a.length-1))};
 const stats=a=>({n:a.length,ioc:ioc(a),mean:a.reduce((s,x,i)=>s+(i?log2[a[i-1]][x]:log1[x]),0)/a.length});
 function bases(X){
  assert(X.length===68,"68 singleton constraints");
  for(let attempt=0;attempt<100;attempt++){
   let ids=Array.from({length:X.length},(_,i)=>i);for(let i=ids.length-1;i>0;i--){let j=random()%(i+1);[ids[i],ids[j]]=[ids[j],ids[i]]}
   let G=Array.from({length:6},(_,j)=>ids.filter((_,i)=>i%6===j)),B=[];
   for(let j=0;j<6;j++)for(let k=j+1;k<6;k++){
    let subset=[...G[j],...G[k]],chosen=[];
    for(let i of subset)if(rref([...chosen,i].map(x=>X[x]),D).rank>chosen.length){chosen.push(i);if(chosen.length===D)break}
    if(chosen.length===D)B.push(chosen)
   }
   if(B.length===15)return{groups:G,bases:B,attempts:attempt+1};
  }
  throw Error("could not construct covering basis family")
 }
 function half(R,from){
  const n=R.length,m=1<<11,t=new Uint8Array(m*n);
  for(let z=1;z<m;z++){let bit=z&-z,j=31-Math.clz32(bit),p=(z-bit)*n,i=z*n;for(let k=0;k<n;k++){let a=t[p+k]+R[k][from+j];t[i+k]=a>=q?a-q:a}}
  return t
 }
 function fit(c,ws,cut){
  let ix=singles(ws,cut);assert(ix.length===68,"singleton count");let X=ix.map(i=>row(c,i)),cover=bases(X),found=new Map(),detail=[];
  for(let B of cover.bases){
   const I=inverse(B.map(i=>X[i])),bset=new Set(B),extra=Array.from({length:68},(_,i)=>i).filter(i=>!bset.has(i));
   const R=extra.map(i=>Array.from({length:D},(_,j)=>mod(X[i].reduce((s,x,k)=>s+x*I[k][j],0)))),n=R.length,L=half(R,0),H=half(R,11);
   let pass=0,nonconstant=0;
   for(let l=0;l<2048;l++)for(let h=0;h<2048;h++){
    // Complement of every bit vector gives 1-P; enforce first basis value 0.
    if(l&1)continue;
    let bad=0,lo=l*n,hi=h*n;for(let j=0;j<n;j++){let x=L[lo+j]+H[hi+j];if(x>=q)x-=q;if(x>1&&++bad>4)break}
    if(bad>4)continue;pass++;
    let v=Array.from({length:D},(_,j)=>j<11?(l>>j)&1:(h>>(j-11))&1),K=I.map(a=>dot(a,v));if(!K[0])continue;nonconstant++;
    let alt=K.map((x,j)=>mod((j===D-1?1:0)-x));let s=K.join(","),t=alt.join(",");if(t<s){K=alt;s=t}
    assert(X.filter(a=>dot(K,a)>1).length<=4,"candidate check");
    found.set(s,K)
   }
   detail.push({basis:B.map(i=>ix[i]),enumerated:2**21,passes:pass,nonconstant})
  }
  const info={cut,trainSingletons:ix.length,basisGroups:cover.groups.map(g=>g.map(i=>ix[i])),partitionAttempts:cover.attempts,enumerated:15*2**21,bases:detail,normalizedCandidates:found.size};
  if(!found.size)return{...info,status:"no nonconstant invertible key"};
  let best=null;
  for(let K of found.values()){
   let p=decode(c.slice(0,cut),K),h=Array.from({length:q},()=>Array(q).fill(0));for(let i=1;i<p.length;i++)h[p[i-1]][p[i]]++;
   for(let a=1;a<q;a++)for(let b=0;b<q;b++){let s=log1[mod(a*p[0]+b)];for(let j=0;j<q;j++)for(let k=0;k<q;k++)if(h[j][k])s+=h[j][k]*log2[mod(a*j+b)][mod(a*k+b)];if(!best||s>best.score)best={score:s,K:K.map((x,j)=>mod(a*x+(j===D-1?b:0))),a,b}}
  }
  const P=decode(c,best.K),train=P.slice(0,cut-5),hold=P.slice(cut-5);
  assert(encrypt(P,best.K,c.slice(0,5)).join(",")===c.slice(5).join(","),"exact replay");
  return{...info,status:"candidate",K:best.K,train:stats(train),holdout:stats(hold),holdoutPreview:hold.slice(0,100).map(i=>C.translit[i]).join(" "),singletonTypes:ix.reduce((m,i)=>{let x=C.translit[P[i-5]];m[x]=(m[x]||0)+1;return m},{}),P}
 }
 const cut=C.pages.filter(p=>p.page<=39).reduce((s,p)=>s+p.indices.length,0);assert(cut===9640,"chapter boundary");const original=fit(O,ow,cut);
 const plant=[];
 // Genuine contiguous prose in the second half, with first 68 eligible singleton sites.
 let start=Math.floor(gw.length/2),n=0,count=0,end=start;
 for(;end<gw.length;end++){let w=gw[end];if(w.length===1&&n>=5)count++;n+=w.length;if(count===68){end++;break}}
 assert(count===68,"plant word window");const G=gw.slice(start,end),H=gw.slice(end,end+500);
 // Second positive has exact original training word lengths and exactly four
 // deliberately non-A/I singleton values drawn from source-native T/O register.
 const pool=Array.from({length:15},()=>[]);for(let w of gw.slice(start))if(w.length<15)pool[w.length].push(w);
 let si=0;const S=ow.filter((w,i)=>spans(ow)[i][1]<=cut).map(w=>{if(w.length===1){let k=si++;return [k<4?16:k%3?24:10]}let p=pool[w.length];assert(p.length,"length pool "+w.length);return p[random()%p.length]});
 for(let [name,ws,holdWords] of [["genuine Gibran contiguous",G,H],["original length profile, four exceptional singleton T symbols",S,native]]){
  let p=ws.concat(holdWords).flat(),cut=ws.flat().length,K=Array.from({length:D},()=>random()%q);if(!K[0])K[0]=1;let iv=Array.from({length:5},()=>random()%q),c=encrypt(p,K,iv),f=fit(c,ws.concat(holdWords),cut);
  let exact=f.P?f.P.filter((x,i)=>x===p[i+5]).length:0;let holdExact=f.P?f.P.slice(cut-5).filter((x,i)=>x===p[cut+i]).length:0;delete f.P;plant.push({name,trueKey:K,iv,exact,expected:p.length-5,holdExact,holdExpected:p.length-cut,...f})
 }
 delete original.P;return{model:"current rune plus full quadratic in five previous ciphertext runes, affine offset",sourceCounts:{runes:O.length,words:ow.length,train:cut,holdout:O.length-cut,singletons:singles(ow,O.length).length},original,plant};
};
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8'))),null,2));
