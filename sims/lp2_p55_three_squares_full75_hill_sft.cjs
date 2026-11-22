"use strict";
/**
 * Original-source, complete 75-rune p55 body inverse from the three
 * historically required 2014 magic squares (5x5 / 7x7 / 5x5).
 *
 * Remove only the 7x7 middle square's circumference, leaving three
 * source-ordered 5x5 matrices (25 + 25 + 25 = original 75-rune p55 body).
 * Apply standard GF29 Hill inverse in both vector conventions.
 * Every original rune is round-tripped, no key/offset is optimized.
 *
 * Native English and symmetry-preserving nulls distinguish a genuine
 * readable solution from a partially elevated n-gram score.
 *
 * Run from repository root with Node.js 22:
 * node sims/lp2_p55_three_squares_full75_hill_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = read("resources/cicada2014-openpuff-magic-squares.txt");
const original = corpus.pages[55].indices;
assert.equal(original.length, 76);
assert.equal(corpus.translit[original[0]], "NG");
const C = original.slice(1);
assert.equal(C.length, 75);
const lengths = [4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3];
assert.equal(lengths.reduce((s, n) => s+n, 0), 75);
const squares = source.trim().split(/\r?\n\s*\r?\n/).map(section =>
  section.trim().split(/\r?\n/).map(line =>
    line.trim().split(/\s+/).map(Number)));
assert.deepEqual(squares.map(a => a.length), [5,7,5]);
for (const matrix of squares) assert(matrix.every(row => row.length === matrix.length));
const matrices = [
  squares[0],
  squares[1].slice(1,6).map(row => row.slice(1,6)),
  squares[2]
];
assert.deepEqual(matrices.map(m => m.length), [5,5,5]);
assert(matrices.every(m => m.flat().every((v,i,a) => v===a[24-i])));
const mod = n => ((n % 29) + 29) % 29;
const multiplicativeInverse = Array.from({length:29}, (_,n) => {
  for (let k=1;k<29;k++) if ((n*k)%29===1) return k;
  return 0;
});
/** @param {number[][]} A @returns {{det:number,matrix:number[][]}|null} */
function inverse(A) {
  const n=A.length;
  const rows=A.map((row,i) => [
    ...row.map(mod),
    ...Array.from({length:n},(_,j)=>Number(i===j))
  ]);
  let det=1;
  for(let j=0;j<n;j++) {
    const pivot=rows.findIndex((row,i)=>i>=j && row[j]!==0);
    if(pivot<0) return null;
    if(pivot!==j) {
      [rows[j],rows[pivot]]=[rows[pivot],rows[j]];
      det=mod(-det);
    }
    const value=rows[j][j];
    det=mod(det*value);
    const inv=multiplicativeInverse[value];
    assert(inv!==0);
    rows[j]=rows[j].map(x=>mod(x*inv));
    for(let i=0;i<n;i++) if(i!==j) {
      const multiplier=rows[i][j];
      rows[i]=rows[i].map((v,k)=>mod(v-multiplier*rows[j][k]));
    }
  }
  return {det,matrix:rows.map(row=>row.slice(n))};
}
const inverseInfo=matrices.map(inverse);
assert(inverseInfo.every(x=>x!==null));
assert.deepEqual(inverseInfo.map(x=>x.det),[10,8,3]);
const inverses=inverseInfo.map(x=>x.matrix);
/**
 * @param {number[][]} matrix
 * @param {number[]} vector
 * @param {"row"|"column"} orientation
 * @returns {number[]}
 */
function multiply(matrix,vector,orientation) {
  assert.equal(vector.length,5);
  return Array.from({length:5},(_,j)=>mod(vector.reduce((sum,v,i)=>
    sum+v*(orientation==="column"?matrix[j][i]:matrix[i][j]),0)));
}
/**
 * @param {number[]} data
 * @param {"row"|"column"} orientation
 * @param {number[][][]} keys
 * @returns {number[]}
 */
function transform(data,orientation,keys) {
  assert.equal(data.length,75);
  const out=[];
  for(let s=0;s<3;s++) for(let j=0;j<25;j+=5) {
    const vector=data.slice(s*25+j,s*25+j+5);
    out.push(...multiply(keys[s],vector,orientation));
  }
  return out;
}
/** @param {number[]} data @returns {number} */
function ioc(data) {
  const counts=Array(29).fill(0);
  for(const value of data) counts[value]++;
  return counts.reduce((s,n)=>s+n*(n-1),0)/(data.length*(data.length-1));
}
const decoded={};
for(const orientation of ["column","row"]) {
  const value=transform(C,orientation,inverses);
  assert.deepEqual(transform(value,orientation,matrices),C);
  const native=corpus.pages[57].indices.slice(0,75);
  assert.equal(native.length,75);
  assert.deepEqual(transform(transform(native,orientation,matrices),
    orientation,inverses),native);
  decoded[orientation]=value;
}
const symbols=corpus.translit.map((name,index)=>({name,index}))
  .sort((a,b)=>b.name.length-a.name.length);
/** @param {string} raw @returns {number[]|null} */
function encodeWord(raw) {
  const word=raw.toUpperCase().replace(/QU/g,"CW").replace(/V/g,"U")
    .replace(/K/g,"C").replace(/Z/g,"S").replace(/Q/g,"C");
  const out=[];
  for(let i=0;i<word.length;) {
    const symbol=symbols.find(s=>word.startsWith(s.name,i));
    if(!symbol) return null;
    out.push(symbol.index);
    i+=symbol.name.length;
  }
  return out;
}
/** @param {string} sourceText @returns {number[][]} */
function nativeWords(sourceText) {
  return (sourceText.match(/[a-z]+/gi)||[]).map(encodeWord).filter(Boolean);
}
const controls=[
  ["Shakespeare","resources/control/shakespeare_first300k.txt"],
  ["Gibran","resources/control/gibran_prophet_58585.txt"],
  ["Emerson","resources/control/emerson_essays_2944.txt"]
].map(([name,file])=>({name,words:nativeWords(read(file))}));
const counts=Array.from({length:29},()=>Array(29).fill(0));
const starts=Array(29).fill(0);
for(const word of controls[0].words) for(let i=1;i<word.length;i++) {
  counts[word[i-1]][word[i]]++;
  starts[word[i-1]]++;
}
const logProb=counts.map((row,i)=>row.map(n=>
  Math.log((n+0.25)/(starts[i]+29*0.25))));
/** @param {number[]} data @returns {number} */
function wordBigramScore(data) {
  assert.equal(data.length,75);
  let at=0,score=0,pairs=0;
  for(const len of lengths) {
    for(let i=1;i<len;i++) {
      score+=logProb[data[at+i-1]][data[at+i]];
      pairs++;
    }
    at+=len;
  }
  assert.equal(pairs,59);
  return score/pairs;
}
const originalScore=wordBigramScore(C);
const decodedScores=Object.fromEntries(
  Object.entries(decoded).map(([k,v])=>[k,wordBigramScore(v)]));
assert(Math.abs(originalScore+6.258208659537937)<1e-8);
assert(Math.abs(decodedScores.column+5.84815717760572)<1e-8);
assert(Math.abs(decodedScores.row+5.0710154617133885)<1e-8);
assert(Math.abs(ioc(decoded.column)-0.04036036036036036)<1e-10);
assert(Math.abs(ioc(decoded.row)-0.0381981981981982)<1e-10);

// Source-native word-length-matched English controls, no optimizations.
let seed=0x35001414;
/** @returns {number} */
function random32() {
  seed ^= seed<<13;
  seed ^= seed>>>17;
  seed ^= seed<<5;
  return seed>>>0;
}
const native=[];
for(const {name,words} of controls) {
  const byLength=Array.from({length:32},()=>[]);
  for(const word of words) if(word.length<32)byLength[word.length].push(word);
  for(const len of lengths)assert(byLength[len].length>0);
  let min=Infinity,mean=0,belowRow=0,belowColumn=0;
  for(let trial=0;trial<2000;trial++) {
    const planted=lengths.flatMap(len=>{
      const candidates=byLength[len];
      return candidates[random32()%candidates.length];
    });
    const s=wordBigramScore(planted);
    min=Math.min(min,s);
    mean+=s;
    if(s<=decodedScores.row)belowRow++;
    if(s<=decodedScores.column)belowColumn++;
    if(trial===0)for(const orientation of ["column","row"])
      assert.deepEqual(transform(transform(planted,orientation,matrices),
        orientation,inverses),planted);
  }
  native.push({name,draws:2000,minimum:min,mean:mean/2000,
    scoresAtOrBelowDecodedRow:belowRow,
    scoresAtOrBelowDecodedColumn:belowColumn});
}
assert(native.every(x=>x.scoresAtOrBelowDecodedRow===0 &&
  x.scoresAtOrBelowDecodedColumn===0));

// Matrix-structure-preserving key-order null. Keep each square's central
// entry and twelve 180-degree-equal value pairs, randomize pair placement.
seed=0x35a0ab13;
const indices=Array.from({length:12},(_,i)=>i);
const randomScores=[];
for(let trial=0;trial<5000;trial++) {
  const randomized=[];
  for(const key of matrices) {
    const order=indices.slice();
    for(let k=11;k>0;k--) {
      const j=random32()%(k+1);
      [order[k],order[j]]=[order[j],order[k]];
    }
    const sourceValues=key.flat();
    const values=Array(25).fill(sourceValues[12]);
    for(let j=0;j<12;j++) {
      values[j]=sourceValues[order[j]];
      values[24-j]=sourceValues[order[j]];
    }
    const randomizedMatrix=Array.from({length:5},(_,i)=>
      values.slice(5*i,5*i+5));
    const inv=inverse(randomizedMatrix);
    randomized.push(inv ? inv.matrix : null);
  }
  if(randomized.some(v=>v===null))continue;
  randomScores.push(wordBigramScore(transform(C,"row",randomized)));
}
const greaterOrEqual=randomScores.filter(s=>s>=decodedScores.row).length;
const empiricalP=(greaterOrEqual+1)/(randomScores.length+1);
assert(randomScores.length>3500 && randomScores.length<4500);
assert(empiricalP>0.001 && empiricalP<0.03);

// Complete 5x5-matrix reading of each 25-rune block. A source square can
// act from either side, in transposed or untransposed form. Test eight
// mathematically standard, source-locked one-/two-sided matrix products.
const gridModes=[
  "left","leftTranspose","right","rightTranspose",
  "both","bothTranspose","mixed","mixedTranspose"
];
/** @param {number[][]} A @returns {number[][]} */
const transpose=A=>A[0].map((_,j)=>A.map(row=>row[j]));
/** @param {number[][]} A @param {number[][]} B @returns {number[][]} */
function multiplySquare(A,B) {
  return A.map(row=>B[0].map((_,j)=>mod(row.reduce(
    (sum,v,k)=>sum+v*B[k][j],0))));
}
/**
 * @param {number[]} data
 * @param {number[][][]} keys
 * @param {string} mode
 * @returns {number[]}
 */
function gridTransform(data,keys,mode) {
  assert.equal(data.length,75);
  const out=[];
  for(let s=0;s<3;s++) {
    const Cblock=Array.from({length:5},(_,i)=>
      data.slice(25*s+5*i,25*s+5*i+5));
    const A=keys[s],AT=transpose(A);
    let result;
    if(mode==="left") result=multiplySquare(A,Cblock);
    else if(mode==="leftTranspose") result=multiplySquare(AT,Cblock);
    else if(mode==="right") result=multiplySquare(Cblock,A);
    else if(mode==="rightTranspose") result=multiplySquare(Cblock,AT);
    else if(mode==="both") result=multiplySquare(multiplySquare(A,Cblock),A);
    else if(mode==="bothTranspose") result=multiplySquare(multiplySquare(AT,Cblock),AT);
    else if(mode==="mixed") result=multiplySquare(multiplySquare(A,Cblock),AT);
    else if(mode==="mixedTranspose") result=multiplySquare(multiplySquare(AT,Cblock),A);
    else throw new Error("Unknown 2D key mode "+mode);
    out.push(...result.flat());
  }
  return out;
}
const originalGridScores=gridModes.map(mode=>{
  const decoded2D=gridTransform(C,inverses,mode);
  assert.deepEqual(gridTransform(decoded2D,matrices,mode),C);
  const known=corpus.pages[57].indices.slice(0,75);
  assert.deepEqual(gridTransform(gridTransform(known,matrices,mode),
    inverses,mode),known);
  return {mode,score:wordBigramScore(decoded2D),ioc:ioc(decoded2D)};
});
assert(Math.abs(originalGridScores[2].score-decodedScores.row)<1e-12);
assert(Math.abs(originalGridScores[3].score-decodedScores.column)<1e-12);
const bestOriginalGridScore=Math.max(...originalGridScores.map(x=>x.score));
assert(Math.abs(bestOriginalGridScore-decodedScores.row)<1e-12);

// Selection-aware null: each randomized triple can use its best of all
// eight natural 2D inverse products. Condition on invertible keys only.
seed=0x35a0ab14;
const familyNullScores=[];
for(let trial=0;trial<2000;trial++) {
  const randomized=[];
  for(const sourceMatrix of matrices) {
    const order=indices.slice();
    for(let k=11;k>0;k--) {
      const j=random32()%(k+1);
      [order[k],order[j]]=[order[j],order[k]];
    }
    const valuesSource=sourceMatrix.flat();
    const entries=Array(25).fill(valuesSource[12]);
    for(let j=0;j<12;j++) {
      entries[j]=valuesSource[order[j]];
      entries[24-j]=valuesSource[order[j]];
    }
    const candidate=Array.from({length:5},(_,i)=>entries.slice(5*i,5*i+5));
    const info=inverse(candidate);
    randomized.push(info ? info.matrix : null);
  }
  if(randomized.some(m=>m===null))continue;
  const best=Math.max(...gridModes.map(mode=>
    wordBigramScore(gridTransform(C,randomized,mode))));
  familyNullScores.push(best);
}
const familyExceedances=familyNullScores.filter(
  value=>value>=bestOriginalGridScore).length;
const familyP=(familyExceedances+1)/(familyNullScores.length+1);
assert.equal(familyNullScores.length,1623);
assert.equal(familyExceedances,128);
assert(Math.abs(familyP-129/1624)<1e-12);
const spell=data=>data.map(i=>corpus.translit[i]).join(".");
console.log(JSON.stringify({
  status:"bounded original-input full75 three-square Hill test; no plaintext",
  originalRunes:76,consumedBodyRunes:75,
  sourceSquareOrders:[5,7,5],sourceKeyOrders:[5,5,5],
  invertibleDeterminantsMod29:inverseInfo.map(v=>v.det),
  original:{ioc:ioc(C),withinWordBigramLog:originalScore},
  column:{ioc:ioc(decoded.column),withinWordBigramLog:decodedScores.column,
    plaintextCandidate:spell(decoded.column),exactForwardReplay:75},
  row:{ioc:ioc(decoded.row),withinWordBigramLog:decodedScores.row,
    plaintextCandidate:spell(decoded.row),exactForwardReplay:75},
  solvedP57NativePlant:"75/75 recovered for both orientations",
  sourceNativeEnglishControls:native,
  centrosymmetricNull:{
    trials:5000,invertible:randomScores.length,atOrAboveOriginal:greaterOrEqual,
    conditionalEmpiricalP:empiricalP
  },
  complete2DMatrixFamily:originalGridScores,
  familywiseCentrosymmetricNull:{
    trials:2000,invertible:familyNullScores.length,
    atOrAboveOriginal:familyExceedances,
    selectedBestScore:bestOriginalGridScore,
    conditionalEmpiricalP:familyP
  },
  limitation:"Row bigram lift is diagnostic and post-selected, not plaintext;"
    +" no authorial cipher opcode established."
},null,2));
console.log("SFT PASS: direct original input, two Hill inverses, native controls.");
