"use strict";
/**
 * Authentic 2014 OpenPuff 5x5+7x7+5x5 square operators on the exact99-rune
 * LP2 p36 pre-numbered, red-ten-dot-terminated paragraph.
 *
 * A directly source-selected alternative to Vigenere is invertible matrix
 * multiplication: the 99 historical numerical square cells form three
 * consecutive GP29 matrices, and the 99 original runes form matching 5x5,
 * 7x7, 5x5 message squares. Encrypt by left or right matrix action, with
 * an independent 180-degree reversal also recorded (historical 2014 magic
 * squares are centrosymmetric). Only eight fixed reversible decoders.
 *
 * Preserve original GP29 rune count and original 20 printed word boundaries.
 * Synthetic native GP 99-rune inverse on all eight modes verifies every
 * transformation, entire original segment and historical numerical matrices.
 * No language-selected variant, secret matrix entry or tuned key.
 * Node22 read-only CommonJS SFT.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {encodeWords}=require("./lp2_difference_allletter_capacity_sft.cjs");
const ROOT=path.join(__dirname,"..");
/** @param {string} p @returns {string} */
const read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const all=corpus.pages.find(p=>p.page===36).indices, original=all.slice(0,99);
const printed=read("resources/liber-primus/lp2-transcription.txt")
 .split(/\r?\n%\r?\n/)[36];
const intro=printed.slice(0,printed.indexOf("\n1-"))
 .replace(/[\/\r\n]/g,"").split(/[-.]/).filter(Boolean);
const imap=new Map(corpus.runes.map((r,i)=>[r,i]));
const flatIntro=intro.flatMap(w=>Array.from(w).map(c=>imap.get(c)));
assert.deepEqual(original,flatIntro);
assert.equal(intro.length,20);
const lengths=intro.map(x=>x.length);
const sourceNums=read("resources/cicada2014-openpuff-magic-squares.txt").match(/\d+/g).map(Number);
assert.equal(sourceNums.length,99);
const sizes=[5,7,5], mod=x=>(x%29+29)%29;
/** @param {number[][]} A @param {number[][]} B @returns {number[][]} */
const matmul=(A,B)=>A.map(row=>B[0].map((_,j)=>mod(
 row.reduce((s,x,k)=>s+x*B[k][j],0))));
/** @param {number} n @returns {number[][]} */
const eye=n=>Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>Number(i===j)));
/** @param {number[][]} A @returns {number[][]} */
function invert(A){
 const n=A.length,aug=A.map((r,i)=>r.map(mod).concat(eye(n)[i]));
 for(let col=0;col<n;col++){
   const pivot=aug.findIndex((r,i)=>i>=col&&r[col]!==0);
   assert.ok(pivot>=col,"historical matrix singular in GF29");
   [aug[col],aug[pivot]]=[aug[pivot],aug[col]];
   let inverse=0;
   for(let k=1;k<29;k++)if(k*aug[col][col]%29===1){inverse=k;break;}
   assert.ok(inverse!==0);
   for(let j=0;j<2*n;j++)aug[col][j]=mod(aug[col][j]*inverse);
   for(let i=0;i<n;i++)if(i!==col){
     const factor=aug[i][col];
     for(let j=0;j<2*n;j++)aug[i][j]=mod(aug[i][j]-factor*aug[col][j]);
   }
 }
 const B=aug.map(x=>x.slice(n));
 assert.deepEqual(matmul(A,B),eye(n));
 assert.deepEqual(matmul(B,A),eye(n));
 return B;
}
let offset=0;
const matrices=sizes.map(n=>{
 const seq=sourceNums.slice(offset,offset+n*n).map(x=>mod(x));offset+=n*n;
 const A=Array.from({length:n},(_,i)=>seq.slice(i*n,(i+1)*n));
 return{size:n,A,inv:invert(A)};
});
assert.equal(offset,99);
const vocab=new Map();
for(const f of [
 "resources/control/gibran_prophet_58585.txt",
 "resources/control/emerson_essays_2944.txt",
 "resources/control/shakespeare_first300k.txt"
]){
 for(const w of encodeWords(read(f))){
   if(!w.length)continue;
   if(!vocab.has(w.length))vocab.set(w.length,new Set());
   vocab.get(w.length).add(w.join(","));
 }
}
/** @param {number[]} p @returns {object} */
function lexical(p){
 let pos=0,n=0,letters=0;
 const words=[];
 for(const size of lengths){
   const w=p.slice(pos,pos+size);
   if(vocab.get(size)?.has(w.join(","))){n++;letters+=size;}
   words.push(w.map(x=>corpus.translit[x]).join(""));
   pos+=size;
 }
 assert.equal(pos,99);
 const hist=Array(29).fill(0);
 for(const v of p)hist[v]++;
 const ioc=hist.reduce((s,x)=>s+x*(x-1),0)/(p.length*(p.length-1));
 return{nativeWords:n,nativeRunes:letters,ioc,
   prefix:words.slice(0,12).join(" "),text:words.join(" ")};
}
/**
 * @param {number[]} input @param {"left"|"right"} side
 * @param {"forward"|"inverse"} order
 * @param {boolean} reflected
 * @returns {number[]}
 */
function run(input,side,order,reflected){
 assert.equal(input.length,99);
 const working=reflected?input.slice().reverse():input.slice();
 const output=[];let cut=0;
 for(const {size:n,A,inv} of matrices){
   const X=Array.from({length:n},(_,i)=>working.slice(cut+i*n,cut+(i+1)*n));
   const matrix=order==="forward"?A:inv;
   const Z=side==="left"?matmul(matrix,X):matmul(X,matrix);
   output.push(...Z.flat());cut+=n*n;
 }
 assert.equal(cut,99);
 return reflected?output.reverse():output;
}
/** @returns {number[]} */
function native99(){
 return lengths.flatMap((len,i)=>{
   const choices=[...vocab.get(len)].map(s=>s.split(",").map(Number));
   assert.ok(choices.length);
   return choices[(17+i*31)%choices.length];
 });
}
function main(){
 const native=native99(),readings=[];
 for(const side of ["left","right"])
 for(const reflected of [false,true]){
   const encrypted=run(native,side,"forward",reflected);
   const recovered=run(encrypted,side,"inverse",reflected);
   assert.deepEqual(recovered,native);
   assert.equal(lexical(recovered).nativeWords,20);
   for(const order of ["forward","inverse"]){
     const p=run(original,side,order,reflected);
     readings.push({side,order,reflected,...lexical(p)});
   }
 }
 const out={
   original:{originalRuneCount:99,originalPrintedWords:20,
     historicalSquareCells:[25,49,25],
     historicalGP29MatrixSizes:[5,7,5],
     originalWordLengths:lengths},
   authenticMath:{inverseValidated:matrices.length,
     allEightNative99PlantsExact:true},
   readings,
   bestOriginalNativeWords:Math.max(...readings.map(x=>x.nativeWords)),
   decision:readings.some(x=>x.nativeWords>=14)
     ?"One complete original source-matrix inverse yields a credible candidate; re-encrypt and independently check numbered output"
     :"Original 99-rune prelude remains ciphertext-like under all eight source-exact matrix actions"
 };
 console.log(JSON.stringify(out,null,2));
 return out;
}
if(require.main===module)main();
module.exports={main,invert,run};
