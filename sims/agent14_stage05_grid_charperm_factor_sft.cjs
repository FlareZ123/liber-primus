// Source-native fixed column permutation and byte-valid pairing census, Agent14, 2026-11-27.
// Run: node sims/agent14_stage05_grid_charperm_factor_sft.cjs
"use strict";
const fs=require("fs"),path=require("path"),crypto=require("crypto");
function run(g){
 const assert=(x,msg)=>{if(!x)throw Error(msg)};
 const mod=x=>((x%29)+29)%29, H=[3,26,24],G=[27,5,15];
 const mul=(a,b)=>{const t=Array(a.length+b.length-1).fill(0);a.forEach((v,i)=>b.forEach((w,j)=>t[i+j]=mod(t[i+j]+v*w)));return t};
 const HG=mul(H,G);
 function rem(a,d){let t=a.map(mod),u=Array.from({length:29},(_,i)=>i).find(i=>mod(i*d[0])===1);while(t.length<d.length)t.unshift(0);for(let i=0;i<=t.length-d.length;i++){let q=mod(t[i]*u);for(let j=0;j<d.length;j++)t[i+j]=mod(t[i+j]-q*d[j])}return t.slice(-(d.length-1))}
 const allPerm=[];function perm(p=[],used=0){if(p.length===8){allPerm.push(p);return}for(let i=0;i<8;i++)if(!(used>>i&1))perm([...p,i],used|1<<i)}perm();
 const hist=a=>{const m=new Map();for(const x of a)m.set(x,(m.get(x)||0)+1);return m};
 const fact=n=>{let a=1n;for(let i=2;i<=n;i++)a*=BigInt(i);return a};
 const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const cipher="TL BE IE OV UT HT RE ID TS EO ST PO SO YR SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M".replace(/ /g,""),plain="TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133";
 assert(cipher.length===56&&plain.length===56,"historical lengths");
 assert(same(Array.from({length:8},(_,i)=>[0,6,2,5,1,4,3].map(j=>cipher[7*i+j]).join("")).join("").split(""),plain.split("")),"historical replay");
 const widths=[1,2,4,7,8,14,28,56], historical=widths.map(w=>{
  const sig=s=>hist(Array.from({length:w},(_,j)=>Array.from({length:56/w},(_,i)=>s[i*w+j]).join("")));
  let a=sig(cipher),b=sig(plain),exact=a.size===b.size&&[...a].every(([k,n])=>b.get(k)===n)?[...a.values()].reduce((z,n)=>z*fact(n),1n):0n;
  const types=Array.from({length:w},(_,j)=>Array.from({length:56/w},(_,i)=>{let k=i*w+j;return k<36?"L":k<52?"B":"D"}).join(""));
  const t=hist(types),ks=[...t.keys()],compat=Array.from({length:w},(_,j)=>Array.from({length:56/w},(_,i)=>cipher[i*w+j])).map(col=>ks.map((s,k)=>col.every((x,i)=>s[i]==="L"?/[A-Z]/.test(x):s[i]==="B"?/[A-Z2-7]/.test(x):/[0-9]/.test(x))?k:-1).filter(k=>k>=0)).sort((a,b)=>a.length-b.length);
  const memo=new Map();function dp(i,counts){if(i===w)return 1n;let key=i+":"+counts.join(",");if(memo.has(key))return memo.get(key);let z=0n;for(let k of compat[i])if(counts[k]){let q=counts.slice();q[k]--;z+=BigInt(counts[k])*dp(i+1,q)}memo.set(key,z);return z}
  return {width:w,exact:exact.toString(),grammar:dp(0,ks.map(k=>t.get(k))).toString()}
 });
 const pairExact=[false,true].map(rev=>{let a=hist(cipher.match(/../g).map(s=>rev?s[1]+s[0]:s)),b=hist(plain.match(/../g));return a.size===b.size&&[...a].every(([k,n])=>b.get(k)===n)});
 assert(!pairExact.some(Boolean),"pair rival");
 function analyze(rows,alph,partial=false){
  const radix=alph.length,cols=Array.from({length:16},(_,j)=>rows.map(x=>alph.indexOf(x[j])));
  assert(cols.every(col=>col.every(x=>x>=0)),"alphabet");
  const hi=cols.map((c,i)=>c.every(x=>x<=4)?i:-1).filter(i=>i>=0),lo=cols.map((c,i)=>c.some(x=>x>4)?i:-1).filter(i=>i>=0);
  assert(hi.length===8&&lo.length===8,"eight leading and eight trailing columns");
  const match=rs=>{let m=hi.map(h=>lo.map(l=>rs.every(i=>radix*cols[h][i]+cols[l][i]<=255)));return {m,ps:allPerm.filter(p=>p.every((j,i)=>m[i][j]))}};
  const all=Array.from({length:32},(_,i)=>i), full=match(all),prefix=[];
  if(partial)for(const [name,rs] of [["p49",all.slice(0,10)],["p50",all.slice(10,23)],["p51",all.slice(23)],["p49+50",all.slice(0,23)]]){let ms=match(rs).ps;prefix.push({name,count:ms.length,allRowsValid:ms.filter(p=>full.ps.some(q=>same(p,q))).length})}
  let factors=[];for(const p of full.ps){let B=rows.map((_,i)=>hi.map((h,j)=>radix*cols[h][i]+cols[lo[p[j]]][i]));
   for(const reverse of [false,true]){
    const contribution=Array.from({length:8},(_,out)=>Array.from({length:8},(_,src)=>{let a=Array(256).fill(0);B.forEach((row,i)=>a[i*8+out]=row[src]);return rem(reverse?a.reverse():a,HG)}));
    let counts={H:0,G:0,HG:0},hits=[];
    for(const q of allPerm){let v=Array(4).fill(0);q.forEach((s,i)=>contribution[i][s].forEach((x,j)=>v[j]=mod(v[j]+x)));if(rem(v,H).every(x=>x===0))counts.H++;if(rem(v,G).every(x=>x===0))counts.G++;if(v.every(x=>x===0)){counts.HG++;const rawPermutation=q.flatMap(j=>[hi[j],lo[p[j]]]);const bytes=rows.flatMap((_,i)=>q.map(j=>B[i][j]));assert(rem(reverse?bytes.slice().reverse():bytes,HG).every(x=>x===0),"direct full check");hits.push({order:q,rawPermutation})}}
    factors.push({pairing:p,reverse,counts,hits,identityRemainder:rem(reverse?B.flat().reverse():B.flat(),HG)})
   }
  }
  return {radix,highColumns:hi,lowColumns:lo,allowed:full.m.map(x=>x.map(Number)),matchings:full.ps.length,prefix,factors}
 }
 assert(g.rows.length===32&&g.rows.every(r=>r.length===8&&r.every(t=>t.length===2)),"source geometry");
 const rows=g.rows.map(r=>r.join("")),a60=analyze(rows,g.alphabet,true),a59=analyze(rows,g.alphabet.replace("f",""),true);
 const totalHits=a=>a.factors.reduce((s,x)=>s+x.counts.HG,0);
 assert(a60.matchings===1&&a59.matchings===6&&totalHits(a60)===1&&totalHits(a59)===0,"original exact census");
 const hit=a60.factors.flatMap(f=>f.hits.map(h=>({...h,reverse:f.reverse})))[0];
 assert(hit.reverse&&same(hit.rawPermutation,Array.from({length:16},(_,i)=>i)),"original unique solution");
 // Independent arbitrary codewords satisfying the same conditional H/G check, with independent byte lifts and full 16-column scrambles.
 const controls=[];
 for(let seed of [0x3301,0x1033]){
  let state=seed;const rnd=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state%n};
  let a=Array.from({length:252},()=>rnd(29)).concat([0,0,0,0]),r=rem(a,HG);
  for(let j=0;j<4;j++)a[252+j]=mod(-r[j]);
  assert(rem(a,HG).every(x=>x===0),"plant polynomial");
  const bytes=a.reverse().map(v=>v+29*rnd(Math.floor((255-v)/29)+1)),rawRows=Array.from({length:32},(_,i)=>bytes.slice(8*i,8*i+8).map(b=>g.alphabet[Math.floor(b/60)]+g.alphabet[b%60]).join(""));
  let shuffle=Array.from({length:16},(_,i)=>i);for(let i=15;i>0;i--){let j=rnd(i+1);[shuffle[i],shuffle[j]]=[shuffle[j],shuffle[i]]}
  const shuffled=rawRows.map(s=>shuffle.map(j=>s[j]).join("")),expected=Array.from({length:16},(_,i)=>shuffle.indexOf(i)),z=analyze(shuffled,g.alphabet);
  const hits=z.factors.flatMap(f=>f.hits.map(h=>({...h,reverse:f.reverse})));
  assert(hits.some(h=>h.reverse&&same(h.rawPermutation,expected)),"independent planted permutation missed");
  controls.push({seed,shuffle,expected,matchings:z.matchings,hitCount:hits.length,recovered:hits.filter(h=>h.reverse&&same(h.rawPermutation,expected)).length})
 }
 return {historical,pairExact,HG,original:[a60,a59],controls,candidateCount:2*40320*(a60.matchings+a59.matchings),rawPermutations:fact(16).toString()}
}
const g=JSON.parse(fs.readFileSync(path.join(__dirname,"../resources/liber-primus/base60-grid.json"),"utf8"));
const bytes=Buffer.from(g.rows.flat().map(t=>60*g.alphabet.indexOf(t[0])+g.alphabet.indexOf(t[1])));
if(crypto.createHash("sha256").update(bytes).digest("hex")!=="3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290")throw Error("source grid changed");
console.log(JSON.stringify(run(g),null,2));
