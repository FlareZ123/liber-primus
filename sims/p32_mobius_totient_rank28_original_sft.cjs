"use strict";
/**
 * Single runnable original-input test combining LP2 p32's tree-ring Mobius cycle
 * with solved p56's prime-totient clock. Node.js 22 CommonJS, zero dependencies.
 * All 12,956 unknown runes and their physical-page boundaries are preserved.
 * Two infinity representations, two state clocks, two arithmetic signs, and
 * two reserved-symbol consumption rules are the complete frozen 16-mode family.
 * No unknown plaintext or secret key is fitted.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = name => JSON.parse(fs.readFileSync(
  path.join(__dirname,"..",name),"utf8"));
const corpus=read("resources/liber-primus/lp2-corpus.json");
const pages=corpus.pages.filter(p=>p.page<=55&&p.indices.length)
  .map(p=>p.indices);
const ciphertext=pages.flat();
assert.equal(ciphertext.length,12956);
const p32=corpus.pages.find(p=>p.page===32).indices
  .map(i=>corpus.prime[i]);
assert.equal(p32.length,121);
const ring=[];
for(let c=3;c<=7;c++)ring.push(p32[33+c]);
for(let r=4;r<=7;r++)ring.push(p32[11*r+7]);
for(let c=6;c>=3;c--)ring.push(p32[77+c]);
for(let r=6;r>=4;r--)ring.push(p32[11*r+3]);
assert.equal(ring.reduce((s,n)=>s+n),1136);
assert.equal(p32.slice(0,11).reduce((s,n)=>s+n),563);
assert.equal(Array.from({length:11},(_,r)=>p32[r*11])
  .reduce((s,n)=>s+n),569);
const sums=[ring.slice(0,5),ring.slice(4,9),ring.slice(8,13),
  [...ring.slice(12),ring[0]]].map(a=>a.reduce((s,n)=>s+n));
assert.deepEqual(sums,[275,347,373,339]);
const M=sums.map(x=>x%29);
assert.deepEqual(M,[14,28,25,20]);
const mod=n=>(n%29+29)%29;
function inv(n){for(let k=1;k<29;k++)if(mod(n*k)===1)return k;
  throw Error("Bad modulus");}
/** 29 represents projective infinity. */
function apply(x){if(x===29)return mod(M[0]*inv(M[2]));
  const d=mod(M[2]*x+M[3]);
  return d===0?29:mod((M[0]*x+M[1])*inv(d));}
const orbit=[0];
for(let i=1;i<28;i++)orbit.push(apply(orbit[i-1]));
assert.equal(apply(orbit[27]),0);
assert.equal(new Set(orbit).size,28);
assert.ok(orbit.includes(29));
assert.deepEqual([apply(20),apply(25)],[20,25]);
// Generate the first 13,000 primes, whose phi values are the p56 clock.
const isComposite=new Uint8Array(250000),prime=[];
for(let p=2;p<isComposite.length&&prime.length<13000;p++){
  if(isComposite[p])continue;
  prime.push(p);
  if(p*p<isComposite.length)
    for(let q=p*p;q<isComposite.length;q+=p)isComposite[q]=1;
}
assert.equal(prime.length,13000);
function ioc(values){
  const h=new Uint32Array(29);
  for(const x of values)h[x]++;
  return h.reduce((s,n)=>s+n*(n-1),0)/(values.length*(values.length-1));
}
/**
 * @typedef {{replace:20|25,reset:"book"|"page",sign:-1|1,skip:boolean}} Mode
 * @param {Mode} cfg
 */
function makeCodec(cfg){
  const reserved=cfg.replace===20?25:20;
  const states=orbit.map(x=>x===29?cfg.replace:x);
  const pos=new Map(states.map((x,i)=>[x,i]));
  const alphabet=Array.from({length:28},(_,i)=>i).filter(i=>i!==reserved);
  assert.equal(alphabet.length,27);
  assert.ok(pos.has(22));
  /** @param {number[]} values @param {boolean} decoding */
  function run(values,decoding){
    assert.equal(values.length,ciphertext.length);
    let prev=22,clock=0,index=0;
    const out=[];
    for(const page of pages){
      if(cfg.reset==="page"){prev=22;clock=0;}
      for(let j=0;j<page.length;j++){
        const v=values[index++], key=(prime[clock]-1)%28;
        let p,c;
        if(decoding){
          c=v;
          if(c===reserved)p=reserved;
          else{
            const step=(pos.get(c)-pos.get(prev)+28)%28;
            const label=(step-cfg.sign*key+56)%28;
            p=label===0?28:alphabet[label-1];
            prev=c;
          }
        }else{
          p=v;
          if(p===reserved)c=reserved;
          else{
            const label=p===28?0:alphabet.indexOf(p)+1;
            const step=(label+cfg.sign*key+56)%28;
            c=states[(pos.get(prev)+step)%28];
            prev=c;
          }
        }
        out.push(decoding?p:c);
        if(p!==reserved||!cfg.skip)clock++;
      }
    }
    return out;
  }
  return {encode:p=>run(p,false),decode:c=>run(c,true)};
}
const latin=read("resources/control/latin-vulgate-heldout-gp.json").runes;
assert.equal(latin.length,2400);
const control=Array.from({length:ciphertext.length},(_,i)=>latin[i%latin.length]);
assert.ok(ioc(control)>0.06);
const results=[];
for(const replace of [20,25])for(const reset of ["book","page"])
for(const sign of [-1,1])for(const skip of [false,true]){
  const cfg={replace,reset,sign,skip};
  const codec=makeCodec(cfg),plaintext=codec.decode(ciphertext);
  assert.deepEqual(codec.encode(plaintext),ciphertext);
  assert.deepEqual(codec.decode(codec.encode(control)),control);
  results.push({...cfg,ioc:ioc(plaintext),
    prefix:plaintext.slice(0,50).map(x=>corpus.translit[x]).join("")});
}
assert.equal(results.length,16);
results.sort((a,b)=>b.ioc-a.ioc);
assert.ok(results[0].ioc<0.04);
console.log(JSON.stringify({source:"p32 11x11 tree ring + p56 phi(prime)",
  originalRunes:ciphertext.length,inputIoC:ioc(ciphertext),
  plantedControlIoC:ioc(control),fullOriginalRoundtrips:16,
  plantedExactRecovery:16,
  decodedIoCRange:[results.at(-1).ioc,results[0].ioc],
  result:"All sixteen direct original inversions remain uniform-like; no plaintext",
  results},null,2));
