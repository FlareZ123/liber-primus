"use strict";
const fs=require("node:fs");
const path=require("node:path");
function analyze(exact,alt,html){
 const assert=(x,m)=>{if(!x)throw Error(m)}, sum=a=>a.reduce((s,x)=>s+x,0), flatten=m=>m.flat().join(","), range=n=>Array.from({length:n},(_,i)=>i);
 const nums=s=>s.match(/\d+/g).map(Number), values=nums(exact), other=nums(alt);assert(values.length===99&&values.join()===other.join(),"same exact historical numeric order");
 const specs=[{n:5,target:3301,field:"53301"},{n:7,target:1033,field:"71033"},{n:5,target:1033,field:"51033"}];
 const fields=[...html.matchAll(/<textarea name="([^"]+)"/g)].map(m=>m[1]);assert(fields.join()===specs.map(x=>x.field).join(),"form field order");
 const perm=a=>{if(!a.length)return [[]];const out=[];for(let i=0;i<a.length;i++){const rest=[...a.slice(0,i),...a.slice(i+1)];for(const p of perm(rest))out.push([a[i],...p])}return out};
 const key=p=>p.join(","), fact=n=>n<=1?1:n*fact(n-1);
 const check=(M,target)=>{const n=M.length,I=range(n);return M.every(r=>sum(r)===target)&&I.every(j=>sum(I.map(i=>M[i][j]))===target)&&sum(I.map(i=>M[i][i]))===target&&sum(I.map(i=>M[i][n-1-i]))===target};
 const transform=(M,r,c)=>r.map(i=>c.map(j=>M[i][j]));
 const output=[];let cursor=0;
 for(const {n,target,field} of specs){
  const I=range(n),R=[...I].reverse(),M=I.map(i=>values.slice(cursor+i*n,cursor+(i+1)*n));cursor+=n*n;
  assert(check(M,target),"source matrix constraints");const P=perm(I), good=P.filter(p=>sum(I.map(i=>M[i][p[i]]))===target),goodSet=new Set(good.map(key));const conjugates=new Map();
  for(const r of P){const j=I.map(()=>-1);for(const i of I)j[r[i]]=r[n-1-i];const k=key(j);if(!conjugates.has(k))conjugates.set(k,{j,r});}
  const centralizer=2**((n-1)/2)*fact((n-1)/2);
  assert(conjugates.size*centralizer===P.length,"involution orbit");
  let combos=0;for(const p of good)for(const {j} of conjugates.values())if(goodSet.has(key(j.map(x=>p[x]))))combos++;
  const pairCount=combos*centralizer;
  const colMap=new Map(I.map(j=>[I.map(i=>M[i][j]).join(","),j]));assert(colMap.size===n,"distinct source columns");let stabilizer=0;
  for(const r of P){const cand=new Map(I.map(j=>[r.map(i=>M[i][j]).join(","),j]));if(cand.size!==n)continue;const c=I.map(j=>cand.get(I.map(i=>M[i][j]).join(",")));if(c.every(x=>x!==undefined)&&flatten(transform(M,r,c))===flatten(M))stabilizer++;}
  assert(pairCount%stabilizer===0,"orbit-stabilizer");const distinct=pairCount/stabilizer;
  const T=I.map(i=>I.map(j=>M[j][i])), d4=new Set();for(const A of [M,T])for(const r of [I,R])for(const c of [I,R]){const B=transform(A,r,c);assert(check(B,target),"D4 constraint");d4.add(flatten(B))}
  assert(flatten(transform(M,R,R))===flatten(M),"source central symmetry");const reflected=transform(M,I,R);assert(check(reflected,target)&&flatten(reflected)!==flatten(M),"explicit witness");
  let brute=null;if(n===5){const matrices=new Set();let pairs=0;for(const r of P)for(const c of P){const B=transform(M,r,c);if(check(B,target)){pairs++;matrices.add(flatten(B))}}assert(pairs===pairCount&&matrices.size===distinct,"independent n5 enumeration");brute={pairs,distinct:matrices.size}}
  output.push({field,n,target,mainDiagonalPermutations:good.length,antiDiagonalConjugates:conjugates.size,centralizer,compatibleRelativePairs:combos,pairCount,stabilizer,distinct,d4:d4.size,source:M,reflection:reflected,brute});
 }
 return {numericCount:values.length,originalChars:exact.length,alternateChars:alt.length,fields,matrices:output,totalDistinct:output.reduce((x,m)=>x*BigInt(m.distinct),1n).toString(),d4Product:output.reduce((x,m)=>x*m.d4,1)};
}
const root=path.join(__dirname,"..");
const exact=fs.readFileSync(path.join(root,"resources/cicada2014-openpuff-magic-squares.txt"),"utf8");
const html=fs.readFileSync(path.join(root,"resources/historical/cicada2014-stage10-original-form.html"),"utf8");
// Alternate pinned participant witness; pass its local text path to reproduce formatting comparison.
const alt=process.argv[2]?fs.readFileSync(process.argv[2],"utf8"):exact;
console.log(JSON.stringify(analyze(exact,alt,html),null,2));
