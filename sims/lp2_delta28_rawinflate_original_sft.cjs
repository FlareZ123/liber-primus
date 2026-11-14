"use strict";

/**
 * Exact original keyless cumulative-GP29 -> base28 headerless DEFLATE gate.
 * The 2014 chain actually used bzip2/gzip transport, and near-absence of
 * identical successive LP2 runes makes nonzero GP29 steps -> base28 natural.
 * Headerless RFC1951 decoding has no magic header, so full input consumption,
 * bounded output and an authentic decoding are required.
 *
 * SFT: node sims/lp2_delta28_rawinflate_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const root = path.resolve(__dirname, "..");
const c = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const pages = c.pages.filter(p => p.page >= 0 && p.page <= 55 &&
  p.runic_count > 0);
const full = pages.flatMap(p => p.indices);
assert.equal(full.length, 12956);
const lengths = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
assert.equal(lengths.reduce((a, b) => a + b, 0), full.length);
const groups = [{ name: "complete-unknown", seq: full }];
let cursor = 0;
for (const [i, len] of lengths.entries()) {
  groups.push({ name: "source-chapter-" + i,
    seq: full.slice(cursor, cursor + len) });
  cursor += len;
}
const floral = full.slice(-3316);
assert.equal(floral.length, 3316);
groups.push({ name: "floral-p40-p55", seq: floral });
for (const p of pages) {
  if (p.indices.length >= 160)
    groups.push({ name: "physical-p" + p.page, seq: p.indices });
}
assert.equal(groups.length, 59);

/** @param {number} n @returns {number} */
function mod29(n) {
  return (n % 29 + 29) % 29;
}

/**
 * For nonzero forward GP29 steps, map 1..28 to 0..27; a zero step is
 * provisionally a marker/escape. Reverse and sign are frozen finite controls.
 * @param {number[]} seq
 * @param {1 | -1} sign
 * @param {boolean} reversed
 */
function decode(seq, sign, reversed) {
  const input = reversed ? seq.slice().reverse() : seq;
  let value = 0n, symbols = 0, repeats = 0;
  for (let i = 1; i < input.length; i++) {
    const step = mod29(sign * (input[i] - input[i - 1]));
    if (step === 0) {
      repeats++;
      continue;
    }
    value = value * 28n + BigInt(step - 1);
    symbols++;
  }
  let hex = value.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  const bytes = Buffer.from(hex, "hex");
  return { bytes, repeats, symbols };
}


/**
 * Decode a complete RFC1951 raw DEFLATE or RFC1950 zlib member.
 * Invalid source bytes are expected to throw a zlib decoding error.
 * @param {Buffer} encoded
 * @param {"raw" | "zlib"} mode
 * @returns {Buffer | null}
 */
function inflateWhole(encoded, mode) {
  try {
    const options = { info: true, maxOutputLength: 1048576 };
    const decoded = mode === "raw"
      ? zlib.inflateRawSync(encoded, options)
      : zlib.inflateSync(encoded, options);
    // zlib permits arbitrary trailing bytes; those are not a whole-stream hit.
    if (decoded.engine.bytesWritten !== encoded.length) return null;
    return decoded.buffer;
  } catch {
    return null; // Structurally invalid compressed streams are expected.
  }
}

/**
 * Plant a real compressed byte member into precisely the original floral
 * repeat-marker topology. Each nonzero step is a GP29 permutation and all
 * original marker positions remain repeated runes. No secret key is needed.
 * @param {Buffer} payload
 * @param {number[]} original
 * @returns {number[]}
 */
function plant(payload, original) {
  const count = original.slice(1).filter((x, i) => x !== original[i]).length;
  let val = BigInt("0x" + payload.toString("hex"));
  const digits = new Array(count).fill(0);
  for (let i = count - 1; i >= 0 && val > 0n; i--) {
    digits[i] = Number(val % 28n);
    val /= 28n;
  }
  assert.equal(val, 0n, "payload fits the GP28 source-length capacity");
  const out = [original[0]];
  let j = 0;
  for (let i = 1; i < original.length; i++) {
    out.push(original[i] === original[i - 1] ? out[i - 1] :
      (out[i - 1] + digits[j++] + 1) % 29);
  }
  assert.equal(j, count);
  return out;
}

const known = Buffer.from(
  "LIBER PRIMUS IS THE WAY ITS WORDS ARE THE MAP", "ascii");
for (const mode of ["raw", "zlib"]) {
  const compressed = mode === "raw"
    ? zlib.deflateRawSync(known) : zlib.deflateSync(known);
  const synthetic = plant(compressed, floral);
  const obtained = decode(synthetic, 1, false);
  assert(obtained.bytes.equals(compressed));
  const recovered = inflateWhole(obtained.bytes, mode);
  assert(recovered && recovered.equals(known));
  const trailing = Buffer.concat([obtained.bytes, Buffer.from([0xf7])]);
  assert.equal(inflateWhole(trailing, mode), null);
  console.log("POSITIVE", mode, "compressedBytes=" + compressed.length,
    "GP29Runes=" + synthetic.length, "completeSourceShape=PASS");
}

let attempts = 0;
const hits = [];
for (const g of groups) {
  for (const sign of [1, -1]) {
    for (const reversed of [false, true]) {
      const recovered = decode(g.seq, /** @type {1 | -1} */(sign),
        reversed);
      for (const mode of ["raw", "zlib"]) {
        attempts++;
        const decoded = inflateWhole(recovered.bytes, mode);
        if (decoded !== null) {
          const digest = require("node:crypto").createHash("sha256")
            .update(decoded).digest("hex");
          const hit = { register: g.name, sign, reversed, mode,
            encodedBytes: recovered.bytes.length,
            outputBytes: decoded.length, sha256: digest,
            utf8Preview: decoded.subarray(0, 120).toString("utf8") };
          hits.push(hit);
          console.log("ORIGINAL-CANDIDATE", JSON.stringify(hit));
        }
      }
    }
  }
}
assert.equal(groups.length, 59);
assert.equal(attempts, 472);
console.log("DECISION", JSON.stringify({
  originalRegisters: 59, decoderVariants: attempts,
  completeRawOrZlibMembers: hits.length,
  source: "original LP2 GP29 canonical delta28 rank, no fitted key",
  limitation: "framed, keyed, offset, noncanonical binary streams untested",
  recoveredUnknownPlaintext: hits.some(h => h.outputBytes > 40 &&
    /[ A-Za-z]{30}/.test(h.utf8Preview))
}));
