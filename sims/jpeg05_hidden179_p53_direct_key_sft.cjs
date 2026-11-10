"use strict";

/**
 * Independent original-source 179→179 bridge: the reversed-hex
 * 179-byte payload inside LP1 original JPEG 05 versus the 179 GP
 * ciphertext runes of LP2 physical page 53.
 *
 * Source-defined finite test: four byte-to-rune projections,
 * forward/reverse source reading, and additive +/- signs (16 total).
 * No plaintext-fitted keys, offsets, ciphertext rotations or skips.
 *
 * Run with Node.js 22: node sims/jpeg05_hidden179_p53_direct_key_sft.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const load = p => fs.readFileSync(path.join(root, p));
const sha256 = b => crypto.createHash("sha256").update(b).digest("hex");
const jpeg = load("resources/liber-primus/05.jpg");
assert.equal(sha256(jpeg), "2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7");
assert.equal(jpeg.length, 673066);

const imageLength = (jpeg.length - 360) / 2;
assert.equal(imageLength, 336353);
assert.equal(jpeg.subarray(imageLength - 2, imageLength).toString("hex"), "ffd9");
const first = jpeg.subarray(0, imageLength);
const last = jpeg.subarray(imageLength + 360);
assert.ok(last.equals(Buffer.from(first).reverse()), "original JPEG halves are reverse-identical");

const center = jpeg.subarray(imageLength, imageLength + 360);
assert.equal(center.subarray(0, 2).toString("hex"), "0a0a");
const reversedHex = center.subarray(2).toString("ascii");
assert.match(reversedHex, /^[0-9a-f]{358}$/);
const magicText = Buffer.from(reversedHex.split("").reverse().join(""), "hex");
assert.equal(magicText.length, 179);
const expectedSquare = [
  [272, 138, 341, 131, 151],
  [366, 199, 130, 320, 18],
  [226, 245, 91, 245, 226],
  [18, 320, 130, 199, 366],
  [151, 131, 341, 138, 272]
];
const square = magicText.toString("ascii").trimEnd()
  .split("\n").map(line => line.trim().split(/\s+/).map(Number));
assert.deepEqual(square, expectedSquare);
for (const row of square) assert.equal(row.reduce((a, b) => a + b, 0), 1033);
for (let j = 0; j < 5; j++)
  assert.equal(square.reduce((a, r) => a + r[j], 0), 1033);

const corpus = JSON.parse(load("resources/liber-primus/lp2-corpus.json").toString("utf8"));
const p53 = corpus.pages.find(p => p.page === 53);
assert.equal(p53.indices.length, 179);
assert.deepEqual(corpus.pages.filter(p => p.page === 53).map(p => p.status), ["unsolved"]);

const N = 29;
const mod = a => (a % N + N) % N;
const ioc = digits => {
  const counts = Array(N).fill(0);
  for (const d of digits) counts[d]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (digits.length * (digits.length - 1));
};
const toGP = text => {
  const translit = corpus.translit.map((s, i) => [s, i])
    .sort((a, b) => b[0].length - a[0].length);
  const normalized = text.toUpperCase()
    .replace(/Q/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < normalized.length;) {
    if (!/[A-Z]/.test(normalized[i])) { i++; continue; }
    const item = translit.find(([s]) => normalized.startsWith(s, i));
    assert.ok(item, "unmapped Latin letter " + normalized[i]);
    out.push(item[1]); i += item[0].length;
  }
  return out;
};
const englishSource = load("resources/control/shakespeare_first300k.txt");
const plantedPlain = toGP(englishSource.toString("utf8")).slice(0, 179);
assert.equal(plantedPlain.length, 179);
assert.ok(ioc(plantedPlain) > 0.045, "native prose has detectable coincidence");

// Each projection is specified by how the original embedded ASCII byte
// is mechanically interpreted, without any use of the source ciphertext.
const projections = {
  ascii_byte_mod29: b => b % 29,
  decimal_digit_else_zero: b => b >= 48 && b <= 57 ? b - 48 : 0,
  ascii_low5_mod29: b => (b & 31) % 29,
  sum_of_hex_nibbles_mod29: b => ((b >>> 4) + (b & 15)) % 29
};

const results = [];
let exactRoundtrips = 0;
let actualPlantMatch = false;
for (const [projection, convert] of Object.entries(projections)) {
  for (const direction of ["forward", "reverse"]) {
    const keyBytes = direction === "forward" ? [...magicText] : [...magicText].reverse();
    const key = keyBytes.map(convert);
    for (const sign of [-1, 1]) {
      const decode = ciphertext => ciphertext.map((c, i) => mod(c + sign * key[i]));
      const encode = plain => plain.map((p, i) => mod(p - sign * key[i]));
      const candidate = decode(p53.indices);
      const reconstructedCipher = encode(candidate);
      assert.deepEqual(reconstructedCipher, p53.indices);
      const plantedCipher = encode(plantedPlain);
      const recovered = decode(plantedCipher);
      assert.deepEqual(recovered, plantedPlain);
      exactRoundtrips++;
      if (projection === "ascii_byte_mod29" &&
          direction === "forward" && sign === -1)
        actualPlantMatch = recovered.every((r, i) => r === plantedPlain[i]);
      results.push({
        projection, direction, inverse_sign: sign,
        original_ioc: ioc(candidate),
        first40_transliterated: candidate.slice(0, 40)
          .map(i => corpus.translit[i]).join(""),
        native_plant_recovered: recovered.length
      });
    }
  }
}
assert.equal(exactRoundtrips, 16);
assert.equal(actualPlantMatch, true);
results.sort((a, b) => b.original_ioc - a.original_ioc);
assert.ok(results.every(x => x.original_ioc < 0.040),
  "source-key direct candidates unexpectedly depart from random-like IoC");

const outcome = {
  conclusion: "The 179-byte LP1 hidden magic-square encoding gives no native-GP prose under 16 original-source p53 direct-key models.",
  original_inputs: {
    source_jpeg_sha256: sha256(jpeg),
    embedded_ascii_bytes: magicText.length,
    jpeg_prefix_bytes: imageLength,
    ascii_first_line: magicText.toString("ascii").split("\n")[0],
    lp2_physical_page: 53,
    lp2_cipher_runes: p53.indices.length
  },
  baseline: {
    original_p53_cipher_ioc: ioc(p53.indices),
    known_literary_179_GP_ioc: ioc(plantedPlain),
    planted_GP_reference_sha256: sha256(englishSource)
  },
  exact_original_reencryptions: exactRoundtrips,
  exact_native_plant_recoveries: exactRoundtrips,
  candidates: results
};
console.log(JSON.stringify(outcome, null, 2));
