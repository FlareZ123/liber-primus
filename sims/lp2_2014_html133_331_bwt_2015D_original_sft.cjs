"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { encodeSourceNativeGP } = require("./lp2_native_gp_source_orthography_sft.cjs");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const source = gp.pages.slice(0, 3).flatMap(p => p.indices);
assert.equal(source.length, 729);

/** @param {number} x @returns {number} */
const mod29 = x => ((x % 29) + 29) % 29;

const primes = [];
for (let x = 2; primes.length < 731; x++) {
  let prime = true;
  for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
  if (prime) primes.push(x);
}

/** @param {number[]} c @returns {number[]} */
function historicalPrimeDifference(c) {
  let before = mod29(-primes[0]);
  return c.map((v, i) => {
    const shifted = mod29(v - primes[i + 1]);
    const next = mod29(shifted - before);
    before = shifted;
    return next;
  });
}

/** @param {number[]} delta @returns {number[]} */
function reversePrimeDifference(delta) {
  let before = mod29(-primes[0]);
  return delta.map((d, i) => {
    before = mod29(before + d);
    return mod29(before + primes[i + 1]);
  });
}

/** @param {number[]} values @returns {number} */
const equalNeighbors = values => values.reduce((n, x, i) =>
  n + Number(i > 0 && x === values[i - 1]), 0);

/** @param {number[]} values @returns {number[]} */
function symbolCounts(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts;
}

/**
 * For a sentinel-free circular BWT, LF is the stable-occurrence mapping
 * from the last column to the lexicographically sorted first column.
 * @param {number[]} last
 * @returns {number[]}
 */
function lastToFirst(last) {
  const counts = symbolCounts(last);
  const start = Array(29).fill(0);
  for (let i = 1; i < 29; i++) start[i] = start[i - 1] + counts[i - 1];
  const used = Array(29).fill(0);
  return last.map(x => start[x] + used[x]++);
}

/**
 * Return the cycles of the fixed LF permutation.
 * For a valid BWT of an aperiodic source, there must be exactly one
 * cycle of length n; a d-periodic source has equal-length d-cycles.
 * @param {number[]} lf
 * @returns {{lengths:number[], labels:number[]}}
 */
function permutationCycles(lf) {
  const label = Array(lf.length).fill(-1);
  const lengths = [];
  for (let i = 0; i < lf.length; i++) {
    if (label[i] !== -1) continue;
    let here = i, length = 0;
    while (label[here] === -1) {
      label[here] = lengths.length;
      here = lf[here];
      length++;
    }
    assert.equal(here, i, "invalid LF permutation orbit");
    lengths.push(length);
  }
  return {lengths, labels: label};
}

/**
 * The standard LF reconstruction walk at an assumed zero-based row.
 * On an invalid last-column input, this 729-symbol walk need not be
 * a valid inverse BWT and can omit some source histogram classes.
 * @param {number[]} last
 * @param {number[]} lf
 * @param {number} row
 * @returns {{out:number[],returnRow:number}}
 */
function lfWalk(last, lf, row) {
  assert.ok(row >= 0 && row < last.length);
  const out = Array(last.length);
  for (let i = last.length - 1; i >= 0; i--) {
    out[i] = last[row];
    row = lf[row];
  }
  return {out,returnRow:row};
}

/**
 * Standard sentinel-free circular forward BWT with stable tie order.
 * All rotations of a primitive source are distinct.
 * @param {number[]} input
 * @returns {{last:number[],primary:number}}
 */
function cyclicBWT(input) {
  const n = input.length;
  const starts = Array.from({length:n}, (_,i) => i);
  starts.sort((a,b) => {
    for (let j = 0; j < n; j++) {
      const x = input[(a + j) % n], y = input[(b + j) % n];
      if (x !== y) return x - y;
    }
    return a - b;
  });
  return {last: starts.map(i => input[(i + n - 1) % n]),
    primary: starts.indexOf(0)};
}

/** @param {number[]} seq @returns {string} */
function toGP(seq) {
  return seq.map(v => gp.translit[v]).join("");
}

/** @param {number[]} seq @param {number[]} lengths @returns {string} */
function firstOriginalWordAligned(seq,lengths) {
  const output=[];
  let at=0;
  for(const len of lengths) {
    if(at>=150)break;
    output.push(toGP(seq.slice(at, Math.min(at+len,150))));
    at+=len;
  }
  return output.join(" ");
}

const D = historicalPrimeDifference(source);
assert.deepEqual(reversePrimeDifference(D),source);
assert.equal(equalNeighbors(D),40);
assert.equal(equalNeighbors(source),4);
const LF = lastToFirst(D);
const cycles = permutationCycles(LF);
const sortedLengths = cycles.lengths.slice().sort((a,b) => b-a);
assert.deepEqual(sortedLengths,[320,288,91,22,8]);
// No primitive 729-rune original and no single-periodic 729-rune
// original can yield this last column under standard circular BWT:
// the LF cycles have five unequal lengths, all below 729.
assert.ok(sortedLengths.length>1 && sortedLengths.some(x => x!==sortedLengths[0]));

const {words,runeCount,crossPageWords}=parseSharedCorpus();
assert.equal(runeCount,12956);
assert.equal(crossPageWords,32);
const firstChapterLengths = words.filter(w => w.startPage<=2).map(w => w.length);
assert.equal(firstChapterLengths.length,158);
assert.equal(firstChapterLengths.reduce((a,b)=>a+b,0),729);

const choices=[133,331].map(row => {
  const cycleLength = cycles.lengths[cycles.labels[row]];
  const {out,returnRow}=lfWalk(D,LF,row);
  const histogramEqual = symbolCounts(out).every((v,i)=>v===symbolCounts(D)[i]);
  const forward=cyclicBWT(out);
  const exactForwardLast=forward.last.every((v,i)=>v===D[i]);
  const forwardAllMatch=exactForwardLast&&forward.primary===row;
  assert.equal(cycleLength,320);
  assert.equal(histogramEqual,false);
  assert.equal(forwardAllMatch,false);
  return {primaryRowZeroBased:row,LFcycleLength:cycleLength,
    walkReturnRowAfter729Steps:returnRow,losslessOriginalHistogram:histogramEqual,
    forwardBwtReconstructsOriginal:false,
    distinctSourceSymbolsInWalk:symbolCounts(out).filter(Boolean).length,
    first150SourceWordAligned:firstOriginalWordAligned(out,firstChapterLengths),
    complete729RunesGP:toGP(out),
    outputIndexSha256:crypto.createHash("sha256").update(Buffer.from(out)).digest("hex")};
});

// A true original-size, native-GP source plant must make one LF n-cycle.
const english = encodeSourceNativeGP(read("resources/control/gibran_prophet_58585.txt")).slice(0,729);
assert.equal(english.length,729);
const planted=cyclicBWT(english);
const plantedLF=lastToFirst(planted.last);
assert.deepEqual(permutationCycles(plantedLF).lengths,[729]);
const recovered=lfWalk(planted.last,plantedLF,planted.primary);
assert.deepEqual(recovered.out, english);
assert.equal(recovered.returnRow,planted.primary);
assert.deepEqual(cyclicBWT(recovered.out),planted);

// A periodic plant is allowed to have multiple LF cycles, but each
// must be the same primitive period length, not 5 unequal lengths.
const periodic=Array.from({length:729},(_,i)=>[0,1,2][i%3]);
const periodicBWT=cyclicBWT(periodic);
const periodicLF=lastToFirst(periodicBWT.last);
const periodicLengths=permutationCycles(periodicLF).lengths;
assert.equal(periodicLengths.length,243);
assert.ok(periodicLengths.every(x=>x===3));
assert.deepEqual(lfWalk(periodicBWT.last,periodicLF,periodicBWT.primary).out, periodic);


/**
 * The bzip2-motivated upstream alternative: historical D supplies
 * GP29 move-to-front ranks, whose decoded symbols are BWT's last
 * column. The opposite MTF interpretation is retained solely because
 * #1468 pre-registered it before inspecting English scores.
 * @param {number[]} input
 * @param {'decode'|'encode'} mode
 * @param {boolean} pageReset
 * @returns {number[]}
 */
function mtf(input, mode, pageReset) {
  const state = Array.from({length:29}, (_, i) => i);
  const out = [];
  for (let i = 0; i < input.length; i++) {
    if (i === 0 || pageReset && (i === 262 || i === 528)) {
      for (let j = 0; j < 29; j++) state[j] = j;
    }
    const rank = mode === 'decode' ? input[i] : state.indexOf(input[i]);
    assert.ok(rank >= 0 && rank < 29);
    const value = state[rank];
    out.push(mode === 'decode' ? value : rank);
    state.splice(rank, 1);
    state.unshift(value);
  }
  return out;
}

const mtfBwtCandidates = [];
const expectedMtfCycles = [
  [336,187,176,26,2,1,1],
  [432,274,15,5,3],
  [531,114,68,5,4,4,3],
  [342,288,61,28,4,2,2,2]
];
for (const mode of ['decode','encode']) for (const pageReset of [false,true]) {
  const last = mtf(D, mode, pageReset);
  const originalRankTape = mtf(last, mode === 'decode' ? 'encode' : 'decode', pageReset);
  assert.deepEqual(originalRankTape, D);
  const lf = lastToFirst(last);
  const orbits = permutationCycles(lf).lengths.slice().sort((a,b) => b-a);
  const candidate = mtfBwtCandidates.length;
  assert.deepEqual(orbits, expectedMtfCycles[candidate]);
  assert.ok(orbits.length > 1 && orbits.some(len => len !== orbits[0]));
  for (const row of [133,331]) {
    const walk = lfWalk(last,lf,row);
    const fwd = cyclicBWT(walk.out);
    assert.ok(walk.returnRow !== row || fwd.primary !== row ||
      !fwd.last.every((x,i)=>x === last[i]));
  }
  mtfBwtCandidates.push({
    mode, pageReset, originalDReconstituted: true,
    cyclesSorted: orbits, validFullCircularBWT: false,
    any2014HTMLPrimaryRowValid: false,
    outputIndexSha256: crypto.createHash('sha256').update(Buffer.from(last)).digest('hex')
  });
}

// End-to-end true 729-source-GP positive: a known passage through
// native circular BWT, MTF rank encoding, then original-primeD recipher.
const mtfBwtPlants = [];
for (const pageReset of [false,true]) {
  const plantedRanks = mtf(planted.last, 'encode', pageReset);
  const syntheticCipher = reversePrimeDifference(plantedRanks);
  assert.deepEqual(historicalPrimeDifference(syntheticCipher), plantedRanks);
  const reconstructedLast = mtf(historicalPrimeDifference(syntheticCipher),'decode',pageReset);
  assert.deepEqual(reconstructedLast,planted.last);
  const regenerated = lfWalk(reconstructedLast,lastToFirst(reconstructedLast),planted.primary);
  assert.deepEqual(regenerated.out,english);
  assert.equal(regenerated.returnRow,planted.primary);
  mtfBwtPlants.push({pageReset, recoveredNative729:true,
    sourcePrimeDifferenceRecipher:true, one729LFcycle:true});
}

console.log(JSON.stringify({
  hypothesis:"2014 Stage11 HTML rows 133 or 331 as unmarked circular-BWT index of exact Feb2015 prime-D (729)",
  historicalFirstStage:{sourceRuneCount:source.length, reconstructedAll729:true,
    originalRepeatCount:equalNeighbors(source), primeDRepeatCount:equalNeighbors(D),
    originalDIndexSha256:crypto.createHash("sha256").update(Buffer.from(D)).digest("hex")},
  sourceLastColumn:{LFcyclesSorted:sortedLengths,cycleCount:cycles.lengths.length,
    invalidCircularBWTForAnyOriginalPrimary:true,
    reason:"LF cycles 320,288,91,22,8 are unequal, whereas a primitive BWT input has a single n-cycle and a periodic input has equal primitive-length cycles"},
  frozen2014Rows:choices,
  sourceFrozenMtfThenCircularBWT:mtfBwtCandidates,
  sourceNativeMtfBwtPlants:mtfBwtPlants,
  positive:{nativeGp729PrimitiveRoundTrip:true, plantedPrimary:planted.primary,
    plantedLFcycles:[729], periodic729BwtCycles:periodicLengths.length,
    periodicPrimitiveLength:3, periodicRoundTrip:true},
  conclusion:"Neither source row can give a valid reversible 729-rune circular BWT inverse on the original 2015 D; all four independently pre-registered GP29 MTF interpretations of D also fail the exact LF cycle criterion; no plaintext or typed second-stage receiver recovered."
},null,2));
