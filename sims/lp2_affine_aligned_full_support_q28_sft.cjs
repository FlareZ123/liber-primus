"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const A = 29;
const F = 0;
const E = 18;
const COEFFICIENTS = [1, 16, 19];
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
const cipher = [];
const pageStarts = new Set();
let pageOffset = 0;
for (const page of pages) {
  pageStarts.add(pageOffset);
  cipher.push(...page.indices);
  pageOffset += page.indices.length;
}
assert.equal(cipher.length, 12956);
assert.equal(pages.length, 55);

/**
 * Build within-page affine residuals. Page starts are deliberately free.
 * @param {number} coefficient
 * @returns {{residualAt:Int16Array, positionsByResidual:number[][]}}
 */
function residualFrame(coefficient) {
  const residualAt = new Int16Array(cipher.length);
  residualAt.fill(-1);
  const positionsByResidual = Array.from({ length: A }, () => []);
  for (let i = 1; i < cipher.length; i += 1) {
    if (pageStarts.has(i)) continue;
    const residual = mod29(cipher[i] - coefficient * cipher[i - 1]);
    residualAt[i] = residual;
    positionsByResidual[residual].push(i);
  }
  return { residualAt, positionsByResidual };
}

/**
 * Exact aligned support size for one source window. F itself and positions
 * immediately following plaintext F are granted as free exceptions.
 * @param {number[]} plain
 * @param {number} start
 * @param {Int16Array} residualAt
 * @returns {{maxSupport:number,bestRune:number,supports:number[]}}
 */
function supportAt(plain, start, residualAt) {
  const masks = new Uint32Array(A);
  for (let i = 1; i < cipher.length; i += 1) {
    const residual = residualAt[i];
    if (residual < 0) continue;
    const current = plain[start + i];
    const previous = plain[start + i - 1];
    if (current === F || previous === F) continue;
    masks[current] |= (1 << residual) >>> 0;
  }
  const supports = Array.from(masks, popcount);
  let maxSupport = 0;
  let bestRune = -1;
  for (let rune = 1; rune < A; rune += 1) {
    if (supports[rune] > maxSupport) {
      maxSupport = supports[rune];
      bestRune = rune;
    }
  }
  return { maxSupport, bestRune, supports };
}

/**
 * Fast exact scan: E settles almost every window; full supportAt is only
 * needed when E misses at least one residual label.
 * @param {number[]} plain
 * @param {number} coefficient
 * @returns {object}
 */
function scanControl(plain, coefficient) {
  const { residualAt, positionsByResidual } = residualFrame(coefficient);
  const windows = plain.length - cipher.length + 1;
  assert.ok(windows > 0);
  let eFull29 = 0;
  let eExceptions = 0;
  let exceptionsClosedByOtherRune = 0;
  const unresolved = [];
  const exceptionDetails = [];

  for (let start = 0; start < windows; start += 1) {
    let eSupport = 0;
    for (let residual = 0; residual < A; residual += 1) {
      let hit = false;
      for (const i of positionsByResidual[residual]) {
        if (plain[start + i] === E && plain[start + i - 1] !== F) {
          hit = true;
          break;
        }
      }
      if (hit) eSupport += 1;
    }
    if (eSupport === A) {
      eFull29 += 1;
      continue;
    }

    eExceptions += 1;
    const exact = supportAt(plain, start, residualAt);
    if (exact.maxSupport === A) {
      exceptionsClosedByOtherRune += 1;
      exceptionDetails.push({
        start,
        eSupport,
        bestRune: exact.bestRune,
        bestLabel: corpus.translit[exact.bestRune],
      });
    } else {
      unresolved.push({ start, eSupport, ...exact });
    }
  }

  return {
    coefficient,
    windows,
    eFull29,
    eExceptions,
    exceptionsClosedByOtherRune,
    unresolved,
    exceptionDetails,
  };
}

/**
 * Positive control: a q-chart sender must never require support > q.
 * Page starts are reset independently; arbitrary chart switching is used.
 * @param {number[]} plain
 * @param {number} q
 * @returns {{maxSupport:number,usedSupports:number[]}}
 */
function plant(plain, q) {
  let seed = 0x18a11e5;
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
  const charts = Array.from({ length: q }, () => shuffle(Array.from({ length: A }, (_, i) => i)));
  const synthetic = new Array(cipher.length).fill(0);
  for (let i = 0; i < synthetic.length; i += 1) {
    if (pageStarts.has(i)) {
      synthetic[i] = rnd() % A;
      continue;
    }
    const state = rnd() % q;
    synthetic[i] = mod29(synthetic[i - 1] + charts[state][plain[i]]);
  }
  const residualAt = new Int16Array(cipher.length);
  residualAt.fill(-1);
  for (let i = 1; i < synthetic.length; i += 1) {
    if (pageStarts.has(i)) continue;
    residualAt[i] = mod29(synthetic[i] - synthetic[i - 1]);
  }
  const exact = supportAt(plain, 0, residualAt);
  assert.ok(exact.maxSupport <= q, `q${q} plant exceeded support: ${exact.maxSupport}`);
  assert.equal(exact.maxSupport, q, `q${q} plant failed to exercise all charts`);
  return { maxSupport: exact.maxSupport, usedSupports: exact.supports };
}

const controls = CONTROL_FILES.map((file) => ({
  file,
  plain: gp(read(`resources/control/${file}`)),
}));
assert.deepEqual(controls.map((x) => x.plain.length), [62492, 217106, 321327]);

const results = [];
for (const coefficient of COEFFICIENTS) {
  for (const control of controls) {
    results.push({ file: control.file, ...scanControl(control.plain, coefficient) });
  }
}

for (const result of results) {
  assert.equal(result.unresolved.length, 0, `${result.file} a=${result.coefficient} has a q<=28 survivor`);
}
assert.deepEqual(
  results.filter((x) => x.coefficient === 1).map((x) => [x.eExceptions, x.exceptionsClosedByOtherRune]),
  [[4, 4], [2, 2], [2, 2]],
);
for (const coefficient of [16, 19]) {
  for (const result of results.filter((x) => x.coefficient === coefficient)) {
    assert.equal(result.eExceptions, 0);
    assert.equal(result.eFull29, result.windows);
  }
}
assert.equal(results.filter((x) => x.coefficient === 1).reduce((sum, x) => sum + x.windows, 0), 562060);
assert.equal(results.filter((x) => x.coefficient === 16).reduce((sum, x) => sum + x.windows, 0), 562060);
assert.equal(results.filter((x) => x.coefficient === 19).reduce((sum, x) => sum + x.windows, 0), 562060);

const planted = plant(controls[1].plain.slice(0, cipher.length), 5);
console.log(JSON.stringify({
  status: "PASS",
  cipherRunes: cipher.length,
  nonemptyPages: pages.length,
  testedCoefficients: COEFFICIENTS,
  theorem: "direct aligned q-chart sender requires support(P=x) <= q; every tested native window requires q>=29",
  relaxations: ["independent physical-page starts", "plaintext F free", "transition immediately after plaintext F free"],
  results,
  plantedQ5: planted.maxSupport,
}, null, 2));
