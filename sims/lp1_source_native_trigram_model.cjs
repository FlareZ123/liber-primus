"use strict";
const assert = require("node:assert/strict");
const { encodeSourceNativeGP } = require("./lp2_native_gp_source_orthography_sft.cjs");

/**
 * Reusable source-calibrated LP1 GP29 trigram model.
 * The encoder is the historically calibrated single-rune ING/IO mapping:
 * ᛝ -> ING and ᛡ -> IO. It is deliberately separate from inventory-label
 * transliteration and scores each original chapter/span without cross-boundary
 * n-grams.
 */
function buildSourceNativeTrigramModel({ corpus, referenceText }) {
  const training = encodeSourceNativeGP(referenceText.replace(/^#.*$/gm, ""));
  assert.equal(training.length, 3510, "pinned source-native LP1 training length");
  const two = new Map();
  const three = new Map();
  for (let i = 2; i < training.length; i++) {
    const bigram = 29 * training[i - 2] + training[i - 1];
    two.set(bigram, (two.get(bigram) || 0) + 1);
    const trigram = 29 * bigram + training[i];
    three.set(trigram, (three.get(trigram) || 0) + 1);
  }
  function scoreChapters(chapters) {
    let totalLog = 0;
    let totalNgrams = 0;
    const perChapter = [];
    for (const indices of chapters) {
      let chapterLog = 0;
      let chapterNgrams = 0;
      for (let i = 2; i < indices.length; i++) {
        const bigram = 29 * indices[i - 2] + indices[i - 1];
        chapterLog += Math.log(
          ((three.get(29 * bigram + indices[i]) || 0) + 1)
          / ((two.get(bigram) || 0) + 29)
        );
        chapterNgrams++;
      }
      totalLog += chapterLog;
      totalNgrams += chapterNgrams;
      perChapter.push(chapterLog / chapterNgrams);
    }
    return { mean: totalLog / totalNgrams, ngrams: totalNgrams, perChapter };
  }
  const scoreStream = indices => scoreChapters([indices]);
  const ingIndex = corpus.runes.indexOf("ᛝ");
  const ioIndex = corpus.runes.indexOf("ᛡ");
  assert.equal(ingIndex, 21);
  assert.equal(ioIndex, 27);
  const spell = indices => indices.map(index => {
    if (index === ingIndex) return "ING";
    if (index === ioIndex) return "IO";
    return corpus.translit[index];
  }).join("");
  const p57 = corpus.pages.find(page => page.page === 57).indices;
  assert.equal(p57.length, 95);
  const trainingScore = scoreStream(training).mean;
  const p57Score = scoreStream(p57).mean;
  assert(Math.abs(trainingScore - (-2.260728012730832)) < 1e-10);
  assert(Math.abs(p57Score - (-2.468144714244746)) < 1e-10);
  return {
    training,
    trainingLength: training.length,
    trainingScore,
    p57Score,
    scoreChapters,
    scoreStream,
    spell
  };
}

module.exports = { buildSourceNativeTrigramModel };
