"use strict";
/**
 * Exact, single-scope enumerative coding test for Director Issue #1472.
 * No cipher key, trained probabilities, offset search, or multiple byte orders.
 * Run from repository root: node sims/lp2_wordlength_multiset_rank_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const zlib = require("node:zlib");
const {parseSharedCorpus} = require("./lp2_word_pages.cjs");

/** @param {number} n @returns {bigint} */
function factorial(n) {
  let value = 1n;
  for (let i = 2; i <= n; i++) value *= BigInt(i);
  return value;
}

/** @param {number[]} sequence @returns {Map<number,number>} */
function multiset(sequence) {
  const counts = new Map();
  for (const length of sequence) counts.set(length, (counts.get(length) || 0) + 1);
  return new Map([...counts].sort((a, b) => a[0] - b[0]));
}

/** @param {Map<number,number>} counts @returns {bigint} */
function possibilities(counts) {
  const total = [...counts.values()].reduce((s, n) => s + n, 0);
  let value = factorial(total);
  for (const n of counts.values()) value /= factorial(n);
  return value;
}

/**
 * Standard zero-based lexicographic rank of a multiset permutation.
 * @param {number[]} sequence
 * @param {Map<number,number>} sourceCounts
 * @returns {bigint}
 */
function rank(sequence, sourceCounts) {
  const counts = new Map(sourceCounts);
  const keys = [...counts.keys()];
  let remainingPermutations = possibilities(counts), value = 0n;
  for (let i = 0; i < sequence.length; i++) {
    const symbol = sequence[i], left = BigInt(sequence.length - i);
    assert((counts.get(symbol) || 0) > 0);
    const less = keys.filter(k => k < symbol)
      .reduce((sum, k) => sum + counts.get(k), 0);
    const next = remainingPermutations * BigInt(counts.get(symbol));
    const addition = remainingPermutations * BigInt(less);
    assert.equal(addition % left, 0n);
    assert.equal(next % left, 0n);
    value += addition / left;
    remainingPermutations = next / left;
    counts.set(symbol, counts.get(symbol) - 1);
  }
  assert.equal(remainingPermutations, 1n);
  assert([...counts.values()].every(n => n === 0));
  return value;
}

/**
 * Inverse zero-based unranking with the identical original multiset.
 * @param {bigint} value
 * @param {Map<number,number>} sourceCounts
 * @returns {number[]}
 */
function unrank(value, sourceCounts) {
  let remainingPermutations = possibilities(sourceCounts);
  assert(value >= 0n && value < remainingPermutations);
  const counts = new Map(sourceCounts), keys = [...counts.keys()];
  const total = [...counts.values()].reduce((s, n) => s + n, 0);
  const output = [];
  for (let i = 0; i < total; i++) {
    const left = BigInt(total - i);
    let found = false;
    for (const symbol of keys) {
      const count = counts.get(symbol);
      if (!count) continue;
      const product = remainingPermutations * BigInt(count);
      assert.equal(product % left, 0n);
      const block = product / left;
      if (value >= block) {
        value -= block;
        continue;
      }
      counts.set(symbol, count - 1);
      remainingPermutations = block;
      output.push(symbol);
      found = true;
      break;
    }
    assert(found, "unranking ran out of candidate categories");
  }
  assert.equal(value, 0n);
  assert.equal(remainingPermutations, 1n);
  return output;
}

/** Minimum unsigned big-endian serialization, one byte for rank zero.
 * @param {bigint} value @returns {Buffer} */
function serialize(value) {
  assert(value >= 0n);
  const h = value.toString(16);
  return Buffer.from(h.padStart(Math.ceil(h.length / 2) * 2, "0"), "hex");
}

/** @param {Buffer} bytes @returns {number} */
function entropy(bytes) {
  const counts = new Uint32Array(256);
  for (const byte of bytes) counts[byte]++;
  return [...counts].reduce((sum, count) => {
    if (!count) return sum;
    const p = count / bytes.length;
    return sum - p * Math.log2(p);
  }, 0);
}

/** @param {Buffer} bytes @returns {string[]} */
function typedHeaders(bytes) {
  // Predeclared file signatures, each at least four bytes.
  const signatures = new Map([
    ["PNG", "89504e470d0a1a0a"], ["JPEG", "ffd8ffe0"],
    ["GIF87a", "474946383761"], ["GIF89a", "474946383961"],
    ["PDF", "255044462d"], ["ZIP/local", "504b0304"],
    ["ZIP/empty", "504b0506"], ["ZIP/spanned", "504b0708"],
    ["gzip", "1f8b0800"], ["bzip2/BZh1", "425a6831"],
    ["bzip2/BZh9", "425a6839"], ["xz", "fd377a585a00"],
    ["7z", "377abcaf271c"], ["zstd", "28b52ffd"],
    ["SQLite", "53514c69746520666f726d6174203300"],
    ["RIFF", "52494646"], ["ELF", "7f454c46"],
    ["OpenPGP ASCII", "2d2d2d2d2d424547494e20504750"],
    ["DOS/PE", "4d5a9000"], ["DER/ASN.1", "30820100"]
  ]);
  return [...signatures].filter(([, h]) => bytes.toString("hex").startsWith(h))
    .map(([name]) => name);
}

/** @param {number} seed @returns {()=>number} */
function random(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 4294967296;
  };
}

/** @param {number[]} values @param {()=>number} rng @returns {number[]} */
function shuffle(values, rng) {
  const copy = values.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** @param {string} scope @param {number[]} lengths @returns {object} */
function measure(scope, lengths) {
  const counts = multiset(lengths);
  const total = possibilities(counts);
  const originalRank = rank(lengths, counts);
  const output = serialize(originalRank);
  assert(originalRank < total);
  assert.deepEqual(unrank(originalRank, counts), lengths);
  assert.deepEqual(rank(unrank(originalRank, counts), counts), originalRank);

  // True complete multiset-native positive plant with a known file signature.
  // One-byte-shorter payload is guaranteed to fit the original rank interval.
  const planted = Buffer.alloc(output.length - 1);
  planted.set(Buffer.from("89504e470d0a1a0a", "hex"));
  const rng = random(0x33011472);
  for (let i = 8; i < planted.length; i++) {
    planted[i] = Math.floor(rng() * 256);
  }
  const plantedValue = BigInt("0x" + planted.toString("hex"));
  assert(plantedValue < total);
  const plantedPermutation = unrank(plantedValue, counts);
  assert.equal(plantedPermutation.length, lengths.length);
  assert.deepEqual(multiset(plantedPermutation), counts);
  assert.equal(rank(plantedPermutation, counts), plantedValue);
  assert(typedHeaders(serialize(rank(plantedPermutation, counts))).includes("PNG"));

  // Null controls use exactly the same multiset, no alternate receiver.
  const nullRng = random(0x33011473);
  const controlEntropies = [];
  for (let i = 0; i < 64; i++) {
    controlEntropies.push(entropy(serialize(rank(shuffle(lengths, nullRng), counts))));
  }
  const nullRange = [Math.min(...controlEntropies), Math.max(...controlEntropies)];
  return {
    scope, runes: lengths.reduce((a, b) => a + b, 0),
    words: lengths.length,
    lengthCounts: Object.fromEntries(counts),
    maxLength: Math.max(...lengths),
    rankDomainBitLength: total.toString(2).length,
    originalRankBits: originalRank.toString(2).length,
    rankHex: output.toString("hex"),
    byteCount: output.length,
    outputSHA256: crypto.createHash("sha256").update(output).digest("hex"),
    lengthVectorSHA256: crypto.createHash("sha256")
      .update(lengths.join(","), "utf8").digest("hex"),
    byteEntropy: entropy(output),
    deflateRawByteCount: zlib.deflateRawSync(output).length,
    headerMatches: typedHeaders(output),
    controlEntropyRange: nullRange,
    plantRecovered: true,
    reverseExact: true
  };
}

const original = parseSharedCorpus();
assert.equal(original.runeCount, 12956);
assert.equal(original.words.length, 2896);
assert.equal(original.crossPageWords, 32);
const full = measure("all unknown LP2 rune-bearing pages p0-p55", original.words.map(w => w.length));
const chapter = measure("original physical p0-p2 chapter", original.byStartPage.slice(0, 3).flat().map(w => w.length));
assert.equal(chapter.words, 158);
assert.equal(chapter.runes, 729);
assert.equal(full.byteCount, 1099);
assert.equal(chapter.byteCount, 58);
assert.equal(full.rankHex.slice(0, 16), "d7758df1640a621a");
assert.equal(chapter.rankHex, "0f40367a9561dc41afc2146268f67a95dc1443ff98b2d55ac2d65ab5017f075f5f4640d7f879be95ce83ac7ca2275e5496dfc07b3ee1c5b94290");

console.log(JSON.stringify({
  method: "exact canonical zero-based multiset permutation rank; minimum unsigned big-endian bytes",
  total: full, physicalChapter: chapter,
  conclusion: "No predeclared typed container header or independent plaintext inverse; single standard global rank hypothesis unsupported."
}, null, 2));
