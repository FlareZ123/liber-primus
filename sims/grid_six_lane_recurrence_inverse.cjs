"use strict";
/**
 * Original LP2 six-lane keyed recurrence inverse with frozen original heldout.
 * Model: K_i=(a-2*K_(i-6)+G_i) mod29 for i>=6; first six K are hidden.
 * At each rune P_i=EA(28), emit previous ciphertext; otherwise emit
 * C_i=C_(i-1)+15^((P_i+sign*(K_i mod28)) mod28) mod29.
 * Every source byte serialisation and recurrence constant is explicit.
 * The six unknown seeds can be recovered independently in 29 trials/lane.
 * The family is reversible; recovering a candidate under a freely selected
 * seed does NOT establish an authentic original cipher.
 *
 * No npm dependencies. Run: node sims/grid_six_lane_recurrence_inverse.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const index = new Map(corpus.runes.map((r, i) => [r, i]));
const gp = new Map(corpus.translit.map((r, i) => [r, i]));
const raw = read("resources/transcriptions/liber_primus_master.txt");
const start = raw.indexOf("ᛋᚻᛖᚩᚷ");
assert(start >= 0);
const sections = raw.slice(start).split("%").slice(0, 56).join("%")
  .split("$").map((s) => [...s].filter((x) => index.has(x))).filter((a) => a.length);
assert.deepEqual(sections.map((a) => a.length), [729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316]);
const titles = [13, 16, 12, 11, 16, 19, 8, 8];
const bodies = [0, 1, 2, 4, 5, 6, 7, 8].map((j, i) => sections[j]
  .slice(titles[i]).map((r) => index.get(r)));
assert.deepEqual(bodies.map((a) => a.length), [716, 1129, 1717, 1883, 1005, 1505, 1581, 3308]);
assert.equal(bodies.reduce((a, b) => a + b.length, 0), 12844);
assert.equal(grid.byte_rows.length, 32);
const rows = grid.byte_rows;
const flattened = {
  row: rows.flat(),
  column: rows[0].map((_, j) => rows.map((r) => r[j])).flat(),
};
const columns = Array.from({ length: 8 }, (_, j) => rows.map((r) => r[j]));
const pow15 = [], log15 = Array(29).fill(-1);
for (let value = 1, i = 0; i < 28; i++, value = value * 15 % 29) {
  pow15.push(value);
  log15[value] = i;
}
assert.equal(new Set(pow15).size, 28);
const mod = (v, m) => (v % m + m) % m;

/** Convert source Latin text to the original 29-symbol Gematria Primus indices. */
function toGP(input) {
  const out = [];
  for (let w of (input.toUpperCase().match(/[A-Z]+/g) || [])) {
    w = w.replace(/QU/g, "CW").replace(/V/g, "U").replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < w.length;) {
      const pair = w.slice(i, i + 2);
      if (gp.has(pair)) { out.push(gp.get(pair)); i += 2; }
      else { if (gp.has(w[i])) out.push(gp.get(w[i])); i++; }
    }
  }
  return out;
}
const shakespeare = read("resources/control/shakespeare_first300k.txt");
const trainingSource = toGP(shakespeare.slice(0, 190000));
const heldoutSource = toGP(shakespeare.slice(195000));
const authorSource = toGP(read("resources/liber-primus/lp1-plaintext-reference.txt")
  .split("\n").filter((s) => !/^(#|\[|[0-9 ]+$)/.test(s.trim())).join(" "));
assert(trainingSource.length > 100000 && heldoutSource.length > 50000 && authorSource.length > 2500);
const counts = Array(29).fill(0.5);
trainingSource.forEach((p) => counts[p]++);
const total = counts.reduce((a, b) => a + b, 0);
const logOdds = counts.map((n) => Math.log(29 * n / total));
const modes = ["row", "column", "sectionColumn"].flatMap((order) =>
  ["mod29", "scale29", "mod28"].flatMap((reducer) =>
    [false, true].flatMap((add24) => [1, -1].map((sign) =>
      ({ order, reducer, add24, sign })))));
assert.equal(modes.length, 36);

/** @param {{order:string,reducer:string,add24:boolean,sign:number}} mode */
function byteDrive(mode, section, i) {
  const key = mode.order === "sectionColumn" ? columns[section] : flattened[mode.order];
  const byte = key[i % key.length];
  return mode.reducer === "mod29" ? byte % 29
    : mode.reducer === "scale29" ? Math.floor(29 * byte / 256) : byte % 28;
}
/** Coefficient recurrence K_i = A_i * s_(i mod 6) + B_i (mod29). */
function matrices(mode, section, n) {
  const A = Array(n), B = Array(n);
  for (let i = 0; i < n; i++) {
    if (i < 6) { A[i] = 1; B[i] = 0; }
    else {
      A[i] = mod(-2 * A[i - 6], 29);
      B[i] = mod(-2 * B[i - 6] + (mode.add24 ? 24 : 0)
        + byteDrive(mode, section, i), 29);
    }
  }
  return { A, B };
}
/**
 * Recover six secret seeds independently using only the training prefix.
 * Keeps a disjoint 200-rune genuine original ciphertext suffix per section.
 */
function inverse(cipher, mode, section) {
  const n = Math.min(1000, cipher.length), fit = n - 200;
  const { A, B } = matrices(mode, section, n);
  const ranks = cipher.slice(0, n).map((current, i) => {
    const diff = mod(current - (i > 0 ? cipher[i - 1] : 0), 29);
    return diff === 0 ? 28 : log15[diff];
  });
  const seeds = [], plaintext = Array(n);
  for (let lane = 0; lane < 6; lane++) {
    let high = -Infinity, winner = 0;
    for (let seed = 0; seed < 29; seed++) {
      let likelihood = 0;
      for (let i = lane; i < fit; i += 6) {
        if (ranks[i] === 28) continue;
        const key = mod(A[i] * seed + B[i], 29) % 28;
        likelihood += logOdds[mod(ranks[i] - mode.sign * key, 28)];
      }
      if (likelihood > high) { high = likelihood; winner = seed; }
    }
    seeds.push(winner);
    for (let i = lane; i < n; i += 6) {
      const key = mod(A[i] * winner + B[i], 29) % 28;
      plaintext[i] = ranks[i] === 28 ? 28 : mod(ranks[i] - mode.sign * key, 28);
    }
  }
  const logScore = (a, b) => plaintext.slice(a, b)
    .reduce((sum, value) => sum + logOdds[value], 0) / (b - a);
  const train = logScore(0, fit), holdout = logScore(fit, n);
  assert(Number.isFinite(train) && Number.isFinite(holdout));
  return { train, holdout, plaintext, seeds, n, fit };
}
function evaluate(mode, ciphertexts) {
  const outputs = ciphertexts.map((p, i) => inverse(p, mode, i));
  return {
    mode,
    train: outputs.reduce((sum, x) => sum + x.train, 0) / 8,
    holdout: outputs.reduce((sum, x) => sum + x.holdout, 0) / 8,
    page0: outputs[0].plaintext.slice(0, 80).map((p) => corpus.translit[p]).join(""),
    sections: outputs.map((x) => ({ fit: x.fit, holdout: x.holdout })),
  };
}
let rng = 0x27657915;
function random() {
  rng ^= rng << 13;
  rng ^= rng >>> 17;
  rng ^= rng << 5;
  return rng >>> 0;
}
function rand(n) { return random() % n; }
/** Encrypt a true hidden-seed plant and check end-to-end recovered symbols. */
function plant(source, mode) {
  const ciphertexts = [], originals = [];
  for (let section = 0; section < 8; section++) {
    const n = Math.min(1000, bodies[section].length);
    const start = rand(source.length - n);
    const plaintext = source.slice(start, start + n);
    const seeds = Array.from({ length: 6 }, () => rand(29));
    const { A, B } = matrices(mode, section, n);
    let previous = 0;
    const ciphertext = [];
    for (let i = 0; i < n; i++) {
      const key = mod(A[i] * seeds[i % 6] + B[i], 29) % 28;
      const cipher = plaintext[i] === 28 ? previous
        : mod(previous + pow15[mod(plaintext[i] + mode.sign * key, 28)], 29);
      ciphertext.push(cipher);
      previous = cipher;
    }
    ciphertexts.push(ciphertext);
    originals.push({ plaintext, seeds });
  }
  return { ciphertexts, originals };
}
function positive(source, mode) {
  const sample = plant(source, mode);
  const ranks = modes.map((candidate) => evaluate(candidate, sample.ciphertexts))
    .sort((a, b) => b.train - a.train);
  let recovered = 0, total = 0;
  for (let section = 0; section < 8; section++) {
    const result = inverse(sample.ciphertexts[section], mode, section);
    recovered += result.plaintext.filter((x, i) =>
      x === sample.originals[section].plaintext[i]).length;
    total += result.n;
    // Forward original-cipher exact reencryption with fitted state.
    const { A, B } = matrices(mode, section, result.n);
    let previous = 0;
    for (let i = 0; i < result.n; i++) {
      const key = mod(A[i] * result.seeds[i % 6] + B[i], 29) % 28;
      const enc = result.plaintext[i] === 28 ? previous
        : mod(previous + pow15[mod(result.plaintext[i] + mode.sign * key, 28)], 29);
      assert.equal(enc, sample.ciphertexts[section][i]);
      previous = enc;
    }
  }
  return { mode, recovered, total, sourceRank: 1 + ranks.findIndex((v) =>
    JSON.stringify(v.mode) === JSON.stringify(mode)),
    sourceTrain: ranks.find((v) => JSON.stringify(v.mode) === JSON.stringify(mode)).train,
    sourceHoldout: ranks.find((v) => JSON.stringify(v.mode) === JSON.stringify(mode)).holdout,
    nextBestTrain: ranks[1].train };
}
function main() {
  const authentic = modes.map((mode) => evaluate(mode, bodies))
    .sort((a, b) => b.train - a.train);
  const top = authentic[0], hindsight = [...authentic].sort((a, b) => b.holdout - a.holdout)[0];
  const trueMode = modes.find((m) => m.order === "row" &&
    m.reducer === "scale29" && m.add24 && m.sign === 1);
  const planted = positive(heldoutSource, trueMode);
  const authorPlanted = positive(authorSource, trueMode);
  assert.equal(planted.recovered, planted.total);
  assert.equal(planted.sourceRank, 1);
  assert.equal(authorPlanted.recovered, authorPlanted.total);
  assert.equal(authorPlanted.sourceRank, 1);
  console.log(JSON.stringify({
    title: "Lossless six-lane source-grid F29 recurrence, frozen authentic ciphertext holdout",
    originalBodies: bodies.map((x) => x.length), variants: modes.length,
    seed: "0x27657915", heldoutPerSection: 200,
    genuineOriginal: { topTraining: top, top3Training: authentic.slice(0, 3),
      topHoldoutHindsightOnly: hindsight },
    positiveShakespeare: planted, positiveSolvedCicada: authorPlanted,
    conclusion: "No original GP plaintext or authentic recurrence/key identified",
  }, null, 2));
}
main();
