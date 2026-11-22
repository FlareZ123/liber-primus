"use strict";
/**
 * Source-constrained nonlinear fully-mixing GF(29²) bookend pair
 * candidate. Unlike the all-secret triangular S_(state,K)(C) family,
 * x -> x^e moves information across BOTH rune coordinates.
 *
 * 6 source-visible unit exponents × 9 source p50 offsets ×
 * pre/post × both paired input orders × two output lanes ×
 * two A/B maps = 864 direct original receiver readings.
 *
 * SFT: node sims/lp2_bookend_p7_gf841_fullpair_powers_864_sft.cjs
 * Windows Node22 CommonJS, original fixed sources, read-only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } =
  require("./lp2_native_gp_source_orthography_sft.cjs");

const root = path.resolve(__dirname, "..");
const load = file => fs.readFileSync(path.join(root, file), "utf8");
const lp = JSON.parse(load("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(load("resources/liber-primus/lp2-grid-256.json"));
const all = lp.pages.filter(p => p.page <= 55)
  .flatMap(p => p.indices || []);
assert.equal(all.length, 12956);
assert.equal(table.bytes.length, 256);
const A = all.slice(0, 6561), C = all.slice(6561);
assert.equal(C.length, 6395);
assert.deepEqual(A.slice(-6), C.slice(-6));
/** Canonical GF29 remainder. */
const m = x => (x % 29 + 29) % 29;
/** GF29² basis alpha²=8, the irreducible factor of p7's red quartic. */
function mul(x, y) {
  return [
    m(x[0] * y[0] + 8 * x[1] * y[1]),
    m(x[0] * y[1] + x[1] * y[0])
  ];
}
/** @param {[number,number]} x @param {number} e */
function power(x, e) {
  let y = [1,0];
  while(e > 0) {
    if(e % 2) y = mul(y, x);
    x = mul(x,x);
    e = Math.floor(e / 2);
  }
  return y;
}
/** Extended Euclidean inverse on group of units modulo 840. */
function inverseMod840(n) {
  let a = n, b = 840, t0 = 1, t1 = 0;
  while (b) {
    const q = Math.floor(a / b);
    [a, b] = [b, a - q * b];
    [t0, t1] = [t1, t0 - q * t1];
  }
  assert.equal(a, 1);
  return (t0 % 840 + 840) % 840;
}
/** Source-expressed unit exponents 11,17,19,29,331, -1 mod840. */
const exponents = [11,17,19,29,331,839];
assert.equal(new Set(exponents).size, exponents.length);
const inverseExponents = Object.fromEntries(exponents
  .map(e=>[e,inverseMod840(e)]));
/** Return the original power-map pair; zero maps zero. */
function transform(pair, exponent, shift, post) {
  const mixed = post ? pair :
    [m(pair[0] + shift[0]), m(pair[1] + shift[1])];
  const raised = power(mixed,exponent);
  return post ?
    [m(raised[0] + shift[0]),m(raised[1] + shift[1])] : raised;
}
/** Exact inverse for every of 841 field elements. */
function untransform(pair, exponent, shift, post) {
  const mixed = post ?
    [m(pair[0] - shift[0]), m(pair[1] - shift[1])] : pair;
  const raised = power(mixed,inverseExponents[exponent]);
  return post ? raised :
    [m(raised[0] - shift[0]), m(raised[1] - shift[1])];
}
/** p50 entry source chosen by original global C predecessor rune. */
function offsetAt(q, mode) {
  const high = Math.floor(q / 60),low = q % 60;
  switch(mode) {
    case "zero": return [0,0];
    case "low-real": return [m(low),0];
    case "low-imag": return [0,m(low)];
    case "both": return [m(low),m(low)];
    case "high-real": return [m(high),0];
    case "high-imag": return [0,m(high)];
    case "highlow": return [m(high),m(low)];
    case "byte-real": return [m(q),0];
    case "byte-imag": return [0,m(q)];
    default: throw Error("unknown shift");
  }
}
function mulGF81(x) {
  const d=[0,0,0,0,0];
  for(let i=0;i<4;i++){
    const u=x%3;x=Math.floor(x/3);
    d[i]+=u;d[i+1]+=u;
  }
  const high=d[4]%3;
  for(let i=0;i<3;i++)d[i]-=high;
  return d.slice(0,4).reduce((s,v,i)=>
    s+((v%3+3)%3)*3**i,0);
}
const gp81=[1];
while(gp81.length<80)gp81.push(mulGF81(gp81.at(-1)));
assert.equal(new Set(gp81).size,80);
assert.equal(mulGF81(gp81[79]),1);
const holes=new Set([2244,2384,2476,2575,2672]);
const positions=Array.from({length:6400},(_,i)=>i)
  .filter(i=>!holes.has(i));
assert.equal(positions.length,C.length);
const sources={
  field:positions.map(i=>A[
    81*gp81[Math.floor(i/80)]+gp81[i%80]
  ]),
  crop:positions.map(i=>A[
    81*(Math.floor(i/80)+1)+1+i%80
  ])
};
const bytes=C.map((_,i)=>table.bytes[(6560+i)%256]);
/** Original unigram collision index, 29-category. */
function ioc(data) {
  const hist=Array(29).fill(0);
  for(const value of data)hist[value]++;
  return hist.reduce((s,n)=>s+n*(n-1),0)
    /(data.length*(data.length-1));
}
function entropy(data) {
  const hist=Array(29).fill(0);
  for(const value of data)hist[value]++;
  return hist.reduce((s,n)=>n
    ?s-n/data.length*Math.log2(n/data.length):s,0);
}
const shiftModes=["zero","low-real","low-imag","both",
  "high-real","high-imag","highlow","byte-real","byte-imag"];
for(const exponent of exponents)for(const mode of shiftModes)
for(const q of [0,1,7,128,255])for(const post of [false,true]) {
  const shift=offsetAt(q,mode);
  // Test all 841 possible original input pairs for exact invertibility at representative physical-byte offsets,
  // including zero and negative residues through GF29 reduction.
  for(let a=0;a<29;a++)for(let b=0;b<29;b++) {
    const original=[a,b];
    const forward=transform(original,exponent,shift,post);
    assert.deepEqual(untransform(forward,exponent,shift,post),original);
  }
}
// p7 quartic factor and source α²−8=0 over the field.
const red=[11,26,8,15,2];
for(let x=0;x<29;x++) {
  const P=m(red.reduce((s,c,j)=>s+c*x**j,0));
  assert.equal(m(P-x),m(2*(x-3)*(x-4)*(x*x-8)));
}
assert.deepEqual(power([0,1],56),[1,0]);
assert.notDeepEqual(power([0,1],28),[1,0]);

const findings=[];
for(const [source,K] of Object.entries(sources))
for(const order of [0,1])
for(const exponent of exponents)
for(const shiftMode of shiftModes)
for(const post of [false,true]){
  const lanes=[new Array(C.length),new Array(C.length)];
  for(let i=0;i<C.length;i++) {
    const input=order ? [C[i],K[i]] : [K[i],C[i]];
    const shift=offsetAt(bytes[i],shiftMode);
    const result=transform(input,exponent,shift,post);
    lanes[0][i]=result[0];lanes[1][i]=result[1];
  }
  for(let lane=0;lane<2;lane++)
    findings.push({
      source,order,exponent,shiftMode,post,lane,
      ioc:ioc(lanes[lane]),entropy:entropy(lanes[lane])
    });
}
assert.equal(findings.length,864);
findings.sort((a,b)=>b.ioc-a.ioc);
assert.ok(findings.every(f=>f.ioc<0.036&&f.entropy>4.82));

// Positive complete native text plant for the full 2-channel bijection.
// The full pair inverse returns both transformed coordinates, since this
// is intentionally a full mixer and does NOT keep the source key fixed.
const donor=encodeSourceNativeGP(
  load("resources/control/gibran_prophet_58585.txt")).slice(0,C.length);
assert.equal(donor.length,C.length);
assert.ok(ioc(donor)>0.05);
const q=table.bytes;
let plants=0;
for(const exponent of exponents)for(const post of [false,true]) {
  const targetPairs=donor.map((v,i)=>[v,(i*7+4)%29]);
  const encryptedPairs=targetPairs.map((pair,i)=>
    untransform(pair,exponent,offsetAt(q[i%256],"highlow"),post));
  const decodedPairs=encryptedPairs.map((pair,i)=>
    transform(pair,exponent,offsetAt(q[i%256],"highlow"),post));
  assert.deepEqual(decodedPairs,targetPairs);
  assert.deepEqual(decodedPairs.map(x=>x[0]),donor);
  plants++;
}
console.log(JSON.stringify({
  status:"PASS",
  original:{runes:all.length,A:A.length,B:C.length,
    gridCells:table.bytes.length,bookendMatch:6,holes:[...holes]},
  sourceField:"GF(29²) with alpha²=8 from p7 P(x)-x, alpha order56",
  reversibleExponents:inverseExponents,
  candidates:findings.length,
  originalBCollision:ioc(C),
  nativeGP29ControlIoC:ioc(donor),
  best:findings.slice(0,12),
  worst:findings.at(-1),
  fullyMixedNativePositivePlants:plants,
  conclusion:"None of the source-operand GF841 nonlinear two-coordinate power-map receivers yields native GP29 prose on the exact 6395 original B runes. This is a finite, source-hypothetical gate, not an all-secret 841! exclusion."
},null,2));
