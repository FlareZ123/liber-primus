"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const A = 29;
const F = 0;
const START = 5283;

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const tokens = corpus.translit
  .map((symbol, value) => ({ symbol, value }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

/** @param {string} text @returns {number[]} */
function gp(text) {
  const words = text
    .toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/V/g, "U")
    .replace(/[KQ]/g, "C")
    .replace(/Z/g, "S")
    .match(/[A-Z]+/g) || [];
  const out = [];
  for (const word of words) {
    for (let i = 0; i < word.length;) {
      if (word.startsWith("ING", i)) {
        out.push(21);
        i += 3;
        continue;
      }
      if (word.startsWith("IO", i)) {
        out.push(27);
        i += 2;
        continue;
      }
      const token = tokens.find((entry) => word.startsWith(entry.symbol, i));
      assert.ok(token, `unmapped GP token at ${word.slice(i)}`);
      out.push(token.value);
      i += token.symbol.length;
    }
  }
  return out;
}

/** @param {number} mask @returns {number} */
function popcount(mask) {
  let n = 0;
  for (let x = mask >>> 0; x; x &= x - 1) n += 1;
  return n;
}

const cipher = [];
const pageStarts = new Set();
let offset = 0;
for (const page of corpus.pages.filter((p) => p.page <= 55 && p.indices.length > 0)) {
  pageStarts.add(offset);
  cipher.push(...page.indices);
  offset += page.indices.length;
}
assert.equal(cipher.length, 12956);

const plain = gp(read("resources/control/gibran_prophet_58585.txt"));
const local = Array.from({ length: A }, () => new Uint32Array(A));
for (let i = 1; i < cipher.length; i += 1) {
  if (pageStarts.has(i)) continue;
  const x = plain[START + i];
  if (x === F || plain[START + i - 1] === F) continue;
  local[cipher[i - 1]][x] |= (1 << cipher[i]) >>> 0;
}

const predecessorOrder = Array.from({ length: A }, (_, u) => ({
  u,
  rowMax: Math.max(...Array.from(local[u], popcount)),
  edges: Array.from(local[u], popcount).reduce((sum, n) => sum + n, 0),
}))
  .sort((a, b) => b.rowMax - a.rowMax || b.edges - a.edges)
  .map((entry) => entry.u);

/**
 * Determine whether predecessor u admits a successor-label permutation that
 * embeds the four-offset circulant forbidden graph F_D.
 * @param {number} u
 * @param {number[]} offsets
 * @returns {boolean}
 */
function hasPerfectRelabeling(u, offsets) {
  const adjacency = new Uint32Array(A);
  for (let v = 0; v < A; v += 1) {
    let allowed = 0;
    for (let r = 0; r < A; r += 1) {
      let ok = true;
      for (const d of offsets) {
        const x = (r - d + A) % A;
        if ((local[u][x] >>> v) & 1) {
          ok = false;
          break;
        }
      }
      if (ok) allowed |= (1 << r) >>> 0;
    }
    if (!allowed) return false;
    adjacency[v] = allowed;
  }

  const order = Array.from({ length: A }, (_, v) => v)
    .sort((a, b) => popcount(adjacency[a]) - popcount(adjacency[b]));
  const match = new Int16Array(A);
  match.fill(-1);

  /** @param {number} v @param {{mask:number}} seen @returns {boolean} */
  function augment(v, seen) {
    let choices = adjacency[v] & ~seen.mask;
    while (choices) {
      const bit = choices & -choices;
      const r = 31 - Math.clz32(bit);
      seen.mask = (seen.mask | bit) >>> 0;
      if (match[r] < 0 || augment(match[r], seen)) {
        match[r] = v;
        return true;
      }
      choices = (choices ^ bit) >>> 0;
    }
    return false;
  }

  for (const v of order) {
    if (!augment(v, { mask: 0 })) return false;
  }
  return true;
}

let tested = 0;
let witness = null;
search:
for (let a = 0; a < A - 3; a += 1) {
  for (let b = a + 1; b < A - 2; b += 1) {
    for (let c = b + 1; c < A - 1; c += 1) {
      for (let d = c + 1; d < A; d += 1) {
        const offsets = [a, b, c, d];
        tested += 1;
        for (const u of predecessorOrder) {
          if (!hasPerfectRelabeling(u, offsets)) continue search;
        }
        witness = offsets;
        break search;
      }
    }
  }
}

assert.equal(tested, 23751);
assert.equal(witness, null);

console.log(JSON.stringify({
  status: "PASS",
  start: START,
  tested,
  result: "no four-offset circulant forbidden pattern embeds into all 29 predecessor relations",
  scope: "structured q25 negative only; arbitrary missing-edge graphs remain unresolved",
}, null, 2));
