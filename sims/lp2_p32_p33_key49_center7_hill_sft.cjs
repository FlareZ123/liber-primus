"use strict";
/**
 * Source-fixed KEY49 -> p32 central 7x7 determinant fingerprint and
 * bounded p33 centered7x7 Hill inverse. All calculations over GF(29).
 * Run: node sims/lp2_p32_p33_key49_center7_hill_sft.cjs
 * The 7x7 selector and marker interpretation are retrospective.
 * @module lp2_p32_p33_key49_center7_hill_sft
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const corpus=JSON.parse(fs.readFileSync(
  path.join(__dirname,"..","resources","liber-primus","lp2-corpus.json"),"utf8"));
const p=corpus.prime;
const mod=n=>(n%29+29)%29;
/** @param {number} n @returns {number} */
function inverseScalar(n) {
  for(let k=1;k<29;k++)if(n*k%29===1)return k;
  throw Error("singular modulus pivot");
}
/**
 * @param {number[][]} matrix
 * @returns {{det:number,inverse:number[][]|null}}
 */
function inverseAndDet(matrix) {
  const n=matrix.length;
  const a=matrix.map((row,i)=>[
    ...row.map(mod),...Array.from({length:n},(_,j)=>Number(i===j))
  ]);
  let det=1;
  for(let col=0;col<n;col++) {
    let row=col;while(row<n&&a[row][col]===0)row++;
    if(row===n)return {det:0,inverse:null};
    if(row!==col) {
      [a[row],a[col]]=[a[col],a[row]];
      det=mod(-det);
    }
    const pivot=a[col][col];
    det=mod(det*pivot);
    const scale=inverseScalar(pivot);
    a[col]=a[col].map(v=>mod(v*scale));
    for(let r=0;r<n;r++)if(r!==col) {
      const f=a[r][col];
      a[r]=a[r].map((v,j)=>mod(v-f*a[col][j]));
    }
  }
  return {det,inverse:a.map(row=>row.slice(n))};
}
/** @param {number[][]} a @param {number[][]} b @returns {number[][]} */
const multiply=(a,b)=>a.map(row=>b[0].map((_,j)=>
  mod(row.reduce((s,v,k)=>s+v*b[k][j],0))));
/** @param {number[][]} a @returns {number[][]} */
const transpose=a=>a.map((r,i)=>r.map((_,j)=>a[j][i]));
/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const f=Array(29).fill(0);for(const v of seq)f[v]++;
  return f.reduce((s,n)=>s+n*(n-1),0)/(seq.length*(seq.length-1));
}
/** @param {number[]} source @param {number} row @param {number} col */
const crop7=(source,row,col)=>Array.from({length:7},(_,r)=>
  Array.from({length:7},(_,c)=>source[(r+row)*11+col+c]));
function run() {
  const source=corpus.pages[32].indices;
  const p33=corpus.pages[33].indices;
  assert.equal(source.length,121);
  const body=p33.slice(10,91);assert.equal(body.length,81);
  const original=crop7(source,2,2);
  const matrixPrime=original.map(row=>row.map(v=>p[v]%29));
  const indexInfo=inverseAndDet(original);
  const primeInfo=inverseAndDet(matrixPrime);
  assert.deepEqual([indexInfo.det,primeInfo.det],[23,13]);
  assert.ok(indexInfo.inverse!==null&&primeInfo.inverse!==null);
  const matches=[];
  for(let row=0;row<=4;row++)for(let col=0;col<=4;col++) {
    const m=crop7(source,row,col);
    const d1=inverseAndDet(m).det;
    const d2=inverseAndDet(m.map(r=>r.map(v=>p[v]%29))).det;
    if(d1===23&&d2===13)matches.push([row,col]);
  }
  assert.deepEqual(matches,[[2,2]]);
  const selectedPages=corpus.pages.filter(page=>page.page<=55&&page.indices.length>=121);
  assert.equal(selectedPages.length,52);
  const samePages=selectedPages.filter(page=>{
    const m=crop7(page.indices.slice(0,121),2,2);
    return inverseAndDet(m).det===23&&
      inverseAndDet(m.map(r=>r.map(v=>p[v]%29))).det===13;
  }).map(page=>page.page);
  assert.deepEqual(samePages,[32]);

  const C=Array.from({length:7},(_,r)=>
    Array.from({length:7},(_,col)=>body[(r+1)*9+col+1]));
  const native=corpus.pages[57].indices.slice(0,49);
  assert.equal(native.length,49);
  const P=Array.from({length:7},(_,r)=>native.slice(7*r,7*r+7));
  const out=[];
  for(const [name,K,I] of [
    ["ordinal",original,indexInfo.inverse],
    ["prime",matrixPrime,primeInfo.inverse]
  ])for(const trans of [false,true])for(const side of ["left","right"]) {
    const E=trans?transpose(K):K;
    const D=trans?transpose(I):I;
    const decoded=side==="left"?multiply(D,C):multiply(C,D);
    const replay=side==="left"?multiply(E,decoded):multiply(decoded,E);
    assert.deepEqual(replay,C);
    const sample=side==="left"?multiply(E,P):multiply(P,E);
    const checked=side==="left"?multiply(D,sample):multiply(sample,D);
    assert.deepEqual(checked,P);
    const f=decoded.flat();
    out.push({sourceMode:name,transposed:trans,side,ioc:ioc(f),
      runeTranslit:f.map(i=>corpus.translit[i]).join("")});
  }
  assert.equal(out.length,8);
  assert.ok(out.every(x=>x.ioc<0.046));
  const twoSided=[];
  for(const [name,L,R] of [
    ["ordinal^-1 C prime^-1",indexInfo.inverse,primeInfo.inverse],
    ["prime^-1 C ordinal^-1",primeInfo.inverse,indexInfo.inverse]
  ]) {
    const f=multiply(multiply(L,C),R).flat();
    twoSided.push({name,ioc:ioc(f),
      runeTranslit:f.map(i=>corpus.translit[i]).join("")});
  }
  assert.deepEqual(twoSided.map(v=>v.ioc),
    [0.02806122448979592,0.03486394557823129]);
  const result={source:"original p32 central7 and p33 black81 central7",
    key49:7*7,originalGPOrdinalDet23:indexInfo.det,
    originalGPPrimeDet13:primeInfo.det,
    matchingCropping:matches,eligiblePageFirst121:52,
    pagesMatchingBothDeterminants:samePages,
    directHill:out,twoSided,nativeP57PositiveControl:49,
    originalPlaintext:"none"};
  console.log(JSON.stringify(result,null,2));
  return result;
}
if(require.main===module)run();
module.exports={run};
