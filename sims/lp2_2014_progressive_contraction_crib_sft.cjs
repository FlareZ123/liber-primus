"use strict";

/**
 * Re-test the *exact two historical 2014 word cribs* (ITS, LESS) on original
 * physical LP2 pages, then freeze the smallest pagewise word-reset extension.
 * No dictionary fitting, page-key optimization, or result-selected offsets.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");

const runes = [..."ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ"];
assert.equal(runes.length, 29);
const gp = new Map(runes.map((r, i) => [r, i]));

/** @param {number} x @returns {number} */
function mod29(x) { return ((x % 29) + 29) % 29; }

/** @param {number[]} numbers @returns {number} */
function ioc(numbers) {
  const h = Array(29).fill(0);
  for (const x of numbers) h[x]++;
  return h.reduce((sum, n) => sum + n * (n - 1), 0) /
    (numbers.length * (numbers.length - 1));
}

/** @param {string} input @returns {number[]} */
function indices(input) { return [...input].map(r => gp.get(r)); }

/**
 * The only model: historical 26,27,28 on page35 and 27,28,0,1 on page34.
 * Page seed k=3-p (mod29), advance one step *within each printed word*.
 * This seed relation is fitted to both cribs and has no known author selector.
 * @param {number[]} word
 * @param {number} page
 * @param {1|-1} sign
 * @returns {number[]}
 */
function transform(word, page, sign) {
  const start = mod29(3 - page);
  return word.map((x, j) => mod29(x + sign * (start + j)));
}

function main() {
  const corpus = JSON.parse(fs.readFileSync(
    path.join(__dirname, "..", "resources", "liber-primus",
      "lp2-corpus.json"), "utf8"
  ));
  const transcript = fs.readFileSync(
    path.join(__dirname, "..", "resources", "liber-primus",
      "lp2-transcription.txt"), "utf8"
  );
  const parsed = parseLP2Words(transcript);
  assert.equal(parsed.runeCount, 12956);
  assert.equal(parsed.words.length, 2896);

  const claims = [
    {page:34, offset:81, word:["OE","M","S","X"], result:"LESS",
      shifts:[27,28,0,1]},
    {page:35, offset:78, word:["P","E","T"], result:"ITS",
      shifts:[26,27,28]}
  ];

  for (const q of claims) {
    const original = corpus.pages.find(p => p.page === q.page).indices;
    const ciphertext = q.word.map(name => corpus.translit.indexOf(name));
    assert.deepEqual(original.slice(q.offset, q.offset + ciphertext.length),
      ciphertext);
    assert.equal(original.reduce((n, _, i) =>
      n + Number(original.slice(i, i + ciphertext.length)
        .join(",") === ciphertext.join(",")), 0), 1);

    const expected = [...q.result].map(ch => corpus.translit.indexOf(ch));
    const actual = ciphertext.map((x, i) => mod29(x + q.shifts[i]));
    assert.deepEqual(actual, expected);
    assert.deepEqual(transform(ciphertext, q.page, 1), expected);

    const targetRunes = ciphertext.map(i => runes[i]).join("");
    const actualWords = parsed.byContainedPage[q.page]
      .filter(word => word.runes === targetRunes);
    assert.equal(actualWords.length, 1);
    assert.deepEqual(
      transform(transform(expected, q.page, -1), q.page, 1), expected
    );
  }

  const predictions = [];
  for (const page of [33,34,35,36,37]) {
    const exactWords = parsed.byContainedPage[page];
    const ciphertext = exactWords.flatMap(w => indices(w.runes));
    const decoded = exactWords.flatMap(w =>
      transform(indices(w.runes), page, 1));
    assert.ok(decoded.length > 200);
    assert.deepEqual(
      exactWords.flatMap(w => transform(
        transform(indices(w.runes), page, 1), page, -1
      )),
      ciphertext
    );
    const decodedText = exactWords.slice(0, 40).map(w =>
      transform(indices(w.runes), page, 1)
        .map(i => corpus.translit[i]).join("")
    ).join(" ");
    predictions.push({
      page, exactWordRunes: decoded.length,
      originalIoC: ioc(ciphertext), projectedIoC: ioc(decoded),
      first40Words: decodedText
    });
  }
  const expectedProjectedIoCs = [
    .033129595181149794, .033402172937056655,
    .03664262954888479, .03512441399206635,
    .03450807635829662
  ];
  predictions.forEach((p,i)=> {
    assert.ok(Math.abs(p.projectedIoC-expectedProjectedIoCs[i])<1e-12);
    assert.ok(p.projectedIoC<.04);
  });

  console.log(JSON.stringify({
    source: "2014-05-24 original #cicadasolvers log 188780; "
      +"original LP2 pp34-35 exact printed ciphertext",
    historicalCribs: claims,
    model: "P_j=(C_j+3-page+j) mod29, key clock reset each word",
    hypothesisStatus: "post-fitted to the two guessed words, not author-selected",
    fullPagePrediction: "fails ordinary GP-English IoC on pp33-37",
    predictions,
    recoveredUnknownPlaintext: false
  }, null, 2));
}
if (require.main === module) main();
module.exports = {main};
