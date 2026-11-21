"use strict";

/**
 * Source-complete 2016 signed-message / original LP2 p50 table address gate.
 *
 * Every one of 43 authenticated word occurrences is consumed in printed order,
 * including duplicates. GP0 words use literal canonical source transliteration.
 * Both global base60 and drop-f base59 are applied independently to every cell.
 * A matched, discovery-conscious null shuffles all original 256 table tokens
 * with their exact multiplicities; it retains all 43 word addresses, repeats,
 * the fixed scan interval and both possible global radix readings.
 *
 * No unselected word filter, modulo clipping, branch fitting or cipher search.
 * Single-file read-only SFT, Windows 11 Node.js 22 CommonJS.
 *
 * @file sims/lp2_signed2016_all43_unfiltered_pagewayfinding_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const source = read("resources/historical/cicada2016-4gq25-outguess.asc");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const words = (
  source.slice(source.indexOf("Hello."), source.indexOf("-----BEGIN PGP SIGNATURE-----"))
    .replace(/7A35090F/g, "").match(/[A-Za-z]+/g) || []
).map((word) => word.toUpperCase());

assert(source.includes("Its words are the map, their"));
assert(source.includes("numbers are the direction."));
assert.equal(words.length, 43);
assert.equal(new Set(words).size, 34);

const runes = gp.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);
const tokens = grid.pages.flatMap((page) => page.tokens);
const radix60 = grid.alphabet;
const radix59 = radix60.replace("f", "");
assert.equal(tokens.length, 256);
assert.equal(radix60.length, 60);
assert.equal(radix59.length, 59);

/** @param {string} original @returns {number} */
function gp0(original) {
  let text = original.replace(/[KQ]/g, "C").replace(/V/g, "U")
    .replace(/Z/g, "S");
  let sum = 0;
  while (text.length) {
    const rune = runes.find((token) => text.startsWith(token.s));
    assert(rune, "Cannot transcribe: " + original);
    sum += rune.i;
    text = text.slice(rune.s.length);
  }
  return sum;
}

/** @param {string} token @param {string} alphabet @returns {number} */
function decode(token, alphabet) {
  const a = alphabet.indexOf(token[0]);
  const b = alphabet.indexOf(token[1]);
  assert(a >= 0 && b >= 0, "Original p50 token is outside alphabet");
  return a * alphabet.length + b;
}
const address = words.map(gp0);
assert(address.every((x) => x >= 0 && x <= 255));
const value60 = tokens.map((s) => decode(s, radix60));
const value59 = tokens.map((s) => decode(s, radix59));
assert(value60.every((v) => v >= 0 && v < 256));
assert(value59.every((v) => v >= 0 && v < 256));
assert.equal(new Set(address).size, 28);

const originalEntries = words.map((word, offset) => {
  const index = address[offset];
  return {
    offset, word, gp0: index, originalToken: tokens[index],
    value60: value60[index], value59: value59[index],
    lp2PhysicalPage60: value60[index] >= 17 && value60[index] <= 74
      ? value60[index] - 17 : null,
    lp2PhysicalPage59: value59[index] >= 17 && value59[index] <= 74
      ? value59[index] - 17 : null
  };
});
assert.deepEqual(
  originalEntries.filter((entry) => ["DIRECTION", "HELLO", "LIBER"].includes(entry.word))
    .map((entry) => [entry.word, entry.gp0, entry.value60]),
  [["HELLO", 69, 73], ["LIBER", 69, 73], ["DIRECTION", 98, 72]]
);

/**
 * @param {number[]} table
 * @param {number[]} map
 * @returns {{hits: number, terminal: number, maxRun: number}}
 */
function score(table, map) {
  let hits = 0;
  let terminal = 0;
  let run = 0;
  let maxRun = 0;
  for (const x of map) {
    const value = table[x];
    if (value >= 17 && value <= 74) {
      hits++;
      run++;
      maxRun = Math.max(maxRun, run);
    } else {
      run = 0;
    }
    if (value >= 72 && value <= 74) terminal++;
  }
  return { hits, terminal, maxRun };
}
const actual60 = score(value60, address);
const actual59 = score(value59, address);
assert.deepEqual(actual60, { hits: 10, terminal: 3, maxRun: 3 });
assert.deepEqual(actual59, { hits: 10, terminal: 2, maxRun: 3 });

let seed = 0x331043;
/** @returns {number} */
function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}
const indexes = Array.from({ length: 256 }, (_, i) => i);
const replicates = 100000;
let geHit60 = 0;
let geHit59 = 0;
let geMaxHits = 0;
let geTerminal = 0;
let geMaxRun = 0;
let totalHits60 = 0;
let totalHits59 = 0;
for (let trial = 0; trial < replicates; trial++) {
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
  }
  const permutedAddress = address.map((i) => indexes[i]);
  const candidate60 = score(value60, permutedAddress);
  const candidate59 = score(value59, permutedAddress);
  totalHits60 += candidate60.hits;
  totalHits59 += candidate59.hits;
  geHit60 += Number(candidate60.hits >= actual60.hits);
  geHit59 += Number(candidate59.hits >= actual59.hits);
  geMaxHits += Number(Math.max(candidate60.hits, candidate59.hits)
    >= Math.max(actual60.hits, actual59.hits));
  geTerminal += Number(Math.max(candidate60.terminal, candidate59.terminal)
    >= Math.max(actual60.terminal, actual59.terminal));
  geMaxRun += Number(Math.max(candidate60.maxRun, candidate59.maxRun)
    >= Math.max(actual60.maxRun, actual59.maxRun));
}
assert.deepEqual(
  [geHit60, geHit59, geMaxHits, geTerminal, geMaxRun],
  [56599, 56599, 56599, 13580, 38988]
);

console.log(JSON.stringify({
  status: "PASS",
  source: "Original signed 2016 message, original 256 p50 tokens",
  words: words.length,
  distinctWords: new Set(words).size,
  distinctGP0Addresses: new Set(address).size,
  sourceSelection: "all words, printed order, literal GP0, no filtering",
  originalEntries,
  original: { globalBase60: actual60, globalBase59: actual59 },
  matchedPermutationNull: {
    model: "Original tokens permuted without replacement, same 43 fixed addresses",
    seed: "0x331043",
    replicates,
    meanLP2Hits60: totalHits60 / replicates,
    meanLP2Hits59: totalHits59 / replicates,
    exceedances: { base60: geHit60, base59: geHit59, maxAcrossRadices: geMaxHits,
      maxTerminalThree: geTerminal, maxConsecutiveRun: geMaxRun },
    addOneTail: {
      maxAcrossRadices: (geMaxHits + 1) / (replicates + 1),
      maxTerminalThree: (geTerminal + 1) / (replicates + 1),
      maxConsecutiveRun: (geMaxRun + 1) / (replicates + 1)
    }
  },
  conclusion: "No whole-signed-message LP2 page map; selected DIRECTION hit is isolated. No key or new plaintext."
}, null, 2));
