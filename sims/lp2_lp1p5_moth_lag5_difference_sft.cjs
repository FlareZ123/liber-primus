"use strict";

/**
 * Exact source-moth lag-five difference-key gate.
 *
 * Original LP1 p5 prints 81 GP29 runes before its 5x5 number square, and
 * LP2 p55 prints 76 cipher runes; the same moth artwork recurs at LP2 pp53/55.
 * For whole p55, use the 76 nonwrapping differences K[i+5]-K[i].
 * Independently, p53 red51 + p55 terminal30 forms 81 symbols; use the
 * 81-position cyclic lag-five differences. Neither transfer is authored.
 *
 * SFT: node sims/lp2_lp1p5_moth_lag5_difference_sft.cjs
 * Node 22, CommonJS, read-only, no network/dependencies beyond node.
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
/** @param {string} filename */
const read = filename => fs.readFileSync(path.join(ROOT, filename), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const lp1 = read("resources/transcriptions/lp1_wulfic_canonical.txt");
const BEGIN = "ᛋᚩᛗᛖ-ᚹᛁᛋᛞᚩᛗ";
const start = lp1.indexOf(BEGIN);
const end = lp1.indexOf("272-", start);
assert(start >= 0 && end > start);
const source = [...lp1.slice(start, end)]
  .map(ch => corpus.runes.indexOf(ch))
  .filter(x => x >= 0);
assert.equal(source.length, 81);
assert.equal(corpus.pages[53].indices.length, 179);
assert.equal(corpus.pages[55].indices.length, 76);
assert.equal(corpus.pages[57].indices.length, 95);
assert.deepEqual(corpus.pages[57].indices.slice(0, 7), [13,24,4,24,17,20,18]);

const red53 = ink.pages.find(p => p.page === 53);
assert(red53);
assert(red53.red_spans.some(s => s.start === 128 &&
  s.length === 51 &&
  [...s.runes].every((r,i) => corpus.runes.indexOf(r) ===
    corpus.pages[53].indices[128 + i])));
const target55 = corpus.pages[55].indices;
const target81 = corpus.pages[53].indices.slice(128)
  .concat(corpus.pages[55].indices.slice(46));
assert.equal(target81.length, 81);
const delta55 = source.slice(0, 76)
  .map((x,i) => (source[i+5] - x + 29) % 29);
const delta81 = source
  .map((x,i) => (source[(i+5) % 81] - x + 29) % 29);
assert.equal(delta55.length, 76);
assert.equal(delta81.length, 81);

/** @param {number[]} a */
const ioc = a => {
  const counts = Array(29).fill(0);
  for (const x of a) { assert(x >= 0 && x < 29); counts[x]++; }
  return counts.reduce((sum, count) => sum + count*(count-1), 0) /
    (a.length*(a.length-1));
};
/** @param {number[]} a */
const encode = a => a.map(x => corpus.translit[x]).join("");
/** @param {number[]} a */
const sha256 = a => crypto.createHash("sha256")
  .update(Buffer.from(a)).digest("hex");
/**
 * @param {number[]} text
 * @param {number[]} key
 * @param {1|-1} sign
 */
const additive = (text,key,sign) => text.map((x,i) =>
  (x + sign*key[i] + 29) % 29);

/**
 * @param {string} label
 * @param {number[]} cipher
 * @param {number[]} delta
 * @param {number} expectedRaw
 * @param {number} expectedMinus
 * @param {number} expectedPlus
 * @param {number} expectedMatches
 */
function examine(label,cipher,delta,expectedRaw,expectedMinus,expectedPlus,expectedMatches) {
  assert.equal(cipher.length,delta.length);
  const minus = additive(cipher,delta,-1);
  const plus = additive(cipher,delta,1);
  assert.deepEqual(additive(minus,delta,1),cipher);
  assert.deepEqual(additive(plus,delta,-1),cipher);

  // An independent solved p57 plaintext plant detects implementation errors
  // and demonstrates exact forward + inverse recovery of native GP prose.
  const native = corpus.pages[57].indices.slice(0,cipher.length);
  assert.equal(native.length,cipher.length);
  assert.deepEqual(additive(additive(native,delta,1),delta,-1),native);
  assert.deepEqual(additive(additive(native,delta,-1),delta,1),native);

  const raw = ioc(cipher), sub = ioc(minus), add = ioc(plus);
  assert(Math.abs(raw-expectedRaw) < 1e-13);
  assert(Math.abs(sub-expectedMinus) < 1e-13);
  assert(Math.abs(add-expectedPlus) < 1e-13);
  const hits = cipher.filter((x,i)=> x===delta[i]).length;
  assert.equal(hits,expectedMatches);
  return {
    target:label, runes:cipher.length,
    ciphertextSha256:sha256(cipher), lagFiveKeySha256:sha256(delta),
    rawIoc:raw, decodedSubtractIoc:sub, decodedAddIoc:add,
    exactCipherEqualsPadPositions:hits,
    decodedSubtractPrefix:encode(minus).slice(0,110),
    decodedAddPrefix:encode(plus).slice(0,110),
    nativePlantRecovery:true, originalReencryptsExactly:true,
  };
}

// Any circular finite-difference pad on 81 positions has sum 0 (mod29),\n// regardless of secret source or lag. Therefore literal reuse of all 81 LP1\n// p5 plaintext runes is impossible for *every* such cyclic-difference key.\nconst sum29 = a => a.reduce((s,x)=>s+x,0) % 29;\nconst sourcePlainSum = sum29(source);\nconst compositeCipherSum = sum29(target81);\nassert.equal(sum29(delta81), 0);\nassert.equal(sourcePlainSum, 1);\nassert.equal(compositeCipherSum, 13);\nassert.notEqual(compositeCipherSum, sourcePlainSum);\n\nconst results = [
  examine("physical p55, 76-rune whole page",
    target55,delta55,
    0.037894736842105266,0.0343859649122807,0.031578947368421054,1),
  examine("physical p53 red51 plus p55 terminal30, circular 81",
    target81,delta81,
    0.03333333333333333,0.03641975308641975,0.03117283950617284,6)
];
console.log(JSON.stringify({
  status:"Neither original cipher gives readable native GP plaintext",
  source:"Literal original solved LP1 p5 81 GP runes, lag five",
  historicalSelection:"Shared moth drawing and source 5x5 square; operation conditional",
  source81Sha256:sha256(source),\n  allCyclicDifferencePadsExcludeLiteral81SourcePlaintext: {\n    sourcePlainSumMod29: sourcePlainSum,\n    compositeCipherSumMod29: compositeCipherSum,\n    anyCyclicPadSumMod29: sum29(delta81)\n  }, results
},null,2));
