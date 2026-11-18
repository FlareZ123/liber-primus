"use strict";

/**
 * Exact source-ordered per-word multiset rank and one frozen whole-book
 * mixed-radix byte receiver on original LP2. Director #1493.
 *
 * No inserted source values, guessed alphabet, byte phase, search, or writes.
 * All program input is loaded from this repository.
 * @module lp2_word_multiset_factoradic_original_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..", "resources", "liber-primus");
const source = fs.readFileSync(path.join(ROOT, "lp2-transcription.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "lp2-corpus.json"), "utf8"));
const alphabet = corpus.runes;
const index = new Map(alphabet.map((r, i) => [r, i]));
const FACTORIAL = [1n];
for (let n = 1; n <= 30; n++) {
  FACTORIAL.push(FACTORIAL[n - 1] * BigInt(n));
}

/** @param {number[]} counts */
function countPermutations(counts) {
  const total = counts.reduce((sum, x) => sum + x, 0);
  assert.ok(total < FACTORIAL.length);
  return FACTORIAL[total] /
    counts.reduce((product, n) => product * FACTORIAL[n], 1n);
}

/** @param {number[]} symbols */
function frequency(symbols) {
  const counts = Array(29).fill(0);
  for (const n of symbols) {
    assert.ok(Number.isInteger(n) && n >= 0 && n < 29);
    counts[n]++;
  }
  return counts;
}

/**
 * Rank one exact word in lexicographic GP29 symbol order. Repeated glyphs
 * are indistinguishable; the divisor is the source word's own multinomial.
 * @param {number[]} symbols
 * @returns {{rank:bigint,base:bigint}}
 */
function rankWord(symbols) {
  const counts = frequency(symbols);
  let base = countPermutations(counts), remaining = symbols.length;
  let ways = base, rank = 0n;
  for (const x of symbols) {
    for (let y = 0; y < x; y++) {
      if (counts[y]) rank += ways * BigInt(counts[y]) / BigInt(remaining);
    }
    ways = ways * BigInt(counts[x]) / BigInt(remaining);
    counts[x]--;
    remaining--;
  }
  assert.equal(ways, 1n);
  assert.ok(rank >= 0n && rank < base);
  return {rank, base};
}

/**
 * Lexicographically unrank a word using its original symbol multiset.
 * @param {number[]} unordered
 * @param {bigint} ordinal
 * @returns {number[]}
 */
function unrankWord(unordered, ordinal) {
  const counts = frequency(unordered);
  let ways = countPermutations(counts), remaining = unordered.length;
  assert.ok(ordinal >= 0n && ordinal < ways);
  const output = [];
  while (remaining > 0) {
    let chosen = false;
    for (let y = 0; y < 29; y++) {
      if (counts[y] === 0) continue;
      const block = ways * BigInt(counts[y]) / BigInt(remaining);
      if (ordinal >= block) {
        ordinal -= block;
        continue;
      }
      output.push(y);
      ways = block;
      counts[y]--;
      remaining--;
      chosen = true;
      break;
    }
    assert.ok(chosen);
  }
  assert.equal(ordinal, 0n);
  return output;
}

/** @param {number[][]} words */
function pack(words) {
  let scalar = 0n, count = 1n, capacity = 0, informational = 0;
  const entries = words.map(word => {
    const {rank, base} = rankWord(word);
    scalar = scalar * base + rank;
    count *= base;
    if (base > 1n) informational++;
    capacity += Math.log2(Number(base));
    return {rank, base};
  });
  const bits = (count - 1n).toString(2).length;
  const width = Math.ceil(bits / 8);
  const hex = scalar.toString(16).padStart(2 * width, "0");
  const bytes = Buffer.from(hex, "hex");
  assert.equal(bytes.length, width);
  assert.ok(scalar >= 0n && scalar < count);
  return {entries, bytes, scalar, count, bits, width, capacity, informational};
}

/**
 * Rebuild the entire 12,956-rune original text by extracting source ranks
 * backward from the mixed-radix integer, then multiset unranking.
 * @param {number[][]} multisets
 * @param {{scalar:bigint,entries:Array<{base:bigint}>}} packed
 * @returns {number[][]}
 */
function unpack(multisets, packed) {
  let rest = packed.scalar;
  const result = Array(multisets.length);
  for (let i = multisets.length - 1; i >= 0; i--) {
    const base = packed.entries[i].base;
    const rank = rest % base;
    rest /= base;
    result[i] = unrankWord(multisets[i], rank);
  }
  assert.equal(rest, 0n);
  return result;
}

/** @param {Buffer} bytes */
function summarizeBytes(bytes) {
  const freq = Array(256).fill(0);
  let ascii = 0;
  for (const b of bytes) {
    freq[b]++;
    if (b >= 32 && b <= 126) ascii++;
  }
  let entropy = 0;
  for (const n of freq) {
    if (!n) continue;
    const p = n / bytes.length;
    entropy -= p * Math.log2(p);
  }
  const fileMagics = {
    gzip:"1f8b08", zip:"504b0304", pdf:"255044462d",
    png:"89504e470d0a1a0a", pgp:"2d2d2d2d2d424547494e",
    zlib:"789c", bzip2:"425a68"
  };
  const atStart = Object.entries(fileMagics)
    .filter(([, hex]) => bytes.subarray(0, hex.length / 2).toString("hex") === hex)
    .map(([name]) => name);
  return {entropy, asciiFraction:ascii / bytes.length, fileMagicAtOffset0:atStart,
    first32BytesHex:bytes.subarray(0, 32).toString("hex"),
    last32BytesHex:bytes.subarray(-32).toString("hex")};
}

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

/** @param {number[][]} words @param {()=>number} random */
function shuffleWords(words, random) {
  return words.map(original => {
    const arr = original.slice();
    for (let j = arr.length - 1; j > 0; j--) {
      const k = random() % (j + 1);
      [arr[j], arr[k]] = [arr[k], arr[j]];
    }
    return arr;
  });
}

/** @param {number[]} a @param {number[]} b */
function identical(a, b) {
  return a.length === b.length && a.every((x,i) => x === b[i]);
}

/** @param {Array<{runes:string}>} parsed */
function encodeWords(parsed) {
  return parsed.map(w => [...w.runes].map(r => {
    assert.ok(index.has(r));
    return index.get(r);
  }));
}

function run() {
  const parsed = parseLP2Words(source, 55);
  assert.equal(parsed.runeCount, 12956);
  assert.equal(parsed.words.length, 2896);
  assert.equal(parsed.crossPageWords, 32);
  const words = encodeWords(parsed.words);
  const canonical = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
  assert.ok(identical(words.flat(), canonical));
  const encoded = pack(words);
  assert.deepEqual(unpack(words, encoded), words);
  assert.equal(encoded.informational + encoded.entries.filter(e => e.base === 1n).length,
    words.length);

  const solved = parseLP2Words(source, 57);
  assert.equal(solved.runeCount, 13136);
  const p57 = solved.byStartPage[56];
  assert.equal(p57.reduce((sum,w) => sum + w.length,0),95);
  const clear = encodeWords(p57);
  assert.ok(identical(clear.flat(), corpus.pages.find(p=>p.page===57).indices));
  const positive = pack(clear);
  assert.deepEqual(unpack(clear, positive), clear);

  // Exact source-multiset-constrained null: no word lengths, glyph counts,
  // page carries, alphabet, or word order are changed, only internal order.
  // Frozen 64 controls with one declared seed; they cannot select byte framing.
  const random = rng(0x33011493);
  const trial = [];
  for (let t = 0; t < 64; t++) {
    const randomized = pack(shuffleWords(words, random));
    assert.equal(randomized.count, encoded.count);
    assert.equal(randomized.bytes.length, encoded.bytes.length);
    const stats = summarizeBytes(randomized.bytes);
    trial.push({entropy:stats.entropy, asciiFraction:stats.asciiFraction,
      magic:stats.fileMagicAtOffset0.length});
    if (t === 0) {
      assert.deepEqual(pack(unpack(words, randomized)).bytes, randomized.bytes);
    }
  }
  const actual = summarizeBytes(encoded.bytes);
  const sortedEntropy = trial.map(x => x.entropy).sort((a,b) => a-b);
  const sortedAscii = trial.map(x => x.asciiFraction).sort((a,b) => a-b);
  return {
    originalRunes:canonical.length, sourceWholeWords:words.length,
    crosses:parsed.crossPageWords,
    totalRankCapacityBits:encoded.capacity,
    exactPayloadBitWidth:encoded.bits,
    fixedWidthBytes:encoded.width,
    nontrivialWordRanks:encoded.informational,
    original:actual,
    originalFirst15Ranks:encoded.entries.slice(0,15)
      .map(x => ({rank:String(x.rank),base:String(x.base)})),
    originalInvertibility:"2896/2896 words, 12956/12956 runes exact",
    positiveSolvedP57:{runes:95,words:p57.length,capacityBits:positive.capacity,
      bitWidth:positive.bits,exactRoundTrip:true},
    originalMultisetNull64:{
      seed:"0x33011493",trials:trial.length,
      entropyRange:[sortedEntropy[0], sortedEntropy.at(-1)],
      asciiFractionRange:[sortedAscii[0], sortedAscii.at(-1)],
      openingMagicHits:trial.reduce((sum,x) => sum + x.magic,0),
      observedEntropyRank:1 + trial.filter(x => x.entropy < actual.entropy).length,
      observedAsciiRank:1 + trial.filter(x => x.asciiFraction < actual.asciiFraction).length
    },
    decision:"One frozen whole-book mixed-radix integer, big-endian fixed-width byte serialization. No authenticated initial file header, native GP plaintext, or author-chosen framing. This exact reversible source-local ranking is not a decryption."
  };
}
if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = {run, rankWord, unrankWord, pack, unpack, summarizeBytes};
