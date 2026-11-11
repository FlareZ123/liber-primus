"use strict";

/**
 * Original LP2 p15 red-nine-rune BASE29 Euclidean quotient -> 2013 ISO DATA/560.13
 * direct source-pad test. No fitted offset, suffix, phase or language key.
 *
 * Node 22: node sims/lp2_p15_56013_quotient_offset_sft.cjs <full DATA_560.13 path>
 * Requires the full 118,818,811-byte file, not the 15,330-byte reconstructed prefix.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.join(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(
  path.join(ROOT, "resources", "liber-primus", "lp2-corpus.json"), "utf8"
));
const p15 = corpus.pages.find((page) => page.page === 15);
const heading = p15.indices.slice(0, 9);
assert.deepEqual(heading, [0, 1, 20, 19, 24, 28, 26, 22, 24]);
const titleNumber = heading.reduce((v, x) => v * 29n + BigInt(x), 0n);
const quotient = titleNumber / 3301n;
const remainder = titleNumber % 3301n;
assert.equal(titleNumber, 29553734724n);
assert.equal(quotient, 8952964n);
assert.equal(remainder, 560n);

const primeSpiral = [
  2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817,
];
assert.deepEqual([0, 13, 17].filter((x) => primeSpiral.includes(x)), [13]);
const section11 = corpus.pages.filter((page) => page.page >= 15 && page.page <= 22)
  .flatMap((page) => page.page === 15 ? page.indices.slice(9) : page.indices);
assert.equal(section11.length, 1894);

const filePath = process.argv[2];
assert.ok(filePath, "Provide the authentic full historical DATA/560.13 file");
const pad = fs.readFileSync(filePath);
assert.equal(pad.length, 118818811, "Unexpected historical dataset length");
const sha256 = crypto.createHash("sha256").update(pad).digest("hex");
assert.equal(sha256, "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f");
const at = Number(quotient);
const offsetBytes = [...pad.subarray(at, at + section11.length)];
assert.equal(offsetBytes.length, 1894);

/** @param {number} x @returns {number} */
const mod29 = (x) => ((x % 29) + 29) % 29;
/** @param {number[]} values @returns {number} */
function ioc(values) {
  const counts = Array(29).fill(0);
  for (const value of values) counts[value]++;
  const n = values.length;
  return counts.reduce((s, v) => s + v * (v - 1), 0) / (n * (n - 1));
}
/** @param {number[]} values @returns {{printable:number,letters:number,spaces:number,preview:string}} */
function asciiReport(values) {
  return {
    printable: values.filter((v) => v >= 32 && v <= 126).length,
    letters: values.filter((v) => (v >= 65 && v <= 90) || (v >= 97 && v <= 122)).length,
    spaces: values.filter((v) => v === 32).length,
    preview: values.slice(0, 150).map((v) => (v >= 32 && v <= 126) ? String.fromCharCode(v) : ".").join(""),
  };
}
/** @param {number[]} values @returns {{ioc:number,preview:string}} */
function gpReport(values) {
  return {
    ioc: ioc(values),
    preview: values.slice(0, 80).map((v) => corpus.translit[v]).join(" "),
  };
}

const xorIndex = section11.map((x, i) => x ^ offsetBytes[i]);
const xorPrime = section11.map((x, i) => corpus.prime[x] ^ offsetBytes[i]);
const gpDecodings = {};
for (const projection of ["mod29", "scaled29"]) {
  const mappedKey = offsetBytes.map((byte) =>
    projection === "mod29" ? byte % 29 : Math.floor(29 * byte / 256)
  );
  gpDecodings[projection] = {
    minus: gpReport(section11.map((x, i) => mod29(x - mappedKey[i]))),
    plus: gpReport(section11.map((x, i) => mod29(x + mappedKey[i]))),
  };
}

// Independent conditional nine-rune exact crib: p15 square spells FIBONACCI,
// so test the source-red heading against that particular English rune phrase.
// The real source neither says it is literal plaintext nor fixes an F-skip rule.
const fibonacci = [0, 10, 17, 3, 9, 24, 5, 5, 10];
const cribHits = [];
for (const projection of ["mod29", "scaled29"]) {
  const mappedKey = [...pad.subarray(at, at + 9)].map((byte) =>
    projection === "mod29" ? byte % 29 : Math.floor(29 * byte / 256)
  );
  for (const sign of [-1, 1]) {
    for (const leadingFIsLiteral of [false, true]) {
      const start = leadingFIsLiteral ? 1 : 0;
      const matches = heading.slice(start).filter((c, i) =>
        mod29(c + sign * mappedKey[i]) === fibonacci[start + i]
      ).length;
      cribHits.push({projection, sign, leadingFIsLiteral, matches,
        encryptedPositions: 9 - start});
    }
  }
}

const report = {
  source: {
    physicalPage: 15,
    headingRunes: heading,
    redWordLengths: [4, 5],
    base29Integer: titleNumber.toString(),
    divisor: 3301,
    quotientAsOffset: at,
    remainderAsFileStem: Number(remainder),
    suffixFromUniqueSpiralPrimeMembership: 13,
    realDatasetSha256: sha256,
    realDatasetBytes: pad.length,
  },
  original: {
    physicalPages: "p15:9 through p22:final rune",
    runes: section11.length,
    originalIoC: ioc(section11),
    xorIndex: asciiReport(xorIndex),
    xorGPPrime: asciiReport(xorPrime),
    gpDecodings,
    conditionalFibonacciTitleCrib: cribHits,
  },
  decision: "These exact models are only proposed interpretations of title arithmetic. None is a verified Cicada decipherment unless the output independently recovers authentic original plaintext.",
};
console.log(JSON.stringify(report, null, 2));
