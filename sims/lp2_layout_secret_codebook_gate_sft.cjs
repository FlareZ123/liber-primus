"use strict";
/**
 * GP29 source-original, all-secret alphabet layout gate.
 * Run from repo root: node sims/lp2_layout_secret_codebook_gate_sft.cjs
 * @typedef {{page:number, indices:number[]}} Page
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ref = gp.pages.filter((p) => p.page <= 55 && p.indices.length);
const idx = new Map(gp.runes.map((x, i) => [x, i]));
const linesByPage = read("resources/liber-primus/lp2-transcription.txt")
  .split("%").slice(0, 55).map((p) => p.split("/").map((l) =>
    [...l].filter((ch) => idx.has(ch)).map((ch) => idx.get(ch)))
    .filter((l) => l.length));
const source = linesByPage.flat(2);
assert.equal(source.length, 12956);
assert.equal(linesByPage.length, 55);
assert.equal(linesByPage.flat().length, 594);
assert.deepEqual(linesByPage.map((p) => p.flat()), ref.map((p) => p.indices));
const sections = [729, 1145, 1729, 9, 1894, 1021, 1524, 1589, 3316];
assert.equal(sections.reduce((a, b) => a + b, 0), source.length);
const sectionEnds = [];
let sum = 0;
for (const n of sections) sectionEnds.push(sum += n);
const classes = ["page", "line", "grid", "sectionGrid"];
const groups = Object.fromEntries(classes.map((c) => [c, new Map()]));
/** @type {string[]} */
const stateAt = [];
function attach(mode, id, pos) {
  const map = groups[mode];
  if (!map.has(id)) map.set(id, []);
  map.get(id).push(pos);
}
let offset = 0, section = 0;
for (const page of linesByPage) {
  let pagePos = 0;
  for (let row = 0; row < page.length; row++) {
    for (let col = 0; col < page[row].length; col++) {
      while (offset >= sectionEnds[section]) section++;
      const state = section + ":" + row + ":" + col;
      stateAt.push(state);
      attach("page", String(pagePos++), offset);
      attach("line", String(col), offset);
      attach("grid", row + ":" + col, offset);
      attach("sectionGrid", state, offset++);
    }
  }
}
assert.equal(offset, 12956);
assert.equal(section, 8);
const c2 = (n) => n * (n - 1) / 2;
/** @param {number[]} sequence @param {Map<string,number[]>} states */
function samePairs(sequence, states) {
  let same = 0, total = 0;
  for (const positions of states.values()) {
    const h = Array(29).fill(0);
    for (const j of positions) h[sequence[j]]++;
    same += h.reduce((a, n) => a + c2(n), 0);
    total += c2(positions.length);
  }
  return {same, total, fraction: same / total};
}
const results = Object.fromEntries(classes.map((mode) => [
  mode, {tables: groups[mode].size, ...samePairs(source, groups[mode])}
]));
assert.deepEqual(classes.map((x) => [results[x].same, results[x].total]), [
  [10751, 311132], [126508, 3638562], [10510, 301221], [1433, 40404]
]);
assert.equal(results.sectionGrid.tables, 2300);

const vocab = gp.translit.map((s, i) => ({s, i})).sort((a, b) => b.s.length - a.s.length);
/** @param {string} text */
function transliterate(text) {
  const result = [];
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  for (const word of normalized.match(/[A-Z]+/g) || []) {
    for (let i = 0; i < word.length;) {
      const x = vocab.find((t) => word.startsWith(t.s, i));
      assert(x, word);
      result.push(x.i);
      i += x.s.length;
    }
  }
  return result;
}
const controls = [
  ["Shakespeare", "resources/control/shakespeare_first300k.txt"],
  ["Gibran", "resources/control/gibran_prophet_58585.txt"],
  ["Emerson", "resources/control/emerson_essays_2944.txt"]
];
const sampled = {};
let native = null;
for (const [name, filename] of controls) {
  const all = transliterate(read(filename));
  const scores = Object.fromEntries(classes.map((mode) => [mode, []]));
  for (let start = 0; start + source.length <= all.length; start += 6478) {
    const p = all.slice(start, start + source.length);
    if (native === null) native = p;
    for (const mode of classes) {
      scores[mode].push(samePairs(p, groups[mode]).fraction);
    }
  }
  sampled[name] = {};
  for (const mode of classes) {
    const v = scores[mode].sort((a, b) => a - b);
    assert(v.length > 0);
    assert(v[0] > results[mode].fraction);
    sampled[name][mode] = {
      windows: v.length, min: v[0],
      median: v[Math.floor(v.length / 2)], max: v.at(-1)
    };
  }
}
assert.deepEqual(controls.map(([name]) => sampled[name].grid.windows), [32, 8, 49]);

// Full positive control: every section×printed-coordinate table has its own
// random secret bijection, and the exact inverse recovers all 12,956 runes.
let seed = 0x33010811;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
function permutation() {
  const p = Array.from({length: 29}, (_, i) => i);
  for (let i = 28; i > 0; i--) {
    const j = random() % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return p;
}
const secret = new Map([...groups.sectionGrid.keys()].map((state) =>
  [state, permutation()]));
const inverse = new Map([...secret.entries()].map(([state, perm]) => {
  const inv = Array(29);
  perm.forEach((value, i) => { inv[value] = i; });
  return [state, inv];
}));
const encrypted = native.map((p, i) => secret.get(stateAt[i])[p]);
const decoded = encrypted.map((c, i) => inverse.get(stateAt[i])[c]);
assert.deepEqual(decoded, native);
assert.equal(
  samePairs(encrypted, groups.sectionGrid).same,
  samePairs(native, groups.sectionGrid).same
);
console.log(JSON.stringify({
  runes: source.length, pages: linesByPage.length,
  lines: linesByPage.flat().length, sections: sections.length,
  original: results, controls: sampled,
  planted: {secretTables: secret.size, recovered: decoded.length,
    invariantPairs: samePairs(encrypted, groups.sectionGrid)}
}, null, 2));
