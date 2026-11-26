"use strict";
const fs=require("node:fs");
const path=require("node:path");
function exactRank(text,alphabet){
 const p=1009, M=29, mod=x=>((x%p)+p)%p;
 const inv=x=>{for(let i=1;i<p;i++)if(mod(x*i)===1)return i;throw Error("nonunit")};
 const count=Array.from({length:15},(_,l)=>Array.from({length:l},()=>Array(M).fill(0)));
 for(let w of text.toUpperCase().match(/[A-Z]+/g)||[]){
  w=w.replaceAll("QU","CW").replaceAll("Q","C").replaceAll("K","C").replaceAll("V","U").replaceAll("Z","S");
  const a=[];while(w.length){const t=["ING","TH","EO","NG","OE","AE","IA","EA","IO"].find(t=>w.startsWith(t))||w[0];const q=alphabet.indexOf(t==="ING"?"NG":t==="IO"?"IA":t);if(q>=0)a.push(q);w=w.slice(t.length)}
  if(a.length>0&&a.length<15)for(let i=0;i<a.length;i++)count[a.length][i][a[i]]++;
 }
 const A=count.flat().map(row=>row.slice(1).map(mod));let rank=0,pivots=[];
 for(let c=0;c<M-1;c++){
  const k=A.findIndex((row,i)=>i>=rank&&row[c]!==0);if(k<0)continue;
  [A[rank],A[k]]=[A[k],A[rank]];const z=inv(A[rank][c]);A[rank]=A[rank].map(v=>mod(v*z));
  for(let i=rank+1;i<A.length;i++){const f=A[i][c];if(f)for(let j=c;j<M-1;j++)A[i][j]=mod(A[i][j]-f*A[rank][j])}
  pivots.push(c+1);rank++;
 }
 return {modulus:p,rows:A.length,rank,pivots};
}
function stabilizer(){
 const fact=n=>{let x=1n;for(let i=2;i<=n;i++)x*=BigInt(i);return x};
 // Count by distributing labelled positions to each of the d equally occupied bins of an orbit.
 function fixed(d,N){
  const O=28/d,memo=new Map;
  function ways(o,n){
   if(o===0)return 1n; // remaining positions all zero shift
   const key=`${o}:${n}`;if(memo.has(key))return memo.get(key);
   let z=0n;for(let m=0;m*d<=n;m++)z+=fact(n)/(fact(n-d*m)*fact(m)**BigInt(d))*ways(o-1,n-d*m);
   memo.set(key,z);return z;
  }return ways(O,N)
 }
 const nontriv=N=>fixed(2,N)+fixed(7,N)-fixed(14,N);
 const bad=nontriv(8)-nontriv(4),all=29n**8n-29n**4n;
 return {fixed8:[2,7,14].map(d=>String(fixed(d,8))),fixed4:[2,7,14].map(d=>String(fixed(d,4))),exceptionalPrimitive:String(bad),primitive:String(all),exceptionalFraction:Number(bad)/Number(all)};
}
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const result={rank:exactRank(read("resources/control/shakespeare_first300k.txt"),c.translit),stabilizer:stabilizer()};
if(result.rank.rank!==28||result.stabilizer.exceptionalPrimitive!=="60383568")throw Error("exact gate failed");
console.log(JSON.stringify(result,null,2));
