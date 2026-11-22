"use strict";

/**
 * Source-p7 dot-height Shamir polynomial coefficients as GF3 LFSR taps.
 * Explicit original 120 red-word permutation conditional census and exact
 * 243-cell LFSR-addressed p8 table test on untouched p9–14 ciphertext.
 * Windows Node 22 / CommonJS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const src = JSON.parse(fs.readFileSync(path.join(
  __dirname, "..", "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const p7 = src.pages[7].indices, p8 = src.pages[8].indices;
const known = src.pages[57].indices;
const target = src.pages.slice(9, 15).flatMap(p => p.indices);
const redWords = [[23,3],[22,16,2,25],[5,7,11],[14,28],[6,28,19]];
assert.deepEqual(p7.slice(194),redWords.flat());
assert.equal(p8.length,255);
assert.equal(known.length,95);
const y=redWords.map(word=>word.reduce((p,x)=>p*x%29,1));
assert.deepEqual(y,[11,26,8,15,2]);
const horizontal=[1,2,3,4,5], vertical=[3,5,1,4,2];

/** @param {number} n @returns {number} */
function mod29(n){return(n%29+29)%29;}
/** @param {number} a @param {number} n @returns {number} */
function power(a,n){let p=1;for(let i=0;i<n;i++)p=mod29(p*a);return p;}
/** @param {number} n @returns {number} */
function inverse(n){assert(n%29!==0);return power(mod29(n),27);}

/**
 * Unique GF29 polynomial coefficient vector in increasing power order.
 * @param {number[]} x
 * @param {number[]} values
 * @returns {number[]}
 */
function interpolate(x,values){
  const a=x.map((v,i)=>[1,2,3,4].reduce((row,j)=>[...row,power(v,j)], [1]).concat(values[i]));
  for(let k=0;k<5;k++){
    let pivot=k;while(pivot<5&&a[pivot][k]===0)pivot++;
    assert(pivot<5);
    [a[k],a[pivot]]=[a[pivot],a[k]];
    const inv=inverse(a[k][k]);
    a[k]=a[k].map(v=>mod29(v*inv));
    for(let j=0;j<5;j++){
      if(j===k)continue;
      const t=a[j][k];
      a[j]=a[j].map((v,i)=>mod29(v-t*a[k][i]));
    }
  }
  return a.map(row=>row[5]);
}
const hPoly=interpolate(horizontal,y), vPoly=interpolate(vertical,y);
assert.deepEqual(hPoly,[5,6,23,26,9]);
assert.deepEqual(vPoly,[23,18,21,22,11]);
const vTaps=vPoly.map(v=>v%3),hTaps=hPoly.map(v=>v%3);
assert.deepEqual(vTaps,[2,0,0,1,2]);

/** @param {number[]} tap @returns {number|null} */
function period(tap){
  let s=[1,0,0,0,0];
  for(let i=1;i<=243;i++){
    s=[...s.slice(1),tap.reduce((v,c,j)=>v+c*s[j],0)%3];
    if(s.join("")==="10000")return i;
  }
  return null;
}
assert.equal(period(vTaps),242);
assert.equal(period(hTaps),12);
assert.equal(period(y.map(z=>z%3)),242);

/** @param {number[]} a @returns {number[][]} */
function permutations(a){
  if(a.length===0)return [[]];
  const out=[];
  for(let i=0;i<a.length;i++){
    for(const tail of permutations([...a.slice(0,i),...a.slice(i+1)])){
      out.push([a[i],...tail]);
    }
  }
  return out;
}
const census={n:0, verticalPrimitive:0,horizontalPrimitive:0,rawProductPrimitive:0,
  bothVerticalAndProductPrimitive:0, bothHistoricalConstants:0};
for(const yy of permutations(y)){
  const vv=interpolate(vertical,yy), hh=interpolate(horizontal,yy);
  const v242=period(vv.map(z=>z%3))===242;
  const h242=period(hh.map(z=>z%3))===242;
  const product242=period(yy.map(z=>z%3))===242;
  census.n++;
  if(v242)census.verticalPrimitive++;
  if(h242)census.horizontalPrimitive++;
  if(product242)census.rawProductPrimitive++;
  if(v242&&product242)census.bothVerticalAndProductPrimitive++;
  if(vv[0]===23&&hh[0]===5)census.bothHistoricalConstants++;
}
assert.deepEqual(census,{n:120,verticalPrimitive:12,horizontalPrimitive:12,
  rawProductPrimitive:48,bothVerticalAndProductPrimitive:4,
  bothHistoricalConstants:1});

/** @param {number[]} seed @param {number[]} tap @returns {number[]} */
function deBruijnStates(seed,tap){
  let state=seed.slice(),s=[];
  for(let i=0;i<242;i++){
    s.push(state[0]);
    state=[...state.slice(1),tap.reduce((sum,a,j)=>sum+a*state[j],0)%3];
  }
  assert.deepEqual(state,seed);
  const k=s.findIndex((_,i)=>[0,1,2,3].every(d=>s[(i+d)%242]===0));
  assert(k>=0);
  const insert=(k+4)%242;
  const sequence=[...s.slice(0,insert),0,...s.slice(insert)];
  const states=sequence.map((_,i)=>
    [0,1,2,3,4].reduce((v,j)=>3*v+sequence[(i+j)%243],0));
  assert.equal(states.length,243);
  assert.equal(new Set(states).size,243);
  return states;
}
/** @param {number[]} a @returns {number} */
function ioc(a){
  const h=Array(29).fill(0);for(const x of a)h[x]++;
  return h.reduce((v,n)=>v+n*(n-1),0)/(a.length*(a.length-1));
}
/** @param {number[]} values @param {number[]} table
 * @param {boolean} primes @param {"cipher"|"plain"} driver @param {1|-1} sign
 * @param {boolean} decoding @returns {number[]}
 */
function codec(values,table,primes,driver,sign,decoding){
  const context=p8.slice(-5),out=[];
  for(const value of values){
    let address=0;
    for(const u of context.slice(-5))address=3*address+(primes?src.prime[u]%3:u%3);
    const k=table[address];
    const c=decoding?value:mod29(value+sign*k);
    const p=decoding?mod29(value-sign*k):value;
    out.push(decoding?p:c);
    context.push(driver==="cipher"?c:p);
  }
  return out;
}
const original=[];
for(const [name,seed] of [
  ["p7 products modulo3",y.map(v=>v%3)],
  ["p8 red-first5 modulo3",p8.slice(0,5).map(v=>v%3)]
]){
  const order=deBruijnStates(seed,vTaps);
  const table=Array(243);
  order.forEach((address,i)=>{table[address]=p8[12+i];});
  assert.equal(table.filter(x=>x!==undefined).length,243);
  for(const prime of [false,true])for(const sign of [-1,1])for(const driver of ["cipher","plain"]){
    const result=codec(target,table,prime,driver,sign,true);
    assert.deepEqual(codec(result,table,prime,driver,sign,false),target);
    const planted=codec(known,table,prime,driver,sign,false);
    assert.deepEqual(codec(planted,table,prime,driver,sign,true),known);
    assert(ioc(result)<0.038);
    original.push({seed:name,prime,sign,driver,IoC:+ioc(result).toFixed(8),
      solvedPlant:"95/95",originalReencryption:"1474/1474"});
  }
}
assert.equal(original.length,16);
console.log(JSON.stringify({
  source:"original p7 red five words + horizontal/vertical five-dot rank; p8 black243; p9–14 1474, solved p57",
  originalProducts:y,horizontalGF29:hPoly,verticalGF29:vPoly,
  horizontalGF3Period:period(hTaps),verticalGF3Period:period(vTaps),
  originalProductsGF3Period:period(y.map(x=>x%3)),
  conditional120PermutationCensus:census,
  originalP9P14RawIoC:+ioc(target).toFixed(8),
  verticalTableIoCRange:[Math.min(...original.map(o=>o.IoC)),Math.max(...original.map(o=>o.IoC))],
  result:"No unknown plaintext. The five-dot-derived vertical polynomial is also primitive in GF3, but the original-state GF29 lookup fails as a direct p9–14 decoder.",
  original
},null,2));
