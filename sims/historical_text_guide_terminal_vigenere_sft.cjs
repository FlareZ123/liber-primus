"use strict";

const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { encodeSourceNativeGP } = require("./lp2_native_gp_source_orthography_sft.cjs");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const controlText = fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp1-plaintext-reference.txt"), "utf8");
const p0Ink = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-p0-physical-ink-override.json"), "utf8"));
const RUNES = corpus.runes;
const TRANSLIT = corpus.translit;
const runeIndex = new Map(RUNES.map((r, i) => [r, i]));
const longest = TRANSLIT.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);

function encodeGP(text) {
  const values = [];
  const words = text.toUpperCase().replace(/V/g, "U").replace(/K/g, "C").replace(/[^A-Z ]/g, " ").split(/\s+/u);
  for (const word of words) {
    for (let k = 0; k < word.length;) {
      const found = longest.find(x => word.startsWith(x.s, k));
      if (!found) {
        k++;
        continue;
      }
      values.push(found.i);
      k += found.s.length;
    }
  }
  return values;
}

function printGP(values) {
  return values.map(i => TRANSLIT[i]).join("");
}

function historicalOnionInverse(ciphertext, key) {
  let keyPosition = 0;
  let out = "";
  for (const ch of Array.from(ciphertext)) {
    const value = runeIndex.get(ch);
    if (value === undefined) {
      out += ch;
      continue;
    }
    out += TRANSLIT[(value - key[keyPosition++ % key.length] + 29) % 29];
  }
  return out;
}

function trigramScorer(source) {
  const bigrams = new Map();
  const trigrams = new Map();
  for (let i = 2; i < source.length; i++) {
    const bi = source[i - 2] * 29 + source[i - 1];
    const tri = bi * 29 + source[i];
    bigrams.set(bi, (bigrams.get(bi) || 0) + 1);
    trigrams.set(tri, (trigrams.get(tri) || 0) + 1);
  }
  return text => {
    let log = 0;
    for (let i = 2; i < text.length; i++) {
      const bi = text[i - 2] * 29 + text[i - 1];
      log += Math.log((1 + (trigrams.get(bi * 29 + text[i]) || 0)) / (29 + (bigrams.get(bi) || 0)));
    }
    return log / (text.length - 2);
  };
}

function indexOfCoincidence(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}

function inverseKey(ciphertext, key, direction, phase) {
  return ciphertext.map((value, i) => (value + direction * key[(phase + i) % key.length] + 29) % 29);
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
    if (i === 56) return value; // the transparent plaintext F
    return (value - (primes[keyPosition++] - 1) % 29 + 29) % 29;
  });
}

function decodeP55(ciphertext, key, skipMask) {
  const transparent = [15, 25, 41];
  let keyPosition = 0;
  return ciphertext.map((value, i) => {
    const which = transparent.indexOf(i);
    if (which >= 0 && (skipMask & (1 << which))) return value;
    return (value - key[keyPosition++ % key.length] + 29) % 29;
  });
}

function reencodeP55(plaintext, key, skipMask) {
  const transparent = [15, 25, 41];
  let keyPosition = 0;
  return plaintext.map((value, i) => {
    const which = transparent.indexOf(i);
    if (which >= 0 && (skipMask & (1 << which))) return value;
    return (value + key[keyPosition++ % key.length]) % 29;
  });
}

function cleanLP1Reference(text) {
  const lp1Only = text.split(/^### 56$/m)[0];
  return lp1Only.split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#") && !(line.startsWith("[") && line.endsWith("]")))
    .join(" ");
}

function main() {
  const cleanLP1 = cleanLP1Reference(controlText);
  const scoreLegacy = trigramScorer(encodeGP(cleanLP1));
  const scoreNative = trigramScorer(encodeSourceNativeGP(cleanLP1));

  const priorSolvedText = encodeGP("WELCOME PILGRIM TO THE GREAT");
  const priorSolvedTextNative = encodeSourceNativeGP("WELCOME PILGRIM TO THE GREAT");
  assert.deepEqual(priorSolvedText, priorSolvedTextNative);
  assert.equal(priorSolvedText.length, 22);

  // Positive control: the 2014 signed "Let the text guide you" clue image.
  // Its 18 ciphertext runes consume only the first 18 of the 22 key runes;
  // the historical artifact does not itself demonstrate key wraparound.
  const historicalCiphertext = "ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3 ᛠᛗᛇᚠᛡ";
  const historicalResult = historicalOnionInverse(historicalCiphertext, priorSolvedText);
  assert.equal(historicalResult, "AUOWYFGL5LCSFJ3 NONIAN");

  // The terminal-page key family is retained, but its language model is now
  // trained only on clean solved LP1 text. LP2 pages 56/57 are held-out controls.
  const p55 = corpus.pages.find(page => page.page === 55).indices;
  const p56Cipher = corpus.pages.find(page => page.page === 56).indices;
  const p56 = solveP56(p56Cipher);
  const p57 = corpus.pages.find(page => page.page === 57).indices;
  const keys = {
    p56_first76: p56.slice(0, 76),
    p56_last76: p56.slice(-76),
    p57_first76: p57.slice(0, 76),
    p57_last76: p57.slice(-76),
    combined_reverse76: p56.concat(p57).reverse().slice(0, 76),
    an_end_within: encodeGP("AN END WITHIN THE DEEP WEB"),
    the_deep_end: encodeGP("THE DEEP END")
  };
  assert.deepEqual(keys.an_end_within, encodeSourceNativeGP("AN END WITHIN THE DEEP WEB"));
  assert.deepEqual(keys.the_deep_end, encodeSourceNativeGP("THE DEEP END"));

  const p55Candidates = [];
  for (const [name, key] of Object.entries(keys)) {
    for (let skipMask = 0; skipMask < 8; skipMask++) {
      const plaintext = decodeP55(p55, key, skipMask);
      assert.deepEqual(reencodeP55(plaintext, key, skipMask), p55);
      p55Candidates.push({
        key: name,
        skipMask,
        scoreLegacy: scoreLegacy(plaintext),
        scoreNative: scoreNative(plaintext),
        preview: printGP(plaintext).slice(0, 84)
      });
    }
  }
  const p55ByLegacy = p55Candidates.slice().sort((a, b) => b.scoreLegacy - a.scoreLegacy);
  const p55ByNative = p55Candidates.slice().sort((a, b) => b.scoreNative - a.scoreNative);
  assert.equal(p55Candidates.length, 56);
  assert.equal(p55ByLegacy[0].key, "p57_first76");
  assert.equal(p55ByLegacy[0].skipMask, 0);
  assert.equal(p55ByNative[0].key, "p57_first76");
  assert.equal(p55ByNative[0].skipMask, 0);

  // Transfer the exact 22-rune historical key to the first unknown LP2 page.
  // The red heading is a source-visible 13-rune segment; test only its natural
  // boundaries, not arbitrary phases or offsets.
  const p0 = corpus.pages.find(page => page.page === 0).indices;
  const red = p0Ink.physical_zero_based.red_words.flatMap(word => word.gp_indices);
  assert.equal(p0.length, 262);
  assert.equal(red.length, 13);
  assert.deepEqual(p0.slice(0, red.length), red);
  const black = p0.slice(red.length);
  const p0Specs = [
    { name: "whole_page_from_red_start", values: p0, phase: 0 },
    { name: "black_body_key_reset", values: black, phase: 0 },
    { name: "black_body_key_continues_after_red", values: black, phase: red.length },
    { name: "red_heading_only", values: red, phase: 0 }
  ];
  const p0Tests = [];
  for (const direction of [-1, 1]) {
    for (const spec of p0Specs) {
      const plaintext = inverseKey(spec.values, priorSolvedText, direction, spec.phase);
      assert.deepEqual(inverseKey(plaintext, priorSolvedText, -direction, spec.phase), spec.values);
      p0Tests.push({
        name: spec.name,
        direction,
        phase: spec.phase,
        runes: plaintext.length,
        ioc: indexOfCoincidence(plaintext),
        scoreLegacy: scoreLegacy(plaintext),
        scoreNative: scoreNative(plaintext),
        first22: printGP(plaintext.slice(0, 22)),
        preview: printGP(plaintext.slice(0, 84))
      });
    }
  }

  // The cyclic extension of the 22-rune key over the whole unknown corpus is
  // a separate, explicitly speculative transfer; page reset is the only
  // competing natural clock.
  const unknownPages = corpus.pages.filter(page => page.page < 56);
  const unknown = unknownPages.flatMap(page => page.indices);
  const bookKeyTests = [];
  for (const direction of [-1, 1]) {
    const continuous = inverseKey(unknown, priorSolvedText, direction, 0);
    assert.deepEqual(inverseKey(continuous, priorSolvedText, -direction, 0), unknown);
    const pageReset = unknownPages.flatMap(page => {
      const plaintext = inverseKey(page.indices, priorSolvedText, direction, 0);
      assert.deepEqual(inverseKey(plaintext, priorSolvedText, -direction, 0), page.indices);
      return plaintext;
    });
    bookKeyTests.push(
      {
        clock: "continuous",
        direction,
        ioc: indexOfCoincidence(continuous),
        scoreLegacy: scoreLegacy(continuous),
        scoreNative: scoreNative(continuous),
        preview: printGP(continuous.slice(0, 84))
      },
      {
        clock: "page_reset",
        direction,
        ioc: indexOfCoincidence(pageReset),
        scoreLegacy: scoreLegacy(pageReset),
        scoreNative: scoreNative(pageReset),
        preview: printGP(pageReset.slice(0, 84))
      }
    );
  }

  console.log(JSON.stringify({
    historicalPositiveControl: {
      key: "WELCOME PILGRIM TO THE GREAT",
      keyRunes: priorSolvedText.length,
      ciphertextRunes: 18,
      plaintext: historicalResult,
      knownReading: "AVOWYFGL5LKZFJ3N.ONION"
    },
    languageModels: {
      training: "clean solved LP1 reference only; headings and bracketed editorial notes removed; p56/p57 held out",
      legacyTrainingRunes: encodeGP(cleanLP1).length,
      sourceNativeTrainingRunes: encodeSourceNativeGP(cleanLP1).length,
      p55Raw: {
        legacy: scoreLegacy(p55),
        sourceNative: scoreNative(p55)
      },
      p56Control: {
        legacy: scoreLegacy(p56),
        sourceNative: scoreNative(p56)
      },
      p57Control: {
        legacy: scoreLegacy(p57),
        sourceNative: scoreNative(p57)
      }
    },
    p55: {
      candidates: p55Candidates.length,
      topByLegacy: p55ByLegacy.slice(0, 4),
      topBySourceNative: p55ByNative.slice(0, 4)
    },
    p0: {
      runes: p0.length,
      redHeadingRunes: red.length,
      blackBodyRunes: black.length,
      raw: {
        ioc: indexOfCoincidence(p0),
        legacy: scoreLegacy(p0),
        sourceNative: scoreNative(p0)
      },
      tests: p0Tests
    },
    wholeUnknownBookWithOpeningPhraseKey: {
      runes: unknown.length,
      raw: {
        ioc: indexOfCoincidence(unknown),
        legacy: scoreLegacy(unknown),
        sourceNative: scoreNative(unknown)
      },
      tests: bookKeyTests
    }
  }, null, 2));
}

if (require.main === module) main();

module.exports = {
  main,
  encodeGP,
  historicalOnionInverse,
  trigramScorer,
  inverseKey
};
