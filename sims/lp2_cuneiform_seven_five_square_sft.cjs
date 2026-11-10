"use strict";
/**
 * Seven original LP2 cuneiform pages + five original numbered clauses:
 * test an independently frozen row-per-page GP29 additive schedule from
 * the historical 2014 OpenPuff 7x7/1033 and 5x5/3301 magic squares.
 * This is a bounded direct-key experiment, not a verified LP2 cipher.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const squares = read("resources/cicada2014-openpuff-magic-squares.txt")
  .trim().split(/\r?\n\s*\r?\n/u)
  .map((body) => body.trim().split(/\r?\n/u)
    .map((row) => row.trim().split(/\s+/u).map(Number)));
const [five, seven] = squares;
const alphabet = new Map(corpus.runes.map((r, i) => [r, i]));
const transcript = read("resources/liber-primus/lp2-transcription.txt");
const numbered = transcript.split("%").slice(36, 39).join("%");
const labels = [...numbered.matchAll(/[1-5]-/gu)];
assert.deepEqual(labels.map((x) => Number(x[0][0])), [1, 2, 3, 4, 5]);
const passages = labels.map((label, i) => {
  const end = i < 4 ? labels[i + 1].index : numbered.indexOf("&", label.index);
  assert.ok(end > label.index);
  return [...numbered.slice(label.index + 2, end)]
    .filter((r) => alphabet.has(r)).map((r) => alphabet.get(r));
});
const itemStarts = [8805, 8944, 9035, 9133, 9229, 9358];

/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const x of values) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (values.length * (values.length - 1));
}

function main() {
  assert.deepEqual(squares.map((rows) => rows.length), [5, 7, 5]);
  for (const row of five) assert.equal(row.reduce((a, b) => a + b), 3301);
  for (const row of seven) assert.equal(row.reduce((a, b) => a + b), 1033);
  assert.deepEqual(passages.map((p) => p.length), [139, 91, 98, 96, 129]);
  const cipher = corpus.pages.filter((p) => p.page < 56).flatMap((p) => p.indices);
  assert.equal(cipher.length, 12956);
  assert.deepEqual(passages.flat(), cipher.slice(itemStarts[0], itemStarts[5]));
  const original = [];
  const sevenKeys = [];
  const fiveKeys = [];
  let global = cipher.slice(0, 0).length;
  for (const page of corpus.pages.filter((p) => p.page < 56)) {
    if (page.page > 39) break;
    for (let i = page.page === 33 ? 91 : 0; i < page.indices.length; i++) {
      if (page.page < 33) break;
      const runePosition = global + i;
      const key7 = seven[page.page - 33][i % 7] % 29;
      let key5 = 0;
      for (let k = 0; k < 5; k++) {
        if (runePosition >= itemStarts[k] && runePosition < itemStarts[k + 1]) {
          key5 = five[k][(runePosition - itemStarts[k]) % 5] % 29;
          break;
        }
      }
      original.push(page.indices[i]);
      sevenKeys.push(key7);
      fiveKeys.push(key5);
    }
    global += page.indices.length;
  }
  assert.equal(original.length, 1589);
  assert.equal(sevenKeys.length, 1589);
  assert.equal(fiveKeys.filter((x) => x !== 0).length > 450, true);

  const decrypt = (which) => original.map((c, i) =>
    (c - ((which === "seven" ? sevenKeys[i] : 0) +
          (which === "five" ? fiveKeys[i] : 0) +
          (which === "both" ? sevenKeys[i] + fiveKeys[i] : 0)) % 29 + 29) % 29);
  const full = decrypt("both");
  const syntheticSource = corpus.pages.find((p) => p.page === 56).indices;
  let prime = 2, j = 0;
  const firstPrimes = [];
  while (firstPrimes.length < 85) {
    let valid = true;
    for (let factor = 2; factor * factor <= prime; factor++) {
      if (prime % factor === 0) { valid = false; break; }
    }
    if (valid) firstPrimes.push(prime);
    prime++;
  }
  const sourcePlain = syntheticSource.map((c, i) => i === 56
    ? c : (c - ((firstPrimes[j++] - 1) % 29) + 29) % 29);
  assert.ok(ioc(sourcePlain) > 0.06);
  const synthetic = original.map((_, i) => sourcePlain[i % sourcePlain.length]);
  const seeded = synthetic.map((p, i) => (p + sevenKeys[i] + fiveKeys[i]) % 29);
  assert.deepEqual(seeded.map((c, i) =>
    (c - (sevenKeys[i] + fiveKeys[i]) % 29 + 29) % 29), synthetic);
  assert.deepEqual(full.map((p, i) =>
    (p + sevenKeys[i] + fiveKeys[i]) % 29), original);
  const result = {};
  for (const kind of ["original", "seven", "five", "both"]) {
    const decoded = kind === "original" ? original : decrypt(kind);
    result[kind] = {
      runeCount: decoded.length,
      ioc: Number(ioc(decoded).toFixed(9)),
      first100: decoded.slice(0, 100).map((v) => corpus.translit[v]).join("")
    };
  }
  assert.ok(result.both.ioc < 0.035);
  console.log(JSON.stringify({
    classification: "SOURCE-SPECIFIED DIRECT PAGE/ITEM MAGIC-SQUARE ADDITIVE NEGATIVE",
    sourcePageScope: [33, 39],
    unnumberedSourceRemainder: 1036,
    sourceNumberedItemSpan: itemStarts,
    historicalMagicSums: [1033, 3301],
    knownP56PlainIoC: Number(ioc(sourcePlain).toFixed(9)),
    results: result,
    claim: "No recovered original plaintext; invertibility/planted recovery are implementation checks."
  }, null, 2));
}
if (require.main === module) main();
module.exports = { main, ioc };
