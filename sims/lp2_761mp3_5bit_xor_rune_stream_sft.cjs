"use strict";
/**
 * Test a source-motivated cross-round key hypothesis:
 *   - p57 repeats the 2013 761.MP3 ID3 poem; p23–26 form the Instar illustration sequence.
 *   - Cicada 2013 authenticates raw-byte XOR through 761.MP3 XOR Twitter.bin -> gematria.jpg.
 *   - Gematria Primus has 29 symbols, so a standard fixed-width representation is 5 bits/symbol.
 *
 * This SFT tests the raw pinned MP3 (including its 206-byte ID3 tag) as a continuous
 * 5-bit XOR key stream against canonical GP29 indices. It tests only the 8 possible
 * bit phases and both conventional MSB-/LSB-first packings, at byte offset zero.
 * Scopes: the complete unknown LP2 stream p0–55, and the p23–26 Instar sequence
 * with the key stream restarted at its first bit. No modulo reduction, extra offset,
 * key derivation, or postprocessing is permitted.
 *
 * Run with .github/workflows/manual-node22-sft-runner.yml:
 *   sft = sims/lp2_761mp3_5bit_xor_rune_stream_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const SOURCE_URL =
  "https://raw.githubusercontent.com/rtkd/iddqd/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/2013/02/761.MP3";
const SOURCE_SHA256 =
  "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460";
const SOURCE_BYTES = 4010732;
const EXPECTED_ID3_BYTES = 206;

function extractFiveBitValues(bytes, count, bitOffset, order) {
  const out = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    let value = 0;
    for (let j = 0; j < 5; j++) {
      const bitIndex = bitOffset + i * 5 + j;
      const byte = bytes[bitIndex >>> 3];
      const bitPosition = order === "msb"
        ? 7 - (bitIndex & 7)
        : (bitIndex & 7);
      const bit = (byte >>> bitPosition) & 1;
      if (order === "msb") value = (value << 1) | bit;
      else value |= bit << j;
    }
    out[i] = value;
  }
  return out;
}

function evaluate(cipher, key, translit) {
  let invalid = 0;
  const histogram = new Array(32).fill(0);
  const firstInvalid = [];
  const decoded = new Array(cipher.length);
  for (let i = 0; i < cipher.length; i++) {
    const value = cipher[i] ^ key[i];
    decoded[i] = value;
    histogram[value]++;
    if (value >= 29) {
      invalid++;
      if (firstInvalid.length < 12) firstInvalid.push({ index: i, value });
    }
  }
  const preview = decoded.slice(0, 80)
    .map(v => v < 29 ? translit[v] : `<${v}>`).join("");
  return {
    invalidCount: invalid,
    validCount: cipher.length - invalid,
    validFraction: Number(((cipher.length - invalid) / cipher.length).toFixed(8)),
    distinctOutputValues: histogram.filter(n => n > 0).length,
    histogram,
    firstInvalid,
    preview,
    decoded: invalid === 0 ? decoded.map(v => translit[v]).join("") : undefined,
  };
}

async function main() {
  const response = await fetch(SOURCE_URL, { redirect: "follow" });
  assert.ok(response.ok, `Pinned 761.MP3 download failed: HTTP ${response.status}`);
  const audio = Buffer.from(await response.arrayBuffer());
  assert.equal(audio.length, SOURCE_BYTES, "Unexpected pinned 761.MP3 length");
  assert.equal(
    crypto.createHash("sha256").update(audio).digest("hex"),
    SOURCE_SHA256,
    "Pinned 761.MP3 SHA-256 mismatch"
  );
  assert.equal(audio.subarray(0, 3).toString("ascii"), "ID3", "Missing ID3 header");
  const id3BodyLength =
    (audio[6] << 21) | (audio[7] << 14) | (audio[8] << 7) | audio[9];
  assert.equal(id3BodyLength + 10, EXPECTED_ID3_BYTES, "Unexpected ID3 tag length");

  const corpusPath = path.resolve(__dirname, "../resources/liber-primus/lp2-corpus.json");
  const corpus = JSON.parse(fs.readFileSync(corpusPath, "utf8"));
  assert.equal(corpus.runes.length, 29, "Expected the canonical 29-symbol GP alphabet");
  assert.equal(corpus.translit.length, 29, "Expected 29 transliteration entries");

  const unknownPages = corpus.pages.filter(p => p.page >= 0 && p.page <= 55);
  const allUnknown = unknownPages.flatMap(p => p.indices);
  const instarPages = unknownPages.filter(p => p.page >= 23 && p.page <= 26);
  const instar = instarPages.flatMap(p => p.indices);
  assert.equal(allUnknown.length, 12956, "Unexpected unknown-page rune count");
  assert.equal(instar.length, 1021, "Unexpected p23–26 rune count");

  const scopes = [
    { name: "all unknown LP2 p0–55, continuous", cipher: allUnknown },
    { name: "LP2 p23–26 Instar sequence, key restarts at bit zero", cipher: instar },
  ];
  const results = [];
  for (const scope of scopes) {
    for (const order of ["msb", "lsb"]) {
      for (let bitOffset = 0; bitOffset < 8; bitOffset++) {
        const key = extractFiveBitValues(audio, scope.cipher.length, bitOffset, order);
        const result = evaluate(scope.cipher, key, corpus.translit);
        results.push({
          scope: scope.name,
          bitOrder: order,
          bitOffset,
          runeCount: scope.cipher.length,
          ...result,
        });
      }
    }
  }

  results.sort((a, b) =>
    a.invalidCount - b.invalidCount ||
    a.scope.localeCompare(b.scope) ||
    a.bitOrder.localeCompare(b.bitOrder) ||
    a.bitOffset - b.bitOffset
  );
  console.log(JSON.stringify({
    source: {
      url: SOURCE_URL,
      sha256: SOURCE_SHA256,
      bytes: audio.length,
      id3Bytes: id3BodyLength + 10,
      includesId3: true,
    },
    operation: "GP29 index XOR continuous 5-bit chunks of raw 761.MP3",
    testedVariants: results.length,
    scopes: scopes.map(s => ({ name: s.name, runeCount: s.cipher.length })),
    best: results.slice(0, 8),
    allVariants: results.map(({ scope, bitOrder, bitOffset, runeCount, invalidCount, validFraction, distinctOutputValues, firstInvalid, preview }) => ({
      scope, bitOrder, bitOffset, runeCount, invalidCount, validFraction,
      distinctOutputValues, firstInvalid, preview,
    })),
    acceptance: "A viable GP29 plaintext stream must contain only values 0–28; no modulo repair is allowed.",
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
