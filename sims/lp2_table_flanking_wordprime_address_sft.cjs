/**
 * @file Direct word-prime-sum addresses into the LP2 256-cell numeric table.
 * @description A frozen, keyless original-source gate for the complete
 * p48–49 (138-rune) and p51–52 (170-rune) table-flanking sentences.
 *
 * Run: node sims/lp2_table_flanking_wordprime_address_sft.cjs
 */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.join(__dirname, "..");
/** @param {string} location */
const read = (location) => fs.readFileSync(path.join(root, location), "utf8");
const transcript = read("resources/liber-primus/lp2-transcription.txt").split("%");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const runePrimes = new Map(corpus.runes.map((rune, i) => [rune, corpus.prime[i]]));

assert.equal(transcript.length, 57); // physical p50 has no runes
assert.equal(runePrimes.size, 29);
assert.equal(grid.bytes.length, 256);
assert.equal(
  crypto.createHash("sha256").update(Buffer.from(grid.bytes)).digest("hex"),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290"
);

// The preceding sentence continues across p48 -> p49; the following sentence
// continues across p51 -> p52. Physical p50 is the rune-free central grid page.
const pre = transcript[48].slice(transcript[48].lastIndexOf(".") + 1)
  + transcript[49].slice(0, transcript[49].indexOf(".") + 1);
const post = transcript[50]
  + transcript[51].slice(0, transcript[51].indexOf(".") + 1);

/**
 * Preserve source hyphen and full-stop word boundaries and join printed wraps.
 * @param {string} passage
 * @returns {{lengths: number[], primeSums: number[]}}
 */
function parsePassage(passage) {
  const words = passage.replace(/[/\r\n]/g, "").split(/[-.]/)
    .map((word) => Array.from(word).filter((rune) => runePrimes.has(rune)))
    .filter((runes) => runes.length > 0);
  return {
    lengths: words.map((runes) => runes.length),
    primeSums: words.map((runes) =>
      runes.reduce((sum, rune) => sum + runePrimes.get(rune), 0)),
  };
}

const before = parsePassage(pre);
const after = parsePassage(post);
assert.deepEqual(
  [before.lengths.length, before.lengths.reduce((a, b) => a + b, 0)],
  [33, 138]
);
assert.deepEqual(
  [after.lengths.length, after.lengths.reduce((a, b) => a + b, 0)],
  [40, 170]
);

/**
 * The signed 2016 statement motivates word-value coordinates, but does not
 * authenticate either numerical address origin. Test both natural originals.
 * @param {number[]} sums
 * @param {number} origin zero-based 0 or one-based -1
 * @param {number[]} cells
 * @returns {number[]}
 */
function readCells(sums, origin, cells) {
  return sums.map((sum) => cells[(sum + origin + 256) % 256]);
}

/** @param {number[]} bytes */
function longestLettersOrSpace(bytes) {
  let longest = 0;
  let run = 0;
  for (const byte of bytes) {
    const isText = byte === 32 ||
      (byte >= 65 && byte <= 90) || (byte >= 97 && byte <= 122);
    run = isText ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  return longest;
}

/** @param {string} label @param {number[]} bytes */
function describe(label, bytes) {
  const printable = bytes.filter((n) => n >= 32 && n <= 126).length;
  const ascii = bytes.map((n) =>
    n >= 32 && n <= 126 ? String.fromCharCode(n) : ".").join("");
  const hex = Buffer.from(bytes).toString("hex");
  console.log(
    label,
    JSON.stringify({
      count: bytes.length,
      printableASCII: printable,
      longestLettersOrSpace: longestLettersOrSpace(bytes),
      ascii,
      hex,
    })
  );
  return hex;
}

const expected = new Map([
  ["pre/zero", "9eaf9b8d81cda32e21348fb8c4949bed7af9e6a90020cb70e6762f597ae7f96efe"],
  ["post/zero", "3a3359500448c0732f9666c1af0d56c63dc7f9d94f90ad4a06b84c0590debade6c33a999c7d4fd15"],
  ["pre/one", "713900a90a4f14f5e74449236adb0061cefb497821e5500e49fe699fcebd5c2f50"],
  ["post/one", "8e7c9fbdf78dc620104621c9a6e93bdc06c0fbe9a4af816eaf0ec285f923a723a97c78ae6bb74c7f"],
]);

for (const [name, sums] of [["pre", before.primeSums], ["post", after.primeSums]]) {
  for (const [label, origin] of [["zero", 0], ["one", -1]]) {
    const id = name + "/" + label;
    const bytes = readCells(sums, origin, grid.bytes);
    assert.equal(describe(id, bytes), expected.get(id));
  }
}

// Constructive control: a table populated with literal ASCII A at every
// addressed cell yields the exact expected direct read, even with repeated
// addresses. The original source is never modified.
for (const origin of [0, -1]) {
  const planted = grid.bytes.slice();
  for (const sum of before.primeSums.concat(after.primeSums)) {
    planted[(sum + origin + 256) % 256] = 65;
  }
  assert.ok(readCells(before.primeSums, origin, planted).every((x) => x === 65));
  assert.ok(readCells(after.primeSums, origin, planted).every((x) => x === 65));
}
console.log("SELFTEST_PASS original source, full sentences, four readouts, two plants");
