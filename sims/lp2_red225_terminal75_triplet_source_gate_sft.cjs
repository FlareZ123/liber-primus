"use strict";
/**
 * Original LP2 red-225 -> terminal p55 75-rune direct-key gate.
 *
 * Hypothesis: 225 highlighted runes = three per original archive page
 * (17 LP1 + 58 LP2 = 75). The p55 original page has 76 runes, with
 * its first rune carried over from a word begun on p54. Try reading
 * 75 consecutive red triplets as 75 word-direction sums (mod 29).
 *
 * A parallel source-bound book-code necessary-condition gate interprets
 * these triplets as (LP2 page, printed line, rune). It requires ALL 75
 * addresses to be valid before it can furnish a complete key.
 *
 * Interpretation is speculative; this tests a frozen direct mechanism,
 * not an author-selected cipher or a recovered plaintext.
 *
 * Node 22, CommonJS, no writes:
 * node sims/lp2_red225_terminal75_triplet_source_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const json = (name) => JSON.parse(fs.readFileSync(path.join(root, name), "utf8"));
const corpus = json("resources/liber-primus/lp2-corpus.json");
const ink = json("resources/liber-primus/lp2-ink-annotations.json");
const raw = fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-transcription.txt"), "utf8");
const mod = (x) => ((x % 29) + 29) % 29;
const runeMap = new Map(corpus.runes.map((r, i) => [r, i]));
const latin = (a) => a.map((v) => corpus.translit[v]).join("");
/** @param {number[]} array */
function ioc(array) {
  const count = Array(29).fill(0);
  for (const i of array) count[i]++;
  return count.reduce((n, x) => n + x * (x - 1), 0) /
    (array.length * (array.length - 1));
}
const red = [];
for (const record of ink.pages) {
  const source = corpus.pages.find((page) => page.page === record.page);
  assert.ok(source);
  for (const span of record.red_spans || []) {
    const exact = source.indices.slice(span.start, span.start + span.length);
    assert.equal(exact.length, span.length);
    assert.deepEqual(exact.map((i) => corpus.runes[i]),
      Array.from(span.runes));
    red.push(...exact);
  }
}
assert.equal(red.length, 225);
const original = corpus.pages.find((page) => page.page === 55).indices;
assert.equal(original.length, 76);
const target = original.slice(1);
assert.equal(target.length, 75);

const keyModes = {
  gp_ordinal_sum: (r) => r,
  gp_prime_sum: (r) => corpus.prime[r]
};
const outputs = [];
for (const [name, value] of Object.entries(keyModes)) {
  const key = Array.from({length:75}, (_, i) => mod(
    value(red[3*i]) + value(red[3*i+1]) + value(red[3*i+2])
  ));
  for (const sign of [-1, 1]) {
    const decoded = target.map((c, i) => mod(c + sign * key[i]));
    const reencoded = decoded.map((p, i) => mod(p - sign * key[i]));
    assert.deepEqual(reencoded, target);
    const plant = Array.from({length:75},
      (_, i) => corpus.pages.find((p) => p.page === 57).indices[i]);
    const plantedCipher = plant.map((p, i) => mod(p - sign * key[i]));
    assert.deepEqual(plantedCipher.map((c, i) => mod(c + sign * key[i])),
      plant);
    outputs.push({key:name, sign, ioc:ioc(decoded), preview:latin(decoded)});
  }
}
assert.ok(outputs.every((o) => o.ioc < 0.045));
const physical = raw.split(/\n%\n/);
for (let i=0; i<30; i++) {
  const sourceRuneCount = [...physical[i]].filter((r) => runeMap.has(r)).length;
  assert.equal(sourceRuneCount, corpus.pages[i].indices.length);
}
const lines = physical.map((page) => page.split(/\r?\n/)
  .filter((line) => [...line].some((r) => runeMap.has(r)))
  .map((line) => [...line].filter((r) => runeMap.has(r))
    .map((r) => runeMap.get(r))));
const pageLineRune = [];
for (const numeral of ["ordinal", "prime"]) {
  for (const indexBase of [0, 1]) {
    const rejected = {page:0,line:0,rune:0};
    const readout = [];
    for (let i=0; i<75; i++) {
      const address = red.slice(3*i, 3*i+3).map((x) =>
        (numeral === "prime" ? corpus.prime[x] : x) - indexBase);
      const [page, line, rune] = address;
      if (page < 0 || page > 55) {rejected.page++;continue;}
      if (line < 0 || line >= lines[page].length) {
        rejected.line++;continue;
      }
      if (rune < 0 || rune >= lines[page][line].length) {
        rejected.rune++;continue;
      }
      readout.push(lines[page][line][rune]);
    }
    pageLineRune.push({numeral,indexBase,valid:readout.length,
      rejected,fragment:latin(readout)});
  }
}
assert.deepEqual(pageLineRune.map((x) => x.valid),[21,27,0,0]);
assert.equal(outputs.length, 4);
console.log(JSON.stringify({
  mechanism:"Three original highlighted GP runes per one of 75 archive images",
  keyLength:75,originalRedRunes:red.length,
  p55Runes:original.length,p55FirstRuneReserved:true,
  p55RawTailIoC:ioc(target),
  solvedP57SourceIoC:ioc(corpus.pages.find((p) => p.page === 57).indices),
  directKeyOutputs:outputs,
  literalPageLineRuneBookCode:pageLineRune,
  originalRoundTrips:4,syntheticP57PlantsRecovered:4,
  verdict:"No readable source-original p55 segment under four direct sums; "+
    "all four literal triplet page/line/rune book-code conventions "+
    "fail to address the complete 75-symbol recipient."
}, null, 2));
