"use strict";
const fs=require("node:fs"),path=require("node:path");

function run(grid){
const n=8,assert=(x,m)=>{if(!x)throw Error(m)};
function mul(a,b){let r=0;for(let i=0;i<8;i++){if(b&1)r^=a;const h=a&128;a=a<<1&255;if(h)a^=0x1b;b>>>=1}return r}
const inv=Array.from({length:256},(_,a)=>{for(let b=1;b<256;b++)if(mul(a,b)===1)return b;return 0});
const dot=(a,b)=>a.reduce((s,x,i)=>s^mul(x,b[i]),0);
function rref(rows,width=n){
 let a=rows.map(r=>r.slice()),pivots=[],i=0;
 for(let j=0;j<width&&i<a.length;j++){let k=a.findIndex((r,k)=>k>=i&&r[j]);if(k<0)continue;[a[i],a[k]]=[a[k],a[i]];
 const c=inv[a[i][j]];a[i]=a[i].map(x=>mul(x,c));
 for(let k=0;k<a.length;k++)if(k!==i&&a[k][j]){const m=a[k][j];a[k]=a[k].map((x,l)=>x^mul(m,a[i][l]))}
 pivots.push(j);i++
 }
 return {rank:i,pivots,a:a.slice(0,i),allRows:a}
}
function nullspace(rows){
 const r=rref(rows),basis=[];
 for(let j=0;j<n;j++)if(!r.pivots.includes(j)){let v=Array(n).fill(0);v[j]=1;for(let i=0;i<r.rank;i++)v[r.pivots[i]]=r.a[i][j];assert(rows.every(x=>dot(x,v)===0),"nullspace");basis.push(v)}
 return {...r,basis}
}
function gate(rows,affine){
 const base=affine?rows[0]:Array(n).fill(0),diff=rows.map(r=>r.map((x,i)=>x^base[i]));
 const fit=diff.slice(0,10),x=nullspace(fit);
 const checks=diff.slice(10).map((r,i)=>({row:i+10,syndrome:x.basis.map(v=>dot(r,v))}));
 return {fitRank:x.rank,pivots:x.pivots,relations:x.basis.map(v=>({coeff:v,rhs:dot(base,v)})),page50Pass:checks.slice(0,13).filter(x=>x.syndrome.every(s=>s===0)).length,page51Pass:checks.slice(13).filter(x=>x.syndrome.every(s=>s===0)).length,checks,fullRank:rref(diff).rank,rankByPrefix:Array.from({length:32},(_,i)=>rref(diff.slice(0,i+1)).rank)};
}
function recover(r,rels,erased){
 let a=rels.map(({coeff,rhs})=>{const rhs2=coeff.reduce((s,c,i)=>erased.includes(i)?s:s^mul(c,r[i]),rhs);return erased.map(i=>coeff[i]).concat(rhs2)});
 let s=rref(a,erased.length);
 if(s.allRows.some(r=>r.slice(0,erased.length).every(x=>!x)&&r.at(-1)))return {status:"inconsistent"};
 if(s.rank<erased.length)return {status:"ambiguous",rank:s.rank};
 let p=r.slice();for(let i=0;i<s.rank;i++)p[erased[s.pivots[i]]]=s.a[i].at(-1);
 return {status:"unique",row:p}
}
const tokens=grid.pages.flatMap(p=>p.tokens);
assert(grid.pages.map(p=>p.rows).join(",")==="10,13,9"&&tokens.length===256,"grid shape");
const originals=[];
for(let radix of [59,60]){
 let alphabet=radix===59?grid.alphabet.replace("f",""):grid.alphabet;
 let bytes=tokens.map(t=>radix*alphabet.indexOf(t[0])+alphabet.indexOf(t[1]));
 assert(bytes.every(x=>Number.isInteger(x)&&x>=0&&x<256),"byte range");
 if(radix===60)assert(bytes.every((x,i)=>x===grid.bytes[i]),"base60");
 let rows=Array.from({length:32},(_,i)=>bytes.slice(i*8,i*8+8));
 assert(rows.every(r=>new Set(r).size===8),"distinct row");
 originals.push({radix,homogeneous:gate(rows,false),affine:gate(rows,true)})
}
let seed=0x33012569;function rng(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0}
function randomRows(){return Array.from({length:32},()=>{let r=[];while(r.length<8){let x=rng()%256;if(!r.includes(x))r.push(x)}return r})}
const controls=[],nulls=[];
for(let affine of [false,true])for(let k of [3,5,7])for(let trial=0;trial<4;trial++){
 let G=Array.from({length:k},(_,i)=>Array.from({length:n},(_,j)=>j<k?Number(i===j):rng()%256)),shift=Array.from({length:n},()=>affine?rng()%256:0);
 let rows=[];while(rows.length<32){let d=Array.from({length:k},()=>rng()%256),r=Array.from({length:n},(_,j)=>shift[j]^d.reduce((s,x,i)=>s^mul(x,G[i][j]),0));if(new Set(r).size===8)rows.push(r)}
 const x=gate(rows,affine);assert(x.fitRank===k&&x.fullRank===k&&x.page50Pass===13&&x.page51Pass===9,"plant rank/holdout");
 const erased=Array.from({length:8-k},(_,i)=>k+i);let correct=0;
 for(let r of rows.slice(10)){let obs=r.map((x,i)=>erased.includes(i)?0:x);let p=recover(obs,x.relations,erased);assert(p.status==="unique"&&p.row.every((x,i)=>x===r[i]),"erasure");correct+=erased.length}
 controls.push({affine,k,trial,relations:x.relations.length,heldoutRows:22,correctErasedOctets:correct})
 const N=randomRows(),y=gate(N,affine);nulls.push({affine,k,trial,fitRank:y.fitRank,fullRank:y.fullRank,relations:y.relations.length})
}
return {field:"GF256 AES 0x11b",shape:[10,13,9],originals,controls,nulls}
}

console.log(JSON.stringify(run(JSON.parse(fs.readFileSync(path.join(__dirname,"..","resources/liber-primus/lp2-grid-256.json"),"utf8"))),null,2));
