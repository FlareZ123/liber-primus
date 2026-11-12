"use strict";
/**
 * Source-locked all-secret linear 3-to-1 connection between p29 G-adic
 * residual (273 GP29 coordinates) and original 2016 signed-word-map
 * 91-rune p57-circumference-stripped sequence.
 * Run node sims/lp2_signed2016_91_p29_residual_alllinear_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const transcription = read("resources/lp2-transcription.txt").split("%");
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const mod = n => (n % 29 + 29) % 29;
/** @param {number[]} x @param {number[]} y */
function multiply(x, y) {
  const out = Array(x.length + y.length - 1).fill(0);
  for (let i = 0; i < x.length; i++)
    for (let j = 0; j < y.length; j++) out[i + j] = mod(out[i + j] + x[i] * y[j]);
  return out;
}
/** @param {number[]} x @param {number[]} y */
function subtract(x, y) {
  const size = Math.max(x.length, y.length);
  const a = Array(size-x.length).fill(0).concat(x);
  const b = Array(size-y.length).fill(0).concat(y);
  return a.map((v,i) => mod(v-b[i]));
}
/** @param {number[]} x @param {number[]} divisor */
function divide(x, divisor) {
  const work = x.slice(), result = [];
  const reciprocal = Array.from({length:28}, (_,i)=>i+1)
    .find(v => mod(v * divisor[0]) === 1);
  assert.notEqual(reciprocal, undefined);
  for (let i=0; i<=work.length-divisor.length; i++) {
    const factor=mod(work[i]*reciprocal);
    result.push(factor);
    for(let j=0;j<divisor.length;j++)
      work[i+j]=mod(work[i+j]-factor*divisor[j]);
  }
  return {quotient:result,remainder:work.slice(result.length)};
}
const P=corpus.pages.find(p=>p.page===29).indices;
const S=grid.bytes.map(n=>n%29);
const G=[15,5,27];
const R=divide(subtract(subtract(P,S),multiply([2],G)),multiply(G,G));
assert.deepEqual([P.length,S.length,R.quotient.length],[277,256,273]);
assert.deepEqual(R.remainder,[0,0,0,0]);
assert.equal(transcription.length,57);
function printedWords(page) {
  return page.replaceAll("/","").replaceAll("\n","").replaceAll("\r","")
    .split(/[-.&$§,:!?]/u).map(piece=>
      (piece.match(/[ᚠ-᛿]+/gu)||[]).join("")).filter(Boolean);
}
const pages=Array.from({length:58},(_,p)=>p===50?[]:
  printedWords(transcription[p>50?p-1:p]));
const tokens=corpus.translit.map((letter,index)=>({letter:letter.toLowerCase(),index}))
  .sort((a,b)=>b.letter.length-a.letter.length);
/** @param {string} word */
function encode(word) {
  const source=word.toLowerCase().replace(/v/g,"u").replace(/k/g,"c").replace(/z/g,"s");
  const result=[];
  for(let i=0;i<source.length;) {
    const match=tokens.find(t=>source.startsWith(t.letter,i));
    assert(match, "Unencodable signed word " + word + ":" + source.slice(i));
    result.push(match.index); i+=match.letter.length;
  }
  return result;
}
const sentence=signed.slice(signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----"));
const words=sentence.match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g)||[];
assert.equal(words.length,43);
const selected=words.map(word=>{
  const sum=encode(word).reduce((a,i)=>a+corpus.prime[i],0);
  return {word,page:sum%58,index:Math.floor(sum/58),
    selected:pages[sum%58]?.[Math.floor(sum/58)]??null};
});
assert.deepEqual(selected.filter(x=>x.selected===null).map(x=>x.word),["lies"]);
const expected="IARFEIOLOEEAEOBOLXIARFEIRUNEAOLSCNGRTHOLEAPSHNEAOLYOENTSDWRTHOLSTAENRDNGNTMIOTHETHEOGGFNIACTHRTTHHBEGIAPEAUAEMPSA";
const interior=selected.filter(x=>x.selected!==null)
  .flatMap(x=>[...x.selected].slice(1,-1))
  .map(letter=>corpus.runes.indexOf(letter));
assert.equal(interior.length,91);
assert.equal(interior.map(i=>corpus.translit[i]).join(""),expected);
/** @param {number[][]} original */
function rank(original) {
  const matrix=original.map(row=>row.slice());
  let r=0;
  for(let col=0;col<matrix[0].length&&r<matrix.length;col++) {
    let pivot=r;
    while(pivot<matrix.length&&matrix[pivot][col]===0)pivot++;
    if(pivot===matrix.length)continue;
    [matrix[r],matrix[pivot]]=[matrix[pivot],matrix[r]];
    const inv=Array.from({length:28},(_,i)=>i+1)
      .find(v=>mod(v*matrix[r][col])===1);
    assert.notEqual(inv,undefined);
    for(let j=col;j<matrix[r].length;j++)matrix[r][j]=mod(matrix[r][j]*inv);
    for(let k=r+1;k<matrix.length;k++){
      const factor=matrix[k][col];
      if(factor)for(let j=col;j<matrix[k].length;j++)
        matrix[k][j]=mod(matrix[k][j]-factor*matrix[r][j]);
    }
    r++;
  }
  return r;
}
/** @param {number[][]} features @param {number[]} target */
function consistency(features,target) {
  assert.equal(features.length,target.length);
  const sourceRank=rank(features),augmentedRank=rank(features.map((v,i)=>[...v,target[i]]));
  let failingPrefix=0;
  for(let n=1;n<=features.length;n++){
    const a=features.slice(0,n),b=a.map((v,i)=>[...v,target[i]]);
    if(rank(b)>rank(a)){failingPrefix=n;break;}
  }
  return {sourceRank,augmentedRank,failingPrefix};
}
const report=[];
for(const layout of ["contiguous","interleaved"]) {
  const base=Array.from({length:91},(_,i)=>
    layout==="contiguous"?
      [R.quotient[i],R.quotient[i+91],R.quotient[i+182]]:
      R.quotient.slice(3*i,3*i+3));
  for(const affine of [false,true]) {
    const features=base.map(row=>[...row,...(affine?[1]:[])]);
    const result=consistency(features,interior);
    assert.deepEqual(result, affine?
      {sourceRank:4,augmentedRank:5,failingPrefix:5}:
      {sourceRank:3,augmentedRank:4,failingPrefix:4});
    // Positive: any secret coefficients and nonzero bias exactly satisfy all
    // 91 original source rows; rank exposes the correct source dimensionality.
    const planted=features.map(row=>mod(row.reduce((s,v,j)=>
      s+v*[3,5,7,11][j],0)));
    assert.deepEqual(consistency(features,planted),{
      sourceRank:affine?4:3,augmentedRank:affine?4:3,failingPrefix:0});
    report.push({layout,affine,...result,plantedAll91:true});
  }
}
// Native source-language positive: embed all 91 authentic solved-p57 GP
// runes in an independently constructed 3-component channel and recover them
// by a fixed full-rank linear projection (the third component).
const known=corpus.pages.find(p=>p.page===57).indices.slice(0,91);
const nativeSource=known.map((p,i)=>[i%29,(i*i)%29,p]);
assert.equal(rank(nativeSource),3);
assert.deepEqual(consistency(nativeSource,known),
  {sourceRank:3,augmentedRank:3,failingPrefix:0});
console.log(JSON.stringify({source:"Original p29, original 256-number table, original signed 2016 words, original LP2 printed words",
  sourceR:273,mapRuneInteriors:91,signedWords:words.length,
  independentNativePlant:known.length,allSecretResults:report,
  decision:"No fixed secret GF29 linear or affine 3-to-1 map carries the source-selected 91 symbols from the 273 G-adic residual; original plaintext remains unknown."},null,2));
