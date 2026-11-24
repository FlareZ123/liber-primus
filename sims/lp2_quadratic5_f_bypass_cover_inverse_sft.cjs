'use strict';
const fs=require('node:fs'),path=require('node:path');
const files=["resources/liber-primus/lp2-corpus.json","resources/lp2-transcription.txt","resources/external/relikd-solved-gp29-native-v1.json","resources/control/gibran_prophet_58585.txt"];
const experiment=function experiment(raw,mode){
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

 const M=57,E=4;
 const encode=(P,K,iv)=>{let h=iv.slice(),u=inv(K[0]),c=[],mask=[];for(let p of P){if(!p){c.push(0);mask.push(1);continue}let y=mod((p-dot(K,row(h.concat(0),5)))*u);c.push(y);mask.push(0);h=h.slice(1).concat(y)}return{c,mask}};
 function spans(ws){let i=0;return ws.map(w=>{let a=i;i+=w.length;return[a,i]})}
 const safe=(c,i)=>i>=5&&c.slice(i-5,i+1).every(x=>x!==0);
 const sites=(c,ws,cut)=>spans(ws).filter(([a,b])=>b<=cut&&b-a===1&&safe(c,a)).map(([a])=>a);
 function bases(X){
  assert(X.length===M,"57 singleton constraints");
  for(let attempt=0;attempt<100;attempt++){
   let ids=Array.from({length:X.length},(_,i)=>i);for(let i=ids.length-1;i>0;i--){let j=random()%(i+1);[ids[i],ids[j]]=[ids[j],ids[i]]}
   let G=Array.from({length:7},(_,j)=>ids.filter((_,i)=>i%7===j)),B=[];
   for(let j=0;j<7;j++)for(let k=j+1;k<7;k++)for(let l=k+1;l<7;l++){
    let subset=[...G[j],...G[k],...G[l]],chosen=[];
    for(let i of subset)if(rref([...chosen,i].map(x=>X[x]),D).rank>chosen.length){chosen.push(i);if(chosen.length===D)break}
    if(chosen.length===D)B.push(chosen)
   }
   if(B.length===35)return{groups:G,bases:B,attempts:attempt+1};
  }
  throw Error("could not construct covering basis family")
 }
 function half(R,from){
  const n=R.length,m=1<<11,t=new Uint8Array(m*n);
  for(let z=1;z<m;z++){let bit=z&-z,j=31-Math.clz32(bit),p=(z-bit)*n,i=z*n;for(let k=0;k<n;k++){let a=t[p+k]+R[k][from+j];t[i+k]=a>=q?a-q:a}}
  return t
 }
 function fit(c,ws,cut){
  let ix=sites(c,ws,cut);assert(ix.length===M,"singleton count "+ix.length);let X=ix.map(i=>row(c,i)),cover=bases(X),found=new Map(),detail=[];
  for(let B of cover.bases){
   const I=inverse(B.map(i=>X[i])),bset=new Set(B),extra=Array.from({length:M},(_,i)=>i).filter(i=>!bset.has(i));
   const R=extra.map(i=>Array.from({length:D},(_,j)=>mod(X[i].reduce((s,x,k)=>s+x*I[k][j],0)))),n=R.length,L=half(R,0),H=half(R,11);
   let pass=0,nonconstant=0;
   for(let l=0;l<2048;l+=2)for(let h=0;h<2048;h++){
    let bad=0,lo=l*n,hi=h*n;for(let j=0;j<n;j++){let x=L[lo+j]+H[hi+j];if(x>=q)x-=q;if(x>1&&++bad>E)break}
    if(bad>E)continue;pass++;
    let v=Array.from({length:D},(_,j)=>j<11?(l>>j)&1:(h>>(j-11))&1),K=I.map(a=>dot(a,v));if(!K[0])continue;nonconstant++;
    let alt=K.map((x,j)=>mod((j===D-1?1:0)-x));let s=K.join(","),t=alt.join(",");if(t<s){K=alt;s=t}
    assert(X.filter(a=>dot(K,a)>1).length<=E,"candidate check");found.set(s,K)
   }
   detail.push({basis:B.map(i=>ix[i]),enumerated:2**21,passes:pass,nonconstant})
  }
  const info={cut,trainingSingletons:ix.length,basisGroups:cover.groups.map(g=>g.map(i=>ix[i])),partitionAttempts:cover.attempts,enumerated:35*2**21,bases:detail,normalizedCandidates:found.size};
  if(!found.size)return{...info,status:"no invertible key"};
  // Every safe position is a non-F plaintext emission, independent of every F interpretation.
  let best=null;
  for(let K of found.values()){
   let p=Array.from({length:cut},(_,i)=>safe(c,i)?dot(K,row(c,i)):-1);
   for(let a=1;a<q;a++)for(let b=0;b<q;b++){
    let s=0,prev=-1,valid=true;
    for(let x of p){if(x<0){prev=-1;continue}let y=mod(a*x+b);if(!y){valid=false;break}s+=prev<0?log1[y]:log2[prev][y];prev=y}
    if(valid&&(!best||s>best.score))best={score:s,K:K.map((x,j)=>mod(a*x+(j===D-1?b:0)))}
   }
  }
  return{...info,status:best?"candidate":"all output affines violate literal F",K:best?.K}
 }
 // Exact Viterbi over finite histories with all F interpretations. At printed word boundaries,
 // a fixed independent vocabulary bonus resolves ambiguous literal and enciphered F paths.
 const dict=new Map();for(let w of gw.slice(0,Math.floor(gw.length/2))){let id=w.join(",");dict.set(id,(dict.get(id)||0)+1)}
 function decode(c,ws,K,start){
  // start follows five consecutive non-F original ciphertext runes; preceding state known.
  let h=c.slice(start-5,start),states=[{h,last:-1,score:0,node:null}],width=0,offset=0;
  const wordSpans=spans(ws).filter(([a,b])=>b>start);
  for(let [a,b] of wordSpans){
   a=Math.max(a,start);assert(a===start+offset,"word alignment");let next=new Map();
   for(let state of states){
    let walk=[{h:state.h,last:state.last,score:state.score,p:[],mask:[]}];
    for(let i=a;i<b;i++){
     let t=[];for(let s of walk){
      const extend=(p,skip)=>t.push({h:skip?s.h:s.h.slice(1).concat(c[i]),last:p,score:s.score+(s.last<0?log1[p]:log2[s.last][p]),p:s.p.concat(p),mask:s.mask.concat(skip?1:0)});
      if(c[i]===0)extend(0,true);let v=dot(K,row(s.h.concat(c[i]),5));if(v!==0)extend(v,false)
     }walk=t;
    }
    for(let s of walk){
     let score=s.score+((a===start&&a!==wordSpans[0][0])?0:dict.has(s.p.join(","))?4+Math.log1p(dict.get(s.p.join(","))):0),id=s.h.join(",")+":"+s.last,prev=next.get(id);
     if(!prev||score>prev.score)next.set(id,{h:s.h,last:s.last,score,node:{p:s.p,mask:s.mask,prev:state.node}})
    }
   }
   states=[...next.values()];width=Math.max(width,states.length);offset+=b-a;if(!states.length)return{status:"no legal literal-F path",offset:start+offset,width};
  }
  let win=states.reduce((a,b)=>a.score>b.score?a:b),parts=[];for(let n=win.node;n;n=n.prev)parts.push(n);
  parts.reverse();let p=parts.flatMap(x=>x.p),mask=parts.flatMap(x=>x.mask),re=encode(p,K,c.slice(start-5,start));
  assert(re.c.join(",")===c.slice(start).join(",")&&re.mask.join(",")===mask.join(","),"exact F replay");
  return{status:"decoded",P:p,mask,width,start,score:win.score}
 }
 const cut=C.pages.filter(p=>p.page<=39).reduce((s,p)=>s+p.indices.length,0);assert(cut===9640,"original chapter boundary");
 if(mode==="original")return{model:"quadratic five-back consumed-ciphertext feedback, literal F bypass",original:fit(O,ow,cut),source:{runes:O.length,words:ow.length,holdout:O.length-cut}};
 const start=Math.floor(gw.length/2),words=gw.slice(start),P=words.flat();
 let K=Array.from({length:D},()=>random()%q);if(!K[0])K[0]=1;let iv=Array.from({length:5},()=>random()%q),enc=encode(P,K,iv),c=enc.c,ss=sites(c,words,c.length);assert(ss.length>=M,"positive insufficient safe singletons "+ss.length);const stop=ss[M-1]+1;
 let fitResult=fit(c,words,stop),s=5;while(!c.slice(s-5,s).every(x=>x!==0))s++;
 let result=fitResult.K?decode(c,words,fitResult.K,s):{status:"no key"};
 const split=stop-s,exact=result.P?result.P.filter((x,i)=>x===P[i+s]).length:0,holdExact=result.P?result.P.slice(split).filter((x,i)=>x===P[i+stop]).length:0,maskExact=result.mask?result.mask.filter((x,i)=>x===enc.mask[i+s]).length:0;
 const exc=ss.slice(0,M).filter(i=>![10,24].includes(P[i])).length;
 delete result.P;delete result.mask;
 return{model:"quadratic five-back consumed-ciphertext feedback, literal F bypass",plant:{trueKey:K,iv,training:stop,withheld:P.length-stop,exceptionsOutsideAI:exc,fit:fitResult,decoded:result,exact,expected:P.length-s,holdExact,holdExpected:P.length-stop,maskExact}}
};
console.log(JSON.stringify(experiment(files.map(f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8')),process.argv[2]||"original"),null,2));
