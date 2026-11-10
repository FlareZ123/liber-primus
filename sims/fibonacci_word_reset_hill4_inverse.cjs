"use strict";
/**
 * Source-fixed LP2 p15 4×4 Hill cipher, resetting at each printed GP word.
 *
 * Prior continuous-four-rune test sims/fibonacci_square_hill4_gate.cjs did
 * not reset or handle all four possible lengths at natural word boundaries.
 * This explicitly reversible candidate tests two source-natural ways of
 * framing nonmultiple-of-four word lengths: bypass the leftover, or use
 * the corresponding upper-left principal submatrix over F29.
 *
 * Node.js 22 SFT: node sims/fibonacci_word_reset_hill4_inverse.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");
const {
  mod, matrixInverse, dihedralOrientations, stats, encodeEnglishWord
} = require("./fibonacci_square_hill4_gate.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const CANON = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const forms = [
  ["printed-distance", [[3258,3222,3152,3038],[3278,3299,3298,2838],
    [3288,3294,3296,2472],[4516,1206,708,1820]]],
  ["underlying-primes", [[43,79,149,263],[23,2,3,463],
    [13,7,5,829],[7817,4507,2593,1481]]],
  ["prime-ordinals", [[14,22,35,56],[9,1,2,90],
    [6,4,3,145],[988,611,378,234]]],
  ["fibonacci-indices", [[13,21,34,55],[8,0,1,89],
    [5,3,2,144],[987,610,377,233]]]
];
const words = parseSharedCorpus().words.map(word =>
  [...word.runes].map(c => CANON.runes.indexOf(c)));
assert.equal(words.length, 2896);
assert.equal(words.reduce((sum, w) => sum + w.length, 0), 12956);
assert.ok(words.every(w => w.every(i => i >= 0 && i < 29)));
/** @param {number[][]} matrix */
function transpose(matrix) {
  return matrix[0].map((_, col) => matrix.map(row => row[col]));
}
/** @param {number[][]} matrix @param {number[]} block */
function multiply(matrix, block) {
  assert.equal(matrix.length, block.length);
  return matrix.map(row => mod(row.reduce(
    (acc, value, k) => acc + value * block[k], 0)));
}
/**
 * Principal upper-left minors must be invertible to make the variable
 * residual-block channel lossless.
 * @param {number[][]} full
 * @returns {number[][][]|null}
 */
function principalSizes(full) {
  const matrices = [[], ...Array.from({length: 4}, (_, i) =>
    full.slice(0, i + 1).map(row => row.slice(0, i + 1)))];
  return matrices.slice(1).every(x => matrixInverse(x)) ? matrices : null;
}
/**
 * Decode or encode all words, applying source-size matrices for full and
 * short blocks. Every visible rune position is preserved.
 * @param {number[][]} input
 * @param {number[][]} key
 * @param {"identity"|"principal"} tail
 * @param {"left"|"right"} alignment
 * @returns {number[][]}
 */
function transform(input, key, tail, alignment) {
  const matrices = tail === "principal" ? principalSizes(key) : null;
  if (tail === "principal") assert.ok(matrices);
  const out = [];
  for (const word of input) {
    const result = [];
    const residual = word.length % 4;
    const prefix = alignment === "right" ? residual : 0;
    if (prefix) {
      const part = word.slice(0, prefix);
      result.push(...(tail === "identity" ? part : multiply(matrices[prefix], part)));
    }
    for (let i = prefix; i + 4 <= word.length; i += 4)
      result.push(...multiply(key, word.slice(i, i + 4)));
    if (alignment === "left" && residual) {
      const part = word.slice(word.length - residual);
      result.push(...(tail === "identity" ?
        part : multiply(matrices[residual], part)));
    }
    assert.equal(result.length, word.length);
    out.push(result);
  }
  return out;
}
/** @param {number[][]} allWords */
function wordBigramMean(allWords, model) {
  let sum = 0, n = 0;
  for (const word of allWords) {
    for (let i = 1; i < word.length; i++) {
      sum += model[word[i - 1]][word[i]];
      n++;
    }
  }
  return sum / n;
}
const sourceWords = (read("resources/control/shakespeare_first300k.txt")
  .match(/[A-Za-z]+/g) || []).map(encodeEnglishWord);
const nativeLP1 = (read("resources/liber-primus/lp1-plaintext-reference.txt")
  .match(/[A-Za-z]+/g) || []).map(encodeEnglishWord);
const bigrams = Array.from({length: 29}, () => Array(29).fill(0.1));
for (const word of sourceWords)
  for (let i = 1; i < word.length; i++)
    bigrams[word[i-1]][word[i]]++;
const logModel = bigrams.map(row => {
  const total = row.reduce((a,b) => a+b,0);
  return row.map(value => Math.log(value / total));
});
const sourceByLength = new Map();
for (const word of sourceWords) {
  const list = sourceByLength.get(word.length) || [];
  list.push(word);
  sourceByLength.set(word.length, list);
}
for (const w of words) assert.ok(sourceByLength.has(w.length));

/** @param {number} seed */
function rng(seed) {
  let state=seed>>>0;
  return () => {
    state^=state<<13; state^=state>>>17; state^=state<<5;
    return (state>>>0)/4294967296;
  };
}
const random = rng(0x14330019);
const nativePlant = words.map(w => {
  const pool = sourceByLength.get(w.length);
  return pool[Math.floor(random()*pool.length)];
});
assert.equal(nativePlant.reduce((s,w)=>s+w.length,0),12956);
const plain = words.flat();
const outcomes = [];
let skippedPrincipal = 0;
let verifiedOriginalRoundtrips = 0;
for (const [family, base] of forms) {
  const orientations = dihedralOrientations(base);
  for (let j = 0; j < orientations.length; j++) {
    const key = orientations[j].map(row => row.map(mod));
    const inv = matrixInverse(key);
    assert.ok(inv);
    const operations = [
      ["K", key], ["K-inverse", inv],
      ["K-transpose", transpose(key)], ["K-inverse-transpose", transpose(inv)]
    ];
    for (const [operation, decoding] of operations) {
      const encoding = matrixInverse(decoding);
      assert.ok(encoding);
      for (const alignment of ["left", "right"]) {
        for (const tail of ["identity", "principal"]) {
          if (tail === "principal" && !principalSizes(decoding)) {
            skippedPrincipal++;
            continue;
          }
          const candidate = transform(words, decoding, tail, alignment);
          const restored = transform(candidate, encoding, tail, alignment);
          // For partial blocks the encoder must use inverses of the
          // *decoder's principal submatrices*, not slices of encoding.
          // The blockwise primary channel tests the intended inverse;
          // for the principal channel verify with independently
          // assembled exact inverses of each used block size below.
          let roundtrip = restored.every((w,i) => w.every((x,k)=>x===words[i][k]));
          if (tail === "principal") {
            const matrices = principalSizes(decoding);
            const correctEnc = matrices.map((mat,r) => r ? matrixInverse(mat) : []);
            const encoded = [];
            for (const word of candidate) {
              const residue=word.length%4, head=alignment==="right"?residue:0;
              const cur=[];
              if (head) cur.push(...multiply(correctEnc[head],word.slice(0,head)));
              for (let pos=head;pos+4<=word.length;pos+=4)
                cur.push(...multiply(encoding,word.slice(pos,pos+4)));
              if (alignment==="left"&&residue)
                cur.push(...multiply(correctEnc[residue],word.slice(word.length-residue)));
              encoded.push(cur);
            }
            roundtrip=encoded.every((w,i)=>w.length===words[i].length&&
              w.every((x,k)=>x===words[i][k]));
          }
          assert.ok(roundtrip, family+"/"+j+"/"+operation+"/"+alignment+"/"+tail);
          verifiedOriginalRoundtrips++;
          const flat = candidate.flat();
          const stat = stats(flat);
          outcomes.push({
            family, orientation:j, operation, alignment, residual:tail,
            ioc:stat.ioc, top12:stat.top12,
            wordBigramMean:wordBigramMean(candidate,logModel),
            firstWords: candidate.slice(0,12)
              .map(w=>w.map(n=>CANON.translit[n]).join("")).join(" ")
          });
        }
      }
    }
  }
}
const chosen=forms[0][1].map(row=>row.map(mod));
const chosenInv=matrixInverse(chosen);
assert.ok(principalSizes(chosen));
const plants=[];
for(const alignment of ["left","right"])
  for(const tail of ["identity","principal"]){
    const encrypted=transform(nativePlant,chosen,tail,alignment);
    let recovered;
    if(tail==="identity") recovered=transform(encrypted,chosenInv,tail,alignment);
    else {
      const inverseAll=principalSizes(chosen).map((mat,n)=>n?matrixInverse(mat):[]);
      recovered=[];
      for(const word of encrypted){
        const residual=word.length%4,head=alignment==="right"?residual:0,decoded=[];
        if(head)decoded.push(...multiply(inverseAll[head],word.slice(0,head)));
        for(let i=head;i+4<=word.length;i+=4)
          decoded.push(...multiply(chosenInv,word.slice(i,i+4)));
        if(alignment==="left"&&residual)decoded.push(...multiply(inverseAll[residual],word.slice(word.length-residual)));
        recovered.push(decoded);
      }
    }
    assert.deepEqual(recovered,nativePlant);
    plants.push({alignment,tail,sourceRunes:12956,exact:true,
      plantedIoC:stats(encrypted.flat()).ioc,
      sourceWordBigram:wordBigramMean(recovered,logModel)});
  }

outcomes.sort((a,b)=>b.wordBigramMean-a.wordBigramMean);
const asNumeric=x=>+x.toFixed(7);
console.log(JSON.stringify({
  model:"Source p15 Fibonacci-prime square, whole-word Hill4 with source-size reversible leftover",
  originalWordCount:words.length,
  originalRunes:plain.length,
  sourceMatrices:forms.map(x=>x[0]),
  theoreticalConfigs:4*8*4*2*2,
  invertibleOriginalConfigs:outcomes.length,
  ineligiblePrincipalConfigs:skippedPrincipal,
  originalExactRoundtrips:verifiedOriginalRoundtrips,
  raw: {ioc:asNumeric(stats(plain).ioc),
    wordBigram:asNumeric(wordBigramMean(words,logModel))},
  native: {ShakespeareWordBigram:asNumeric(wordBigramMean(sourceWords,logModel)),
    LP1WordBigram:asNumeric(wordBigramMean(nativeLP1,logModel)),
    plantedMatchedWordBigram:asNumeric(wordBigramMean(nativePlant,logModel)),
    plantedMatchedIoC:asNumeric(stats(nativePlant.flat()).ioc)},
  bestOriginal:outcomes[0],
  topTen:outcomes.slice(0,10),
  originalScoreRange: {
    wordBigram:[asNumeric(Math.min(...outcomes.map(x=>x.wordBigramMean))),
      asNumeric(Math.max(...outcomes.map(x=>x.wordBigramMean)))],
    ioc:[asNumeric(Math.min(...outcomes.map(x=>x.ioc))),
      asNumeric(Math.max(...outcomes.map(x=>x.ioc)))]
  },
  positivePlants:plants,
  conclusion:"no original GP-English plaintext recovered; precise source-fixed word-reset Hill4 family only"
},null,2));
