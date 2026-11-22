"use strict";
/**
 * LP2 source-original previous-JPEG SHA-256 to AES256-CTR to GP28
 * predecessor-exclusion candidate. Causal order: archive 16.jpg
 * supplies the key for the first unknown page (17.jpg), then every
 * page consumes its own preceding physical archive image. The
 * number-only physical p50 still advances the image chain.
 *
 * This is a hypothesis, not an authenticated Cicada instruction.
 * SFT (read-only): node sims/lp2_previous_jpeg_sha_aes_rank28_sft.cjs
 * Requires Node.js 22 and unchanged original image assets.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const root = path.join(__dirname, "..");
/** @param {string} file @returns {Buffer} */
function read(file) { return fs.readFileSync(path.join(root, file)); }
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json").toString("utf8"));
const pages = gp.pages.filter(p => p.page <= 55 && p.indices.length > 0);
const total = pages.reduce((acc, p) => acc + p.indices.length, 0);
assert.equal(pages.length, 55);
assert.equal(total, 12956);
assert.equal(gp.pages[55].indices.length, 76);
assert.equal(gp.pages[57].indices.length, 95);

/**
 * @param {number[]} items
 * @returns {number}
 */
function ioc(items) {
  const counts = new Array(29).fill(0);
  for (const x of items) {
    assert(Number.isInteger(x) && x >= 0 && x < 29);
    counts[x]++;
  }
  return counts.reduce((s, n) => s + n * (n - 1), 0) / (items.length * (items.length - 1));
}
/**
 * The prior JPEG is strictly the archive image immediately before
 * this page's own 17+physical-page image; p0 uses the final LP1
 * picture 16.jpg. No offset is fitted from ciphertext.
 * @param {number} physicalPage
 * @returns {Buffer}
 */
function shaPrevious(physicalPage) {
  assert(physicalPage >= 0 && physicalPage <= 55);
  const number = String(physicalPage + 16).padStart(2, "0");
  return crypto.createHash("sha256").update(
    read("resources/liber-primus/" + number + ".jpg")
  ).digest();
}
/** @param {Buffer} key @param {number} n @returns {Buffer} */
function aesPad(key, n) {
  assert.equal(key.length, 32);
  const cipher = crypto.createCipheriv("aes-256-ctr", key, Buffer.alloc(16));
  return Buffer.concat([cipher.update(Buffer.alloc(n * 3 + 64)), cipher.final()]);
}
/** @param {Buffer} source @param {number} count @param {"mod28"|"scale28"|"reject224"} projection */
function reduce(source, count, projection) {
  const out = [];
  for (const b of source) {
    if (projection === "reject224" && b >= 224) continue;
    const v = projection === "scale28" ? Math.floor(b * 28 / 256) : b % 28;
    out.push(v);
    if (out.length === count) return out;
  }
  throw Error("insufficient source AES bytes");
}
/**
 * @param {number[]} cipher
 * @param {number[]} key
 * @param {"cyclic"|"sorted"} rankScheme
 * @param {1|-1} sign
 * @returns {number[]}
 */
function decode(cipher, key, rankScheme, sign) {
  assert.equal(key.length, cipher.length - 1);
  const out = [];
  for (let i = 1; i < cipher.length; i++) {
    const prev = cipher[i - 1];
    const curr = cipher[i];
    if (curr === prev) {
      out.push(28); // the literal EA rune is a reversible repeat sentinel
      continue;
    }
    const rank = rankScheme === "cyclic" ?
      (curr - prev + 28) % 29 :
      curr - (curr > prev ? 1 : 0);
    assert(rank >= 0 && rank < 28);
    out.push((rank - sign * key[i - 1] + 56) % 28);
  }
  return out;
}
/**
 * @param {number[]} plain
 * @param {number[]} key
 * @param {"cyclic"|"sorted"} rankScheme
 * @param {1|-1} sign
 * @param {number} initialCipher
 * @returns {number[]}
 */
function encode(plain, key, rankScheme, sign, initialCipher) {
  assert.equal(key.length, plain.length - 1);
  const out = [initialCipher];
  for (let i = 1; i < plain.length; i++) {
    const prev = out[out.length - 1];
    if (plain[i] === 28) {
      out.push(prev);
      continue;
    }
    const rank = (plain[i] + sign * key[i - 1] + 56) % 28;
    out.push(rankScheme === "cyclic" ?
      (prev + 1 + rank) % 29 :
      rank + (rank >= prev ? 1 : 0));
  }
  return out;
}
/** @param {number[]} values @returns {string} */
function translit(values) { return values.map(n => gp.translit[n]).join(" "); }
const initialImageHash = shaPrevious(0).toString("hex");
assert.equal(initialImageHash,
  "984668c680c6089b91587ef6d9eb2a1df1d2b7ee8ab3837655d3933f2adcbfbe");
const original = pages.flatMap(p => p.indices);
const allowed = new Set(["mod28", "scale28", "reject224"]);
const report = [];
let controlCount = 0;
for (const rankScheme of ["cyclic", "sorted"]) {
  for (const projection of allowed) {
    for (const sign of [1, -1]) {
      const decoded = [];
      const reconstructed = [];
      let repeats = 0;
      for (const p of pages) {
        const seed = shaPrevious(p.page);
        const key = reduce(aesPad(seed, p.indices.length), p.indices.length - 1, projection);
        const result = decode(p.indices, key, rankScheme, sign);
        const regenerated = encode([p.indices[0], ...result], key, rankScheme, sign, p.indices[0]);
        assert.deepEqual(regenerated, p.indices,
          "complete original ciphertext round-trip for page " + p.page);
        for (let i = 1; i < p.indices.length; i++) {
          if (p.indices[i] === p.indices[i - 1]) repeats++;
        }
        decoded.push(...result);
        reconstructed.push(...regenerated);
      }
      assert.equal(reconstructed.length, 12956);
      assert.equal(decoded.length, 12901);
      assert.equal(repeats, 86);
      const p57 = gp.pages[57].indices;
      const keyPlant = reduce(aesPad(shaPrevious(0), p57.length), p57.length - 1, projection);
      const artificial = encode(p57, keyPlant, rankScheme, sign, gp.pages[0].indices[0]);
      const recovered = decode(artificial, keyPlant, rankScheme, sign);
      assert.deepEqual(recovered, p57.slice(1),
        "authentic source-native p57 GP29 94-rune inverse control");
      assert.deepEqual(encode([artificial[0], ...recovered], keyPlant,
        rankScheme, sign, artificial[0]), artificial,
        "positive ciphertext round trip");
      // P57 has zero native EA runes. Force all sentinel paths through a
      // separate explicitly artificial native-GP perturbation control.
      const sentinelPlant = p57.slice();
      for (const at of [7, 31, 59]) sentinelPlant[at] = 28;
      const sentinelCipher = encode(sentinelPlant, keyPlant,
        rankScheme, sign, gp.pages[0].indices[0]);
      assert.deepEqual(decode(sentinelCipher, keyPlant, rankScheme, sign),
        sentinelPlant.slice(1), "three nonzero source EA sentinels round trip");
      assert.equal(sentinelCipher.reduce((n,v,i,a) =>
        n + (i > 0 && v === a[i-1] ? 1 : 0),0), 3,
        "EA plaintext sentinel produces literal ciphertext repeat");
      controlCount++;
      const first = decode(pages[0].indices,
        reduce(aesPad(shaPrevious(0), pages[0].indices.length),
          pages[0].indices.length - 1, projection), rankScheme, sign);
      report.push({rankScheme, projection, sign, ioc:ioc(decoded),
        prefix:translit(first.slice(0,48)),
        p55:ioc(decoded.slice(-75))});
    }
  }
}
assert.equal(controlCount, 12);
const sourceIoc = ioc(original);
const controlIoc = ioc(gp.pages[57].indices);
report.sort((a,b) => b.ioc - a.ioc);
console.log(JSON.stringify({model:"previous-source-JPEG SHA256 -> AES256CTR -> GP28 predecessor exclusion",
  images:55, runes:12956, withinPageTransitions:12901, doublets:86,
  firstImageHash:initialImageHash, rawIoc:sourceIoc, solvedP57Ioc:controlIoc,
  positiveControls:controlCount, results:report}, null, 2));
