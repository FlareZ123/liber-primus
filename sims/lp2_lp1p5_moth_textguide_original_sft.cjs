"use strict";
/**
 * Original source-selected LP1-p5 moth / "Let the text guide you" cipher gate.
 *
 * The original LP1 p5 moth is raster-identical to LP2 p53/p55 moths; p5 has
 * solved, player-visible prose. In an authentic 2014 Stage04 puzzle, an
 * explicitly signaled earlier solved LP1 phrase keyed an 18-rune GP Vigenere
 * message revealing an onion hostname. This is one direct transfer of that
 * historical operation, with source page p5 selected by duplicated art.
 *
 * HISTORICAL APPROXIMATE KEY ONLY: this code tests 82 rune tokens derived
 * from the LP1 p5 English reference before its numeric square. Original p5
 * prints FUNCTION with one ᛡ=IO glyph, so its exact key is 81 runes.
 * The source-corrected inverse supersedes this approximation at
 * sims/lp2_lp1p5_moth_source81_corrected_sft.cjs. Preserve this script
 * solely to reproduce the earlier 82-rune negative and expose the error. Start at
 * the beginning of the source-oriented physical pages p53 and p55;
 * subtract key GP indices modulo29 and consume every F. No fitted shift,
 * substring, replacement, phase, skip mask, word break, or direction.
 * The source does not itself issue this LP2 cipher instruction; the test
 * is a bounded candidate, not an authenticated decryption.
 *
 * Run: node sims/lp2_lp1p5_moth_textguide_original_sft.cjs
 * Node >=18, CommonJS, repository source resources only.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const reference = fs.readFileSync(path.join(
  ROOT, "resources/liber-primus/lp1-plaintext-reference.txt"), "utf8");
const page = number => corpus.pages.find(p => p.page === number).indices;
const tokens = corpus.translit.map((token, index) => ({token, index}))
  .sort((a,b) => b.token.length - a.token.length);

function gpEncode(prose) {
  const result = [];
  for (let word of prose.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replaceAll("QU", "CW").replaceAll("V", "U")
      .replaceAll("K", "C").replaceAll("Z", "S")
      .replaceAll("ING", "NG");
    for (let i = 0; i < word.length;) {
      const match = tokens.find(t => word.startsWith(t.token, i));
      assert(match, "unencodable original GP word: " + word.slice(i));
      result.push(match.index);
      i += match.token.length;
    }
  }
  return result;
}
function latin(indices) { return indices.map(i => corpus.translit[i]).join(""); }
function sha256(indices) {
  return crypto.createHash("sha256").update(Buffer.from(indices)).digest("hex");
}
function ioc(indices) {
  const counts = Array(29).fill(0);
  for (const index of indices) counts[index]++;
  return counts.reduce((s,n) => s+n*(n-1), 0)
    / (indices.length * (indices.length - 1));
}
function applyKey(input, key, decrypt) {
  const sign = decrypt ? -1 : 1;
  return input.map((v,i) => (v + sign * key[i % key.length] + 29) % 29);
}

// Exact original-source Stage04 rune assignment: its reversed source map
// is the same canonical GP29 rune array used for the LP2 transcription.
const stage04SourceLookupOrder = "ᛠᛡᚣᚫᚪᛞᛟᛝᛚᛗᛖᛒᛏᛋᛉᛈᛇᛄᛁᚾᚻᚹᚷᚳᚱᚩᚦᚢᚠ";
assert.deepEqual([...stage04SourceLookupOrder].reverse(), corpus.runes);
for (let c=0;c<29;c++) for (let k=0;k<29;k++) {
  // The corrected historical reverse-lookup shift is (29-k).
  const shift = 29-k;
  assert.equal((c+shift)%29, (c-k+29)%29);
}

// Authentic image-only Stage04 positive, with printed 5 and 3 preserved as
// literal chars that consume no key steps. Historical U/V, C/K, S/Z and
// IA/IO glyph ambiguity is normalized to canonical transliteration.
const stage04Cipher = "ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3ᛠᛗᛇᚠᛡ";
const stage04Key = gpEncode("WELCOME PILGRIM TO THE");
assert.equal(stage04Key.length, 18);
let stage04Phase = 0;
let stage04Plain = "";
for (const ch of stage04Cipher) {
  const index = corpus.runes.indexOf(ch);
  if (index < 0) stage04Plain += ch;
  else stage04Plain += corpus.translit[
    (index - stage04Key[stage04Phase++ % stage04Key.length] + 29) % 29
  ];
}
assert.equal(stage04Phase, 18);
assert.equal(stage04Plain, "AUOWYFGL5LCSFJ3NONIAN");

// Freeze the entire LP1 p5 originally solved prose, before its 5x5 numeric
// square. No manually selected key substring or learned adjustment.
const lp1p5 = reference.split("### 5\n")[1].trimStart().split(/\n\s*\n/)[0];
assert(lp1p5.includes("THE PRIMES ARE SACRED"));
assert(lp1p5.includes("THE TOTIENT FUNCTION IS SACRED"));
assert(lp1p5.includes("ALL THINGS SHOULD BE ENCRYPTED"));
const key = gpEncode(lp1p5);
assert.equal(key.length, 82);
assert.ok(latin(key).startsWith("SOMEWISDOMTHEPRIMES"));
const positive = page(57);
assert.equal(positive.length, 95);
const solvedPlant = positive.concat(positive.slice(0, 84));
assert.equal(solvedPlant.length, 179);
assert.deepEqual(applyKey(applyKey(solvedPlant, key, false), key, true),
  solvedPlant, "native solved LP2 language plant");

const output = [];
for (const physicalPage of [53,55]) {
  const original = page(physicalPage);
  assert.equal(original.length, physicalPage===53?179:76);
  const decoded = applyKey(original,key,true);
  assert.deepEqual(applyKey(decoded,key,false),original,
    "complete original-cipher re-encoding");
  const score = ioc(decoded);
  const expected = physicalPage===53?0.03383340656581508:0.035789473684210524;
  assert(Math.abs(score-expected)<1e-14);
  output.push({
    physicalPage, cipherRunes:original.length,
    originalIoc:ioc(original), decodedIoc:score,
    rawCiphertextSha256:sha256(original), decodedSha256:sha256(decoded),
    decodedGpPrefix:latin(decoded.slice(0,70)),
    originalReencryptedExactly:true
  });
}
console.log(JSON.stringify({
  keySource: "82-rune approximate Latin-derived LP1 p5 prose; NOT the exact printed 81-rune source key",
  keyRunes:key.length, keySha256:sha256(key),
  historicallySolvedStage04GpPositive:stage04Plain,
  stage04NativeGp29Equivalence: "reverse-lookup GP shift == canonical GP29 subtraction",
  oldPageIocReference:ioc(positive),
  native179RunePositivePlant:true,
  mothPages:output,
  decision:"Obsolete approximate 82-rune original-key claim. This finite-control negative is superseded by the exact81 source-key gate in lp2_lp1p5_moth_source81_corrected_sft.cjs; neither yields readable source plaintext."
},null,2));
