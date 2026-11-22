"use strict";

/**
 * Original-source full 256-cell causal GF(29) convolution gate.
 * The 32x8 printed pp49–51 base60 byte table is treated as a complete
 * 256-tap filter, once in print order and once reversed, on the original
 * 12,956 LP2 unknown runes. This is a bounded hypothesis, not a solved cipher.
 *
 * Run: node sims/lp2_fullgrid256_causal_convolution_original_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

/** @param {string} filename @returns {any} */
function resource(filename) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..",
    "resources", "liber-primus", filename), "utf8"));
}
const corpus = resource("lp2-corpus.json");
const grid = resource("lp2-grid-256.json");
const original = corpus.pages.filter(p => p.page >= 0 && p.page <= 55)
  .flatMap(p => p.indices);
const pageSegments = corpus.pages.filter(p => p.page <= 55)
  .map(p => p.indices.length).filter(n => n > 0);
const chapterSegments = [729,1145,1729,1903,1021,1433,1680,3008,308];
const table = grid.bytes.map(n => n % 29);
assert.equal(table.length, 256);
assert.equal(original.length, 12956);
assert.equal(pageSegments.length, 55);
assert.equal(pageSegments.reduce((a,b) => a+b,0),12956);
assert.equal(chapterSegments.reduce((a,b) => a+b,0),12956);
assert.equal(table[0], 0);
assert.equal(table[255], 22);

/** @param {number} value @returns {number} */
function mod(value) { return ((value % 29) + 29) % 29; }
/** @param {number} n @returns {number} */
function reciprocal(n) {
  for (let i = 1; i < 29; i++) if ((i * n) % 29 === 1) return i;
  throw new Error("A causal inverse requires a nonzero first tap");
}

/**
 * @param {number[]} input @param {number[]} kernel
 * @param {number[]} segments @param {boolean} inverse
 * @returns {number[]}
 */
function transform(input, kernel, segments, inverse) {
  const out = [];
  const scale = inverse ? reciprocal(kernel[0]) : 1;
  let start = 0;
  for (const len of segments) {
    const values = input.slice(start, start + len);
    const result = [];
    for (let i = 0; i < len; i++) {
      let sum = 0;
      if (inverse) {
        for (let j = 1; j <= Math.min(i, 255); j++) {
          sum += kernel[j] * result[i - j];
        }
        result.push(mod((values[i] - sum) * scale));
      } else {
        for (let j = 0; j <= Math.min(i, 255); j++) {
          sum += kernel[j] * values[i - j];
        }
        result.push(mod(sum));
      }
    }
    out.push(...result);
    start += len;
  }
  assert.equal(start, input.length);
  return out;
}

/** @param {number[]} symbols @returns {number} */
function ioc(symbols) {
  const counts = Array(29).fill(0);
  for (const sym of symbols) counts[sym]++;
  return counts.reduce((s,n) => s+n*(n-1), 0)/(symbols.length*(symbols.length-1));
}
/** @param {number[]} symbols @returns {number} */
function eo(symbols) {
  return symbols.reduce((n,c) => n + (c === 3 || c === 18 ? 1 : 0), 0);
}
const reversed = [...table].reverse();
const solved = corpus.pages.find(p=>p.page===57).indices;
assert.equal(solved.length, 95);
const planted = transform(solved,reversed,[solved.length],false);
assert.deepEqual(transform(planted,reversed,[planted.length],true),solved);

const results = [];
for (const [name,key] of [["printed",table],["reversed",reversed]]) {
  for (const [clock,segments] of [
    ["book",[12956]],["visual-chapter",chapterSegments],["physical-page",pageSegments]
  ]) {
    const output = transform(original,key,segments,false);
    results.push({order:name,mode:"direct-filter",clock,ioc:ioc(output),eo:eo(output)});
    if (key[0] !== 0) {
      const decoded = transform(original,key,segments,true);
      assert.deepEqual(transform(decoded,key,segments,false),original);
      results.push({order:name,mode:"causal-inverse",clock,
        ioc:ioc(decoded),eo:eo(decoded)});
    }
  }
}
for (const r of results) {
  console.log(`${r.order} ${r.mode} ${r.clock}: IoC=${r.ioc.toFixed(8)} E+O=${r.eo}`);
}
assert.ok(results.every(r=>r.ioc>0.034 && r.ioc<0.035));
assert.equal(results.length,9);
console.log("PASS: original full-grid source gate, 95-rune native-GP plant, exact inverse reencryption");
