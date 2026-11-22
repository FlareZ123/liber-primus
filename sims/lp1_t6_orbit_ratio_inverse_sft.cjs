"use strict";

/*
 * Test the source-fixed LP1 MOBIUS / LP2 p40 T6 28-cycle as a
 * multiplicative log-ratio differential transducer.
 *
 * Distinct from the additive C_i-C_(i-1) difference/rank gate in
 * t6_source_register_gate.cjs: this uses log_{-2}((C_i-8)/(C_prev-8)).
 *
 * Node 22, no external packages:
 *   node sims/lp1_t6_orbit_ratio_inverse_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { parseSharedCorpus } = require("./lp2_word_pages.cjs");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const translitIndex = new Map(corpus.translit.map((r, i) => [r, i]));
const parsed = parseSharedCorpus();
const words = parsed.words.map((word) => ({
  xs: [...word.runes].map((r) => {
    const value = runeIndex.get(r);
    assert.notEqual(value, undefined, "unknown original GP rune");
    return value;
  }),
  startPage: word.startPage,
  endPage: word.endPage,
}));
const original = corpus.pages
  .filter((page) => page.page <= 55 && page.page !== 50)
  .flatMap((page) => page.indices);
const flatOriginal = words.flatMap((word) => word.xs);
assert.equal(parsed.runeCount, 12956);
assert.equal(parsed.words.length, 2896);
assert.equal(parsed.crossPageWords, 32);
assert.deepEqual(flatOriginal, original);

const MOD29 = (x) => ((x % 29) + 29) % 29;
const MOD28 = (x) => ((x % 28) + 28) % 28;
const N = 31;
const START = 29;
const END = 30;
const FIXED = 8;
const SEED = 21;

// Source bridge: T(x)=27x+24=8-2(x-8) mod 29, fixed point 8.
// The p05 MOBIUS cell 226 gives h(226 mod 29)=21 as the cycle seed.
const T = (x) => MOD29(27 * x + 24);
const ORBIT = [SEED];
for (let i = 1; i < 28; i++) ORBIT.push(T(ORBIT[i - 1]));
assert.equal(new Set(ORBIT).size, 28);
assert.ok(!ORBIT.includes(FIXED));
assert.equal(T(ORBIT[27]), SEED);
assert.equal(T(FIXED), FIXED);
const POSITION = new Map(ORBIT.map((x, i) => [x, i]));

/*
 * A non-fixed GP symbol is represented by its exponent in the source cycle.
 * A transition is the exponent difference; equivalently it is a discrete
 * logarithm of the multiplicative ratio in F29 after shifting by H=8.
 *
 * Two natural output conventions are tested:
 *   zeroStepToFixed=false: step 0 -> seed 21; input H -> output H.
 *   zeroStepToFixed=true:  step 0 -> H; input H -> output seed 21.
 * The fixed-point event either resets to the source seed or leaves state.
 */
function transformWords(input, model) {
  let state = 0;
  return input.map((word) => {
    if (model.resetWord) state = 0;
    const xs = [];
    for (const cipher of word.xs) {
      if (cipher === FIXED) {
        xs.push(model.zeroStepToFixed ? SEED : FIXED);
        if (model.fixedResets) state = 0;
        continue;
      }
      const current = POSITION.get(cipher);
      assert.notEqual(current, undefined);
      const step = model.direction === 1
        ? MOD28(current - state)
        : MOD28(state - current);
      xs.push(model.zeroStepToFixed && step === 0 ? FIXED : ORBIT[step]);
      state = current;
    }
    return { ...word, xs };
  });
}

function inverseWords(input, model) {
  let state = 0;
  return input.map((word) => {
    if (model.resetWord) state = 0;
    const xs = [];
    for (const plain of word.xs) {
      if ((model.zeroStepToFixed && plain === SEED)
        || (!model.zeroStepToFixed && plain === FIXED)) {
        xs.push(FIXED);
        if (model.fixedResets) state = 0;
        continue;
      }
      const step = model.zeroStepToFixed && plain === FIXED
        ? 0
        : POSITION.get(plain);
      assert.notEqual(step, undefined);
      const current = model.direction === 1
        ? MOD28(state + step)
        : MOD28(state - step);
      xs.push(ORBIT[current]);
      state = current;
    }
    return { ...word, xs };
  });
}

function sameWords(a, b) {
  return a.length === b.length
    && a.every((word, i) => word.xs.length === b[i].xs.length
      && word.xs.every((value, j) => value === b[i].xs[j]));
}

function encodeEnglishWord(word) {
  const text = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/K/g, "C")
    .replace(/Z/g, "S");
  const output = [];
  for (let i = 0; i < text.length;) {
    const pair = text.slice(i, i + 2);
    if (translitIndex.has(pair)) {
      output.push(translitIndex.get(pair));
      i += 2;
    } else {
      const value = translitIndex.get(text[i]);
      if (value !== undefined) output.push(value);
      i++;
    }
  }
  return output;
}

function englishWords(text) {
  return (text.match(/[A-Za-z]+/g) || [])
    .map(encodeEnglishWord)
    .filter((word) => word.length > 0);
}

function takeRunes(input, limit) {
  const output = [];
  let remaining = limit;
  for (const word of input) {
    if (remaining <= 0) break;
    const xs = word.slice(0, remaining);
    if (xs.length) output.push({ xs });
    remaining -= xs.length;
  }
  return output;
}

function trainTrigram(trainingWords) {
  const h3 = new Float64Array(N * N * N);
  const h2 = new Float64Array(N * N);
  const h1 = new Float64Array(N);
  const ctx3 = new Float64Array(N * N);
  const ctx2 = new Float64Array(N);
  for (const word of trainingWords) {
    let u = START;
    let v = START;
    for (const c of [...word, END]) {
      h3[(u * N + v) * N + c]++;
      ctx3[u * N + v]++;
      h2[v * N + c]++;
      ctx2[v]++;
      h1[c]++;
      u = v;
      v = c;
    }
  }
  const total = h1.reduce((a, b) => a + b, 0);
  const p1 = Float64Array.from(h1, (value) => (value + 1) / (total + N));
  const p2 = new Float64Array(N * N);
  for (let b = 0; b < N; b++) {
    for (let c = 0; c < N; c++) {
      p2[b * N + c] = (h2[b * N + c] + 10 * p1[c]) / (ctx2[b] + 10);
    }
  }
  const log3 = new Float64Array(N * N * N);
  for (let a = 0; a < N; a++) {
    for (let b = 0; b < N; b++) {
      for (let c = 0; c < N; c++) {
        const index = (a * N + b) * N + c;
        log3[index] = Math.log((h3[index] + 5 * p2[b * N + c]) / (ctx3[a * N + b] + 5));
      }
    }
  }
  return log3;
}

function trigramScore(input, model) {
  let sum = 0;
  let runes = 0;
  for (const word of input) {
    let u = START;
    let v = START;
    for (const c of [...word.xs, END]) {
      sum += model[(u * N + v) * N + c];
      if (c !== END) runes++;
      u = v;
      v = c;
    }
  }
  return { runes, meanNatsPerRune: sum / runes, totalNats: sum };
}

function indexOfCoincidence(input) {
  const counts = Array(29).fill(0);
  let n = 0;
  for (const word of input) {
    for (const value of word.xs) {
      counts[value]++;
      n++;
    }
  }
  return counts.reduce((sum, value) => sum + value * (value - 1), 0) / (n * (n - 1));
}

const shakespeare = read("resources/control/shakespeare_first300k.txt");
const shakespeareWords = englishWords(shakespeare.slice(0, 240000));
const heldoutWords = englishWords(shakespeare.slice(240000));
const languageModel = trainTrigram(shakespeareWords);
const nativeShakespeare = takeRunes(heldoutWords, 12956);
assert.equal(nativeShakespeare.flatMap((word) => word.xs).length, 12956);
const lp1Words = englishWords(read("resources/liber-primus/lp1-plaintext-reference.txt"));
const nativeLP1 = takeRunes(lp1Words, 12956);

const sourcePlant = heldoutWords.slice(0, 300).map((xs) => ({ xs }));
const variants = [];
for (const zeroStepToFixed of [false, true]) {
  for (const resetWord of [true, false]) {
    for (const direction of [1, -1]) {
      for (const fixedResets of [true, false]) {
        const model = { zeroStepToFixed, resetWord, direction, fixedResets };
        const output = transformWords(words, model);
        const originalRoundtrip = sameWords(words, inverseWords(output, model));
        const encryptedPlant = inverseWords(sourcePlant, model);
        const recoveredPlant = transformWords(encryptedPlant, model);
        const plantRoundtrip = sameWords(sourcePlant, recoveredPlant);
        assert.ok(originalRoundtrip, "original inverse/forward roundtrip failed");
        assert.ok(plantRoundtrip, "native source plant failed");
        variants.push({
          ...model,
          score: trigramScore(output, languageModel),
          ioc: indexOfCoincidence(output),
          originalRoundtrip,
          plantRoundtrip,
        });
      }
    }
  }
}
assert.equal(variants.length, 16);
const primary = variants.find((x) =>
  !x.zeroStepToFixed && x.resetWord && x.direction === 1 && x.fixedResets);
const best = variants.slice().sort((a, b) =>
  b.score.meanNatsPerRune - a.score.meanNatsPerRune)[0];

const result = {
  classification: "bounded source-constrained negative; no unknown plaintext or authentic key",
  source: {
    originalRunes: parsed.runeCount,
    canonicalWords: parsed.words.length,
    crossPageWords: parsed.crossPageWords,
    originalPageSegments: 55,
    gridOnlyPage50Excluded: true,
  },
  sourceCycle: {
    operation: "T(x)=27x+24=8-2(x-8) mod 29",
    fixedPoint: FIXED,
    seed: SEED,
    orbitOrder: ORBIT.length,
    orbit: ORBIT,
    interpretation: "d_i is the difference of orbit exponents; equivalently log_{-2}((C_i-8)/(C_prev-8))",
  },
  scoring: {
    languageModel: "Shakespeare GP trigram; first 240,000 source characters trained, following 60,000 held out",
    rawOriginal: {
      score: trigramScore(words, languageModel),
      ioc: indexOfCoincidence(words),
    },
    nativeShakespeareHeldout: {
      score: trigramScore(nativeShakespeare, languageModel),
      ioc: indexOfCoincidence(nativeShakespeare),
    },
    solvedLP1Plaintext: {
      score: trigramScore(nativeLP1, languageModel),
      ioc: indexOfCoincidence(nativeLP1),
    },
    primarySourceFixedModel: primary,
    bestOf16: best,
    variantIocRange: [
      Math.min(...variants.map((x) => x.ioc)),
      Math.max(...variants.map((x) => x.ioc)),
    ],
  },
  controls: {
    sourceNativePlantWords: sourcePlant.length,
    sourceNativePlantRunes: sourcePlant.flatMap((word) => word.xs).length,
    everyVariantOriginalRoundtrip: variants.every((x) => x.originalRoundtrip),
    everyVariantNativePlantRoundtrip: variants.every((x) => x.plantRoundtrip),
  },
  variants,
};
console.log(JSON.stringify(result, null, 2));
