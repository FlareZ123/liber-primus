"use strict";

/**
 * Narrow original-source test: the independently counted 225 red rune glyphs
 * and 31 thirteen-dot marks form exactly 256 ordered events. Test the visible
 * GP-prime/13 byte encoding as an RC4 key for the printed p50 32x8 byte table.
 * Both raw256 and MD5(raw256) are explicitly hypothetical consumers.
 *
 * Run: node sims/lp2_red256_rc4_outguess_p50_sft.cjs
 * Requires the canonical three JSON resources, does not write files.
 */

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");

/** @param {string} path @returns {any} */
function load(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

/** @param {Buffer} key @param {number} length @returns {Buffer} */
function rc4(key, length) {
  assert(key.length > 0 && length >= 0);
  const state = Uint8Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + state[i] + key[i % key.length]) & 255;
    [state[i], state[j]] = [state[j], state[i]];
  }
  let i = 0;
  j = 0;
  const output = Buffer.alloc(length);
  for (let n = 0; n < length; n++) {
    i = (i + 1) & 255;
    j = (j + state[i]) & 255;
    [state[i], state[j]] = [state[j], state[i]];
    output[n] = state[(state[i] + state[j]) & 255];
  }
  return output;
}

/** @param {Buffer} a @param {Buffer} b @returns {Buffer} */
function xor(a, b) {
  assert.equal(a.length, b.length);
  return Buffer.from(a.map((value, i) => value ^ b[i]));
}

/** @param {Buffer} bytes @returns {string} */
function sha512(bytes) {
  return crypto.createHash("sha512").update(bytes).digest("hex");
}

const corpus = load("resources/liber-primus/lp2-corpus.json");
const ink = load("resources/liber-primus/lp2-ink-annotations.json");
const grid = load("resources/liber-primus/lp2-grid-256.json");
const pages = new Map(corpus.pages.map(page => [page.page, page]));
/** @type {number[]} */
const events = [];
for (const page of [...ink.pages].sort((a, b) => a.page - b.page)) {
  /** @type {{offset:number,order:number,byte:number}[]} */
  const ordered = [];
  for (const [offset, dots] of page.large_punctuation || []) {
    if (dots === 13) ordered.push({ offset, order: 0, byte: 13 });
  }
  for (const span of page.red_spans || []) {
    for (let k = 0; k < span.length; k++) {
      const offset = span.start + k;
      const index = pages.get(page.page).indices[offset];
      assert.equal(corpus.runes[index], Array.from(span.runes)[k], "red rune source alignment");
      ordered.push({ offset, order: 1, byte: corpus.prime[index] });
    }
  }
  ordered.sort((a, b) => a.offset - b.offset || a.order - b.order);
  events.push(...ordered.map(event => event.byte));
}
assert.equal(ink.counts.red, 225);
assert.equal(events.length, 256);
const table = Buffer.from(grid.pages.flatMap(page => page.bytes));
assert.deepEqual(grid.pages.map(page => page.page), [49, 50, 51]);
assert.equal(table.length, 256);
assert.deepEqual(table, Buffer.from(grid.bytes));
const key = Buffer.from(events);
assert.equal(key.length, 256);
assert.equal(key.toString("hex").slice(0, 32), "3517430711476b023567434f0d0d0d");

const target = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const cases = [
  { name: "raw256", key, expectedSha: "258fadac77f178874aad943f7cb183d4b0f5e2f181469ae3b5a1a87e1667c8a0622ab151e1d6d5bdc6f4e740ab60c2298dd74372b34dbd17cd789412b0968b9f", expectedPrintable: 85 },
  { name: "md5(raw256)", key: crypto.createHash("md5").update(key).digest(), expectedSha: "06c4f7b05d313810017e6b5b8e88a3e7c350e7b1efc676b14cec65be1e4550380e3e7e6bbbca740007b4331585123727eb63e4dc3b48ef44da62c1cd9f2fc720", expectedPrintable: 103 }
];

for (const test of cases) {
  const stream = rc4(test.key, 256);
  const decoded = xor(table, stream);
  assert.equal(sha512(decoded), test.expectedSha);
  assert.notEqual(sha512(decoded), target);
  const printable = decoded.filter(value => value >= 32 && value < 127).length;
  assert.equal(printable, test.expectedPrintable);
  const signatures = ["89504e470d0a1a0a", "ffd8", "504b0304", "25504446", "1f8b", "7f454c46", "474946383761", "474946383961"];
  assert(signatures.every(signature => !decoded.toString("hex").startsWith(signature)));
  const planted = Buffer.from("AN AUTHENTIC FILE HEADER WOULD BE A TYPED OUTPUT WITH AN EXPLICIT ORIGINAL-SOURCE KEY");
  const plantedCipher = xor(planted, stream.subarray(0, planted.length));
  assert.deepEqual(xor(plantedCipher, rc4(test.key, planted.length)), planted);
  console.log(JSON.stringify({
    model: "RC4 " + test.name + " event key XOR original printed p50 bytes",
    eventCount: events.length,
    byteCount: table.length,
    keyMd5Hex: crypto.createHash("md5").update(key).digest("hex"),
    first32StreamHex: stream.subarray(0, 32).toString("hex"),
    outputFirst64Hex: decoded.subarray(0, 64).toString("hex"),
    printable, uniqueOutputBytes: new Set(decoded).size,
    outputSha512: sha512(decoded),
    p56Sha512Match: false, recognizableFileSignature: false,
    syntheticPlantRecovered: true
  }));
}
