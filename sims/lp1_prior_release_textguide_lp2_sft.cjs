"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const {
  encodeGP,
  historicalOnionInverse,
  trigramScorer
} = require("./historical_text_guide_terminal_vigenere_sft.cjs");
const { encodeSourceNativeGP } = require("./lp2_native_gp_source_orthography_sft.cjs");

const ROOT = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp1-plaintext-reference.txt"), "utf8");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));

function cleanSolvedText(text) {
  return text.split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#") && !(line.startsWith("[") && line.endsWith("]")))
    .join(" ");
}

function firstPrimes(count) {
  const result = [];
  for (let candidate = 2; result.length < count; candidate++) {
    let prime = true;
    for (let d = 2; d * d <= candidate; d++) {
      if (candidate % d === 0) {
        prime = false;
        break;
      }
    }
    if (prime) result.push(candidate);
  }
  return result;
}

function solveP56(ciphertext) {
  const primes = firstPrimes(90);
  let keyPosition = 0;
  return ciphertext.map((value, i) => {
    if (i === 56) return value;
    return (value - (primes[keyPosition++] - 1) % 29 + 29) % 29;
  });
}

function inverse(ciphertext, key, direction, phase) {
  return ciphertext.map((value, i) => (value + direction * key[(phase + i) % key.length] + 29) % 29);
}

function printGP(values) {
  return values.map(i => corpus.translit[i]).join("");
}

function main() {
  // The previous version left bracketed editorial continuation notes in the
  // key and language model. They contributed 272 non-source GP symbols to
  // both historical key starts. Remove those notes and all section headings.
  const lp1OnlyRaw = source.split(/^### 56$/m)[0];
  const welcomeStart = lp1OnlyRaw.indexOf("### 3");
  assert.notEqual(welcomeStart, -1);
  const welcomeRaw = lp1OnlyRaw.slice(welcomeStart);

  const cleanFullLP1 = cleanSolvedText(lp1OnlyRaw);
  const cleanWelcomeOnward = cleanSolvedText(welcomeRaw);
  const oldFullLength = encodeGP(lp1OnlyRaw.replace(/^#.*$/gm, "")).length;
  const oldWelcomeLength = encodeGP(welcomeRaw.replace(/^#.*$/gm, "")).length;

  const keys = [
    {
      name: "full_prior_lp1_legacy",
      encoder: "legacy GP label encoder",
      values: encodeGP(cleanFullLP1)
    },
    {
      name: "full_prior_lp1_source_native",
      encoder: "source-calibrated GP encoder",
      values: encodeSourceNativeGP(cleanFullLP1)
    },
    {
      name: "welcome_onward_legacy",
      encoder: "legacy GP label encoder",
      values: encodeGP(cleanWelcomeOnward)
    },
    {
      name: "welcome_onward_source_native",
      encoder: "source-calibrated GP encoder",
      values: encodeSourceNativeGP(cleanWelcomeOnward)
    }
  ];

  assert.equal(oldFullLength - keys[0].values.length, 272);
  assert.equal(oldWelcomeLength - keys[2].values.length, 272);
  assert.equal(keys[0].values.length, 3068);
  assert.equal(keys[1].values.length, 3028);
  assert.equal(keys[2].values.length, 2882);
  assert.equal(keys[3].values.length, 2844);

  // The 2014 positive control is the exact 22-rune opening phrase. Both
  // encoders agree on this phrase, and the 18-rune clue image uses no wrap.
  const phraseLegacy = encodeGP("WELCOME PILGRIM TO THE GREAT");
  const phraseNative = encodeSourceNativeGP("WELCOME PILGRIM TO THE GREAT");
  assert.deepEqual(phraseLegacy, phraseNative);
  assert.equal(phraseLegacy.length, 22);
  const historicalCiphertext = "ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3 ᛠᛗᛇᚠᛡ";
  const historicalPlaintext = historicalOnionInverse(historicalCiphertext, phraseLegacy);
  assert.equal(historicalPlaintext, "AUOWYFGL5LCSFJ3 NONIAN");

  // Train two fixed LP1-only models. The source-native encoder is a sensitivity
  // model, not a universal spelling claim; its source-attested scope is
  // documented in lp2-native-gp-source-orthography.
  const scoreLegacy = trigramScorer(encodeGP(cleanFullLP1));
  const scoreNative = trigramScorer(encodeSourceNativeGP(cleanFullLP1));

  const unknownPages = corpus.pages.filter(page => page.page < 56);
  const unknown = unknownPages.flatMap(page => page.indices);
  const p56 = solveP56(corpus.pages.find(page => page.page === 56).indices);
  const p57 = corpus.pages.find(page => page.page === 57).indices;

  const variants = [];
  for (const key of keys) {
    for (const clock of ["continuous", "page_reset"]) {
      for (const direction of [-1, 1]) {
        let plaintext;
        if (clock === "continuous") {
          plaintext = inverse(unknown, key.values, direction, 0);
          assert.deepEqual(inverse(plaintext, key.values, -direction, 0), unknown);
        } else {
          plaintext = unknownPages.flatMap(page => {
            const decoded = inverse(page.indices, key.values, direction, 0);
            assert.deepEqual(inverse(decoded, key.values, -direction, 0), page.indices);
            return decoded;
          });
        }
        variants.push({
          key: key.name,
          encoder: key.encoder,
          keyRunes: key.values.length,
          clock,
          direction,
          scoreLegacy: scoreLegacy(plaintext),
          scoreSourceNative: scoreNative(plaintext),
          preview: printGP(plaintext.slice(0, 100)),
          tail: printGP(plaintext.slice(-72))
        });
      }
    }
  }

  const byLegacy = variants.slice().sort((a, b) => b.scoreLegacy - a.scoreLegacy);
  const byNative = variants.slice().sort((a, b) => b.scoreSourceNative - a.scoreSourceNative);

  // Reversible synthetic plant: the exact source-derived key and inverse
  // recover a known plaintext page when the ciphertext is constructed here.
  const plantCipher = inverse(p57, keys[1].values, 1, 0);
  assert.deepEqual(inverse(plantCipher, keys[1].values, -1, 0), p57);

  console.log(JSON.stringify({
    historicalPositiveControl: {
      key: "WELCOME PILGRIM TO THE GREAT",
      keyRunes: phraseLegacy.length,
      ciphertextRunes: 18,
      plaintext: historicalPlaintext,
      knownReading: "AVOWYFGL5LKZFJ3N.ONION"
    },
    sourceCleanup: {
      oldLegacyFullKeyRunes: oldFullLength,
      cleanLegacyFullKeyRunes: keys[0].values.length,
      cleanSourceNativeFullKeyRunes: keys[1].values.length,
      oldLegacyWelcomeOnwardRunes: oldWelcomeLength,
      cleanLegacyWelcomeOnwardRunes: keys[2].values.length,
      cleanSourceNativeWelcomeOnwardRunes: keys[3].values.length,
      editorialSymbolsRemovedFromEachOldKey: 272
    },
    corpus: {
      unknownRunes: unknown.length,
      rawScoreLegacy: scoreLegacy(unknown),
      rawScoreSourceNative: scoreNative(unknown),
      heldOutP56ScoreLegacy: scoreLegacy(p56),
      heldOutP56ScoreSourceNative: scoreNative(p56),
      heldOutP57ScoreLegacy: scoreLegacy(p57),
      heldOutP57ScoreSourceNative: scoreNative(p57)
    },
    variants: variants.length,
    bestByLegacy: byLegacy.slice(0, 6),
    bestBySourceNative: byNative.slice(0, 6),
    allVariants: variants
  }, null, 2));
}

if (require.main === module) main();

module.exports = { main, inverse, cleanSolvedText };
