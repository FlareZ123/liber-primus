'use strict';
const fs = require('node:fs');
const path = require('node:path');
/** @param {object} c Canonical LP2 corpus @param {object} g Page-local word grouping */
function experiment(c,g){
  const assert=(v,m)=>{if(!v)throw Error(m)};
  const pack=a=>a.reduce((v,d)=>v*29n+BigInt(d),0n);
  const unpack=(n,w)=>{let a=Array(w);for(let i=w-1;i>=0;i--){a[i]=Number(n%29n);n/=29n}assert(n===0n,"overflow");return a};
  const parse=s=>Array.from(s,d=>parseInt(d,29));
  const words=g.p55.groups.slice(1),all=g.p55.groups.join("");
  assert(parse(all).join(",")===c.pages[55].indices.join(","),"p55 exact match");
  const interior=words.map(w=>w.slice(1,-1)).join(""), exterior=words.map(w=>w[0]+w.at(-1)).join("");
  const N=pack(parse(interior)),E=pack(parse(exterior)),P=N/8n,e=43n,B=29n**42n;
  assert(interior.length===43&&exterior.length===32&&N%8n===0n&&E%e===0n,"source divisibility");
  assert(P===63755441409934721069036418908763882578170591536653256311514221n,"certified P");
  assert(B<P&&P<29n*B,"42-digit max");
  const inv=(a,m)=>{let r=m,t=0n,s=1n;while(a){const q=r/a;[r,a]=[a,r%a];[t,s]=[s,t-q*s]}assert(r===1n,"unit exponent");return (t%m+m)%m};
  const d=inv(e,P-1n);
  const pow=(a,k)=>{let v=1n;while(k){if(k&1n)v=v*a%P;a=a*a%P;k>>=1n}return v};
  const walk=(n,k)=>{let steps=0;do{n=pow(n,k);steps++}while(n>=B);return [n,steps]};
  function transform(a,k){assert(a.length%42===0,"partial packet");let out=[],steps=[];for(let i=0;i<a.length;i+=42){const [v,s]=walk(pack(a.slice(i,i+42)),k);out.push(...unpack(v,42));steps.push(s)}return {out,steps}}
  const cipher=c.pages.slice(33,40).flatMap(p=>p.indices);assert(cipher.length===1680,"p33-39 frame");
  const p57=c.pages[57].indices;const native=Array.from({length:1680},(_,i)=>p57[i%p57.length]);
  const eq=(a,b)=>a.join(",")===b.join(",");
  const score=a=>{let n=Array(29).fill(0);a.forEach(v=>n[v]++);let db=0;for(let i=1;i<a.length;i++)db+=+(a[i]===a[i-1]);return {ioc:n.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1)),doublets:db,preview:a.slice(0,126).map(v=>c.translit[v]).join("")}};
  const control=transform(native,e);assert(eq(transform(control.out,d).out,native),"native exact decode");
  const r=transform(cipher,d);assert(eq(transform(r.out,e).out,cipher),"original replay");
  const compare=transform(cipher,e);assert(eq(transform(compare.out,d).out,cipher),"reverse exact");
  const stats=steps=>({total:steps.reduce((s,x)=>s+x,0),max:Math.max(...steps),steps});
  return {P:P.toString(),exponent:e.toString(),inverseExponent:d.toString(),domain:B.toString(),acceptance:Number(B)/Number(P),source:{interior,exterior,N:N.toString(),E:E.toString(),pages:[33,39],runes:cipher.length,blocks:cipher.length/42},cipher:score(cipher),native:score(native),plantCipher:score(control.out),plantExact:native.length,decode:{...score(r.out),...stats(r.steps),compact:r.out.map(x=>x.toString(29)).join("")},oppositeRole:{...score(compare.out),...stats(compare.steps),compact:compare.out.map(x=>x.toString(29)).join("")},replay:true}
}
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
console.log(JSON.stringify(experiment(read('resources/liber-primus/lp2-corpus.json'),read('resources/liber-primus/lp2-page-groups-54-55-derived.json')),null,2));
