"use strict";
/**
 * Original-input taxicab chapter/cubic-transposition gate (source-frozen).
 * Run from the repository root: node sims/lp2_taxicab_chapter_cube_sft.cjs
 *
 * This is a bounded inverse for the unkeyed three-dimensional axis-permutation
 * cipher family. It does not assume that page boundaries are cube-layer cuts.
 * Native GP-English calibration and a planted exact inverse are included.
 * @module lp2_taxicab_chapter_cube_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const languageText = read("resources/control/shakespeare_first300k.txt");
const orders = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const N = 29;
const alpha = 0.005;

/**
 * Normalize Latin source text into the repository's GP29 transliteration.
 * Unrecognized source letters are discarded; no text from LP2 is trained on.
 * @param {string} source
 * @returns {number[]}
 */
function toGP(source) {
  const choices = gp.translit.map((v, i) => ({ v, i }))
    .sort((a, b) => b.v.length - a.v.length);
  const normalized = source.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S")
    .replace(/Q/g, "C");
  const out = [];
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let j = 0; j < word.length;) {
      const choice = choices.find(x => word.startsWith(x.v, j));
      if (choice) { out.push(choice.i); j += choice.v.length; }
      else j++;
    }
  }
  return out;
}

/**
 * Train a smoothed conditional trigram model on first 75% of the frozen
 * Shakespeare source, with the remaining 25% reserved for native controls.
 * @param {number[]} corpus
 * @returns {{ score: (seq: number[]) => number, trainLength: number }}
 */
function trainLanguage(corpus) {
  const trainLength = Math.floor(corpus.length * 0.75);
  const three = new Float64Array(N ** 3).fill(alpha);
  const two = new Float64Array(N ** 2).fill(N * alpha);
  for (let i = 2; i < trainLength; i++) {
    const triple = corpus[i-2] * N * N + corpus[i-1] * N + corpus[i];
    three[triple]++;
    two[Math.floor(triple / N)]++;
  }
  return {
    trainLength,
    score(seq) {
      let log = 0;
      for (let i = 2; i < seq.length; i++) {
        const triple = seq[i-2] * N * N + seq[i-1] * N + seq[i];
        log += Math.log(three[triple] / two[Math.floor(triple / N)]);
      }
      return log / (seq.length - 2);
    }
  };
}

/**
 * The output axis order is the specified permutation of the input 3D axes;
 * each output axis can independently be read in the reverse direction.
 * @param {number[]} vector
 * @param {[number,number,number]} dims
 * @param {[number,number,number]} order
 * @param {number} reverseMask
 * @returns {number[]}
 */
function readAxes(vector, dims, order, reverseMask) {
  assert.equal(vector.length, dims[0]*dims[1]*dims[2]);
  const outputDims = order.map(axis => dims[axis]);
  const out = [];
  for (let x = 0; x < outputDims[0]; x++) {
    for (let y = 0; y < outputDims[1]; y++) {
      for (let z = 0; z < outputDims[2]; z++) {
        const xyz = [x,y,z], position = [0,0,0];
        for (let axis = 0; axis < 3; axis++) {
          position[order[axis]] = (reverseMask & (1 << axis))
            ? outputDims[axis] - 1 - xyz[axis] : xyz[axis];
        }
        out.push(vector[(position[0]*dims[1] + position[1])*dims[2] + position[2]]);
      }
    }
  }
  return out;
}

/**
 * Build exact forward inverse of the proposed transposition using a positional
 * plant. If plaintext = readAxes(ciphertext), then each plaintext position is
 * placed into its indicated ciphertext position by this inverse.
 * @param {number[]} plain
 * @param {[number,number,number]} dims
 * @param {[number,number,number]} order
 * @param {number} reverseMask
 * @returns {number[]}
 */
function encodePlant(plain, dims, order, reverseMask) {
  const map = readAxes(Array.from({length: plain.length}, (_, i) => i),
    dims, order, reverseMask);
  const ciphertext = new Array(plain.length);
  for (let i = 0; i < map.length; i++) ciphertext[map[i]] = plain[i];
  return ciphertext;
}

/**
 * Exhaust the 3! axis orders times 2^3 independent reversals.
 * @param {number[]} original
 * @param {[number,number,number]} dims
 * @param {(seq:number[])=>number} score
 * @returns {{raw:number,best:{order:string,mask:number,score:number},mean:number}}
 */
function scan(original, dims, score) {
  const candidates = orders.flatMap(order =>
    Array.from({length:8}, (_, mask) => ({
      order: order.join(""), mask,
      score: score(readAxes(original, dims, order, mask))
    })));
  candidates.sort((a,b) => b.score - a.score);
  return {
    raw: score(original), best: candidates[0],
    mean: candidates.reduce((s,x) => s + x.score, 0) / candidates.length
  };
}

const pages = gp.pages;
const first = pages.filter(p => p.page <= 2).flatMap(p => p.indices);
const thirdPages = pages.filter(p => p.page >= 8 && p.page <= 14);
const third = thirdPages.flatMap(p => p.indices);
assert.deepEqual(thirdPages.map(p => p.runic_count),[255,268,263,273,261,272,137]);
assert.equal(first.length,729);
assert.equal(third.length,1729);
assert.equal(729,9 ** 3);
assert.equal(1729,9 ** 3 + 10 ** 3);
assert.equal(1729,1 ** 3 + 12 ** 3);
assert.equal(1729,7*13*19);

const cases = [
  ["p0-2 entire cube9", first, [9,9,9]],
  ["p8-14 first729 cube9",third.slice(0,729),[9,9,9]],
  ["p8-14 last1000 cube10",third.slice(729),[10,10,10]],
  ["p8-14 first1000 cube10",third.slice(0,1000),[10,10,10]],
  ["p8-14 last729 cube9",third.slice(1000),[9,9,9]],
  ["p8-14 drop-first cube12",third.slice(1),[12,12,12]],
  ["p8-14 drop-last cube12",third.slice(0,-1),[12,12,12]],
  ["p8-14 7x13x19 cuboid",third,[7,13,19]]
];
const native = toGP(languageText);
assert.equal(native.length,218800);
const {score,trainLength} = trainLanguage(native);
assert.equal(trainLength,164100);

// Exact positive plant under a nontrivial three-dimensional key and inverse.
const plant = native.slice(trainLength, trainLength + 729);
const pOrder = [2,0,1], pMask=5;
const encoded = encodePlant(plant,[9,9,9],pOrder,pMask);
assert.deepEqual(readAxes(encoded,[9,9,9],pOrder,pMask),plant);
assert(score(plant)>-3, "GP-English planted decoded text must be linguistic");
assert(score(encoded)<-3, "The keyed cube plant should disrupt trigram order");

const nativeHoldout = [];
for (let i=trainLength; i+1729<native.length; i+=1200)
  nativeHoldout.push(score(native.slice(i,i+1729)));
assert.equal(nativeHoldout.length,45);
const nativeMin = Math.min(...nativeHoldout);
/**
 * Source-gated 2D readout: onion7 title 133 and physical chapter 13x133.
 * All operations are exact permutations, with an optional boustrophedon row.
 * @param {number[]} seq
 * @param {[number,number]} dims
 * @param {boolean} transpose
 * @param {boolean} reverseRows
 * @param {boolean} reverseCols
 * @param {boolean} snake
 * @returns {number[]}
 */
function readRectangle(seq, dims, transpose, reverseRows, reverseCols, snake) {
  const [rows,cols] = dims;
  const outRows = transpose ? cols : rows, outCols = transpose ? rows : cols;
  const out = [];
  for (let i=0; i<outRows; i++) for (let j=0; j<outCols; j++) {
    const rr = reverseRows ? outRows-1-i : i;
    let cc = reverseCols ? outCols-1-j : j;
    if (snake && (i%2)) cc=outCols-1-cc;
    out.push(seq[transpose ? cc*cols+rr : rr*cols+cc]);
  }
  return out;
}

/**
 * Author HTML title 133 and id 331 also motivate a source-number circular
 * permutation. The fixed step 331 is coprime with 13*133=1729.
 * @param {number[]} seq
 * @param {number} start
 * @param {number} step
 * @returns {number[]}
 */
function readModWalk(seq,start,step) {
  return Array.from({length:seq.length},(_,i) =>
    seq[((start+step*i)%seq.length+seq.length)%seq.length]);
}

assert.equal(1729, 13*133);
const rectangle = [];
for (const dims of [[13,133],[133,13]]) {
  for (const transpose of [false,true])
    for (const reverseRows of [false,true])
      for (const reverseCols of [false,true])
        for (const snake of [false,true])
          rectangle.push({dimensions:dims.join("x"),transpose,
            reverseRows,reverseCols,snake,
            score:score(readRectangle(third,
              /** @type {[number,number]} */ (dims),
              transpose,reverseRows,reverseCols,snake))});
}
rectangle.sort((a,b)=>b.score-a.score);
assert.equal(rectangle.length,32);
const modular = [];
for (const step of [331,-331]) for (const start of [0,13,133,331]) {
  const mapped = Array.from({length:third.length},
    (_,i)=>((start+step*i)%third.length+third.length)%third.length);
  assert.equal(new Set(mapped).size,1729,"331-step map must be reversible");
  modular.push({step,start,score:score(readModWalk(third,start,step))});
}
modular.sort((a,b)=>b.score-a.score);
assert.equal(modular.length,8);
assert(rectangle[0].score < -5.6);
assert(modular[0].score < -5.6);

/**
 * Frozen opening-red-key hypothesis: the p0 red 13-rune heading keys the
 * source-selected 13x133 rectangular chapter. Test three direct placements of
 * those 13 GP indices and both historically motivated Vigenere signs.
 * @param {number[]} seq
 * @param {number[]} key
 * @param {[number,number]} dims
 * @param {boolean} transpose
 * @param {boolean} reverseRows
 * @param {boolean} reverseCols
 * @param {"row"|"column"|"period"} mode
 * @param {boolean} reverseKey
 * @param {number} sign
 * @returns {number[]}
 */
function redKeyRead(seq,key,dims,transpose,reverseRows,reverseCols,
  mode,reverseKey,sign) {
  const [H,W] = dims, R=transpose?W:H, C=transpose?H:W;
  const out=[];
  for(let r=0;r<R;r++)for(let c=0;c<C;c++) {
    const rr=reverseRows?R-1-r:r,cc=reverseCols?C-1-c:c;
    const flat=transpose?cc*W+rr:rr*W+cc;
    const kval=mode==="row"?(r%13):mode==="column"?(c%13):out.length%13;
    const k=key[reverseKey?12-kval:kval];
    out.push(((seq[flat]+sign*k)%N+N)%N);
  }
  return out;
}
const redKey=pages[0].indices.slice(0,13);
assert.equal(redKey.length,13);
const keyedReads=[];
for(const mode of ["row","column","period"])
  for(const reverseKey of [false,true])
    for(const sign of [-1,1])
      for(const dims of [[13,133],[133,13]])
        for(const transpose of [false,true])
          for(const reverseRows of [false,true])
            for(const reverseCols of [false,true])
              keyedReads.push({mode,reverseKey,sign,
                dimensions:dims.join("x"),transpose,reverseRows,reverseCols,
                score:score(redKeyRead(third,redKey,
                  /** @type {[number,number]} */ (dims),
                  transpose,reverseRows,reverseCols,mode,reverseKey,sign))});
keyedReads.sort((a,b)=>b.score-a.score);
assert.equal(keyedReads.length,192);
assert(keyedReads[0].score < -5.6);

/**
 * Key-independent collision invariant for any secret 29-rune bijection at
 * each of the 133 source-selected columns, shared by all thirteen rows.
 * Permuting rows within a column or permuting the columns also preserves
 * the total. This tests a far larger family than the 192 fixed red keys.
 * @param {number[]} seq An exact row-major 13x133 GP29 rectangle
 * @returns {number}
 */
function count133ColumnPairs(seq) {
  assert.equal(seq.length, 13 * 133);
  let pairs = 0;
  for (let col = 0; col < 133; col++) {
    const frequencies = new Uint16Array(N);
    for (let row = 0; row < 13; row++)
      frequencies[seq[row * 133 + col]]++;
    for (const count of frequencies) pairs += count * (count - 1) / 2;
  }
  return pairs;
}
const observedColumnPairs = count133ColumnPairs(third);
assert.equal(observedColumnPairs, 361);
const alphabetControls = [
  ["Shakespeare", native],
  ["Gibran", toGP(read("resources/control/gibran_prophet_58585.txt"))],
  ["Emerson", toGP(read("resources/control/emerson_essays_2944.txt"))]
].map(([sourceName, corpus]) => {
  const values = [];
  for (let start = 0; start + third.length <= corpus.length; start += 1037)
    values.push(count133ColumnPairs(corpus.slice(start, start + third.length)));
  values.sort((a, b) => a - b);
  return {source: sourceName, windows: values.length, minimum: values[0],
    median: values[Math.floor(values.length / 2)],
    maximum: values[values.length - 1]};
});
assert.deepEqual(alphabetControls.map(x => x.windows), [210,60,312]);
assert.deepEqual(alphabetControls.map(x => x.minimum), [552,572,578]);
assert(alphabetControls.every(x => x.minimum > observedColumnPairs));
const affinePlain = native.slice(trainLength, trainLength + third.length);
const affineCipher = affinePlain.map((rune, i) =>
  (17 * rune + (i % 133)) % N);
const affineDecoded = affineCipher.map((rune, i) =>
  (((rune - (i % 133)) % N + N) % N * 12) % N);
assert.deepEqual(affineDecoded, affinePlain);
assert.equal(count133ColumnPairs(affineCipher),
  count133ColumnPairs(affinePlain));
assert.equal(count133ColumnPairs(affinePlain), 644);

/**
 * Stronger row-changing but separable additive-pad invariant:
 * C[row,col] = P[row,col] + columnPad[col] + rowShift[row] (mod 29).
 * For each pair of rows, the column pad cancels and the row shift only
 * rotates the 29-way histogram of pairwise differences.
 * @param {number[]} seq Exact row-major 13x133 rectangle
 * @returns {number}
 */
function sumBestRowDifferenceBins(seq) {
  assert.equal(seq.length, 13 * 133);
  let total = 0;
  for (let row = 0; row < 13; row++)
    for (let other = row + 1; other < 13; other++) {
      const histogram = new Uint16Array(N);
      for (let col = 0; col < 133; col++) {
        const a = seq[row * 133 + col];
        const b = seq[other * 133 + col];
        histogram[(a - b + N) % N]++;
      }
      total += Math.max(...histogram);
    }
  return total;
}
const observedBestRowDifferences = sumBestRowDifferenceBins(third);
assert.equal(observedBestRowDifferences, 748);
const rowDifferenceControls = [
  ["Shakespeare", native],
  ["Gibran", toGP(read("resources/control/gibran_prophet_58585.txt"))],
  ["Emerson", toGP(read("resources/control/emerson_essays_2944.txt"))]
].map(([sourceName, corpus]) => {
  const values = [];
  for (let start = 0; start + third.length <= corpus.length; start += 1037)
    values.push(sumBestRowDifferenceBins(corpus.slice(start, start + third.length)));
  values.sort((a, b) => a - b);
  return {source:sourceName,windows:values.length,minimum:values[0],
    median:values[Math.floor(values.length / 2)],
    maximum:values[values.length - 1]};
});
assert.deepEqual(rowDifferenceControls.map(x => x.minimum),[759,780,767]);
assert(rowDifferenceControls.every(x => x.minimum > observedBestRowDifferences));
const sourceColumnPad = Array.from({length:133},
  (_,i) => (19*i*i + 7*i + 11) % N);
const sourceRowShift = Array.from({length:13},
  (_,i) => (3*i*i + 11*i) % N);
const rowShiftCipher = affinePlain.map((rune,i) =>
  (rune + sourceColumnPad[i%133] + sourceRowShift[Math.floor(i/133)]) % N);
const rowShiftDecoded = rowShiftCipher.map((rune,i) =>
  (rune - sourceColumnPad[i%133] - sourceRowShift[Math.floor(i/133)]
    + 2*N) % N);
assert.deepEqual(rowShiftDecoded, affinePlain);
assert.equal(sumBestRowDifferenceBins(affinePlain), 821);
assert.equal(sumBestRowDifferenceBins(rowShiftCipher), 821);

const report = cases.map(([name,input,dims]) => ({
  name,n:input.length,dims,...scan(input, /** @type {[number,number,number]} */ (dims),score)
}));
for (const row of report) {
  assert(row.best.score < -5.6, "Unexpected originally sourced English-like result");
  assert(row.best.score < nativeMin - 2.9, "Cube reading reached GP-native control band");
}
console.log(JSON.stringify({
  source: "original canonical LP2 p0-2 and p8-14, Shakespeare GP-native controls",
  arithmetic: "729=9^3; 1729=9^3+10^3=1^3+12^3=7*13*19",
  nativeGP: {trainLength,heldout1729Count:45,heldoutMin:nativeMin,
    heldoutMax:Math.max(...nativeHoldout)},
  positivePlant: {size:plant.length,order:pOrder.join(""),mask:pMask,
    originalScore:score(plant),encryptedScore:score(encoded),exactRoundTrip:true},
  originalCases:report,
  onion7Title133: {title:133,divId:331,chapterLength:1729,
    rectangularBest:rectangle[0],modularBest:modular[0],
    candidateCounts:[rectangle.length,modular.length]},
  sourceP0Red13Vigenere: {tested:keyedReads.length,best:keyedReads[0]},
  source133AllSecretColumns: {originalEqualPairs:observedColumnPairs,
    eligiblePairs:133*78,sourceControls:alphabetControls,
    affinePlainPairs:644,affineCipherPairs:644,exactPlant:true,
    rowChangingSeparableAdditive: {originalBestShiftPairs:observedBestRowDifferences,
      eligiblePairs:133*78,sourceControls:rowDifferenceControls,
      nativePlantPairs:821,encryptedPlantPairs:821,exactPlant:true},
    conclusion:"All 133 independent secret per-column GP29 bijections preserve the observed 361 collision pairs; every frozen native-English window has at least 552."},
  conclusion:"Eight cube/cuboid interpretations x48, 32 rectangle, eight 331-step walks, and 192 source-red Vigenere variants, all original-negative. No unknown LP2 plaintext or key recovered."
},null,2));
