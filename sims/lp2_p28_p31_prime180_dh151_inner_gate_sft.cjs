"use strict";

/**
 * Source-selected p28-p31 prime-position receiver against the once-shed p50
 * 30x6 interior, using only the DH151 group elements supplied by the p28 loop.
 *
 * Candidate key:
 *   key_i = base^(tableValue_i) mod151 mod29
 * where base is one of g=35, A=107, B=66, K=87 and tableValue uses either
 * documented base60 or the independently motivated base59 reading.
 *
 * Run:
 *   node sims/lp2_p28_p31_prime180_dh151_inner_gate_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { buildSourceNativeTrigramModel } = require("./lp1_source_native_trigram_model.cjs");

const root = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const referenceText = read("resources/liber-primus/lp1-plaintext-reference.txt");
const model = buildSourceNativeTrigramModel({ corpus, referenceText });

/** @param {number} n */
function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) {
    if (n % d === 0) return false;
  }
  return true;
}

/** @param {number} n */
function primePi(n) {
  let count = 0;
  for (let value = 2; value <= n; value += 1) {
    if (isPrime(value)) count += 1;
  }
  return count;
}

/** @param {number} n */
function mod29(n) {
  return ((n % 29) + 29) % 29;
}

/** @param {number} base @param {number} exponent @param {number} modulus */
function powMod(base, exponent, modulus) {
  let out = 1;
  let factor = base % modulus;
  let power = exponent;
  while (power > 0) {
    if (power % 2 === 1) out = (out * factor) % modulus;
    factor = (factor * factor) % modulus;
    power = Math.floor(power / 2);
  }
  return out;
}

const pages = [28, 29, 30, 31].map((pageNumber) => {
  const row = corpus.pages.find((candidate) => candidate.page === pageNumber);
  assert.ok(row);
  return row;
});
assert.deepEqual(pages.map((page) => page.indices.length), [269, 277, 263, 269]);
assert.ok(pages.every((page) => isPrime(page.indices.length)));

const block = pages.flatMap((page) => page.indices);
assert.equal(block.length, 1078);
assert.equal(primePi(block.length), 180);

const primeTape = [];
for (let position = 1; position <= block.length; position += 1) {
  if (isPrime(position)) primeTape.push(block[position - 1]);
}
assert.equal(primeTape.length, 180);

const tokens = grid.pages.flatMap((page) => page.tokens);
const innerAddresses = [];
for (let row = 1; row < 31; row += 1) {
  for (let column = 1; column < 7; column += 1) {
    innerAddresses.push(row * 8 + column);
  }
}
assert.equal(innerAddresses.length, 180);

const alphabet59 = grid.alphabet.replace("f", "");
/** @param {string} token */
function base59(token) {
  const high = alphabet59.indexOf(token[0]);
  const low = alphabet59.indexOf(token[1]);
  assert.ok(high >= 0 && low >= 0);
  return high * 59 + low;
}

const values = {
  base59: innerAddresses.map((address) => base59(tokens[address])),
  base60: innerAddresses.map((address) => grid.bytes[address]),
};

const modulus = 151;
const groupBases = {
  g35: 35,
  A107: 107,
  B66: 66,
  K87: 87,
};
assert.equal(powMod(groupBases.g35, 150, modulus), 1);
assert.equal(powMod(groupBases.g35, 21, modulus), groupBases.A107);
assert.equal(powMod(groupBases.g35, 55, modulus), groupBases.B66);
assert.equal(powMod(groupBases.g35, 21 * 55, modulus), groupBases.K87);

const candidates = [];
for (const [radix, tableValues] of Object.entries(values)) {
  for (const [baseName, base] of Object.entries(groupBases)) {
    const key = tableValues.map((value) => powMod(base, value, modulus) % 29);
    for (const [direction, sign] of [["subtract", -1], ["add", 1]]) {
      const plain = primeTape.map((rune, index) => mod29(rune + sign * key[index]));
      candidates.push({
        radix,
        baseName,
        direction,
        trigram: model.scoreStream(plain).mean,
        prefix: model.spell(plain.slice(0, 90)),
        keyDistinct: new Set(key).size,
      });
    }
  }
}

/* Reversible planted control for the exact transform family. */
const plantedKey = values.base59.map((value) =>
  powMod(groupBases.g35, value, modulus) % 29
);
const plantedPlain = model.training.slice(0, 180);
const plantedCipher = plantedPlain.map((rune, index) =>
  mod29(rune + plantedKey[index])
);
const recovered = plantedCipher.map((rune, index) =>
  mod29(rune - plantedKey[index])
);
assert.deepEqual(recovered, plantedPlain);
assert.ok(model.scoreStream(recovered).mean > -2.6);

candidates.sort((left, right) => right.trigram - left.trigram);

console.log(JSON.stringify({
  source: {
    pages: [28, 29, 30, 31],
    totalRunes: block.length,
    primePositionRunes: primeTape.length,
    shedP50Cells: innerAddresses.length,
  },
  dh: {
    modulus,
    groupBases,
  },
  best: candidates.slice(0, 16),
  controls: {
    solvedP57Trigram: model.p57Score,
    plantedRecovered: recovered.length,
    plantedTrigram: model.scoreStream(recovered).mean,
  },
}, null, 2));
