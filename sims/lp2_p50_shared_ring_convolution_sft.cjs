'use strict';
const fs=require('node:fs');
const load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const g=load('resources/liber-primus/lp2-grid-256.json'),s=load('resources/external/relikd-solved-gp29-native-v1.json'),c=load('resources/liber-primus/lp2-corpus.json');
function solve(g,s,c) {
 const Q=29,mod=x=>((x%Q)+Q)%Q, inv=Array.from({length:Q},(_,i)=>i?Array.from({length:Q},(_,j)=>j).find(j=>i*j%Q===1):0);
 const A=g.alphabet,T=g.pages.flatMap(x=>x.tokens); const tables=[60,59].map(b=>T.map(t=>{const a=b===60?A:A.replace("f","");return a.indexOf(t[0])*b+a.indexOf(t[1])}));
 const r=(d)=>{const l=d,rt=7-d,t=d,b=31-d,o=[];for(let j=l;j<=rt;j++)o.push(8*t+j);for(let i=t+1;i<=b;i++)o.push(8*i+rt);for(let j=rt-1;j>=l;j--)o.push(8*b+j);for(let i=b-1;i>t;i--)o.push(8*i+l);return o;};
 const rings=[0,1,2,3].map(r);if(rings.map(x=>x.length).join()!=="76,68,60,52"||new Set(rings.flat()).size!==256)throw Error("rings");
 const native=n=>Array.from(s.sections.find(z=>z.name===n).source_text).map(x=>s.runes.indexOf(x)).filter(x=>x>=0);
 const p56=native("p56_an_end"),p57=native("p57_parable"),c56=c.pages.find(p=>p.page===56).indices;
 if(p56.length!==85||p57.length!==95||c56.length!==85)throw Error("tail");
 const targets=[["plaintext",p56.concat(p57)],["pad",c56.map((x,i)=>mod(x-p56[i])).concat(Array(95).fill(0))]];
 function elimination(A,b,N){const m=A.map((x,i)=>x.concat(b[i])),piv=[];let k=0;for(let j=0;j<N&&k<m.length;j++){let h=k;while(h<m.length&&!m[h][j])h++;if(h===m.length)continue;[m[k],m[h]]=[m[h],m[k]];let a=inv[m[k][j]];for(let x=j;x<=N;x++)m[k][x]=m[k][x]*a%Q;for(let i=0;i<m.length;i++)if(i!==k&&m[i][j]){let v=m[i][j];for(let x=j;x<=N;x++)m[i][x]=mod(m[i][x]-v*m[k][x]);}piv.push(j);k++;}
 const bad=m.slice(k).filter(x=>x[N]!==0).length;if(bad)return {rank:k,bad};const sol=Array(N).fill(0);piv.forEach((j,i)=>sol[j]=m[i][N]);return {rank:k,bad:0,sol};}
 function dot(a,b){return mod(a.reduce((n,x,i)=>n+x*b[i],0));}
 function makeFeatures(B,orient,degree){const M=Array(256);for(const raw of rings){let rr=orient===1?raw:raw.slice().reverse();for(let i=0;i<rr.length;i++){const out=Array.from({length:degree},(_,j)=>mod(B[rr[(i+j)%rr.length]]));out.push(1);M[rr[i]]=out;}}return M;}
 const raster=Array.from({length:30},(_,i)=>Array.from({length:6},(_,j)=>8*(i+1)+j+1)).flat();
 const orders=[["raster",raster],["raster-reversed",raster.slice().reverse()],["shed",rings.slice(1).flat()],["shed-reversed",rings.slice(1).flat().reverse()],["inner-to-outer",rings.slice(1).reverse().flat()],["inner-to-outer-reversed",rings.slice(1).reverse().flat().reverse()]];
 const result=[];for(let radix=0;radix<2;radix++)for(const orient of [1,-1]){const M=makeFeatures(tables[radix],orient,76);for(const [layout,idx] of orders)for(const [role,Y] of targets){const X=idx.map(i=>M[i]);const fit=elimination(X.slice(0,120),Y.slice(0,120),77);const full=elimination(X,Y,77);let held=null,outer=null;if(!fit.bad){held=X.slice(120).filter((a,i)=>dot(a,fit.sol)===Y[i+120]).length;if(fit.rank===77&&held===60)outer=rings[0].map(i=>dot(M[i],fit.sol));}result.push({radix:radix?59:60,orient,layout,role,fitRank:fit.rank,fitInconsistentRows:fit.bad,fullRank:full.rank,fullInconsistentRows:full.bad,held,outer});}}
 const P=native("0_koan_1").slice(0,256),controls=[];
 for(const orient of [1,-1]){const k=Array(76).fill(0);k[0]=3;k[1]=5;k[2]=7;k[7]=11;k[13]=17;const b=9;const B=Array(256);
 for(const raw of rings){const rr=orient===1?raw:raw.slice().reverse();const n=rr.length,mat=rr.map((_,i)=>Array.from({length:n},(_,j)=>k.reduce((s,x,t)=>s+((i+t)%n===j?x:0),0)%Q));const zz=elimination(mat,rr.map(i=>mod(P[i]-b)),n);if(zz.bad||zz.rank!==n)throw Error("noninvertible plant "+n);rr.forEach((i,j)=>B[i]=zz.sol[j]);}
 const M=makeFeatures(B,orient,76),idx=orders[2][1],X=idx.map(i=>M[i]),Y=idx.map(i=>P[i]),z=elimination(X.slice(0,120),Y.slice(0,120),77);let held=0,outer=0;if(!z.bad){held=X.slice(120).filter((x,i)=>dot(x,z.sol)===Y[120+i]).length;outer=rings[0].filter(i=>dot(M[i],z.sol)===P[i]).length;}
 controls.push({orient,fitRank:z.rank,inconsistent:z.bad,keyMatches:z.sol?.filter((x,i)=>x===k.concat(b)[i]).length,held,outer});}
 return {ringLengths:rings.map(x=>x.length),cases:result,controls};
}
const out=solve(g,s,c);console.log(JSON.stringify(out,null,2));
if(out.cases.some(x=>!x.fitInconsistentRows)||out.controls.some(x=>x.keyMatches!==77||x.held!==60||x.outer!==76))process.exitCode=1;
