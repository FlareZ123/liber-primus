"use strict";
/**
 * Original-source, no-side-car physical-punctuation AUTO-MERGE enumerative codec.
 *
 * SFT: node sims/lp2_punctuation_merge_enumerative_original_sft.cjs
 * Node.js 22, CommonJS, read-only. Every ciphertext cardinality decision and
 * roundtrip is checked with BigInt, no randomized parameters or hidden keys.
 *
 * Scope: hypothetical source alphabet q=26 or q=27, original GP29 words with
 * exactly original observed n/e adjacent-repeat counts. Printed punctuation
 * sites are possible segment resets, merged only if necessary for sufficient
 * information capacity. This algorithm is NOT asserted to be Cicada's cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
/** @param {string} name */
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const punct = JSON.parse(read("resources/liber-primus/lp2-punctuation-identity.json"));
const original = book.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const runeIdx = new Map(book.runes.map((r, i) => [r, i]));
const words = read("resources/liber-primus/lp2-transcription.txt")
  .replace(/[\/\n\r%&$\s]/g, "")
  .split(/[-.]/)
  .filter(w => /[\u16A0-\u16FF]/u.test(w))
  .slice(0, 2896)
  .map(w => Array.from(w, r => {
    const i = runeIdx.get(r);
    assert.notEqual(i, undefined, "unknown GP glyph");
    return i;
  }));
assert.equal(original.length, 12956);
assert.equal(words.length, 2896);
assert.deepEqual(words.flat(), original);

/** @param {number} n @param {number} k */
function choose(n, k) {
  if (k < 0 || k > n) return 0n;
  let x = 1n;
  for (let i = 1; i <= k; i++) x = x * BigInt(n - i + 1) / BigInt(i);
  return x;
}
/** Number of continuations of length n with exactly e adjacent repeats. */
function completions(n, e) {
  if (e < 0 || e > n) return 0n;
  return choose(n, e) * 28n ** BigInt(n - e);
}
/** @param {number[]} word */
function countRepeats(word) {
  let e = 0;
  for (let i = 1; i < word.length; i++) e += Number(word[i] === word[i - 1]);
  return e;
}
/** GP29 lexicographic rank within all words of length n, repeat-count e. */
function rankWord(word) {
  const n = word.length, repeats = countRepeats(word);
  let remaining = repeats;
  const radix = 29n * completions(n - 1, repeats);
  let rank = BigInt(word[0]) * completions(n - 1, repeats);
  for (let i = 1; i < n; i++) {
    for (let letter = 0; letter < word[i]; letter++) {
      rank += completions(n - 1 - i, remaining -
        Number(letter === word[i - 1]));
    }
    remaining -= Number(word[i] === word[i - 1]);
  }
  assert.equal(remaining, 0);
  assert.ok(rank >= 0n && rank < radix);
  return { n, repeats, rank, radix };
}
/** Inverse of rankWord using the same exact original n,e grammar. */
function unrankWord(n, repeats, rank) {
  const firstChoices = completions(n - 1, repeats);
  assert.ok(rank >= 0n && rank < 29n * firstChoices);
  const result = [Number(rank / firstChoices)];
  rank %= firstChoices;
  let remaining = repeats;
  for (let i = 1; i < n; i++) {
    let selected = -1;
    for (let letter = 0; letter < 29; letter++) {
      const repeatFlag = Number(letter === result[i - 1]);
      const count = completions(n - i - 1, remaining - repeatFlag);
      if (rank >= count) {
        rank -= count;
      } else {
        selected = letter;
        remaining -= repeatFlag;
        break;
      }
    }
    assert.ok(selected >= 0);
    result.push(selected);
  }
  assert.equal(rank, 0n);
  assert.equal(remaining, 0);
  return result;
}
const wordCodes = words.map(rankWord);
assert.equal(wordCodes.reduce((n, w) => n + w.repeats, 0), 63);
for (let i = 0; i < words.length; i++) {
  assert.deepEqual(unrankWord(wordCodes[i].n, wordCodes[i].repeats,
    wordCodes[i].rank), words[i]);
}
const wordEnds = [];
let cumulative = 0;
for (const word of words) {
  cumulative += word.length;
  wordEnds.push(cumulative);
}
const posToWord = new Map(wordEnds.map((x, i) => [x, i]));
const physical = punct.events.filter(x => x.original_ink_event !== false &&
  x.index !== 125);
assert.equal(physical.length, 175);
const markedWordEnds = [...new Set(physical.map(x =>
  posToWord.get(x.rune_offset)))].sort((a, b) => a - b);
assert.equal(markedWordEnds.length, 172);
assert.equal(markedWordEnds[markedWordEnds.length - 1], 2895);
const frameEnds = [-1, ...markedWordEnds];
const frames = [];
for (let k = 1; k < frameEnds.length; k++) {
  const startWord = frameEnds[k - 1] + 1;
  const endWord = frameEnds[k] + 1;
  let M = 1n, R = 0n, n = 0;
  for (let i = startWord; i < endWord; i++) {
    const w = wordCodes[i];
    R = R * w.radix + w.rank;
    M *= w.radix;
    n += w.n;
  }
  frames.push({ startWord, endWord, n, M, R });
}
/** @param {bigint} n */
function log2BigInt(n) {
  assert.ok(n > 0n);
  const bits = n.toString(2).length, shift = Math.max(0, bits - 52);
  return Math.log2(Number(n >> BigInt(shift))) + shift;
}
/**
 * Maximize original punctuation-frame count with adequate q^N output capacity.
 * The fast DP uses a 1e-8-bit exclusion window, far below input margins.
 * The chosen blocks' inequalities are independently checked with BigInt.
 *
 * @param {number} q
 */
function bestResets(q) {
  const pref = [0];
  for (const frame of frames) {
    pref.push(pref[pref.length - 1] + log2BigInt(frame.M) -
      frame.n * Math.log2(q));
  }
  const best = Array(frames.length + 1).fill(null);
  best[0] = { count: 0, starts: [] };
  for (let end = 1; end <= frames.length; end++) {
    for (let start = 0; start < end; start++) {
      if (!best[start] || pref[end] - pref[start] < -1e-8) continue;
      const next = {
        count: best[start].count + 1,
        starts: best[start].starts.concat([start])
      };
      if (!best[end] || next.count > best[end].count) best[end] = next;
    }
  }
  if (!best[frames.length]) return null;
  const starts = best[frames.length].starts;
  const used = new Set(starts.slice(1).map(x => x - 1)
    .concat(frames.length - 1));
  const skipped = frames.flatMap((frame, i) => used.has(i) ? [] : [i]);
  const groups = [];
  for (let k = 0; k < starts.length; k++) {
    const start = starts[k];
    const end = k + 1 < starts.length ? starts[k + 1] : frames.length;
    let M = 1n, R = 0n, n = 0;
    for (let i = start; i < end; i++) {
      const f = frames[i];
      M *= f.M;
      R = R * f.M + f.R;
      n += f.n;
    }
    assert.ok(M >= BigInt(q) ** BigInt(n), "insufficient group capacity");
    groups.push({
      start, end, n, M, R,
      firstWord: frames[start].startWord,
      endWord: frames[end - 1].endWord
    });
  }
  return { q, groups, skipped };
}
const q25 = bestResets(25), q26 = bestResets(26);
const q27 = bestResets(27), q28 = bestResets(28);
assert.equal(q28, null);
assert.deepEqual(q25.skipped, [93]);
assert.deepEqual(q26.skipped, [93, 166]);
assert.deepEqual(q27.skipped, [57, 92, 93, 143, 166]);
assert.deepEqual(q26.groups.length, 170);
assert.deepEqual(q27.groups.length, 167);
const skipMarks = skips => skips.map(i => {
  const targetWord = frames[i].endWord - 1;
  return physical.filter(e => posToWord.get(e.rune_offset) === targetWord)
    .map(e => e.index);
});
assert.deepEqual(skipMarks(q26.skipped), [[99], [174]]);
assert.deepEqual(skipMarks(q27.skipped), [
  [63], [98], [99], [151], [174]
]);
const fullM = wordCodes.reduce((a, w) => a * w.radix, 1n);
assert.ok(fullM >= 27n ** 12956n && fullM < 28n ** 12956n);
console.log("SOURCE RESET POINTS", frames.length,
  "GP26 optimal retained", q26.groups.length,
  "ignored printed events", JSON.stringify(skipMarks(q26.skipped)),
  "GP27 optimal retained", q27.groups.length,
  "ignored printed events", JSON.stringify(skipMarks(q27.skipped)));
console.log("GP28 unsolvable without other side data for original exact word shapes");

/** @param {number[]} digits @param {number} q */
function pack(digits, q) {
  return digits.reduce((a, b) => {
    assert.ok(b >= 0 && b < q);
    return a * BigInt(q) + BigInt(b);
  }, 0n);
}
/** @param {bigint} integer @param {number} q @param {number} n */
function unpack(integer, q, n) {
  const result = Array(n);
  for (let i = n - 1; i >= 0; i--) {
    result[i] = Number(integer % BigInt(q));
    integer /= BigInt(q);
  }
  assert.equal(integer, 0n);
  return result;
}
/** @param {bigint} a @param {bigint} b */
function ceilDiv(a, b) {
  return (a + b - 1n) / b;
}
/**
 * The wordwise all-cipher-rank bijection is (P, residual) <-> R, where
 * P = floor(R*Q/M), residual = R - ceil(P*M/Q). The residual is carried in
 * the original ciphertext, not a magically supplied external side channel.
 * The canonical forward encoder sets residual=0.
 * @param {{n:number;M:bigint;R:bigint}} group
 * @param {number} q
 */
function decodeGroup(group, q) {
  const Q = BigInt(q) ** BigInt(group.n);
  const P = group.R * Q / group.M;
  const canonicalR = ceilDiv(P * group.M, Q);
  const nextBoundary = ceilDiv((P + 1n) * group.M, Q);
  const extra = group.R - canonicalR;
  assert.ok(extra >= 0n && extra < nextBoundary - canonicalR);
  assert.equal(canonicalR + extra, group.R);
  return { digits: unpack(P, q, group.n), extra, canonical: extra === 0n };
}
/**
 * Encode a source group and optionally a previously decoded internal
 * residual. For arbitrary original ciphertexts, retain that residual for
 * exact reverse; for new source prose, choose the canonical residual=0.
 */
function encodeGroup(group, q, digits, extra = 0n) {
  assert.equal(digits.length, group.n);
  const P = pack(digits, q), Q = BigInt(q) ** BigInt(group.n);
  const R0 = ceilDiv(P * group.M, Q);
  const R1 = ceilDiv((P + 1n) * group.M, Q);
  assert.ok(extra >= 0n && extra < R1 - R0);
  const R = R0 + extra;
  const result = [];
  let value = R;
  const specs = wordCodes.slice(group.firstWord, group.endWord);
  const ranks = Array(specs.length);
  for (let i = specs.length - 1; i >= 0; i--) {
    ranks[i] = value % specs[i].radix;
    value /= specs[i].radix;
  }
  assert.equal(value, 0n);
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i];
    result.push(unrankWord(spec.n, spec.repeats, ranks[i]));
  }
  return { R, wordCipher: result };
}
function ioc(a, q) {
  const b = Array(q).fill(0);
  for (const x of a) b[x]++;
  return b.reduce((z, n) => z + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}
const q27Map = Array.from({ length: 29 }, (_, i) => i)
  .filter(x => x !== 12 && x !== 22);
const known = read("resources/external/2013-book-of-law-I.txt")
  .toUpperCase().replace(/[^A-Z]/g, "")
  .split("").map(c => c.charCodeAt(0) - 65);
assert.ok(known.length > 7000);
for (const schedule of [q26, q27]) {
  const q = schedule.q;
  let actual = [], recoveredRunes = [], canonicalCount = 0;
  let planted = [], plantedCipher = [];
  for (const group of schedule.groups) {
    const got = decodeGroup(group, q);
    actual.push(...got.digits);
    canonicalCount += Number(got.canonical);
    const originalReplay = encodeGroup(group, q, got.digits, got.extra);
    assert.equal(originalReplay.R, group.R);
    recoveredRunes.push(...originalReplay.wordCipher.flat());
    const start = planted.length;
    const source = Array.from({ length: group.n }, (_, i) =>
      q === 26 ? known[(start + i) % known.length] :
        known[(start + i) % known.length] % 27);
    planted.push(...source);
    const encoded = encodeGroup(group, q, source);
    const decoded = decodeGroup({ ...group, R: encoded.R }, q);
    assert.deepEqual(decoded.digits, source);
    assert.equal(decoded.extra, 0n);
    plantedCipher.push(...encoded.wordCipher.flat());
  }
  assert.deepEqual(recoveredRunes, original);
  assert.equal(planted.length, original.length);
  assert.equal(plantedCipher.length, original.length);
  // Each synthetic ciphertext preserves the exact original per-word repeat
  // count and the original signed punctuation reset locations.
  let offset = 0;
  for (const spec of wordCodes) {
    assert.equal(countRepeats(plantedCipher.slice(offset, offset + spec.n)),
      spec.repeats);
    offset += spec.n;
  }
  const outIoC = ioc(actual, q);
  assert.ok(Math.abs(outIoC - 1 / q) < 0.001);
  const plantedIoC = ioc(planted, q);
  assert.ok(plantedIoC > 0.05);
  const printed = actual.slice(0, 50)
    .map(k => q === 26 ? String.fromCharCode(k + 65) :
      book.translit[q27Map[k]]).join("");
  console.log("ALPHABET", q, "original cipher decoded", actual.length,
    "symbols", "IoC", outIoC.toFixed(9),
    "native-source planted IoC", plantedIoC.toFixed(9),
    "canonical-original ciphertext frames", canonicalCount,
    "of", schedule.groups.length,
    "initial decoded text", printed);
  console.log("PASS original cipher exact residual re-encoding and full",
    original.length, "rune source-shaped planted forward/inverse");
}

/**
 * Independent, much simpler human-visible reset schedule: use ONLY large
 * red chapter marks ⁜ as arithmetic-code terminators. There are 31 physical
 * ⁜ events but only 29 distinct word-ending sites (two co-located pairs).
 * Each of these 29 naturally marked groups independently accommodates an
 * unrestricted GP26 or GP27 input of precisely its original GP29 rune count.
 * Hence no data-derived skipped full stops are needed in this alternative.
 */
const largeRedRuneEnds = [...new Set(physical
  .filter(e => e.symbol === "⁜")
  .map(e => e.rune_offset))].sort((a, b) => a - b);
assert.equal(physical.filter(e => e.symbol === "⁜").length, 31);
assert.equal(largeRedRuneEnds.length, 29);
assert.equal(largeRedRuneEnds[largeRedRuneEnds.length - 1], 12956);
const majorRedFrames = [];
let firstMajorWord = 0;
for (const runeEnd of largeRedRuneEnds) {
  const lastMajorWord = posToWord.get(runeEnd) + 1;
  assert.ok(lastMajorWord > firstMajorWord);
  let M = 1n, R = 0n, n = 0;
  for (let i = firstMajorWord; i < lastMajorWord; i++) {
    const word = wordCodes[i];
    R = R * word.radix + word.rank;
    M *= word.radix;
    n += word.n;
  }
  majorRedFrames.push({
    n, M, R, firstWord: firstMajorWord, endWord: lastMajorWord
  });
  firstMajorWord = lastMajorWord;
}
assert.deepEqual(majorRedFrames.map(x => x.n), [
  13, 716, 16, 103, 3, 690, 11, 308, 14, 1729,
  9, 11, 1883, 16, 1005, 19, 1414, 10, 81,
  8, 746, 553, 161, 3, 118, 2474, 534, 9, 299
]);
for (const q of [26, 27]) {
  let decoded = [];
  let canonical = 0;
  for (const frame of majorRedFrames) {
    assert.ok(frame.M >= BigInt(q) ** BigInt(frame.n));
    const d = decodeGroup(frame, q);
    decoded.push(...d.digits);
    canonical += Number(d.canonical);
    const replay = encodeGroup(frame, q, d.digits, d.extra);
    assert.equal(replay.R, frame.R);
  }
  assert.equal(decoded.length, 12956);
  const actualIoC = ioc(decoded, q);
  assert.ok(Math.abs(actualIoC - 1 / q) < 0.001);
  const expected = q === 26 ? 0.038486644044999144 :
    0.03702156597117173;
  assert.ok(Math.abs(actualIoC - expected) < 1e-12);
  console.log("NATURAL MAJOR-RED ONLY", q, "29 original rubric blocks",
    "each capacity sufficient without missing bits; original IoC",
    actualIoC.toFixed(9), "uniform baseline", (1 / q).toFixed(9),
    "canonical E=0 rubric blocks", canonical);
}

console.log("PASS: original-source, auto-merged punctuation grammar SFT");
