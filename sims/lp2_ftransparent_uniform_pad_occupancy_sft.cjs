"use strict";

/**
 * Source-conditioned necessary test of transferring the authentic LP1/p56
 * plaintext-F passthrough to uniformly masked unknown LP2.
 *
 * Model: C=F whenever P=F; otherwise C=(P+K) mod29 with independent
 * uniform K in GP29. Test exact original F count and two native-GP
 * plaintext calibrations. Also inspect the competing reserved-F model.
 *
 * SFT: node sims/lp2_ftransparent_uniform_pad_occupancy_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/lp2-transcription.txt");
const native = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const GP = new Map(corpus.runes.map((r, i) => [r, i]));
const toIndices = s => [...s].filter(c => GP.has(c)).map(c => GP.get(c));
const original = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
const printed = parseLP2Words(transcript);
assert.equal(original.length, 12956);
assert.equal(printed.runeCount, original.length);
assert.equal(printed.words.length, 2896);
assert.deepEqual([...printed.words.flatMap(w => toIndices(w.runes))], original);
const observedF = original.filter(x => x === 0).length;
assert.equal(observedF, 458);

const lp1Plain = toIndices(native.split("%").slice(8, 12).join(""));
assert.equal(lp1Plain.length, 755);
const lp1F = lp1Plain.filter(x => x === 0).length;
assert.equal(lp1F, 8);
const p57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(p57.length, 95);
const p57F = p57.filter(x => x === 0).length;
assert.equal(p57F, 3);

const literalSingleF = printed.words.flatMap((w, i) =>
  w.length === 1 && w.runes === corpus.runes[0] ?
  [{wordIndex:i, physicalPage:w.startPage >= 50 ? w.startPage+1 : w.startPage}] : []);
assert.deepEqual(literalSingleF, [{wordIndex:143, physicalPage:2}]);
const twoFStart = printed.words.filter(w => w.length === 2 && w.runes.startsWith(corpus.runes[0])).length;
const twoFEnd = printed.words.filter(w => w.length === 2 && w.runes.endsWith(corpus.runes[0])).length;
assert.equal(twoFStart + twoFEnd, 26);

// Exact binomial lower tail, evaluated stably in log space.
function binomialLowerTail(k, n, q) {
  assert.ok(q > 0 && q < 1 && k >= 0 && k <= n);
  const logs = [];
  let logp = n * Math.log1p(-q);
  for (let i = 0; i <= k; i++) {
    logs.push(logp);
    if (i < k) logp += Math.log(n-i)-Math.log(i+1)+Math.log(q)-Math.log1p(-q);
  }
  const high = Math.max(...logs);
  return Math.exp(high) * logs.reduce((sum, x) => sum + Math.exp(x-high), 0);
}
const n = original.length;
const uniformCipherF = p => p + (1-p)/29;
const test = (p, label) => {
  const q = uniformCipherF(p), expected = n*q;
  const lowerTail = binomialLowerTail(observedF, n, q);
  return {label, plaintextFRate:p, expectedCipherF:expected,
    observedCipherF:observedF, tailProbability:lowerTail};
};
const calibration = [
  test(0, "no F in plaintext (floor)"),
  test(0.01, "conservative 1 percent F plaintext"),
  test(lp1F/lp1Plain.length, "original LP1 clear native GP, pages 10-13"),
  test(p57F/p57.length, "original clear LP2 p57")
];
assert.ok(calibration[2].tailProbability < 1e-7);
assert.ok(calibration[1].tailProbability < 1e-6);
let low = 0, high = 0.1;
for(let i=0; i<65; i++) {
  const mid = (low+high)/2;
  if (binomialLowerTail(observedF, n, uniformCipherF(mid)) > 0.05) low=mid;
  else high=mid;
}
const upperPlainF95 = (low+high)/2;
assert.ok(upperPlainF95 > 0.003 && upperPlainF95 < 0.0045);

// Synthetic native-GP F-passthrough encryption using an independent uniform
// keystream. No original ciphertext information is used to select this plant.
function keyGenerator() {
  let block = Buffer.alloc(0), offset = 0, blockIndex = 0;
  return () => {
    while (true) {
      if (offset === block.length) {
        block = crypto.createHash("sha256")
          .update("LP2-native-GP-F-passthrough-control:" + blockIndex++)
          .digest();
        offset = 0;
      }
      const b = block[offset++];
      if (b < 232) return b % 29;
    }
  };
}
const plain = Array.from({length:n}, (_,i) => lp1Plain[i % lp1Plain.length]);
const k = keyGenerator();
const plant = plain.map(p => p === 0 ? 0 : (p + k())%29);
const plantedF = plant.filter(c => c === 0).length;
assert.ok(Math.abs(plantedF - n*uniformCipherF(plain.filter(x => x===0).length/n)) < 4*Math.sqrt(n*0.06*0.94));
console.log(JSON.stringify({
  scope:"Original LP2 pp0-55, exact GP29 F transparency + independently uniform non-F pad",
  calibration,
  inferredPlaintextFRate:(observedF/n-1/29)/(28/29),
  oneSided95UpperPlaintextFRate:upperPlainF95,
  printedLiteralFUnderReservedF:literalSingleF,
  twoRuneWordsStartingF:twoFStart,
  twoRuneWordsEndingF:twoFEnd,
  positiveControl:{nativePlainRunes:n, nativePlainFs:plain.filter(p=>p===0).length, plantedCipherFs:plantedF},
  conclusion:"Strong negative for uniform non-F masking with historical literal F and native-F plaintext rates; does not exclude biased, reserved-F, adaptive or different-layer ciphers."
}, null, 2));
