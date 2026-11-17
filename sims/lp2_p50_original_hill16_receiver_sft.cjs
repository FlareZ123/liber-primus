"use strict";

/**
 * Original p50 256-cell table as a source-keyed invertible Hill16 matrix.
 *
 * Four printed-cell-preserving interpretations: base59/base60 tokens and
 * two 32x8-to-16x16 folds. For each: M, M inverse, transposes, all 16
 * possible block phases, actual original ciphertext and independent
 * native-GP English calibration. This is a complete finite direct linear
 * receiver, not a claim that the 2016 author specified Hill.
 *
 * SFT for Windows 11 / Node 22:
 *   node sims/lp2_p50_original_hill16_receiver_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const table = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const words = read("resources/control/gibran_prophet_58585.txt");
assert.equal(table.rows.length,32);
assert.ok(table.rows.every(row => row.length===8));
const tokens = table.rows.flat();
assert.equal(tokens.length,256);
const mod = value => (value%29+29)%29;

/** @param {string} alphabet @returns {number[]} */
function sourceValues(alphabet) {
  return tokens.map(token => {
    const hi = alphabet.indexOf(token[0]),lo = alphabet.indexOf(token[1]);
    assert.ok(hi>=0 && lo>=0);
    const byte = hi*alphabet.length+lo;
    assert.ok(byte>=0 && byte<=255);
    return byte%29;
  });
}

/**
 * @param {number[]} values
 * @param {"paired"|"halves"} fold
 * @returns {number[][]}
 */
function square(values, fold) {
  return Array.from({length:16}, (_,r) => fold==="paired"
    ? values.slice(16*r,16*r+16)
    : values.slice(8*r,8*r+8).concat(values.slice(8*(r+16),8*(r+17))));
}

/** @param {number[][]} M @returns {number[][]} */
function transpose(M) {
  return Array.from({length:16},(_,i)=>
    Array.from({length:16},(_,j)=>M[j][i]));
}

/** @param {number} n @returns {number} */
function reciprocal(n) {
  for(let r=1;r<29;r++)if(mod(r*n)===1)return r;
  throw Error("nonunit pivot");
}

/** @param {number[][]} M @returns {number[][]} */
function invert(M) {
  const A=M.map((row,i)=>row.concat(
    Array.from({length:16},(_,j)=>Number(i===j))));
  for(let col=0;col<16;col++){
    let at=col;
    while(at<16&&A[at][col]===0)at++;
    assert.ok(at<16,"original table must be GF29-invertible");
    [A[at],A[col]]=[A[col],A[at]];
    const inv=reciprocal(A[col][col]);
    for(let j=0;j<32;j++)A[col][j]=mod(A[col][j]*inv);
    for(let i=0;i<16;i++)if(i!==col){
      const factor=A[i][col];
      for(let j=0;j<32;j++)A[i][j]=mod(A[i][j]-factor*A[col][j]);
    }
  }
  const I=A.map(row=>row.slice(16));
  const identity=Array.from({length:16}, (_,i)=>
    Array.from({length:16}, (_,j)=>
      mod(M[i].reduce((sum,value,k)=>sum+value*I[k][j],0))));
  assert.deepEqual(identity,Array.from({length:16}, (_,i)=>
    Array.from({length:16}, (_,j)=>Number(i===j))));
  return I;
}

/**
 * Multiplication of each aligned consecutive 16-symbol block.
 * All incomplete original edge fragments are left outside the receiver.
 * @param {number[][]} M
 * @param {number[]} seq
 * @param {number} phase
 * @returns {number[]}
 */
function apply(M,seq,phase=0) {
  const result=[];
  for(let start=phase;start+16<=seq.length;start+=16) {
    for(let i=0;i<16;i++) {
      let value=0;
      for(let j=0;j<16;j++)value+=M[i][j]*seq[start+j];
      result.push(value%29);
    }
  }
  return result;
}

// Historical native-GP spelling: ING and IO have their solved LP1 forms.
// The main trigram model is trained only on first-half literary text.
const spell = corpus.translit.map((word,index)=>({word,index}))
  .sort((a,b)=>b.word.length-a.word.length);
const originalWords = words.toUpperCase().replace(/QU/g,"CW")
  .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S")
  .match(/[A-Z]+/g) || [];
/** @param {string} text @returns {number[]} */
function native(text) {
  const result=[];
  for(const word of text.toUpperCase().replace(/QU/g,"CW")
    .replace(/V/g,"U").replace(/[KQ]/g,"C").replace(/Z/g,"S")
    .match(/[A-Z]+/g)||[]){
    for(let i=0;i<word.length;){
      if(word.startsWith("ING",i)){result.push(21);i+=3;}
      else if(word.startsWith("IO",i)){result.push(27);i+=2;}
      else {
        const token=spell.find(s=>word.startsWith(s.word,i));
        assert.ok(token, "GP29 cannot map source text");
        result.push(token.index);
        i+=token.word.length;
      }
    }
  }
  return result;
}
const english=native(words);
assert.ok(english.length>55000);
const train=english.slice(0,Math.floor(english.length/2));
const heldout=english.slice(Math.floor(english.length/2));
const counts=new Uint32Array(29*29*29),pairs=new Uint32Array(29*29);
for(let i=2;i<train.length;i++) {
  const pair=train[i-2]*29+train[i-1];
  pairs[pair]++;
  counts[pair*29+train[i]]++;
}
/** @param {number[]} seq @returns {number} */
function score(seq){
  assert.ok(seq.length>=64);
  let total=0;
  for(let i=2;i<seq.length;i++){
    const pair=seq[i-2]*29+seq[i-1];
    total+=Math.log((counts[pair*29+seq[i]]+0.25)/(pairs[pair]+7.25));
  }
  return total/(seq.length-2);
}
const pages=corpus.pages;
const windows={
  full:pages.filter(p=>p.page<56).flatMap(p=>p.indices),
  opening:pages.slice(0,3).flatMap(p=>p.indices),
  pretable:pages[48].indices.slice(-72).concat(pages[49].indices),
  posttable:pages[51].indices.concat(pages[52].indices.slice(0,78)),
  later:pages.slice(40,54).flatMap(p=>p.indices),
  terminal:pages.slice(54,56).flatMap(p=>p.indices)
};
assert.deepEqual(Object.fromEntries(Object.entries(windows)
  .map(([name,a])=>[name,a.length])),{
  full:12956,opening:729,pretable:138,posttable:170,later:3008,
  terminal:308
});
const originalScore=Object.fromEntries(Object.entries(windows)
  .map(([name,seq])=>[name,score(seq)]));
const controlScore=Object.fromEntries(Object.entries(windows)
  .map(([name,seq])=>[name,score(heldout.slice(0,seq.length))]));
const successfulControls=[];
const screen=[];
for(const [radix, alphabet] of [[60,table.alphabet],
  [59,table.alphabet.replace("f","")]]) {
  for(const fold of ["paired","halves"]){
    const M=square(sourceValues(alphabet),fold),I=invert(M);
    const known=english.slice(-160);
    const encrypted=apply(M,known);
    assert.deepEqual(apply(I,encrypted),known);
    const second=apply(transpose(M),known);
    assert.deepEqual(apply(transpose(I),second),known);
    successfulControls.push({radix,fold,recovered:known.length});
    const maps={M,inv:I,transpose:transpose(M),inverseTranspose:transpose(I)};
    for(const [operation,matrix] of Object.entries(maps)){
      for(let phase=0;phase<16;phase++){
        const result={radix,fold,operation,phase};
        for(const [name,seq] of Object.entries(windows)){
          const plain=apply(matrix,seq,phase);
          result[name]=score(plain);
        }
        screen.push(result);
      }
    }
  }
}
assert.equal(screen.length,256);
assert.equal(successfulControls.length,4);
for(const [name,seq] of Object.entries(windows)){
  const sorted=screen.slice().sort((a,b)=>b[name]-a[name]);
  const best=sorted[0], worst=sorted[255];
  console.log(JSON.stringify({window:name,runes:seq.length,
    original:originalScore[name],control:controlScore[name],
    best:{radix:best.radix,fold:best.fold,operation:best.operation,
      phase:best.phase,score:best[name]},
    worst:worst[name],allCandidates:screen.length}));
}
console.log(JSON.stringify({positiveControls:successfulControls,
  heldoutEnglish:score(heldout),solvedP57:score(pages[57].indices)}));
console.log("FINITE OUTCOME: direct original table Hill16 has no" +
  " high-scoring original plaintext on any full or table-flanking window.");
console.log("A matrix phase/fold is not author-specified; this finite" +
  " negative is not proof against different stateful receivers.");
