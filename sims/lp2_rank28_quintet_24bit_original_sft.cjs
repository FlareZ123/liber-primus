"use strict";
/**
 * LP2 original-source anti-repeat rank28 -> five-symbol/three-byte gate.
 * Original cipher source: resources/liber-primus/lp2-corpus.json
 * Windows 11 / Node 22 SFT: node sims/lp2_rank28_quintet_24bit_original_sft.cjs
 *
 * Experimental conditional codec, not a verified Cicada instruction:
 * each original page's first rune seeds a 29-state exclusion transducer;
 * a repeated rune is removed into an explicit position sidecar;
 * all other runes are ranked among 28 values excluding their predecessor.
 * Five base28 digits are hypothesized to encode exactly three data bytes.
 *
 * Requirement for unflagged 3-byte code: each group < 2**24.
 * Checking this inequality needs no language model, key, or fitted decoder.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
assert.equal(pages.length, 55);
assert.equal(pages.reduce((sum, p) => sum + p.indices.length, 0), 12956);

/**
 * @param {number[][]} sequences
 * @returns {{ digits: number[], seeds: number[], positions: number[][] }}
 */
function rankWithoutCopies(sequences) {
  /** @type {number[]} */
  const digits = [];
  /** @type {number[]} */
  const seeds = [];
  /** @type {number[][]} */
  const positions = [];
  for (const seq of sequences) {
    assert.ok(seq.length > 0);
    seeds.push(seq[0]);
    const pageCopyOffsets = [];
    for (let j = 1; j < seq.length; j++) {
      const previous = seq[j - 1];
      const current = seq[j];
      if (current === previous) {
        pageCopyOffsets.push(j);
      } else {
        digits.push(current < previous ? current : current - 1);
      }
    }
    positions.push(pageCopyOffsets);
  }
  return { digits, seeds, positions };
}

/**
 * Reconstruct all original rune indices when the discarded copy positions
 * and page seeds are explicitly supplied. The sidecar is essential.
 * @param {number[]} digits
 * @param {number[]} seeds
 * @param {number[][]} positions
 * @param {number[]} lengths
 * @returns {number[][]}
 */
function restore(digits, seeds, positions, lengths) {
  let cursor = 0;
  const out = [];
  for (let i = 0; i < lengths.length; i++) {
    const sequence = [seeds[i]];
    const copies = new Set(positions[i]);
    for (let j = 1; j < lengths[i]; j++) {
      const previous = sequence[j - 1];
      if (copies.has(j)) sequence.push(previous);
      else {
        const d = digits[cursor++];
        assert.ok(Number.isInteger(d) && d >= 0 && d < 28);
        sequence.push(d < previous ? d : d + 1);
      }
    }
    out.push(sequence);
  }
  assert.equal(cursor, digits.length);
  return out;
}

/**
 * @param {number[]} digits
 * @param {number} phase
 * @param {boolean} reversed
 * @returns {{groups: number, overflows: number, bytes: Buffer}}
 */
function unpack(digits, phase, reversed) {
  const bytes = [];
  let groups = 0;
  let overflows = 0;
  for (let i = phase; i + 5 <= digits.length; i += 5) {
    const five = digits.slice(i, i + 5);
    if (reversed) five.reverse();
    const value = five.reduce((sum, digit) => sum * 28 + digit, 0);
    assert.ok(value >= 0 && value < 28 ** 5);
    if (value >= 2 ** 24) overflows++;
    bytes.push((value >>> 16) & 255, (value >>> 8) & 255, value & 255);
    groups++;
  }
  return { groups, overflows, bytes: Buffer.from(bytes) };
}

/**
 * A true three-byte payload is always encodable as five base28 digits.
 * @param {Buffer} bytes
 * @returns {number[]}
 */
function bytesToBase28(bytes) {
  assert.equal(bytes.length % 3, 0);
  const out = [];
  for (let i = 0; i < bytes.length; i += 3) {
    let value = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    const five = Array(5).fill(0);
    for (let j = 4; j >= 0; j--) {
      five[j] = value % 28;
      value = Math.floor(value / 28);
    }
    assert.equal(value, 0);
    out.push(...five);
  }
  return out;
}

/** @param {number[]} digits @param {number} seed @returns {number[]} */
function synthNoRepeat(digits, seed) {
  const source = [seed];
  for (const d of digits) {
    const p = source[source.length - 1];
    source.push(d < p ? d : d + 1);
  }
  return source;
}

const source = rankWithoutCopies(pages.map((p) => p.indices));
const copyCount = source.positions.reduce((n, p) => n + p.length, 0);
assert.equal(copyCount, 86);
assert.equal(source.digits.length, 12815);
assert.equal(source.digits.length % 5, 0);
assert.deepEqual(source.digits.slice(0, 10), [8,17,3,5,18,26,0,14,25,18]);
assert.deepEqual(
  restore(source.digits, source.seeds, source.positions, pages.map((p) => p.indices.length)),
  pages.map((p) => p.indices)
);

const forward = Array.from({ length: 5 }, (_, phase) =>
  unpack(source.digits, phase, false));
const reverse = Array.from({ length: 5 }, (_, phase) =>
  unpack(source.digits, phase, true));
assert.deepEqual(forward.map((p) => p.groups), [2563,2562,2562,2562,2562]);
assert.deepEqual(forward.map((p) => p.overflows), [63,58,69,65,64]);
assert.deepEqual(reverse.map((p) => p.overflows), [70,59,58,69,72]);
assert.equal(forward[0].bytes.subarray(0,24).toString("hex"),
  "50c38ef407aebd47fee138ef4bcde39df4886481083b50b4");

/* Independent authentic clear p57 payload, compressed with Node zlib,
   planted through precisely the proposed 3-byte codec. */
const clear = corpus.pages.find((p) => p.page === 57).indices;
assert.equal(clear.length, 95);
const compressed = zlib.deflateSync(Buffer.from(clear));
const pad = (3 - compressed.length % 3) % 3;
const padded = Buffer.concat([compressed, Buffer.alloc(pad)]);
const plantedDigits = bytesToBase28(padded);
const plantedRunes = synthNoRepeat(plantedDigits, clear[0]);
const recovered = rankWithoutCopies([plantedRunes]);
assert.deepEqual(recovered.digits, plantedDigits);
assert.deepEqual(recovered.positions, [[]]);
const plantDecoded = unpack(recovered.digits, 0, false);
assert.equal(plantDecoded.overflows, 0);
assert.deepEqual(plantDecoded.bytes, padded);
assert.deepEqual(zlib.inflateSync(plantDecoded.bytes.subarray(0, compressed.length)),
  Buffer.from(clear));
assert.deepEqual(restore(recovered.digits, recovered.seeds, recovered.positions,
  [plantedRunes.length])[0], plantedRunes);

const summary = {
  originalRuneCount: 12956,
  originalRunePages: 55,
  pageSeeds: source.seeds.length,
  repeatSitesStoredAsSidecar: copyCount,
  base28Digits: source.digits.length,
  firstEightNonrepeatRanks: source.digits.slice(0, 8),
  candidateGroupsPerPhase: forward.map((p) => p.groups),
  forwardOverflowsByPhase: forward.map((p) => p.overflows),
  reversedQuintetOverflowsByPhase: reverse.map((p) => p.overflows),
  first24LowBytesHex: forward[0].bytes.subarray(0,24).toString("hex"),
  nativeP57ZlibPlantBytes: compressed.length,
  nativeP57PlantOverflows: plantDecoded.overflows,
  result: "All ten direct base28 quintet-to-three-byte conventions fail the mandatory unflagged 24-bit range; no plaintext decoded."
};
process.stdout.write(JSON.stringify(summary, null, 2) + "\n");
