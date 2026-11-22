"use strict";

/**
 * LP2 p55 source-moth provisional 30-rune crib: exact all-key affine LFSR test.
 * SFT: node sims/lp2_p55_moth_8register_crib_sft.cjs
 * A failed conditional crib test does not refute the crib or the actual cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "resources/liber-primus/lp2-corpus.json"), "utf8"));
const cipher = corpus.pages.find(p => p.page === 55).indices.slice(46);
const tokens = [
  ["TH","E"], ["T","O","T","I","E","N","T"],
  ["F","U","N","C","T","IA","N"], ["I","S"],
  ["S","A","C","R","E","D"], ["A","L","L"], ["TH","NG","S"]
];
assert.deepEqual(tokens.map(w => w.length), [2,7,7,2,6,3,3]);
const plain = tokens.flat().map(x => corpus.translit.indexOf(x));
assert.equal(plain.length,30);
assert.equal(cipher.length,30);
// Source-native FUNCTION includes a literal F; the original p55 glyph there
// is E. Therefore every historically transparent-F cipher rejects this crib.
assert.equal(plain[9],0, "LP1-p5 source FUNCTION's initial F");
assert.equal(cipher[9],18, "unchanged original p55 rune E at offset55");
assert.notEqual(plain[9],cipher[9]);
assert.equal(plain.filter(x => x === 0).length,1);
assert.equal(cipher.filter(x => x === 0).length,0);
assert(plain.every(x => x >= 0));
assert.deepEqual(cipher, [12,18,28,18,10,6,14,6,15,18,15,12,2,2,18,15,2,22,5,28,10,19,5,14,23,11,1,17,18,10]);
const m=x=>((x%29)+29)%29;
const inv=x=>{for(let a=1;a<29;a++)if(m(a*x)===1)return a;throw Error("zero inverse");};

/** @param {number[][]} rows @returns {{rank:number,rref:number[][],pivots:number[]}} */
function echelon(rows) {
  const a=rows.map(row=>row.map(m)),pivots=[];
  let r=0;
  for(let c=0;c<a[0].length && r<a.length;c++){
    let t=r;while(t<a.length && a[t][c]===0)t++;
    if(t===a.length)continue;
    [a[r],a[t]]=[a[t],a[r]];
    const factor=inv(a[r][c]);
    for(let j=c;j<a[0].length;j++)a[r][j]=m(a[r][j]*factor);
    for(let k=0;k<a.length;k++){
      if(k===r)continue;
      const z=a[k][c];
      for(let j=c;j<a[0].length;j++)a[k][j]=m(a[k][j]-z*a[r][j]);
    }
    pivots.push(c);r++;
  }
  return {rank:r,rref:a,pivots};
}

/**
 * K[i]=b+sum(a[j]*K[i-1-j]) modulo29; first q values are free.
 * @param {number[]} k @param {number} q
 */
function gate(k,q){
  const rows=[];
  for(let i=q;i<k.length;i++)
    rows.push([1,...Array.from({length:q},(_,j)=>k[i-j-1]),k[i]]);
  return {rows,rank:echelon(rows.map(row=>row.slice(0,-1))).rank,aug:echelon(rows).rank};
}
const calculate=(coeff,row)=>m(coeff.reduce((s,v,i)=>s+v*row[i],0));
const cases=[];
for(const mode of ["C-P","C+P"]){
  const key=cipher.map((v,i)=>m(v+(mode==="C-P"?-plain[i]:plain[i])));
  const lowOrders=[];
  for(let q=1;q<=14;q++){
    const g=gate(key,q);
    assert.equal(g.rank,q+1);
    assert.equal(g.aug,q+2);
    lowOrders.push({q,rank:g.rank,augmented_rank:g.aug});
  }
  assert.equal(gate(key,15).rank,15);
  assert.equal(gate(key,15).aug,15);
  const rows=gate(key,8).rows;
  const first9=echelon(rows.slice(0,9));
  assert.deepEqual(first9.pivots,[0,1,2,3,4,5,6,7,8]);
  const coeff=first9.rref.map(r=>r[9]);
  const firstBad=rows.findIndex(row=>calculate(coeff,row.slice(0,-1))!==row[9]);
  assert.equal(firstBad,9);
  const predicted=calculate(coeff,rows[firstBad].slice(0,-1));
  const heldout={offset:46+8+firstBad,predicted,actual:rows[firstBad][9]};
  assert.deepEqual(heldout,mode==="C-P" ?
    {offset:63,predicted:24,actual:7}:
    {offset:63,predicted:27,actual:8});
  cases.push({mode,firstNineCoefficientFit:coeff,firstUnfittedContradiction:heldout,
    affineOrders1Through14:lowOrders,minimumFiniteFitOrder:15});
}
// Independent 30-rune native-GP plant whose true key is stationary order eight.
const seeded=[10,0,12,15,23,25,25,26];
const a=[7,3,26,25,23,19,13,0,25];
while(seeded.length<30){
  const i=seeded.length;
  const row=[1,...Array.from({length:8},(_,j)=>seeded[i-j-1])];
  seeded.push(calculate(a,row));
}
const synthetic=plain.map((p,i)=>m(p+seeded[i]));
assert.equal(gate(seeded,8).rank,gate(seeded,8).aug);
const recovered=synthetic.map((c,i)=>m(c-seeded[i]));
assert.deepEqual(recovered,plain);
assert.deepEqual(recovered.map((p,i)=>m(p+seeded[i])),synthetic);
const plantFit=echelon(gate(seeded,8).rows.slice(0,9));
assert.deepEqual(plantFit.pivots,[0,1,2,3,4,5,6,7,8]);
const recoveredCoefficients=plantFit.rref.map(r=>r[9]);
assert.deepEqual(recoveredCoefficients,a);
assert(gate(seeded,8).rows.every(row=>
  calculate(recoveredCoefficients,row.slice(0,-1))===row[9]));
console.log(JSON.stringify({
  status:"CONDITIONAL original-crib exclusion only; no unknown plaintext",
  originalPage55:76,cribOffset:46,cribRunes:30,
  cases,plant:"30/30 recovered and re-encrypted; order8 source-native plant fits"
},null,2));
