"use strict";

/**
 * Original LP2 p40–53 / 2013 CicadaOS wisdom-folly, reversible feedback SFT.
 * Tests a finite source-conditioned transfer, not a historical cipher claim.
 * Read-only: node sims/lp2_2013_wisdom_flower_feedback_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const MOD = 29;
const SOURCE_SHA256 = "7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a";

/** @param {string} filename @returns {string} */
function read(filename) {
  return fs.readFileSync(path.join(ROOT, filename), "utf8");
}

/** @param {number} x @returns {number} */
function mod(x) {
  return ((x % MOD) + MOD) % MOD;
}

const inverses = Array.from({length: MOD}, (_, x) => {
  if (x === 0) return 0;
  for (let inverse = 1; inverse < MOD; inverse++) {
    if ((x * inverse) % MOD === 1) return inverse;
  }
  throw new Error("Nonunit in prime field");
});

/** @param {number} byte @param {string} reduction @returns {number} */
function multiplier(byte, reduction) {
  if (reduction === "mod") return 1 + (byte % 28);
  if (reduction === "scaled") return 1 + Math.floor(28 * byte / 256);
  if (reduction === "rejection") {
    assert(byte < 252);
    return 1 + (byte % 28);
  }
  if (reduction === "power") {
    let result = 1;
    for (let i = 0; i < byte % 28; i++) result = (result * 2) % MOD;
    return result;
  }
  throw new Error("Unknown source-byte reduction");
}

/**
 * Map a fixed byte stream into a one-symbol-per-rune unit-valued key sequence.
 * Rejection consumes extra bytes, so a too-short source is an exact model failure.
 * @param {Buffer} bytes
 * @param {number} start
 * @param {string} reduction
 * @param {number} count
 * @returns {{keys:number[],consumed:number}|null}
 */
function deriveKeys(bytes, start, reduction, count) {
  const keys = [];
  let index = start;
  while (keys.length < count) {
    if (index >= bytes.length) return null;
    const byte = bytes[index++];
    if (reduction === "rejection" && byte >= 252) continue;
    keys.push(multiplier(byte, reduction));
  }
  return {keys, consumed: index - start};
}

/**
 * Inverse of C_i = (C_(i-1) + K_i * (P_i + 1)) mod 29.
 * The first observed cipher rune is the initial state, not a decoded symbol.
 * @param {number[]} cipher
 * @param {number[]} keys
 * @returns {number[]}
 */
function decrypt(cipher, keys) {
  assert.equal(keys.length, cipher.length - 1);
  const plain = [];
  for (let i = 1; i < cipher.length; i++) {
    const delta = mod(cipher[i] - cipher[i - 1]);
    plain.push(mod(delta * inverses[keys[i - 1]] - 1));
  }
  return plain;
}

/**
 * Construct a ciphertext with a literal first-runic state and arbitrary plaintext.
 * @param {number[]} plain
 * @param {number[]} keys
 * @param {number} initial
 * @returns {number[]}
 */
function encrypt(plain, keys, initial) {
  assert.equal(plain.length, keys.length);
  const cipher = [initial];
  for (let i = 0; i < plain.length; i++) {
    cipher.push(mod(cipher[i] + keys[i] * (plain[i] + 1)));
  }
  return cipher;
}

/** @param {number[]} data @returns {number} */
function ioc(data) {
  const counts = Array(MOD).fill(0);
  for (const x of data) counts[x]++;
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) /
    (data.length * (data.length - 1));
}

function main() {
  const raw = read("resources/historical/cicada-2013-os-wisdom-folly.bin.b64");
  const source = Buffer.from(raw.replace(/\s/gu, ""), "base64");
  assert.equal(source.length, 3368);
  assert.equal(crypto.createHash("sha256").update(source).digest("hex"), SOURCE_SHA256);
  assert.equal(source.subarray(0, 8).toString("hex"), "bf53c0cc9f66938e");

  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const chapter = corpus.pages.filter((page) => page.page >= 40 && page.page <= 53)
    .flatMap((page) => page.indices);
  assert.equal(chapter.length, 3008);
  const knownPlain = corpus.pages[57].indices;
  assert.equal(knownPlain.length, 95);

  const cases = [];
  let capacityFailures = 0;
  for (const reverse of [false, true]) {
    const bytes = reverse ? Buffer.from(source).reverse() : source;
    for (const offset of [0, 360]) {
      for (const reduction of ["mod", "scaled", "rejection", "power"]) {
        const derived = deriveKeys(bytes, offset, reduction, chapter.length - 1);
        if (!derived) {
          assert.equal(offset, 360);
          assert.equal(reduction, "rejection");
          capacityFailures++;
          continue;
        }
        const plain = decrypt(chapter, derived.keys);
        assert.deepEqual(encrypt(plain, derived.keys, chapter[0]), chapter);
        const score = ioc(plain);
        cases.push({
          reverse, offset, reduction, consumed: derived.consumed,
          ioc: score,
          prefix: plain.slice(0, 40).map((x) => corpus.translit[x]).join("")
        });
      }
    }
  }
  assert.equal(cases.length, 14);
  assert.equal(capacityFailures, 2);
  cases.sort((a, b) => b.ioc - a.ioc);
  assert.equal(cases[0].reverse, true);
  assert.equal(cases[0].offset, 0);
  assert.equal(cases[0].reduction, "rejection");
  assert(Math.abs(cases[0].ioc - 0.035424550522057535) < 1e-12);
  assert(cases[0].ioc < 0.04, "A native-language-range concentration needs new analysis");

  const planted = knownPlain.concat([28]);
  const positive = deriveKeys(source, 0, "rejection", planted.length);
  assert(positive);
  const synthetic = encrypt(planted, positive.keys, 16);
  assert.equal(synthetic[synthetic.length - 1], synthetic[synthetic.length - 2],
    "GP index 28 is the marked same-ciphertext step");
  assert.deepEqual(decrypt(synthetic, positive.keys), planted);

  console.log(JSON.stringify({
    corpus: "original p40–53, 3008 ciphertext runes, first rune as IV",
    source: "2013 original CicadaOS /tmp/wisdom=/tmp/folly, 3368 bytes",
    ciphertextIoC: ioc(chapter),
    originalInverseLength: 3007,
    capacityFailures,
    validCases: cases.length,
    best: cases[0],
    all: cases,
    plantedSourceGP57PlusEARecovered: planted.length
  }, null, 2));
}

if (require.main === module) main();
module.exports = {deriveKeys, multiplier, decrypt, encrypt, ioc};
