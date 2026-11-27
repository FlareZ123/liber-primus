"use strict";
const INPUTS=["resources/liber-primus/lp2-corpus.json","resources/control/gibran_prophet_58585.txt","resources/control/shakespeare_first300k.txt","resources/control/emerson_essays_2944.txt"];
function run(raw){
 const gp=JSON.parse(raw[0]),A=29,tokens=gp.translit.map((t,i)=>({t,i})).sort((a,b)=>b.t.length-a.t.length);
 const assert=(v,m)=>{if(!v)throw Error(m)},sum=a=>a.reduce((x,y)=>x+y,0),range=n=>Array.from({length:n},(_,i)=>i);
 function native(t){const a=/\*{3}\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t),b=/\*{3}\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*/i.exec(t);let p=[];for(const w0 of t.slice(a?a.index+a[0].length:0,b?b.index:t.length).toUpperCase().match(/[A-Z]+/g)||[]){const w=w0.replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");for(let j=0;j<w.length;){const v=w.startsWith("ING",j)?{t:"ING",i:21}:w.startsWith("IO",j)?{t:"IO",i:27}:tokens.find(x=>w.startsWith(x.t,j));assert(v,w);p.push(v.i);j+=v.t.length;}}return p}
 const donors=raw.slice(1).map(native);
 // Exact maximum assignment, integer costs; primal/dual objective agreement.
 function assignment(w){const n=w.length,u=new Float64Array(n+1),v=new Float64Array(n+1),p=new Int32Array(n+1),way=new Int32Array(n+1);for(let i=1;i<=n;i++){p[0]=i;let j0=0;const min=new Float64Array(n+1).fill(Infinity),used=new Uint8Array(n+1);do{used[j0]=1;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=n;j++)if(!used[j]){const cur=-w[i0-1][j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0}if(min[j]<delta){delta=min[j];j1=j}}for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta}else min[j]-=delta;j0=j1}while(p[j0]);do{const j1=way[j0];p[j0]=p[j1];j0=j1}while(j0)}
  const primal=sum(range(n).map(j=>w[p[j+1]-1][j]));assert(primal===-sum(u.slice(1))-sum(v.slice(1)),"dual gap");
  for(let i=1;i<=n;i++)for(let j=1;j<=n;j++)assert(u[i]+v[j]<=-w[i-1][j-1],"dual infeasible");
  return primal;
 }
 const pages=gp.pages.slice(0,56).filter(p=>p.indices.length).map(p=>p.indices),N=sum(pages.map(p=>p.length)),skip=pages.length;assert(N===12956&&skip===55,"source geometry");
 // Pairwise independent alignment is a relaxation of common phase-map consistency.
 function bound(pages,q,clock){const h=range(q).map(()=>range(A).map(()=>new Int32Array(A)));let k=0,n=0;for(const t of pages){if(clock==="page")k=0;for(let j=0;j<t.length;j++){if(j){h[k%q][t[j-1]][t[j]]++;n++}if(j||clock!=="consume")k++}}
  let within=0,cross=0,cyclic=0;for(let a=0;a<q;a++)for(let r=0;r<A;r++)for(let x=0;x<A;x++){let z=h[a][r][x];within+=z*(z-1)/2}
  for(let a=0;a<q;a++)for(let b=a+1;b<q;b++){const w=range(A).map(()=>new Int32Array(A));for(let r=0;r<A;r++)for(let x=0;x<A;x++)if(h[a][r][x])for(let y=0;y<A;y++)w[x][y]+=h[a][r][x]*h[b][r][y];cross+=assignment(w);cyclic+=Math.max(...range(A).map(d=>sum(w.map((row,x)=>row[(x+d)%A]))))}
  return {n,within,arbitrary:within+cross,additive:within+cyclic};
 }
 // Balanced allocation across 29 predecessor rows gives minimum collisions.
 function f(x){const a=Math.floor(x/A),b=x%A;return A*a*(a-1)/2+a*b}
 // Remove at most 55 arbitrary plaintext IV slots; convex water-filling is exact.
 function lower(h,held){const a=Array.from(h);if(held)a[0]=0;a.sort((a,b)=>b-a);let rem=skip;for(let k=0;k<A&&rem;k++){const d=k===A-1?rem:Math.min(rem,(a[k]-a[k+1])*(k+1));if(d){let t=Math.floor(d/(k+1)),u=d%(k+1);for(let i=0;i<=k;i++)a[i]-=t+(i<u);rem-=d}}return sum(a.map(f))}
 function minHist(p){let h=new Int32Array(A);for(let i=0;i<N;i++)h[p[i]]++;let min=[Infinity,Infinity],max=[0,0],minAt=[0,0];for(let j=0;j+N<=p.length;j++){if(j){h[p[j-1]]--;h[p[j+N-1]]++}for(let m=0;m<2;m++){const z=lower(h,m);if(z<min[m]){min[m]=z;minAt[m]=j}max[m]=Math.max(max[m],z)}}return {windows:p.length-N+1,min,max,minAt}}
 let seed=0x4a132301;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
 function perm(n,held=false){let a=range(n);for(let i=n-1;i>(held?1:0);i--){const j=(held?1:0)+rng()%(i+1-(held?1:0));[a[i],a[j]]=[a[j],a[i]]}return a}
 // Small brute oracle for assignment.
 function brute(w){let best=-Infinity;function go(i,mask,s){if(i===w.length){best=Math.max(best,s);return}for(let j=0;j<w.length;j++)if(!(mask>>j&1))go(i+1,mask|1<<j,s+w[i][j])}go(0,0,0);return best}
 for(let z=0;z<64;z++){const n=2+z%5,w=range(n).map(()=>range(n).map(()=>rng()%20));assert(assignment(w)===brute(w),"assignment oracle")}
 const clocks=["continuous","page","consume"],periods=[1,8,13,23,29],original=[];
 for(const dir of [1,-1]){const input=dir===1?pages:pages.slice().reverse().map(p=>p.slice().reverse());for(const q of periods)for(const clock of clocks)original.push({dir,q,clock,...bound(input,q,clock)})}
 // Native plants in original page geometry, all phases, arbitrary row and phase permutations.
 const plants=[];for(let d=0;d<donors.length;d++)for(let held=0;held<2;held++){
  const q=[8,13,23][d],clock=clocks[d];if(held&&clock==="consume"){/* consume counts IV omission, not F holds */}
  const R=range(A).map(()=>perm(A,!!held)),S=range(q).map(()=>perm(A,!!held)),p=donors[d].slice(1000,1000+N),h=new Int32Array(A);p.forEach(x=>h[x]++);
  let pos=0,k=0,correct=0;const c=[],actual=range(A).map(()=>new Int32Array(A));
  for(const pg of pages){if(clock==="page")k=0;const P=p.slice(pos,pos+pg.length),C=[pg[0]];pos+=pg.length;if(clock!=="consume")k++;for(let j=1;j<P.length;j++,k++){const a=C[j-1],s=S[k%q],v=s[R[a][P[j]]];C.push(v);const x=R[a].indexOf(s.indexOf(v));assert(x===P[j],"plant inversion");correct++;if(!held||x!==0)actual[a][x]++}c.push(C)}
  const pairs=sum(actual.map(row=>sum(Array.from(row,x=>x*(x-1)/2)))),lo=lower(h,held),hi=bound(c,q,clock);assert(lo<=pairs&&pairs<=hi.arbitrary,"native plant bound");
  plants.push({donor:d,held:!!held,q,clock,correct,pairs,lo,hi:hi.arbitrary});
 }
 const lowerBounds=donors.map(minHist),floor=[0,1].map(i=>Math.min(...lowerBounds.map(x=>x.min[i])));
 return {schema:"lp2-public-cipher-prev-shared-phase-permutation-v1",N,skip,donorLengths:donors.map(d=>d.length),lowerBounds,floor,assignmentOracle:64,plants,original:original.map(x=>({...x,ordinaryExcluded:x.arbitrary<floor[0],physicalFExcluded:x.arbitrary<floor[1],additiveOrdinaryExcluded:x.additive<floor[0],additivePhysicalFExcluded:x.additive<floor[1]}))};
}
if(require.main===module){const fs=require("node:fs");console.log(JSON.stringify(run(INPUTS.map(p=>fs.readFileSync(p,"utf8"))),null,2))}
module.exports={run,INPUTS};
