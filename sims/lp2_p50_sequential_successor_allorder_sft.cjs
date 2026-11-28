'use strict';
const fs=require('node:fs');
const path=require('node:path');
function allOrder(corpus,grid){
 const mod=x=>(x%29+29)%29,assert=(v,m)=>{if(!v)throw Error(m)},inv=a=>{for(let i=1;i<29;i++)if(mod(a*i)===1)return i;throw Error("inverse")};
 const [c55,c56,p57]=corpus.pages.slice(-3).map(p=>p.indices);assert(c55.length===76&&c56.length===85&&p57.length===95,"lengths");
 const primes=[];for(let n=2;primes.length<85;n++)if(primes.every(p=>p*p>n||n%p))primes.push(n);
 let k=0;const p56=c56.map((c,i)=>i===56?0:mod(c-primes[k++]+1));k=0;assert(p56.every((p,i)=>p===0?i===56&&c56[i]===0:mod(p+primes[k++]-1)===c56[i])&&k===84,"p56 replay");
 const row=Array.from({length:256},(_,i)=>i),rim=[...Array.from({length:8},(_,i)=>i),...Array.from({length:30},(_,i)=>8*(i+1)+7),...Array.from({length:8},(_,i)=>255-i),...Array.from({length:30},(_,i)=>8*(30-i))],layouts={row,rim:[...rim,...row.filter(i=>!rim.includes(i))]};
 const sweep=[...row.filter(i=>i%2===0),...row.filter(i=>i%2===1).reverse()],step=Array(256);sweep.forEach((i,k)=>step[i]=k);
 const out=[];
 function sat(rs,split){
  const edges=Array.from({length:2*rs.length},()=>[]),states=rs.map(r=>["v:"+r.raw,r.dec===null?"addr:"+r.j:"v:"+r.dec]);let clauses=0;
  const reject=(i,x,j,y)=>{edges[2*i+x].push(2*j+1-y);edges[2*j+y].push(2*i+1-x);clauses++};
  for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++)if((rs[i].c===rs[j].c)!==(rs[i].p===rs[j].p))for(let x=0;x<2;x++)for(let y=0;y<2;y++)if((!split||x===y)&&states[i][x]===states[j][y])reject(i,x,j,y);
  const reach=edges.map((_,v)=>{const seen=new Set([v]),stack=[v];while(stack.length){for(const w of edges[stack.pop()])if(!seen.has(w)){seen.add(w);stack.push(w)}}return seen});
  const conflicts=rs.filter((_,i)=>reach[2*i].has(2*i+1)&&reach[2*i+1].has(2*i)).map(r=>r.i);
  return {clauses,unsat:conflicts.length>0,conflicts};
 }
 for(const radix of [59,60]){
 const alpha=radix===59?grid.alphabet.replace("f",""):grid.alphabet, f=grid.pages.flatMap(p=>p.tokens).map(t=>radix*alpha.indexOf(t[0])+alpha.indexOf(t[1]));assert(f.length===256&&f.every(i=>i>=0&&i<256),"table");
 for(const [layout,order] of Object.entries(layouts)){
 const scatter=xs=>{const x=Array(256);order.forEach((p,i)=>x[p]=xs[i]);return x};
 const C=scatter([...c55,...c56,...p57]),P=scatter([...Array(76).fill(null),...p56,...Array(95).fill(null)]);
 const records=(C,P)=>order.slice(76,161).map(i=>({i,j:f[i],c:C[i],p:P[i],raw:C[f[i]],dec:P[f[i]]}));
 const all=records(C,P),rs=all.filter(r=>r.dec!==null);
 function sharedFit(rs){
  const fit=[];let tested=0,most=-1,best=null;
  for(let a=1;a<29;a++)for(let b=0;b<29;b++)if(!f.some((j,i)=>i===j)||mod(a+b)!==0)for(let d=0;d<29;d++){tested++;let matches=0;for(const r of rs){const u=mod(a*r.c+b*r.raw+d)===r.p,v=r.i!==r.j&&mod(a*r.c+b*r.dec+d)===r.p;matches+=u||v}if(matches>most){most=matches;best=[a,b,d]}if(matches===rs.length)fit.push([a,b,d])}
  return {tested,most,best,fit};
 }
 function splitFit(rs){
  let maxRaw=0,maxDec=0;const rawMasks=new Map(),decMasks=new Map();
  for(let a=1;a<29;a++)for(let b=0;b<29;b++)for(let d=0;d<29;d++){let raw=0,dec=0,rm=0,dm=0;rs.forEach((r,k)=>{if(mod(a*r.c+b*r.raw+d)===r.p){raw++;rm|=1<<k}if(r.i!==r.j&&mod(a*r.c+b*r.dec+d)===r.p){dec++;dm|=1<<k}});maxRaw=Math.max(maxRaw,raw);maxDec=Math.max(maxDec,dec);for(const [map,mask] of [[rawMasks,rm],[decMasks,dm]]){if(!map.has(mask))map.set(mask,[]);map.get(mask).push([a,b,d])}}
  const pairs=[],full=(1<<rs.length)-1;
  if(maxRaw+maxDec>=rs.length)for(const [rm,rkeys] of rawMasks)for(const [dm,dkeys] of decMasks)if((rm|dm)===full)for(const rk of rkeys)for(const dk of dkeys)pairs.push([rk,dk]);
  return {maxRaw,maxDec,upper:maxRaw+maxDec,fitPairs:pairs};
 }
 const shared=sharedFit(rs),split=splitFit(rs);assert(shared.fit.length===0&&split.upper<rs.length&&split.fitPairs.length===0,"original gate");
 function plant(keys){
  const truth=scatter([...p57.slice(0,76),...p56,...p57]),cp=truth.slice();
  const params=i=>keys[step[f[i]]<step[i]?1:0];
  for(const i of [...sweep].reverse()){const [a,b,d]=params(i),j=f[i];cp[i]=j===i?mod((cp[i]-d)*inv(mod(a+b))):mod((cp[i]-b*cp[j]-d)*inv(a))}
  const rr=records(cp,P).filter(r=>r.dec!==null);
  const solved=cp.slice();for(const i of sweep){const [a,b,d]=params(i);solved[i]=mod(a*solved[i]+b*solved[f[i]]+d)}
  assert(solved.every((v,i)=>v===truth[i]),"plant replay");
  return {rr,held:order.filter((i,j)=>j<76||j>=161).filter(i=>solved[i]===truth[i]).length};
 }
 const same=[[3,2,7],[3,2,7]],two=[[3,2,7],[5,4,11]],sp=plant(same),tp=plant(two),ps=sharedFit(sp.rr),pt=splitFit(tp.rr);
 assert(ps.fit.some(x=>x.join()===same[0].join()),"shared plant key");
 assert(pt.fitPairs.some(x=>JSON.stringify(x)===JSON.stringify(two)),"two chart plant key");
 const nons=all.filter(r=>r.i!==r.j);out.push({radix,layout,internal:rs.length,shared,split,arbitraryShared:sat(nons,false),arbitrarySplit:sat(nons,true),plant:{sharedKeyCount:ps.fit.length,splitKeyPairCount:pt.fitPairs.length,sharedHeld:sp.held,splitHeld:tp.held,sharedKey:same[0],splitKeys:two}});
 }}
 return {source:{corpus:"054f2a0f780b7d46901acbe3d9bf4f0ac1801165",grid:"2550eae357442912220e05dc51147523a61dd75a"},p56Replay:85,primeTerms:84,results:out};
}
const root=path.join(__dirname,'..','resources','liber-primus');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
console.log(JSON.stringify(allOrder(read('lp2-corpus.json'),read('lp2-grid-256.json')),null,2));
