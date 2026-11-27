"use strict";
// Exact grid operand factorization certificates; no external dependencies.
const fs = require("node:fs");
const path = require("node:path");
function run(data) {
 const assert=(b,m)=>{if(!b)throw Error(m)};
 const gcd=(a,b)=>{a=a<0n?-a:a;b=b<0n?-b:b;while(b)[a,b]=[b,a%b];return a};
 const det=(A)=>{A=A.map(r=>r.map(BigInt));const n=A.length;let prev=1n,sign=1n;for(let k=0;k<n-1;k++){let p=k;while(p<n&&!A[p][k])p++;if(p===n)return 0n;if(p!==k){[A[p],A[k]]=[A[k],A[p]];sign=-sign}const d=A[k][k];for(let i=k+1;i<n;i++)for(let j=k+1;j<n;j++){const v=A[i][j]*d-A[i][k]*A[k][j];assert(v%prev===0n,"Bareiss division");A[i][j]=v/prev}for(let i=k+1;i<n;i++)A[i][k]=0n;prev=d}return sign*A[n-1][n-1]};
 const tokens=data.pages.flatMap(p=>p.tokens.flat());
 const T=Array.from({length:32},(_,i)=>tokens.slice(8*i,8*i+8));assert(tokens.length===256,"shape");
 const repeat=[];for(let j=0;j<8;j++)for(let i=0;i<32;i++)for(let k=i+1;k<32;k++)if(T[i][j]===T[k][j])repeat.push([j,i,k,T[i][j]]);
 const cols=[...new Set(repeat.map(x=>x[0]))];
 const nclass=new Set(tokens).size,repeatClasses=new Set(T.flatMap(r=>cols.map(j=>r[j]))).size;
 assert(new Set(T.map(r=>r.join(" "))).size===32,"distinct rows");
 assert(T[4][2]===T[14][2]&&T[4][4]===T[14][4]&&T[15][2]===T[16][2]&&T[15][4]!==T[16][4],"rank witness");
 const modes=[];
 for(const radix of [60,59]){
 const alphabet=radix===60?data.alphabet:data.alphabet.replace("f","");
 const V=T.map(row=>row.map(t=>radix*alphabet.indexOf(t[0])+alphabet.indexOf(t[1])));
 const constraints=repeat.map(([j,i,k,t])=>({j,i,k,t,v:V[i][j],gcd:String(V[i].reduce((g,x,l)=>gcd(g,BigInt(x-V[k][l])),0n))}));
 const forcedGcd=constraints.reduce((g,x)=>gcd(g,BigInt(x.v-constraints[0].v)),0n);
 assert(constraints.every(x=>x.gcd==="1"),"primitive repeated-row difference");assert(forcedGcd===1n,"offset contradiction");
 const D=V.slice(1).map((row,i)=>row.slice(1).map((x,j)=>x-V[i+1][0]-V[0][j+1]+V[0][0]));
 const rawSets=[[0,1,2,3,4,5,6,7],[0,1,2,3,4,5,6,8],[0,1,2,3,4,5,6,9],[0,1,8,3,9,6,5,2]];
 const ctrSets=[[1,2,3,4,5,6,7],[1,2,3,4,5,6,8],[1,2,3,4,5,6,9],[1,8,9,10,5,7,6]];
 const cert=(A,sets,offset)=>{let g=0n;const out=[];for(const rows of sets){const d=det(rows.map(i=>A[i-offset]));g=gcd(g,d);out.push({rows,det:String(d),runningGcd:String(g)});if(g===1n)break}assert(g===1n,"unit determinantal divisor");return out};
 modes.push({radix,range:[Math.min(...V.flat()),Math.max(...V.flat())],constraints,forcedGcd:String(forcedGcd),raw:cert(V,rawSets,0),centered:cert(D,ctrSets,1)});
 }
 const P=Array.from({length:8},(_,i)=>Array.from({length:8},(_,j)=>(i+1)*(j+2)+i*i-j*j));const E=P.slice(1).map((row,i)=>row.slice(1).map((x,j)=>x-P[i+1][0]-P[0][j+1]+P[0][0]));assert(det(E.slice(0,2).map(row=>row.slice(0,2)))===0n,"positive centered rank-one check");
 return {shape:[32,8],nclass,repeat,repeatColumns:cols,repeatClasses,rankWitness:[4,14,15,16].map(i=>({i,row:T[i]})),modes};
}
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../resources/liber-primus/lp2-grid-256.json"), "utf8"));
console.log(JSON.stringify(run(data), null, 2));
