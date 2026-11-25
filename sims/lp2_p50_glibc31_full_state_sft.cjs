"use strict";
// Exact seed-free necessary-condition test for low-byte glibc TYPE_3 output.
// The 256 p49-p51 cells are fixed original paired tokens; no ciphertext fit.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {createHash}=require("node:crypto");
const {rawRandom,selfTest}=require("./lp2_glibc215_pgp_keyskip1_sft.cjs");
const sourcePath=path.join(__dirname,"..","resources","liber-primus","lp2-grid-256.json");
const raw=fs.readFileSync(sourcePath);
const source=JSON.parse(raw.toString("utf8"));
const tokens=source.pages.flatMap(p=>p.tokens);
assert.equal(tokens.length,256);
assert.deepEqual(source.pages.map(p=>p.page),[49,50,51]);
const alphabet60=source.alphabet;
assert.equal(alphabet60.length,60);
const alphabet59=alphabet60.replace("f","");
assert.equal(alphabet59.length,59);
const radix=(alphabet,base)=>tokens.map(t=>{
  assert.equal(t.length,2);
  assert.ok(!t.includes("f"));
  const hi=alphabet.indexOf(t[0]),lo=alphabet.indexOf(t[1]);
  assert.ok(hi>=0&&lo>=0);
  return base*hi+lo;
});
const base60=radix(alphabet60,60);
const base59=radix(alphabet59,59);
assert.deepEqual(base60,source.bytes);
assert.deepEqual(base60.slice(0,8),[203,231,167,186,97,237,126,183]);
assert.deepEqual(base59.slice(0,8),[200,227,164,183,96,233,124,180]);
const rows60=Array.from({length:32},(_,i)=>base60.slice(i*8,i*8+8));
const rows59=Array.from({length:32},(_,i)=>base59.slice(i*8,i*8+8));
function order(rows,mode){
  return mode==="row"?rows.flat():
    Array.from({length:8},(_,c)=>rows.map(r=>r[c])).flat();
}
// random() returns (state[f]+state[r]) >> 1. If B is its low byte,
// B[n] = B[n-3] + B[n-31] + carry_from_discarded_bit (mod 256).
function projected(bytes){
  const matches=[],violations=[],counts={};
  for(let i=31;i<bytes.length;i++){
    const d=(bytes[i]-bytes[i-3]-bytes[i-31]+512)&255;
    counts[d]=(counts[d]||0)+1;
    const row={i,observed:bytes[i],lag3:bytes[i-3],lag31:bytes[i-31],delta:d};
    if(d===0||d===1)matches.push(row);else violations.push(row);
  }
  return {
    positions:bytes.length-31,matches:matches.length,
    violations:violations.length,deltaCounts:counts,
    firstMatches:matches.slice(0,8),firstViolations:violations.slice(0,16)
  };
}
const sourceResults={};
for(const radixName of ["base60","base59"]){
  const rows=radixName==="base60"?rows60:rows59;
  for(const mode of ["row","column"]){
    const key=radixName+"_"+mode;
    sourceResults[key]=projected(order(rows,mode));
  }
}
assert.equal(sourceResults.base60_row.matches,4);
assert.equal(sourceResults.base60_column.matches,2);
assert.equal(sourceResults.base59_row.matches,3);
assert.equal(sourceResults.base59_column.matches,2);
for(const v of Object.values(sourceResults)){
  assert.equal(v.positions,225);
  assert.equal(v.matches+v.violations,225);
  assert.ok(v.violations>=221);
}
// Check the exact TYPE_3 source implementation against known glibc vectors,
// then verify actual seeded streams (not an arbitrary recurrence plant).
const vectors=selfTest();
const seeds=[0,1,0x3301,0x12345678,0x80000000,0xffffffff];
const controls=seeds.map(seed=>{
  const next=rawRandom(seed);
  const bytes=Array.from({length:256},()=>next()&255);
  const r=projected(bytes);
  assert.equal(r.matches,225,"seed "+seed+" must satisfy all 225 exact projections");
  assert.equal(r.violations,0);
  return {seed,positions:r.positions,matches:r.matches,violations:r.violations};
});
const out={
  source:{
    blob:"2550eae357442912220e05dc51147523a61dd75a",
    sha256:createHash("sha256").update(raw).digest("hex"),
    pages:[49,50,51],tokens:tokens.length,rows:32,columns:8,
    base60First8:base60.slice(0,8),base59First8:base59.slice(0,8)
  },
  glibcSource:{
    version:"2.15",
    file:"stdlib/random_r.c",
    blob:"51a2e8c812aee78783bd6d38c1b6269d41c8e47e",
    type:3,degree:31,separation:3,warmups:310,
    output:"(state[f] + state[r]) >> 1; low byte",
    selfTest:vectors
  },
  exactNecessaryCondition:"For every n>=31, (B[n]-B[n-3]-B[n-31]) mod 256 must be 0 or 1; the carry is the AND of the two discarded LSBs.",
  sourceResults,
  actualGlibcPositiveControls:controls,
  decision:"A true TYPE_3 low-byte stream must satisfy all 225 positions. Each original radix/order reading violates at least 221; no seed or hidden state can realize any tested original reading."
};
console.log(JSON.stringify(out,null,2));
