#!/usr/bin/env node
"use strict";

/**
 * Reproduce the five source-indexed five-rune fragment matrix readout.
 *
 * Hypothesis: the authenticated 2016 message has 43 words; its zero-based
 * word index i selects LP2 page i and one-based fragment i+1. The p36
 * GOOD/fragment37 state hit supports this inferred map. Exactly five of
 * the 42 available indexed fragments have length 5, matching the 5x5
 * 2014 Stage04 Wisdom square.
 *
 * The primary candidate readout is row sums modulo 43 (the codebook size).
 * The phi-grid M is independently source-derived from the 2014 square.
 * This is an intermediate instruction-level observation, NOT a complete
 * LP2 decryption. The p29/p30 feature-H2D continuation is explicitly
 * provisional because feature order is not fixed by a source instruction.
 *
 * From repository root:
 *   node sims/lp2_five_indexed_fragments_row_sum_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8").replace(/\r/g, "");

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcription = read("resources/liber-primus/lp2-transcription.txt");
const signed2016 = read("resources/historical/cicada2016-4gq25-outguess.asc");
const squareText = read("resources/external/derived/2014-stage04/05-square.txt");
const runeIndex = new Map(corpus.runes.map((rune,index) => [rune,index]));
const parts = transcription.split(/^\s*%\s*$/m);

const mod29 = value => ((value % 29) + 29) % 29;
const mod43 = value => ((value % 43) + 43) % 43;

function pageRaw(page) {
  if (page === 50) return "";
  return parts[page < 50 ? page : page - 1] || "";
}

function parseWords(page) {
  const words = [];
  let values = [];
  let offset = 0;
  let start = 0;
  const flush = () => {
    if (!values.length) return;
    words.push({
      page,
      index: words.length,
      ordinal: words.length + 1,
      start,
      end: offset - 1,
      length: values.length,
      gp0: values.reduce((sum,value) => sum + value,0),
      values: values.slice()
    });
    values = [];
  };
  for (const character of pageRaw(page)) {
    if (runeIndex.has(character)) {
      if (!values.length) start = offset;
      values.push(runeIndex.get(character));
      offset += 1;
    } else if (character === "/" || /\s/u.test(character)) {
      // Printed line wraps do not terminate a word.
    } else {
      flush();
    }
  }
  flush();
  return {words,runeCount:offset};
}

function signedWords() {
  const clear = signed2016
    .split("-----BEGIN PGP SIGNATURE-----")[0]
    .replace(/^-----BEGIN PGP SIGNED MESSAGE-----[\s\S]*?Hash: SHA1\s*/,"")
    .replace(/\b3301\b/g,"")
    .replace(/\b[0-9A-F]{8,}\b/g,"");
  return (clear.match(/[A-Za-z]+/g) || []).map(word => word.toUpperCase());
}

function phi(value) {
  let remaining = value;
  let result = value;
  for (let p=2; p*p<=remaining; p+=1) {
    if (remaining % p === 0) {
      while (remaining % p === 0) remaining /= p;
      result -= result/p;
    }
  }
  if (remaining > 1) result -= result/remaining;
  return result;
}

function inverseMod29(matrix) {
  const n = matrix.length;
  const augmented = matrix.map((row,i) => [
    ...row.map(mod29),
    ...Array.from({length:n},(_,j) => +(i===j))
  ]);
  for (let column=0; column<n; column+=1) {
    let pivot = column;
    while (pivot<n && augmented[pivot][column]===0) pivot+=1;
    assert.ok(pivot<n, "matrix is singular modulo 29");
    [augmented[column],augmented[pivot]] = [augmented[pivot],augmented[column]];
    let inversePivot = 1;
    while (mod29(augmented[column][column]*inversePivot)!==1) inversePivot+=1;
    augmented[column] = augmented[column].map(value => mod29(value*inversePivot));
    for (let row=0; row<n; row+=1) {
      if (row===column) continue;
      const factor = augmented[row][column];
      augmented[row] = augmented[row].map((value,j) =>
        mod29(value-factor*augmented[column][j]));
    }
  }
  return augmented.map(row => row.slice(n));
}

function multiply(left,right) {
  return left.map(row => right[0].map((_,column) =>
    mod29(row.reduce((sum,value,k) => sum+value*right[k][column],0))));
}

function rowSumsMod43(matrix) {
  return matrix.map(row => mod43(row.reduce((sum,value) => sum+value,0)));
}
function columnSumsMod43(matrix) {
  return matrix[0].map((_,column) =>
    mod43(matrix.reduce((sum,row) => sum+row[column],0)));
}
function diagonalSumsMod43(matrix) {
  const n = matrix.length;
  return [
    mod43(Array.from({length:n},(_,i) => matrix[i][i]).reduce((a,b)=>a+b,0)),
    mod43(Array.from({length:n},(_,i) => matrix[i][n-1-i]).reduce((a,b)=>a+b,0))
  ];
}
const words = signedWords();
assert.equal(words.length,43);
assert.equal(words[12],"THE");
assert.equal(words[29],"DIRECTION");
assert.equal(words[30],"SEEK");
assert.equal(words[26],"NUMBERS");
assert.equal(words[17],"THE");
assert.equal(words[5],"EPIPHANY");
assert.equal(words[21],"IS");
assert.equal(words[28],"THE");
assert.equal(words[10],"PRIMUS");
assert.equal(words[41],"VERIFY");
assert.equal(words[40],"PATHS");

const indexed = [];
for (let i=0; i<words.length; i+=1) {
  const fragment = parseWords(i).words[i];
  if (fragment) indexed.push(fragment);
}
assert.equal(indexed.length,42); // p32 has no fragment 33.
const lengthDistribution = indexed.reduce((counts,fragment) => {
  counts[fragment.length] = (counts[fragment.length] || 0)+1;
  return counts;
},{});
assert.deepEqual(lengthDistribution,{
  1:1,2:10,3:11,4:7,5:5,6:1,7:2,8:4,10:1
});

const selected = indexed.filter(fragment => fragment.length===5);
assert.deepEqual(selected.map(fragment => [fragment.page,fragment.ordinal]),[
  [9,10],[12,13],[15,16],[36,37],[40,41]
]);
assert.deepEqual(selected.map(fragment => fragment.values),[
  [15,13,14,27,6],
  [28,1,0,15,20],
  [10,13,8,27,17],
  [2,22,4,1,20],
  [0,23,4,28,6]
]);
assert.equal(words[36],"GOOD");
assert.deepEqual(parseWords(36).words[36].values,[2,22,4,1,20]);

// The five selected fragments are columns, in ascending physical-page order.
const C = Array.from({length:5},(_,row) => selected.map(fragment => fragment.values[row]));
assert.deepEqual(C,[
  [15,28,10,2,0],
  [13,1,13,22,23],
  [14,0,8,4,4],
  [27,15,27,1,28],
  [6,20,17,20,6]
]);
const rawRowIndices = rowSumsMod43(C);
assert.deepEqual(rawRowIndices,[12,29,30,12,26]);
const rawRowWords = rawRowIndices.map(index => words[index]);
assert.deepEqual(rawRowWords,["THE","DIRECTION","SEEK","THE","NUMBERS"]);

const squareNumbers = squareText.match(/\d+/g).map(Number);
assert.equal(squareNumbers.length,25);
const S = Array.from({length:5},(_,row) => squareNumbers.slice(row*5,row*5+5));
const squareRows = S.map(row => row.reduce((sum,value)=>sum+value,0));
const squareColumns = S[0].map((_,column) =>
  S.reduce((sum,row)=>sum+row[column],0));
const squareDiagonals = [
  S.reduce((sum,row,i)=>sum+row[i],0),
  S.reduce((sum,row,i)=>sum+row[4-i],0)
];
assert.deepEqual(squareRows,[1033,1033,1033,1033,1033]);
assert.deepEqual(squareColumns,[1033,1033,1033,1033,1033]);
assert.deepEqual(squareDiagonals,[1033,1033]);

const M = S.map(row => row.map(value => mod29(phi(value))));
assert.deepEqual(M,[
  [12,15,10,14,5],
  [4,24,19,12,6],
  [25,23,14,23,25],
  [6,12,19,24,4],
  [5,14,10,15,12]
]);
const MInverse = inverseMod29(M);
const Y = multiply(M,C);
assert.deepEqual(Y,[
  [24,23,17,15,24],
  [12,1,2,19,14],
  [17,2,25,4,16],
  [24,11,11,21,4],
  [4,10,22,4,13]
]);
const transformedRowIndices = rowSumsMod43(Y);
assert.deepEqual(transformedRowIndices,[17,5,21,28,10]);
assert.deepEqual(transformedRowIndices.map(index => words[index]),
  ["THE","EPIPHANY","IS","THE","PRIMUS"]);
const transformedColumnIndices = columnSumsMod43(Y);
assert.deepEqual(transformedColumnIndices,[38,4,34,20,28]);
assert.deepEqual(transformedColumnIndices.map(index => words[index]),
  ["BEWARE","EMPTY","BE","MEANING","THE"]);
const transformedDiagonalIndices = diagonalSumsMod43(Y);
assert.deepEqual(transformedDiagonalIndices,[41,40]);
assert.deepEqual(transformedDiagonalIndices.map(index => words[index]),
  ["VERIFY","PATHS"]);

const inverseOutput = multiply(MInverse,C);
const inverseRowIndices = rowSumsMod43(inverseOutput);
assert.deepEqual(inverseRowIndices,[23,36,21,29,12]);
assert.deepEqual(inverseRowIndices.map(index => words[index]),
  ["ROAD","GOOD","IS","DIRECTION","THE"]);

// The raw row-sum indices feed the same page/fragment map.
const pathFragments = rawRowIndices.map(index => parseWords(index).words[index]);
assert.deepEqual(pathFragments.map(fragment => [
  fragment.page,fragment.ordinal,fragment.length,fragment.gp0,fragment.values
]),[
  [12,13,5,64,[28,1,0,15,20]],
  [29,30,4,66,[11,26,11,18]],
  [30,31,3,56,[22,12,22]],
  [12,13,5,64,[28,1,0,15,20]],
  [26,27,3,45,[4,19,22]]
]);

function H2(row) {
  assert.equal(row.length,2);
  return [mod29(row[0]-row[1]),mod29(row[0]+row[1])];
}
function H2D(matrix) {
  const upper = H2(matrix[0]);
  const lower = H2(matrix[1]);
  return [
    [mod29(upper[0]-lower[0]),mod29(upper[1]-lower[1])],
    [mod29(upper[0]+lower[0]),mod29(upper[1]+lower[1])]
  ];
}
function H2inv(difference,sum) {
  const inverseTwo = 15;
  return [
    mod29((difference+sum)*inverseTwo),
    mod29((sum-difference)*inverseTwo)
  ];
}
function H2Dinv(matrix) {
  const differences = H2inv(matrix[0][0],matrix[1][0]);
  const sums = H2inv(matrix[0][1],matrix[1][1]);
  return [
    H2inv(differences[0],sums[0]),
    H2inv(differences[1],sums[1])
  ];
}
const p29 = pathFragments[1];
const p30 = pathFragments[2];
const gp0Length = [
  [mod29(p29.gp0),p29.length],
  [mod29(p30.gp0),p30.length]
];
const gp0LengthOutput = H2D(gp0Length);
assert.deepEqual(gp0Length,[[8,4],[27,3]]);
assert.deepEqual(gp0LengthOutput,[[9,11],[28,13]]);
assert.deepEqual(H2Dinv(gp0LengthOutput),gp0Length);
assert.deepEqual(gp0LengthOutput.flat().map(index => words[index]),
  ["LIBER","IS","THE","WAY"]);

const lengthGp0 = [
  [p29.length,mod29(p29.gp0)],
  [p30.length,mod29(p30.gp0)]
];
const lengthGp0Output = H2D(lengthGp0);
assert.deepEqual(lengthGp0,[[4,8],[3,27]]);
assert.deepEqual(lengthGp0Output,[[20,11],[1,13]]);
assert.deepEqual(H2Dinv(lengthGp0Output),lengthGp0);
assert.deepEqual(lengthGp0Output.flat().map(index => words[index]),
  ["MEANING","IS","THE","WAY"]);

// p12/p26 is a same-path control: it does not reproduce "IS THE WAY".
const p12 = pathFragments[0];
const p26 = pathFragments[4];
const p12p26 = H2D([
  [mod29(p12.gp0),p12.length],
  [mod29(p26.gp0),p26.length]
]);
assert.deepEqual(p12p26,[[17,21],[14,1]]);
assert.deepEqual(p12p26.flat().map(index => words[index]),
  ["THE","IS","ITS","THE"]);

const secondPathFragments = transformedRowIndices.map(index =>
  parseWords(index).words[index]);
assert.deepEqual(secondPathFragments.map(fragment => fragment.length),
  [3,4,2,2,3]); // No second 5x5 group; stop rather than recurse.


// Finite source-indexed offset and matched-window familywise controls.
// A control chooses five distinct indexed fragments (page order), then one
// contiguous five-rune window from each. Longer fragments contribute every
// possible window; no duplicate fragment is permitted.
function matrixStats(matrix) {
  return {
    row: rowSumsMod43(matrix),
    column: columnSumsMod43(matrix),
    diagonal: diagonalSumsMod43(matrix)
  };
}
function indexedMap(pageOffset,fragmentOffset) {
  const result=[];
  for(let i=0;i<words.length;i+=1) {
    const page=i+pageOffset;
    const ordinal=i+1+fragmentOffset;
    const fragment=parseWords(page).words[ordinal-1];
    if(fragment) result.push(fragment);
  }
  return result;
}
const oneBasedRawRowWords=rawRowIndices.map(index =>
  index>0 ? words[index-1] : "INVALID");
assert.deepEqual(oneBasedRawRowWords,["IS","THE","DIRECTION","IS","THEIR"]);
const baseCoordinates=selected.map(fragment=>[fragment.page,fragment.ordinal]);
const offsetVariants=[];
for(const pageOffset of [-1,0,1]) {
  for(const fragmentOffset of [-1,0,1]) {
    const mapped=indexedMap(pageOffset,fragmentOffset);
    const five=mapped.filter(fragment=>fragment.length===5);
    offsetVariants.push({
      pageOffset,fragmentOffset,indexedCount:mapped.length,
      fiveRuneCount:five.length,
      fiveRuneCoordinates:five.map(fragment=>[fragment.page,fragment.ordinal])
    });
  }
}
for(const [pageOffset,fragmentOffset] of [[-1,-1],[1,1]]) {
  assert.deepEqual(
    indexedMap(pageOffset,fragmentOffset)
      .filter(fragment=>fragment.length===5)
      .map(fragment=>[fragment.page,fragment.ordinal]),
    baseCoordinates
  );
}

const eligible=indexed.filter(fragment=>fragment.length>=5).map(fragment=>({
  ...fragment,
  windows:Array.from(
    {length:fragment.length-4},
    (_,start)=>fragment.values.slice(start,start+5)
  )
}));
assert.equal(eligible.length,13);
const currentStats={
  raw:matrixStats(C),
  phi:matrixStats(Y),
  inverse:matrixStats(inverseOutput)
};
const targetVectors={
  rawRow:currentStats.raw.row,
  rawColumn:currentStats.raw.column,
  rawDiagonal:currentStats.raw.diagonal,
  phiRow:currentStats.phi.row,
  phiColumn:currentStats.phi.column,
  phiDiagonal:currentStats.phi.diagonal,
  inverseRow:currentStats.inverse.row,
  inverseColumn:currentStats.inverse.column,
  inverseDiagonal:currentStats.inverse.diagonal
};
const familywiseCounts=Object.fromEntries(
  Object.keys(targetVectors).map(key=>[key,0])
);
let controlSelections=0;
function enumerateMatchedControls(start,chosen,windowChoices) {
  if(chosen.length===5) {
    controlSelections+=1;
    const candidate=Array.from({length:5},(_,row)=>
      chosen.map((fragment,column)=>
        fragment.windows[windowChoices[column]][row]
      )
    );
    const raw=matrixStats(candidate);
    const phi=matrixStats(multiply(M,candidate));
    const inverse=matrixStats(multiply(MInverse,candidate));
    const actual={
      rawRow:raw.row,rawColumn:raw.column,rawDiagonal:raw.diagonal,
      phiRow:phi.row,phiColumn:phi.column,phiDiagonal:phi.diagonal,
      inverseRow:inverse.row,inverseColumn:inverse.column,
      inverseDiagonal:inverse.diagonal
    };
    for(const key of Object.keys(targetVectors)) {
      if(JSON.stringify(actual[key])===JSON.stringify(targetVectors[key])) {
        familywiseCounts[key]+=1;
      }
    }
    return;
  }
  for(let i=start;i<=eligible.length-(5-chosen.length);i+=1) {
    const fragment=eligible[i];
    chosen.push(fragment);
    for(let window=0;window<fragment.windows.length;window+=1) {
      windowChoices.push(window);
      enumerateMatchedControls(i+1,chosen,windowChoices);
      windowChoices.pop();
    }
    chosen.pop();
  }
}
enumerateMatchedControls(0,[],[]);
assert.equal(controlSelections,133701);
assert.deepEqual(familywiseCounts,{
  rawRow:1,rawColumn:1,rawDiagonal:77,
  phiRow:1,phiColumn:2,phiDiagonal:73,
  inverseRow:1,inverseColumn:6,inverseDiagonal:109
});

console.log(JSON.stringify({
  status:"intermediate instruction-level readout; not a complete decryption",
  sourceWordCount:words.length,
  sourceIndexedFragmentCount:indexed.length,
  lengthDistribution,
  fiveRuneFragments:selected.map(fragment => ({
    page:fragment.page,ordinal:fragment.ordinal,values:fragment.values,
    gp0:fragment.gp0
  })),
  rawMatrix:C,
  rawRowIndices,
  rawRowWords,
  phiGrid:M,
  phiGridTimesRaw:Y,
  transformedRowIndices,
  transformedRowWords:transformedRowIndices.map(index => words[index]),
  transformedDiagonalIndices,
  transformedDiagonalWords:transformedDiagonalIndices.map(index => words[index]),
  inverseRowIndices,
  inverseRowWords:inverseRowIndices.map(index => words[index]),
  rawRowSumPagePath:rawRowIndices,
  followThrough:{
    p29:p29.values,p29Length:p29.length,p29Gp0:p29.gp0,
    p30:p30.values,p30Length:p30.length,p30Gp0:p30.gp0,
    gp0LengthOutput,gp0LengthWords:gp0LengthOutput.flat().map(index => words[index]),
    lengthGp0Output,lengthGp0Words:lengthGp0Output.flat().map(index => words[index]),
    p12p26Control:p12p26.flat().map(index => words[index])
  },
  secondPathLengths:secondPathFragments.map(fragment => fragment.length),
  oneBasedRawRowWords,
  readoutAlternatives:{
    rawColumnWords:currentStats.raw.column.map(index=>words[index]),
    rawDiagonalWords:currentStats.raw.diagonal.map(index=>words[index]),
    phiColumnWords:currentStats.phi.column.map(index=>words[index]),
    phiDiagonalWords:currentStats.phi.diagonal.map(index=>words[index]),
    inverseRowWords:currentStats.inverse.row.map(index=>words[index])
  },
  pageFragmentOffsetVariants:offsetVariants,
  matchedControlFamily:{
    description:"five distinct indexed fragments, page order, one contiguous five-rune window per fragment",
    eligibleFragments:eligible.length,
    selections:controlSelections,
    exactCurrentVectorOccurrences:familywiseCounts
  }
},null,2));
