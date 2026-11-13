"use strict";

/**
 * Source-moth p55 75-rune body, 2014 p5 5x5 Wisdom square and phi matrix:
 * one source-led invertible GP29 Hill cipher, column-vector convention.
 * Wrong-source controls: transpose and untransformed source numeric square.
 * SFT: node sims/p55_moth_wisdom_5x5_hill_sft.cjs
 */
const fs=require("node:fs");
const path=require("node:path");
const crypto=require("node:crypto");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const corpus=JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const p55=corpus.pages.find(p=>p.page===55).indices;
assert.equal(p55.length,76);
assert.equal(p55[0],21);
assert.equal(crypto.createHash("sha256")
  .update(fs.readFileSync(path.join(root,"resources/liber-primus/72.jpg")))
  .digest("hex"),
  "a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba");
const cipher=p55.slice(1);
assert.equal(cipher.length,75);
const historicalSquare=[
  [272,138,341,131,151],
  [366,199,130,320,18],
  [226,245,91,245,226],
  [18,320,130,199,366],
  [151,131,341,138,272]
];
for(let i=0;i<5;i++) {
  assert.equal(historicalSquare[i].reduce((a,b)=>a+b),1033);
  assert.equal(historicalSquare.reduce((a,row)=>a+row[i],0),1033);
}
const mod=n=>((n%29)+29)%29;

/** @param {number} input @returns {number} */
function phi(input) {
  let n=input,result=input;
  for(let p=2;p*p<=n;p++) {
    if(n%p!==0)continue;
    while(n%p===0)n/=p;
    result=result/p*(p-1);
  }
  if(n>1)result=result/n*(n-1);
  return result;
}
const M=historicalSquare.map(row=>row.map(n=>phi(n)%29));
assert.deepEqual(M,[
  [12,15,10,14,5],[4,24,19,12,6],[25,23,14,23,25],
  [6,12,19,24,4],[5,14,10,15,12]
]);
const transpose=A=>A[0].map((_,i)=>A.map(row=>row[i]));
const vec=(A,v)=>A.map(row=>mod(row.reduce((acc,k,i)=>acc+k*v[i],0)));

/** @param {number[][]} M @returns {{inverse:number[][],det:number}} */
function inverseMod29(M) {
  const A=M.map((row,i)=>[...row.map(mod),...Array.from({length:5},(_,j)=>i===j?1:0)]);
  let det=1,sign=1;
  for(let c=0;c<5;c++) {
    let pivot=c;
    while(pivot<5&&A[pivot][c]===0)pivot++;
    assert(pivot<5,"source matrix is not invertible mod29");
    if(pivot!==c){[A[pivot],A[c]]=[A[c],A[pivot]];sign=-sign;}
    const value=A[c][c];
    det=mod(det*value);
    const vInverse=Array.from({length:29},(_,i)=>i).find(i=>mod(i*value)===1);
    assert.equal(typeof vInverse,"number");
    A[c]=A[c].map(x=>mod(x*vInverse));
    for(let r=0;r<5;r++)if(r!==c){
      const factor=A[r][c];
      A[r]=A[r].map((x,j)=>mod(x-factor*A[c][j]));
    }
  }
  const inv=A.map(row=>row.slice(5));
  for(let i=0;i<5;i++)for(let j=0;j<5;j++) {
    assert.equal(mod(M[i].reduce((a,v,k)=>a+v*inv[k][j],0)),i===j?1:0);
  }
  return {inverse:inv,det:mod(det*sign)};
}
const {inverse,det}=inverseMod29(M);
const raw=historicalSquare.map(row=>row.map(mod));
const {inverse:rawInverse,det:rawDet}=inverseMod29(raw);
assert.equal(det,28);  // −1 in GF29, exact source-derived matrix
assert.equal(rawDet,3);
assert.deepEqual(inverse,[
  [12,13,17,12,24],[27,25,9,3,0],[26,15,3,15,26],
  [0,3,9,25,27],[24,12,17,13,12]
]);

/** @param {number[][]} matrix @param {number[]} data */
function blocks(matrix,data) {
  assert.equal(data.length%5,0);
  const result=[];
  for(let i=0;i<data.length;i+=5)result.push(...vec(matrix,data.slice(i,i+5)));
  return result;
}
const tokens=corpus.translit.map((token,index)=>({token,index}))
  .sort((a,b)=>b.token.length-a.token.length);
function encode(input) {
  const out=[];
  for(let word of input.toUpperCase().match(/[A-Z]+/g)||[]) {
    word=word.replace(/QU/g,"CW").replace(/V/g,"U")
      .replace(/K/g,"C").replace(/Z/g,"S").replace(/ING/g,"NG");
    for(let i=0;i<word.length;) {
      const t=tokens.find(x=>word.startsWith(x.token,i));
      assert(t,"unmapped control token "+word.slice(i));
      out.push(t.index); i+=t.token.length;
    }
  }
  return out;
}
const control=encode(read("resources/control/gibran_prophet_58585.txt"));
assert.equal(control.length,62696);
const counts=new Map(),train=control.slice(0,40000),held=control.slice(40000);
for(let i=2;i<train.length;i++) {
  const n=train[i-2]*841+train[i-1]*29+train[i];
  counts.set(n,(counts.get(n)||0)+1);
}
const denominator=train.length-2+0.1*29**3;
function score(a) {
  let v=0;
  for(let i=2;i<a.length;i++) {
    const key=a[i-2]*841+a[i-1]*29+a[i];
    v+=Math.log(((counts.get(key)||0)+0.1)/denominator);
  }
  return v/(a.length-2);
}
let worstNative=Infinity,windows=0;
for(let i=0;i+75<=held.length;i++) {
  worstNative=Math.min(worstNative,score(held.slice(i,i+75)));windows++;
}
assert.equal(windows,22622);
assert.ok(Math.abs(worstNative-(-9.760735021014934))<1e-10);
const render=seq=>seq.map(i=>corpus.translit[i]).join("");
const hypotheses=[
  {name:"source phi square, column-vector Hill",dec:inverse,enc:M},
  {name:"wrong orientation phi square, row-vector",dec:transpose(inverse),enc:transpose(M)},
  {name:"wrong source raw numeric square, column-vector",dec:rawInverse,enc:raw},
  {name:"wrong source raw numeric square, row-vector",dec:transpose(rawInverse),enc:transpose(raw)}
];
// Stronger prospective-crib gate: source-linked seven LP1 moth words occupy
// exactly six complete Hill blocks at the end of p55's 75-rune body.
// Reconstruct the sole possible unknown secret 5x5 row-Hill key from the
// first five plaintext/ciphertext blocks; freeze the sixth as a blind test.
// GP IO in FUNCTION and ING in THINGS are source-calibrated runes.
const sourceNativeCrib=[
  2,18,16,3,16,10,18,9,16,0,1,9,5,16,27,9,
  10,15,15,24,5,4,18,23,24,20,20,2,21,15
];
assert.equal(sourceNativeCrib.length,30);
const cribCipher=p55.slice(46);
const plainBlocks=Array.from({length:6},(_,i)=>
  sourceNativeCrib.slice(5*i,5*i+5));
const cipherBlocks=Array.from({length:6},(_,i)=>
  cribCipher.slice(5*i,5*i+5));
const P5=plainBlocks.slice(0,5),C5=cipherBlocks.slice(0,5);
const {inverse:pinv,det:plainBasisDet}=inverseMod29(P5);
assert.equal(plainBasisDet,2,"first five source-native crib blocks form a basis");
const multiply=(A,B)=>A.map(row=>B[0].map((_,j)=>
  mod(row.reduce((sum,v,k)=>sum+v*B[k][j],0))));
const recoveredSecretRowKey=multiply(pinv,C5);
assert.deepEqual(recoveredSecretRowKey,[
  [3,27,3,24,15],
  [23,4,1,4,20],
  [28,4,24,18,19],
  [4,28,2,13,22],
  [11,13,23,4,22]
]);
const keyDet=inverseMod29(recoveredSecretRowKey).det;
assert.equal(keyDet,26,"the inferred five-block secret key is invertible");
for(let i=0;i<5;i++)assert.deepEqual(
  vec(transpose(recoveredSecretRowKey),plainBlocks[i]),cipherBlocks[i],
  "exactly fit first five original 5-rune blocks");
const withheldPredicted=vec(transpose(recoveredSecretRowKey),plainBlocks[5]);
assert.deepEqual(withheldPredicted,[13,19,22,1,22]);
assert.deepEqual(cipherBlocks[5],[11,1,17,18,10]);
const withheldMatches=withheldPredicted.filter((x,i)=>x===cipherBlocks[5][i]).length;
assert.equal(withheldMatches,0);
const allSecretCribGate={
  status:"conditional on unproven 30-rune LP1 p5 seven-word crib",
  originalP55SuffixStart:46,sourceBodyBlockIndex:9,
  exactPlainBlocksUsed:5,withheldBlockIndex:5,
  sourceCribGP:sourceNativeCrib,cipherSourceGP:cribCipher,
  sourcePlainFiveBlockDet:plainBasisDet,
  uniquelyRecoveredSecretInvertibleKey:recoveredSecretRowKey,
  secretKeyDet:keyDet,withheldPredicted,
  withheldOriginal:cipherBlocks[5],withheldExactMatches:withheldMatches,
  decision:"No single stationary secret invertible 5x5 GP29 Hill cipher can match all six original suffix blocks if this candidate plaintext is genuine."
};
const rows=[];
for(const h of hypotheses) {
  const plaintext=blocks(h.dec,cipher);
  assert.deepEqual(blocks(h.enc,plaintext),cipher,"source original full forward replay");
  const planted=control.slice(1000,1075);
  assert.deepEqual(blocks(h.dec,blocks(h.enc,planted)),planted,"native-GP plant");
  const s=score(plaintext);
  assert(s<worstNative,"unexpected human-readable output");
  rows.push({name:h.name,score:s,decoded:render(plaintext),fullOriginal:75,plantRecovered:75});
}
assert.equal(rows.length,4);
assert.ok(Math.abs(rows[0].score-(-12.666275692917141))<1e-10);
console.log(JSON.stringify({
  source:"LP1 p5 2014 Wisdom square and source-moth LP2 p55 75-body",
  p55Body75Blocks5:15,authenticSourceSquare:historicalSquare,
  sourcePhiMatrix:M,determinantMod29:det,sourceInverse:inverse,
  wrongRawMatrixDeterminantMod29:rawDet,
  matchedNative75Windows:windows,worstNativeScore:worstNative,
  originalCipherScore:score(cipher),rows,allSecretCribGate,
  conclusion:"No original plaintext; exact 5x5 GP29 Hill source transfer negative"
},null,2));
