"use strict";
/**
 * Recover all 180 interior known-plaintext key symbols from the printed
 * 32x8 LP2 table and terminal solved pp56–57. Test exact all-secret linear
 * complexity over GF(29) and GF(2^8), including row-reset LFSRs.
 *
 * Source and operation hypotheses are conditional; this does not identify
 * an authentic plaintext/key. Run: node sims/terminal_interior_knownplain_lfsr_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p */
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const corpus = read("resources/liber-primus/lp2-corpus.json");
const grid = read("resources/liber-primus/base60-grid.json").byte_rows;
assert.equal(grid.length,32);
assert(grid.every(row=>row.length===8));
const inner = grid.slice(1,31).flatMap(row=>row.slice(1,7));
assert.equal(inner.length,180);
const p56 = corpus.pages.find(p=>p.page===56);
const p57 = corpus.pages.find(p=>p.page===57);
assert.equal(p56.indices.length,85);
assert.equal(p57.indices.length,95);
assert.equal(p57.status,"solved");
const expectedP56 = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
/** GP longest-token parsing, retaining historical EUERY/SEEC spelling. */
const tokens = corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
const knownP56 = [];
for (const word of expectedP56.split(" ")) {
  for (let i=0;i<word.length;) {
    const found=tokens.find(entry=>word.startsWith(entry.token,i));
    assert(found,"Unrecognized GP token in "+word.slice(i));
    knownP56.push(found.index);
    i+=found.token.length;
  }
}
assert.equal(knownP56.length,85);
const known = knownP56.concat(p57.indices);
const visible = p56.indices.concat(p57.indices);
assert.equal(known.length,180);
assert.equal(visible.length,180);
const mod29 = x=>((x%29)+29)%29;
/** @param {number} a @param {number} b @returns {number} */
function mul256(a,b) {
  let out=0;
  for (let i=0;i<8;i++) {
    if (b&1) out^=a;
    a<<=1;
    if (a&256) a^=0x11b;
    b>>=1;
  }
  return out;
}
/** @param {number} a @param {number} exponent @returns {number} */
function pow256(a,exponent) {
  let out=1;
  while(exponent>0) {
    if (exponent&1) out=mul256(out,a);
    a=mul256(a,a);
    exponent>>=1;
  }
  return out;
}
/** @typedef {{name:string,add:(a:number,b:number)=>number,sub:(a:number,b:number)=>number,mul:(a:number,b:number)=>number,inv:(a:number)=>number}} Field */
const f29 = {
  name:"GF29",add:(a,b)=>mod29(a+b),sub:(a,b)=>mod29(a-b),
  mul:(a,b)=>mod29(a*b),inv:a=>{
    assert(a>0&&a<29);
    for(let k=1;k<29;k++) if(mod29(a*k)===1)return k;
    throw Error("not invertible");
  }
};
const f256 = {
  name:"GF256",add:(a,b)=>a^b,sub:(a,b)=>a^b,
  mul:mul256,inv:a=>{assert(a>0&&a<256);return pow256(a,254);}
};
for(let a=1;a<29;a++)assert.equal(f29.mul(a,f29.inv(a)),1);
for(let a=1;a<256;a++)assert.equal(f256.mul(a,f256.inv(a)),1);
/**
 * Berlekamp–Massey on a field. L is the exact minimal stationary
 * homogeneous recurrence degree for the supplied finite sequence.
 * @param {number[]} v @param {Field} f
 * @returns {number}
 */
function complexity(v,f) {
  let C=[1],B=[1],L=0,m=1,b=1;
  for(let n=0;n<v.length;n++) {
    let d=v[n];
    for(let j=1;j<=L;j++) d=f.add(d,f.mul(C[j],v[n-j]));
    if(d===0){m++;continue;}
    const old=C.slice(),coef=f.mul(d,f.inv(b));
    while(C.length<B.length+m)C.push(0);
    for(let j=0;j<B.length;j++)C[j+m]=f.sub(C[j+m],f.mul(coef,B[j]));
    if(2*L<=n){L=n+1-L;B=old;b=d;m=1;}else m++;
  }
  return L;
}
/**
 * Solve 5 stationary feedback coefficients from first five complete
 * interior rows, then test only the sixth key element in each of the
 * 25 untouched interior rows. Each row may have 5 independent seeds.
 * @param {number[]} v @param {Field} f
 */
function rowGate(v,f) {
  assert.equal(v.length,180);
  const rows=Array.from({length:30},(_,i)=>v.slice(6*i,6*i+6));
  const features=rows.map(row=>row.slice(0,5).reverse());
  const matrix=features.slice(0,5).map((row,i)=>[...row,rows[i][5]]);
  for(let col=0;col<5;col++) {
    let pivot=col;
    while(pivot<5&&matrix[pivot][col]===0)pivot++;
    assert(pivot<5,"Original first five rows must be independent");
    [matrix[col],matrix[pivot]]=[matrix[pivot],matrix[col]];
    const inv=f.inv(matrix[col][col]);
    matrix[col]=matrix[col].map(v=>f.mul(v,inv));
    for(let j=0;j<5;j++)if(j!==col) {
      const factor=matrix[j][col];
      matrix[j]=matrix[j].map((v,k)=>f.sub(v,f.mul(factor,matrix[col][k])));
    }
  }
  const taps=matrix.map(row=>row[5]);
  const predict=features.map(row=>row.reduce(
    (sum,z,i)=>f.add(sum,f.mul(z,taps[i])),0));
  let mismatches=0;
  for(let i=0;i<5;i++)assert.equal(predict[i],rows[i][5]);
  for(let i=5;i<30;i++)if(predict[i]!==rows[i][5])mismatches++;
  return {
    taps,heldout:25,mismatches,matched:25-mismatches,
    firstPrediction:predict[5],firstActual:rows[5][5]
  };
}
/**
 * Secret recurrence planted independently of target ciphertext.
 * @param {Field} f @returns {{lfsr32:number,row25:number}}
 */
function positive(f) {
  const output=Array(180).fill(0);
  let seed=f===f29?0x430f3301:0x430f3302;
  for(let i=0;i<32;i++) {
    seed^=seed<<13;
    seed^=seed>>>17;
    seed^=seed<<5;
    output[i]=f===f29?(seed>>>0)%29:(seed&255);
  }
  const triple=f===f29?[15,3,1]:[15,19,33];
  for(let i=32;i<180;i++) {
    output[i]=f.add(f.add(f.mul(triple[0],output[i-1]),
      f.mul(triple[1],output[i-3])),f.mul(triple[2],output[i-32]));
  }
  assert.equal(complexity(output,f),32);
  const raw=inner.map((_,i)=>output[i]);
  const keys=f===f29?[7,11,5,17,13]:[14,28,15,99,11];
  const rows=Array.from({length:30},(_,i)=>raw.slice(i*6,i*6+6));
  for (const row of rows) {
    row[5]=row.slice(0,5).reverse().reduce(
      (sum,z,i)=>f.add(sum,f.mul(z,keys[i])),0);
  }
  const recovered=rowGate(rows.flat(),f);
  assert.deepEqual(recovered.taps,keys);
  assert.equal(recovered.matched,25);
  return {lfsr32:32,row25:25};
}

const cases=[
  {name:"known plaintext, subtraction mod29",field:f29,values:inner.map((v,i)=>mod29(v-known[i])),L:90,miss:24},
  {name:"published runes, subtraction mod29",field:f29,values:inner.map((v,i)=>mod29(v-visible[i])),L:91,miss:24},
  {name:"known plaintext, byte XOR GP indices",field:f256,values:inner.map((v,i)=>v^known[i]),L:90,miss:25},
  {name:"published runes, byte XOR GP indices",field:f256,values:inner.map((v,i)=>v^visible[i]),L:90,miss:24}
];
const results=cases.map(item=>{
  const linearComplexity=complexity(item.values,item.field);
  const row=rowGate(item.values,item.field);
  assert.equal(linearComplexity,item.L);
  assert.equal(row.mismatches,item.miss);
  return {name:item.name,field:item.field.name,linearComplexity,row};
});
const controls={GF29:positive(f29),GF256:positive(f256)};
console.log(JSON.stringify({
  source:"LP2 32x8 grid interior 180 cells + independently solved p56/p57 180 runes",
  result:results,
  sourceTrueSynthetic:controls,
  verdict:"No stationary order <= 89/90 recurrence of compact interior stream; no common order<=5 row-reset recurrence",
  scope:"Only printed row-major peeled interior with the four explicit GP-index byte operations; no unknown LP2 plaintext recovered"
},null,2));
