"use strict";
const fs=require("node:fs");
const path=require("node:path");
function experiment(corpus, lp1, g, s) {
 const N=27,M=29,L=N*N;
 const mod=x=>((x%M)+M)%M;
 const inv=x=>{for(let a=1;a<M;a++)if(mod(x*a)===1)return a;throw Error("nonunit")};
 const alphabet=corpus.translit;
 const enc=text=>{
  let a=[];
  for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){
   w=w.replaceAll("QU","CW").replaceAll("Q","C").replaceAll("K","C").replaceAll("V","U").replaceAll("Z","S");
   while(w.length){let token=["ING","TH","EO","NG","OE","AE","IA","EA","IO"].find(t=>w.startsWith(t))||w[0];
    const normalized=token==="ING"?"NG":token==="IO"?"IA":token;
    const n=alphabet.indexOf(normalized);if(n>=0)a.push(n);w=w.slice(token.length);
   }
  }return a;
 };
 const I=()=>Array.from({length:N},(_,i)=>Array.from({length:N},(_,j)=>+(i===j)));
 const inverse=A=>{const eye=I(),B=A.map((row,i)=>row.concat(eye[i]));for(let c=0;c<N;c++){
  const k=B.findIndex((row,i)=>i>=c&&row[c]!==0);if(k<0)return null;
  [B[c],B[k]]=[B[k],B[c]];let a=inv(B[c][c]);for(let j=0;j<2*N;j++)B[c][j]=mod(B[c][j]*a);
  for(let i=0;i<N;i++)if(i!==c){const b=B[i][c];if(b)for(let j=0;j<2*N;j++)B[i][j]=mod(B[i][j]-b*B[c][j]);}
 }return B.map(r=>r.slice(N))};
 const make=(t,wrap)=>Array.from({length:N},(_,i)=>Array.from({length:N},(_,j)=>i===j?t:Math.abs(i-j)===1||(wrap&&Math.abs(i-j)===N-1)?1:0));
 const operators=wrap=>{let out=[{name:"I",mat:I(),undo:I()}],singular=[];for(let t=0;t<M;t++){let A=make(t,wrap),B=inverse(A);if(!B){singular.push(t);continue}out.push({name:`L${t}`,mat:A,undo:B},{name:`L${t}^-1`,mat:B,undo:A})}const seen=new Set;return {ops:out.filter(x=>{const k=x.mat.flat().join(",");if(seen.has(k))return false;seen.add(k);return true}),singular}};
 const left=(A,C)=>{let out=new Int32Array(L);for(let i=0;i<N;i++)for(let k=0;k<N;k++){let a=A[i][k];if(a)for(let j=0;j<N;j++)out[i*N+j]+=a*C[k*N+j]}return out.map(x=>x%M)};
 const right=(A,C)=>{let out=new Int32Array(L);for(let i=0;i<N;i++)for(let j=0;j<N;j++){let n=0;for(let k=0;k<N;k++)n+=C[i*N+k]*A[j][k];out[i*N+j]=n%M}return out};
 const histogram=x=>{const h=new Int32Array(M);for(let q of x)h[q]++;return h};
 const ioc=h=>h.reduce((z,n)=>z+n*(n-1),0)/(L*(L-1));
 const train=enc(g), test=enc(s);
 let count=histogram(train), logp=Array.from(count,n=>Math.log((n+1)/(train.length+M)));
 let big=Array.from({length:M},()=>new Int32Array(M));for(let i=1;i<train.length;i++)big[train[i-1]][train[i]]++;
 let logb=big.map(row=>{const n=row.reduce((a,b)=>a+b,0);return Array.from(row,x=>Math.log((x+0.5)/(n+0.5*M)))});
 const uni=h=>h.reduce((sum,n,i)=>sum+n*logp[i],0)/L;
 const bigram=x=>x.slice(1).reduce((sum,n,i)=>sum+logb[x[i]][n],0)/(L-1);
 const maps=[];for(let a=1;a<M;a++)for(let b=0;b<M;b++)maps.push({a,b,row:Array.from({length:M},(_,k)=>logp[mod(a*k+b)])});
 const transform=(x,a,b)=>Array.from(x,n=>mod(a*n+b));
 const source=corpus.pages.slice(0,3).flatMap(p=>p.indices);
 if(source.length!==L)throw Error("source length");
 const controls=[];for(let i=0;i+L<=test.length;i+=L){let p=test.slice(i,i+L);controls.push({ioc:ioc(histogram(p)),uni:uni(histogram(p)),bigram:bigram(p)})}
 const native=enc(lp1.split("### 56")[0].split("\n").filter(x=>!x.startsWith("#")&&!x.startsWith("[")&&!x.startsWith("(")).join("\n"));
 const nativeControls=[];for(let i=0;i+L<=native.length;i+=L){let p=native.slice(i,i+L);nativeControls.push({ioc:ioc(histogram(p)),uni:uni(histogram(p)),bigram:bigram(p)})}
 const summarize=x=>({count:x.length,...Object.fromEntries(["ioc","uni","bigram"].map(k=>[k,[Math.min(...x.map(y=>y[k])),Math.max(...x.map(y=>y[k]))]]))});
 const sets=[false,true].map(wrap=>({wrap,...operators(wrap)}));
 const run=(C)=>{
  let bestI=null,bestU=null, candidates=0,affines=0;
  for(const rows of sets)for(const cols of sets)for(const R of rows.ops){
   const V=left(R.mat,C);
   for(const K of cols.ops){
    const Z=right(K.mat,V),h=histogram(Z),q=ioc(h);
    let d={rBoundary:rows.wrap?"cyclic":"zero",cBoundary:cols.wrap?"cyclic":"zero",R:R.name,K:K.name,ioc:q};
    candidates++;
    if(!bestI||q>bestI.ioc)bestI={...d};
    let score=-Infinity,key=null;
    for(const a of maps){let z=0;for(let i=0;i<M;i++)z+=h[i]*a.row[i];z/=L;affines++;if(z>score){score=z;key=a}}
    if(!bestU||score>bestU.uni){let P=transform(Z,key.a,key.b);
     let replay=right(K.undo,left(R.undo,transform(P,inv(key.a),mod(-key.b*inv(key.a)))));
     if(!replay.every((v,i)=>v===C[i]))throw Error("replay");
     bestU={...d,uni:score,a:key.a,b:key.b,bigram:bigram(P),P};
    }
   }
  }
  return {candidates,affines,bestI,bestU};
 };
 const original=run(source);
 const plantResults=[];
 for(let n=0;n<2;n++){
  const rowSet=sets[n],colSet=sets[1-n],R=rowSet.ops[9+n*2],K=colSet.ops[12+n*2],a=[7,13][n],b=[19,8][n],P=test.slice(n*L,(n+1)*L);
  const C=right(K.undo,left(R.undo,transform(P,inv(a),mod(-b*inv(a)))));
  const v=run(C),recovered=v.bestU.P.reduce((z,x,i)=>z+(x===P[i]),0);
  plantResults.push({planted:{rBoundary:rowSet.wrap?"cyclic":"zero",cBoundary:colSet.wrap?"cyclic":"zero",R:R.name,K:K.name,a,b},recovered,best:{...v.bestU,P:undefined},trueUni:uni(histogram(P)),trueIoC:ioc(histogram(P))});
 }
 return {sourceCounts:corpus.pages.slice(0,3).map(p=>p.indices.length),train:train.length,test:test.length,operators:sets.map(x=>({wrap:x.wrap,count:x.ops.length,singular:x.singular})),controls:summarize(controls),nativeControls:summarize(nativeControls),original,plantResults};
}
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
console.log(JSON.stringify(experiment(JSON.parse(read("resources/liber-primus/lp2-corpus.json")),read("resources/liber-primus/lp1-plaintext-reference.txt"),read("resources/control/gibran_prophet_58585.txt"),read("resources/control/shakespeare_first300k.txt")),null,2));
