"use strict";
/**
 * Reproducible original LP2 printed word-length register comparison.
 * Raw 26-letter versus GP29 grapheme contraction is an input hypothesis,
 * never an asserted plaintext recovery or author-selected cipher.
 * SFT: node sims/lp2_original_rawlatin_vs_gp_wordlength_register_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const originalRaw = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).join("%");
const runes = new Set(corpus.runes);
const originalLengths = [];
let activeWordLength = 0;
let countedRunes = 0;
for (const char of originalRaw) {
  if (runes.has(char)) {
    activeWordLength += 1;
    countedRunes += 1;
  } else if ("-.$&§".includes(char) && activeWordLength) {
    originalLengths.push(activeWordLength);
    activeWordLength = 0;
  }
}
if (activeWordLength) originalLengths.push(activeWordLength);
assert.equal(originalLengths.length, 2896);
assert.equal(countedRunes, 12956);
assert.equal(originalLengths.reduce((a, b) => a + b, 0), 12956);
/** @param {number[]} xs @returns {number[]} */
function histogram(xs) {
  const bins = Array(14).fill(0);
  for (const x of xs) bins[Math.min(x, 13)] += 1;
  return bins;
}
const original = histogram(originalLengths);
assert.deepEqual(original, [0,83,448,720,513,317,256,216,156,78,52,32,18,7]);
const tokens = ["ING", ...corpus.translit].sort((a, b) => b.length - a.length);
/** @param {string} sourceWord @returns {number} */
function gpWordLength(sourceWord) {
  const word = sourceWord.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  let n = 0;
  for (let i = 0; i < word.length;) {
    const token = tokens.find((x) => word.startsWith(x, i));
    assert.ok(token, "Missing GP token for " + word.slice(i));
    i += token.length;
    n += 1;
  }
  return n;
}
/** @param {number[]} observed @param {number[]} model @returns {number} */
function logScore(observed, model) {
  const sampleSize = model.reduce((a, b) => a + b, 0) + 7;
  let score = 0;
  for (let n = 1; n < model.length; n += 1) {
    score += observed[n] * Math.log((model[n] + 0.5) / sampleSize);
  }
  return score;
}
const sources = [
  { name: "Shakespeare", path: "resources/control/shakespeare_first300k.txt",
    nWords: 55407, expectedDelta: 23.15280349789373 },
  { name: "Gibran", path: "resources/control/gibran_prophet_58585.txt",
    nWords: 15733, expectedDelta: 67.04741483356702 },
  { name: "Emerson", path: "resources/control/emerson_essays_2944.txt",
    nWords: 77932, expectedDelta: 91.54830707518067 }
];
const models = sources.map((src) => {
  const words = read(src.path).toUpperCase().match(/[A-Z]+/g) || [];
  assert.equal(words.length, src.nWords);
  const lengths = {
    latin: words.map((x) => x.length),
    gp: words.map(gpWordLength)
  };
  const distributions = {
    latin: histogram(lengths.latin),
    gp: histogram(lengths.gp)
  };
  const delta = logScore(original, distributions.latin) -
    logScore(original, distributions.gp);
  assert.ok(Math.abs(delta - src.expectedDelta) < 1e-8);
  return { name: src.name, lengths, distributions, delta };
});
/**
 * Out-of-author 2896-word contiguous controls. A misclassification is
 * intentionally preserved as evidence against a universal inference.
 */
const crossAuthor = [];
for (let source = 0; source < models.length; source += 1) {
  for (const register of ["gp", "latin"]) {
    for (let model = 0; model < models.length; model += 1) {
      if (source === model) continue;
      let latin = 0, gp = 0;
      const values = models[source].lengths[register];
      for (let start = 0; start + originalLengths.length <= values.length;
           start += originalLengths.length) {
        const h = histogram(values.slice(start, start + originalLengths.length));
        const d = logScore(h, models[model].distributions.latin) -
          logScore(h, models[model].distributions.gp);
        if (d > 0) latin += 1; else gp += 1;
      }
      crossAuthor.push({
        trueSource: models[source].name,
        trueRegister: register,
        independentReference: models[model].name,
        classifiedLatin: latin, classifiedGP: gp
      });
    }
  }
}
const shakespeareGpAgainstEmerson = crossAuthor.find((r) =>
  r.trueSource === "Shakespeare" && r.trueRegister === "gp" &&
  r.independentReference === "Emerson");
assert.deepEqual(
  [shakespeareGpAgainstEmerson.classifiedLatin,
    shakespeareGpAgainstEmerson.classifiedGP],
  [17, 2]
);
const gibranLatinAgainstShakespeare = crossAuthor.find((r) =>
  r.trueSource === "Gibran" && r.trueRegister === "latin" &&
  r.independentReference === "Shakespeare");
assert.deepEqual(
  [gibranLatinAgainstShakespeare.classifiedLatin,
    gibranLatinAgainstShakespeare.classifiedGP],
  [1, 4]
);
const p27 = corpus.pages[27].indices;
const p55 = corpus.pages[55].indices;
assert.deepEqual(p27.slice(26, 37),
  [17, 0, 23, 11, 1, 17, 18, 10, 25, 0, 13]);
assert.deepEqual(p27.slice(28, 34), p55.slice(70, 76));
const plainLatin = "ATTHEENDOFA";
assert.equal(plainLatin.length, 11);
assert.equal(plainLatin[0], "A");
assert.equal(plainLatin[5], "E");
assert.equal(p27[26], p27[31]); // Fixed monoalphabetic substitution impossible
const report = {
  original: {words: originalLengths.length, runes: countedRunes,
    lengths1Through12And13Plus: original.slice(1)},
  sourceModels: models.map((r) => ({
    reference: r.name,
    rawLatinVsGPLogScoreNats: r.delta,
    originalPrefersRawLatinUnderThisFiniteModel: r.delta > 0
  })),
  outOfAuthorControls: crossAuthor,
  proposedUnconfirmedCrib: {
    p27: "BF DJU BEI AEF P", candidateRawLatin26: "AT THE END OF A",
    p55Terminal: "DJU BEI", candidateRawLatin26: "THE END",
    exactPrintedWordLengths: [2, 3, 3, 2, 1],
    simpleMonoalphabeticSubstitution: "excluded by repeated ciphertext B mapping A and E"
  },
  decision: "The raw 26-letter length register is closer to the printed LP2 unigram length profile in all three finite English reference models. Out-of-author controls sometimes misclassify the true register; this is a hypothesis for future source-selected decipherment, not recovered text or an established cipher."
};
console.log(JSON.stringify(report, null, 2));
