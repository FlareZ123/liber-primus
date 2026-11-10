"use strict";
/**
 * SFT: lift the marked original-grid root in Z_29[u]/(u^2-3u-8),
 * emit 12,956 p-adic base29 coordinate digits, and test source-locked
 * direct GP29 additive inverses. No plaintext/key is claimed.
 *
 * node sims/lp2_grid_hensel29_inverse_sft.cjs
 */
const assert=require("node:assert/strict");
const crypto=require("node:crypto");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
/** @param {string} p */
const load=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const prime=29n;
/** @typedef {[bigint,bigint]} Pair */
/** @param {bigint} x @param {bigint} m */
const mod=(x,m)=>((x%m)+m)%m;
/** @param {Pair} a @param {Pair} b @param {bigint} m @returns {Pair} */
const mul=(a,b,m)=>[
  mod(a[0]*b[0]+8n*a[1]*b[1],m),
  mod(a[0]*b[1]+a[1]*b[0]+3n*a[1]*b[1],m)
];
/** @param {bigint} a @param {bigint} m */
function inv(a,m) {
  let x=mod(a,m),y=m,s=1n,t=0n;
  while(y!==0n){const q=x/y;[x,y]=[y,x-q*y];[s,t]=[t,s-q*t];}
  assert.equal(x,1n);
  return mod(s,m);
}
/** @param {Pair} z @param {bigint} m @returns {Pair} */
function invPair(z,m) {
  const [a,b]=z,scale=inv(mod(a*a+3n*a*b-8n*b*b,m),m);
  return [mod((a+3n*b)*scale,m),mod(-b*scale,m)];
}
/**
 * Descending polynomial and formal derivative by Horner.
 * @param {bigint[]} coeffs @param {Pair} x @param {bigint} m
 */
function jet(coeffs,x,m) {
  /** @type {Pair} */let v=[0n,0n];
  /** @type {Pair} */let d=[0n,0n];
  for(const c of coeffs){
    const a=mul(d,x,m);
    d=[mod(a[0]+v[0],m),mod(a[1]+v[1],m)];
    const b=mul(v,x,m);
    v=[mod(b[0]+c,m),b[1]];
  }
  return {v,d};
}
/** @param {bigint[]} coeffs @param {number} count */
function lift(coeffs,count) {
  /** @type {Pair} */let x=[23n,27n];
  let k=1;const checks=[];
  assert.deepEqual(jet(coeffs,x,prime).v,[0n,0n]);
  assert.notDeepEqual(jet(coeffs,x,prime).d,[0n,0n]);
  while(k<count){
    const next=Math.min(2*k,count),m=prime**BigInt(next);
    const {v,d}=jet(coeffs,x,m),delta=mul(v,invPair(d,m),m);
    x=[mod(x[0]-delta[0],m),mod(x[1]-delta[1],m)];
    assert.deepEqual(jet(coeffs,x,m).v,[0n,0n]);
    k=next;checks.push(k);
  }
  return {x,checks};
}
/** @param {Pair} x @param {number} count */
function digits(x,count){
  let [a,b]=x;const AB=[],BA=[];
  for(let i=0;i<count;i++){
    const da=Number(a%prime),db=Number(b%prime);
    AB.push(da,db);BA.push(db,da);
    a/=prime;b/=prime;
  }
  return {AB,BA};
}
/** @param {number[]} a */
function ioc(a){
  const count=Array(29).fill(0);
  for(const x of a)count[x]++;
  return count.reduce((v,n)=>v+n*(n-1),0)/(a.length*(a.length-1));
}
/**
 * @param {{indices:number[]}[]} pages @param {number[]} k
 * @param {number} sign @param {boolean} reset
 */
function step(pages,k,sign,reset){
  let n=0;const out=[];
  for(const page of pages)
    for(let i=0;i<page.indices.length;i++)
      out.push((page.indices[i]+29+sign*k[reset?i:n++])%29);
  return out;
}
/** @param {number[]} a @param {number[]} b */
const same=(a,b)=>assert.deepEqual(a,b);
function main(){
  const grid=load("resources/liber-primus/base60-grid.json");
  const corpus=load("resources/liber-primus/lp2-corpus.json");
  const ink=load("resources/liber-primus/lp2-ink-annotations.json");
  const bytes=grid.byte_rows.flat();
  assert.equal(bytes.length,256);
  const fingerprint=crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  assert.equal(fingerprint,"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const triads=ink.pages.flatMap(p=>(p.red_spans||[]).filter(s=>s.length===3)
    .map(s=>[p.page,s.start,[...s.runes].map(r=>corpus.runes.indexOf(r))]));
  assert.deepEqual(triads,[[3,119,[13,23,2]],[39,119,[27,5,15]]]);
  const P=bytes.map(BigInt);
  // The source-marked scalar root Ac=24 is double, singular,
  // and obstructed already modulo 841.
  same(jet(P,[24n,0n],841n).v,[667n,0n]);
  same(jet(P,[24n,0n],841n).d,[609n,0n]);
  // Novel independent arithmetic diagnostic at original base 256.
  const j=jet(P,[256n,0n],24389n);
  same(j.v,[11600n,0n]);same(j.d,[22765n,0n]);
  const cross=[
    Number((j.v[0]/841n)%29n),Number((j.v[0]/29n)%29n),
    Number((j.d[0]/29n)%29n),Number((j.d[0]/841n)%29n)
  ];
  same(cross,[13,23,2,27]);
  const perturbed=P.slice();perturbed[255]+=1n;
  same(jet(perturbed,[23n,27n],29n).v,[1n,0n]);
  const pages=corpus.pages.filter(p=>p.status==="unsolved");
  const original=pages.flatMap(p=>p.indices);
  assert.equal(original.length,12956);
  const count=original.length/2;
  const lifted=lift(P,count);
  const keys=digits(lifted.x,count);
  const variants=[];
  for(const order of ["AB","BA"])
    for(const sign of [-1,1])
      for(const reset of [false,true]){
        const decoded=step(pages,keys[order],sign,reset);
        let start=0;
        const decodedPages=pages.map(p=>{
          const chunk={indices:decoded.slice(start,start+p.indices.length)};
          start+=p.indices.length;return chunk;
        });
        same(step(decodedPages,keys[order],-sign,reset),original);
        variants.push({order,sign,reset,ioc:ioc(decoded),
          first60:decoded.slice(0,60).map(n=>corpus.translit[n]).join("")});
      }
  variants.sort((a,b)=>b.ioc-a.ioc);
  const p49=pages.find(p=>p.page===49);
  const p51=pages.find(p=>p.page===51);
  assert.deepEqual([p49.indices.length,p51.indices.length],[66,92]);
  const bridge=[];
  for(const sign of [-1,1])
    for(const offset of [0,66]){
      const text=p49.indices.map((v,i)=>(v+29+sign*keys.AB[i])%29)
        .concat(p51.indices.map((v,i)=>(v+29+sign*keys.AB[i+offset])%29));
      bridge.push({sign,p51Offset:offset,ioc:ioc(text)});
    }
  // Native-Cicada GP plant and inverse: exact recovery, both signs.
  const control=corpus.pages.find(p=>p.page===56).indices;
  for(const sign of [-1,1]){
    const c=control.map((v,i)=>(v+29-sign*keys.AB[i])%29);
    same(c.map((v,i)=>(v+29+sign*keys.AB[i])%29),control);
  }
  const out={
    classification:"29-adic marked-root additive original negative, no plaintext/key",
    sourceSha256:fingerprint,
    streamSha256:crypto.createHash("sha256").update(Buffer.from(keys.AB)).digest("hex"),
    singularAc24:"P(24)=667, P'(24)=609 (mod 841), no scalar lift",
    byteBaseJet:cross,root:[23,27],count,
    checkedPrecisions:lifted.checks,first64:keys.AB.slice(0,64),
    originalIoc:ioc(original),variants,bridge,
    positive:"Exact original reencryption; exact native-GP plant"
  };
  console.log(JSON.stringify(out,null,2));
}
if(require.main===module)main();
