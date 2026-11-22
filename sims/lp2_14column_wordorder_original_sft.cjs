"use strict";
/**
 * Original LP2 word-order inversion test using Cicada's historically used
 * 14-column transposition width. Two frozen, reversible word-token layouts:
 * repeated fourteen-word row permutations, and full-column readout of
 * each chapter's complete 14-word rows with a literal untouched remainder.
 *
 * Training: first five printed chapters. Held-out: remaining four.
 * Key search: exact Held-Karp path DP over all fourteen column orders.
 * Positive: source-native Gibran words encrypted under a planted permutation.
 * Null: 25/35 whole-source chapter-shuffled controls, complete refits.
 *
 * Run: node sims/lp2_14column_wordorder_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const raw = read("resources/liber-primus/lp2-transcription.txt");
const sourceTexts = [
  read("resources/control/gibran_prophet_58585.txt"),
  read("resources/control/shakespeare_first300k.txt"),
];
const CH = [158, 255, 383, 437, 224, 326, 378, 669, 66];
const COLUMNS = 14, K = 12;
const runes = new Set(gp.runes);
const tokenNames = gp.translit.slice().sort((a, b) => b.length - a.length);
const clamp = n => Math.min(K, n) - 1;
const identity = Array.from({length: COLUMNS}, (_, i) => i);
const secret = [0, 4, 9, 2, 12, 6, 5, 11, 7, 10, 1, 3, 8, 13];
const trueInverse = identity.map(i => secret.indexOf(i));

/** @returns {number[]} Actual printed GP-rune word lengths, no page carry cut. */
function originalWords() {
  const lengths = [];
  let current = 0;
  for (const ch of raw) {
    if (runes.has(ch)) current++;
    else if ((ch === "-" || ch === "." || ch === "&") && current) {
      lengths.push(current);
      current = 0;
    }
    if (lengths.length === 2896) break;
  }
  assert.equal(lengths.length, 2896);
  assert.equal(lengths.reduce((a, b) => a + b, 0), 12956);
  return lengths;
}

/** @param {string} word English token, with Cicada's GP29 conventions. */
function englishRuneLength(word) {
  const text = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  let length = 0;
  for (let i = 0; i < text.length;) {
    const width = text.startsWith("ING", i) ? 3
      : text.startsWith("IO", i) ? 2
      : (tokenNames.find(t => text.startsWith(t, i)) || "").length;
    assert.ok(width > 0, text);
    i += width;
    length++;
  }
  return length;
}
const native = sourceTexts.map(s =>
  (s.match(/[A-Za-z]+/g) || []).map(englishRuneLength));
assert.deepEqual(native.map(s => s.length), [15733, 55407]);

/** @param {number[]} a Split into nine fixed original printed chapters. */
function chapters(a) {
  let offset = 0;
  return CH.map(n => {
    const out = a.slice(offset, offset + n);
    offset += n;
    return out;
  });
}

/** @param {number[]} a Complete 14-token contiguous rows. */
function blockRows(a) {
  const out = [];
  for (let i = 0; i + COLUMNS <= a.length; i += COLUMNS) {
    out.push(a.slice(i, i + COLUMNS));
  }
  return out;
}

/** @param {number[]} a Complete 14-column readout, by printed column blocks. */
function columnRows(a) {
  const height = Math.floor(a.length / COLUMNS);
  return Array.from({length: height}, (_, r) =>
    identity.map(col => a[col * height + r]));
}

/** @param {number[]} a @param {number[]} order */
function encryptPlant(a, order, mode) {
  const height = Math.floor(a.length / COLUMNS);
  const body = a.slice(0, height * COLUMNS);
  const out = [];
  if (mode === "block") {
    for (const row of blockRows(body)) out.push(...order.map(i => row[i]));
  } else {
    for (const col of order)
      for (let r = 0; r < height; r++) out.push(body[r * COLUMNS + col]);
  }
  return out.concat(a.slice(height * COLUMNS));
}

/** Source-native observed GP word-length bigram log evidence vs iid lengths. */
function evidenceTable() {
  const count = new Float64Array(K * K);
  const left = new Float64Array(K), right = new Float64Array(K);
  let total = 0;
  for (const seq of native) for (let i = 1; i < seq.length; i++) {
    const x = clamp(seq[i - 1]), y = clamp(seq[i]);
    count[x * K + y]++;
    left[x]++;
    right[y]++;
    total++;
  }
  const smoothing = 1.3;
  return Array.from({length: K * K}, (_, at) => {
    const x = Math.floor(at / K), y = at % K;
    return Math.log((count[at] + smoothing) / (left[x] + K * smoothing))
      - Math.log((right[y] + K * smoothing)
        / (total + K * K * smoothing));
  });
}
const logEvidence = evidenceTable();

/** @param {number[][]} rows @param {number[]} order @returns {number} */
function score(rows, order) {
  let value = 0;
  for (const row of rows) for (let j = 1; j < COLUMNS; j++) {
    value += logEvidence[
      clamp(row[order[j - 1]]) * K + clamp(row[order[j]])];
  }
  return value;
}

/**
 * Unrestricted exact 14-column Hamiltonian path, fitted ONLY to training rows.
 * @param {number[][]} rows
 * @returns {{order:number[], best:number}}
 */
function optimal(rows) {
  const n = COLUMNS, full = 1 << n;
  const w = Array.from({length: n}, () => new Float64Array(n));
  for (const row of rows)
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if (i !== j) w[i][j] += logEvidence[
        clamp(row[i]) * K + clamp(row[j])];
    }
  const dp = new Float64Array(full * n).fill(-1e100);
  const prev = new Int8Array(full * n).fill(-1);
  for (let i = 0; i < n; i++) dp[(1 << i) * n + i] = 0;
  for (let mask = 1; mask < full; mask++) {
    for (let i = 0; i < n; i++) {
      if (!(mask & (1 << i))) continue;
      const current = dp[mask * n + i];
      if (current < -1e90) continue;
      for (let j = 0; j < n; j++) {
        if (mask & (1 << j)) continue;
        const at = (mask | (1 << j)) * n + j;
        const next = current + w[i][j];
        if (next > dp[at]) {
          dp[at] = next;
          prev[at] = i;
        }
      }
    }
  }
  let best = -1e100, last = -1;
  for (let i = 0; i < n; i++) {
    const value = dp[(full - 1) * n + i];
    if (value > best) {best = value; last = i;}
  }
  let mask = full - 1;
  const order = [];
  while (mask) {
    order.push(last);
    const prior = prev[mask * n + last];
    mask ^= 1 << last;
    last = prior;
  }
  return {order: order.reverse(), best};
}

/** Seeded null generator, with all rows refitted in each trial. */
function randomGenerator(initial) {
  let seed = initial >>> 0;
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}
function fullNull(source, mode, count, seed) {
  const random = randomGenerator(seed);
  const rower = mode === "block" ? blockRows : columnRows;
  const values = [];
  for (let trial = 0; trial < count; trial++) {
    const shuffled = chapters(source).map(wordLengths => {
      const a = wordLengths.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    });
    const rows = shuffled.map(rower);
    const train = rows.slice(0, 5).flat(), hold = rows.slice(5).flat();
    const order = optimal(train).order;
    values.push(score(hold, order) - score(hold, identity));
  }
  return values;
}
const source = originalWords();
for (const [mode, rower, nullCount, seed, target, exceed] of [
  ["block", blockRows, 25, 0x33011427, 3.5137630193529716, 9],
  ["column", columnRows, 35, 0x33011433, 8.064033975507542, 8],
]) {
  const rows = chapters(source).map(rower);
  const train = rows.slice(0, 5).flat(), hold = rows.slice(5).flat();
  const fitted = optimal(train);
  const gain = score(hold, fitted.order) - score(hold, identity);
  assert.ok(Math.abs(gain - target) < 1e-7, mode + " source drift");
  const nulls = fullNull(source, mode, nullCount, seed);
  assert.equal(nulls.filter(n => n >= gain).length, exceed);
  const nativePlants = native.map(plain => {
    const slices = chapters(plain.slice(2000, 2000 + 2896));
    const cipher = slices.map(slice => encryptPlant(slice, secret, mode));
    const plantedRows = cipher.map(rower);
    const training = plantedRows.slice(0, 5).flat();
    const held = plantedRows.slice(5).flat();
    const best = optimal(training);
    return {
      correctColumns: best.order.filter((v, i) => v === trueInverse[i]).length,
      recoveredHeldout: score(held, best.order),
      trueHeldout: score(held, trueInverse),
      printedHeldout: score(held, identity),
    };
  });
  assert.equal(nativePlants[0].correctColumns, COLUMNS,
    "Real Gibran GP word-order plant must recover its complete secret");
  console.log(JSON.stringify({
    mode, trainingRows: train.length, withheldRows: hold.length,
    sourceOrder: fitted.order, originalHeldoutGain: gain,
    sourceTrainGain: fitted.best - score(train, identity),
    nulls: nullCount, nullAtLeastOriginal: exceed,
    empiricalUpperTail: (exceed + 1) / (nullCount + 1),
    nativePlants,
  }, null, 2));
}
console.log("PASS: original source heldouts, exact 14-column search, source-English plants, full-search matched nulls");
