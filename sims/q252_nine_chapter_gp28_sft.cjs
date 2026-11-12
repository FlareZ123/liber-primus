"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const grid = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/base60-grid.json"), "utf8"));
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const mod29 = (x) => (x % 29 + 29) % 29;

/** Multiply descending GF(29) polynomial coefficient arrays. */
function multiply(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = mod29(out[i + j] + a[i] * b[j]);
    }
  }
  return out;
}

/** Divide descending P256 by two fixed, reversed source-polynomial triples. */
function sourceQuotient() {
  // The authenticated 2013 BASE29(3301) gives [3,26,24], and p39 red
  // gives [27,5,15]. The previously published P256/Q252 relation uses
  // the reversals, in descending coefficient order, shown here.
  const factor = multiply([24, 26, 3], [15, 5, 27]);
  assert.deepEqual(factor, [12, 17, 11, 21, 23]);
  const bytes = grid.byte_rows.flat();
  assert.equal(bytes.length, 256);
  const remaining = bytes.map((n) => mod29(n));
  const quotient = [];
  const inverseLeading = 17; // 12 * 17 = 1 (mod 29)
  for (let i = 0; i < 252; i++) {
    const digit = mod29(remaining[i] * inverseLeading);
    quotient.push(digit);
    for (let j = 0; j < factor.length; j++) {
      remaining[i + j] = mod29(remaining[i + j] - digit * factor[j]);
    }
  }
  assert.deepEqual(remaining.slice(252), [0, 0, 0, 0]);
  assert.equal(quotient.length, 9 * 28);
  return quotient;
}

const PAGE_CUTS = [0, 3, 8, 15, 23, 27, 33, 40, 54, 56];

/** Recover nine source-marked original chapters, including physical carry. */
function chapters() {
  return PAGE_CUTS.slice(0, -1).map((start, i) => corpus.pages
    .filter((p) => p.page >= start && p.page < PAGE_CUTS[i + 1])
    .flatMap((p) => p.indices));
}

/**
 * Reversible cyclic 29-output/29-input non-repeat transport:
 * zero cipher difference is native GP EA (28); all nonzero differences
 * are ranked 0..27 and decrypted with the 28-position chapter key.
 * Leader is transmitted unchanged and each chapter has its own clock.
 * @param {number[]} cipher Original GP29 ordinal stream, one chapter.
 * @param {number[]} key Fixed 28-element source quotient block.
 * @returns {number[]} Candidate native GP29 plaintext.
 */
function decode(cipher, key) {
  const plain = [cipher[0]];
  for (let i = 1; i < cipher.length; i++) {
    const step = mod29(cipher[i] - cipher[i - 1]);
    plain.push(step === 0 ? 28 : (step - 1 - key[(i - 1) % 28] % 28 + 56) % 28);
  }
  return plain;
}

/**
 * Exact forward encoder for the frozen GP28/EA rule.
 * @param {number[]} plain Native GP29 plaintext.
 * @param {number[]} key Fixed 28-element source quotient block.
 * @returns {number[]} Cipher GP29 stream.
 */
function encode(plain, key) {
  const out = [plain[0]];
  for (let i = 1; i < plain.length; i++) {
    const p = plain[i];
    assert.ok(p >= 0 && p < 29);
    out.push(p === 28 ? out[i - 1] :
      mod29(out[i - 1] + 1 + (p + key[(i - 1) % 28] % 28) % 28));
  }
  return out;
}

/** Native-GP index of coincidence, including EA. */
function ioc(seq) {
  const counts = Array(29).fill(0);
  for (const x of seq) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (seq.length * (seq.length - 1));
}

function main() {
  const q = sourceQuotient();
  const pages = chapters();
  assert.deepEqual(pages.map((s) => s.length),
    [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]);
  assert.equal(pages.flat().length, 12956);
  const sourceNative = corpus.pages.find((p) => p.page === 57).indices;
  assert.equal(sourceNative.length, 95);
  assert.equal(ioc(sourceNative).toFixed(8), "0.06270997");
  let totalMarkers = 0;
  let plantRecovered = 0;
  let plantTotal = 0;
  let wrongKeyMismatches = 0;
  const decoded = [];
  console.log("Q252 => 9 x 28 fixed GP28/EA chapter pads");
  console.log("Source factor:", [12,17,11,21,23], "Q head:", q.slice(0, 12));
  for (let ch = 0; ch < pages.length; ch++) {
    const original = pages[ch], key = q.slice(ch * 28, (ch + 1) * 28);
    const candidate = decode(original, key);
    assert.deepEqual(encode(candidate, key), original);
    decoded.push(...candidate);
    totalMarkers += candidate.filter((x) => x === 28).length;
    // Full original-chapter-length native solved GP plant with rare EA escapes
    // to exercise the exceptional zero transition as well.
    const plant = Array.from({length: original.length}, (_, i) =>
      (i > 0 && i % 201 === 0) ? 28 : sourceNative[i % sourceNative.length]);
    const ciphertext = encode(plant, key);
    const roundtrip = decode(ciphertext, key);
    assert.deepEqual(roundtrip, plant);
    plantRecovered += roundtrip.filter((x, i) => x === plant[i]).length;
    plantTotal += plant.length;
    const wrongKey = q.slice(((ch + 1) % 9) * 28, ((ch + 1) % 9 + 1) * 28);
    const wrong = decode(ciphertext, wrongKey);
    wrongKeyMismatches += wrong.filter((x, i) => x !== plant[i]).length;
    const preview = candidate.slice(0, 45).map((x) => corpus.translit[x]).join(" ");
    console.log("chapter", ch + 1, "pages", PAGE_CUTS[ch], "to",
      PAGE_CUTS[ch + 1] - 1, "runes", original.length,
      "cipher_IoC", ioc(original).toFixed(8), "inverse_IoC",
      ioc(candidate).toFixed(8), "EA_escapes", candidate.filter((x) => x === 28).length,
      "preview:", preview);
  }
  console.log("original:", pages.flat().length, "runes, IoC",
    ioc(pages.flat()).toFixed(8));
  console.log("decoded:", decoded.length, "runes, IoC", ioc(decoded).toFixed(8),
    "EA_escapes", totalMarkers);
  console.log("native GP57 reference IoC:", ioc(sourceNative).toFixed(8));
  console.log("positive native plant:", plantRecovered, "/", plantTotal,
    "exact symbols recovered; wrong shifted chapter keys differ at",
    wrongKeyMismatches, "/", plantTotal, "positions");
  assert.equal(totalMarkers, 86);
  assert.equal(plantRecovered, plantTotal);
  assert.ok(wrongKeyMismatches > 11000);
  assert.ok(ioc(decoded) < 0.041);
  console.log("DECISION: no native GP29 plaintext; retire this frozen Q252/GP28 key consumer.");
}

main();
