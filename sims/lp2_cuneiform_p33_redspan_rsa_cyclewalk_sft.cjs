"use strict";
/** LP2 cuneiform original 4-GP29 rune RSA cyclewalking SFT; Node22 CJS. */
const assert=require("node:assert/strict"), gp=require("../resources/liber-primus/lp2-corpus.json");
const pg=n=>gp.pages[n].indices;
const complete=gp.pages.slice(33,40).flatMap(p=>p.indices);
const marked=pg(33).slice(91).concat(...[34,35,36,37,38].map(pg),pg(39).slice(0,119));
assert.equal(complete.length,1680);assert.equal(marked.length,1468);
assert.deepEqual(marked,complete.slice(91,1559));
const base=29n,n=1033n*3301n,domain=29n**4n;
const e=65537n,d=3398273n;
assert.equal(n,3409933n);assert.equal(e*d%3405600n,1n);assert(domain<n);
/** @param {bigint} b @param {bigint} x */
function pow(b,x){let y=1n;for(b%=n;x>0n;x>>=1n,b=b*b%n)if(x&1n)y=y*b%n;return y;}
/** @param {bigint} v @param {bigint} exp */
function cycle(v,exp){let count=0;do{v=pow(v,exp);count++;assert(count<10000);}while(v>=domain);return [v,count];}
/** @param {number[]} xs @param {bigint} exp @param {boolean} reverse */
function apply(xs,exp,reverse){
  assert.equal(xs.length%4,0);let out=[],steps=[];
  for(let i=0;i<xs.length;i+=4){
    let row=xs.slice(i,i+4);if(reverse)row.reverse();
    const v=row.reduce((a,b)=>a*base+BigInt(b),0n);
    let [decoded,count]=cycle(v,exp);let digits=[];
    for(let j=0;j<4;j++){digits.unshift(Number(decoded%base));decoded/=base;}
    assert.equal(decoded,0n);if(reverse)digits.reverse();
    out.push(...digits);steps.push(count);
  }
  return {out,steps};
}
/** @param {number[]} a */
function ioc(a){const f=Array(29).fill(0);for(const v of a)f[v]++;return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));}
const positive=pg(57).slice(0,92);
const results=[];
for(const reverse of [false,true]){
  const plant=apply(positive,e,reverse).out;
  assert.deepEqual(apply(plant,d,reverse).out,positive);
  for(const [region,cipher] of [["red-marked 1468",marked],["entire seven-page 1680",complete]]){
    const actual=apply(cipher,d,reverse);
    assert.deepEqual(apply(actual.out,e,reverse).out,cipher);
    const value=ioc(actual.out);
    results.push({region,order:reverse?"little-first":"printed-first",ioc:value,blocks:cipher.length/4,
      first80:actual.out.slice(0,80).map(i=>gp.translit[i]).join(""),
      mean_hops:actual.steps.reduce((s,n)=>s+n,0)/actual.steps.length,
      max_hops:Math.max(...actual.steps)});
  }
}
assert.deepEqual(results.map(x=>Number(x.ioc.toFixed(10))),[0.0342493996,0.0349619955,0.0342150378,0.0342919538]);
console.log(JSON.stringify({model:"Source primes 1033 and 3301, RSA public 65537, 4-rune cyclewalk",positive92:true,new_plaintext:false,results},null,2));