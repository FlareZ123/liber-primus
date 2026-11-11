"use strict";
/**
 * SFT: derive the original p3/p39 red rows and the p55-fold state, construct
 * a reversible GF29 matrix, and test the literal Hill3 inverse on untouched
 * p53 red/p55 terminal ciphertext. Requires Node.js 22 and repo resources.
 * Source algebra is exact; this does not establish a genuine LP2 decoder.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} p @returns {any} */
const json = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
/** @param {number} a @returns {number} */
const mod = a => ((a % 29) + 29) % 29;
const corpus = json("resources/liber-primus/lp2-corpus.json");
const ink = json("resources/liber-primus/lp2-ink-annotations.json");
const grid = json("resources/liber-primus/base60-grid.json");
const transcript = fs.readFileSync(path.join(root, "resources/lp2-transcription.txt"), "utf8").split("%");
const runeToIndex = new Map(corpus.runes.map((r, i) => [r, i]));
/** @param {number} p @returns {number[]} */
const page = p => corpus.pages.find(x => x.page === p).indices;
/** @param {number} p @returns {any} */
const annotation = p => ink.pages.find(x => x.page === p);
/** @param {number} p @returns {number[][]} */
function wordsOf(p) {
  const s = transcript[p < 50 ? p : p - 1].replace(/[\/\s]/gu, "");
  return s.split(/[-.&$§᛭⁕]/u).filter(Boolean).map(w => [...w].map(r => {
    assert.ok(runeToIndex.has(r), "Unknown original rune");
    return runeToIndex.get(r);
  }));
}
/** @param {number[]} w @returns {number} */
const gpSum = w => w.reduce((s, i) => s + corpus.prime[i], 0);
/** @param {number[]} v @returns {string} */
const text = v => v.map(i => corpus.translit[i]).join("");
/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
function mul3(a, b) {
  return a.map(row => b[0].map((_, j) => mod(row.reduce((s, x, k) => s + x * b[k][j], 0))));
}
/** @param {number[][]} m @returns {number} */
function det3(m) {
  return mod(m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])
    - m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])
    + m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]));
}
/** @param {number[][]} m @returns {number[]} */
function char3(m) {
  const trace = mod(m[0][0] + m[1][1] + m[2][2]);
  let minor = 0;
  for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)
    minor += m[i][i]*m[j][j]-m[i][j]*m[j][i];
  return [1, mod(-trace), mod(minor), mod(-det3(m))];
}
const identity=[[1,0,0],[0,1,0],[0,0,1]];
/** @param {number[][]} m @returns {number} */
function order3(m) {
  let a=identity;
  for(let n=1;n<=25000;n++){
    a=mul3(a,m);
    if(JSON.stringify(a)===JSON.stringify(identity))return n;
  }
  throw Error("Matrix order exceeds test bound");
}
/** @param {number[][]} m @returns {number[][]} */
function inv3(m) {
  const cofactor=(i,j)=>{
    const a=m.filter((_,k)=>k!==i).map(row=>row.filter((_,k)=>k!==j));
    return mod(((i+j)&1?-1:1)*(a[0][0]*a[1][1]-a[0][1]*a[1][0]));
  };
  const d=det3(m);
  assert.notEqual(d,0);
  const dinv=Array.from({length:29},(_,i)=>i).find(i=>mod(i*d)===1);
  return identity.map((r,i)=>r.map((_,j)=>mod(cofactor(j,i)*dinv)));
}
/** @typedef {[number,number]} Field */
/** @param {Field} a @param {Field} b @returns {Field} */
const mulField=([a,b],[c,d])=>[mod(a*c+8*b*d),mod(a*d+b*c+3*b*d)];
/** @param {Field} a @param {number} n @returns {Field} */
function powField(a,n){
  let p=/** @type {Field} */([1,0]);
  while(n>0){
    if(n%2)p=mulField(p,a);
    a=mulField(a,a);
    n=Math.floor(n/2);
  }
  return p;
}
/** @param {Field} a @returns {number[]} */
const traceNorm=([a,b])=>[mod(2*a+3*b),mod(a*(a+3*b)-8*b*b)];
/** @param {number[]} x @param {number[][]} m @returns {number[]} */
function transform(x,m){
  assert.equal(x.length%3,0);
  const out=[];
  for(let i=0;i<x.length;i+=3){
    const block=x.slice(i,i+3);
    for(const row of m)out.push(mod(row.reduce((s,n,j)=>s+n*block[j],0)));
  }
  return out;
}
/** @param {number[]} x @returns {number} */
function ioc(x){
  const f=Array(29).fill(0);
  for(const v of x)f[v]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(x.length*(x.length-1));
}
function main(){
  const triad=p=>{
    const span=annotation(p).red_spans.find(s=>s.start===119&&s.length===3);
    assert.ok(span,"Three-rune red span missing");
    return page(p).slice(119,122);
  };
  const a=triad(3), b=triad(39);
  assert.deepEqual(a,[13,23,2]);
  assert.deepEqual(b,[27,5,15]);
  assert.deepEqual(b.map((x,i)=>mod(x-(i===1?21:0))),
    a.map((x,i)=>mod(22*mod(x-(i===0?21:0)))));
  const w55=wordsOf(55);
  assert.deepEqual(w55.map(w=>w.length),[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]);
  assert.deepEqual([gpSum(w55[2]),gpSum(w55[14]),gpSum(w55[8])],[114,284,365]);
  assert.equal(wordsOf(32).length,22);
  const totals=[gpSum(w55[2])+gpSum(w55[14]),398-wordsOf(32).length,gpSum(w55[8])];
  assert.deepEqual(totals,[398,376,365]);
  assert.deepEqual(totals.map(n=>[n%58,Math.floor(n/58)]),[[50,6],[28,6],[17,6]]);
  assert.equal(text(wordsOf(28)[6]),"NG");
  assert.equal(text(wordsOf(17)[6]),"NGAELOEIEOY");
  assert.deepEqual([gpSum(wordsOf(28)[6]),gpSum(wordsOf(17)[6])],[79,511]);
  const tokens=grid.rows.flat();
  assert.equal(tokens.length,256);
  assert.deepEqual([tokens[83],tokens[86]],["3D","1p"]);
  const d60=grid.alphabet,d59=d60.replace("f","");
  assert.deepEqual([d60.length,d59.length],[60,59]);
  const decode=(token,alphabet)=>alphabet.indexOf(token[0])*alphabet.length+alphabet.indexOf(token[1]);
  assert.deepEqual([decode("1p",d60),decode("1p",d59)],[111,109]);
  const row60=[mod(decode("1p",d60)),mod(79),mod(511)];
  const row59=[mod(decode("1p",d59)),mod(79),mod(511)];
  assert.deepEqual(row60,[24,21,18]);
  assert.deepEqual(row59,[22,21,18]);
  const M=[a,b,row60],N=[a,b,row59];
  assert.deepEqual(char3(M),[1,22,14,28]);
  assert.deepEqual(char3(N),[1,22,18,2]);
  assert.deepEqual([det3(M),order3(M)],[1,840]);
  assert.deepEqual([det3(N),order3(N)],[27,84]);
  const u83=powField([0,1],83),u727=powField([0,1],727);
  assert.deepEqual([u83,u727],[[18,22],[26,7]]);
  assert.deepEqual(traceNorm(u83),[15,18]);
  assert.deepEqual(traceNorm(u727),[15,18]);
  assert.deepEqual(powField([0,1],840),[1,0]);
  const inverse=inv3(M);
  assert.deepEqual(inverse,[[7,5,16],[19,12,4],[12,18,24]]);
  assert.deepEqual(mul3(M,inverse),identity);
  const red=annotation(53).red_spans.find(s=>s.start===128&&s.length===51);
  assert.ok(red);
  const inputs={p53_red51:page(53).slice(128,179),p55_tail75:page(55).slice(1)};
  const actual={};
  for(const [name,x] of Object.entries(inputs)){
    const y=transform(x,inverse);
    assert.deepEqual(transform(y,M),x);
    actual[name]={length:x.length,decoded:text(y),raw_ioc:ioc(x),decoded_ioc:ioc(y)};
  }
  const solved=page(57).slice(7,82);
  assert.equal(solved.length,75);
  assert.deepEqual(transform(transform(solved,M),inverse),solved);
  console.log(JSON.stringify({red_rows:[a,b],fold_totals:totals,
    radix60:{row:row60,charpoly:char3(M),det:det3(M),order:order3(M)},
    radix59:{row:row59,charpoly:char3(N),det:det3(N),order:order3(N)},
    field:{u83,u727,trace_norm:traceNorm(u83)},
    original_direct_Hill3:actual,known_plaintext_plant:"75/75 restored",
    status:"Exact source-algebraic bridge, no recovered unknown LP2 plaintext"},null,2));
}
main();
