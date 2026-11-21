"use strict";

/**
 * Source-exact GP29 matrix certificate in the five p7 red words.
 * This is a finite, intermediate hypothesis test, not a solved LP2 cipher.
 *
 * Run: node sims/lp2_p7_red_hill2_certificate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const parts = read("resources/lp2-transcription.txt").split("%");
const glyph = new Map(corpus.runes.map((value, index) => [value, index]));
const mod = (n) => ((n % 29) + 29) % 29;

/**
 * Read original same-page printed words with unmodified GP values.
 * @param {number} page Physical LP2 page number through p49
 * @returns {{start:number,end:number,values:number[],product:number}[]}
 */
function wordsOnPage(page) {
  /** @type {{start:number,end:number,values:number[],product:number}[]} */
  const words = [];
  /** @type {number[]} */
  let values = [];
  let offset = 0;
  const flush = () => {
    if (!values.length) return;
    words.push({
      start: offset - values.length,
      end: offset,
      values: values.slice(),
      product: values.reduce((a, v) => mod(a * v), 1)
    });
    values = [];
  };
  for (const ch of parts[page]) {
    const v = glyph.get(ch);
    if (v !== undefined) {
      values.push(v);
      offset++;
    } else if ("-.$&§".includes(ch)) {
      flush();
    }
  }
  flush();
  return words;
}

const p7 = wordsOnPage(7);
const packet = p7.filter((word) => word.start >= 194 && word.end <= 208);
assert.deepEqual(packet.map((word) => word.values), [
  [23,3], [22,16,2,25], [5,7,11], [14,28], [6,28,19]
]);
const products = packet.map((word) => word.product);
assert.deepEqual(products, [11,26,8,15,2]);

/** @param {number[]} matrix */
function determinant(matrix) {
  return mod(matrix[0] * matrix[3] - matrix[1] * matrix[2]);
}
/** @param {number[]} a @param {number[]} b */
function matrixProduct(a, b) {
  return [
    mod(a[0] * b[0] + a[1] * b[2]),
    mod(a[0] * b[1] + a[1] * b[3]),
    mod(a[2] * b[0] + a[3] * b[2]),
    mod(a[2] * b[1] + a[3] * b[3])
  ];
}
const matrix = products.slice(0,4);
const certificate = products[4];
const det = determinant(matrix);
assert.equal(det, 15);
assert.equal(mod(det * certificate), 1);
const inverse = [
  mod(certificate * matrix[3]),
  mod(-certificate * matrix[1]),
  mod(-certificate * matrix[2]),
  mod(certificate * matrix[0])
];
assert.deepEqual(inverse, [1,6,13,22]);
assert.deepEqual(matrixProduct(matrix,inverse), [1,0,0,1]);
assert.deepEqual(matrixProduct(inverse,matrix), [1,0,0,1]);

// Charge the certificate against every same-page five-word window, while
// retaining the earlier DH-packet reciprocal-pair condition as a separately
// recorded and initially independently observed prerequisite.
let windows = 0, certified = 0, reciprocal = 0;
/** @type {{page:number,start:number,products:number[]}[]} */
const joint = [];
for (let p = 0; p <= 55; p++) {
  const words = wordsOnPage(p);
  for (let i = 0; i + 5 <= words.length; i++) {
    windows++;
    const values = words.slice(i,i+5).map(w => w.product);
    const fitsCertificate = mod(determinant(values.slice(0,4)) * values[4]) === 1;
    const fitsReciprocals = mod(values[0]*values[2])===1 &&
      mod(values[3]*values[4])===1;
    if (fitsCertificate) certified++;
    if (fitsReciprocals) reciprocal++;
    if (fitsCertificate && fitsReciprocals) {
      joint.push({page:p,start:words[i].start,products:values});
    }
  }
}
assert.equal(windows,2729);
assert.equal(certified,83);
assert.equal(reciprocal,1);
assert.deepEqual(joint,[{page:7,start:194,products:[11,26,8,15,2]}]);

/**
 * Lossless Hill-2 on an EVEN number of GP29 rune values. No key/phase search.
 * @param {number[]} vals
 * @param {number[]} key
 * @returns {number[]}
 */
function hill2(vals,key) {
  assert.equal(vals.length % 2, 0);
  /** @type {number[]} */
  const out=[];
  for (let i=0;i<vals.length;i+=2) {
    out.push(mod(key[0]*vals[i]+key[1]*vals[i+1]));
    out.push(mod(key[2]*vals[i]+key[3]*vals[i+1]));
  }
  return out;
}
/** @param {number[]} vals */
function ioc(vals) {
  const bins = new Array(29).fill(0);
  vals.forEach(v => bins[v]++);
  return bins.reduce((sum,n) => sum+n*(n-1),0)/(vals.length*(vals.length-1));
}

const p8 = corpus.pages[8].indices;
assert.equal(p8.length,255);
const first254 = p8.slice(0,254);
const p8Decoded = hill2(first254,inverse);
assert.deepEqual(hill2(p8Decoded,matrix),first254);
const p8DecodedPrefix = p8Decoded.slice(0,70).map(x=>corpus.translit[x]).join("");
assert.equal(p8DecodedPrefix,
  "TAEEOLIATHLNOEOEEWDIAIEOCRSSRRYEAEAEAEPJJMEJLIIAMYTHXUOEBIYWTHDPNCLLENEOIHOEDBOWIACTHOEAS");

// Independent authentic clear-GP positive: same algebra recovers every
// known rune after a freshly constructed Hill-2 encryption.
const known = corpus.pages[57].indices;
assert.equal(known.length,95);
const knownEven = known.slice(0,94);
assert.deepEqual(hill2(hill2(knownEven,matrix),inverse),knownEven);

const chapter = corpus.pages.slice(8,15).flatMap(p=>p.indices);
assert.equal(chapter.length,1729);
const chapterEven = chapter.slice(0,1728);
const chapterPlain = hill2(chapterEven,inverse);
assert.deepEqual(hill2(chapterPlain,matrix),chapterEven);

// One additional fixed composite receiver from already source-visible
// p7 five-dot order [2,4,0,3,1] and the original p10 inline Arabic 7.
// Existing p7 five-dot report establishes p8..p14 = 1729 rune values,
// + original numeral 7 at span offset692 = 1730 = 5 columns of 346.
// Interleave in the literal dot order, then apply the NEW p7 Hill-2 key.
const p7DotOrder = [2,4,0,3,1];
const withNumeral = chapter.slice();
withNumeral.splice(692,0,7);
assert.equal(withNumeral.length,1730);
const dotColumns = Array.from({length:5},(_,column) =>
  withNumeral.slice(column*346,(column+1)*346));
const dotInterleaved = [];
for(let row=0;row<346;row++) {
  for(const column of p7DotOrder) dotInterleaved.push(dotColumns[column][row]);
}
assert.equal(dotInterleaved.length,1730);
assert.equal(dotInterleaved[0],7);
const dotHill2Plain = hill2(dotInterleaved,inverse);
assert.deepEqual(hill2(dotHill2Plain,matrix),dotInterleaved);
const dotHill2Prefix = dotHill2Plain.slice(0,55)
  .map(value=>corpus.translit[value]).join("");
assert.ok(Math.abs(29*ioc(dotHill2Plain)-1.0002153003674148)<1e-12);
assert.ok(Math.abs(29*ioc(dotInterleaved)-0.9992651704851279)<1e-12);

// Original p6 red11 ends at offset82; p7 red14 begins at offset194.
// This prints exactly 308 = 28*11 unred GP rune symbols. The source
// p7 Hill2 matrix itself has multiplicative order28 over GF29, checked
// explicitly, so the 28x11 shape is a genuinely source-addressable
// alternate receiver. Apply ONE row-adjacent columnwise Hill2 inverse.
let order = 0;
let power = [1,0,0,1];
do {
  power = matrixProduct(power,matrix);
  order++;
  assert.ok(order <= 840);
} while (!power.every((v,i)=>v===[1,0,0,1][i]));
assert.equal(order,28);
const betweenReds = corpus.pages[6].indices.slice(82)
  .concat(corpus.pages[7].indices.slice(0,194));
assert.equal(betweenReds.length,308);
const rows = 28, columns = 11;
/**
 * @param {number[]} source
 * @param {number[]} key
 * @returns {number[]}
 */
function rowPairHill2(source,key) {
  assert.equal(source.length,rows*columns);
  const target = source.slice();
  for(let row=0;row<rows;row+=2) {
    for(let column=0;column<columns;column++) {
      const i=row*columns+column, j=(row+1)*columns+column;
      target[i]=mod(key[0]*source[i]+key[1]*source[j]);
      target[j]=mod(key[2]*source[i]+key[3]*source[j]);
    }
  }
  return target;
}
const rowPairPlain = rowPairHill2(betweenReds,inverse);
assert.deepEqual(rowPairHill2(rowPairPlain,matrix),betweenReds);
assert.ok(Math.abs(29*ioc(rowPairPlain)-0.9832691738229198)<1e-12);

const result = {
  classification:"New exact p7 GP29 2x2 matrix+inverse-determinant certificate; direct receiver negative",
  fiveOriginalRedWordProducts:products, matrix, determinant:det,
  finalWordInverseDeterminant:certificate, inverse,
  census:{windows,certificates:certified,fixedInversePairWindows:reciprocal,joint},
  knownClearPositive:{runes:94,recovered:94},
  p8FixedReceiver:{runes:254,unchangedOddTail:1,
    ciphertextNormalizedIoC:29*ioc(first254),
    decodedNormalizedIoC:29*ioc(p8Decoded),
    prefix70:p8DecodedPrefix,
    exactReencrypt:true},
  p8to14FixedReceiver:{runes:1728,unchangedOddTail:1,
    decodedNormalizedIoC:29*ioc(chapterPlain),exactReencrypt:true},
  dotSelected1730Hill2Receiver:{
    pages:"p8..p14",inlineNumeralOffset:692,
    sourceDotOrder:p7DotOrder,uniqueFirstSymbol:dotInterleaved[0],
    originalRunes:1729,withInline7:1730,pairedRunes:1730,
    ciphertextNormalizedIoC:29*ioc(dotInterleaved),
    decodedNormalizedIoC:29*ioc(dotHill2Plain),
    decodedPrefix55:dotHill2Prefix,exactReencrypt:true
  },
  sourceBracketingGapHill2Receiver:{
    sourceMatrixOrder:order,sourceRedP6KeyWidth:11,
    gap:308,rows,columns,
    inputNormalizedIoC:29*ioc(betweenReds),
    decodedNormalizedIoC:29*ioc(rowPairPlain),
    prefix80:rowPairPlain.slice(0,80).map(v=>corpus.translit[v]).join(""),
    exactReencrypt:true
  },
  recoveredUnknownPlaintext:false
};
console.log(JSON.stringify(result,null,2));
