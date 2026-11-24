"use strict";

/**
 * LP2 p55 conditional SHED field packet + p28 DH23 public values 8 and 19.
 * Reconstructs the full large-field DH shared secret and tests the fixed
 * 43-rune GP29 serialization/subtraction receiver. Also tests the complete-
 * page 43/33 shell as a subgroup generator with p28 exponents.
 * No fitting, phase, KDF, or key search.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const p55 = data.pages.find((p) => p.page === 55).indices;
const p57 = data.pages.find((p) => p.page === 57).indices;
const expectedLengths = [1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(p55.length, 76);
assert.equal(expectedLengths.reduce((a,b)=>a+b,0), 76);
let cursor=0;
const fragments=expectedLengths.map((length)=>{const w=p55.slice(cursor,cursor+length);cursor+=length;return w;});
assert.equal(cursor,76);
assert.deepEqual(fragments[0],[21]); // incoming NG carry from p54
const words=fragments.slice(1);
const inside=words.flatMap(w=>w.slice(1,-1));
const outside32=words.flatMap(w=>[w[0],w.at(-1)]);
const outside33=[...fragments[0],...outside32];
assert.equal(words.length,16);
assert.equal(inside.length,43);
assert.equal(outside32.length,32);
assert.equal(outside33.length,33);

function mod(a,m){const r=a%m;return r<0n?r+m:r;}
function powMod(a,e,m){let r=1n;a=mod(a,m);for(;e>0n;e>>=1n){if(e&1n)r=r*a%m;a=a*a%m;}return r;}
function invMod(a,m){let t=0n,nt=1n,r=m,nr=mod(a,m);while(nr!==0n){const q=r/nr;[t,nt]=[nt,t-q*nt];[r,nr]=[nr,r-q*nr];}assert.equal(r,1n);return mod(t,m);}
function bsgs(g,h,p,order){
  const width=BigInt(Math.ceil(Math.sqrt(Number(order))));
  const table=new Map();let e=1n;
  for(let j=0n;j<width;j++){if(!table.has(e.toString()))table.set(e.toString(),j);e=e*g%p;}
  const factor=invMod(powMod(g,width,p),p);let gamma=h;
  for(let i=0n;i<=width;i++){const j=table.get(gamma.toString());if(j!==undefined){const x=i*width+j;if(x<order&&powMod(g,x,p)===h)return x;}gamma=gamma*factor%p;}
  throw new Error("no BSGS logarithm of order "+order);
}
function phPrimePower(g,h,p,M,q,e){
  const qn=BigInt(q), qPower=qn**BigInt(e);
  const g0=powMod(g,M/qPower,p), h0=powMod(h,M/qPower,p);
  const digitBase=powMod(g0,qPower/qn,p);
  let x=0n, place=1n;
  for(let i=0;i<e;i++){
    const residual=mod(h0*invMod(powMod(g0,x,p),p),p);
    const target=powMod(residual,qPower/(place*qn),p);
    const digit=bsgs(digitBase,target,p,qn);
    x+=digit*place;place*=qn;
  }
  assert.equal(powMod(g0,x,p),h0);
  return x;
}
function crtPair(a,m,b,n){
  const k=mod((b-a)*invMod(m%n,n),n);
  return [a+m*k,m*n];
}
function number29(ds){return ds.reduce((v,d)=>v*29n+BigInt(d),0n);}
function digits29(value,length){const out=Array(length).fill(0);for(let i=length-1;i>=0;i--){out[i]=Number(value%29n);value/=29n;}assert.equal(value,0n);return out;}
function ioc(xs){const c=Array(29).fill(0);for(const x of xs)c[x]++;return c.reduce((s,n)=>s+n*(n-1),0)/(xs.length*(xs.length-1));}
function render(xs){return xs.map(x=>data.translit[x]).join("");}
function decrypt(input,key,sign){return input.map((v,i)=>Number(mod(BigInt(v)+BigInt(sign)*BigInt(key[i]),29n)));}

const N=number29(inside), E32=number29(outside32), E33=number29(outside33);
assert.equal(N%8n,0n);assert.equal(E32%43n,0n);
const P=N/8n, Q=E32/43n;
assert.equal(P,63755441409934721069036418908763882578170591536653256311514221n);
assert.equal(Q,1268532719737981052966698570711268391040527137n);
assert.equal(E33,1369636156327157530854965033451154339299654501152n);
const R=101149063843788281988908603592862658065019147521n;
const M=630311729907820n;
assert.equal(P-1n,M*R);

// CADO factor-base log queries from run 45124056922 give these virtual logs
// in one common base modulo R. Their ratio removes that unknown base.
const logQ=97177182119505488787450641888952849267188113103n;
const log19=20905766984553842032252330728926955680769982593n;
const x19R=mod(log19*invMod(logQ,R),R);
const g=powMod(Q,R,P), h=powMod(19n,R,P);
const residues=[];
for(const [q,e] of [[2,2],[5,1],[41,1],[49477,1],[15535963,1]]){
  residues.push([BigInt(q)**BigInt(e),phPrimePower(g,h,P,M,q,e)]);
}
let x19M=residues[0][1], mNow=residues[0][0];
for(let i=1;i<residues.length;i++){
  const [a,m]=crtPair(x19M,mNow,residues[i][1],residues[i][0]);
  x19M=a;mNow=m;
}
assert.equal(mNow,M);
const [x19,modulus]=crtPair(x19M,M,x19R,R);
assert.equal(modulus,P-1n);
assert.equal(powMod(Q,x19,P),19n);

// Existing CADO-derived full logarithm for A=8; direct verification retained.
const x8=14347449201966638813083683299370469317053765371148427588804751n;
assert.equal(powMod(Q,x8,P),8n);
const sharedA=powMod(8n,x19,P);
const sharedB=powMod(19n,x8,P);
assert.equal(sharedA,sharedB);
const key=digits29(sharedA,43);
const minus=decrypt(inside,key,-1), plus=decrypt(inside,key,1);
assert.deepEqual(decrypt(minus,key,1),inside);
assert.deepEqual(decrypt(plus,key,-1),inside);
const positive=p57.slice(0,43);
assert.equal(positive.length,43);
assert.deepEqual(decrypt(decrypt(positive,key,1),key,-1),positive);

// Full-page 43/33 alternative: E33 has exact order (P-1)/5. Reuse the
// p28 DH23 private exponents a=6,b=15 in that source-derived subgroup.
const subgroupOrder=(P-1n)/5n;
assert.equal(powMod(E33,subgroupOrder,P),1n);
for(const q of [2n,41n,49477n,15535963n,R]) assert.notEqual(powMod(E33,subgroupOrder/q,P),1n);
const shared33=powMod(E33,90n,P);
const key33=digits29(shared33,43);
const minus33=decrypt(inside,key33,-1), plus33=decrypt(inside,key33,1);
assert.deepEqual(decrypt(minus33,key33,1),inside);
assert.deepEqual(decrypt(plus33,key33,-1),inside);

// A literal p28 g=5 transfer does not put A=8 or B=19 in its subgroup:
// 5 has order (P-1)/2, while 8,19,2 are quadratic non-residues.
assert.equal(powMod(5n,(P-1n)/2n,P),1n);
assert.equal(powMod(5n,(P-1n)/4n,P),P-1n);
for(const v of [2n,8n,19n]) assert.equal(powMod(v,(P-1n)/2n,P),P-1n);

console.log(JSON.stringify({
  source:"original p55 GP29; 16 complete printed words; p54 carry retained only in full-page branch",
  page_local_43_32:{P:P.toString(),Q:Q.toString(),x19_mod_M:x19M.toString(),x19_mod_R:x19R.toString(),x19:x19.toString(),x8:x8.toString(),shared_secret:sharedA.toString(),key_base29_digits:key.join(","),minus_ioc:ioc(minus),plus_ioc:ioc(plus),minus_readout:render(minus),plus_readout:render(plus)},
  full_page_43_33:{E33:E33.toString(),generator_order:subgroupOrder.toString(),exponents:"6,15",shared_secret:shared33.toString(),minus_ioc:ioc(minus33),plus_ioc:ioc(plus33),minus_readout:render(minus33),plus_readout:render(plus33)},
  direct_g5_transfer:{order:(P-1n)/2n+"",A8_and_B19_membership:"outside g=5 subgroup"},
  controls:{exact_forward_reencryption:true,authentic_p57_43_rune_positive:true},
  genuine_unknown_plaintext_recovered:false
},null,2));
