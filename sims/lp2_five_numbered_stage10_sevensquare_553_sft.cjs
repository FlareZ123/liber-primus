"use strict";
/**
 * Original LP2 pp36-38 numbered 553 runes (5 visible units) under the
 * authentic 2014 Stage10 order-7 sum-1033 matrix: 553 = 7*79.
 * Direct source-bound 7-block and seven-row layouts, original serial
 * and source-visible one-rune numbered interleave, raw and phi matrices.
 * This tests one natural key family; no fitted phase or unknown key.
 *
 * Run: node sims/lp2_five_numbered_stage10_sevensquare_553_sft.cjs
 * Windows-compatible, read-only, CommonJS.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash} = require("node:crypto");
const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root,p),"utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt")
 .replace(/\r\n/g,"\n").split("\n%\n");
const source = transcription.slice(36,39).join("\n");
const marks = [...source.matchAll(/(?:^|\n)([1-5])-/gu)];
assert.deepEqual(marks.map(x=>Number(x[1])),[1,2,3,4,5]);
const runeMap = new Map(gp.runes.map((x,i)=>[x,i]));
/** @param {string} s @returns {number[]} */
const runes = s => [...s].flatMap(x=>runeMap.has(x)?[runeMap.get(x)]:[]);
const units = marks.map((x,i)=>runes(source.slice(
 x.index+x[0].length,
 i===4?source.indexOf("\n&\n",x.index):marks[i+1].index)));
assert.deepEqual(units.map(x=>x.length),[139,91,98,96,129]);
const serial = units.flat();
assert.equal(serial.length,553);
assert.deepEqual(serial,[
 ...gp.pages[36].indices.slice(99),
 ...gp.pages[37].indices,
 ...gp.pages[38].indices.slice(0,186)]);
const ordered=[];
for(let col=0;col<139;col++)
 for(let j=0;j<5;j++)if(col<units[j].length)ordered.push(units[j][col]);
assert.equal(ordered.length,553);
const modulus = 29;
/** @param {number} x @returns {number} */
const mod = x => (x%modulus+modulus)%modulus;
/** @param {number} x @returns {number} */
function phi(x){
 let n=x,result=x;
 for(let p=2;p*p<=n;p++)if(n%p===0){
   while(n%p===0)n/=p;
   result-=result/p;
 }
 if(n>1)result-=result/n;
 return Math.round(result);
}
/** @param {number[][]} m @returns {number[][]} */
const transpose = m => m[0].map((_,i)=>m.map(row=>row[i]));
/** @param {number[][]} matrix @returns {number[][]} */
function inverse(matrix){
 const n=matrix.length;
 const a=matrix.map((row,i)=>row.map(mod).concat(
   Array.from({length:n},(_,j)=>Number(i===j))));
 for(let col=0;col<n;col++){
   const pivot=a.findIndex((row,i)=>i>=col&&row[col]!==0);
   assert(pivot>=col,"fixed original matrix must be invertible");
   [a[col],a[pivot]]=[a[pivot],a[col]];
   const k=Array.from({length:28},(_,i)=>i+1)
     .find(x=>mod(x*a[col][col])===1);
   assert(k!==undefined);
   a[col]=a[col].map(x=>mod(x*k));
   for(let row=0;row<n;row++)if(row!==col){
     const factor=a[row][col];
     a[row]=a[row].map((x,i)=>mod(x-factor*a[col][i]));
   }
 }
 return a.map(row=>row.slice(n));
}
/** @param {number[][]} matrix @param {number[]} v @returns {number[]} */
const apply = (matrix,v)=>matrix.map(row=>
 mod(row.reduce((s,x,j)=>s+x*v[j],0)));
/** @param {number[][]} matrix @param {number[]} input
 * @param {"adjacent"|"seven-rows-by-79"} layout @returns {number[]} */
function transform(matrix,input,layout){
 assert.equal(input.length,553);
 if(layout==="adjacent"){
   const out=[];
   for(let i=0;i<553;i+=7)out.push(...apply(matrix,input.slice(i,i+7)));
   return out;
 }
 const rows=Array.from({length:7},(_,i)=>input.slice(i*79,(i+1)*79));
 const output=Array.from({length:7},()=>Array(79));
 for(let col=0;col<79;col++){
   const v=apply(matrix,rows.map(row=>row[col]));
   for(let j=0;j<7;j++)output[j][col]=v[j];
 }
 return output.flat();
}
const squares = read("resources/cicada2014-openpuff-magic-squares.txt")
 .trim().split(/\r?\n\s*\r?\n/).map(t=>
  t.trim().split(/\r?\n/).map(row=>row.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(x=>x.length),[5,7,5]);
const square = squares[1];
assert(square.every(row=>row.reduce((s,x)=>s+x,0)===1033));
assert(Array.from({length:7},(_,i)=>square.reduce((s,row)=>s+row[i],0))
 .every(x=>x===1033));
const variants = {
 "raw":square.map(row=>row.map(mod)),
 "totient":square.map(row=>row.map(x=>mod(phi(x)))),
};
const refs=read("resources/liber-primus/lp1-plaintext-reference.txt");
const markers=[...refs.matchAll(/^###\s+(\d+)\s*$/gmu)];
const solved=markers.map((x,i)=>({
 page:Number(x[1]),
 body:refs.slice(x.index+x[0].length,
   markers[i+1]?.index??refs.length)
   .replace(/^#.*$/gmu,"").replace(/^\s*\[.*\]\s*$/gmu,"")
})).filter(x=>x.page>=1&&x.page<=16&&![4,7,8].includes(x.page));
const syllables=gp.translit.map((s,i)=>({s,i}))
 .sort((a,b)=>b.s.length-a.s.length);
/** @param {string} t @returns {number[]} */
function nativeGP(t){
 const s=t.toUpperCase().replace(/QU/gu,"CW").replace(/V/gu,"U")
  .replace(/[KQ]/gu,"C").replace(/Z/gu,"S");
 const out=[];
 for(const word of s.match(/[A-Z]+/gu)||[])
  for(let j=0;j<word.length;){
   if(word.startsWith("ING",j)){out.push(21);j+=3;continue;}
   if(word.startsWith("IO",j)){out.push(27);j+=2;continue;}
   const x=syllables.find(v=>word.startsWith(v.s,j));
   assert(x);
   out.push(x.i);j+=x.s.length;
  }
 return out;
}
const native=solved.flatMap(x=>nativeGP(x.body));
assert.equal(native.length,2797);
const plant=native.slice(0,553);
const train=native.slice(553);
const B=Array.from({length:29},()=>Array(29).fill(0));
const F=Array(29).fill(0);
for(let i=1;i<train.length;i++){B[train[i-1]][train[i]]++;F[train[i-1]]++}
/** @param {number[]} input @returns {number} */
function score(input){
 let z=0;
 for(let i=1;i<input.length;i++)z+=Math.log(
   29*(B[input[i-1]][input[i]]+0.5)/(F[input[i-1]]+14.5));
 return z/(input.length-1);
}
/** @param {number[]} input @returns {number} */
function ioc(input){
 const f=Array(29).fill(0);
 input.forEach(x=>f[x]++);
 return f.reduce((s,n)=>s+n*(n-1),0)/(input.length*(input.length-1));
}
const results=[];
for(const [name,key] of Object.entries(variants)){
 const inv=inverse(key);
 const t=transpose(key);
 const ops=[["K",key,inv],["K^-1",inv,key],
   ["K^T",t,inverse(t)],["(K^T)^-1",inverse(t),t]];
 for(const [action,A,I] of ops)
  for(const [reading,cipher] of [["original-serial",serial],
    ["one-rune-1-to-5",ordered]])
   for(const layout of ["adjacent","seven-rows-by-79"]){
    const output=transform(A,cipher,layout);
    assert.deepEqual(transform(I,output,layout),cipher);
    const encryptedPlant=transform(I,plant,layout);
    assert.deepEqual(transform(A,encryptedPlant,layout),plant);
    const laneScores=Array.from({length:7},(_,j)=>
     score(output.slice(j*79,(j+1)*79)));
    results.push({source:reading,key:name,action,layout,
      ioc:ioc(output),languageScore:score(output),
      best79:Math.max(...laneScores),
      sha256:createHash("sha256").update(Buffer.from(output)).digest("hex"),
      first35:output.slice(0,35).map(i=>gp.translit[i]).join("")});
   }
}
assert.equal(results.length,32);
assert(results.every(x=>x.languageScore<0&&x.best79<0));
const byLanguage=results.slice().sort((a,b)=>b.languageScore-a.languageScore);
const byLane=results.slice().sort((a,b)=>b.best79-a.best79);
console.log(JSON.stringify({
 original:{numberedLength:553,dimension:"7×79",sourceLabels:[1,2,3,4,5],
    original7x7Sum:1033,allOriginalRunePositionsPreserved:true},
 positive:{nativeLP1Plant:553,trainedOnDisjointLP1:true,
    plantScore:score(plant),solvedP57Score:score(gp.pages[57].indices),
    syntheticRoundtripExact:true},
 resultCount:results.length,bestFull:byLanguage[0],bestLane:byLane[0],
 fullResults:results,
 classification:"Bounded negative: original Stage10 7x7/1033 direct transforms do not recover native GP29 plaintext on the complete 553 original runes."
},null,2));
console.log("PASS: exact full 553-rune original 7x79 source-square gate.");
