'use strict';
const fs=require('node:fs');
const path=require('node:path');
function study(grid,corpus){
 const m=x=>((x%29)+29)%29, inv=x=>{for(let i=1;i<29;i++)if(m(i*x)===1)return i;throw Error("zero pivot")};
 /** @param {number[][]} A @param {number[]} b */
 function solve(A,b){let M=A.map((r,i)=>[...r.map(m),m(b[i])]),n=A[0].length,piv=[],r=0;for(let j=0;j<n&&r<M.length;j++){let q=M.findIndex((row,i)=>i>=r&&row[j]);if(q<0)continue;[M[r],M[q]]=[M[q],M[r]];let z=inv(M[r][j]);M[r]=M[r].map(x=>m(x*z));for(let i=0;i<M.length;i++)if(i!==r&&M[i][j]){let t=M[i][j];M[i]=M[i].map((x,k)=>m(x-t*M[r][k]))}piv.push(j);r++}let inconsistent=M.some(row=>row.slice(0,n).every(x=>!x)&&row[n]);let x=Array(n).fill(0);piv.forEach((j,i)=>x[j]=M[i][n]);return{rank:r,inconsistent,x}};
 const page=n=>corpus.pages.find(p=>p.page===n).indices;
 let primes=[];for(let i=2;primes.length<85;i++)if(primes.every(p=>i%p!==0))primes.push(i);
 let j=0,p56=page(56).map((x,i)=>i===56?x:m(x-primes[j++]+1));
 let p57=page(57),rim=[...Array.from({length:8},(_,i)=>i),...Array.from({length:31},(_,i)=>(i+1)*8+7),...Array.from({length:7},(_,i)=>254-i),...Array.from({length:30},(_,i)=>(30-i)*8)];
 let inner=Array.from({length:256},(_,i)=>i).filter(i=>i%8!==0&&i%8!==7&&i>=8&&i<248);
 if(rim.length!==76||inner.length!==180||new Set([...rim,...inner]).size!==256)throw Error("layout");
 const assemble=(a,b,d)=>{let x=Array(256);rim.forEach((v,i)=>x[v]=a[i]);inner.forEach((v,i)=>x[v]=[...b,...d][i]);return x};
 const C=assemble(page(55),page(56),p57),P=assemble(Array(76).fill(0),p56,p57);
 const tokens=grid.pages.flatMap(p=>p.tokens);
 const results=[];
 for(const base of [59,60]){
  const abc=base===59?grid.alphabet.replace("f",""):grid.alphabet;
  const addr=tokens.map(t=>base*abc.indexOf(t[0])+abc.indexOf(t[1]));
  if(addr.some(x=>x<0||x>255))throw Error("address");
  for(const direction of [1,-1]){
   /** Each output column selects an offset relative to its own physical row. */
   const features=(x,i)=>[1,x[i],...Array.from({length:8},(_,k)=>x[addr[8*Math.floor(i/8)+((i%8+direction*k+8)%8)]])];
   let A=inner.map(i=>features(C,i)), b=inner.map(i=>P[i]);
   let fit=solve(A.slice(0,85),b.slice(0,85)), joint=solve(A,b);
   const predict=(row,k)=>m(row.reduce((s,x,i)=>s+x*k[i],0));
   const held=fit.inconsistent?null:A.slice(85).filter((row,i)=>predict(row,fit.x)===b[85+i]).length;
   // Known plaintext positive: generate C by solving an invertible fixed sparse decoder matrix.
   let X=assemble(p57.slice(0,76),p56,p57);
   let key=[7,1,2,0,0,0,0,0,0,0], M=Array.from({length:256},(_,i)=>{let row=Array(256).fill(0);row[i]=1;row[addr[i]]=m(row[addr[i]]+2);return row});
   let plant=solve(M,X.map(x=>m(x-7)));
   if(plant.inconsistent||plant.rank!==256){key=[7,1,0,0,0,0,0,0,0,0];M=Array.from({length:256},(_,i)=>Array.from({length:256},(_,j)=>+(i===j)));plant=solve(M,X.map(x=>m(x-7)))}
   let plantedFit=solve(inner.slice(0,85).map(i=>features(plant.x,i)),p56);
   if(plantedFit.inconsistent)throw Error("plant inconsistent");
   const plantRecovered=Array.from({length:256},(_,i)=>predict(features(plant.x,i),plantedFit.x));
   results.push({base,direction,distinctRows: Array.from({length:32},(_,r)=>new Set(addr.slice(r*8,r*8+8)).size).filter(n=>n===8).length,fit,joint,held,plant:{key,matrixRank:plant.rank,fitRank:plantedFit.rank,exact:plantRecovered.filter((v,i)=>v===X[i]).length,rimExact:rim.filter(i=>plantRecovered[i]===X[i]).length}});
  }
 }
 return {p56:p56.map(i=>corpus.translit[i]).join(""),results};
}
const root=process.argv[2]||path.join(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(study(read('resources/liber-primus/lp2-grid-256.json'),read('resources/liber-primus/lp2-corpus.json')),null,2));
