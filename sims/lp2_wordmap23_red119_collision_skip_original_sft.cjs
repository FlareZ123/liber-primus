"use strict";

/**
 * The p0–2 red-seeded 23-word cycle contains 119 original runes.
 * Test its complete rune tape as a single frozen running key on the two
 * source-marked 119-rune prefixes p3/p39, with the published collision-skip
 * transport q=.81 and disjoint heldout native-English positive plants.
 * No source proves that this hypothetical transport is authored.
 *
 * Windows 11 / Node.js 22:
 *   node sims/lp2_wordmap23_red119_collision_skip_original_sft.cjs
 */
const assert = require("node:assert/strict");
const { parseLP2Words } = require("./lp2_word_pages.cjs");
const {
  corpus, input, tokens, language, parseOriginal, inverse, emit, flatten, MODELS
} = require("./lp2_liber_al_antirepeat_runningkey_sft.cjs");

const source = input("resources/lp2-transcription.txt");
const { words } = parseLP2Words(source, 3);
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
assert.equal(words.length, 158);
assert.equal(words.reduce((a, w) => a + w.length, 0), 729);
assert.equal(words[0].length + words[1].length, 13);

/** @param {string} letters */
function primeSum(letters) {
  return [...letters].reduce((a, r) => a + corpus.prime[runeMap.get(r)], 0);
}
const body = words.slice(2);
const sums = body.map(w => primeSum(w.runes));
const next = sums.map(v => v % 156);
assert.equal(body.length, 156);
const seeds = words.slice(0, 2).map(w => primeSum(w.runes) % 156);
assert.deepEqual(seeds, [35, 3]);

/** @param {number} seed */
function cycle(seed) {
  const seen = new Map();
  const path = [];
  let cursor = seed;
  while (!seen.has(cursor)) {
    seen.set(cursor, path.length);
    path.push(cursor);
    cursor = next[cursor];
  }
  return path.slice(seen.get(cursor));
}
const cycles = {
  first: cycle(seeds[0]),
  second: cycle(seeds[1])
};
assert.deepEqual(Object.values(cycles).map(c => c.length), [23, 23]);
const pages = source.split("%");
const targets = {
  p3: parseOriginal(pages[3], 119),
  p39: parseOriginal(pages[39], 119)
};
assert.deepEqual(targets.p3.c, corpus.pages[3].indices.slice(0, 119));
assert.deepEqual(targets.p39.c, corpus.pages[39].indices.slice(0, 119));

const gibran = input("resources/control/gibran_prophet_58585.txt");
const report = [];
for (const mode of MODELS) {
  const tokensAll = tokens(gibran, mode.digraphs);
  const cutoff = Math.floor(tokensAll.length * 0.75);
  const model = language(tokensAll.slice(1000, cutoff));
  const heldout = flatten(tokensAll.slice(cutoff), 119);

  for (const [seed, cells] of Object.entries(cycles)) {
    const rawKey = cells.flatMap(i =>
      [...body[i].runes].map(r => runeMap.get(r)));
    assert.equal(rawKey.length, 119);

    for (const [keyType, key119] of Object.entries({
      ordinal: rawKey,
      primeMod29: rawKey.map(i => corpus.prime[i] % 29)
    })) {
      const key = key119.concat(key119, key119);
      for (const sign of [-1, 1]) {
        const plant = emit(heldout.plain, key, 0, sign);
        const recovered = inverse(plant.cipher, heldout.starts, key,
          0, 119, model, sign, 130, true);
        assert.deepEqual(recovered.plain, heldout.plain,
          "119-rune disjoint heldout Gibran plant must recover");
        assert.equal(recovered.skip, plant.skips);

        const a = inverse(targets.p3.c, targets.p3.starts, key,
          0, 119, model, sign, 130, true);
        const b = inverse(targets.p39.c, targets.p39.starts, key,
          0, 119, model, sign, 130, true);
        assert(a.score < recovered.score);
        assert(b.score < recovered.score);
        report.push({
          model: mode.name, seed, keyType, sign,
          source: "p0–2 red13→156-word map→23-word cycle→119 original runes",
          targets: "p3/p39 two original independent prefixes before red offset119",
          plantScore: recovered.score,
          plantSkip: plant.skips,
          p3Score: a.score,
          p39Score: b.score,
          p3Skips: a.skip,
          p39Skips: b.skip,
          p3First50: a.plain.slice(0, 50).map(i => corpus.translit[i]).join(""),
          p39First50: b.plain.slice(0, 50).map(i => corpus.translit[i]).join("")
        });
      }
    }
  }
}
assert.equal(report.length, 16);
console.log(JSON.stringify({
  sourceCycleLength: 23,
  selectedOriginalKeyRunes: 119,
  originalTargets: { p3: 119, p39: 119 },
  originalEncoder: "C=(P+/-K)%29, collision-retry q=.81, key-only skip <=2",
  tests: report.length,
  allNativeEnglishPlantsRecovered: true,
  noOriginalCandidateBeatsMatchedNativePlant: true,
  outcomes: report
}, null, 2));
