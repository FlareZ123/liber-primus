"use strict";
/**
 * Original-input key-independent GP29 ciphertext-context substitution gate.
 * Run from repository root: node sims/lp2_highorder_cipher_context_entropy_sft.cjs
 *
 * C_i = permutation[C_(i-k)..C_(i-1)](P_i), with one stationary, secret,
 * independent 29-symbol permutation per k-ciphertext-rune context.
 * Full within-page histories only; the first k runes of each page are free.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length);
const ciphertext = pages.flatMap((p) => p.indices);
const N = ciphertext.length;
assert.equal(N, 12956);
assert.equal(pages.length, 55);
const pageStarts = [];
let total = 0;
for (const p of pages) {
  pageStarts.push([total, p.indices.length]);
  total += p.indices.length;
}
assert.equal(total, N);

/** @param {number} k @param {number[]} output @param {number[]} context */
function measure(k, output, context = output) {
  const groups = new Map();
  let n = 0;
  for (const [start, len] of pageStarts) {
    for (let j = k; j < len; j++) {
      const i = start + j;
      let state = 0;
      for (let h = i - k; h < i; h++) state = state * 29 + context[h];
      let row = groups.get(state);
      if (row === undefined) {
        row = new Uint16Array(29);
        groups.set(state, row);
      }
      row[output[i]]++;
      n++;
    }
  }
  let entropy = 0;
  let collisions = 0;
  let pairs = 0;
  for (const row of groups.values()) {
    let m = 0;
    for (const x of row) m += x;
    pairs += m * (m - 1) / 2;
    for (const x of row) {
      collisions += x * (x - 1) / 2;
      if (x) entropy -= x / n * Math.log2(x / m);
    }
  }
  return { n, states: groups.size, pairs, collisions, entropy };
}

/**
 * Exact histogram-relaxation lower bound on Hamming edits needed to match
 * a fixed candidate plaintext under secret per-context symbol bijections.
 *
 * Sorted frequency vectors minimize edits to statewise histograms, while
 * ignoring the original within-state positional co-occurrences. The true
 * positional Hamming minimum can be strictly larger and requires a separate
 * maximum-weight 29x29 assignment per context.
 * @param {number} k
 * @param {number[]} candidate
 */
function histogramEditLowerBound(k, candidate) {
  const originalRows = new Map();
  const candidateRows = new Map();
  for (const [start, len] of pageStarts) {
    for (let j = k; j < len; j++) {
      const i = start + j;
      let context = 0;
      for (let h = i - k; h < i; h++) {
        context = context * 29 + ciphertext[h];
      }
      if (!originalRows.has(context)) {
        originalRows.set(context, new Uint16Array(29));
        candidateRows.set(context, new Uint16Array(29));
      }
      originalRows.get(context)[ciphertext[i]]++;
      candidateRows.get(context)[candidate[i]]++;
    }
  }
  let edits = 0;
  for (const [state, row] of originalRows) {
    const a = Array.from(row).sort((u, v) => v - u);
    const b = Array.from(candidateRows.get(state)).sort((u, v) => v - u);
    for (let j = 0; j < 29; j++) edits += Math.abs(a[j] - b[j]);
  }
  assert.equal(edits % 2, 0);
  return edits / 2;
}


/**
 * Exact minimum positional changes for one fixed ciphertext-history state
 * when any secret 29-symbol bijection is permitted. The maximum-weight
 * assignment uses the observed ciphertext symbols as the smaller side.
 * This is an exact Hamming optimum, unlike sorted-histogram relaxation.
 * @param {number[]} positions
 * @param {number[]} observed
 * @param {number[]} candidate
 * @returns {number}
 */
function statePositionalEdits(positions, observed, candidate) {
  const forward = new Int16Array(29).fill(-1);
  const reverse = new Int16Array(29).fill(-1);
  let compatible = true;
  for (const pos of positions) {
    const a = observed[pos], b = candidate[pos];
    if ((forward[a] >= 0 && forward[a] !== b) ||
        (reverse[b] >= 0 && reverse[b] !== a)) {
      compatible = false;
      break;
    }
    forward[a] = b;
    reverse[b] = a;
  }
  if (compatible) return 0;

  const counts = Array.from({ length: 29 }, () => new Uint16Array(29));
  const used = new Uint8Array(29);
  for (const pos of positions) {
    used[observed[pos]] = 1;
    counts[observed[pos]][candidate[pos]]++;
  }
  const rows = [];
  for (let a = 0; a < 29; a++) if (used[a]) rows.push(a);
  const n = rows.length, m = 29;
  const u = new Float64Array(n + 1);
  const v = new Float64Array(m + 1);
  const assigned = new Int16Array(m + 1);
  const parent = new Int16Array(m + 1);
  // Rectangular Hungarian algorithm, cost = -cooccurrence.
  for (let a = 1; a <= n; a++) {
    assigned[0] = a;
    const minCosts = new Float64Array(m + 1).fill(Infinity);
    const seen = new Uint8Array(m + 1);
    let j0 = 0;
    do {
      seen[j0] = 1;
      const i0 = assigned[j0];
      let delta = Infinity, j1 = 0;
      for (let j = 1; j <= m; j++) {
        if (seen[j]) continue;
        const cost = -counts[rows[i0 - 1]][j - 1] - u[i0] - v[j];
        if (cost < minCosts[j]) {
          minCosts[j] = cost;
          parent[j] = j0;
        }
        if (minCosts[j] < delta) {
          delta = minCosts[j];
          j1 = j;
        }
      }
      for (let j = 0; j <= m; j++) {
        if (seen[j]) {
          u[assigned[j]] += delta;
          v[j] -= delta;
        } else {
          minCosts[j] -= delta;
        }
      }
      j0 = j1;
    } while (assigned[j0] !== 0);

    do {
      const previous = parent[j0];
      assigned[j0] = assigned[previous];
      j0 = previous;
    } while (j0 !== 0);
  }

  let matches = 0;
  for (let j = 1; j <= m; j++) {
    if (assigned[j]) matches += counts[rows[assigned[j] - 1]][j - 1];
  }
  return positions.length - matches;
}

/**
 * Exact GP29 ciphertext-context-position Hamming minimum over all unknown
 * stationary 29-symbol permutations, one per observed k-history context.
 * All first-k original-page runes are intentionally unconstrained.
 * @param {number} k
 * @param {number[]} candidate
 * @param {number[]} observed
 * @returns {number}
 */
function positionalEditMinimum(k, candidate, observed = ciphertext) {
  const groups = new Map();
  for (const [start, len] of pageStarts) {
    for (let j = k; j < len; j++) {
      const i = start + j;
      let state = 0;
      for (let h = i - k; h < i; h++) {
        state = state * 29 + observed[h];
      }
      let positions = groups.get(state);
      if (positions === undefined) {
        positions = [];
        groups.set(state, positions);
      }
      positions.push(i);
    }
  }
  let edits = 0;
  for (const positions of groups.values()) {
    edits += statePositionalEdits(positions, observed, candidate);
  }
  return edits;
}

// Positional relabeling can require edits despite identical state histograms.
{
  const toyCipher = [0, 1, 0, 1];
  const toyTarget = [0, 0, 1, 1];
  assert.equal(toyCipher.filter((x) => x === 0).length,
    toyTarget.filter((x) => x === 0).length); // histogram bound: zero
  const posEdits = [[0, 1], [1, 0]].map((key) =>
    toyCipher.reduce((n, x, i) => n + (key[x] !== toyTarget[i] ? 1 : 0), 0));
  assert.deepEqual(posEdits, [2, 2]);
  assert.equal(statePositionalEdits([0, 1, 2, 3], toyCipher, toyTarget), 2);
  assert.equal(statePositionalEdits([0, 1, 2, 3], toyCipher, toyCipher), 0);
  assert.equal(statePositionalEdits([0, 1, 2], [0, 0, 0], [0, 1, 2]), 2);
  assert.equal(statePositionalEdits([0, 1, 2], [0, 1, 2], [0, 0, 0]), 2);
}

const tokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
/** @param {string} original */
function encodeNativeGP(original) {
  const text = original.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const result = [];
  for (const word of text.match(/[A-Z]+/g) || []) {
    for (let pos = 0; pos < word.length;) {
      const tok = tokens.find((t) => word.startsWith(t.s, pos));
      assert(tok, "unmapped native GP token");
      result.push(tok.i);
      pos += tok.s.length;
    }
  }
  return result;
}
const corpora = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt", 32],
  ["Gibran", "resources/control/gibran_prophet_58585.txt", 8],
  ["Emerson", "resources/control/emerson_essays_2944.txt", 49]
];
const native = corpora.map(([name, file, expectedWindows]) => {
  const runes = encodeNativeGP(read(file));
  const blocks = [];
  for (let start = 0; start + N <= runes.length; start += Math.floor(N / 2)) {
    blocks.push(runes.slice(start, start + N));
  }
  assert.equal(blocks.length, expectedWindows, name);
  return { name, runes, blocks };
});

const original = {};
const controls = {};
for (const k of [2, 3, 4]) {
  original[k] = measure(k, ciphertext);
  assert.equal(original[k].n, N - 55 * k);
  controls[k] = {};
  for (const item of native) {
    const samples = item.blocks.map((b) => measure(k, b, ciphertext));
    const bounds = item.blocks.map((b) => histogramEditLowerBound(k, b));
    const positional = item.blocks.map((b) => positionalEditMinimum(k, b));
    for (let i = 0; i < bounds.length; i++) {
      assert(positional[i] >= bounds[i]);
    }
    bounds.sort((a, b) => a - b);
    positional.sort((a, b) => a - b);
    controls[k][item.name] = {
      windows: samples.length,
      entropyMin: Math.min(...samples.map((s) => s.entropy)),
      entropyMax: Math.max(...samples.map((s) => s.entropy)),
      collisionMin: Math.min(...samples.map((s) => s.collisions)),
      collisionMax: Math.max(...samples.map((s) => s.collisions)),
      minimumHistogramEditLowerBound: bounds[0],
      medianHistogramEditLowerBound: bounds[Math.floor(bounds.length / 2)],
      maximumHistogramEditLowerBound: bounds.at(-1),
      minimumExactPositionalEdits: positional[0],
      medianExactPositionalEdits: positional[Math.floor(positional.length / 2)],
      maximumExactPositionalEdits: positional.at(-1)
    };
    if (k <= 3) {
      assert(controls[k][item.name].entropyMax < original[k].entropy);
      assert(controls[k][item.name].collisionMin > original[k].collisions);
    }
  }
}
assert.equal(original[2].states, 840);
assert.equal(original[2].pairs, 100584);
assert.equal(original[2].collisions, 3511);
assert(Math.abs(original[2].entropy - 3.5154985175171056) < 1e-11);
assert.equal(original[3].states, 9860);
assert.equal(original[3].pairs, 3473);
assert.equal(original[3].collisions, 124);
assert(Math.abs(original[3].entropy - 0.4696234031881363) < 1e-11);
assert.equal(original[4].collisions, 6);
assert.equal(original[4].pairs, 122);
// Source-fixed registers: all 89 exact ciphertext-context assignments.
assert.equal(Math.min(...Object.values(controls[2]).map((v) => v.minimumExactPositionalEdits)), 4738);
assert.equal(Math.min(...Object.values(controls[3]).map((v) => v.minimumExactPositionalEdits)), 278);
assert.equal(Math.min(...Object.values(controls[4]).map((v) => v.minimumExactPositionalEdits)), 8);

// A key-independent invariance check under arbitrary independently chosen
// secret permutations in each full ciphertext history state.
let seed = 0x3301d00d;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
function secretTables(k) {
  const maps = [], inverses = [];
  for (let s = 0; s < 29 ** k; s++) {
    const a = Array.from({ length: 29 }, (_, i) => i);
    for (let i = 28; i > 0; i--) {
      const j = random() % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    const inv = Array(29);
    a.forEach((v, i) => { inv[v] = i; });
    maps.push(a);
    inverses.push(inv);
  }
  return { maps, inverses };
}
/** @param {number} k @param {number[]} plaintext @param {number[][]} maps */
function encrypt(k, plaintext, maps) {
  const out = [];
  for (const [start, len] of pageStarts) {
    for (let j = 0; j < len; j++) {
      const i = start + j;
      if (j < k) {
        out[i] = plaintext[i];
      } else {
        let state = 0;
        for (let h = i - k; h < i; h++) state = state * 29 + out[h];
        out[i] = maps[state][plaintext[i]];
      }
    }
  }
  return out;
}
/** @param {number} k @param {number[]} encrypted @param {number[][]} inverses */
function decrypt(k, encrypted, inverses) {
  const out = [];
  for (const [start, len] of pageStarts) {
    for (let j = 0; j < len; j++) {
      const i = start + j;
      if (j < k) {
        out[i] = encrypted[i];
      } else {
        let state = 0;
        for (let h = i - k; h < i; h++) state = state * 29 + encrypted[h];
        out[i] = inverses[state][encrypted[i]];
      }
    }
  }
  return out;
}
const plants = {};
for (const k of [2, 3]) {
  const { maps, inverses } = secretTables(k);
  const plaintext = native[1].blocks[0];
  const plantCipher = encrypt(k, plaintext, maps);
  const plantPlain = decrypt(k, plantCipher, inverses);
  assert.deepEqual(plantPlain, plaintext);
  const hC = measure(k, plantCipher);
  const hP = measure(k, plaintext, plantCipher);
  assert(Math.abs(hC.entropy - hP.entropy) < 1e-10);
  assert.equal(hC.collisions, hP.collisions);
  const arbitraryDecoded = decrypt(k, ciphertext, inverses);
  assert.deepEqual(encrypt(k, arbitraryDecoded, maps), ciphertext);
  const decoded = measure(k, arbitraryDecoded, ciphertext);
  assert(Math.abs(decoded.entropy - original[k].entropy) < 1e-10);
  assert.equal(decoded.collisions, original[k].collisions);
  assert.equal(histogramEditLowerBound(k, arbitraryDecoded), 0);
  assert.equal(positionalEditMinimum(k, arbitraryDecoded), 0);
  assert.equal(positionalEditMinimum(k, plaintext, plantCipher), 0);
  plants[k] = {
    recoveredRunes: plantPlain.length, plantedCipher: hC,
    arbitraryOriginalRoundtrip: true, originalDecodedEntropy: decoded.entropy
  };
}
console.log(JSON.stringify({
  premise: "stationary secret GP29 permutation per previous k ciphertext runes",
  N, pages: pages.length, original, controls, plants,
  decision: "k2 and k3 separate from 89 finite native controls; exact positional assignment k2 requires 4738+ edits; k4 overlaps"
}, null, 2));
