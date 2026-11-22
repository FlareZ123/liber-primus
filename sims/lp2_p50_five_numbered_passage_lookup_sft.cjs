"use strict";

/**
 * Source-typed original p50 high/low digit book-lookup hypothesis.
 *
 * The 256 physically printed p49–51 cells are two-character tokens with
 * first digit '0'..'4' and second digit a source-attested base60 digit.
 * The original p36–38 artwork prints exactly five numbered passages 1..5.
 * Decode token ab as rune at offset b (zero based) of numbered passage a+1.
 * All 256 book coordinates must be valid in the unmodified first 60 runes
 * of each passage. This yields a fully specified 256-rune key/message;
 * compare its directly readable GP29 and fixed C-K / C+K consumers with
 * original unknown prose and the independently clear p57.
 *
 * This is a source-led negative gate, not a claim of recovered plaintext.
 * Windows 11 Node.js 22, single runnable SFT:
 * node sims/lp2_p50_five_numbered_passage_lookup_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const text = name => fs.readFileSync(path.join(root, name), "utf8");
const gp = JSON.parse(text("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(text("resources/liber-primus/base60-grid.json"));
const source = text("resources/liber-primus/lp2-transcription.txt");
const pageSegments = source.split("%");
const numberedSection = pageSegments.slice(36, 39).join("\n");
const labelPattern = /([1-5])-/g;
const labels = Array.from(numberedSection.matchAll(labelPattern),
  found => ({n: Number(found[1]), offset: found.index}));
assert.deepEqual(labels.map(x => x.n), [1, 2, 3, 4, 5],
  "five physically numbered original p36–38 blocks");
const glyphIndex = new Map(gp.runes.map((r, i) => [r, i]));
const sourceEnd = numberedSection.indexOf("&", labels[4].offset);
assert(sourceEnd > labels[4].offset);
const paragraphs = labels.map((label, i) => {
  const end = labels[i + 1]?.offset ?? sourceEnd;
  const part = numberedSection.slice(label.offset + 2, end);
  return Array.from(part).filter(x => glyphIndex.has(x))
    .map(x => glyphIndex.get(x));
});
assert.deepEqual(paragraphs.map(x => x.length),
  [139, 91, 98, 96, 129], "unchanged source numbered units");
assert.equal(grid.rows.length, 32);
assert(grid.rows.every(row => row.length === 8));
const tokens = grid.rows.flat();
const one = grid.alphabet;
assert.equal(one.length, 60);
assert.equal(tokens.length, 256);
const ranges = new Int32Array(5);
const lookup = tokens.map((token, i) => {
  assert.equal(token.length, 2, "physical printed token exactly two digits");
  const passage = Number(token[0]);
  const offset = one.indexOf(token[1]);
  assert(Number.isInteger(passage) && passage >= 0 && passage <= 4);
  assert(offset >= 0 && offset < 60);
  assert(offset < paragraphs[passage].length, "in-range source rune slot " + i);
  ranges[passage]++;
  return paragraphs[passage][offset];
});
assert.equal(lookup.length, 256);
const allIn = ranges.reduce((sum, n) => sum + n, 0);
assert.equal(allIn, 256);
const ic = seq => {
  const counts = new Int32Array(29);
  seq.forEach(i => counts[i]++);
  return Array.from(counts).reduce((s, n) => s + n * (n - 1), 0) /
    (seq.length * (seq.length - 1));
};
const translit = seq => seq.map(i => gp.translit[i]).join("");
const shift = (cipher, key, sign) =>
  cipher.map((v, i) => (v + 29 + sign * key[i % key.length]) % 29);
const flank = [49, 51].flatMap(i => gp.pages[i].indices);
assert.equal(flank.length, 158);
const minus = shift(flank, lookup, -1);
const plus = shift(flank, lookup, +1);
const clear = gp.pages[57].indices;
const planted = shift(clear, lookup, +1);
assert.deepEqual(shift(planted, lookup, -1), clear,
  "source-selected key correctly inverses a planted native-GP sample");
const sourceOutput = {
  firstDigitCounts: Array.from(ranges),
  paragraphLengths: paragraphs.map(x => x.length),
  tableUnits: tokens.length,
  flankLength: flank.length,
  keyIoC: ic(lookup),
  keyPrefix: translit(lookup.slice(0, 100)),
  flankOriginalIoC: ic(flank),
  flankMinusIoC: ic(minus),
  flankPlusIoC: ic(plus),
  flankMinusFirst90: translit(minus.slice(0, 90)),
  flankPlusFirst90: translit(plus.slice(0, 90)),
  clearP57IoC: ic(clear)
};
console.log(JSON.stringify(sourceOutput, null, 2));
assert.equal(ic(lookup), 0.03939950980392157);
assert.equal(ic(clear), 0.06270996640537514);
assert(ic(minus) < 0.045 && ic(plus) < 0.045);
console.log("PASS: exact five-numbered-passage lookup is valid, "
  + "but direct result and additive original-flank consumers are not "
  + "authenticated native-GP plaintext.");
