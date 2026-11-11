"use strict";

/**
 * Issue #340: one canonical GP29 word -> one minimal unsigned big-endian byte record.
 * Source: resources/lp2-transcription.txt, via sims/lp2_word_pages.cjs.
 * Alphabet: resources/liber-primus/lp2-corpus.json.runes (index 0..28).
 * No other alphabet, phase, offset, word subset, or alternative serializer is tested.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { TextDecoder } = require("node:util");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const alphabet = corpus.runes;
assert.equal(alphabet.length, 29);
assert.equal(new Set(alphabet).size, 29);
const gpIndex = new Map(alphabet.map((r, i) => [r, BigInt(i)]));
const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");

/** @param {string} word @returns {bigint} */
function valueOfRunes(word) {
  let n = 0n;
  for (const rune of word) {
    const digit = gpIndex.get(rune);
    assert.notEqual(digit, undefined, "Only canonical GP29 rune symbols are allowed");
    n = n * 29n + digit;
  }
  return n;
}

/** @param {bigint} n @returns {Buffer} */
function minimalBytes(n) {
  assert(n >= 0n);
  if (n === 0n) return Buffer.from([0]);
  const bytes = [];
  while (n > 0n) {
    bytes.push(Number(n & 255n));
    n >>= 8n;
  }
  return Buffer.from(bytes.reverse());
}

/** @param {Buffer} bytes @returns {bigint} */
function bytesValue(bytes) {
  let n = 0n;
  for (const byte of bytes) n = n * 256n + BigInt(byte);
  return n;
}

/** @param {bigint} n @returns {string} */
function shortestRunes(n) {
  if (n === 0n) return alphabet[0];
  const digits = [];
  while (n > 0n) {
    digits.push(alphabet[Number(n % 29n)]);
    n /= 29n;
  }
  return digits.reverse().join("");
}

/** @param {Buffer} bytes @returns {boolean} */
function isValidUTF8(bytes) {
  try {
    new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(bytes);
    return true;
  } catch (e) {
    if (e instanceof TypeError) return false;
    throw e;
  }
}

/** @param {Buffer} bytes @returns {string[]} */
function signatureNames(bytes) {
  const magic = [
    ["PNG", "89504e470d0a1a0a"],
    ["gzip", "1f8b08"],
    ["bzip2", "425a68"],
    ["ZIP-local", "504b0304"],
    ["ZIP-empty", "504b0506"],
    ["XZ", "fd377a585a00"],
    ["7zip", "377abcaf271c"],
    ["zstd", "28b52ffd"],
    ["PDF", "255044462d"],
    ["ELF", "7f454c46"],
    ["SQLite", "53514c69746520666f726d6174203300"],
    ["RIFF", "52494646"],
    ["ID3", "494433"],
    ["Ogg", "4f676753"],
    ["Java-class", "cafebabe"],
    ["WASM", "0061736d"],
  ];
  return magic.filter(([, h]) => bytes.subarray(0, h.length / 2).toString("hex") === h)
    .map(([name]) => name);
}

/** @param {Buffer} bytes */
function classify(bytes) {
  const allowed = bytes.reduce((n, b) =>
    n + (b >= 32 && b <= 126 || b === 9 || b === 10 || b === 13 ? 1 : 0), 0);
  const utf8 = isValidUTF8(bytes);
  let json = false;
  if (utf8) {
    try {
      JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
      json = true;
    } catch (e) {
      if (!(e instanceof SyntaxError)) throw e;
    }
  }
  return {
    sha256: sha256(bytes),
    totalBytes: bytes.length,
    hexPrefix32: bytes.subarray(0, 32).toString("hex"),
    hexSuffix32: bytes.subarray(-32).toString("hex"),
    printableASCII: allowed,
    printableFraction: Number((allowed / bytes.length).toFixed(9)),
    zeroBytes: bytes.reduce((n, b) => n + (b === 0 ? 1 : 0), 0),
    highBytes: bytes.reduce((n, b) => n + (b >= 128 ? 1 : 0), 0),
    validUTF8: utf8,
    validJSON: json,
    anchoredSignatures: signatureNames(bytes),
  };
}

/** @param {string} target @param {Buffer|string} contents */
function atomicLockedWrite(target, contents) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const lock = target + ".lock";
  const lockFd = fs.openSync(lock, "wx");
  const temporary = target + ".tmp-" + process.pid;
  try {
    fs.writeFileSync(temporary, contents, { flag: "wx", flush: true });
    fs.renameSync(temporary, target);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    fs.closeSync(lockFd);
    fs.unlinkSync(lock);
  }
}

/** @param {number} size @param {number} seed @returns {number[]} */
function deterministicPermutation(size, seed) {
  const order = Array.from({ length: size }, (_, i) => i);
  let state = seed >>> 0;
  for (let i = size - 1; i > 0; i--) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    const j = (state >>> 0) % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function run() {
  const parsed = parseSharedCorpus();
  assert.equal(parsed.words.length, 2896);
  assert.equal(parsed.runeCount, 12956);
  assert.equal(parsed.crossPageWords, 34);
  const records = [];
  const byteChunks = [];
  let offset = 0;
  const byLength = {};

  for (const [i, word] of parsed.words.entries()) {
    const bytes = minimalBytes(valueOfRunes(word.runes));
    const reconstructed = shortestRunes(bytesValue(bytes)).padStart(word.length, alphabet[0]);
    assert.equal(reconstructed, word.runes, "Original runes must roundtrip at stored width");
    const row = {
      wordIndex0: i,
      startPage: word.startPage,
      endPage: word.endPage,
      runes: word.runes,
      runeLength: word.length,
      byteOffset0: offset,
      byteLength: bytes.length,
      hex: bytes.toString("hex"),
    };
    records.push(row);
    byteChunks.push(bytes);
    offset += bytes.length;
    byLength[bytes.length] = (byLength[bytes.length] ?? 0) + 1;
  }
  const output = Buffer.concat(byteChunks);
  assert.equal(output.length, 8814);
  const original = classify(output);

  const positiveRecords = [
    Buffer.from("CICA"), Buffer.from("DA 33"), Buffer.from("01 word"),
    Buffer.from("-record "), Buffer.from("control\n"),
  ];
  for (const part of positiveRecords) {
    const encoded = shortestRunes(bytesValue(part));
    const decoded = minimalBytes(valueOfRunes(encoded));
    assert.deepEqual(decoded, part, "Planted byte-record inversion failed");
  }
  assert.deepEqual(Buffer.concat(positiveRecords),
    Buffer.from("CICADA 3301 word-record control\n"));

  const controls = [];
  for (let i = 0; i < 64; i++) {
    const permutation = deterministicPermutation(records.length, (0x33011033 + i * 0x9e3779b9) >>> 0);
    const shuffled = Buffer.concat(permutation.map((idx) => byteChunks[idx]));
    assert.equal(shuffled.length, output.length);
    controls.push(classify(shuffled));
  }
  const transcript = fs.readFileSync(path.join(ROOT, "resources", "lp2-transcription.txt"));
  const report = {
    test: "issue340-GP29-word-minimal-unsigned-big-endian",
    inputTranscriptSHA256: sha256(transcript),
    alphabet: alphabet.join(""),
    wordCount: parsed.words.length,
    runeCount: parsed.runeCount,
    crossPageWordCount: parsed.crossPageWords,
    wordByteLengths: byLength,
    result: original,
    plantedRecords: positiveRecords.length,
    plantedPass: true,
    shuffles: {
      count: controls.length,
      firstSHA256: controls[0].sha256,
      validUTF8: controls.filter((x) => x.validUTF8).length,
      validJSON: controls.filter((x) => x.validJSON).length,
      anchoredSignatureHits: controls.filter((x) => x.anchoredSignatures.length > 0).length,
    },
  };
  const outDir = path.join(ROOT, "artifacts", "issue340-word-minimalbytes");
  atomicLockedWrite(path.join(outDir, "concatenated.bin"), output);
  atomicLockedWrite(path.join(outDir, "word-record-index.json"),
    JSON.stringify({ test: report.test, records }, null, 2) + "\n");
  atomicLockedWrite(path.join(outDir, "summary.json"), JSON.stringify(report, null, 2) + "\n");
  console.log("ISSUE340_SUMMARY_BEGIN");
  console.log(JSON.stringify(report, null, 2));
  console.log("ISSUE340_SUMMARY_END");
}
run();
