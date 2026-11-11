"use strict";
/**
 * Source-selected finite Reed-Solomon interpretation of the original LP2
 * 32x8 printed table, p3 primitive quadratic, terminal 76/180 page split.
 *
 * Original data rather than synthetic manuscript is the decision input.
 * The only positive control is a planted degree<180 polynomial over GF(29^2).
 *
 * Run: node sims/terminal_76_180_rs_field841_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {decryptTotient} = require("./solved_cipher_regression.cjs");

/** @typedef {[number,number]} Element */
/** @param {string} file @returns {any} */
const load = (file) => JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", file), "utf8"));
/** @param {number} n @returns {number} */
const mod = (n) => ((n % 29) + 29) % 29;
/** @param {Element} a @param {Element} b @returns {Element} */
const add = (a, b) => [mod(a[0]+b[0]),mod(a[1]+b[1])];
/** @param {Element} a @param {Element} b @returns {Element} */
const sub = (a, b) => [mod(a[0]-b[0]),mod(a[1]-b[1])];
/** @param {Element} a @param {Element} b @returns {Element} */
const mul = (a, b) => [
  mod(a[0]*b[0] + 8*a[1]*b[1]),
  mod(a[0]*b[1] + a[1]*b[0] + 3*a[1]*b[1])
];
const reciprocals = Array(29).fill(0);
for (let a=1; a<29; a++)
  for (let b=1; b<29; b++)
    if (mod(a*b)===1) reciprocals[a]=b;

/** @param {Element} x @returns {Element} */
function inv(x) {
  const norm=mod(x[0]*(x[0]+3*x[1])-8*x[1]*x[1]);
  assert.notEqual(norm,0,"Evaluation points must be distinct");
  const scale=reciprocals[norm];
  return [mod((x[0]+3*x[1])*scale),mod(-x[1]*scale)];
}

/**
 * Barycentric Lagrange interpolation over the full 841-element field.
 * Fixed consecutive original positions, with no fitted point permutations.
 * @param {Element[]} xs 180 known evaluation points
 * @param {Element[]} ys Their original GF(29^2) symbols
 * @param {Element[]} targets 76 withheld evaluation points
 * @returns {Element[]}
 */
function predict(xs, ys, targets) {
  assert.equal(xs.length,180);
  assert.equal(ys.length,xs.length);
  const weights=xs.map((x,j)=>{
    let w=/** @type {Element} */([1,0]);
    for(let k=0;k<xs.length;k++)if(k!==j)w=mul(w,sub(x,xs[k]));
    return inv(w);
  });
  return targets.map((x)=>{
    let numerator=/** @type {Element} */([0,0]);
    let denominator=/** @type {Element} */([0,0]);
    for(let j=0;j<xs.length;j++){
      const weight=mul(weights[j],inv(sub(x,xs[j])));
      numerator=add(numerator,mul(weight,ys[j]));
      denominator=add(denominator,weight);
    }
    return mul(numerator,inv(denominator));
  });
}

/** @param {Element[]} xs @param {Element[]} coeffs @returns {Element[]} */
function polynomial(xs, coeffs) {
  return xs.map((x)=>{
    let out=/** @type {Element} */([0,0]);
    for(const c of coeffs)out=add(mul(out,x),c);
    return out;
  });
}
/** @param {Element[]} xs @param {Element[]} ys @returns {number} */
const exactMatches = (xs,ys) => xs.filter((x,i)=>
  x[0]===ys[i][0] && x[1]===ys[i][1]).length;

function main() {
  const corpus=load("resources/liber-primus/lp2-corpus.json");
  const grid=load("resources/liber-primus/base60-grid.json");
  const ink=load("resources/liber-primus/lp2-ink-annotations.json");
  const firstTriad=ink.pages.flatMap(p=>(p.red_spans||[])
    .filter(s=>s.length===3).map(s=>[...s.runes]
      .map(r=>corpus.runes.indexOf(r))))[0];
  assert.deepEqual(firstTriad,[13,23,2]);
  // 13+23u+2u^2=0 over GF29: u^2=3u+8, and u has order840.
  const generator=/** @type {Element} */([0,1]);
  const powers=/** @type {Element[]} */([]);
  let u=/** @type {Element} */([1,0]);
  for(let i=0;i<840;i++){powers.push(u);u=mul(u,generator);}
  assert.deepEqual(u,[1,0]);
  assert.equal(new Set(powers.map(x=>x.join(","))).size,840);

  // Position i in the original 32x8 table is assigned u^i. The
  // 30x6 geometric interior gives 180 known evaluations, outer ring76.
  const interior=[],perimeter=[];
  for(let r=0;r<32;r++)for(let col=0;col<8;col++){
    const pos=r*8+col;
    (r===0||r===31||col===0||col===7?perimeter:interior).push(pos);
  }
  assert.deepEqual([perimeter.length,interior.length],[76,180]);
  const knownPoints=interior.map(i=>powers[i]);
  const withheldPoints=perimeter.map(i=>powers[i]);

  // A degree-7 original-configuration plant checks GF operations and the
  // complete positional prediction path, without touching authentic data.
  const plant=polynomial(powers,[[13,0],[23,2],[27,5],[15,0],
    [24,2],[3,1],[8,0],[1,0]]);
  const recoveredPlant=predict(knownPoints,interior.map(i=>plant[i]),
    withheldPoints);
  assert.deepEqual(recoveredPlant,perimeter.map(i=>plant[i]));

  // Natural 0..255 printed-byte embedding: byte = a + 29b.
  const table=grid.byte_rows.flat();
  assert.equal(table.length,256);
  const tableSymbols=table.map(n=>/** @type {Element} */
    ([n%29,Math.floor(n/29)]));
  const recoveredGrid=predict(knownPoints,interior.map(i=>tableSymbols[i]),
    withheldPoints);
  const gridMatches=exactMatches(recoveredGrid,
    perimeter.map(i=>tableSymbols[i]));
  assert.equal(gridMatches,0);

  // Terminal known plaintext is p56 decoded by its independently
  // authenticated prime-totient inverse, followed by plaintext p57.
  const p55=corpus.pages[55].indices;
  const p56=corpus.pages[56].indices;
  const p57=corpus.pages[57].indices;
  assert.deepEqual([p55.length,p56.length,p57.length],[76,85,95]);
  const knownPlain=[...decryptTotient(p56,new Set([56])),...p57];
  assert.equal(knownPlain.length,180);
  const gpElements=knownPlain.map(n=>/** @type {Element} */([n,0]));
  const recoveredTerminal=predict(knownPoints,gpElements,withheldPoints);
  const baseFieldCount=recoveredTerminal.filter(x=>x[1]===0).length;
  const observedMatches=exactMatches(recoveredTerminal,
    p55.map(n=>/** @type {Element} */([n,0])));
  assert.ok(baseFieldCount<10);
  assert.ok(observedMatches<4);

  // Same frozen geometry evaluated with untransformed visible p56
  // ciphertext, to separate published decryption from transcription.
  const recoveredVisible=predict(knownPoints,
    [...p56,...p57].map(n=>/** @type {Element} */([n,0])),
    withheldPoints);
  const visibleInBase=recoveredVisible.filter(x=>x[1]===0).length;

  console.log(JSON.stringify({
    originalSource:"LP2 p3 GF29²; 32×8 grid; final p55/56/57",
    field:"GF29[u]/(u²-3u-8), primitive generator u order840",
    shape:"256 evaluations, 180 interior observed, 76 border withheld",
    plantExact:recoveredPlant.length,
    originalGridPrediction:{matches:gridMatches,total:76,
      nonmatching:76-gridMatches,firstPredictions:recoveredGrid.slice(0,6)},
    terminalKnownPlainPrediction:{gp29Subfield:baseFieldCount,total:76,
      matchesObservedP55Cipher:observedMatches,
      firstPredictions:recoveredTerminal.slice(0,6)},
    terminalVisibleCipherComparator:{gp29Subfield:visibleInBase,total:76},
    verdict:"The source-fixed RS(256,180) GF841 interpolation does not model original terminal or printed grid data"
  },null,2));
}
if(require.main===module)main();
