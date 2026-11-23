"use strict";
/**
 * Source-exact full LP2 original-cipher GP29/adjacent-word-length pair-swap SFT.
 * Windows 11, Node 22: node sims/lp2_gp29_adjacent_wordpair_swap_original_sft.cjs
 *
 * Original-input hypothesis: every large source-visible rubric ends a
 * independently framed codeword, with precisely the original N runes,
 * W printed words and E adjacent-equal rune transitions per frame. Allow
 * only adjacent two-word length swaps within each major-rubric frame to carry information. A source-visual rule treats red-only heading closers as titles,
 * so 15 non-red-terminating sections reset without post hoc capacity cuts.
 * This script proves original-cipher and independent native-source invertibility.
 * A codebook positive is not evidence that Cicada used this encoding.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");

/** @param {string} p @returns {string} */
function read(p) {
  return fs.readFileSync(path.join(root, p), "utf8");
}
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const sourceMarks = JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const map = new Map(corpus.runes.map((r, i) => [r, i]));
const words = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\n\r%&$\s]/g, "")
  .split(/[-.]/)
  .filter(s => /[\u16A0-\u16FF]/u.test(s))
  .slice(0, 2896)
  .map(s => Array.from(s, rune => {
    const i = map.get(rune);
    assert.notEqual(i, undefined);
    return i;
  }));
const sourcePages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const original = sourcePages.flatMap(p => p.indices);
assert.equal(original.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);
let nEnd = 0;
const wordEnds = words.map(word => (nEnd += word.length));
assert.equal(nEnd, 12956);
const printedRubrics = sourceMarks.events
  .filter(e => e.symbol === "⁜").map(e => e.rune_offset);
const rubricEnds = printedRubrics.filter((v, i) => !i || v !== printedRubrics[i - 1]);
assert.equal(rubricEnds.length, 29);
assert.equal(rubricEnds[rubricEnds.length - 1], original.length);
assert.ok(rubricEnds.every(end => wordEnds.includes(end)));

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  k = Math.min(k, n - k);
  let b = 1n;
  for (let i = 1; i <= k; i++) {
    b = b * BigInt(n - i + 1) / BigInt(i);
  }
  return b;
}
/** @param {number[]} locations @returns {bigint} */
function rankSubset(locations) {
  let rank = 0n;
  for (let i = 0; i < locations.length; i++) {
    assert.ok(i === 0 || locations[i] > locations[i - 1]);
    rank += choose(locations[i], i + 1);
  }
  return rank;
}
/** @param {number} n @param {number} k @param {bigint} rank @returns {number[]} */
function unrankSubset(n, k, rank) {
  assert.ok(rank >= 0n && rank < choose(n, k));
  const out = new Array(k);
  let limit = n - 1;
  for (let j = k; j >= 1; j--) {
    let lo = j - 1;
    let hi = limit;
    let best = lo;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (choose(mid, j) <= rank) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    out[j - 1] = best;
    rank -= choose(best, j);
    limit = best - 1;
  }
  assert.equal(rank, 0n);
  return out;
}
/**
 * @param {number[]} runes
 * @returns {{e:number,rank:bigint}}
 */
function rankRunes(runes) {
  const positions = [];
  let v = 0n;
  for (let i = 1; i < runes.length; i++) {
    const prev = runes[i - 1];
    const cur = runes[i];
    if (prev === cur) {
      positions.push(i - 1);
    } else {
      const d = cur < prev ? cur : cur - 1;
      assert.ok(d >= 0 && d < 28);
      v = v * 28n + BigInt(d);
    }
  }
  const e = positions.length;
  const count = choose(runes.length - 1, e);
  return { e, rank:
    (BigInt(runes[0]) * count + rankSubset(positions))
      * 28n ** BigInt(runes.length - 1 - e) + v };
}
/**
 * @param {number} n @param {number} e @param {bigint} rank
 * @returns {number[]}
 */
function unrankRunes(n, e, rank) {
  const free = n - 1 - e;
  const base = 28n ** BigInt(free);
  let v = rank % base;
  let outer = rank / base;
  const maskCount = choose(n - 1, e);
  const first = Number(outer / maskCount);
  assert.ok(first < 29);
  outer %= maskCount;
  const exceptions = new Set(unrankSubset(n - 1, e, outer));
  const d = new Array(free);
  for (let i = free - 1; i >= 0; i--) {
    d[i] = Number(v % 28n);
    v /= 28n;
  }
  assert.equal(v, 0n);
  const result = [first];
  let next = 0;
  for (let i = 1; i < n; i++) {
    const prev = result[i - 1];
    const x = exceptions.has(i - 1) ? prev
      : (d[next] < prev ? d[next] : d[next] + 1);
    if (!exceptions.has(i - 1)) next++;
    result.push(x);
  }
  assert.equal(next, free);
  return result;
}
/** @param {number[]} arr @returns {bigint} */
function radix29(arr) {
  let result = 0n;
  for (const n of arr) result = result * 29n + BigInt(n);
  return result;
}
/** @param {bigint} x @param {number} length @returns {number[]} */
function from29(x, length) {
  const result = new Array(length);
  for (let i = length - 1; i >= 0; i--) {
    result[i] = Number(x % 29n);
    x /= 29n;
  }
  assert.equal(x, 0n);
  return result;
}

/**
 * Word lengths may only exchange places within consecutive two-word pairs.
 * Each nonidentical length pair carries exactly one recoverable printed bit.
 */
/** @param {number[]} lengths @returns {bigint} */
function countWordOrders(lengths) {
  let u = 0;
  for (let j = 0; j + 1 < lengths.length; j += 2) {
    u += Number(lengths[j] !== lengths[j + 1]);
  }
  return 1n << BigInt(u);
}
/** @param {number[]} lengths @returns {bigint} */
function rankLengthOrders(lengths) {
  let r = 0n;
  for (let j = 0; j + 1 < lengths.length; j += 2) {
    if (lengths[j] !== lengths[j + 1]) {
      r = (r << 1n) | BigInt(Number(lengths[j] > lengths[j + 1]));
    }
  }
  return r;
}
/**
 * @param {number[]} sourceLengths
 * @param {bigint} rank
 * @returns {number[]}
 */
function unrankLengthOrders(sourceLengths, rank) {
  const lengths = sourceLengths.slice();
  const count = lengths.reduce((u, length, j) =>
    u + Number(j % 2 === 0 && j + 1 < lengths.length &&
      length !== lengths[j + 1]), 0);
  assert.ok(rank >= 0n && rank < (1n << BigInt(count)));
  let remaining = count;
  for (let j = 0; j + 1 < lengths.length; j += 2) {
    const a = lengths[j], b = lengths[j + 1];
    if (a === b) continue;
    const bit = (rank >> BigInt(--remaining)) & 1n;
    lengths[j] = bit ? Math.max(a, b) : Math.min(a, b);
    lengths[j + 1] = bit ? Math.min(a, b) : Math.max(a, b);
  }
  assert.equal(remaining, 0);
  return lengths;
}
/** @param {number[]} lengths @returns {number[]} */
function lengthsToBreaks(lengths) {
  let offset = 0;
  return lengths.slice(0, -1).map(length => {
    offset += length;
    return offset - 1;
  });
}

/** @param {number} start @param {number} end */
function frame(start, end) {
  const src = original.slice(start, end);
  const wordBreaks = wordEnds.filter(x => x > start && x < end)
    .map(x => x - start - 1);
  const boundaries = [0, ...wordBreaks.map(x => x + 1), src.length];
  const lengths = boundaries.slice(1).map((end, i) => end - boundaries[i]);
  const W = lengths.length;
  const {e, rank: runeRank} = rankRunes(src);
  const G = countWordOrders(lengths);
  const M = 29n * choose(src.length - 1, e)
    * 28n ** BigInt(src.length - 1 - e) * G;
  const Q = 29n ** BigInt(src.length);
  const gapRank = rankLengthOrders(lengths);
  assert.deepEqual(unrankLengthOrders(lengths, gapRank), lengths);
  const R = runeRank * G + gapRank;
  assert.ok(R >= 0n && R < M);
  return {start, end, n: src.length, W, e, M, Q, R, G, lengths, originalBreaks: wordBreaks};
}
/**
 * @param {ReturnType<typeof frame>} f
 * @param {bigint} R
 */
function unrankCodeword(f, R) {
  assert.ok(R >= 0n && R < f.M);
  const lengths = unrankLengthOrders(f.lengths, R % f.G);
  return {
    runes: unrankRunes(f.n, f.e, R / f.G),
    breaks: lengthsToBreaks(lengths)
  };
}
/** @param {number[]} a @returns {number} */
function indexOfCoincidence(a) {
  const count = new Array(29).fill(0);
  for (const x of a) count[x]++;
  return count.reduce((s, x) => s + x * (x - 1), 0) / (a.length * (a.length - 1));
}
const natural = rubricEnds.map((end, i) => frame(i ? rubricEnds[i - 1] : 0, end));
const fail = natural.map((x, i) => x.M < x.Q ? i : -1).filter(x => x >= 0);
assert.deepEqual(fail, [4, 15, 23]);
assert.deepEqual(fail.map(i => [natural[i].n, natural[i].W, natural[i].e]),
  [[3, 1, 0], [19, 3, 1], [3, 1, 0]]);
console.log("29 SOURCE MAJOR-RUBRIC FRAMES deficient", fail);
const skip = new Set(fail.map(i => rubricEnds[i]));
const combinedEnds = rubricEnds.filter(end => !skip.has(end));
assert.equal(combinedEnds.length, 26);
const capacityFrames = combinedEnds.map((end, i) =>
  frame(i ? combinedEnds[i - 1] : 0, end));
assert.ok(capacityFrames.every(f => f.M >= f.Q));
assert.equal(capacityFrames.reduce((sum, f) => sum + f.n, 0), 12956);
const sourceInk = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
let currentOffset = 0;
const pageStart = new Map();
for (const page of corpus.pages.filter(p => p.page <= 55)) {
  pageStart.set(page.page, currentOffset);
  currentOffset += page.indices.length;
}
assert.equal(currentOffset, 12956);
/**
 * Source-visible typographic rule: the 13-dot immediately following a
 * red-only title belongs to that title; only the other 13-dot marks
 * close cipher body packets. This rule uses ink only, before scoring.
 */
const redTitleEnd = new Set(sourceInk.pages.flatMap(p =>
  (p.red_spans || []).filter(() => p.page <= 55)
    .map(s => pageStart.get(p.page) + s.start + s.length)));
const visualSkip = new Set(rubricEnds.filter(x =>
  x !== original.length && redTitleEnd.has(x)));
assert.deepEqual([...visualSkip], [
  13, 745, 851, 1552, 1874, 3612, 3623, 5522,
  6546, 7970, 8059, 9522, 12648, 12657
]);
const sourceVisualEnds = rubricEnds.filter(x => !visualSkip.has(x));
assert.equal(sourceVisualEnds.length, 15);
const frames = sourceVisualEnds.map((end, i) =>
  frame(i ? sourceVisualEnds[i - 1] : 0, end));
assert.ok(frames.every(f => f.M >= f.Q));
assert.equal(frames.reduce((sum, f) => sum + f.n, 0), 12956);
console.log("SOURCE-SELECTED RED-HEADING BODY FRAMES", frames.length,
  "suppressed red-title closers", [...visualSkip],
  "frozen 26-group lower-bound side bits",
  capacityFrames.reduce((sum, f) => sum + Number(f.G.toString(2).length - 1), 0));
let observedSingletons = 0;
let expectedSingletons = 0;
let varianceSingletons = 0;
let availableGapLog2 = 0;
for (const f of frames) {
  const p = (f.W - 1) / (f.n - 1);
  const p2 = f.n > 2 ? (f.W - 1) * (f.W - 2) / ((f.n - 1) * (f.n - 2)) : 0;
  observedSingletons += f.lengths.filter(x => x === 1).length;
  expectedSingletons += f.W * p;
  varianceSingletons += f.W * p * (1 - p) + f.W * (f.W - 1) * (p2 - p * p);
  availableGapLog2 += Number(f.G.toString(2).length - 1);
}
console.log("GAP RANDOM-PLACEMENT CALIBRATION original singles", observedSingletons,
  "uniform expected", expectedSingletons.toFixed(6),
  "uniform SD", Math.sqrt(varianceSingletons).toFixed(6),
  "z", ((observedSingletons - expectedSingletons) /
    Math.sqrt(varianceSingletons)).toFixed(3),
  "exact printed adjacent-pair side bits", availableGapLog2);
const candidate = [];
const solved = corpus.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);
const native = Array.from({length: original.length}, (_, i) => solved[i % solved.length]);
let pos = 0;
let nonzeroResidual = 0;
for (const f of frames) {
  const P = f.R * f.Q / f.M;
  const lower = (P * f.M + f.Q - 1n) / f.Q;
  const residual = f.R - lower;
  assert.ok(residual >= 0n);
  if (residual > 0n) nonzeroResidual++;
  const coded = unrankCodeword(f, lower + residual);
  assert.deepEqual(coded.runes, original.slice(f.start, f.end));
  assert.deepEqual(coded.breaks, f.originalBreaks);
  candidate.push(...from29(P, f.n));
  const input = native.slice(pos, pos + f.n);
  const X = radix29(input);
  const sourceRank = (X * f.M + f.Q - 1n) / f.Q;
  const sourceCode = unrankCodeword(f, sourceRank);
  assert.equal(sourceCode.runes.length, f.n);
  assert.equal(sourceCode.breaks.length, f.W - 1);
  const sourceRuneRank = rankRunes(sourceCode.runes);
  assert.equal(sourceRuneRank.e, f.e);
  const points = [0, ...sourceCode.breaks.map(x => x + 1), f.n];
  const recoveredLengths = points.slice(1).map((end, i) => end - points[i]);
  assert.deepEqual([...recoveredLengths].sort((a, b) => a - b),
    [...f.lengths].sort((a, b) => a - b));
  const actualRank = sourceRuneRank.rank * f.G
    + rankLengthOrders(recoveredLengths);
  assert.equal(actualRank, sourceRank);
  assert.equal(actualRank * f.Q / f.M, X);
  pos += f.n;
}
assert.equal(pos, 12956);
const before16 = sourcePages.filter(p => p.page < 16)
  .reduce((sum, p) => sum + p.indices.length, 0);
const first = candidate.slice(0, 300);
const heldout = candidate.slice(before16, before16 + 200);
console.log("SOURCE-EXACT model GP29 adjacent-pair length-swap coder:");
console.log("runes", original.length, "printed words", words.length,
  "resets", frames.length, "red-title closing marks not used as resets", Array.from(visualSkip),
  "nonzero original residuals", nonzeroResidual);
console.log("actual first300 IoC", indexOfCoincidence(first).toFixed(9),
  "actual original p16 first200 IoC", indexOfCoincidence(heldout).toFixed(9),
  "source-native positive IoC", indexOfCoincidence(native).toFixed(9));
console.log("first80 inferred GP29 indices", candidate.slice(0,80).join(","));
/**
 * Frozen direct 2016-word-"direction" readout: one original bit per
 * unequal-length neighboring word pair, 1=longer-first, 0=shorter-first.
 * Each physical-ink body frame restarts on its own first printed word.
 * Canonical MSB-first bytes are read without any phase/key/bit-order hunt.
 * This is a typed output check; it is not part of the GP29 inverse.
 */
/** @param {number[]} lengths @returns {number[]} */
function lengthOrderBits(lengths) {
  const bits = [];
  for (let i = 0; i + 1 < lengths.length; i += 2) {
    if (lengths[i] !== lengths[i + 1]) {
      bits.push(Number(lengths[i] > lengths[i + 1]));
    }
  }
  return bits;
}
/** @param {number[]} bits @returns {number[]} */
function fullMsbBytes(bits) {
  const bytes = [];
  for (let i = 0; i + 7 < bits.length; i += 8) {
    let v = 0;
    for (let k = 0; k < 8; k++) v = 2 * v + bits[i + k];
    bytes.push(v);
  }
  return bytes;
}
const wordDirectionGroups = frames.map(f => {
  const bits = lengthOrderBits(f.lengths);
  assert.equal(1n << BigInt(bits.length), f.G);
  assert.equal(bits.reduce((v, bit) => (v << 1n) | BigInt(bit), 0n),
    rankLengthOrders(f.lengths));
  const bytes = fullMsbBytes(bits);
  return {runes: f.n, bits: bits.length, bytes};
});
console.log("FROZEN DIRECT INK-BODY WORD-DIRECTION BITS:",
  wordDirectionGroups.map((g, i) => ({
    frame: i,
    runes: g.runes,
    bits: g.bits,
    bytePrefixHex: g.bytes.slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join(""),
    firstAscii: g.bytes.slice(0, 12)
      .map(b => b >= 32 && b <= 126 ? String.fromCharCode(b) : ".").join("")
  })));

console.log("PASS full 12956-rune original exact forward replay, all printed gaps,",
  "plus 12956-rune authentic solved-GP native-plaintext plant.");
