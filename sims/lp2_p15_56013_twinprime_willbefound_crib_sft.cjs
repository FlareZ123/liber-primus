"use strict";

/**
 * Conditional p15 red-heading crib test at the original 2013 DATA/560.13
 * quotient offset. No offset search, phase search, or language scoring.
 *
 * Node 22:
 *   node sims/lp2_p15_56013_twinprime_willbefound_crib_sft.cjs <DATA/560.13>
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = path.join(__dirname, "..");
const base = path.join(ROOT, "resources", "liber-primus");
const corpus = JSON.parse(fs.readFileSync(path.join(base, "lp2-corpus.json"), "utf8"));
const ink = JSON.parse(fs.readFileSync(path.join(base, "lp2-ink-annotations.json"), "utf8"));
const p15 = corpus.pages.find((p) => p.page === 15);
assert.deepEqual(ink.pages.find((p) => p.page === 15).red_spans
  .map((s) => [s.start, s.length]), [[0, 9], [9, 11]]);

const mod29 = (x) => ((x % 29) + 29) % 29;
const title = p15.indices.slice(0, 9);
const lower = p15.indices.slice(9, 20);
assert.deepEqual(title, [0, 1, 20, 19, 24, 28, 26, 22, 24]);
assert.deepEqual(lower, [20, 1, 21, 9, 5, 1, 17, 9, 16, 0, 21]);

const tokens = corpus.translit.map((g, i) => [g, i]).sort((a, b) => b[0].length - a[0].length);
function runes(word) {
  const text = word.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < text.length;) {
    const hit = tokens.find(([g]) => text.startsWith(g, i));
    assert.ok(hit, "Unencodable candidate word: " + word);
    out.push(hit[1]);
    i += hit[0].length;
  }
  return out;
}

// These are conditional source-shaped cribs, not established plaintext.
const upperPlain = runes("TWIN PRIME");
const lowerPlain = runes("WILL BE FOUND");
assert.equal(upperPlain.length, 9);
assert.equal(lowerPlain.length, 11);
const upperKey = title.map((v, i) => mod29(v - upperPlain[i]));
const lowerKey = lower.map((v, i) => mod29(v - lowerPlain[i]));
assert.deepEqual(upperKey, [13, 23, 10, 10, 11, 24, 16, 3, 6]);
assert.deepEqual(lowerKey, [13, 20, 1, 18, 17, 12, 17, 6, 15, 20, 27]);

// The p15 upper red heading's BASE29 integer fixes the historical pad offset.
const titleNumber = title.reduce((v, x) => v * 29n + BigInt(x), 0n);
const quotient = titleNumber / 3301n;
const remainder = titleNumber % 3301n;
assert.equal(titleNumber, 29553734724n);
assert.equal(quotient, 8952964n);
assert.equal(remainder, 560n);
const offset = Number(quotient);

const filePath = process.argv[2];
assert.ok(filePath, "Provide the authentic full historical DATA/560.13 file");
const pad = fs.readFileSync(filePath);
assert.equal(pad.length, 118818811, "Unexpected historical dataset length");
const sha256 = crypto.createHash("sha256").update(pad).digest("hex");
assert.equal(sha256, "db79072ce580efa54acf5f31f3ef0eb00aef867871a051d04e27ee5e7fbc112f");
const window = [...pad.subarray(offset, offset + 11)];
assert.equal(window.length, 11);

const upperIndexXor = title.map((v, i) => v ^ upperPlain[i]);
const lowerIndexXor = lower.map((v, i) => v ^ lowerPlain[i]);
const upperPrimeXor = title.map((v, i) => corpus.prime[v] ^ corpus.prime[upperPlain[i]]);
const lowerPrimeXor = lower.map((v, i) => corpus.prime[v] ^ corpus.prime[lowerPlain[i]]);

function compare(observed, expected) {
  const offsets = expected.flatMap((v, i) => observed[i] === v ? [i] : []);
  return {matches: offsets.length, length: expected.length, matchOffsetsZeroBased: offsets,
    exact: offsets.length === expected.length};
}
function mapWindow(bytes, mode) {
  return bytes.map((b) => mode === "mod29" ? b % 29 :
    mode === "scaled29" ? Math.floor(29 * b / 256) : b);
}
const tests = [];
for (const [name, expectedKey, indexXor, primeXor] of [
  ["upper_TWIN_PRIME", upperKey, upperIndexXor, upperPrimeXor],
  ["lower_WILL_BE_FOUND", lowerKey, lowerIndexXor, lowerPrimeXor],
]) {
  for (const reverse of [false, true]) {
    const bytes = reverse ? [...window].reverse() : [...window];
    const selected = bytes.slice(0, expectedKey.length);
    for (const mode of ["mod29", "scaled29"]) {
      const mapped = mapWindow(selected, mode);
      tests.push({crib: name, direction: reverse ? "reverse" : "forward",
        transfer: mode, sign: "+", ...compare(mapped, expectedKey)});
      tests.push({crib: name, direction: reverse ? "reverse" : "forward",
        transfer: mode, sign: "-", ...compare(mapped, expectedKey.map((v) => mod29(-v)))});
    }
    tests.push({crib: name, direction: reverse ? "reverse" : "forward",
      transfer: "raw_index_xor", ...compare(selected, indexXor)});
    tests.push({crib: name, direction: reverse ? "reverse" : "forward",
      transfer: "raw_prime_weight_xor", ...compare(selected, primeXor)});
    tests.push({crib: name, direction: reverse ? "reverse" : "forward",
      transfer: "raw_additive_key", ...compare(selected, expectedKey)});
  }
}

// Positive controls for every transfer prove the fixed comparison code.
function scaledByteFor(value) {
  for (let b = 0; b <= 255; b++) if (Math.floor(29 * b / 256) === value) return b;
  throw new Error("No byte maps to GP29 value " + value);
}
for (const [key, indexXor, primeXor] of [
  [upperKey, upperIndexXor, upperPrimeXor],
  [lowerKey, lowerIndexXor, lowerPrimeXor],
]) {
  assert.deepEqual(mapWindow(key, "mod29"), key);
  assert.deepEqual(mapWindow(key.map(scaledByteFor), "scaled29"), key);
  assert.deepEqual(key.map((_, i) => indexXor[i]), indexXor);
  assert.deepEqual(key.map((_, i) => primeXor[i]), primeXor);
}
const bestByCrib = Object.fromEntries(["upper_TWIN_PRIME", "lower_WILL_BE_FOUND"].map((crib) => {
  const own = tests.filter((t) => t.crib === crib);
  return [crib, Math.max(...own.map((t) => t.matches))];
}));

console.log(JSON.stringify({
  status: "conditional fixed-offset crib gate; no claim of plaintext",
  source: {
    page: 15, redSpanLengths: [9, 11], titleNumber: titleNumber.toString(),
    divisor: 3301, quotientOffset: offset, remainder: Number(remainder),
    datasetBytes: pad.length, datasetSha256: sha256,
  },
  candidates: {
    upper: {phrase: "TWIN PRIME", plaintext: upperPlain, ciphertext: title, requiredKey: upperKey},
    lower: {phrase: "WILL BE FOUND", plaintext: lowerPlain, ciphertext: lower, requiredKey: lowerKey},
  },
  padWindowOffset: offset, padWindowHex: Buffer.from(window).toString("hex"), padWindowBytes: window,
  tests, bestByCrib,
  decision: "An exact 9/9 or 11/11 match is required to support a candidate under these transfers. Any partial match is not plaintext evidence."
}, null, 2));
