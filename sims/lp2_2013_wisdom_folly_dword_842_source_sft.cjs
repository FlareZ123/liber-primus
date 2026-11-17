"use strict";
/**
 * The archived 2013 /tmp/wisdom == /tmp/folly binary has 3,368 bytes.
 * The original LP2 pp51–55 rune tail after the 256-byte table has 842 runes.
 * Test the literal four-bytes-per-rune alignment without fitted offset/clock.
 * This is a hypothesis gate, not a historical Cicada cipher claim.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "resources/liber-primus/lp2-corpus.json"), "utf8"));
const original = data.pages.slice(51, 56).map((p) => p.indices);
const source = Buffer.from(
  fs.readFileSync(path.join(ROOT, "resources/historical/cicada2013-wisdom-folly.b64"), "utf8").replace(/\\s/g, ""),
  "base64"
);
assert.deepEqual(original.map((p) => p.length), [92, 263, 179, 232, 76]);
assert.equal(source.length, 3368);
assert.equal(original.flat().length * 4, source.length);
assert.equal(
  crypto.createHash("sha256").update(source).digest("hex"),
  "7e5ec097728197f5c0dba0729980565658fba486965809ffa25e3910a31c385a"
);
const mod29 = (x) => ((x % 29) + 29) % 29;

/** @param {number[]} xs An original-order GP29 rune sequence. */
function ioc(xs) {
  const counts = Array(29).fill(0);
  for (const x of xs) {
    assert.ok(Number.isInteger(x) && x >= 0 && x < 29);
    counts[x]++;
  }
  return counts.reduce((sum, n) => sum + n * (n - 1), 0) / (xs.length * (xs.length - 1));
}

/** @param {"LE"|"BE"} endian @param {number} i */
function dword(endian, i) {
  return endian === "LE" ? source.readUInt32LE(4 * i) : source.readUInt32BE(4 * i);
}

/** @param {"LE"|"BE"} endian @param {string} reduction */
function key(endian, reduction) {
  return Array.from({ length: 842 }, (_, i) => {
    const w = dword(endian, i), j = 4 * i;
    switch (reduction) {
      case "mod": return w % 29;
      case "scaled": return Math.floor(w * 29 / 4294967296);
      case "sum": return (source[j] + source[j + 1] + source[j + 2] + source[j + 3]) % 29;
      case "xor": return (source[j] ^ source[j + 1] ^ source[j + 2] ^ source[j + 3]) % 29;
      case "first": return source[j] % 29;
      case "last": return source[j + 3] % 29;
      default: throw new Error("Unknown reduction");
    }
  });
}

/**
 * Source-only signed inverse and forward plant using continuous 842-key clock.
 * "deltaBook" keeps the previous printed ciphertext rune over page boundaries.
 * "deltaPage" resets the predecessor to zero at each physical page.
 * @param {number[][]} pages
 * @param {number[]} pad
 * @param {"direct"|"deltaBook"|"deltaPage"} mode
 * @param {-1|1} sign
 * @param {boolean} encode
 */
function transform(pages, pad, mode, sign, encode) {
  let pos = 0, previous = 0;
  return pages.map((page) => page.map((rune, i) => {
    const prev = mode === "deltaPage" && i === 0 ? 0 : previous;
    const k = pad[pos++];
    let result;
    if (encode) result = mod29(rune - sign * k + (mode === "direct" ? 0 : prev));
    else result = mod29(rune + sign * k - (mode === "direct" ? 0 : prev));
    previous = encode ? result : rune;
    return result;
  }));
}

/** @param {number[][]} pages */
function samePages(pages, expected) {
  assert.deepEqual(pages.map((x) => x.length), expected.map((x) => x.length));
  assert.deepEqual(pages.flat(), expected.flat());
}

const cipherReference = original.flat(), control = data.pages[57].indices;
assert.equal(control.length, 95);
const knownPlain = (() => {
  const plain = Array.from({ length: 842 }, (_, i) => control[i % 95]);
  let offset = 0;
  return original.map((page) => {
    const slice = plain.slice(offset, offset + page.length);
    offset += page.length;
    return slice;
  });
})();
assert.ok(Math.abs(ioc(cipherReference) - 0.034098644018968484) < 1e-12);
const additive = [];
for (const endian of ["LE", "BE"]) {
  for (const reduction of ["mod", "scaled", "sum", "xor", "first", "last"]) {
    const k = key(endian, reduction);
    for (const mode of ["direct", "deltaBook", "deltaPage"]) {
      for (const sign of [-1, 1]) {
        const output = transform(original, k, mode, sign, false);
        samePages(transform(output, k, mode, sign, true), original);
        const plant = transform(knownPlain, k, mode, sign, true);
        samePages(transform(plant, k, mode, sign, false), knownPlain);
        additive.push({ endian, reduction, mode, sign, ioc: ioc(output.flat()) });
      }
    }
  }
}
assert.equal(additive.length, 72);
additive.sort((a, b) => b.ioc - a.ioc);
assert.ok(Math.abs(additive[0].ioc - 0.035222744103417206) < 1e-12);

/**
 * The original 2013 stage did use binary XOR. A direct 5-bit GP29 XOR
 * must yield 0..28 for every rune; 29..31 are invalid unless an additional
 * alphabet/escape rule is independently supplied.
 * @param {"LE"|"BE"} endian
 * @param {string} reducer
 */
function xorKey(endian, reducer) {
  return Array.from({ length: 842 }, (_, i) => {
    const w = dword(endian, i), j = 4 * i;
    switch (reducer) {
      case "low5": return w & 31;
      case "high5": return w >>> 27;
      case "byte0low5": return source[j] & 31;
      case "byte3low5": return source[j + 3] & 31;
      case "xor4bytes": return (source[j] ^ source[j + 1] ^ source[j + 2] ^ source[j + 3]) & 31;
      case "sum4bytes": return (source[j] + source[j + 1] + source[j + 2] + source[j + 3]) & 31;
      default: throw new Error("Unknown XOR reducer");
    }
  });
}
const xor = [];
for (const endian of ["LE", "BE"]) {
  for (const reduction of ["low5", "high5", "byte0low5", "byte3low5", "xor4bytes", "sum4bytes"]) {
    const k = xorKey(endian, reduction);
    for (const mode of ["direct", "deltaBook", "deltaPage"]) {
      let offset = 0, prior = 0, invalid = 0;
      for (const page of original) {
        for (let i = 0; i < page.length; i++) {
          const current = page[i];
          const d = mode === "direct" ? current : mod29(current - (mode === "deltaBook" ? prior : i ? page[i - 1] : 0));
          if ((d ^ k[offset++]) >= 29) invalid++;
          prior = current;
        }
      }
      xor.push({ endian, reduction, mode, invalid });
    }
  }
}
assert.equal(xor.length, 36);
xor.sort((a, b) => a.invalid - b.invalid);
assert.equal(xor[0].invalid, 72);
console.log(JSON.stringify({
  originalRunes: cipherReference.length, sourceBytes: source.length,
  completeAdditiveModels: additive.length, minXorInvalid: xor[0].invalid,
  directGp29XorModels: xor.length, originalIoC: ioc(cipherReference),
  highestDecodedIoC: additive[0], bestXor: xor[0],
  outcome: "No native-GP plaintext or directly valid 5-bit XOR GP29 inverse"
}, null, 2));
