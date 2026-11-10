"use strict";

/**
 * Original-source field-affine inverse: F/Q(u^t) supplies both a unit
 * multiplier via GF(29^2) norm and a shift via GF(29^2) trace.
 *
 * F is the exact 256-byte LP2 grid polynomial; Q = F / [15(X-24)^2]
 * uses only the originally highlighted red p39 factor. The original red
 * p3 triple supplies the primitive order-840 field generator u^2=3u+8.
 *
 * The natural one-dimensional field invariants define
 * C = A * P - sign * B mod29, A=Norm(F/Q(u^t)), B=Trace(F/Q(u^t)).
 * When A=0, use A=1 by explicit convention. Every candidate is reversible.
 *
 * Test all 840 initial nonzero-field phases under global/page clocks and
 * both inverse signs against all 12,956 original GP29 runes, plus one blind
 * source-true full-length GP-English control. No ciphertext fit determines
 * the source coefficients, field, or projections.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");
const {constructKeys, m, ioc} =
  require("./lp2_red_triad_polynomial_eval_inverse.cjs");
const {nativeGP} = require("./red_triad_gf841_127cycle_inverse.cjs");
const ROOT = path.resolve(__dirname, "..");

/** @param {string} filename @returns {any} */
function load(filename) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, filename), "utf8"));
}

/**
 * @param {{norm:number,trace:number}[]} table
 * @returns {{inverse:number, scale:number, shift:number}[]}
 */
function keyTable(table) {
  return table.map(({norm, trace}) => {
    const scale = norm || 1; // exact declared zero-root sentinel
    let inverse = 0;
    for (let j = 1; j < 29; j++) {
      if (m(scale * j) === 1) {inverse = j; break;}
    }
    assert(inverse !== 0);
    return {scale, inverse, shift: trace};
  });
}

/**
 * @param {number[][]} pages
 * @param {{inverse:number,scale:number,shift:number}[]} keys
 * @param {number} phase
 * @param {"page"|"global"} clock
 * @param {1|-1} sign
 * @param {boolean} [encode=false]
 */
function transform(pages, keys, phase, clock, sign, encode = false) {
  let globalPosition = 0;
  const all = [];
  for (const source of pages) {
    const result = [];
    for (let j = 0; j < source.length; j++) {
      const state = keys[(phase + (clock === "page" ? j : globalPosition + j)) % 840];
      const value = encode ?
        m(state.scale * source[j] - sign * state.shift) :
        m((source[j] + sign * state.shift) * state.inverse);
      result.push(value);
    }
    globalPosition += source.length;
    all.push(result);
  }
  return all;
}

/**
 * @param {number[][]} pages
 * @param {{inverse:number,scale:number,shift:number}[]} keys
 * @param {number} phase
 * @param {"page"|"global"} clock
 * @param {1|-1} sign
 * @returns {number}
 */
function fastIoc(pages, keys, phase, clock, sign) {
  const hist = new Int32Array(29);
  let globalPosition = 0, length = 0;
  for (const page of pages) {
    for (let j = 0; j < page.length; j++) {
      const {inverse, shift} =
        keys[(phase + (clock === "page" ? j : globalPosition + j)) % 840];
      hist[m((page[j] + sign * shift) * inverse)]++;
      length++;
    }
    globalPosition += page.length;
  }
  return hist.reduce((sum, n) => sum + n * (n - 1), 0) /
    (length * (length - 1));
}

function main() {
  const grid = load("resources/liber-primus/lp2-grid-256.json");
  assert.equal(grid.bytes.length, 256);
  assert.equal(crypto.createHash("sha256").update(Buffer.from(grid.bytes))
    .digest("hex"), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const corpus = load("resources/liber-primus/lp2-corpus.json");
  const pages = corpus.pages.filter((p) => p.page <= 55 && p.indices.length)
    .map((p) => p.indices);
  const original = pages.flat();
  assert.equal(original.length, 12956);

  const results = [];
  for (const mode of ["full", "quotient"]) {
    const {table, roots} = constructKeys(grid.bytes, mode);
    const keys = keyTable(table);
    assert.equal(keys.filter((value) => value.scale === 1).length >= roots.length, true);
    for (const clock of ["global", "page"]) {
      for (const sign of /** @type {(1|-1)[]} */ ([-1, 1])) {
        let best = {phase: -1, ioc: -1};
        let sourcePhaseIoc = -1;
        for (let phase = 0; phase < 840; phase++) {
          const score = fastIoc(pages, keys, phase, clock, sign);
          if (phase === 360) sourcePhaseIoc = score;
          if (score > best.ioc) best = {phase, ioc: score};
        }
        assert(best.ioc < 0.036);
        const candidate = transform(pages, keys, best.phase, clock, sign);
        assert.deepEqual(transform(candidate, keys, best.phase, clock, sign, true),
          pages);
        results.push({mode, clock, sign, sourcePhaseIoc, ...best});
      }
    }
  }
  results.sort((a, b) => b.ioc - a.ioc);

  const shakespeare = fs.readFileSync(
    path.join(ROOT, "resources/control/shakespeare_first300k.txt"), "utf8");
  const native = nativeGP(shakespeare).slice(0, original.length);
  assert.equal(native.length, 12956);
  let offset = 0;
  const nativePages = pages.map((page) => {
    const part = native.slice(offset, offset + page.length);
    offset += page.length;
    return part;
  });
  const plantResults = [];
  for (const mode of ["full", "quotient"]) {
    const keys = keyTable(constructKeys(grid.bytes, mode).table);
    const planted = transform(nativePages, keys, 360, "global", 1, true);
    const recovered = transform(planted, keys, 360, "global", 1);
    assert.deepEqual(recovered, nativePages);
    assert.deepEqual(transform(recovered, keys, 360, "global", 1, true),
      planted);
    plantResults.push({
      mode, exactRecovered: native.length,
      trueIoC: ioc(recovered.flat()),
      wrongPhaseIoC: ioc(transform(planted, keys, 361, "global", 1).flat())
    });
  }
  console.log(JSON.stringify({
    status: "original-input bounded negative; zero authentic plaintext",
    originalGridBytes: 256, originalRunes: original.length,
    candidateCount: results.length * 840,
    sourceIoC: ioc(original),
    root24FieldPhase: 360,
    bestResults: results,
    controls: plantResults
  }, null, 2));
}

if (require.main === module) main();
module.exports = {keyTable, transform, fastIoc};
