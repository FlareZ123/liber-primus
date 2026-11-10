"use strict";
/**
 * Exact source-linked two-time-pad diagnostic across eight unsolved LP2 sections.
 *
 * If two published ciphertext-step streams reuse the same additive GP pad,
 * their aligned differences cancel the pad. Evaluate each source-position
 * shift against a heldout GP-English difference bigram prior, then perform a
 * normalized 29^2-state language-pair forward calculation. The pipeline
 * calibrates its maximum against independently shuffled 64-rune blocks,
 * retaining each block's genuine anti-doublet and local step structure.
 *
 * This is a key-reuse test, not proof of a plaintext or cipher; no guessed
 * plaintext, padding, or forged ciphertext is written to source resources.
 *
 * Reproduce: node sims/dual_section_difference_inversion.cjs
 * @module dual_section_difference_inversion
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");
const DATA = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const RUNE_MAP = new Map(DATA.runes.map((r, i) => [r, i]));
const ROMAN_MAP = new Map(DATA.translit.map((r, i) => [r, i]));
const MOD = 29;
const SEED = 0x704bc330;
const REPLICATES = 60;
const BLOCK_SIZE = 64;
const MIN_OVERLAP = 600;

/** @param {string} str */
function romanToGP(str) {
  str = str.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  const result = [];
  for (let i = 0; i < str.length;) {
    const digraph = ROMAN_MAP.get(str.slice(i, i + 2));
    if (digraph !== undefined) {
      result.push(digraph); i += 2;
      continue;
    }
    const single = ROMAN_MAP.get(str[i]);
    if (single === undefined) return [];
    result.push(single); i++;
  }
  return result;
}

function originals() {
  const sections = read("resources/lp2-transcription.txt").split("$")
    .slice(0, 8).map(raw => Uint8Array.from(
      [...raw].filter(r => RUNE_MAP.has(r)).map(r => RUNE_MAP.get(r))));
  assert.deepEqual(sections.map(s => s.length),
    [729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]);
  return sections.map(section => Uint8Array.from(section,
    (value, i) => i ? (value - section[i - 1] + MOD) % MOD : 0));
}

function english() {
  const text = read("resources/control/shakespeare_first300k.txt");
  assert.equal(text.length, 300000);
  return {
    train: (text.slice(0, 230000).match(/[A-Za-z]+/g) || [])
      .flatMap(romanToGP),
    test: (text.slice(230000).match(/[A-Za-z]+/g) || [])
      .flatMap(romanToGP)
  };
}

/** @param {ArrayLike<number>} values */
function pairDistribution(values) {
  const table = new Float64Array(MOD * MOD).fill(0.05);
  for (let i = 1; i < values.length; i++)
    table[MOD * values[i - 1] + values[i]]++;
  const mass = table.reduce((a, b) => a + b, 0);
  return table.map(v => v / mass);
}

/** @param {Float64Array} q */
function pairDifference(q) {
  const out = new Float64Array(MOD * MOD);
  for (let a = 0; a < MOD; a++) for (let b = 0; b < MOD; b++)
    for (let c = 0; c < MOD; c++) for (let d = 0; d < MOD; d++)
      out[MOD * ((a - c + MOD) % MOD) + (b - d + MOD) % MOD] +=
        q[a * MOD + b] * q[c * MOD + d];
  return out;
}

/**
 * For all 28 section pairs and every integral source-offset with at least
 * MIN_OVERLAP shared positions, find maximum language-vs-background
 * difference-bigram log-likelihood. The scores have no fitted key.
 * @param {Uint8Array[]} sections
 * @param {Float64Array} weights
 */
function scan(sections, weights) {
  let best = {score: -Infinity, pair: [-1, -1], offset: 0, overlap: 0};
  let qualified = 0;
  for (let a = 0; a < sections.length; a++)
    for (let b = a + 1; b < sections.length; b++) {
      const x = sections[a], y = sections[b], nx = x.length, ny = y.length;
      const scores = new Float64Array(nx + ny - 1);
      const lengths = new Uint16Array(nx + ny - 1);
      for (let i = 1; i < nx; i++) {
        const xi = x[i], pi = x[i - 1], base = nx - 1 - i;
        for (let j = 1; j < ny; j++) {
          const curr = (xi - y[j] + MOD) % MOD;
          const prev = (pi - y[j - 1] + MOD) % MOD;
          const k = base + j;
          scores[k] += weights[MOD * prev + curr];
          lengths[k]++;
        }
      }
      for (let k = 0; k < scores.length; k++) {
        if (lengths[k] + 1 < MIN_OVERLAP) continue;
        qualified++;
        if (scores[k] > best.score)
          best = {score: scores[k], pair: [a, b],
            offset: k - nx + 1, overlap: lengths[k] + 1};
      }
    }
  return {...best, qualifiedAlignments: qualified};
}

/** @param {number} seed */
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return state >>> 0;
  };
}

/**
 * Shuffle only intact contiguous blocks of published ciphertext *steps*.
 * Local step bigrams and the genuine sparse zero-step counts are retained,
 * while long distance inter-section key synchronization is disrupted.
 * @param {Uint8Array[]} values
 * @param {()=>number} random
 */
function shuffleBlocks(values, random) {
  return values.map(values => {
    const blocks = [];
    for (let i = 0; i < values.length; i += BLOCK_SIZE)
      blocks.push(values.subarray(i, Math.min(i + BLOCK_SIZE, values.length)));
    for (let i = blocks.length - 1; i > 0; i--) {
      const j = random() % (i + 1);
      [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
    }
    const dst = new Uint8Array(values.length);
    let i = 0;
    for (const block of blocks) { dst.set(block, i); i += block.length; }
    return dst;
  });
}

function trainLanguage(gp) {
  const unig = new Float64Array(MOD).fill(.5);
  const bi = Array.from({length: MOD},
    () => new Float64Array(MOD).fill(.1));
  const tri = Array.from({length: MOD * MOD},
    () => new Float64Array(MOD).fill(.2));
  for (let i = 0; i < gp.length; i++) {
    unig[gp[i]]++;
    if (i) bi[gp[i - 1]][gp[i]]++;
    if (i >= 2) tri[gp[i - 2] * MOD + gp[i - 1]][gp[i]]++;
  }
  const sum = unig.reduce((a, b) => a + b, 0);
  for (let i = 0; i < MOD; i++) unig[i] /= sum;
  for (let i = 0; i < MOD; i++) {
    const n = bi[i].reduce((a, b) => a + b, 0);
    for (let j = 0; j < MOD; j++) bi[i][j] /= n;
  }
  for (let i = 0; i < MOD * MOD; i++) {
    const n = tri[i].reduce((a, b) => a + b, 0);
    for (let j = 0; j < MOD; j++)
      tri[i][j] = .7 * tri[i][j] / n + .3 * bi[i % MOD][j];
  }
  return {unig, bi, tri};
}

/**
 * Exact normalized sum over *all* 29-ary source-pair paths compatible with
 * observed differences. Returns log(P(D)/29^(-|D|)), a Bayes factor relative
 * to independent uniform differences. Model selection is calibrated
 * separately by applying the whole scanner to every null book.
 */
function forward(sections, hit, model) {
  const [a, b] = hit.pair, x = sections[a], y = sections[b],
    off = hit.offset, start = Math.max(1, 1 - off),
    end = Math.min(x.length, y.length - off), n = end - start;
  assert.ok(n >= MIN_OVERLAP - 1);
  const D = Array.from({length: n}, (_, t) =>
    (x[start + t] - y[start + t + off] + MOD) % MOD);
  let alpha = new Float64Array(MOD * MOD);
  let next = new Float64Array(MOD * MOD);
  let mass = 0;
  for (let u = 0; u < MOD; u++) for (let v = 0; v < MOD; v++) {
    const uu = (u - D[0] + MOD) % MOD;
    const vv = (v - D[1] + MOD) % MOD;
    const p = model.unig[u] * model.bi[u][v] *
      model.unig[uu] * model.bi[uu][vv];
    alpha[u * MOD + v] = p; mass += p;
  }
  let llr = Math.log(mass * MOD * MOD);
  for (let i = 0; i < alpha.length; i++) alpha[i] /= mass;
  for (let t = 2; t < n; t++) {
    const d0 = D[t - 2], d1 = D[t - 1], d2 = D[t];
    mass = 0;
    for (let u = 0; u < MOD; u++) for (let v = 0; v < MOD; v++) {
      const ub = (u - d0 + MOD) % MOD;
      const vb = (v - d1 + MOD) % MOD;
      const from = alpha[u * MOD + v];
      const rowU = model.tri[u * MOD + v];
      const rowV = model.tri[ub * MOD + vb];
      const to = v * MOD;
      for (let w = 0; w < MOD; w++) {
        const wb = (w - d2 + MOD) % MOD;
        next[to + w] += from * rowU[w] * rowV[wb];
      }
    }
    for (let i = 0; i < next.length; i++) mass += next[i];
    assert.ok(mass > 0 && Number.isFinite(mass));
    llr += Math.log(mass * MOD);
    for (let i = 0; i < alpha.length; i++) {
      alpha[i] = next[i] / mass; next[i] = 0;
    }
  }
  return {logUniformBayesFactor: llr, observations: n,
    meanLogFactor: llr / n};
}

/**
 * Build a true shared-pad positive plant using only the untouched
 * Shakespeare test suffix, with an 81% rewrite of zero ciphertext steps.
 */
function positivePlant(lengths, gp, random) {
  assert.ok(gp.length > lengths.reduce((a, b) => a + b, 0));
  const key = Array.from({length: Math.max(...lengths)},
    () => random() % MOD);
  let index = 0, repairEvents = 0;
  const out = lengths.map(length => {
    const tape = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      let x = (gp[index++] + key[i]) % MOD;
      if (i && x === 0 && random() / 4294967296 < .81) {
        x = 1 + random() % (MOD - 1); repairEvents++;
      }
      tape[i] = x;
    }
    return tape;
  });
  return {out, repairEvents};
}

function run() {
  const steps = originals();
  const lang = english();
  const language = trainLanguage(lang.train);
  const target = pairDifference(pairDistribution(lang.train));
  const background = pairDifference(pairDistribution(steps.flatMap(s => [...s])));
  const weights = Float64Array.from(target,
    (prob, i) => Math.log(prob / background[i]));
  const observed = scan(steps, weights);
  const originalForward = forward(steps, observed, language);
  const random = rng(SEED);
  const nulls = [];
  for (let rep = 0; rep < REPLICATES; rep++) {
    const book = shuffleBlocks(steps, random);
    const hit = scan(book, weights);
    const languageScore = forward(book, hit, language);
    nulls.push({bigramMax: hit.score, exactForward: languageScore.logUniformBayesFactor});
  }
  const bigramTails = nulls.filter(x => x.bigramMax >= observed.score).length;
  const forwardTails = nulls.filter(x =>
    x.exactForward >= originalForward.logUniformBayesFactor).length;
  const plant = positivePlant(steps.map(s => s.length), lang.test, random);
  const plantedHit = scan(plant.out, weights);
  const plantedForward = forward(plant.out, plantedHit, language);
  const answer = {
    classification: "original-LP2 key-reuse test, no unknown LP2 plaintext or key authenticated",
    hypothesis: "two sections reuse a 29-ary additive ciphertext-step pad at an unknown fixed offset",
    input: {source:"resources/lp2-transcription.txt", runes:12956,
      sections:steps.map(x=>x.length),
      knownSource:"resources/control/shakespeare_first300k.txt",
      referenceTrainRunes:lang.train.length,
      independentHoldoutRunes:lang.test.length},
    search: {sectionPairs:28, minOverlap:MIN_OVERLAP,
      originalBest:observed, normalizedOriginal:originalForward},
    calibration: {null:"independent 64-rune block reorder of each actual section step tape",
      seed:SEED, blockSize:BLOCK_SIZE, books:REPLICATES,
      bigramUpperP:(1+bigramTails)/(REPLICATES+1),
      bigramAtLeastOriginal:bigramTails,
      forwardUpperP:(1+forwardTails)/(REPLICATES+1),
      forwardAtLeastOriginal:forwardTails,
      nullBigram: nulls.map(x=>x.bigramMax).sort((a,b)=>a-b),
      nullForward: nulls.map(x=>x.exactForward).sort((a,b)=>a-b)},
    positive: {model:"Shakespeare heldout GP and shared per-offset additive pad, zero-step repair .81",
      repairEvents:plant.repairEvents, selected:plantedHit,
      normalized:plantedForward}
  };
  assert.ok(plantedHit.score > observed.score,
    "positive must outperform source-original candidate under matched plant");
  process.stdout.write(JSON.stringify(answer, null, 2) + "\n");
  return answer;
}

if (require.main === module) run();
module.exports = {romanToGP, originals, english, pairDistribution,
  pairDifference, scan, shuffleBlocks, trainLanguage, forward,
  positivePlant, run};
