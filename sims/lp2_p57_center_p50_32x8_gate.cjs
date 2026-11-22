"use strict";
/**
 * Frozen cross-artifact receiver test for the p57 32-rune body-word center
 * vector, p50's 32x8 byte matrix, and the solved DIVINITY key.
 *
 * Run: node sims/lp2_p57_center_p50_32x8_gate.cjs
 * This does not repeat the corpus-wide recursive-core extraction; it tests
 * only the new 32x8 p50 receiver interpretations described in the report.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const corpus=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/lp2-corpus.json"),"utf8"));
const grid=JSON.parse(fs.readFileSync(path.join(root,"resources/liber-primus/base60-grid.json"),"utf8"));
const wordLengths=[7,4,2,6,7,2,2,7,2,4,4,3,3,14,4,2,8,5,3,6];
const p57=corpus.pages[57].indices;
assert.equal(p57.length,95);
assert.equal(wordLengths.reduce((a,b)=>a+b,0),95);
let at=wordLengths[0];
const centers=[];
for(const n of wordLengths.slice(1)){
  const word=p57.slice(at,at+n); at+=n;
  if(n%2) centers.push(word[Math.floor(n/2)]);
  else centers.push(word[n/2-1],word[n/2]);
}
assert.equal(at,95);
assert.equal(centers.length,32);
const divinity=[23,10,7,10,9,10,16,26]; // GP29 D I W I N I T Y
const primes=[2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];
const rows=grid.byte_rows;
assert.equal(rows.length,32);
assert.ok(rows.every(row=>row.length===8));
const mod=x=>((x%29)+29)%29;
const M=rows.map(row=>row.map(mod));
const dot=(a,b)=>mod(a.reduce((s,x,i)=>s+x*b[i],0));
const Mdivinity=M.map(row=>dot(row,divinity));
const MTcenter=Array.from({length:8},(_,j)=>mod(M.reduce((s,row,i)=>s+row[j]*centers[i],0)));
const matches=(a,b)=>a.filter((x,i)=>x===b[i]).length;
function ioc(a){
  const f=Array(29).fill(0);
  for(const x of a)f[x]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(a.length*(a.length-1));
}
const raw=M.flat();
const twoD=[];
for(const rowSign of [-1,1]){
  for(const colSign of [-1,1]){
    const out=[];
    for(let r=0;r<32;r++)for(let c=0;c<8;c++)
      out.push(mod(M[r][c]+rowSign*centers[r]+colSign*divinity[c]));
    twoD.push({rowSign,colSign,ioc:ioc(out),
      first256Translit:out.map(x=>corpus.translit[x]).join("")});
  }
}
const primeRow=centers.map(x=>primes[x]);
const asciiColumn=Buffer.from("DIVINITY","ascii");
const xorBytes=rows.flatMap((row,r)=>row.map((b,c)=>b^primeRow[r]^asciiColumn[c]));
const printable=xorBytes.filter(b=>(b>=32&&b<=126)||b===9||b===10||b===13).length/xorBytes.length;
const result={
  centerVector:{
    words:19, symbols:centers.length,
    gpIndices:centers,
    transliteration:centers.map(x=>corpus.translit[x]).join("")
  },
  columnKey:{text:"DIVINITY",gpIndices:divinity},
  p50:{rows:rows.length,columns:8,rawTableIoc:ioc(raw)},
  linearMaps:{
    M_times_DIVINITY_equals_center:{matches:matches(Mdivinity,centers),length:32,exact:Mdivinity.every((x,i)=>x===centers[i]),output:Mdivinity},
    transpose_times_center_equals_DIVINITY:{matches:matches(MTcenter,divinity),length:8,exact:MTcenter.every((x,i)=>x===divinity[i]),output:MTcenter}
  },
  twoAxisVigenere:twoD,
  bytewiseXor:{
    definition:"tableByte[r,c] XOR primeWeight(centerRune[r]) XOR ASCII(DIVINITY)[c]",
    outputBytes:xorBytes.length,printableRatio:printable,
    first32Hex:Buffer.from(xorBytes.slice(0,32)).toString("hex")
  },
  decision:"The exact 32x8 dimensional alignment does not yield a direct linear, separable additive, or row/column XOR receiver. Do not expand cipher families without a new source selector."
};
console.log(JSON.stringify(result,null,2));
