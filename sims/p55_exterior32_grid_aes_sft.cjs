"use strict";

/**
 * Source-led physical p55 exterior32 -> pp49-51 grid AES-256 gate.
 * SFT: node sims/p55_exterior32_grid_aes_sft.cjs
 *
 * @module p55_exterior32_grid_aes_sft
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash, createCipheriv, createDecipheriv} = require("node:crypto");

const ROOT = path.join(__dirname, "..");
/** @param {string} file */
const read = (file) => fs.readFileSync(path.join(ROOT, file), "utf8");
/** @param {Buffer} data */
const sha256 = (data) => createHash("sha256").update(data).digest("hex");
/** @param {number[]} array */
const hex = (array) => Buffer.from(array).toString("hex");
/** @param {Buffer} input @param {Buffer} key @param {boolean} reverse */
function ecb(input, key, reverse) {
  const c = reverse
    ? createDecipheriv("aes-256-ecb", key, null)
    : createCipheriv("aes-256-ecb", key, null);
  c.setAutoPadding(false);
  return Buffer.concat([c.update(input), c.final()]);
}
/** @param {Buffer} packet @param {Buffer} key */
function gcmOpen(packet, key) {
  const nonce = packet.subarray(0, 12);
  const ciphertext = packet.subarray(12, -16);
  const tag = packet.subarray(-16);
  const dec = createDecipheriv("aes-256-gcm", key, nonce);
  dec.setAuthTag(tag);
  return Buffer.concat([dec.update(ciphertext), dec.final()]);
}
/** @param {Buffer} message @param {Buffer} key */
function gcmSeal(message, key) {
  const nonce = Buffer.alloc(12, 0x23);
  const enc = createCipheriv("aes-256-gcm", key, nonce);
  const ciphertext = Buffer.concat([enc.update(message), enc.final()]);
  return Buffer.concat([nonce, ciphertext, enc.getAuthTag()]);
}
/** @param {Buffer} ciphertext @param {Buffer} key */
function openPgpPrefix(ciphertext, key) {
  const dec = createDecipheriv("aes-256-cfb", key, Buffer.alloc(16));
  const prefix = Buffer.concat([dec.update(ciphertext.subarray(0, 18)), dec.final()]);
  return {hex: prefix.toString("hex"),
    quickCheck: prefix[14] === prefix[16] && prefix[15] === prefix[17]};
}

function main() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
  const transcript = read("resources/liber-primus/lp2-transcription.txt");
  const p55 = corpus.pages.find((p) => p.page === 55);
  assert.ok(p55);
  assert.equal(p55.runic_count, 76);
  // The numeric-grid-only physical p50 has no '%' transcript section.
  const physicalP55 = transcript.split("%")[54];
  const words = (physicalP55.replace(/[\/\r\n]/g, "")
    .match(/[\u16A0-\u16FF]+/gu) || []);
  assert.equal(words.length, 17);
  assert.equal(words[0], corpus.runes[21]); // p54 NG carry
  const body = words.slice(1);
  assert.deepEqual(body.map((w) => [...w].length),
    [4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3]);
  const all = words.join("");
  assert.equal([...all].length, 76);
  assert.deepEqual([...all].map((s) => corpus.runes.indexOf(s)), p55.indices);
  const exterior = body.flatMap((w) => [w[0], [...w].at(-1)]);
  assert.equal(exterior.length, 32);
  const runeIds = exterior.map((r) => corpus.runes.indexOf(r));
  const primeIds = runeIds.map((i) => corpus.prime[i]);
  assert.equal(hex(runeIds), "19070f110e130f1900010704110c130011050c121c0f120f0216050e1701110a");
  assert.equal(hex(primeIds), "6513353d2f4735650203130b3d2947023d0d29436d35433505530d2f59033d1f");

  const rows = grid.byte_rows;
  assert.equal(rows.length, 32);
  assert.ok(rows.every((r) => r.length === 8 && r.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)));
  const table = Buffer.from(rows.flat());
  assert.equal(sha256(table), "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

  const cases = [
    {name:"index-direct",key:Buffer.from(runeIds),payload:table,
      sha:"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
      printable:85, first:"aed7c3083074a770936d233c89eff0af",
      cfb:"34ae5055f6c363a74a38d63806caf15fabfd"},
    {name:"prime-direct",key:Buffer.from(primeIds),payload:table,
      sha:"3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290",
      printable:105, first:"e8d6d5aa30db3a807fe541c59621df3e",
      cfb:"1dba27eeed90c03957b016b83a9aac1884c5"}
  ];
  for (const [name, numbers, expectedSelector, expectedKey, expectedSha, printable, first, cfb] of [
    ["index-row",runeIds,"17716371017414301542472726567112",
      "e7d457c6854950767a4f41ec960ef72ab32ef60e6912a6219f7f9633afea8dac",
      "5e62da84d7cca8109e86a27a18d47392a744518643c29c2344b0066cde47ad2e",85,
      "827e41b337bea9d3bbd35cd76f935940","c54aa24b2d1dd1e43b4d327e11550a03cf72"],
    ["prime-row",primeIds,"53557755233351725513553553571357",
      "edde8942054cabc419b1c131e53fb8568d2ed2701275afc07344969734793850",
      "13d0b0092f8308bc8b36eb9332a2dc190afc0928e2689281cf15ee2400052ed8",72,
      "3e9dac46d71ce293b82eb676d5cf293c","fe209c5bfdc2210c7ba9e48de56fca1041ec"]
  ]) {
    const columns = numbers.map((x) => x % 8);
    assert.equal(columns.join(""),expectedSelector);
    const key = Buffer.from(rows.map((r,i) => r[columns[i]]));
    const payload = Buffer.from(rows.flatMap((r,i) => r.filter((_,j) => j !== columns[i])));
    assert.equal(payload.length,224);
    assert.equal(key.toString("hex"),expectedKey);
    cases.push({name,key,payload,sha:expectedSha,printable,first,cfb});
  }

  const results = [];
  for (const candidate of cases) {
    const {name,key,payload,sha,printable,first,cfb} = candidate;
    assert.equal(key.length,32);
    assert.equal(payload.length % 16,0);
    assert.equal(sha256(payload),sha);
    const decrypted = ecb(payload,key,true);
    assert.deepEqual(ecb(decrypted,key,false),payload);
    assert.equal(decrypted.subarray(0,16).toString("hex"),first);
    assert.equal([...decrypted].filter((byte) => byte >= 32 && byte <= 126).length,printable);
    const prefix = openPgpPrefix(payload,key);
    assert.equal(prefix.hex,cfb);
    assert.equal(prefix.quickCheck,false);
    assert.throws(() => gcmOpen(payload,key)); // correct-tag authentication fails
    const planted = Buffer.alloc(payload.length-28,0x41);
    assert.deepEqual(gcmOpen(gcmSeal(planted,key),key),planted);
    assert.deepEqual(ecb(ecb(Buffer.alloc(payload.length,0x42),key,false),key,true),
      Buffer.alloc(payload.length,0x42));
    let rowLocalXor = null;
    if (name.endsWith("-row")) {
      // Subtract no arbitrary state: the selected cell is each printed row's
      // literal XOR byte; its seven neighbours are in original print order.
      const columns = (name === "index-row" ? runeIds : primeIds).map((n) => n % 8);
      const decodedXor = Buffer.from(rows.flatMap((r,i) =>
        r.filter((_,col) => col !== columns[i]).map((byte) => byte ^ key[i])));
      const originalSeven = Buffer.from(rows.flatMap((r,i) =>
        r.filter((_,col) => col !== columns[i])));
      const rebuilt = Buffer.from(Array.from(decodedXor, (byte,i) => byte ^ key[Math.floor(i / 7)]));
      assert.deepEqual(rebuilt,originalSeven);
      assert.deepEqual(originalSeven,payload);
      const expectXor = name === "index-row"
        ? {printable:86, first48:"2c405d860a9950882d480a23d0632e9d587631de6cab6bdf50844b43f6f740a2b3d580191d55af228e05ad407f6b06fb"}
        : {printable:84, first48:"260a4a578c935a82274229da690af04386a8efb2de2f84ef5bd4cfc77677c0223355801c185005aa278b56bb8490fd37"};
      const xorPrintable = [...decodedXor].filter((b) => b >= 32 && b <= 126).length;
      assert.equal(xorPrintable,expectXor.printable);
      assert.equal(decodedXor.subarray(0,48).toString("hex"),expectXor.first48);
      rowLocalXor = {printable:xorPrintable, total:decodedXor.length,
        first48Hex:expectXor.first48};
    }
    results.push({name,keyHex:key.toString("hex"),payloadBytes:payload.length,
      payloadSHA256:sha,ecbFirst16Hex:first,ecbPrintable:printable,
      openPgpCFBFirst18Hex:cfb,openPgpQuickCheck:false,gcmAuthenticated:false,
      rowLocalXor});
  }
  console.log(JSON.stringify({source:"physical p55 body 16 words / 32 exteriors; pp49-51 grid 32x8",
    sourcePageRunes:76,carriedRune:corpus.translit[21],
    tableSHA256:sha256(table),hypothesis:"conditional AES-256 transport; no authorial AES instruction",
    results,conclusion:"no authenticated payload or recognizable direct plaintext"},null,2));
}

if (require.main === module) main();
module.exports = {main};
