"use strict";

/**
 * Fixed 2013 AUDIO/761.MP3 byte-zero source applied as a variable
 * GP28 predecessor-exclusion pad to original LP2 pp0..55.
 *
 * This is a motivated but unverified cross-round model. Source 761.MP3
 * historically served as an XOR key from byte zero. LP2 overwhelmingly
 * avoids adjacent ciphertext repeats, motivating the 28-symbol
 * predecessor-exclusion transport with a reserved 29th marker.
 *
 * node sims/lp2_2013_audio_source_gp28_original_sft.cjs C:\original\761.MP3
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");
const corpus = require("../resources/liber-primus/lp2-corpus.json");
const p27Mode = process.argv[3] === "p27-708";
assert.ok(process.argv.length === 3 || process.argv.length === 4 && p27Mode,
  "Optional mode must be p27-708");
const pages = p27Mode
  ? [{page:27, indices:corpus.pages.filter(p => p.page >=27 && p.page <=32)
      .flatMap(p => p.indices).slice(19)}]
  : corpus.pages.filter(p => p.page <= 55 && p.indices.length);
const raw = pages.flatMap(p => p.indices);
assert.equal(pages.length, p27Mode ? 1 : 55);
assert.equal(raw.length, p27Mode ? 1414 : 12956);
const audio = fs.readFileSync(process.argv[2]);
assert.equal(audio.length, 4010732);
assert.equal(
  crypto.createHash("sha256").update(audio).digest("hex"),
  "83008217439110c3b824898af73b99cb2cf0657dda88cb363c3aa34a4ec0a460"
);
const direct = corpus.pages.find(p => p.page === 57).indices;
assert.equal(direct.length, 95);
const control = pages.map((page, index) =>
  Array.from({ length: page.indices.length }, (_, j) =>
    direct[(index * 97 + j) % direct.length])
);

/**
 * @param {number} a
 * @param {number} m
 * @returns {number}
 */
const mod = (a, m) => ((a % m) + m) % m;

/**
 * @param {number} previous
 * @param {number} current
 * @param {"cyclic"|"numeric"} rankRule
 * @returns {number} GP28 successor rank
 */
function rank(previous, current, rankRule) {
  if (rankRule === "cyclic") return mod(current - previous, 29) - 1;
  return current < previous ? current : current - 1;
}

/**
 * @param {number} previous
 * @param {number} r
 * @param {"cyclic"|"numeric"} rankRule
 * @returns {number}
 */
function unrank(previous, r, rankRule) {
  assert.ok(r >= 0 && r < 28);
  if (rankRule === "cyclic") return mod(previous + r + 1, 29);
  return r < previous ? r : r + 1;
}

/**
 * Key stream advances only for a nonrepeat content-symbol. The
 * first physical-page rune is a transmitted public IV. Reserved GP
 * index 28 is encoded by repeating the preceding ciphertext rune.
 *
 * @param {number[][]} ciphertext
 * @param {"page"|"global"} clock
 * @param {"cyclic"|"numeric"} rule
 * @param {number} sign
 * @returns {number[][]}
 */
function decrypt(ciphertext, clock, rule, sign) {
  let k = 0;
  return ciphertext.map(page => {
    if (clock === "page") k = 0;
    const out = [page[0]];
    for (let j = 1; j < page.length; j++) {
      if (page[j] === page[j - 1]) {
        out.push(28);
        continue;
      }
      const r = rank(page[j - 1], page[j], rule);
      const key = audio[(p27Mode ? 708 : 0) + k++] % 28;
      out.push(mod(r + sign * key, 28));
    }
    return out;
  });
}

/**
 * @param {number[][]} plain
 * @param {number[][]} originalIVs
 * @param {"page"|"global"} clock
 * @param {"cyclic"|"numeric"} rule
 * @param {number} sign
 * @returns {number[][]}
 */
function encrypt(plain, originalIVs, clock, rule, sign) {
  let k = 0;
  return plain.map((page, pageIdx) => {
    if (clock === "page") k = 0;
    const out = [originalIVs[pageIdx][0]];
    for (let j = 1; j < page.length; j++) {
      const p = page[j];
      assert.ok(Number.isInteger(p) && p >= 0 && p < 29);
      if (p === 28) {
        out.push(out[j - 1]);
        continue;
      }
      const key = audio[(p27Mode ? 708 : 0) + k++] % 28;
      const r = mod(p - sign * key, 28);
      out.push(unrank(out[j - 1], r, rule));
    }
    return out;
  });
}

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const hist = Array(29).fill(0);
  for (const v of values) hist[v]++;
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}
/** @param {number[]} values @returns {string} */
const translit = values => values.map(v => corpus.translit[v]).join("");
const original = pages.map(p => p.indices);
const cases = [];
for (const clock of p27Mode ? ["global"] : ["global", "page"]) {
  for (const rule of ["cyclic", "numeric"]) {
    for (const sign of [-1, +1]) {
      const recovered = decrypt(original, clock, rule, sign);
      const restored = encrypt(recovered, original, clock, rule, sign);
      assert.deepEqual(restored, original, "original inverse/forward roundtrip");

      const plantedCipher = encrypt(control, original, clock, rule, sign);
      const plantedClear = decrypt(plantedCipher, clock, rule, sign);
      let exact = 0;
      for (let p = 0; p < control.length; p++) {
        assert.deepEqual(plantedClear[p].slice(1), control[p].slice(1),
          "independent source-native GP plaintext plant");
        exact += control[p].length - 1;
      }
      assert.equal(exact, raw.length - pages.length);
      assert.deepEqual(encrypt(plantedClear, original, clock, rule, sign),
        plantedCipher, "positive re-encryption");
      const flat = recovered.flat();
      const out = {
        clock, rankRule: rule, sign, plaintextSymbols: flat.length,
        exactNativePlantSymbols: exact,
        originalIoc: ioc(flat),
        nativePlantIoc: ioc(plantedClear.flat()),
        first80: translit(recovered[0].slice(0, 80)),
        lastPageStart: translit(recovered.at(-1).slice(0, 50))
      };
      cases.push(out);
    }
  }
}
assert.equal(cases.length, p27Mode ? 4 : 8);
assert.ok(cases.every(x => x.exactNativePlantSymbols === raw.length - pages.length));
const sourceRepeats = pages.reduce((sum, p) =>
  sum + p.indices.slice(1).reduce((a, c, i) =>
    a + Number(c === p.indices[i]), 0), 0);
if (!p27Mode) assert.equal(sourceRepeats, 86);
console.log(JSON.stringify({
  source: "2013 761.MP3 byte-zero original raw source",
  source_sha256: crypto.createHash("sha256").update(audio).digest("hex"),
  source_length: audio.length,
  source_start_byte: p27Mode ? 708 : 0,
  original_target: p27Mode ? "LP2 original p27-32 black body after 19-rune red heading" : "LP2 pp0..55",
  original_length: raw.length,
  original_cipher_ioc: ioc(raw),
  within_page_repeats: sourceRepeats,
  rule: "1-runic public IV; repeat emits reserved index28; every other successor is a GP28 rank; each content successor consumes one audio byte modulo28",
  cases
}, null, 2));
