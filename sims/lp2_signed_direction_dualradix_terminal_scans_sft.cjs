"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

/** @param {string} relative @returns {string} */
function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
}

const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");
const tape = grid.pages.flatMap((p) => p.tokens.flat());
const gp = corpus.translit
  .map((symbol, index) => ({ symbol, index }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

assert.equal(corpus.pages.length, 58);
assert.equal(tape.length, 256);
assert.equal(alpha60.length, 60);
assert.equal(alpha59.length, 59);
assert.equal(corpus.translit[27], "IA");
assert.equal(corpus.translit[21], "NG");

const signedText = signed.slice(
  signed.indexOf("Hello."),
  signed.indexOf("-----BEGIN PGP SIGNATURE-----"),
).replace(/\b7A35090F\b/g, "");
const words = signedText.match(/[A-Za-z]+/g).map((w) => w.toUpperCase());
assert.equal(words.length, 43);
assert.equal(words[29], "DIRECTION");

/**
 * Two 2014-compatible ways to spell English in native GP29.
 * In the second, the historically printed IA/IO and NG/ING rune names
 * can each be a single rune. Other digraphs use the same longest match.
 * @param {string} word
 * @param {boolean} ligatures
 * @returns {number}
 */
function gp0(word, ligatures) {
  const latin = word.toUpperCase()
    .replace(/QU/g, "CW")
    .replace(/[KQ]/g, "C")
    .replace(/V/g, "U")
    .replace(/Z/g, "S")
    .replace(/[^A-Z]/g, "");
  let sum = 0;
  for (let pos = 0; pos < latin.length;) {
    if (ligatures && latin.startsWith("ING", pos)) {
      sum += 21;
      pos += 3;
      continue;
    }
    if (ligatures && latin.startsWith("IO", pos)) {
      sum += 27;
      pos += 2;
      continue;
    }
    const found = gp.find((item) => latin.startsWith(item.symbol, pos));
    assert.ok(found, "Unmapped GP29 source word " + word + " at " + pos);
    sum += found.index;
    pos += found.symbol.length;
  }
  return sum;
}

/**
 * @param {number} index
 * @param {string} alphabet
 * @returns {number|null}
 */
function cell(index, alphabet) {
  if (index >= 256) return null;
  const token = tape[index];
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0, "Invalid table digit " + token);
  return hi * alphabet.length + lo;
}

const register = words.map((word, ordinal) => {
  const literalIndex = gp0(word, false);
  const ligatedIndex = gp0(word, true);
  return {
    ordinal: ordinal + 1,
    word,
    literalIndex,
    ligatedIndex,
    literalBase59: cell(literalIndex, alpha59),
    literalBase60: cell(literalIndex, alpha60),
    ligatedBase59: cell(ligatedIndex, alpha59),
    ligatedBase60: cell(ligatedIndex, alpha60),
  };
});

const changed = register.filter((entry) => entry.literalIndex !== entry.ligatedIndex);
assert.deepEqual(changed.map((entry) => entry.word), ["MEANING", "DIRECTION"]);
const convergent = changed.filter((entry) =>
  entry.literalBase60 === entry.ligatedBase59
  && entry.literalBase60 >= 17
  && entry.literalBase60 <= 74);
assert.deepEqual(convergent.map((entry) => entry.word), ["DIRECTION"]);

const direction = register[29];
assert.deepEqual(
  [
    direction.literalIndex,
    direction.ligatedIndex,
    tape[direction.literalIndex],
    tape[direction.ligatedIndex],
    direction.literalBase59,
    direction.literalBase60,
    direction.ligatedBase59,
    direction.ligatedBase60,
  ],
  [98, 112, "1C", "1D", 71, 72, 72, 73],
);

assert.deepEqual(
  [71, 72, 73].map((scan) => ({
    scan,
    physicalPage: scan - 17,
    runes: corpus.pages[scan - 17].runic_count,
  })),
  [
    { scan: 71, physicalPage: 54, runes: 232 },
    { scan: 72, physicalPage: 55, runes: 76 },
    { scan: 73, physicalPage: 56, runes: 85 },
  ],
);

const namedFollowers = ["PATH", "DEVOTED", "WAY", "MAP", "ROAD", "DIRECTION"];
assert.deepEqual(
  namedFollowers.map((word) => gp0(word, false)),
  [39, 102, 57, 56, 54, 98],
);
assert.equal(tape[102], "0W");
assert.equal(cell(102, alpha60), 32);
assert.equal(cell(102, alpha59), 32);
assert.equal(corpus.pages[32].runic_count, 121);
assert.equal(gp0("EPIPHANY", false), 121);

console.log(JSON.stringify({
  status: "PASS",
  originalSignedWords: register.length,
  distinctWords: new Set(words).size,
  wordsAffectedByHistoricalLigature: changed,
  uniqueCrossRadixCrossSpellingConvergence: convergent,
  direction: {
    ordinal: direction.ordinal,
    direct: direction.literalIndex,
    phoneticIoToIa: direction.ligatedIndex,
    originalTokens: ["1C", "1D"],
    destinations: {
      literalBase59: { scan: 71, physicalPage: 54 },
      literalBase60: { scan: 72, physicalPage: 55 },
      ligatedBase59: { scan: 72, physicalPage: 55 },
      ligatedBase60: { scan: 73, physicalPage: 56 },
    },
  },
  independentSignedDevoted: {
    gp0: 102,
    tableToken: "0W",
    decodedPhysicalPage: 32,
    pageRunes: 121,
    epiphanyGp0: 121,
  },
  inferenceLimit: "Terminal page selection only; no original LP2 plaintext, key or cipher",
}, null, 2));
