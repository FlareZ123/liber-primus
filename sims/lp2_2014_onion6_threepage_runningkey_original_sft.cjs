"use strict";

/**
 * Exact 2014 Onion6 post-square three-page known-plaintext running key:
 * source-selected key, source-selected historical Vigenere sign and phase,
 * original complete LP2 (p0-55) continuous rune-clock test.
 *
 * Windows 11 / Node.js22:
 * node sims/lp2_2014_onion6_threepage_runningkey_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const hist = JSON.parse(read("resources/external/2014-onion6-seven-rune-pages.json"));
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(gp.runes.map((r, i) => [r, i]));
const alphaIndex = new Map(gp.translit.map((label, i) => [label, i]));
assert.equal(hist.schema, 1);
const historicalPassword = "FIRFUMFERENFE";
const shifts = [...historicalPassword].map(ch => {
  assert.ok(alphaIndex.has(ch), "unknown historical GP key rune " + ch);
  return alphaIndex.get(ch);
});
assert.deepEqual(shifts, [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18]);
let historicalClock = 0;
let historicalHolds = 0;
const postSquare = [];
/** @param {string} page */
function original(page) {
  const entry = hist.originals.find(x => x.page === page);
  assert.ok(entry && entry.blob_sha, "missing historical original " + page);
  return entry.runic_text;
}
/** @param {string} romanPageId */
function decryptActualOnion6(romanPageId) {
  const src = original(romanPageId);
  const result = [];
  let explicitHold = false;
  for (const ch of src) {
    if (ch === ":") {
      assert.equal(explicitHold, false);
      explicitHold = true;
      continue;
    }
    const c = runeIndex.get(ch);
    if (c === undefined) continue;
    if (explicitHold) assert.equal(c, 0, "historically marked F skip");
    const p = explicitHold ? 0 :
      (c - shifts[(historicalClock++) % shifts.length] + 29) % 29;
    if (explicitHold) historicalHolds++;
    result.push(p);
    explicitHold = false;
  }
  assert.equal(explicitHold, false);
  return result;
}
const p107 = decryptActualOnion6("107");
const p167 = decryptActualOnion6("167");
assert.equal(p107.length, 226);
assert.equal(p167.length, 93);
assert.equal(historicalHolds, 2);
assert.equal(historicalClock, 317);
const p229 = [...original("229")].filter(c => runeIndex.has(c))
  .map(c => runeIndex.get(c));
assert.equal(p229.length, 89);
// An actual 2014 historical positive: authentic post-square encrypted
// pages yield the known GP29 text "A COAN DURNG A LESSON THE MASTER..."
// under the documented selected F-markers and carried 13-rune clock.
const start = [24, 5, 3, 24, 9, 23, 1, 4, 21, 24, 20, 18, 15, 15, 3, 9];
assert.deepEqual(p107.slice(0, start.length), start);
const spell = seq => seq.map(i => gp.translit[i]).join(" ");
const witness = spell(p107.slice(0, 63));
assert.ok(witness.startsWith("A C O A N D U R NG A L E S S O N TH E M A S T E R"));
assert.ok(spell(p167.slice(-40)).includes("S T U D E N T S W E R E"));
assert.ok(spell(p229.slice(0, 20)).startsWith("A N I N S T R U C T IA N"));
const knownPlaintextKey = [...p107, ...p167, ...p229];
assert.equal(knownPlaintextKey.length, 408);
const keyHash = crypto.createHash("sha256")
  .update(Buffer.from(knownPlaintextKey)).digest("hex");

const unknownPages = gp.pages.slice(0, 56);
const originalCipher = unknownPages.flatMap(p => p.indices);
assert.equal(originalCipher.length, 12956);
const decrypt = (c, k, initialClock = 0) =>
  c.map((value, i) => (value - k[(initialClock + i) % k.length] + 29) % 29);
const originalResult = decrypt(originalCipher, knownPlaintextKey);
for (let i = 0; i < originalCipher.length; i++) {
  assert.equal((originalResult[i] + knownPlaintextKey[i % 408]) % 29,
    originalCipher[i]);
}
const positions = [];
let cur = 0;
for (const page of unknownPages) {
  positions.push([cur, cur + page.indices.length]);
  cur += page.indices.length;
}
/** @param {number[]} values */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0)
    / (values.length * (values.length - 1));
}
/** @param {number} lo @param {number} hi */
function window(lo, hi) {
  const start = positions[lo][0], end = positions[hi][1];
  const decoded = originalResult.slice(start, end);
  const source = originalCipher.slice(start, end);
  return { pages: [lo, hi], runes: end - start,
    originalIoC: ioc(source), decodedIoC: ioc(decoded),
    first100PlainRunes: spell(decoded.slice(0, 100)) };
}
const train = window(16, 21), holdout = window(40, 53);
assert.equal(train.runes, 1613);
assert.equal(holdout.runes, 3008);
assert.ok(Math.abs(train.decodedIoC - 0.0343625536313975) < 1e-13);
assert.ok(Math.abs(holdout.decodedIoC - 0.03449398212681049) < 1e-13);
assert.ok(Math.abs(ioc(originalResult) - 0.03447860043237516) < 1e-13);

// Independent authentic clear p57 GP29 plant, with this full 408-rune key.
// Positive establishes exact crypto, not historical transfer to unknown LP2.
const sourceNative = gp.pages[57].indices;
assert.ok(sourceNative.length >= 80);
const plainPlant = Array.from({ length: 1613 }, (_, i) =>
  sourceNative[i % sourceNative.length]);
const cipherPlant = plainPlant.map((p, i) =>
  (p + knownPlaintextKey[i % 408]) % 29);
assert.deepEqual(decrypt(cipherPlant, knownPlaintextKey), plainPlant);
console.log(JSON.stringify({
  historicalSource: "authentic archived 2014 Onion6 post-square pages 107,167,229",
  historicalPassword, historicalKeyIndices: shifts,
  positiveHistoricallyDecodedRunes: [p107.length, p167.length],
  markedHistoricalFSymbols: historicalHolds,
  historicalVigenereSymbolsConsumed: historicalClock,
  clearPostSquareRunes: p229.length,
  sourceDerivedRunningKeyRunes: knownPlaintextKey.length,
  sourceDerivedRunningKeySHA256: keyHash,
  unknownCipherRunes: originalCipher.length,
  originalFullBookIoC: ioc(originalCipher),
  decodedFullBookIoC: ioc(originalResult),
  opening: window(0, 2), training: train, holdout,
  plantedAuthenticNativeGPSource: "LP2 solved p57",
  originalCompleteReplay: true
}, null, 2));
console.log("PASS: genuine 2014 historical F-marker positive and full original running-key negative");
