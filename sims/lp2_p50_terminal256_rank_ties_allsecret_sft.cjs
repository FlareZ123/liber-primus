"use strict";
/** Exact all-secret substitution and tie-order rank-transposition receiver. Node.js CommonJS. */
const fs=require("node:fs"),path=require("node:path");
const read=n=>JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus",n),"utf8"));
function experiment(db,grid){
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const mod=x=>(x%29+29)%29;
 const primes=[];for(let n=2;primes.length<84;n++)if(primes.every(p=>n%p))primes.push(n);
 const C=db.pages.slice(55,58).flatMap(x=>x.indices);
 let j=0;const P=Array(76).fill(-1).concat(db.pages[56].indices.map((x,i)=>i===56?0:mod(x-primes[j++]+1)),db.pages[57].indices);
 assert(C.length===256&&P.length===256&&j===84&&C[132]===0&&P.slice(76,81).join()==="24,9,18,9,23","native control");
 for(let i=0,k=0;i<85;i++)assert(C[76+i]===(i===56?0:mod(P[76+i]+primes[k++]-1)),"p56 replay");
 const ids=Array.from({length:256},(_,i)=>i);
 const rings=Array.from({length:4},(_,d)=>{let z=[];for(let x=d;x<8-d;x++)z.push(8*d+x);for(let y=d+1;y<32-d;y++)z.push(8*y+7-d);for(let x=6-d;x>=d;x--)z.push(8*(31-d)+x);for(let y=30-d;y>d;y--)z.push(8*y+d);return z});
 assert(rings.map(x=>x.length).join()==="76,68,60,52"&&new Set(rings.flat()).size===256,"rings");
 const alph=grid.alphabet.replace("f",""),tokens=grid.pages.flatMap(p=>p.tokens);
 const values=[grid.bytes,tokens.map(t=>59*alph.indexOf(t[0])+alph.indexOf(t[1]))];
 // Exact bipartite feasibility: a source letter may map to a target letter iff it has enough occurrences in every rank tie block.
 function test(c,p,rankValues,descending,inverse){
  const ord=rankValues.map((_,i)=>i).sort((x,y)=>(descending?-1:1)*(rankValues[x]-rankValues[y])||x-y);
  let masks=Array(29).fill((1<<29)-1),blocks=0;
  for(let s=0;s<ord.length;){let e=s+1;while(e<ord.length&&rankValues[ord[e]]===rankValues[ord[s]])e++;
   const x=Array(29).fill(0),y=Array(29).fill(0);let missing=0;
   for(let k=s;k<e;k++){x[c[inverse?k:ord[k]]]++;const v=p[inverse?ord[k]:k];if(v===-1)missing++;else y[v]++;}
   for(let i=0;i<29;i++){let allowed=0;for(let j=0;j<29;j++)if(y[j]<=x[i]&&(missing||y[j]===x[i]))allowed|=1<<j;masks[i]&=allowed;if(!masks[i])return {ok:false,blocks:blocks+1};}
   blocks++;s=e;
  }
  const owners=Array(29).fill(-1);
  function augment(i,seen){for(let j=0;j<29;j++)if((masks[i]&(1<<j))&&!seen[j]){seen[j]=true;if(owners[j]===-1||augment(owners[j],seen)){owners[j]=i;return true;}}return false;}
  for(let i=0;i<29;i++)if(!augment(i,Array(29).fill(false)))return {ok:false,blocks};
  const pi=Array(29);owners.forEach((i,j)=>pi[i]=j);return {ok:true,blocks,pi};
 }
 const positive=[];
 for(let d=0;d<2;d++)for(let inv=0;inv<2;inv++)for(let rev=0;rev<2;rev++){
  const v=values[d],ord=ids.slice().sort((i,j)=>(rev?-1:1)*(v[i]-v[j])||j-i);
  const pi=ids.slice(0,29).map(i=>mod(7*i+13)),p=Array(256);
  ord.forEach((i,k)=>{p[inv?i:k]=pi[C[inv?k:i]];});
  const got=test(C,p.map((x,i)=>i<76?-1:x),v,rev,inv);
  assert(got.ok,"positive failed");positive.push(got.blocks);
  const complete=test(C,p,v,rev,inv);assert(complete.ok,"full positive failed");
 }
 // Distinct native-plaintext controls: use genuine solved text and an additional genuine p57 window as the hidden 76-symbol prefix.
 const native=[];
 for(let d=0;d<2;d++)for(let inv=0;inv<2;inv++)for(let rev=0;rev<2;rev++){
  const v=values[d],ord=ids.slice().sort((i,j)=>(rev?-1:1)*(v[i]-v[j])||j-i);
  const p=db.pages[57].indices.slice(0,76).concat(P.slice(76)),c=Array(256),pi=ids.slice(0,29).map(i=>mod(7*i+13)),ip=Array(29);
  pi.forEach((x,i)=>ip[x]=i);
  ord.forEach((i,k)=>{c[inv?k:i]=ip[p[inv?i:k]];});
  const got=test(c,p.map((x,i)=>i<76?-1:x),v,rev,inv);assert(got.ok,"native positive");
  // Reconstruct concealed per-block multisets from the matching, with no hidden target values used for fitting.
  const all=[];let correct=0,groups=0,correctGroups=0;
  for(let s=0;s<ord.length;){let e=s+1;while(e<ord.length&&v[ord[e]]===v[ord[s]])e++;
   const pred=Array(29).fill(0),truth=Array(29).fill(0);let count=0;
   for(let k=s;k<e;k++){pred[got.pi[c[inv?k:ord[k]]]]++;const pos=inv?ord[k]:k;if(pos>=76)pred[p[pos]]--;else{truth[p[pos]]++;count++;}}
   if(count){groups++;let match=0;for(let x=0;x<29;x++){assert(pred[x]>=0,"negative count");match+=Math.min(pred[x],truth[x]);}correct+=match;if(match===count)correctGroups++;}
   s=e;
  }
  native.push({d,inv,rev,correct,groups,correctGroups});
 }
 const layouts=[];
 for(let transpose=0;transpose<2;transpose++)for(let flipY=0;flipY<2;flipY++)for(let flipX=0;flipX<2;flipX++)for(let snake=0;snake<2;snake++){
  const l=[];for(let a=0;a<(transpose?8:32);a++)for(let b=0;b<(transpose?32:8);b++){
   let aa=a,bb=snake&&a%2?(transpose?31:7)-b:b;let y=transpose?bb:aa,x=transpose?aa:bb;if(flipY)y=31-y;if(flipX)x=7-x;l.push(8*y+x);
  }layouts.push({name:[transpose,flipY,flipX,snake].join(""),l});
 }
 layouts.push({name:"clockwise rings",l:rings.flat()});
 const whole={tested:0,survivors:[],maxBlocks:0,independentPageRelaxation:{p56:0,p57:0,both:0}};
 for(let d=0;d<2;d++)for(const {name,l} of layouts)for(let rev=0;rev<2;rev++)for(let inv=0;inv<2;inv++){
  const v=l.map(i=>values[d][i]),g=test(C,P,v,rev,inv);whole.tested++;whole.maxBlocks=Math.max(whole.maxBlocks,g.blocks);if(g.ok)whole.survivors.push({d,name,rev,inv,pi:g.pi});
  const a=test(C,P.map((x,i)=>i>=76&&i<161?x:-1),v,rev,inv).ok,b=test(C,P.map((x,i)=>i>=161?x:-1),v,rev,inv).ok;
  whole.independentPageRelaxation.p56+=a;whole.independentPageRelaxation.p57+=b;whole.independentPageRelaxation.both+=a&&b;
 }
 const separate=[];let start=76;
 for(let ring=1;ring<4;ring++){const a=rings[ring],c=C.slice(start,start+a.length),p=P.slice(start,start+a.length);start+=a.length;let tested=0,maxBlocks=0,survivors=[];
  for(let d=0;d<2;d++)for(let offset=0;offset<a.length;offset++)for(const direction of [-1,1])for(let rev=0;rev<2;rev++)for(let inv=0;inv<2;inv++){
   const v=a.map((_,k)=>values[d][a[(offset+direction*k+a.length)%a.length]]),g=test(c,p,v,rev,inv);tested++;maxBlocks=Math.max(maxBlocks,g.blocks);if(g.ok)survivors.push({d,offset,direction,rev,inv,pi:g.pi});
  }separate.push({ring,length:a.length,tested,maxBlocks,survivors});
 }
 return {positive,native,whole,separate};
}
console.log(JSON.stringify(experiment(read("lp2-corpus.json"),read("lp2-grid-256.json")),null,2));
