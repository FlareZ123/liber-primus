"use strict";

/**
 * Original p8 red MXIX=1019 prime/F inverse, direct binary-container gate.
 *
 * Two original claims are kept separate. The red source word XIXM reads
 * MXIX=1019 on reversal, which suggests a prime-stream start; that cipher
 * choice is a hypothesis. The authentic p56 prime-totient/F-bypass mechanism
 * is known, but applying it to p8 is itself unproven.
 *
 * Enumerate ALL legal literal-F bypass assignments on the original p8 black
 * 243 GP29 runes under this fixed start. For each, decode the full original
 * GP29 sequence and its F-removed substream as a single big-endian base29
 * integer to bytes, test both byte endiannesses, and check direct 2014-era
 * container signatures, zlib, gzip and raw DEFLATE. No fitted key, offsets,
 * secondary XOR, bit slips, file names, language-model rescue or word
 * rearrangements are introduced.
 *
 * Node.js 22 CommonJS, read-only, Windows11-compatible:
 * node sims/lp2_p8_mxix1019_binary_container_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const root = path.resolve(__dirname, "..");
const source = JSON.parse(fs.readFileSync(path.join(
  root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const p8 = source.pages.find(p => p.page === 8).indices;
const p56 = source.pages.find(p => p.page === 56).indices;
const black = p8.slice(12);
assert.equal(p8.length, 255);
assert.equal(black.length, 243);
assert.deepEqual(p8.slice(0, 4), [14, 10, 14, 19]);
const eventIndices = black.flatMap((v, i) => v === 0 ? [i] : []);
assert.deepEqual(eventIndices, [22, 149, 171, 177, 180, 184, 191, 233]);
assert.equal(p56.length, 85);

const prime = [];
for (let n = 2; prime.length < 1300; n++) {
  let isPrime = true;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) { isPrime = false; break; }
  }
  if (isPrime) prime.push(n);
}
const mod = n => ((n % 29) + 29) % 29;

/**
 * Invert a given F-bypass assignment. An assigned F consumes zero prime
 * positions; a normal event consumes one and must produce non-F plaintext.
 * @param {number[]} ciphertext
 * @param {number} start
 * @param {Set<number>} transparentPositions
 * @returns {{plaintext:number[],used:number}|null}
 */
function decrypt(ciphertext, start, transparentPositions) {
  let used = 0;
  const plaintext = [];
  for (let i = 0; i < ciphertext.length; i++) {
    const c = ciphertext[i];
    if (transparentPositions.has(i)) {
      if (c !== 0) return null;
      plaintext.push(0);
      continue;
    }
    const p = mod(c - (prime[start + used++] - 1));
    if (p === 0) return null;
    plaintext.push(p);
  }
  return {plaintext, used};
}

/** @param {number[]} plaintext @param {number} start */
function encrypt(plaintext, start) {
  let used = 0;
  return plaintext.map(p =>
    p === 0 ? 0 : mod(p + prime[start + used++] - 1));
}

/** @param {number[]} digits */
function base29Bytes(digits) {
  let n = 0n;
  for (const digit of digits) {
    assert(Number.isInteger(digit) && digit >= 0 && digit < 29);
    n = n * 29n + BigInt(digit);
  }
  let hex = n.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  return Buffer.from(hex, "hex");
}

/** @param {Buffer} input */
function base29Digits(input) {
  let n = BigInt("0x" + input.toString("hex"));
  const digits = [];
  while (n > 0n) {
    digits.unshift(Number(n % 29n));
    n /= 29n;
  }
  return digits;
}

/** Check direct historically plausible byte signatures at offset zero. */
function fileMagic(input) {
  const heads = {
    bzip2: Buffer.from("BZh"),
    gzip: Buffer.from([0x1f, 0x8b, 0x08]),
    zlib1: Buffer.from([0x78, 0x01]),
    zlib9: Buffer.from([0x78, 0x9c]),
    zlibMax: Buffer.from([0x78, 0xda]),
    zip: Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    pdf: Buffer.from("%PDF-"),
    png: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    jpg: Buffer.from([0xff, 0xd8, 0xff]),
    xz: Buffer.from([0xfd, 0x37, 0x7a, 0x58, 0x5a, 0x00]),
    pgpArmor: Buffer.from("-----BEGIN PGP ")
  };
  return Object.entries(heads)
    .filter(([,prefix]) => input.subarray(0, prefix.length).equals(prefix))
    .map(([name]) => name);
}

/** Reject random short false inflation; demand >=50 readable ASCII bytes. */
function directReadableInflation(input) {
  const modes = {
    zlib: x => zlib.inflateSync(x, {maxOutputLength: 1048576}),
    gzip: x => zlib.gunzipSync(x, {maxOutputLength: 1048576}),
    rawDeflate: x => zlib.inflateRawSync(x, {maxOutputLength: 1048576})
  };
  const hits = [];
  for (const [name, run] of Object.entries(modes)) {
    let decoded;
    try { decoded = run(input); }
    catch (error) {
      // Invalid compressed headers/streams are the expected original null.
      if (error instanceof Error) continue;
      throw error;
    }
    const printable = decoded.filter(c =>
      (c >= 32 && c <= 126) || c === 9 || c === 10 || c === 13).length;
    if (decoded.length >= 50 && printable / decoded.length >= 0.9) {
      hits.push({codec:name,bytes:decoded.length,
        prefix:decoded.subarray(0,80).toString("utf8")});
    }
  }
  return hits;
}

const valid = [];
for (let mask = 0; mask < 256; mask++) {
  const transparent = new Set(eventIndices.filter((_,i) => mask & (1 << i)));
  const decoded = decrypt(black, 1019, transparent);
  if (!decoded) continue;
  assert.deepEqual(encrypt(decoded.plaintext, 1019), black);
  valid.push({mask, ...decoded});
}
assert.deepEqual(valid.map(x => x.mask), [7, 135, 255]);
assert.deepEqual(valid.map(x => x.used), [240, 239, 235]);

const checked = [];
const recognized = [];
for (const item of valid) {
  for (const [kind, digits] of [
    ["full", item.plaintext],
    ["removeF", item.plaintext.filter(p => p !== 0)]
  ]) {
    const bytes = base29Bytes(digits);
    for (const [direction, stream] of [
      ["forward", bytes], ["reverse", Buffer.from(bytes).reverse()]
    ]) {
      const magic = fileMagic(stream);
      const decoded = directReadableInflation(stream);
      const record = {
        mask:item.mask, used:item.used, kind, direction,
        bytes:stream.length,
        sha256:crypto.createHash("sha256").update(stream).digest("hex"),
        first16:stream.subarray(0,16).toString("hex"),
        magic, readableInflation:decoded
      };
      checked.push(record);
      if (magic.length || decoded.length) recognized.push(record);
    }
  }
}
assert.equal(checked.length, 12);
assert.deepEqual(recognized, []);
assert.deepEqual(checked.filter(x => x.kind === "full" &&
  x.direction === "forward").map(x => x.bytes), [148, 148, 148]);

// P56 is the genuine signed-source solved control for the F-transparent clock.
const p56Plain = source.pages[56].indices.map((c,i) => c);
let clock = 0;
const known = p56Plain.map((c,i) => i === 56 ? 0 :
  mod(c - prime[clock++] + 1));
assert.equal(clock, 84);
assert.equal(known[56], 0);
assert.deepEqual(encrypt(known, 0), p56);

// A planted compressed byte payload must survive our exact radix29 and
// source-selected prime/F inverse. This is the positive for the binary path.
const message = Buffer.from("LIBER PRIMUS SOURCE-LOCKED BINARY POSITIVE. ".repeat(8));
const compressed = zlib.deflateSync(message);
const plantedPlain = base29Digits(compressed);
const plantedCipher = encrypt(plantedPlain, 1019);
const plantedF = new Set(plantedPlain.flatMap((p,i) => p === 0 ? [i] : []));
const replay = decrypt(plantedCipher, 1019, plantedF);
assert(replay);
assert.deepEqual(replay.plaintext, plantedPlain);
assert.deepEqual(base29Bytes(replay.plaintext), compressed);
assert.deepEqual(zlib.inflateSync(base29Bytes(replay.plaintext)), message);
assert(fileMagic(compressed).some(s => s.startsWith("zlib")));

console.log(JSON.stringify({
  source:"LP2 original p8 red XIXM and p8 243-rune black body",
  redReversedRoman:1019,
  originalFEventIndices:eventIndices,
  originalLegalBypassMasks:valid.map(x => ({mask:x.mask,used:x.used})),
  originalDirectBinaryReadouts:checked,
  independentNativeControls:{
    genuineP56ExactCipherRecovered:true,
    plantedPrimeFCompressedPayloadRecovered:true,
    plantedPayloadBytes:compressed.length
  },
  directContainerHits:recognized.length,
  claim:"No directly readable compressed/container bytes. MXIX=1019 and the p56 F bypass are conditional source-selected hypotheses, not a proven p8 cipher. Other operations remain untested."
},null,2));
