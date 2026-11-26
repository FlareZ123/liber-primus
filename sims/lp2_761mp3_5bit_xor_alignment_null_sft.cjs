"use strict";
/**
 * Follow-up null test for an exploratory, non-historical symbolwise 5-bit XOR variant.
 * The source-authentic bytewise packed-GP29 XOR is already tested by Agent37.
 * The single best p23–26 result is from lp2_761mp3_5bit_xor_rune_stream_sft.cjs.
 *
 * The first screen's best of 16 bit packings had 35 out-of-alphabet values
 * (3.43%) on 1,021 runes. This script asks whether that low count reflects
 * positional alignment or merely the empirical symbol distributions.
 *
 * For each of the 16 bit-order/phase key streams, independently permute its
 * 1,021 5-bit values, preserving that stream's exact histogram. In each of
 * 5,000 replicates, record the minimum invalid count across all 16 variants.
 * Independent phase shuffles make the multiple-testing null conservative.
 * PRNG seed 0x3301 is for reproducible simulation only; it is not a cipher key.
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
const ITERATIONS = 5000;
const SEED = 0x3301;

function extractFiveBitValues(bytes, count, bitOffset, order) {
  const out = new Uint8Array(count);
  for (let i = 0; i < count; i++) {
    let value = 0;
    for (let j = 0; j < 5; j++) {
      const bitIndex = bitOffset + i * 5 + j;
      const bitPosition = order === "msb" ? 7 - (bitIndex & 7) : (bitIndex & 7);
      const bit = (bytes[bitIndex >>> 3] >>> bitPosition) & 1;
      if (order === "msb") value = (value << 1) | bit;
      else value |= bit << j;
    }
    out[i] = value;
  }
  return out;
}

function invalidCount(cipher, key) {
  let n = 0;
  for (let i = 0; i < cipher.length; i++) if ((cipher[i] ^ key[i]) >= 29) n++;
  return n;
}

function xorshift32(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return x >>> 0;
  };
}

function shuffleCopy(input, random) {
  const a = Uint8Array.from(input);
  for (let i = a.length - 1; i > 0; i--) {
    const j = random() % (i + 1);
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function quantile(sorted, q) {
  return sorted[Math.min(sorted.length - 1, Math.floor(q * (sorted.length - 1)))];
}

async function main() {
  const response = await fetch(SOURCE_URL, { redirect: "follow" });
  assert.ok(response.ok, `Pinned 761.MP3 download failed: HTTP ${response.status}`);
  const audio = Buffer.from(await response.arrayBuffer());
  assert.equal(audio.length, SOURCE_BYTES);
  assert.equal(crypto.createHash("sha256").update(audio).digest("hex"), SOURCE_SHA256);

  const corpus = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, "../resources/liber-primus/lp2-corpus.json"), "utf8"
  ));
  const cipher = corpus.pages
    .filter(p => p.page >= 23 && p.page <= 26)
    .flatMap(p => p.indices);
  assert.equal(cipher.length, 1021);

  const variants = [];
  for (const order of ["msb", "lsb"]) {
    for (let bitOffset = 0; bitOffset < 8; bitOffset++) {
      const key = extractFiveBitValues(audio, cipher.length, bitOffset, order);
      variants.push({ order, bitOffset, key, observed: invalidCount(cipher, key) });
    }
  }
  variants.sort((a, b) => a.observed - b.observed);
  const best = variants[0];

  const output = cipher.map((v, i) => v ^ best.key[i]);
  const translit = output.map(v => v < 29 ? corpus.translit[v] : `<${v}>`).join("");
  const keyHistogram = new Array(32).fill(0);
  const cipherHistogram = new Array(29).fill(0);
  const outputHistogram = new Array(32).fill(0);
  for (let i = 0; i < cipher.length; i++) {
    keyHistogram[best.key[i]]++;
    cipherHistogram[cipher[i]]++;
    outputHistogram[output[i]]++;
  }

  let expectedInvalid = 0;
  for (let c = 0; c < 29; c++) {
    for (let k = 0; k < 32; k++) {
      if ((c ^ k) >= 29) expectedInvalid += cipherHistogram[c] * keyHistogram[k] / cipher.length;
    }
  }

  const random = xorshift32(SEED);
  const nullMinima = new Uint16Array(ITERATIONS);
  for (let rep = 0; rep < ITERATIONS; rep++) {
    let min = Infinity;
    for (const variant of variants) {
      const shuffled = shuffleCopy(variant.key, random);
      const n = invalidCount(cipher, shuffled);
      if (n < min) min = n;
    }
    nullMinima[rep] = min;
  }
  const sorted = Array.from(nullMinima).sort((a, b) => a - b);
  const atLeastAsGood = sorted.filter(x => x <= best.observed).length;
  const pValue = (atLeastAsGood + 1) / (ITERATIONS + 1);

  console.log(JSON.stringify({
    source: { url: SOURCE_URL, sha256: SOURCE_SHA256, bytes: audio.length, id3Bytes: 206 },
    scope: "LP2 p23–26 Instar sequence, 1,021 canonical GP29 indices",
    operation: "raw 761.MP3 -> 5-bit groups -> XOR with GP29 indices",
    observedBest: {
      bitOrder: best.order,
      bitOffset: best.bitOffset,
      invalidCount: best.observed,
      invalidRate: best.observed / cipher.length,
      expectedInvalidUnderRandomAlignment: expectedInvalid,
      keyHistogram,
      cipherHistogram,
      outputHistogram,
      outputPreview: translit.slice(0, 400),
      outputLength: translit.length,
    },
    allObservedVariants: variants.map(v => ({
      bitOrder: v.order, bitOffset: v.bitOffset, invalidCount: v.observed,
      invalidRate: v.observed / cipher.length,
    })),
    null: {
      iterations: ITERATIONS,
      seed: SEED,
      preserved: "Each variant's exact 5-bit key-value histogram",
      independentPhaseShuffles: true,
      bestOf16Corrected: true,
      min: sorted[0],
      q01: quantile(sorted, 0.01),
      q05: quantile(sorted, 0.05),
      median: quantile(sorted, 0.5),
      q95: quantile(sorted, 0.95),
      max: sorted[sorted.length - 1],
      countAtOrBelowObserved: atLeastAsGood,
      pValue: Number(pValue.toFixed(8)),
    },
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
