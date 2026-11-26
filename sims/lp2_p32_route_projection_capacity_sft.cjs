"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const read=p=>fs.readFileSync(path.resolve(__dirname,"..",p),"utf8").replace(/\r/g,"");
const c=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const g=JSON.parse(read("resources/liber-primus/base60-grid.json"));
const signed=read("resources/historical/cicada2016-4gq25-outguess.asc");
const p=c.pages.find(x=>x.page===32).indices,t=g.byte_rows.flat();
const symbols=c.translit.map((symbol,value)=>({symbol,value})).sort((a,b)=>b.symbol.length-a.symbol.length);
/** @param {string} w @returns {number[]} */
function gp(w){
 let n=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S"),a=[];
 while(n.length){
  if(n.startsWith("ING")){a.push(21);n=n.slice(3);continue;}
  if(n.startsWith("IO")){a.push(27);n=n.slice(2);continue;}
  const z=symbols.find(x=>n.startsWith(x.symbol));assert.ok(z);a.push(z.value);n=n.slice(z.symbol.length);
 }return a;
}
const clear=signed.match(/Hash: SHA1\n\n([\s\S]*?)\n-----BEGIN PGP SIGNATURE-----/u);
assert.ok(clear);
const words=clear[1].match(/\b[A-Za-z]+\b/g).map(w=>({w:w.toUpperCase(),sum:gp(w).reduce((a,b)=>a+b,0)}));
assert.equal(words.length,43);assert.equal(p.length,121);assert.equal(t.length,256);
/** @param {number} s @returns {number} */
const proj=s=>Math.floor(s/8)%11*11+s%8;
/** @param {number} s */
function orbit(s){const a=[];while(s>=0&&s<256&&!a.includes(s)){a.push(s);s=t[s];}return {a,terminal:s,cycle:a.indexOf(s)};}
const starts=Array.from({length:256},(_,i)=>i),all=new Set(starts.map(proj));
const seeds=[...new Set(words.map(w=>w.sum).filter(x=>x<256))];
const reachable=new Set(seeds.flatMap(s=>orbit(s).a)),signedOffsets=new Set([...reachable].map(proj));
const missing=starts.slice(0,121).filter(i=>!all.has(i)),permutable=missing.filter(i=>i>=11);
const count=new Map();for(const i of permutable)count.set(p[i],(count.get(p[i])??0)+1);
/** @param {number} n */
function fact(n){let a=1n;for(let i=2;i<=n;i++)a*=BigInt(i);return a;}
let denominator=1n;for(const n of count.values())denominator*=fact(n);
const mult=fact(permutable.length)/denominator;
assert.equal(all.size,88);assert.equal(missing.length,33);
assert.equal(seeds.length,27);assert.equal(reachable.size,100);assert.equal(signedOffsets.size,70);
assert.equal(mult,153502812391314270044160000000n);
const route=[121,237,32];
assert.deepEqual([t[35],t[39],t[121],t[237]],[39,5,237,32]);
assert.equal(words[35].w,"FOUND");assert.equal(words[39].w,"PATH");
assert.equal(words[39].sum,39);assert.equal(words[5].w,"EPIPHANY");assert.equal(words[5].sum,121);
assert.deepEqual(route.map(proj),[45,82,44]);assert.deepEqual(route.map(s=>p[proj(s)]),[17,27,21]);
const witness=[...p],i=19,j=20;
assert.notEqual(witness[i],witness[j]);[witness[i],witness[j]]=[witness[j],witness[i]];
const axes=a=>[a.slice(0,11).reduce((s,x)=>s+c.prime[x],0),Array.from({length:11},(_,i)=>a[i*11]).reduce((s,x)=>s+c.prime[x],0)];
assert.deepEqual(axes(p),[563,569]);assert.deepEqual(axes(witness),axes(p));
assert.deepEqual([...witness].sort((a,b)=>a-b),[...p].sort((a,b)=>a-b));
assert.deepEqual(starts.map(s=>witness[proj(s)]),starts.map(s=>p[proj(s)]));assert.notDeepEqual(witness,p);
console.log(JSON.stringify({seeds,reachableStates:reachable.size,signedOffsets:signedOffsets.size,allOffsets:all.size,missing,permutable,histogramPreservingTapes:String(mult),agent28:route.map(s=>({s,offset:proj(s),value:p[proj(s)]})),witness:{i,j,old:[p[i],p[j]],new:[witness[i],witness[j]],axes:axes(witness)},paths:seeds.map(s=>({s,...orbit(s),text:orbit(s).a.map(x=>c.translit[p[proj(x)]]).join(" ")}))},null,2));
