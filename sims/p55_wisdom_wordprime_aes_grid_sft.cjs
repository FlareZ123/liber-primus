"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash, createCipheriv, createDecipheriv} = require("node:crypto");
const {parseSharedCorpus, physicalLP2Page} = require("./lp2_word_pages.cjs");

/** Source-frozen p55 Wisdom GP-prime words -> AES grid direct-inverse experiment. */
function main() {
  const root = path.join(__dirname, "..");
  const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8"));
  const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"));
  const parsed = parseSharedCorpus();
  assert.equal(parsed.runeCount, 12956);
  assert.equal(parsed.words.length, 2896);
  const page = parsed.byStartPage.find((_, i) => physicalLP2Page(i) === 55);
  assert.equal(page.length, 16);
  assert.equal(corpus.pages[55].indices.length, 76);
  assert.equal(page.reduce((n, word) => n + word.length, 0), 75);
  assert.ok(page.every((word) => word.startPage === 54 && word.endPage === 54));

  const weights = new Map(corpus.runes.map((rune, i) => [rune, corpus.prime[i]]));
  const sums = page.map(({runes}) => Array.from(runes)
    .reduce((n, rune) => n + weights.get(rune), 0));
  assert.deepEqual(sums, [222,114,118,306,283,30,596,365,
    138,108,341,291,88,284,129,159]);
  const table = Buffer.from(grid.byte_rows.flat());
  const digest = createHash("sha256").update(table).digest("hex");
  assert.equal(table.length, 256);
  assert.equal(digest, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

  const k128 = Buffer.from(sums.map((n) => n & 255));
  const k256 = Buffer.alloc(32);
  sums.forEach((sum, i) => k256.writeUInt16BE(sum, i * 2));

  /** @param {string} algorithm @param {Buffer} key @param {Buffer} input @param {boolean} reverse */
  function aes(algorithm, key, input, reverse) {
    const c = reverse ? createDecipheriv(algorithm, key, null) : createCipheriv(algorithm, key, null);
    c.setAutoPadding(false);
    return Buffer.concat([c.update(input), c.final()]);
  }
  const readings = [
    {algorithm:"aes-128-ecb", key:k128, printable:89, prefix:"96b84b458f47686b6011bae90efeb4f8ed2175d1e5ac34d49338fb49742a0a2b"},
    {algorithm:"aes-256-ecb", key:k256, printable:101, prefix:"364c7638b56e5da9c896679b3fbaf9ad3a3e2b9404a5ddec5423552b22ff1a9e"},
  ];
  const results = readings.map(({algorithm, key, printable, prefix}) => {
    const plain = aes(algorithm, key, table, true);
    const measured = Array.from(plain).filter((b) => b >= 32 && b <= 126).length;
    assert.equal(measured, printable);
    assert.equal(plain.subarray(0, 32).toString("hex"), prefix);
    assert.deepEqual(aes(algorithm, key, plain, false), table);
    const control = Buffer.alloc(256, 65);
    assert.deepEqual(aes(algorithm, key, aes(algorithm, key, control, false), true), control);
    return {algorithm, key:key.toString("hex"), printableBytes:measured,
      first32Hex:prefix, originalByteCount:plain.length};
  });
  console.log(JSON.stringify({source:"original LP2 p55 first word on page; pp49-51 base60 table",
    primeSums:sums, conditionalGridSha256:digest, results,
    interpretation:"Both length-matched direct AES-ECB readings reject visible English/file-format plaintext; no verified LP2 key"}, null, 2));
}
if (require.main === module) main();
module.exports = {main};
