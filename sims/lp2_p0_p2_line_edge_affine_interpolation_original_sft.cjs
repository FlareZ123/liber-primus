"use strict";

/**
 * Original opening p0–2, 33 black printed lines:
 * interpolate the two visible line-end rune ordinals over GF(29).
 * Read-only single-file original-source regression; Node 22/CommonJS.
 * The transfer of affine interpolation to actual cipher is a hypothesis,
 * not an authenticated author instruction.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const gpIndex = new Map(corpus.runes.map((r, i) => [r, i]));
/** @param {string} block @returns {number[][]} */
const parseLines = block => block.split("/").map(s => [...s].filter(r => gpIndex.has(r))
  .map(r => gpIndex.get(r))).filter(x => x.length > 0);
const pages = transcript.split("%").slice(0, 3).map(parseLines);
const original = pages.flat();
const red = original[0].slice(0, 13);
const lines = [original[0].slice(13), ...original.slice(1)];
const printedWidths = [7,23,19,22,24,21,21,23,23,20,23,23,24,23,23,21,
  23,23,22,21,21,21,21,23,21,24,22,25,23,21,24,22,19];
assert.deepEqual(lines.map(x => x.length), printedWidths);
assert.deepEqual(pages.map(x => x.flat().length), [262, 266, 201]);
for (let i = 0; i < pages.length; i++) {
  assert.deepEqual(pages[i].flat(), corpus.pages[i].indices);
}
assert.deepEqual(red, [15,8,18,3,6,19,27,0,15,26,18,21,5]);
assert.equal(lines.length, 33);
const edges = lines.flatMap(x => [x[0], x[x.length - 1]]);
assert.equal(edges.length, 66);
assert.equal(new Set(edges.slice(0, 46)).size, 29);
assert.equal(new Set(edges.slice(0, 45)).size, 28);
/** @param {number} x @returns {number} */
const mod = x => ((x % 29) + 29) % 29;
/** @param {number} nonzero @returns {number} */
function inverse(nonzero) {
  for (let i = 1; i < 29; i++) if ((nonzero * i) % 29 === 1) return i;
  throw Error("No inverse in GF29");
}
/**
 * @param {number} left
 * @param {number} right
 * @param {number} fullWidth
 * @param {number} position zero-based, inside line
 * @returns {number}
 */
function keyAt(left, right, fullWidth, position) {
  assert.ok(fullWidth > 2 && fullWidth < 30);
  assert.ok(position > 0 && position < fullWidth - 1);
  return mod(left + position * mod(right - left) * inverse(fullWidth - 1));
}
/** @param {number[][]} originalLines @returns {number[]} */
function decrypt(originalLines) {
  const plain = [];
  for (const line of originalLines) {
    for (let j = 1; j < line.length - 1; j++) {
      plain.push(mod(line[j] - keyAt(line[0], line[line.length - 1], line.length, j)));
    }
  }
  return plain;
}
/**
 * @param {number[][]} originalLines only outer original runes are used
 * @param {number[]} plain in actual line-inner reading order
 * @returns {number[][]}
 */
function encrypt(originalLines, plain) {
  let pos = 0;
  const output = originalLines.map(line => {
    const encrypted = line.slice();
    for (let j = 1; j < encrypted.length - 1; j++) {
      encrypted[j] = mod(plain[pos++] +
        keyAt(line[0], line[line.length - 1], line.length, j));
    }
    return encrypted;
  });
  assert.equal(pos, plain.length);
  return output;
}
/** @param {number[]} seq @returns {number} */
function ioc(seq) {
  const counts = Array(29).fill(0);
  seq.forEach(x => counts[x]++);
  return counts.reduce((sum, x) => sum + x * (x - 1), 0) /
    (seq.length * (seq.length - 1));
}
/** @param {number[]} seq @returns {string} */
const translit = seq => seq.map(x => corpus.translit[x]).join(" ");

const cipher = lines.flatMap(x => x.slice(1, -1));
assert.equal(cipher.length, 650);
const candidate = decrypt(lines);
assert.deepEqual(encrypt(lines, candidate), lines);
assert.ok(Math.abs(ioc(cipher) - 0.034149579234324996) < 1e-12);
const known = corpus.pages[57].indices;
assert.equal(known.length, 95);
const plant = Array.from({length:650}, (_, i) => known[i % 95]);
const plantedCipher = encrypt(lines, plant);
assert.deepEqual(decrypt(plantedCipher), plant);
const out = {
  source: "Original 2014 LP2 p0–2",
  redTitle: red.length,
  blackLines: lines.length,
  sourceEdges: edges.length,
  untouchedInner: cipher.length,
  interpolatingField: "GF(29)",
  fixedFormula: "K(line,j)=left+j*(right-left)/(width-1) mod29; P=C-K mod29",
  originalIoC: ioc(cipher),
  candidateIoC: ioc(candidate),
  first225IoC: ioc(candidate.slice(0, 225)),
  heldout425IoC: ioc(candidate.slice(225)),
  originalExactReplay: lines.flat().length,
  knownNativePlantedRecovered: plant.length,
  first100Candidate: translit(candidate.slice(0, 100)),
  allCandidate: translit(candidate)
};
console.log(JSON.stringify(out, null, 2));
assert.ok(Math.abs(out.candidateIoC - 0.03436766623207301) < 1e-12);
assert.ok(Math.abs(out.first225IoC - 0.03515873015873016) < 1e-12);
assert.ok(Math.abs(out.heldout425IoC - 0.03374028856825749) < 1e-12);
console.log("PASS: source-fixed original line-edge GF29 interpolation and planted native-GP inverse");
