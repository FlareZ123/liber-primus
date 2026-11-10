"use strict";
/**
 * Original LP2 source-only finite-field gate for the two complete marked
 * three-rune spans, p3 and p39. Reconstructs p39's exact factor of the
 * 256-byte grid polynomial using p54's independently prominent Ac rune.
 * Node 22; no dependencies. No unknown plaintext/key is claimed.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const base = path.resolve(__dirname, "..");
const load = name => JSON.parse(fs.readFileSync(path.join(base,name),"utf8"));
const corpus = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const grid = load("resources/liber-primus/base60-grid.json");
const m = x => ((x%29)+29)%29;
/** @param {number} x @returns {number} */
function inv(x) {
  for(let k=1;k<29;k++) if(m(x*k)===1) return k;
  throw Error("noninvertible residue " + x);
}
/** @param {number[]} f Descending coefficients @param {number} x */
function evalPoly(f,x) { return f.reduce((a,b)=>m(a*x+b),0); }
/** @param {number[]} f Descending coefficients */
function deriv(f) {
  return f.slice(0,-1).map((v,i)=>m(v*(f.length-i-1)));
}
/** @param {number[]} f Descending coefficients @param {number} x */
function divideLinear(f,x) {
  const q=[m(f[0])];
  for(let i=1;i<f.length-1;i++) q.push(m(f[i]+x*q.at(-1)));
  return {q,remainder:m(f.at(-1)+x*q.at(-1))};
}
/** @param {number[]} a Descending coefficients @param {number[]} b Descending coefficients */
function multiply(a,b) {
  const c=Array(a.length+b.length-1).fill(0);
  for(let i=0;i<a.length;i++) for(let j=0;j<b.length;j++)
    c[i+j]=m(c[i+j]+a[i]*b[j]);
  return c;
}
/** @param {number[]} triple Ascending constant, linear, quadratic */
function disc(triple) {
  return m(triple[1]*triple[1]-4*triple[0]*triple[2]);
}
/** @param {number[]} symbols */
function ioc(symbols) {
  const f=Array(29).fill(0);
  for(const x of symbols) f[x]++;
  return f.reduce((s,v)=>s+v*(v-1),0)/(symbols.length*(symbols.length-1));
}
function run() {
  const page = n => corpus.pages.find(p=>p.page===n);
  const triads=ink.pages.flatMap(p=>(p.red_spans||[])
    .filter(s=>s.length===3)
    .map(s=>({page:p.page,start:s.start,values:[...s.runes].map(ch=>corpus.runes.indexOf(ch))})));
  assert.deepEqual(triads.map(t=>[t.page,t.start]),[[3,119],[39,119]]);
  const a=triads[0].values,b=triads[1].values;
  assert.deepEqual(a,[13,23,2]);
  assert.deepEqual(b,[27,5,15]);
  assert.deepEqual(page(3).indices.slice(119,122),a);
  assert.deepEqual(page(39).indices.slice(119,122),b);
  assert.equal(disc(a),19);
  assert.equal(disc(b),0);
  const squares=new Set(Array.from({length:29},(_,i)=>m(i*i)));
  assert(!squares.has(disc(a))); // Irreducible GP29 quadratic.
  assert.deepEqual(a.map(x=>m(x*inv(2))),[21,26,1]);
  // p3: 13+23u+2u²=2(u²-3u-8), so u²=3u+8 in GF(29²).
  const selectedRoot=m(-b[1]*inv(2*b[2]));
  assert.equal(selectedRoot,24);
  assert.equal(page(54).indices[0],24); // Oversized Ac.
  assert.deepEqual(b,[m(15*24*24),m(-2*15*24),15]);
  // p39: 27+5u+15u²=15(u-24)², as ascending-power coefficients.
  const factorDesc=[...b].reverse();
  const alphabet="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
  assert.equal(grid.alphabet,alphabet);
  const bytes=grid.byte_rows.flat();
  assert.equal(bytes.length,256);
  assert.deepEqual(grid.rows.flat().map(t=>alphabet.indexOf(t[0])*60+
    alphabet.indexOf(t[1])),bytes);
  const hash=crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  assert.equal(hash,"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const F=bytes.map(n=>n%29);
  const roots=Array.from({length:29},(_,i)=>i).filter(x=>evalPoly(F,x)===0);
  assert.deepEqual(roots,[24]);
  assert.equal(evalPoly(deriv(F),24),0);
  assert.equal(evalPoly(deriv(deriv(F)),24),23);
  const first=divideLinear(F,24),second=divideLinear(first.q,24);
  assert.deepEqual([first.remainder,second.remainder],[0,0]);
  assert.equal(second.q.length,254);
  const quotient=second.q.map(x=>m(x*inv(15)));
  assert.deepEqual(multiply(quotient,factorDesc),F); // Exact source factor.
  assert.deepEqual([page(53).indices.length,page(55).indices.length],[179,76]);
  const red=ink.pages.find(p=>p.page===53).red_spans[0];
  assert.deepEqual([red.start,red.length],[128,51]);
  assert.equal(2*(red.length+76),quotient.length);
  // Planted factor control and single-residue corruption.
  const synthetic=Array.from({length:254},(_,i)=>m(i*i+7*i+13));
  const plantedF=multiply(synthetic,factorDesc);
  const p1=divideLinear(plantedF,24),p2=divideLinear(p1.q,24);
  assert.deepEqual([p1.remainder,p2.remainder],[0,0]);
  assert.deepEqual(p2.q.map(x=>m(x*inv(15))),synthetic);
  const corruption=[...plantedF];corruption[255]=m(corruption[255]+1);
  assert.notEqual(evalPoly(corruption,24),0);
  console.log(JSON.stringify({
    classification:"Exact cross-artifact arithmetic; not an LP2 plaintext or key",
    redThreeRuneSpans:triads.map(t=>({...t,discriminant:disc(t.values)})),
    page3FieldRelation:"u²=3u+8 in GF(29²)",
    page39Factor:"27+5u+15u²=15(u-24)² mod29",
    independentlyMarkedP54Root:selectedRoot,
    gridSha256:hash,gridRoots:roots,gridSecondDerivative:23,
    divisionRemainders:[first.remainder,second.remainder],
    exactQuotientSymbols:quotient.length,
    plaintextIocOfUnkeyedQuotient:ioc(quotient),
    p53RedPlusP55SourceRunes:red.length+76,
    positiveControl:"254/254 exact",
    note:"Existing original-input pair gate excludes direct stationary 127-pair decoding"
  },null,2));
}
if(require.main===module) run();
module.exports={inv,evalPoly,deriv,divideLinear,multiply,disc};
