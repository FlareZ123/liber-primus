"use strict";
/** Exact two-alphabet frequency envelope for the p15 cyclic gap-stride clock. */
const fs=require("node:fs"),path=require("node:path");
const paths=["resources/liber-primus/lp2-corpus.json","resources/external/relikd-solved-gp29-native-v1.json","resources/control/shakespeare_first300k.txt","resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt"];
function main(files){
const chart=JSON.parse(files[0]),native=JSON.parse(files[1]),N=29,mod=x=>(x%N+N)%N,check=(v,m)=>{if(!v)throw Error(m)},tokens=chart.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
function encode(s){return s.toUpperCase().match(/[A-Z]+/g).flatMap(w=>{let t=w.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),a=[];for(let i=0;i<t.length;){if(t.startsWith("ING",i)){a.push(21);i+=3}else if(t.startsWith("IO",i)){a.push(27);i+=2}else{let q=tokens.find(x=>t.startsWith(x.s,i));if(!q)throw Error(t);a.push(q.i);i+=q.s.length}}return a})}
for(const [w,z] of [["FOLLOWING","ᚠᚩᛚᛚᚩᚹᛝ"],["THINGS","ᚦᛝᛋ"],["FUNCTION","ᚠᚢᚾᚳᛏᛡᚾ"],["QUESTION","ᚳᚹᛖᛋᛏᛡᚾ"]])check(encode(w).map(i=>chart.runes[i]).join("")===z,"native spelling");
const donors=files.slice(2).map(encode);
const f=[0,1,2];while(f.length<16)f.push(f.at(-1)+f.at(-2));const ord=f.map(x=>x+1),gaps=f.slice(1).map((x,i)=>x-f[i]);const max=ord.at(-1)+Math.ceil(1903/15)*987,limit=Math.ceil(max*(Math.log(max)+Math.log(Math.log(max))))+100,com=new Uint8Array(limit+1),pr=[0];for(let i=2;i<=limit&&pr.length<=max;i++)if(!com[i]){pr.push(i);if(i*i<=limit)for(let j=i*i;j<=limit;j+=i)com[j]=1}
check(pr.length>max,"sieve");check(ord.map(x=>Math.abs(3301-pr[x])).join(",")==="3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516","p15 grid");
const gp=new Map(chart.runes.map((v,i)=>[v,i])),p56=[...native.sections.find(x=>x.name==="p56_an_end").source_text].filter(x=>gp.has(x)).map(x=>gp.get(x));let cur=1;check(p56.map(x=>x===0?0:mod(x+pr[cur++]-1)).join(",")===chart.pages[56].indices.join(","),"authentic p56");
function hung(W){const n=W.length,u=new Float64Array(n+1),v=new Float64Array(n+1),p=new Int32Array(n+1),way=new Int32Array(n+1);for(let i=1;i<=n;i++){p[0]=i;let j0=0,minv=new Float64Array(n+1).fill(Infinity),used=new Uint8Array(n+1);do{used[j0]=1;let i0=p[j0],d=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){let c=-W[i0-1][j-1]-u[i0]-v[j];if(c<minv[j]){minv[j]=c;way[j]=j0}if(minv[j]<d){d=minv[j];j1=j}}for(let j=0;j<=n;j++){if(used[j]){u[p[j]]+=d;v[j]-=d}else minv[j]-=d}j0=j1}while(p[j0]);do{let j1=way[j0];p[j0]=p[j1];j0=j1}while(j0)}const a=Array(n);for(let j=1;j<=n;j++)a[p[j]-1]=j-1;return{value:a.reduce((s,v,i)=>s+W[i][v],0),a}}
let seed=0x3301f15;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
function perm(n){const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){let j=rng()%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function brute(W){let best=-Infinity;function rec(i,mask,v){if(i===W.length){best=Math.max(best,v);return}for(let j=0;j<W.length;j++)if(!(mask&(1<<j)))rec(i+1,mask|(1<<j),v+W[i][j])}rec(0,0,0);return best}
for(let t=0;t<100;t++){let n=2+t%6,W=Array.from({length:n},()=>Array.from({length:n},()=>rng()%21-10));check(hung(W).value===brute(W),"assignment reference")}
function key(rank,phase,n){let x=rank,K=[];for(let i=0;i<n;i++){K.push(mod(pr[x]-1));x+=gaps[(phase+i)%15]}return K}
function histogram(C,K){const H=Array.from({length:N},()=>Array(N).fill(0));C.forEach((v,i)=>H[v][K[i]]++);return H}
function upper(H,S){return hung(H.map(row=>Array.from({length:N},(_,a)=>S.reduce((s,z)=>s+row[mod(a-z)],0))))}
function caps(H){const b1=upper(H,[0]);let b2={value:-1};for(let d=1;d<=14;d++){let q=upper(H,[0,d]);if(q.value>b2.value)b2={...q,d}}return {b1,b2}}
function minima(n){return donors.map(d=>{const h=Array(N).fill(0),mins=[Infinity,Infinity];for(let i=0;i<d.length;i++){h[d[i]]++;if(i>=n)h[d[i-n]]--;if(i>=n-1){let q=h.slice().sort((a,b)=>b-a);mins[0]=Math.min(mins[0],q[0]);mins[1]=Math.min(mins[1],q[0]+q[1])}}return{windows:d.length-n+1,mins}})}
function counts(P){let h=Array(N).fill(0);P.forEach(x=>h[x]++);return h.sort((a,b)=>b-a)}
const controls=[];
for(const [di,off,rank,phase,n,cut] of [[0,10000,1,0,1883,1210],[2,30000,378,1,1744,1071],[0,60000,14,7,1883,1210],[2,100000,988,3,1744,1071],[0,150000,56,10,1744,1071],[2,200000,611,2,1883,1210]]){
 const P=donors[di].slice(off,off+n),A=perm(N),B=perm(N),invA=Array(N);A.forEach((v,i)=>invA[v]=i);
 const K=key(rank,phase,n),C=P.map((v,i)=>invA[mod(B[v]+K[i])]),H=histogram(C,K),q=caps(H),h=counts(P);
 check(q.b1.value>=h[0]&&q.b2.value>=h[0]+h[1],"true key in caps");
 const neg=caps(histogram(C,K.map(x=>mod(-x))));check(neg.b1.value===q.b1.value&&neg.b2.value===q.b2.value,"sign symmetry");
 const train=histogram(C.slice(0,cut),K),start=caps(train);
 const U=Array(N).fill(.5);for(const v of donors[1])U[v]++;const lU=U.map(x=>Math.log(x/U.reduce((a,b)=>a+b,0))),order=Array.from({length:N},(_,i)=>i).sort((a,b)=>U[b]-U[a]);
 function getR(a,nn){return C.slice(0,nn).map((v,i)=>mod(a[v]-K[i]))}
 function inferB(a){let h=Array(N).fill(0);getR(a,cut).forEach(x=>h[x]++);let inv=Array(N),r=Array.from({length:N},(_,i)=>i).sort((a,b)=>h[b]-h[a]);r.forEach((v,i)=>inv[v]=order[i]);return inv}
 function fitScore(a,b){return getR(a,cut).reduce((s,v)=>s+lU[b[v]],0)}
 let best=null;
 for(const first of [start.b1.a,start.b2.a,...Array.from({length:8},()=>perm(N))]){let a=first,b=inferB(a),old=-Infinity;for(let it=0;it<35;it++){const score=fitScore(a,b);if(score<=old+1e-9)break;old=score;const W=train.map(row=>Array.from({length:N},(_,v)=>row.reduce((s,z,k)=>s+z*lU[b[mod(v-k)]],0)));a=hung(W).a;b=inferB(a)}
 const score=fitScore(a,b);if(!best||score>best.score)best={a,b,score}}
 // Train an independent conditional bigram model. The outer map is frozen.
 const LM=Array.from({length:N},()=>Array(N).fill(.5));for(let i=1;i<donors[1].length;i++)LM[donors[1][i-1]][donors[1][i]]++;
 for(const row of LM){const z=row.reduce((a,b)=>a+b,0);for(let i=0;i<N;i++)row[i]=Math.log(row[i]/z)}
 const rankTape=getR(best.a,cut),M=Array.from({length:N},()=>Array(N).fill(0));for(let i=1;i<rankTape.length;i++)M[rankTape[i-1]][rankTape[i]]++;
 function bScore(I){let v=0;for(let a=0;a<N;a++)for(let b=0;b<N;b++)v+=M[a][b]*LM[I[a]][I[b]];return v}
 let bestI=best.b.slice(),bestBS=bScore(bestI);
 for(let restart=0;restart<20;restart++){let I=restart===0?bestI.slice():perm(N),score=bScore(I);
  for(let t=0;t<8000;t++){let a=rng()%N,b=rng()%N;if(a===b)continue;let x=I[a],y=I[b],delta=0;
   for(let j=0;j<N;j++)if(j!==a&&j!==b){let z=I[j];delta+=M[a][j]*(LM[y][z]-LM[x][z])+M[b][j]*(LM[x][z]-LM[y][z])+M[j][a]*(LM[z][y]-LM[z][x])+M[j][b]*(LM[z][x]-LM[z][y])}
   delta+=M[a][a]*(LM[y][y]-LM[x][x])+M[b][b]*(LM[x][x]-LM[y][y])+M[a][b]*(LM[y][x]-LM[x][y])+M[b][a]*(LM[x][y]-LM[y][x]);
   const T=8*Math.pow(.005,t/7999);if(delta>=0||rng()/4294967296<Math.exp(delta/T)){[I[a],I[b]]=[I[b],I[a]];score+=delta;if(score>bestBS){bestBS=score;bestI=I.slice()}}
  }
 }
 const before=getR(best.a,n).map(v=>best.b[v]);best.b=bestI;
 const out=getR(best.a,n).map(v=>best.b[v]),matches=(lo,hi)=>out.slice(lo,hi).filter((v,i)=>v===P[lo+i]).length;
 const d=best.a.map((v,i)=>mod(v-A[i])),outerGaugeMatches=Math.max(...Array.from({length:N},(_,j)=>d.filter(v=>v===j).length));
 const reA=Array(N),reB=Array(N);best.a.forEach((v,i)=>reA[v]=i);best.b.forEach((v,i)=>reB[v]=i);check(out.map((v,i)=>reA[mod(reB[v]+K[i])]).join(",")===C.join(","),"blind replay");
 controls.push({di,off,rank,phase,n,cut,actualTop1:h[0],actualTop2:h[0]+h[1],cap1:q.b1.value,cap2:q.b2.value,signSymmetry:true,blind:{fitMatches:matches(0,cut),heldMatches:matches(cut,n),heldN:n-cut,outerGaugeMatches,unigramFitMatches:before.slice(0,cut).filter((v,i)=>v===P[i]).length,unigramHeldMatches:before.slice(cut).filter((v,i)=>v===P[cut+i]).length,bigramFitNatsPerTransition:bestBS/(cut-1),replay:true}})
}
const res=[];
for(const [start,skip] of [[15,20],[16,0]]){const C=chart.pages.slice(start,23).flatMap(x=>x.indices).slice(skip),min=minima(C.length),allmin=[Math.min(...min.map(x=>x.mins[0])),Math.min(...min.map(x=>x.mins[1]))],stats=[];
for(const rank of ord)for(let phase=0;phase<15;phase++){let H=histogram(C,key(rank,phase,C.length)),q=caps(H);stats.push({rank,phase,b1:q.b1.value,b2:q.b2.value,pairDifference:q.b2.d})}
const maxima=[Math.max(...stats.map(x=>x.b1)),Math.max(...stats.map(x=>x.b2))];res.push({start,skip,n:C.length,min,allmin,positiveSignCases:stats.length,totalSignedCases:stats.length*2,maxima,survive1:2*stats.filter(x=>x.b1>=allmin[0]).length,surviveBoth:2*stats.filter(x=>x.b1>=allmin[0]&&x.b2>=allmin[1]).length,allCases:stats})}
return {grid:ord.map(x=>Math.abs(3301-pr[x])),ord,gaps,p56Replay:p56.length,assignmentReferenceCases:100,donorLengths:donors.map(x=>x.length),controls,res}
}
console.log(JSON.stringify(main(paths.map(p=>fs.readFileSync(path.join(__dirname,"..",p),"utf8"))),null,2));
