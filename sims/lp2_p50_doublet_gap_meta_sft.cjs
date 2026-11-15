'use strict';
/**
 * Original pp49-51 256-token field as page-order and doublet-gap metadata.
 * Source-based finite test, Node 22 CommonJS, no dependencies.
 * Reproduces a previously parked E-02 direct-consumer decision.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
/** @param {string} rel @returns {any} */
function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}
const grid = readJson('resources/liber-primus/lp2-grid-256.json');
const corpus = readJson('resources/liber-primus/lp2-corpus.json');
const tokens = grid.pages.flatMap(page => page.tokens);
const b60 = grid.bytes;
const abc60 = grid.alphabet;
const abc59 = abc60.replace('f', '');
/** @param {string} token @param {string} alphabet @returns {number} */
function tokenValue(token, alphabet) {
  return alphabet.indexOf(token[0]) * alphabet.length + alphabet.indexOf(token[1]);
}
const b59 = tokens.map(token => tokenValue(token, abc59));
assert.equal(tokens.length, 256);
assert.equal(b60.length, 256);
assert.deepEqual(tokens.map(token => tokenValue(token, abc60)), b60);
assert.equal(b59.every(x => x >= 0 && x < 256), true);
const pages = corpus.pages.filter(page => page.page >= 0 && page.page <= 55);
const stream = pages.flatMap(page => page.indices);
assert.equal(stream.length, 12956);
const sites = [];
for (let i = 1; i < stream.length; i++) {
  if (stream[i] === stream[i - 1]) sites.push(i);
}
assert.equal(sites.length, 86);
const gaps = sites.slice(1).map((pos, i) => pos - sites[i]);
assert.equal(gaps.length, 85);
assert.deepEqual(sites.slice(0, 4), [122, 207, 456, 653]);

/** @param {number[]} values @returns {number[]} */
function ranks(values) {
  const ordered = values.map((value, index) => ({value, index}))
    .sort((a, b) => a.value - b.value);
  const output = new Array(values.length);
  for (let i = 0; i < ordered.length;) {
    let end = i + 1;
    while (end < ordered.length && ordered[end].value === ordered[i].value) end++;
    for (let j = i; j < end; j++) output[ordered[j].index] = (i + end - 1) / 2;
    i = end;
  }
  return output;
}
/** @param {number[]} a @returns {number[]} */
function unit(a) {
  const mean = a.reduce((s, x) => s + x, 0) / a.length;
  const deviations = a.map(x => x - mean);
  const norm = Math.hypot(...deviations);
  assert.ok(norm > 0);
  return deviations.map(x => x / norm);
}
/** @param {number[]} a @param {number[]} b @returns {number} */
function dot(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
}
/** @param {number[]} bytes @returns {Array<{stride:number,endian:string,pos:number,pearson:number[],spearman:number[]}>} */
function windows(bytes) {
  const out = [];
  for (const stride of [1, 2]) {
    for (const endian of stride === 1 ? ['be'] : ['be', 'le']) {
      for (let pos = 0; pos + gaps.length * stride <= bytes.length; pos++) {
        const values = Array.from({length:gaps.length}, (_, i) => {
          if (stride === 1) return bytes[pos + i];
          const a = bytes[pos + 2*i], b = bytes[pos + 2*i + 1];
          return endian === 'be' ? 256*a + b : a + 256*b;
        });
        out.push({stride, endian, pos, pearson:unit(values), spearman:unit(ranks(values))});
      }
    }
  }
  return out;
}
/** @param {number[]} bytes @returns {object} */
function directDecisions(bytes) {
  const missing = (transformed) => Array.from({length:56}, (_, i) => i)
    .filter(value => !new Set(transformed).has(value));
  const perfectWindows = [];
  for (let start = 0; start <= bytes.length - 56; start++) {
    const window = bytes.slice(start, start + 56);
    if (window.every(x => x >= 0 && x < 56) && new Set(window).size === 56) {
      perfectWindows.push(start);
    }
  }
  const modGaps = gaps.map(x => x % 256);
  let maxByteMatches = -1, bestOffset = -1;
  for (let start = 0; start <= bytes.length - modGaps.length; start++) {
    const matches = modGaps.reduce((s, x, i) => s + Number(bytes[start + i] === x), 0);
    if (matches > maxByteMatches) { maxByteMatches = matches; bestOffset = start; }
  }
  return {
    rawMissingPageIds: missing(bytes),
    modulo56MissingPageIds: missing(bytes.map(x => x % 56)),
    contiguous56PagePermutationStarts: perfectWindows,
    bestGapModulo256Matches: maxByteMatches,
    bestGapModulo256Offset: bestOffset
  };
}
const yPearson = unit(gaps);
const ySpearman = unit(ranks(gaps));
const modes = [
  {name:'radix60', bytes:b60},
  {name:'radix59-omit-f', bytes:b59}
];
const reports = [];
for (const mode of modes) {
  const ws = windows(mode.bytes);
  let bestP = {rho:0}, bestS = {rho:0};
  for (const w of ws) {
    const p = dot(w.pearson, yPearson), s = dot(w.spearman, ySpearman);
    const locator = {start:w.pos, stride:w.stride, endian:w.endian};
    if (Math.abs(p) > Math.abs(bestP.rho)) bestP = {...locator, rho:p};
    if (Math.abs(s) > Math.abs(bestS.rho)) bestS = {...locator, rho:s};
  }
  reports.push({
    radix:mode.name, direct:directDecisions(mode.bytes),
    searchWindows:ws.length, bestPearson:bestP, bestSpearman:bestS
  });
}
// Search-adjusted null: shuffle the 85 observed ranks while fixing every
// original table window and the entire gap-size inventory.
let state = 0x33012014;
/** @returns {number} */
function next32() {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return state >>> 0;
}
const baseWindows = windows(b60);
const originalBest = Math.abs(reports[0].bestSpearman.rho);
const sample = [...ySpearman];
const trials = 5000;
let exceed = 0;
for (let t = 0; t < trials; t++) {
  for (let j = sample.length - 1; j > 0; j--) {
    const k = Math.floor(next32() * (j + 1) / 4294967296);
    [sample[j], sample[k]] = [sample[k], sample[j]];
  }
  let maxAbs = 0;
  for (const w of baseWindows) {
    const rho = Math.abs(dot(w.spearman, sample));
    if (rho > maxAbs) maxAbs = rho;
  }
  if (maxAbs >= originalBest) exceed++;
}
const output = {
  originalCipherRunes:stream.length, originalDoubletSites:sites.length,
  originalInterSiteGaps:gaps.length, firstGaps:gaps.slice(0, 8),
  reports, null:{
    type:'85-gap rank permutation; full 346-window maximum absolute Spearman',
    radix:'radix60', seed:'0x33012014', trials, exceed,
    familywiseAddOneP:(exceed+1)/(trials+1)
  }
};
assert.equal(reports[0].direct.contiguous56PagePermutationStarts.length, 0);
assert.equal(reports[1].direct.contiguous56PagePermutationStarts.length, 0);
assert.ok(output.null.familywiseAddOneP > 0.05);
console.log(JSON.stringify(output, null, 2));
