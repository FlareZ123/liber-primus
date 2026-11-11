"use strict";

/**
 * Cicada's authenticated 2014 "Let the text guide you" stage used previous
 * solved Liber Primus prose as the next GP29 Vigenere key. This bounded test
 * applies the same prior-solved-plaintext principle across original LP2.
 *
 * Run: node sims/lp1_prior_release_textguide_lp2_sft.cjs
 * Sources: historical_text_guide_terminal_vigenere_sft.cjs, LP1 reference,
 * and exact canonical LP2 ciphertext. No unknown language-model tuning.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {encodeGP, historicalOnionInverse} = require("./historical_text_guide_terminal_vigenere_sft.cjs");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const source = fs.readFileSync(
  path.join(root, "resources", "liber-primus", "lp1-plaintext-reference.txt"), "utf8");
const stripComments = x => x.replace(/^#.*$/gm, "");
const allLP1 = source.split("### 56")[0];
const lp1Welcome = allLP1.slice(allLP1.indexOf("### 3"));

/** @param {number[]} data @returns {string} */
function transliterate(data) {
  return data.map(i => corpus.translit[i]).join("");
}

/** @param {number[]} text @param {number[]} key @param {number} direction @param {number} phase */
function inverse(text, key, direction, phase) {
  return text.map((x, i) => (x + direction * key[(phase + i) % key.length] + 29) % 29);
}

/**
 * Fixed smoothed trigram reference from the first solved LP release.
 * p57 is independent historical solved-page language control.
 * @param {number[]} sourceRunes
 */
function trigramScore(sourceRunes) {
  const bi = new Map(), tri = new Map();
  for (let i = 2; i < sourceRunes.length; i++) {
    const b = sourceRunes[i - 2] * 29 + sourceRunes[i - 1];
    bi.set(b, (bi.get(b) || 0) + 1);
    const t = b * 29 + sourceRunes[i];
    tri.set(t, (tri.get(t) || 0) + 1);
  }
  /** @param {number[]} text */
  return text => {
    let logSum = 0;
    for (let i = 2; i < text.length; i++) {
      const b = text[i - 2] * 29 + text[i - 1];
      logSum += Math.log(
        (1 + (tri.get(b * 29 + text[i]) || 0)) / (29 + (bi.get(b) || 0)));
    }
    return logSum / (text.length - 2);
  };
}

function main() {
  // Actual solved 2014 stage: previously solved text supplied the next key.
  const onion = "ᚦᛗᛞᛇᚠᛗᚪᚱ5ᚢᚫᛝᚱᛝ3 ᛠᛗᛇᚠᛡ";
  assert.equal(historicalOnionInverse(
    onion, encodeGP("WELCOME PILGRIM TO THE GREAT")),
  "AUOWYFGL5LCSFJ3 NONIAN");

  const keys = {
    full_prior_lp1: encodeGP(stripComments(allLP1)),
    welcome_onward: encodeGP(stripComments(lp1Welcome)),
  };
  assert.equal(keys.full_prior_lp1.length, 3340);
  assert.equal(keys.welcome_onward.length, 3154);

  const unknownPages = corpus.pages.filter(x => x.page < 56);
  const unknown = unknownPages.flatMap(x => x.indices);
  assert.equal(unknown.length, 12956);
  const score = trigramScore(keys.full_prior_lp1);
  const solvedP57 = corpus.pages[57].indices;
  assert.equal(solvedP57.length, 95);
  assert.ok(transliterate(solvedP57).startsWith("PARABLELICETHEINSTAR"));

  const models = [];
  for (const [name, key] of Object.entries(keys)) {
    for (const clock of ["continuous", "page_reset"]) {
      for (const direction of [-1, +1]) {
        let at = 0;
        const whole = [];
        for (const page of unknownPages) {
          if (clock === "page_reset") at = 0;
          const decoded = inverse(page.indices, key, direction, at);
          const reenciphered = inverse(decoded, key, -direction, at);
          assert.deepEqual(reenciphered, page.indices);
          whole.push(...decoded);
          at += page.indices.length;
        }
        models.push({
          key_source: name,
          key_length: key.length,
          clock,
          direction,
          score: score(whole),
          first_75: transliterate(whole.slice(0, 75)),
          p55_76: transliterate(whole.slice(-76)),
        });
      }
    }
  }
  assert.equal(models.length, 8);
  const best = models.slice().sort((a, b) => b.score - a.score)[0];
  const worst = models.slice().sort((a, b) => a.score - b.score)[0];

  // Blind source-only plant with independently known final-page plaintext.
  const plantKey = keys.full_prior_lp1;
  const planted = inverse(solvedP57, plantKey, +1, 0);
  assert.deepEqual(inverse(planted, plantKey, -1, 0), solvedP57);
  assert.equal(transliterate(inverse(planted, plantKey, -1, 0)).slice(0, 7), "PARABLE");

  console.log(JSON.stringify({
    historical_onion_positive_control: true,
    lp2_original_runes: unknown.length,
    fixed_keys: Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, v.length])),
    raw_ciphertext_score: score(unknown),
    solved_p57_score: score(solvedP57),
    blind_planted_solved_p57_roundtrip: true,
    variants: models,
    best, worst,
    recovered_original_unknown_plaintext: false,
  }, null, 2));
}

if (require.main === module) main();
module.exports = {main, inverse, trigramScore};
