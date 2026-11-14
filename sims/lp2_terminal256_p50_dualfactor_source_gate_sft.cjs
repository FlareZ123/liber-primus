"use strict";
/**
 * Test the source-locked GF(29) [256,252] H*G parity factor on the
 * exact 256 terminal LP2 GP runes, with a full solved-p56 control.
 * Read only. Windows Node.js 22. Run: node sims/lp2_terminal256_p50_dualfactor_source_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {any} */
const json = file => JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const book = json("resources/liber-primus/lp2-corpus.json");
const grid = json("resources/liber-primus/lp2-grid-256.json").bytes.flat(Infinity);
const gp = book.translit.map((s,i)=>({s,i})).sort((a,b)=>b.s.length-a.s.length);
const mod = x => (x%29+29)%29;
/** @param {string} text @returns {number[]} */
function encode(text) {
  const out = [];
  for(const word of text.split(" ")) {
    for(let i=0;i<word.length;) {
      const item=gp.find(x=>word.startsWith(x.s,i));
      assert.ok(item,"No GP mapping for "+word.slice(i));
      out.push(item.i);
      i+=item.s.length;
    }
  }
  return out;
}
function primes(n) {
  const list=[];
  for(let x=2;list.length<n;x++)if(list.every(p=>p*p>x||x%p!==0))list.push(x);
  return list;
}
/** @param {number[]} coeff Descending polynomial coefficients
 *  @param {number[]} poly Ascending monic divisor
 *  @returns {number[]} Ascending remainder
 */
function remainder(coeff,poly) {
  const a=coeff.map(mod), d=poly.length-1;
  assert.equal(poly[d],1);
  for(let i=0;i<a.length-d;i++) {
    const v=a[i];
    for(let j=0;j<=d;j++) a[i+j]=mod(a[i+j]-v*poly[d-j]);
  }
  return a.slice(-d).reverse();
}
/** @param {number[]} left @param {number[]} right */
function multiply(left,right) {
  const out=Array(left.length+right.length-1).fill(0);
  left.forEach((x,i)=>right.forEach((y,j)=>out[i+j]=mod(out[i+j]+x*y)));
  return out;
}
/** @param {number[][]} source Augmented four-by-five matrix */
function solve(source) {
  const m=source.map(r=>r.slice());
  for(let c=0;c<4;c++) {
    const pivot=m.findIndex((r,i)=>i>=c&&r[c]!==0);
    assert.ok(pivot>=c,"independent codeword columns");
    [m[c],m[pivot]]=[m[pivot],m[c]];
    const factor=Array.from({length:28},(_,i)=>i+1).find(z=>mod(z*m[c][c])===1);
    assert.ok(factor!==undefined);
    for(let j=c;j<5;j++) m[c][j]=mod(m[c][j]*factor);
    for(let i=0;i<4;i++)if(i!==c) {
      const times=m[i][c];
      for(let j=c;j<5;j++)m[i][j]=mod(m[i][j]-times*m[c][j]);
    }
  }
  return m.map(r=>r[4]);
}
/** @param {number[]} input
 *  Replace exactly the first four unknown-page symbols with a polynomial codeword's unique parity-compliant values.
 */
function sourceShapedPlant(input,poly) {
  const blank=input.slice();
  for(let j=0;j<4;j++)blank[j]=0;
  const base=remainder(blank,poly);
  const columns=Array.from({length:4},(_,j)=>{
    const changed=blank.slice();
    changed[j]=1;
    return remainder(changed,poly).map((x,i)=>mod(x-base[i]));
  });
  const m=Array.from({length:4},(_,r)=>[...columns.map(c=>c[r]),mod(-base[r])]);
  const replacement=solve(m),recovered=blank.slice();
  for(let j=0;j<4;j++)recovered[j]=replacement[j];
  assert.deepEqual(remainder(recovered,poly),[0,0,0,0]);
  assert.deepEqual(recovered.slice(4),input.slice(4));
  return replacement;
}
function run() {
  assert.equal(grid.length,256);
  const hash=crypto.createHash("sha256").update(Buffer.from(grid)).digest("hex");
  assert.equal(hash,"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const [H,G,F]=[[11,18,1],[25,10,1],[14,9,13,28,1]];
  assert.deepEqual(multiply(H,G),F);
  const pg=n=>book.pages.find(x=>x.page===n).indices;
  const [p55,p56,p57]=[pg(55),pg(56),pg(57)];
  assert.deepEqual([p55.length,p56.length,p57.length],[76,85,95]);
  const decoded56=[];
  let clock=0;
  const ps=primes(85);
  for(let i=0;i<p56.length;i++)decoded56.push(i===56 ? 0 : mod(p56[i]-(ps[clock++]-1)));
  const known="AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
  assert.deepEqual(decoded56,encode(known));
  assert.equal(clock,84);
  const datasets=[
    ["Original base60 grid mod29",grid],
    ["Terminal 256 original GP ciphertext",p55.concat(p56,p57)],
    ["Terminal 256 with authentic solved p56 GP",p55.concat(decoded56,p57)]
  ];
  const results=datasets.map(([label,a])=>({label,length:a.length,
    H:remainder(a,H),G:remainder(a,G),HG:remainder(a,F)}));
  assert.deepEqual(results.map(x=>x.HG),[
    [0,0,0,0],[2,16,22,3],[17,12,10,6]
  ]);
  assert.deepEqual(results.map(x=>x.H),[[0,0],[6,8],[22,28]]);
  assert.deepEqual(results.map(x=>x.G),[[0,0],[28,21],[20,14]]);
  const plantOriginal=sourceShapedPlant(p55.concat(p56,p57),F);
  const plantDecoded=sourceShapedPlant(p55.concat(decoded56,p57),F);
  assert.deepEqual(plantOriginal,[21,17,23,17]);
  assert.deepEqual(plantDecoded,[19,13,3,1]);
  const summary={gridByteSHA256:hash,terminalPages:[55,56,57],
    pageRuneLengths:[76,85,95],solvedP56Exact:85,
    results,sourceShapedParityPlants:{withCipherP56:plantOriginal,withClearP56:plantDecoded},
    decision:"Both natural exact terminal readings have nonzero H and G syndromes: not a copy of the p50 [256,252] GF29 codeword family."};
  console.log(JSON.stringify(summary,null,2));
  return summary;
}
if(require.main===module)run();
module.exports={run,remainder};
