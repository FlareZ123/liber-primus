"use strict";

/**
 * Source-corrected LP1 p5 / LP2 moth-illustration historical text-guide gate.
 *
 * The earlier LP1 p5 text-guide candidate used 82 runes by converting
 * FUNCTION -> ᚠᚢᚾᚳᛏᛁᚩᚾ. The original solved p5 prints
 * FUNCTION -> ᚠᚢᚾᚳᛏᛡᚾ (one IO rune), yielding 81 source runes.
 *
 * The exact original p5 key is selected independently by the repeated
 * moth illustration on LP1 p5 and LP2 pp53/55. Test solely the already
 * specified historical 2014 stage04 GP29-Vigenere operation, negative
 * direction, page-start clock; all output runes preserved.
 *
 * SFT: node sims/lp2_lp1p5_moth_source81_corrected_sft.cjs
 * Node.js 20+, CommonJS, no external dependencies/network.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {encodeSourceNativeGP} = require("./lp2_native_gp_source_orthography_sft.cjs");
const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const reference = read("resources/liber-primus/lp1-plaintext-reference.txt");
const p5 = reference.split("### 5\n")[1].split("272")[0];
assert(p5.includes("THE TOTIENT FUNCTION IS SACRED"));
assert(p5.includes("KNOW THIS"));

const p5PrintedStart = lp1.indexOf("ᛋᚩᛗᛖ-ᚹᛁᛋᛞᚩᛗ");
const p5PrintedEnd = lp1.indexOf("272-", p5PrintedStart);
assert(p5PrintedStart >= 0 && p5PrintedEnd > p5PrintedStart);
const originalP5Print = lp1.slice(p5PrintedStart, p5PrintedEnd);
const keyPrinted = [...originalP5Print]
  .filter(ch => corpus.runes.includes(ch))
  .map(ch => corpus.runes.indexOf(ch));
const keyCalibrated = encodeSourceNativeGP(p5);
assert.equal(keyPrinted.length, 81, "source p5 contains 81 GP runes");
assert.deepEqual(keyCalibrated, keyPrinted,
  "source-calibrated LP1 text yields exact independently printed rune key");

const GP = corpus.translit.map((s, index) => ({s, index}))
  .sort((a,b) => b.s.length - a.s.length);
/** Original 82-rune preceding test key: ING->NG but IO remains I+O. */
function historicalApproximation(text) {
  const output = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replaceAll("QU", "CW").replaceAll("V", "U")
      .replaceAll("K", "C").replaceAll("Z", "S")
      .replaceAll("ING", "NG");
    for (let i = 0; i < word.length;) {
      const token = GP.find(t => word.startsWith(t.s, i));
      assert(token);
      output.push(token.index);
      i += token.s.length;
    }
  }
  return output;
}
const previousKey = historicalApproximation(p5);
assert.equal(previousKey.length, 82);
assert.equal(previousKey.findIndex((x, i) => x !== keyPrinted[i]), 41);

/** @param {number[]} a */
const latin = a => a.map(x => corpus.translit[x]).join("");
/** @param {number[]} a */
const ioc = a => {
  const counts = Array(29).fill(0);
  a.forEach(x => { counts[x]++; });
  return counts.reduce((s, x) => s + x * (x - 1), 0) /
    (a.length * (a.length - 1));
};
/** @param {number[]} a */
const sha256 = a => crypto.createHash("sha256")
  .update(Buffer.from(a)).digest("hex");
/** @param {number[]} text @param {number[]} key @param {number} sign */
const inverse = (text, key, sign) =>
  text.map((value, i) => (value + sign * key[i % key.length] + 29) % 29);

// Reproduce the historical Stage04 known inverse, including ignored literal
// digits 5 and 3 with no key consumption.
const stage04 = "ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3ᛠᛗᛇᚠᛡ";
const stage04Key = encodeSourceNativeGP("WELCOME PILGRIM TO THE");
assert.equal(stage04Key.length, 18);
let ki = 0, solved = "";
for (const ch of stage04) {
  const index = corpus.runes.indexOf(ch);
  solved += index < 0 ? ch : corpus.translit[
    (index - stage04Key[ki++ % stage04Key.length] + 29) % 29];
}
assert.equal(solved, "AUOWYFGL5LCSFJ3NONIAN");

const perPage = [];
for (const page of [53, 55]) {
  const ciphertext = corpus.pages[page].indices;
  assert.equal(ciphertext.length, page === 53 ? 179 : 76);
  const decoded = inverse(ciphertext, keyPrinted, -1);
  assert.deepEqual(inverse(decoded, keyPrinted, +1), ciphertext);
  const previous = inverse(ciphertext, previousKey, -1);
  const score = ioc(decoded);
  assert(Math.abs(score - (page === 53
    ? 0.03245245119578181 : 0.031578947368421054)) < 1e-14);
  perPage.push({
    physicalPage:page, cipherRunes:ciphertext.length,
    printedCiphertextSha256:sha256(ciphertext),
    correctedDecodedSha256:sha256(decoded),
    correctedDecodedIoc:score,
    previousApproximationIoc:ioc(previous),
    correctedGpPrefix:latin(decoded.slice(0, 60)),
    firstKeyMismatch:41,
    reencryptedExactly:true
  });
}
const solvedP57 = corpus.pages[57].indices;
assert.equal(solvedP57.length, 95);
assert.deepEqual(inverse(inverse(solvedP57,keyPrinted,+1),
  keyPrinted,-1),solvedP57);

console.log(JSON.stringify({
  status:"Original-key corrected negative; no recovered p53 or p55 plaintext",
  keySource:"Literal LP1 p5 solved runes before printed numeric square",
  originalPrintedP5Runes:keyPrinted.length,
  sourceCalibratedEncoderMatchesPrinted:true,
  previousApproximateKeyRunes:previousKey.length,
  previousFirstSourceDeviationAtZeroBasedOffset:41,
  correctedP5KeySha256:sha256(keyPrinted),
  historicalStage04Positive:solved,
  sourceReversiblePlant:true,
  pages:perPage,
  nextDecision:"Retire this fixed p5 moth-key Vigenere operation; seek original operation signal and key schedule rather than key variations."
},null,2));
