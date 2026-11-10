"use strict";
/**
 * Exact irreducible cubic GF29 root order 12194 and secret-key-independent
 * lag-12194 GP29 additive-keystream cancellation across original LP2.
 * Node 22: node sims/grid_cubic_order12194_keyfree_sft.cjs
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p @returns {any} */
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const flat=corpus.pages.filter(p=>p.page<=55).flatMap(p=>p.indices);
assert.equal(flat.length,12956);
/** @param {number} x @returns {number} */
const mod=x=>((x%29)+29)%29;
/** Poly degree less than three, reduced modulo x³+14x²+16x+24.
 * @param {number[]} a @param {number[]} b @returns {number[]} */
function product(a,b){
  const c=[0,0,0,0,0];
  for(let i=0;i<3;i++)for(let j=0;j<3;j++)c[i+j]=mod(c[i+j]+a[i]*b[j]);
  for(let d=4;d>=3;d--){
    const v=c[d];
    for(let j=0;j<3;j++)c[d-3+j]=mod(c[d-3+j]-v*[24,16,14][j]);
  }
  return c.slice(0,3);
}
/** @param {number} e @returns {number[]} */
function power(e){
  let a=[1,0,0],b=[0,1,0];
  while(e>0){if(e%2)a=product(a,b);b=product(b,b);e=Math.floor(e/2);}
  return a;
}
const period=12194;
assert.deepEqual(power(period),[1,0,0]);
for(const divisor of [2,7,13,67])
  assert.notDeepEqual(power(period/divisor),[1,0,0]);
assert.equal(29**3-1,2*period);
const control=fs.readFileSync(path.join(root,"resources/control/shakespeare_first300k.txt"),"utf8");
const table=new Map(corpus.translit.map((v,i)=>[v,i]));
/** Source-matched original GP normalization. @param {string} input @returns {number[]} */
function gpEncode(input){
  const out=[];
  for(let word of input.toUpperCase().match(/[A-Z]+/g)||[]){
    word=word.replace(/QU/g,"CW").replace(/V/g,"U").replace(/K/g,"C").replace(/Z/g,"S");
    for(let i=0;i<word.length;){
      const pair=word.slice(i,i+2);
      if(table.has(pair)){out.push(table.get(pair));i+=2;}
      else {if(table.has(word[i]))out.push(table.get(word[i]));i++;}
    }
  }
  return out;
}
const gp=gpEncode(control);
assert(gp.length>200000);
// The additive shared-pad independent-English difference distribution.
const uni=Array(29).fill(1);
for(const x of gp.slice(0,100000))uni[x]++;
const z=uni.reduce((a,b)=>a+b,0),p=uni.map(x=>x/z);
const diff=Array(29).fill(0);
for(let d=0;d<29;d++)for(let j=0;j<29;j++)
  diff[d]+=p[j]*p[(j+d)%29];
/** Secret-state-independent cancellation statistic in nats.
 * @param {number[]} c @returns {number} */
function score(c){
  let total=0;
  for(let i=0;i+period<c.length;i++)
    total+=Math.log(29*diff[mod(c[i+period]-c[i])]);
  return total;
}
const actual=score(flat);
assert(Math.abs(actual-(-24.946221590248967))<1e-10);
/** @param {number[]} seed @param {number} length @returns {number[]} */
function stream(seed,length){
  const a=seed.slice();
  for(let i=3;i<length;i++)
    a.push(mod(-24*a[i-3]-16*a[i-2]-14*a[i-1]));
  return a;
}
const secret=stream([5,8,13],flat.length);
for(let i=0;i+period<secret.length;i++)assert.equal(secret[i],secret[i+period]);
const native=[];
for(let k=0;k<1000;k++){
  const plain=gp.slice(100000+k*50,100000+k*50+flat.length);
  assert.equal(plain.length,flat.length);
  const cipher=plain.map((x,i)=>mod(x+secret[i]));
  const recovered=cipher.map((x,i)=>mod(x-secret[i]));
  assert.deepEqual(recovered,plain);
  native.push(score(cipher));
}
const mn=Math.min(...native),mx=Math.max(...native);
assert(Math.abs(mn-(-5.862776044685888))<1e-10);
assert(actual<mn);
console.log(JSON.stringify({
 factor:"x^3+14x^2+16x+24",root_order:period,period_prime_divisors:[2,7,13,67],
 gp29_original_runes:flat.length,shared_key_pairs:flat.length-period,
 original_cancelled_difference_log_excess_nats:actual,
 native_true_secret_control:{count:native.length,minimum:mn,maximum:mx,
   median:native.slice().sort((a,b)=>a-b)[500],source_seed:[5,8,13],
   full_12956_rune_reencryption:true},
 necessary_condition:"any deterministic key from homogeneous cubic state repeats after 12194, hence cancels in GP29 additive emission",
 authentic_plaintext_or_key_recovered:false
},null,2));
