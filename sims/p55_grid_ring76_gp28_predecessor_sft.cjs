"use strict";
/**
 * Full 76-rune p55 GP28 predecessor-excluding perimeter inversion.
 * Candidate only: the original ring/p55 equality does not authenticate
 * source key, rank convention, zero marker, or byte conversion.
 *
 * Run: node sims/p55_grid_ring76_gp28_predecessor_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} rel */
function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const p55 = gp.pages.find((p) => p.page === 55).indices;
const p54 = gp.pages.find((p) => p.page === 54).indices;
assert.equal(p55.length, 76);
const rows = grid.byte_rows;
const ring = [];
for (let j = 0; j < 8; j++) ring.push(rows[0][j]);
for (let i = 1; i < 32; i++) ring.push(rows[i][7]);
for (let j = 6; j >= 0; j--) ring.push(rows[31][j]);
for (let i = 30; i >= 1; i--) ring.push(rows[i][0]);
assert.equal(ring.length, 76);
/** @param {number} n @param {number} m */
const mod = (n, m) => ((n % m) + m) % m;
/**
 * @param {number} byte
 * @param {"mod28"|"scaled28"|"prime28"} rule
 */
function keyValue(byte, rule) {
  if (rule === "mod28") return byte % 28;
  if (rule === "scaled28") return Math.floor(byte * 28 / 256);
  return gp.prime[byte % 29] % 28;
}
/** @typedef {{initial:number,orientation:"clockwise"|"reverse",rank:"cyclic"|"sorted",sign:number,rule:"mod28"|"scaled28"|"prime28"}} Mode */
/** @param {Mode} mode */
function keys(mode) {
  return (mode.orientation === "clockwise" ? ring : ring.slice().reverse())
    .map((b) => keyValue(b, mode.rule));
}
/** @param {number[]} cipher @param {Mode} mode */
function decode(cipher, mode) {
  const k = keys(mode), out = [];
  let previous = mode.initial;
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    if (c === previous) out.push(28);
    else {
      const r = mode.rank === "cyclic" ?
        mod(c - previous - 1, 29) : c - Number(c > previous);
      out.push(mod(r + mode.sign * k[i], 28));
    }
    previous = c;
  }
  return out;
}
/** @param {number[]} plain @param {Mode} mode */
function encode(plain, mode) {
  const k = keys(mode), out = [];
  let previous = mode.initial;
  for (let i = 0; i < plain.length; i++) {
    const v = plain[i], r = mod(v - mode.sign * k[i], 28);
    const c = v === 28 ? previous : mode.rank === "cyclic" ?
      mod(previous + r + 1, 29) : r + Number(r >= previous);
    out.push(c);
    previous = c;
  }
  return out;
}
/** @param {string} text */
function toGP(text) {
  const symbols = gp.translit.map((v, i) => ({v, i}))
    .sort((a, b) => b.v.length - a.v.length);
  const normalized = text.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/K/g, "C")
    .replace(/Z/g, "S").replace(/Q/g, "C");
  const result = [];
  for (const word of normalized.match(/[A-Z]+/g) || [])
    for (let i = 0; i < word.length;) {
      const match = symbols.find((s) => word.startsWith(s.v, i));
      if (match) {
        result.push(match.i);
        i += match.v.length;
      } else i++;
    }
  return result;
}
const native = toGP(read("resources/control/shakespeare_first300k.txt"));
assert.equal(native.length, 218800);
const cutoff = Math.floor(native.length * 0.75);
const tri = new Float64Array(29 ** 3).fill(0.005);
const bi = new Float64Array(29 ** 2).fill(0.145);
for (let i = 2; i < cutoff; i++) {
  const j = native[i - 2] * 841 + native[i - 1] * 29 + native[i];
  tri[j]++;
  bi[Math.floor(j / 29)]++;
}
/** @param {number[]} symbols */
function score(symbols) {
  let sum = 0;
  for (let i = 2; i < symbols.length; i++) {
    const j = symbols[i - 2] * 841 + symbols[i - 1] * 29 + symbols[i];
    sum += Math.log(tri[j] / bi[Math.floor(j / 29)]);
  }
  return sum / (symbols.length - 2);
}
const heldout = [];
for (let i = cutoff; i + 76 < native.length; i += 76)
  heldout.push(score(native.slice(i, i + 76)));
heldout.sort((a, b) => a - b);
assert.equal(heldout.length, 719);
const modes = [];
for (const initial of [0, p54.at(-1)])
  for (const orientation of ["clockwise", "reverse"])
    for (const rank of ["cyclic", "sorted"])
      for (const sign of [-1, 1])
        for (const rule of ["mod28", "scaled28", "prime28"]) {
          /** @type {Mode} */
          const mode = {initial, orientation, rank, sign, rule};
          const plain = decode(p55, mode);
          assert.deepEqual(encode(plain, mode), p55);
          const plant = native.slice(cutoff, cutoff + 76);
          assert.deepEqual(decode(encode(plant, mode), mode), plant);
          modes.push({mode, score: score(plain),
            repeatMarkers: plain.filter((x) => x === 28).length,
            prefix: plain.slice(0, 26)
              .map((x) => gp.translit[x]).join("-")});
        }
assert.equal(modes.length, 48);
modes.sort((a, b) => b.score - a.score);
assert(modes[0].mode.initial === p54.at(-1));
assert.equal(modes[0].mode.orientation, "clockwise");
assert.equal(modes[0].mode.rank, "cyclic");
assert.equal(modes[0].mode.sign, 1);
assert.equal(modes[0].mode.rule, "mod28");
assert(Math.abs(modes[0].score - (-5.076138400305506)) < 1e-10);
assert(modes[0].score < heldout[0]);
console.log(JSON.stringify({
  scope: "p55 original 76-rune GP28 predecessor-excluding cipher",
  count: modes.length, raw: score(p55),
  reference: {count: heldout.length, min: heldout[0],
    median: heldout[Math.floor(heldout.length / 2)],
    max: heldout.at(-1)},
  winners: modes.slice(0, 8),
  allOriginalAndPlantedRoundtrips: true,
  recoveredOriginalPlaintext: false
}, null, 2));
