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
    controls[k][item.name] = {
      windows: samples.length,
      entropyMin: Math.min(...samples.map((s) => s.entropy)),
      entropyMax: Math.max(...samples.map((s) => s.entropy)),
      collisionMin: Math.min(...samples.map((s) => s.collisions)),
      collisionMax: Math.max(...samples.map((s) => s.collisions))
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
  plants[k] = {
    recoveredRunes: plantPlain.length, plantedCipher: hC,
    arbitraryOriginalRoundtrip: true, originalDecodedEntropy: decoded.entropy
  };
}
console.log(JSON.stringify({
  premise: "stationary secret GP29 permutation per previous k ciphertext runes",
  N, pages: pages.length, original, controls, plants,
  decision: "k2 and k3 separate from 89 finite native controls; k4 overlaps"
}, null, 2));
