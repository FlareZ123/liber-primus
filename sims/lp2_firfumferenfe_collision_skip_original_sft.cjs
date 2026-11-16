"use strict";

/**
 * Historical 2014 LP1 13-rune key FIRFUMFERENFE under a new collision-reject
 * transport, against original LP2 p55 and independent original p0-2.
 *
 * This is NOT the already-excluded plaintext-F-bypass rule, and it is
 * NOT an authenticated instruction that the author reused the old key.
 *
 * On Windows 11 / Node 22, from the repository root:
 *   node sims/lp2_firfumferenfe_collision_skip_original_sft.cjs
 */
const assert = require("node:assert/strict");
const {
  corpus, input, tokens, language, parseOriginal, inverse, emit, flatten, MODELS,
} = require("./lp2_liber_al_antirepeat_runningkey_sft.cjs");

const HISTORIC = [0, 10, 4, 0, 1, 19, 0, 18, 4, 18, 9, 0, 18];
const key = Array.from({length: 1500}, (_, i) => HISTORIC[i % 13]);
const p55Lengths = [1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3];
const printed55 = corpus.pages[55].indices;
assert.equal(printed55.length, 76);
assert.equal(p55Lengths.reduce((a, n) => a + n, 0), 76);
const start55 = p55Lengths.flatMap((n) =>
  Array.from({length:n}, (_, i) => i === 0));
const first = parseOriginal(input("resources/liber-primus/lp2-transcription.txt"), 729);
assert.deepEqual(first.c, corpus.pages.slice(0, 3).flatMap((p) => p.indices),
  "Use original page runes p0/p1/p2 without alteration");
assert.equal(first.c.length, 729);

const report = [];
for (const mode of MODELS) {
  // The authentic source key is an explicit GP29 sequence independent of the
  // chosen Latin-orthography convention, which changes only the language model.
  const gibran = tokens(input("resources/control/gibran_prophet_58585.txt"),
    mode.digraphs);
  const train = gibran.slice(1000, Math.floor(gibran.length * 0.75));
  const held = gibran.slice(Math.floor(gibran.length * 0.75));
  const model = language(train);
  const source = flatten(held, 76);
  let best55 = null, best0 = null, positiveMin = Infinity;
  for (const sign of [1, -1]) for (let phase = 0; phase < 13; phase++) {
    // Source-native English positive: independent heldout Gibran under the
    // frozen historically authenticated LP1 period-13 GP29 key.
    const plant = emit(source.plain, key, phase, sign);
    const control = inverse(plant.cipher, source.starts, key, phase, 76,
      model, sign, 130, true);
    assert.deepEqual(control.plain, source.plain,
      "Original-length 76-rune Gibran plant must recover in every fixed cell");
    assert.equal(control.skip, plant.skips,
      "Original-length reference-emitter skip clock mismatch");
    positiveMin = Math.min(positiveMin, control.score);

    const target55 = inverse(printed55, start55, key, phase, 76,
      model, sign, 130, true);
    const row55 = {
      spelling: mode.name, sign, phase,
      score: target55.score, skips: target55.skip,
      output: target55.plain.map((x) => corpus.translit[x]).join(""),
    };
    if (!best55 || row55.score > best55.score) best55 = row55;

    // Frozen independent original receiver, the opening chapter's 262-rune
    // first physical page: a different ciphertext length and artwork.
    const target0 = inverse(first.c, first.starts, key, phase, 262,
      model, sign, 130, true);
    const row0 = {
      spelling: mode.name, sign, phase,
      score: target0.score, skips: target0.skip,
      first120: target0.plain.slice(0, 120)
        .map((x) => corpus.translit[x]).join(""),
    };
    if (!best0 || row0.score > best0.score) best0 = row0;
  }
  assert(best55.score < positiveMin,
    "Original p55 unexpectedly scores as well as native-English source plant");
  report.push({
    spelling:mode.name,
    source:"FIRFUMFERENFE (solved LP1 second koan), 13 GP29 key runes",
    exactOriginalReceivers:"p55 76 source runes; p0 262 source runes",
    hypothesis:"C_i=(P_i +/- K_j) mod29; key-only retry at ciphertext collision, q=.81",
    originalPhases:13,
    signs:2,
    positiveSourceNative76:26,
    minimumPlant76Score:positiveMin,
    bestOriginal55:best55,
    bestOriginal0:best0,
  });
}
for (const r of report) process.stdout.write(JSON.stringify(r) + "\n");
process.stdout.write(
  "COMPLETE: all 52 76-rune source-native English plants exactly recover; "
  + "no original source-selected p55 or p0 plaintext.\n");
