"use strict";
/**
 * Original LP2 pp15-22 16-rune local-window shared-pad decipherment gate.
 *
 * The p15 4x4 number square supplies a source-visible 16-cell hypothesis,
 * without proving any historical key or positioning rule. On all nine original
 * visual chapters, compare every aligned, non-overlapping 16-rune slot across
 * its physical pages. An original p15-22 slot (offsets 64..79) has an unusually
 * high cross-page coincidence count; check whether this is an actual shared
 * 16-rune additive key by recovering that key from five pages and predicting
 * unseen rune symbols on three further pages.
 *
 * Viterbi globally optimizes all 29^16 unknown additive pads using the native
 * GP29 English trigram Markov model and the 29^2 state dynamic program.
 * Forty planted source-native 16-rune pads provide full-length, heldout
 * independent positive controls, with the exact same original page offsets.
 *
 * Reproducer: node sims/lp2_p15_chapter16_shared_pad_viterbi_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
/** @param {string} relative @returns {string} */
const read = relative => fs.readFileSync(path.join(ROOT, relative), "utf8");
const source = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = source.pages.filter(p => p.page < 56 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((s, p) => s + p.indices.length, 0), 12956);

const CUTS = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];
const M = 29, BLOCK = 16;
const GROUP = pages.filter(p => p.page >= 15 && p.page <= 22);
assert.equal(GROUP.length, 8);
const raw = GROUP.map(p => p.indices.slice(64, 80));
assert(raw.every(row => row.length === 16));
const tokens = Object.fromEntries(source.translit.map((s, i) => [s, i]));

/** @param {string} input @returns {number[]} */
function encodeEnglish(input) {
  const s = input.toUpperCase().replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Q/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < s.length; i++) {
    if (!/[A-Z]/.test(s[i])) continue;
    if (s.slice(i, i + 3) === "ING") {
      out.push(tokens.NG);
      i += 2;
      continue;
    }
    const pair = s.slice(i, i + 2);
    if (Object.hasOwn(tokens, pair)) {
      out.push(tokens[pair]);
      i++;
      continue;
    }
    if (Object.hasOwn(tokens, s[i])) out.push(tokens[s[i]]);
  }
  return out;
}
const native = encodeEnglish(read("resources/control/shakespeare_first300k.txt"));
assert.equal(native.length, 217644);

/** Fixed, unfitted native source trigram with 0.1 Dirichlet pseudocount. */
const uni = new Uint32Array(M), bi = new Uint32Array(M*M);
const tri = new Uint32Array(M*M*M);
for (let i = 0; i < native.length; i++) {
  const x = native[i];
  uni[x]++;
  if (i >= 1) bi[native[i-1]*M+x]++;
  if (i >= 2) tri[(native[i-2]*M+native[i-1])*M+x]++;
}
const l1 = new Float64Array(M), l2 = new Float64Array(M*M);
const l3 = new Float64Array(M*M*M);
for (let i = 0; i < M; i++) {
  l1[i] = Math.log((uni[i]+0.1)/(native.length+2.9));
  for (let k = 0; k < M; k++) {
    l2[i*M+k] = Math.log((bi[i*M+k]+0.1)/(uni[i]+2.9));
    for (let t = 0; t < M; t++)
      l3[(i*M+k)*M+t] = Math.log(
        (tri[(i*M+k)*M+t]+0.1)/(bi[i*M+k]+2.9));
  }
}
const mod = x => ((x % M) + M) % M;
/** @param {number[]} row @returns {number} */
function score(row) {
  let sum = l1[row[0]] + l2[row[0]*M+row[1]];
  for (let i = 2; i < row.length; i++)
    sum += l3[(row[i-2]*M+row[i-1])*M+row[i]];
  return sum / row.length;
}
/** @param {number[]} row @param {number[]} key */
function decrypt(row, key) {
  return row.map((c, i) => mod(c-key[i]));
}

/**
 * Full-global maximum log-likelihood shared 16-rune shift key (29^2 Viterbi).
 * @param {number[][]} rows
 * @returns {number[]}
 */
function recover(rows) {
  const L = rows[0].length;
  assert(rows.length >= 2 && rows.every(row => row.length === L));
  let dp = new Float64Array(M*M);
  const backs = [];
  for (let a = 0; a < M; a++) for (let b = 0; b < M; b++) {
    let sum = 0;
    for (const row of rows) {
      const p = mod(row[0]-a), q = mod(row[1]-b);
      sum += l1[p] + l2[p*M+q];
    }
    dp[a*M+b] = sum;
  }
  for (let t = 2; t < L; t++) {
    const next = new Float64Array(M*M).fill(-Infinity);
    const prev = new Uint8Array(M*M);
    for (let a = 0; a < M; a++) for (let b = 0; b < M; b++) {
      let best = -Infinity, bestPrior = 0;
      for (let prior = 0; prior < M; prior++) {
        let total = dp[prior*M+a];
        for (const row of rows)
          total += l3[
            (mod(row[t-2]-prior)*M+mod(row[t-1]-a))*M
            + mod(row[t]-b)];
        if (total > best) {
          best = total;
          bestPrior = prior;
        }
      }
      next[a*M+b] = best;
      prev[a*M+b] = bestPrior;
    }
    dp = next;
    backs.push(prev);
  }
  let maximum = -Infinity, at = 0;
  for (let i = 0; i < dp.length; i++)
    if (dp[i] > maximum) {
      maximum = dp[i];
      at = i;
    }
  const key = Array(L);
  key[L-2] = Math.floor(at/M);
  key[L-1] = at%M;
  for (let t = L-1; t >= 2; t--)
    key[t-2] = backs[t-2][key[t-1]*M+key[t]];
  return key;
}
/** @param {number[][]} rows */
function heldoutScore(rows) {
  return rows.slice(5).reduce((sum, row) => sum+score(row), 0)/3;
}
/** @param {number} seed @returns {()=>number} */
function rngFactory(seed) {
  let state = seed>>>0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state>>>0)/4294967296;
  };
}
/**
 * All same-source-section/nonoverlapping-16-slot equal-pair measurements.
 * p50 has no runes. This is hypothesis discovery, not a blinded prediction.
 * @param {typeof pages} input
 */
function windows(input) {
  const all = [];
  for (let c = 0; c < 9; c++) {
    const group = input.filter(p =>
      p.page >= CUTS[c] && p.page < CUTS[c+1]);
    const max = Math.max(...group.map(p => p.indices.length));
    for (let start = 0; start < max; start += BLOCK) {
      let equal = 0, pairs = 0;
      for (let t = start; t < start + BLOCK; t++) {
        const freq = new Uint8Array(M);
        let n = 0;
        for (const page of group) {
          if (t >= page.indices.length) continue;
          n++;
          freq[page.indices[t]]++;
        }
        pairs += n*(n-1)/2;
        for (const count of freq) equal += count*(count-1)/2;
      }
      if (pairs < 100) continue;
      const expected = pairs/M;
      const z = (equal-expected)/Math.sqrt(expected*(1-1/M));
      all.push({chapter:c,start,equal,pairs,z});
    }
  }
  return all;
}

const allOriginalWindows = windows(pages);
const selected = allOriginalWindows.find(w => w.chapter === 3 && w.start === 64);
assert.deepEqual([selected.equal, selected.pairs], [35, 448]);
assert(Math.abs(selected.z - 5.0625) < 1e-8);
assert(allOriginalWindows.every(w => w.z <= selected.z));
const shuffleRandom = rngFactory(0xe21a1537);
let maxNullAtLeastSelected = 0;
for (let rep = 0; rep < 2000; rep++) {
  const shuffled = pages.map(page => {
    const symbols = page.indices.slice();
    for (let k = symbols.length-1; k > 0; k--) {
      const i = Math.floor(shuffleRandom()*(k+1));
      [symbols[k],symbols[i]] = [symbols[i],symbols[k]];
    }
    return {page:page.page,indices:symbols};
  });
  if (windows(shuffled).some(w => w.z >= selected.z))
    maxNullAtLeastSelected++;
}
const familywiseTail = (maxNullAtLeastSelected+1)/2001;
assert(familywiseTail > 0 && familywiseTail < 0.03);

const originalKey = recover(raw.slice(0, 5));
const originalResult = {
  selected,
  scannedWindows: allOriginalWindows.length,
  familywiseMaxTail2000:familywiseTail,
  originalCipherHeldout:heldoutScore(raw),
  fitFiveKey:originalKey,
  originalDecodedHeldout:heldoutScore(raw.map(row => decrypt(row, originalKey)))
};
// A p15 square read as a literal mod29 additive key is an independent
// source-fixed candidate; it does not give readable GP at these positions.
const square = [
  3258,3222,3152,3038,3278,3299,3298,2838,
  3288,3294,3296,2472,4516,1206,708,1820
];
assert.equal(square.length, BLOCK);
const literalKey = square.map(n => n%M);
originalResult.literalMinusSquareHeldout = heldoutScore(
  raw.map(row => decrypt(row, literalKey)));
originalResult.literalPlusSquareHeldout = heldoutScore(
  raw.map(row => row.map((c,i) => mod(c+literalKey[i]))));

const sourceStarts = [];
let cursor = 0;
for (const p of GROUP) {
  sourceStarts.push(cursor+64);
  cursor += p.indices.length;
}
const nativeRandom = rngFactory(0x143421b3);
const plants = [];
for (let rep = 0; rep < 40; rep++) {
  const start = Math.floor(nativeRandom()*(native.length-4000));
  const real = sourceStarts.map(pos => native.slice(start+pos,
    start+pos+BLOCK));
  const plantedKey = Array.from({length:BLOCK},
    () => Math.floor(nativeRandom()*M));
  const enc = real.map(row =>
    row.map((p,i) => mod(p+plantedKey[i])));
  const fitted = recover(enc.slice(0,5));
  const recovered = enc.map(row => decrypt(row, fitted));
  const keyRecovery = fitted.filter((v,i) => v === plantedKey[i]).length;
  plants.push({
    keyRecovery, correctHeldout:heldoutScore(real),
    recoveredHeldout:heldoutScore(recovered)
  });
  assert(keyRecovery >= 14);
  assert(heldoutScore(recovered) > originalResult.originalDecodedHeldout);
}
const actual = originalResult.originalDecodedHeldout;
assert(actual < -4.6 && actual > -4.7);
const summary = {
  ...originalResult,
  plantedSamples:plants.length,
  minPlantedRecoveredKeyPositions:Math.min(...plants.map(p => p.keyRecovery)),
  minPlantedHeldout:Math.min(...plants.map(p => p.recoveredHeldout)),
  maxPlantedHeldout:Math.max(...plants.map(p => p.recoveredHeldout)),
  sourceKeyNotRecovered:plants.length,
  nativeCorpusRuneLength:native.length,
  completeOriginalPageCount:pages.length
};
console.log(JSON.stringify(summary,null,2));
