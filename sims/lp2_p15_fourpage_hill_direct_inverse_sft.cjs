"use strict";

/**
 * Source-selected p15 4x4 matrix as a cross-PAGE four-lane Hill operator.
 * Original square is immediately followed by physical LP2 pp16-19.
 * This distinct interpretation groups page-aligned rune positions, not
 * consecutive four-rune blocks within a page. It avoids repeating the
 * previously excluded within-page p15 Hill test.
 *
 * Run: node sims/lp2_p15_fourpage_hill_direct_inverse_sft.cjs
 * Windows 11 / Node.js 22 CommonJS, no external packages.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const {encodeSourceNativeGP} =
  require("./lp2_native_gp_source_orthography_sft.cjs");
const root = path.join(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), "utf8")
  .replace(/\r\n/g, "\n");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const M = [
  [3258, 3222, 3152, 3038],
  [3278, 3299, 3298, 2838],
  [3288, 3294, 3296, 2472],
  [4516, 1206, 708, 1820]
];
const inv = [
  [19, 1, 6, 3],
  [11, 7, 8, 22],
  [2, 10, 15, 28],
  [25, 4, 1, 15]
];
const mod = n => ((n % 29) + 29) % 29;
/** @param {number[][]} matrix */
function transpose(matrix) {return matrix.map((_,j) => matrix.map(row => row[j]));}
/** @param {number[][]} matrix @param {number[][]} lanes */
function apply(matrix, lanes) {
  const n = Math.min(...lanes.map(lane => lane.length));
  return Array.from({length:4}, (_,j) =>
    Array.from({length:n}, (_,i) =>
      mod(matrix[j].reduce((sum, v, k) => sum + v * lanes[k][i], 0))));
}
for (let row = 0; row < 4; row++)
  for (let col = 0; col < 4; col++)
    assert.equal(mod(M[row].reduce((s, v, k) => s + v * inv[k][col], 0)),
      row === col ? 1 : 0);

// Exact original physical pages directly following the page15 square.
const quartet = [16, 17, 18, 19];
const pages = quartet.map(page => source.pages.find(p => p.page === page).indices);
const length = Math.min(...pages.map(page => page.length));
assert.deepEqual(pages.map(page => page.length), [267, 273, 260, 271]);
assert.equal(length, 260);

// Source-native English control trained before applying any candidate inverse.
const text = encodeSourceNativeGP(read("resources/control/shakespeare_first300k.txt"));
assert.equal(text.length, 217106);
const bigram = new Int32Array(29*29);
const trigram = new Int32Array(29*29*29);
for (let i = 2; i < text.length; i++) {
  const b = 29*text[i-2]+text[i-1];
  bigram[b]++;
  trigram[29*b+text[i]]++;
}
/** @param {number[]} seq */
function score(seq) {
  let log = 0;
  for (let i = 2; i < seq.length; i++) {
    const b = 29*seq[i-2] + seq[i-1];
    log += Math.log((trigram[29*b+seq[i]]+1)/(bigram[b]+29));
  }
  return log/(seq.length-2);
}
const controlScore = score(text);
assert(Math.abs(controlScore + 2.2630996484763246) < 1e-10);

// Held-out author-authentic original GP cleartext from LP1, distinct
// from both the Shakespeare model and unknown LP2 ciphertext.
const lp1Original = read("resources/transcriptions/lp1_wulfic_canonical.txt")
  .split("%");
const runeIndex = new Map(source.runes.map((rune,i)=>[rune,i]));
const clearNativePages = [3,8,9,10,11,14].map(page =>
  [...lp1Original[page]].filter(rune => runeIndex.has(rune))
    .map(rune => runeIndex.get(rune)));
assert.deepEqual(clearNativePages.map(page=>page.length),
  [157,187,207,192,169,89]);
const clearAuthorScore = clearNativePages.reduce((s,p)=>
  s + (p.length-2)*score(p),0)
  / clearNativePages.reduce((s,p)=>s+p.length-2,0);
assert(Math.abs(clearAuthorScore + 2.4757345029752367) < 1e-10);

// Native source plant: across four known plaintext lanes, exact inverse
// reconstructs all 4*260 original GP symbols from the printed 4x4 matrix.
const plant = Array.from({length:4}, (_,j) =>
  text.slice(j * length, (j+1) * length));
assert.deepEqual(apply(inv, apply(M, plant)), plant);
assert.deepEqual(apply(transpose(inv),apply(transpose(M),plant)),plant);
const raw = pages.map(page => score(page.slice(0,length)));
const orientations = [
  ["printed-square-as-encoder/column-vector", inv],
  ["printed-square-as-encoder/row-vector", transpose(inv)],
  ["printed-square-as-decoder/column-vector", M],
  ["printed-square-as-decoder/row-vector", transpose(M)]
];
const tests = orientations.map(([name, matrix]) => {
  const output = apply(matrix, pages);
  return {name, scorePerPage:output.map(score),
    mean: output.reduce((s, page) => s + score(page), 0)/4,
    outputSample: output[0].slice(0, 28).map(i =>
      i === 21 ? "ING" : i === 27 ? "IO" : source.translit[i]).join("")};
});
assert(tests.every(x => x.mean < -3.6),
  "source-chosen 4-page direct inverse must not be promoted as plaintext");
console.log(JSON.stringify({
  status:"Four p15 source-selected cross-page direct inverses remain nonlinguistic",
  source:"physical p15 4x4 matrix; next four physical pages pp16-19",
  pageCounts:pages.map(p=>p.length),
  sharedOffsetLength:length,
  testedRuneOutput:4*length,
  sourceNativeShakespeareTrigramControl:controlScore,
  originalAuthorHeldoutClearLP1Score:clearAuthorScore,
  originalCipherTrigramScores:raw,
  exactNativePositivePlantRecovered:4*length,
  tests,
  unknownPlaintextRecovered:false
},null,2));
