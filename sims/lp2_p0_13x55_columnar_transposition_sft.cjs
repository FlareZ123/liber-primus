#!/usr/bin/env node
"use strict";

// Test the simplest keyworded columnar transposition selected by the original
// p0 13-rune red title and its independently derived 13-dot title ordering.
// Input is the fixed 715-rune payload after the red title and black TH sentinel:
// p0 remainder + p1 + p2 = 55 x 13. No key fitting or phase search.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
function gitBlobSha(content) {
  const normalized = Buffer.from(content.replace(/\r\n/g, "\n"), "utf8");
  const header = Buffer.from("blob " + normalized.length + "\0", "utf8");
  return crypto.createHash("sha1").update(header).update(normalized).digest("hex");
}
const corpusText = read("resources/liber-primus/lp2-corpus.json");
const quadText = read("resources/control/dukotah_english_quadgrams.txt");
const lp1Text = read("resources/liber-primus/lp1-plaintext-reference.txt");
const sourceBlobs = {
  corpus: gitBlobSha(corpusText),
  quadgrams: gitBlobSha(quadText),
  lp1Plaintext: gitBlobSha(lp1Text)
};
assert.deepEqual(sourceBlobs, {
  corpus: "054f2a0f780b7d46901acbe3d9bf4f0ac1801165",
  quadgrams: "da56c2e11e004ad24454750dba8fbe2e19abbc71",
  lp1Plaintext: "8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d"
});

const corpus = JSON.parse(corpusText);
const pages = corpus.pages;
const translit = corpus.translit;
assert.deepEqual(pages.slice(0, 3).map((p) => p.runic_count), [262, 266, 201]);
const title = pages[0].indices.slice(0, 13);
const sentinel = pages[0].indices[13];
assert.equal(title.map((i) => translit[i]).join(""), "SHEOGMIAFSYENGC");
assert.equal(translit[sentinel], "TH");
const payload = pages[0].indices.slice(14).concat(pages[1].indices, pages[2].indices);
assert.equal(payload.length, 715);
assert.equal(payload.length, 55 * 13);

const dotRoutePermutation = [8, 0, 1, 9, 2, 3, 10, 4, 5, 11, 6, 7, 12];
const dotKey = dotRoutePermutation.map((i) => title[i]);
assert.deepEqual(dotKey, [15, 15, 8, 26, 18, 3, 18, 6, 19, 21, 27, 0, 5]);
assert.equal(dotKey.map((i) => translit[i]).join(""), "SSHYEOEGMNGIAFC");
const keysets = [["raw-title", title], ["dot-routed-title", dotKey]];

const quadgrams = new Map();
let quadTotal = 0;
for (const line of quadText.trim().split(/\r?\n/u)) {
  const m = line.trim().match(/^([A-Z]{4})\s+(\d+)$/u);
  if (m) {
    const n = Number(m[2]);
    quadgrams.set(m[1], n);
    quadTotal += n;
  }
}
assert.equal(quadgrams.size, 79495);
assert.equal(quadTotal, 7266795);
const missingQuadgramFloor = 0.01;

function toLetters(sequence) {
  return sequence.map((i) => translit[i]).join("").replace(/[^A-Z]/gu, "");
}
function score(sequence) {
  const letters = toLetters(sequence);
  let sum = 0;
  let unseen = 0;
  let n = 0;
  for (let i = 0; i + 4 <= letters.length; i++) {
    const gram = letters.slice(i, i + 4);
    const count = quadgrams.get(gram);
    if (count === undefined) unseen++;
    sum += Math.log10((count === undefined ? missingQuadgramFloor : count) / quadTotal);
    n++;
  }
  return {
    mean_log10_per_quadgram: sum / n,
    unseen_fraction: unseen / n,
    letter_count: letters.length,
    latin_prefix_100: letters.slice(0, 100),
    gp_prefix_35: sequence.slice(0, 35).map((i) => translit[i]).join(" ")
  };
}

function encryptColumnar(plain, columns) {
  const out = [];
  for (const c of columns) {
    for (let r = 0; r < 55; r++) out.push(plain[r * 13 + c]);
  }
  return out;
}
function decryptColumnar(cipher, columns) {
  const matrix = Array.from({ length: 55 }, () => Array(13));
  let k = 0;
  for (const c of columns) {
    for (let r = 0; r < 55; r++) matrix[r][c] = cipher[k++];
  }
  return matrix.flat();
}
function columnOrder(key, reverse) {
  const ascending = Array.from({ length: 13 }, (_, i) => i)
    .sort((a, b) => key[a] - key[b] || a - b);
  return reverse ? ascending.slice().reverse() : ascending;
}
function rankAgainst(scoreValue, sample) {
  const ge = sample.filter((x) => x >= scoreValue).length;
  const sorted = sample.slice().sort((a, b) => a - b);
  return {
    greater_or_equal: ge,
    samples: sample.length,
    uncorrected_empirical_upper_tail_p: (ge + 1) / (sample.length + 1),
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    max: sorted[sorted.length - 1]
  };
}

// A native solved-LP1 positive control, normalized with the same GP29
// orthographic folds and longest-first digraph matching used by the model.
const nativeLetters = lp1Text.toUpperCase()
  .replace(/[^A-Z]/gu, "")
  .replace(/[KQ]/gu, "C")
  .replace(/V/gu, "U")
  .replace(/Z/gu, "S");
const digraphs = ["TH", "NG", "EO", "OE", "AE", "IA"];
const singles = ["F", "U", "O", "R", "C", "G", "W", "H", "N", "I", "J",
  "P", "X", "S", "T", "B", "E", "M", "L", "D", "A", "Y"];
const tokens = digraphs.concat(singles).sort((a, b) => b.length - a.length);
const tokenIndex = new Map(tokens.map((t) => [t, translit.indexOf(t)]));
const nativeTokens = [];
for (let i = 0; i < nativeLetters.length;) {
  let hit = null;
  for (const token of tokens) {
    if (nativeLetters.startsWith(token, i)) { hit = token; break; }
  }
  if (hit !== null) {
    nativeTokens.push(tokenIndex.get(hit));
    i += hit.length;
  } else {
    i++;
  }
}
assert.equal(nativeTokens.length, 3970);
const nativeControl = nativeTokens.slice(0, 715);
const nativeControlScore = score(nativeControl);

const positiveControls = [];
for (const [keyName, key] of keysets) {
  for (const reverse of [false, true]) {
    const columns = columnOrder(key, reverse);
    const encrypted = encryptColumnar(nativeControl, columns);
    const recovered = decryptColumnar(encrypted, columns);
    assert.deepEqual(recovered, nativeControl);
    positiveControls.push({
      key: keyName,
      order: reverse ? "reverse-stable-sort" : "stable-ascending",
      exact_roundtrip: true,
      source_score: nativeControlScore.mean_log10_per_quadgram,
      recovered_score: score(recovered).mean_log10_per_quadgram
    });
  }
}

// The fixed key orders are compared with a reproducible, uniformly sampled
// null over all 13-column permutations. This calibrates the fixed candidates;
// it is not a search for a better key.
let rngState = 0x3301;
function random01() {
  rngState ^= rngState << 13;
  rngState ^= rngState >>> 17;
  rngState ^= rngState << 5;
  return (rngState >>> 0) / 4294967296;
}
function shuffledColumns() {
  const out = Array.from({ length: 13 }, (_, i) => i);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random01() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
const inverseNull = [];
const forwardNull = [];
for (let i = 0; i < 5000; i++) {
  const columns = shuffledColumns();
  inverseNull.push(score(decryptColumnar(payload, columns)).mean_log10_per_quadgram);
  forwardNull.push(score(encryptColumnar(payload, columns)).mean_log10_per_quadgram);
}
const candidates = [];
for (const [keyName, key] of keysets) {
  for (const reverse of [false, true]) {
    const columns = columnOrder(key, reverse);
    for (const [direction, decoded] of [
      ["inverse", decryptColumnar(payload, columns)],
      ["forward", encryptColumnar(payload, columns)]
    ]) {
      assert.equal(decoded.length, 715);
      const candidateScore = score(decoded);
      const nullSample = direction === "inverse" ? inverseNull : forwardNull;
      candidates.push({
        key: keyName,
        order: reverse ? "reverse-stable-sort" : "stable-ascending",
        direction,
        columns,
        ...candidateScore,
        random_column_order_rank: rankAgainst(
          candidateScore.mean_log10_per_quadgram, nullSample
        )
      });
    }
  }
}
const best = candidates.reduce((a, b) =>
  a.mean_log10_per_quadgram > b.mean_log10_per_quadgram ? a : b
);
const output = {
  experiment: "p0 13+1+55x13 title-keyed columnar transposition",
  decision: "no_language_signal",
  source_blobs: sourceBlobs,
  input: {
    p0_p1_p2_rune_counts: [262, 266, 201],
    red_title: title.map((i) => translit[i]).join(""),
    first_black_sentinel: translit[sentinel],
    payload_runes: payload.length,
    matrix_shape: [55, 13],
    dot_route_permutation: dotRoutePermutation,
    dot_routed_key: dotKey.map((i) => translit[i]).join(""),
    quadgram_count: quadgrams.size,
    quadgram_total: quadTotal,
    missing_quadgram_floor: missingQuadgramFloor
  },
  null: {
    method: "uniform random permutation of 13 columns; xorshift32",
    seed_hex: "0x3301",
    samples: 5000,
    inverse: rankAgainst(-Infinity, inverseNull),
    forward: rankAgainst(-Infinity, forwardNull)
  },
  native_lp1_positive_control: {
    mapped_gp29_tokens: nativeTokens.length,
    window_tokens: nativeControl.length,
    score: nativeControlScore.mean_log10_per_quadgram,
    unseen_fraction: nativeControlScore.unseen_fraction,
    roundtrips: positiveControls
  },
  candidates,
  best_fixed_candidate: best
};
const json = JSON.stringify(output, null, 2) + "\n";
console.log(json);
if (process.env.RUNNER_TEMP) {
  fs.writeFileSync(path.join(process.env.RUNNER_TEMP, "source-test-output.json"), json, "utf8");
}
