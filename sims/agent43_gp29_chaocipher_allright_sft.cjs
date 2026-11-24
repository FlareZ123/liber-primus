"use strict";
/**
 * GP29 two-wheel Chaocipher: fixed public ciphertext-wheel order,
 * arbitrary secret plaintext-wheel permutation, and native controls.
 * Source algorithm: https://www.chaocipher.com/ActualChaocipher/Chaocipher-Revealed-Algorithm.pdf
 * Run from repository root: node sims/agent43_gp29_chaocipher_allright_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const read=p=>fs.readFileSync(p,"utf8");
const gp=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const I=Array.from({length:29},(_,i)=>i),R=I.slice().reverse();
const K=[...new Set([...("ᛞᛁᚢᛁᚾᛁᛏᚣ")].map(x=>gp.runes.indexOf(x)))];
const keyed=a=>[...K,...a.filter(x=>!K.includes(x))];
const rotate=(a,k)=>a.slice(k).concat(a.slice(0,k));
const move=(a,from,to)=>{a.splice(to,0,a.splice(from,1)[0]);return a};
/**
 * @template T
 * @param {T[]} input
 * @param {T[]} L
 * @param {T[]} R
 * @param {number} mid
 * @param {boolean} decode
 * @returns {T[]}
 */
function chao(input,L,R,mid,decode){
 L=L.slice();R=R.slice();const out=[];
 for(const x of input){
  const j=(decode?L:R).indexOf(x);
  assert(j>=0,"unknown symbol");
  out.push((decode?R:L)[j]);
  L=move(rotate(L,j),1,mid);
  R=move(rotate(R,(j+1)%R.length),2,mid);
 }
 return out;
}
const left=[..."HXUCZVAMDSLKPEFJRIGTWOBNYQ"];
const right=[..."PTLNBQDEOYSFAVZKGJRIHWXUMC"];
const pt=[..."WELLDONEISBETTERTHANWELLSAID"];
const ct="OAHQHCNYNXTSZJRRHJBYHQKSOUJY";
assert.equal(chao(pt,left,right,13,false).join(""),ct);
assert.deepEqual(chao([...ct],left,right,13,true),pt);
const pages=gp.pages.filter(p=>p.page<=55).map(p=>p.indices),all=pages.flat();
assert.equal(all.length,12956);
const pairs=a=>{const c=I.map(()=>0);for(const x of a)c[x]++;return c.reduce((s,n)=>s+n*(n-1),0)};
const opp=a=>a.length*(a.length-1);
const ioc=a=>pairs(a)/opp(a);
const joined=a=>a.reduce((s,t)=>s+pairs(t),0)/a.reduce((s,t)=>s+opp(t),0);
const doubles=a=>a.slice(1).filter((x,i)=>x===a[i]).length;
const results=[];
for(const [name,L] of [["GP",I],["reverse GP",R],["DIUINITY+GP",keyed(I)],["DIUINITY+reverse",keyed(R)]])
 for(const mid of [14,15]){
  const d=chao(all,L,I,mid,true);
  const p=pages.map(a=>chao(a,L,I,mid,true));
  assert.deepEqual(chao(d,L,I,mid,false),all);
  p.forEach((x,i)=>assert.deepEqual(chao(x,L,I,mid,false),pages[i]));
  // Initial cyclic rotation of L changes only the arbitrary labeling of R.
  for(let k=0;k<29;k++){
   const shifted=chao(all.slice(0,262),rotate(L,k),I,mid,true);
   assert.deepEqual(shifted.map(x=>(x+k)%29),d.slice(0,262));
  }
  results.push({name,mid,continuous:ioc(d),pageResetPooled:ioc(p.flat()),
   pageResetSeparate:joined(p),first50:d.slice(0,50).map(x=>gp.translit[x]).join(" "),
   maxPage:Math.max(...p.filter(a=>a.length>1).map(ioc))});
 }
const spell=gp.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
/** @param {string} w @returns {number[]} */
function nativeWord(w){
 const s=w.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S");
 const out=[];
 for(let i=0;i<s.length;){
  if(s.startsWith("ING",i)){out.push(21);i+=3}
  else if(s.startsWith("IO",i)){out.push(27);i+=2}
  else{const z=spell.find(x=>s.startsWith(x.s,i));assert(z,w);out.push(z.i);i+=z.s.length}
 }
 return out;
}
let seed=3301;
function rng(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const donors=["resources/control/gibran_prophet_58585.txt","resources/control/emerson_essays_2944.txt","resources/control/shakespeare_first300k.txt"];
const controls=[];
for(const donor of donors){
 const native=(read(donor).match(/[A-Za-z]+/g)||[]).flatMap(nativeWord);
 assert(native.length>=all.length);
 const stats=[];
 for(let t=0;t<32;t++){
  const start=Math.floor(rng()*(native.length-all.length+1));
  const p=native.slice(start,start+all.length),L=I,R=shuffle(I),mid=t%2+14;
  const c=chao(p,L,R,mid,false),d=chao(c,L,I,mid,true);
  assert.deepEqual(d.map(i=>R[i]),p);
  // Ciphertext doublets are independent of the ciphertext wheel.
  const cOther=chao(p,rotate(I,5).reverse(),R,mid,false);
  assert.deepEqual(c.map((x,i)=>i>0&&x===c[i-1]),cOther.map((x,i)=>i>0&&x===cOther[i-1]));
  let pos=0;
  const chunks=pages.map(a=>{const q=p.slice(pos,pos+a.length);pos+=a.length;return q});
  stats.push({ioc:ioc(p),page:joined(chunks),cipherDoublets:doubles(c)});
 }
 const range=k=>[Math.min(...stats.map(x=>x[k])),Math.max(...stats.map(x=>x[k]))];
 controls.push({donor,n:native.length,ioc:range("ioc"),page:range("page"),cipherDoublets:range("cipherDoublets")});
}
const p57=gp.pages[57].indices,Rp=shuffle(I),cp=chao(p57,keyed(I),Rp,14,false);
assert.deepEqual(chao(cp,keyed(I),I,14,true).map(i=>Rp[i]),p57);
assert.equal(doubles(all),86);
assert(results.every(x=>x.continuous<0.035&&x.pageResetSeparate<0.035));
assert(controls.every(x=>x.ioc[0]>0.058&&x.page[0]>0.058&&x.cipherDoublets[0]>86));
console.log(JSON.stringify({n:all.length,originalIoc:ioc(all),originalDoublets:doubles(all),results,controls,p57Recovered:p57.length,official26:ct},null,2));
