"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const A = 29;
const F = 0;
const E = 18;
const THRESHOLD = 25;
const CONTROL_FILES = [
  "gibran_prophet_58585.txt",
  "shakespeare_first300k.txt",
  "emerson_essays_2944.txt",
];

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

/** @param {number} value @returns {number} */
function mod29(value) {
  return ((value % A) + A) % A;
}

/** @param {number} mask @returns {number} */
function popcount(mask) {
  let n = 0;
  for (let x = mask >>> 0; x; x &= x - 1) n += 1;
  return n;
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const gpTokens = corpus.translit
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
      const token = gpTokens.find((entry) => word.startsWith(entry.symbol, i));
      assert.ok(token, `unmapped GP token at ${word.slice(i)}`);
      out.push(token.value);
      i += token.symbol.length;
    }
  }
  return out;
}

const pages = corpus.pages.filter((page) => page.page <= 55 && page.indices.length > 0);
const original = [];
const pageStarts = new Set();
let pageOffset = 0;
for (const page of pages) {
  pageStarts.add(pageOffset);
  original.push(...page.indices);
  pageOffset += page.indices.length;
}
assert.equal(original.length, 12956);
assert.equal(pages.length, 55);

const positionsByPredecessor = Array.from({ length: A }, () => []);
for (let i = 1; i < original.length; i += 1) {
  if (pageStarts.has(i)) continue;
  positionsByPredecessor[original[i - 1]].push(i);
}
const predecessorOrder = Array.from({ length: A }, (_, u) => u)
  .sort((a, b) => positionsByPredecessor[b].length - positionsByPredecessor[a].length);

/**
 * First index >= value in an ascending numeric array.
 * @param {number[]} values
 * @param {number} value
 * @returns {number}
 */
function lowerBound(values, value) {
  let lo = 0;
  let hi = values.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (values[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/**
 * Exact key-independent threshold scan for B(E)=max_u |V_u(E)|.
 * @param {number[]} plain
 * @returns {object}
 */
function scanControl(plain, threshold = THRESHOLD) {
  const totalWindows = plain.length - original.length + 1;
  assert.ok(totalWindows > 0);

  const goodE = [];
  for (let j = 1; j < plain.length; j += 1) {
    if (plain[j] === E && plain[j - 1] !== F) goodE.push(j);
  }

  const unresolved = new Uint8Array(totalWindows);
  unresolved.fill(1);
  let remaining = totalWindows;
  const masks = new Uint32Array(totalWindows);
  const progress = [];

  for (const u of predecessorOrder) {
    masks.fill(0);

    for (const i of positionsByPredecessor[u]) {
      const bit = (1 << original[i]) >>> 0;
      const loValue = i;
      const hiValue = i + totalWindows;
      const lo = lowerBound(goodE, loValue);
      for (let k = lo; k < goodE.length && goodE[k] < hiValue; k += 1) {
        masks[goodE[k] - i] |= bit;
      }
    }

    let newlyCertified = 0;
    for (let start = 0; start < totalWindows; start += 1) {
      if (unresolved[start] && popcount(masks[start]) >= threshold) {
        unresolved[start] = 0;
        remaining -= 1;
        newlyCertified += 1;
      }
    }
    progress.push({
      predecessor: u,
      originalPositions: positionsByPredecessor[u].length,
      newlyCertified,
      remaining,
    });
    if (remaining === 0) break;
  }

  const survivors = [];
  for (let start = 0; start < totalWindows; start += 1) {
    if (unresolved[start]) survivors.push(start);
  }

  return {
    totalWindows,
    goodEPositions: goodE.length,
    threshold,
    certified: totalWindows - survivors.length,
    survivors,
    progress,
  };
}

/**
 * Direct exact B(E) calculation for one window, used as a sharpness witness.
 * @param {number[]} plain
 * @param {number} start
 * @param {number[]} cipher
 * @returns {{bound:number, predecessor:number, supports:number[]}}
 */
function boundAt(plain, start, cipher) {
  const masks = new Uint32Array(A);
  for (let i = 1; i < cipher.length; i += 1) {
    if (pageStarts.has(i)) continue;
    if (plain[start + i] !== E || plain[start + i - 1] === F) continue;
    masks[cipher[i - 1]] |= (1 << cipher[i]) >>> 0;
  }
  const supports = Array.from(masks, popcount);
  let bound = 0;
  let predecessor = -1;
  for (let u = 0; u < A; u += 1) {
    if (supports[u] > bound) {
      bound = supports[u];
      predecessor = u;
    }
  }
  return { bound, predecessor, supports };
}

/**
 * Exact max over every non-F plaintext rune and predecessor label.
 * @param {number[]} plain
 * @param {number} start
 * @param {number[]} cipher
 * @returns {{bound:number, plaintext:number, predecessor:number}}
 */
function jointBoundAt(plain, start, cipher) {
  const masks = new Uint32Array(A * A);
  for (let i = 1; i < cipher.length; i += 1) {
    if (pageStarts.has(i)) continue;
    const x = plain[start + i];
    if (x === F || plain[start + i - 1] === F) continue;
    const u = cipher[i - 1];
    masks[x * A + u] |= (1 << cipher[i]) >>> 0;
  }
  let bound = 0;
  let plaintext = -1;
  let predecessor = -1;
  for (let x = 1; x < A; x += 1) {
    for (let u = 0; u < A; u += 1) {
      const support = popcount(masks[x * A + u]);
      if (support > bound) {
        bound = support;
        plaintext = x;
        predecessor = u;
      }
    }
  }
  return { bound, plaintext, predecessor };
}

/**
 * Deterministic q-chart plant with arbitrary predecessor-conditioned
 * permutations T_u. Sender solves C_i=T_u^{-1}(K_s(P_i)).
 * @param {number[]} plain
 * @param {number} q
 * @returns {{cipher:number[],bound:number}}
 */
function plant(plain, q) {
  let seed = 0x18b1ec7;
  /** @returns {number} */
  function rnd() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  }
  /** @param {number[]} values @returns {number[]} */
  function shuffle(values) {
    for (let i = values.length - 1; i > 0; i -= 1) {
      const j = rnd() % (i + 1);
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  }

  const charts = Array.from(
    { length: q },
    () => shuffle(Array.from({ length: A }, (_, i) => i)),
  );
  const transforms = Array.from(
    { length: A },
    () => shuffle(Array.from({ length: A }, (_, i) => i)),
  );
  const inverses = transforms.map((row) => {
    const inverse = new Array(A);
    for (let x = 0; x < A; x += 1) inverse[row[x]] = x;
    return inverse;
  });

  const cipher = new Array(original.length).fill(0);
  for (let i = 0; i < cipher.length; i += 1) {
    if (pageStarts.has(i)) {
      cipher[i] = rnd() % A;
      continue;
    }
    const state = rnd() % q;
    const transformed = charts[state][plain[i]];
    cipher[i] = inverses[cipher[i - 1]][transformed];
  }

  const exact = boundAt(plain, 0, cipher);
  assert.ok(exact.bound <= q, `q${q} plant exceeded invariant: ${exact.bound}`);
  return { cipher, bound: exact.bound };
}

const controls = CONTROL_FILES.map((file) => ({
  file,
  plain: gp(read(`resources/control/${file}`)),
}));
assert.deepEqual(controls.map((x) => x.plain.length), [62492, 217106, 321327]);

const results = controls.map((control) => ({
  file: control.file,
  ...scanControl(control.plain),
}));
for (const result of results) {
  assert.equal(result.survivors.length, 0, `${result.file} has a q<=24 survivor`);
}
assert.equal(results.reduce((sum, x) => sum + x.totalWindows, 0), 562060);

const sharp = boundAt(controls[0].plain, 8500, original);
assert.equal(sharp.bound, 25);
assert.equal(sharp.predecessor, 5);

const gibran26 = scanControl(controls[0].plain, 26);
assert.equal(gibran26.survivors.length, 119);
const jointHard = gibran26.survivors.map((start) => ({
  start,
  ...jointBoundAt(controls[0].plain, start, original),
}));
assert.equal(jointHard.filter((row) => row.bound === 25).length, 59);
const jointSharp = jointBoundAt(controls[0].plain, 5283, original);
assert.equal(jointSharp.bound, 25);
assert.equal(jointSharp.plaintext, 3);
assert.equal(jointSharp.predecessor, 23);

const planted = plant(controls[1].plain.slice(0, original.length), 5);
assert.ok(planted.bound <= 5);

console.log(JSON.stringify({
  status: "PASS",
  theorem: "for predecessor-conditioned bijections, q >= max_u distinct successor ciphertext values aligned to fixed plaintext x",
  plaintextRune: "E",
  threshold: THRESHOLD,
  relaxations: [
    "independent physical-page starts",
    "plaintext F free",
    "transition immediately after plaintext F free",
  ],
  predecessorOrder,
  results,
  sharpnessWitness: {
    eOnly: {
      file: CONTROL_FILES[0],
      start: 8500,
      bound: sharp.bound,
      predecessor: sharp.predecessor,
    },
    eBelow26Windows: gibran26.survivors.length,
    allRuneStill25Windows: jointHard.filter((row) => row.bound === 25).length,
    allRuneExample: {
      file: CONTROL_FILES[0],
      start: 5283,
      ...jointSharp,
      plaintextLabel: corpus.translit[jointSharp.plaintext],
    },
  },
  plantedQ5Bound: planted.bound,
}, null, 2));
