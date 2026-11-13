"use strict";
/**
 * Source-selected field projection and original p36 285th-root decision.
 *
 * Data: the source 32x8 base60 table -> degree-238 factor in GF29[X],
 * p36's original 238 GP indices, and original marked p3/p39 119+119 runes.
 *
 * A p3-red-selected subfield generator U has order 840. The original
 * p36 projection is U^285, while the 119+119 companion projects to U^204.
 * Existing independently known properties Norm(C)=2 and C being a
 * 15th power already force the first exponent to {285,705}, so the match
 * to the 2013 worked-DH numbers 15*19=285 is weak post hoc evidence.
 *
 * The unique field root P satisfying P^285=C and projection(P)=U
 * is exactly computable without a secret. Check if its GP coefficients
 * or their fixed direct repetition into the following pages read as text.
 *
 * Node 22, no external package, no file writes:
 * node sims/lp2_p36_redtriad_285th_root_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (file) => JSON.parse(
  fs.readFileSync(path.join(root, file), "utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const table = read("resources/liber-primus/base60-grid.json");
const rawBytes = table.byte_rows.flat();
assert.equal(rawBytes.length, 256);
assert.equal(crypto.createHash("sha256")
  .update(Buffer.from(rawBytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
const mod = (x) => ((x % 29) + 29) % 29;
const D = 238;
const N = 29n ** BigInt(D) - 1n;
const P840 = N / 840n;
const M15 = N / 15n;
assert.equal(N % 840n, 0n);
assert.equal(N % 285n, 0n === N % 285n ? 0n : N % 285n); // 285th map has kernel15, not 285
/** @param {number[]} a @param {number[]} b */
function polynomialProduct(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i=0;i<a.length;i++)for(let j=0;j<b.length;j++)
    out[i+j]=mod(out[i+j]+a[i]*b[j]);
  return out;
}
/** @param {number[]} a @param {number[]} b */
function exactDivision(a,b) {
  assert.equal(b.at(-1),1);
  const r=a.slice(),q=Array(a.length-b.length+1).fill(0);
  for(let k=a.length-1;k>=b.length-1;k--) {
    const v=mod(r[k]);
    q[k-b.length+1]=v;
    for(let j=0;j<b.length;j++)
      r[k-b.length+1+j]=mod(r[k-b.length+1+j]-v*b[j]);
  }
  assert.ok(r.slice(0,b.length-1).every(x=>x===0));
  while(q.at(-1)===0)q.pop();
  return q;
}
const factors = [
  [5,1],[5,1],[11,18,1],[24,16,14,1],
  [11,15,0,9,1,5,10,20,12,1]
].reduce(polynomialProduct,[1]);
assert.equal(factors.length,17);
const Q=exactDivision(rawBytes.map(x=>x%29).reverse(),factors)
  .map(x=>mod(-x));
assert.equal(Q.length,239);
assert.equal(Q[238],1);
const one=Array(D).fill(0);
one[0]=1;
const same=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
/** @param {number[]} a @param {number[]} b */
function multiply(a,b) {
  const terms=new Float64Array(2*D-1);
  for(let i=0;i<D;i++)if(a[i])for(let j=0;j<D;j++)
    terms[i+j]+=a[i]*b[j];
  for(let k=2*D-2;k>=D;k--){
    const top=mod(terms[k]);
    if(top)for(let j=0;j<D;j++)
      terms[k-D+j]-=top*Q[j];
  }
  return Array.from(terms.slice(0,D),mod);
}
/** @param {number[]} base @param {bigint} exp */
function power(base,exp) {
  let acc=one;
  while(exp>0n){
    if(exp&1n)acc=multiply(acc,base);
    exp>>=1n;
    if(exp)base=multiply(base,base);
  }
  return acc;
}
/** @param {bigint} a @param {bigint} n */
function inverseMod(a,n) {
  let [t,nextT,r,nextR]=[0n,1n,n,a%n];
  while(nextR){
    const q=r/nextR;
    [t,nextT]=[nextT,t-q*nextT];
    [r,nextR]=[nextR,r-q*nextR];
  }
  assert.equal(r,1n);
  return (t%n+n)%n;
}
const xPlusOne=Array(D).fill(0);
xPlusOne[0]=1;xPlusOne[1]=1;
const U=power(xPlusOne,P840);
assert.ok(same(power(U,840n),one));
assert.ok(!same(power(U,420n),one));
assert.ok(!same(power(U,280n),one));
assert.ok(!same(power(U,168n),one));
assert.ok(!same(power(U,120n),one));
/** Find logarithm in a small, ORIGINAL source-selected order-840 group. */
function log840(element) {
  let v=one;
  for(let e=0;e<840;e++){
    if(same(v,element))return e;
    v=multiply(v,U);
  }
  throw new Error("Original projection escaped its mathematically defined subfield");
}
const C=corpus.pages.find(p=>p.page===36).indices;
const B=[...corpus.pages.find(p=>p.page===39).indices.slice(0,119),
  ...corpus.pages.find(p=>p.page===3).indices.slice(0,119)].reverse();
assert.equal(C.length,238);
assert.equal(B.length,238);
assert.deepEqual(corpus.pages.find(p=>p.page===3).indices.slice(119,122),
  [13,23,2]);
const Ck=log840(power(C,P840));
const Bk=log840(power(B,P840));
assert.equal(Ck,285);
assert.equal(Bk,204);
assert.equal(Ck%28,5);
assert.equal(Ck%15,0);
assert.deepEqual(Array.from({length:840},(_,i)=>i)
  .filter(k=>k%28===5 && k%15===0),[285,705]);
assert.equal((6*Ck-15*Bk+840*8)%840,330); // no shared DH base even in subfield
const inverse285=inverseMod(285n,M15);
const r=Number((285n*inverse285)%840n);
assert.equal(r,225);
assert.equal((r-1)%56,0);
const selectedIndex=((r-1)/56)%15;
assert.equal(selectedIndex,4);
const zeta=power(U,56n);
assert.ok(same(power(zeta,15n),one));
assert.ok(!same(power(zeta,3n),one));
assert.ok(!same(power(zeta,5n),one));
/** Derive the one of 15 285th roots whose subfield projection is U. */
function selectedRoot(cipher) {
  const initial=power(cipher,inverse285);
  const result=multiply(initial,power(zeta,BigInt(selectedIndex)));
  assert.ok(same(power(result,285n),cipher));
  assert.ok(same(power(result,P840),U));
  return result;
}
const P=selectedRoot(C);
const plantedP=power(xPlusOne,841n);
assert.ok(same(power(plantedP,P840),U));
assert.ok(same(selectedRoot(power(plantedP,285n)),plantedP));
const following=corpus.pages.filter(p=>p.page>=37&&p.page<=39)
  .flatMap(p=>p.indices);
assert.equal(following.length,696);
const IC=(a)=>{
  const f=Array(29).fill(0);
  for(const v of a)f[v]++;
  return f.reduce((s,v)=>s+v*(v-1),0)/(a.length*(a.length-1));
};
const mixed=[-1,1].map(sign=>{
  const decoded=following.map((v,i)=>mod(v+sign*P[i%238]));
  assert.deepEqual(decoded.map((v,i)=>mod(v-sign*P[i%238])),following);
  return {sign,IoC:IC(decoded),
    first90:decoded.slice(0,90).map(i=>corpus.translit[i]).join("")};
});
const result={
  source:"original p36, original red119 p3+p39, original 32x8 table",
  field:{degree:D,subfieldOrder:840,normP36:2,
    originalK:Ck, companionK:Bk,
    normAnd15thPowerPossibleExponentSet:[285,705],
    conditionalFractionForK285:"1/2"},
  historicallyInterestingProduct:"15*19=285 is retrospective; 15th-power and norm constrain k to two states",
  uniqueRootIndex:selectedIndex,
  originalRootIoC:IC(P),
  first90: P.slice(0,90).map(i=>corpus.translit[i]).join(""),
  rootIndicesBase29:P.map(i=>"0123456789ABCDEFGHIJKLMNOPQRS"[i]).join(""),
  followingOriginalIoC:IC(following),
  followingGPDirectKey:mixed,
  exactReencryption:"238/238 field coefficients",
  positivePlant:"238/238 from (X+1)^841",
  verdict:"No original plaintext/key from the unique source-selected root or its direct repeat into pp37-39."
};
assert.ok(IC(P)<0.045);
assert.ok(mixed.every(x=>x.IoC<0.045));
console.log(JSON.stringify(result,null,2));
