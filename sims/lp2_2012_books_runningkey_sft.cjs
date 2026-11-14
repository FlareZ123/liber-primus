"use strict";

/**
 * Original 2012 Cicada book-code texts as directly transferred running keys.
 * No page-specific private key or fitted phase. Both texts are separately
 * pinned historical sources; neither is copied into this research repository.
 *
 * Node.js 22:
 * node sims/lp2_2012_books_runningkey_sft.cjs path\to\book-code.py path\to\31447.txt
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

function pinnedBlob(file, expected) {
  const buf = fs.readFileSync(file);
  const actual = crypto.createHash("sha1").update(Buffer.concat([
    Buffer.from("blob " + buf.length + "\0"), buf,
  ])).digest("hex");
  assert.equal(actual, expected, "Historical source text or version changed");
  return buf.toString("utf8");
}

assert(process.argv[2] && process.argv[3],
  "Pass original archived 2012 Agrippa book-code.py and Britannica 31447.txt");
const agrippaText = pinnedBlob(process.argv[2],
  "a4e13bdcbfa64be9c087e092b51f028126f51cb3")
  .match(/^book\s*=\s*"""([\s\S]*?)"""/mu)?.[1];
assert(agrippaText, "Missing original Agrippa poem assignment");
const britannicaLines = pinnedBlob(process.argv[3],
  "8cba4356812ff852e3fe9c88e80ab1e9b5b8670c").split(/\r?\n/u);
const cicadaIndex = britannicaLines.findIndex(
  x => /^\s*CICADA \(_Cicadidae_\)/u.test(x));
assert.equal(cicadaIndex, 15388);
const britannicaText = britannicaLines.slice(cicadaIndex).join("\n");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources/liber-primus/lp2-corpus.json"), "utf8"));
const ciphertext = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(ciphertext.length, 12956);
const solved = corpus.pages.find(p => p.page === 57).indices;
assert.equal(solved.length, 95);

const chapters = [729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308];
assert.equal(chapters.reduce((a, n) => a + n, 0), ciphertext.length);
const mapping = new Map(corpus.translit.map((value, index) => [value, index]));
mapping.set("ING", 21); mapping.set("IO", 27);
const oldDigraphs = ["TH", "NG", "EO", "OE", "AE", "IA", "EA"];
const sourceDigraphs = ["ING", "TH", "NG", "EO", "OE", "AE", "IO", "EA"];

/**
 * Reversibly interpret historical Latin text as a GP29 plaintext/key stream.
 * K→C, Q→CW, V→U, Z→S follow existing source-native GP normalization.
 * @param {string} text
 * @param {boolean} sourceWriterSpelling
 * @returns {number[]}
 */
function tokenize(text, sourceWriterSpelling) {
  const joined = (text.toUpperCase().match(/[A-Z]+/gu) || []).join("");
  const letters = joined.replaceAll("K", "C").replaceAll("V", "U")
    .replaceAll("Q", "CW").replaceAll("Z", "S");
  const digraphs = sourceWriterSpelling ? sourceDigraphs : oldDigraphs;
  const output = [];
  for (let i = 0; i < letters.length;) {
    const token = digraphs.find(t => letters.startsWith(t, i)) || letters[i];
    const index = mapping.get(token);
    assert.notEqual(index, undefined, "Unmapped GP glyph");
    output.push(index);
    i += token.length;
  }
  return output;
}

/** @param {number[]} x @returns {number} */
function ioc(x) {
  const freq = new Uint32Array(29);
  for (const n of x) freq[n]++;
  return [...freq].reduce((a, n) => a + n * (n - 1), 0) /
    (x.length * (x.length - 1));
}

/**
 * @param {number[]} input
 * @param {number[]} key
 * @param {number} sign +1 or -1
 * @param {boolean} reset At original nine visible chapters
 * @param {boolean} forward encode P to C, else decode C to P
 */
function transform(input, key, sign, reset, forward) {
  const output = [];
  const sections = reset ? chapters : [input.length];
  let pos = 0, tick = 0;
  for (const length of sections) {
    if (reset) tick = 0;
    for (let i = 0; i < length; i++) {
      const delta = sign * key[tick++ % key.length] * (forward ? -1 : 1);
      output.push((input[pos++] + delta % 29 + 29) % 29);
    }
  }
  assert.equal(pos, input.length);
  return output;
}

const outcomes = [];
for (const [name, sourceText] of [
  ["2012 Gibson Agrippa", agrippaText],
  ["2012 Britannica CICADA-to-EOF", britannicaText],
]) {
  for (const writing of ["legacy", "LP1-author"]) {
    const key = tokenize(sourceText, writing === "LP1-author");
    for (const reset of [false, true]) {
      for (const sign of [-1, 1]) {
        const P = transform(ciphertext, key, sign, reset, false);
        const C = transform(P, key, sign, reset, true);
        assert.deepEqual(C, ciphertext, "Original ciphertext round-trip failed");
        const plantedC = transform(solved, key, sign, false, true);
        const recovered = transform(plantedC, key, sign, false, false);
        assert.deepEqual(recovered, solved, "Authentic p57 plant failed");
        const score = ioc(P);
        assert(score < 0.04, "A source-book inverse unexpectedly resembles prose");
        outcomes.push({
          keySource: name,
          spelling: writing,
          keyRunes: key.length,
          clock: reset ? "nine printed chapter resets" : "uninterrupted p0 clock",
          direction: sign === -1 ? "subtract" : "add",
          completeInverseIoC: score,
          originalForwardPass: true,
          knownP57Plant95of95: true,
        });
      }
    }
  }
}
const best = outcomes.reduce((a, b) =>
  b.completeInverseIoC > a.completeInverseIoC ? b : a);
assert.equal(outcomes.length, 16);
assert(ioc(solved) > 0.06);
console.log(JSON.stringify({
  sourceScope: "Two authentic Cicada 2012 source books; full 12956 original runes",
  testedDirectInverseVariants: outcomes.length,
  originalIoC: ioc(ciphertext),
  authenticSolvedP57IoC: ioc(solved),
  bestInverse: best,
  all: outcomes,
  decision: "No directly transferred 2012 book-source additive GP29 running key",
  limits: "Unchosen book offsets, rewritten source, F-transparent branch and further layers remain untested",
}, null, 2));
