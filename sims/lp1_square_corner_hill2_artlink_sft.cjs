"use strict";
/**
 * Source-locked LP1 two-square corner 2x2 Hill inversion on visually linked LP2.
 * Independent original artwork: LP1 p05 moth -> LP2 pp53/55; paired
 * LP1 p16 insect+recliner -> LP2 pp2/22. No glyph/key fitting.
 * Odd-page final symbols are excluded, never silently padded.
 * Requires Node.js; no external dependencies or file writes.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const ROOT = path.resolve(__dirname, "..");
const mod = (x) => ((x % 29) + 29) % 29;
const inv = (v) => Array.from({ length: 28 }, (_, i) => i + 1)
  .find((n) => mod(n * v) === 1);
/**
 * @param {number[][]} m
 * @returns {number[][]}
 */
function inverse(m) {
  const d = mod(m[0][0] * m[1][1] - m[0][1] * m[1][0]);
  const z = inv(d);
  assert.notEqual(z, undefined);
  return [
    [mod(m[1][1] * z), mod(-m[0][1] * z)],
    [mod(-m[1][0] * z), mod(m[0][0] * z)]
  ];
}
/**
 * @param {number[]} v
 * @param {number[][]} m
 * @returns {number[]}
 */
function apply(v, m) {
  const out = [];
  for (let j = 0; j + 1 < v.length; j += 2) {
    out.push(mod(m[0][0] * v[j] + m[0][1] * v[j+1]));
    out.push(mod(m[1][0] * v[j] + m[1][1] * v[j+1]));
  }
  return out;
}
/** @param {number[]} s */
function ioc(s) {
  const freq = Array.from({ length: 29 }, () => 0);
  for (const v of s) freq[v]++;
  return freq.reduce((x, n) => x + n * (n - 1), 0) /
    (s.length * (s.length - 1));
}
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const source = fs.readFileSync(path.join(ROOT,
  "resources/liber-primus/lp1-plaintext-reference.txt"), "utf8");
assert.ok(source.includes("434   1311  312   278   966"));
const M05 = [[272, 151], [151, 272]].map((r) => r.map(mod));
const M16 = [[434, 966], [966, 434]].map((r) => r.map(mod));
assert.deepEqual(M05, [[11, 6], [6, 11]]);
assert.deepEqual(M16, [[28, 9], [9, 28]]);
const p = new Map(corpus.pages.map((q) => [q.page, q.indices]));
const group = [
  { page: 2, matrix: "LP1 p16", M: M16 },
  { page: 22, matrix: "LP1 p16", M: M16 },
  { page: 53, matrix: "LP1 p05", M: M05 },
  { page: 55, matrix: "LP1 p05", M: M05 }
];
const solved = p.get(57).slice(0, 76);
const out = [];
for (const { page, matrix, M } of group) {
  const original = p.get(page);
  const sourcePairs = original.slice(0, original.length & ~1);
  assert.deepEqual(apply(apply(sourcePairs, M), inverse(M)), sourcePairs);
  assert.deepEqual(apply(apply(solved, M), inverse(M)), solved);
  const variants = [
    { name: "C=M*P, P=M^-1*C", matrix: inverse(M) },
    { name: "C=M^-1*P, P=M*C", matrix: M }
  ];
  for (const v of variants) {
    const decoded = apply(sourcePairs, v.matrix);
    const reconstructed = apply(decoded, inverse(v.matrix));
    assert.deepEqual(reconstructed, sourcePairs);
    out.push({
      page, sourceMatrix: matrix, direction: v.name,
      decodedLength: decoded.length, omittedFinalIfOdd: original.length % 2,
      originalIoC: ioc(sourcePairs), decodedIoC: ioc(decoded),
      first50Transliteration: decoded.slice(0, 50)
        .map((index) => corpus.translit[index]).join("")
    });
  }
}
assert.equal(out.find((v) => v.page === 55 && v.direction.startsWith("C=M*P"))
  .decodedIoC, 0.029473684210526315);
assert.equal(out.find((v) => v.page === 22 && v.direction.startsWith("C=M*P"))
  .decodedIoC, 0.03553965414430531);
console.log(JSON.stringify({
  matrices: { LP1_p05: M05, LP1_p16: M16 },
  solvedP57First76IoC: ioc(solved),
  sourceArtwork: "source-exact LP1 p05 moth->LP2 p53/p55, unique LP1 p16 two-art intersection->LP2 p2/p22",
  result: out,
  conclusion: "Both complete p55 2x2 Hill inverses and p2/p22/p53 maximal even prefixes remain nonlinguistic; no original plaintext, unique key, or destination."
}, null, 2));
