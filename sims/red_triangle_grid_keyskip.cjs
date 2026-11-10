"use strict";
/**
 * Agent 11 original LP2 inversion: source-defined 53^t mod79 prime-group IV
 * shared across eight genuine base60 grid-column 256-bit keys.
 *
 * The red headings at pages 40, 15 and 53 give GP prime-sum quotients
 * 15, 22 and 78. The 22nd ordinary prime is 79; GP prime[15] is 53,
 * which has full order 78 modulo 79. Read exactly 128 consecutive
 * low bits of the modular cycle starting at exponent 15, MSB first
 * in each byte, to form the 128-bit CTR nonce. There is one IV;
 * every section uses this same IV and its own unknown grid column.
 *
 * This is a precise hypothesis rather than a source-authenticated rule.
 * A matching cipher must recover readable original runes and re-encrypt.
 * Node 22 CommonJS. Executes no file writes.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { originalBodies, originalKeys } = require("./grid_stream_collision_viterbi.cjs");
const { search, plant, nulls } = require("./red_title_nonce_grid_viterbi.cjs");
const { train } = require("./grid_keyskip_viterbi.cjs");
const root = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");

/** @returns {Buffer} exact source-derived 128-bit cycle nonce */
function deriveIv() {
  const book = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
  const redSum = (page, start, length) => {
    const src = ink.pages.find(x => x.page === page);
    assert.ok(src && src.red_spans.some(x => x.start === start && x.length === length));
    const values = book.pages[page].indices.slice(start, start + length);
    assert.equal(values.length, length);
    return values.reduce((s, x) => s + book.prime[x], 0);
  };
  assert.equal(redSum(40, 0, 8), 29 * 15);
  assert.equal(redSum(15, 0, 9), 29 * 22);
  assert.equal(redSum(53, 128, 51), 29 * 78);
  assert.equal(book.prime[15], 53);
  const prime79 = 79;
  const phi = 78;
  let t = 1;
  for (let j = 0; j < 15; j++) t = (t * 53) % prime79;
  assert.equal(t, 15);
  let cursor = t;
  const observed = new Set();
  for (let j = 0; j < phi; j++) {
    assert.ok(!observed.has(cursor), "premature modular-cycle repeat");
    observed.add(cursor);
    cursor = (cursor * 53) % prime79;
  }
  assert.equal(cursor, t);
  assert.equal(observed.size, phi);
  const iv = Buffer.alloc(16);
  for (let j = 0; j < 128; j++) {
    iv[j >>> 3] |= (cursor & 1) << (7 - (j & 7));
    cursor = (cursor * 53) % prime79;
  }
  return iv;
}

/** Complete matched original/plant/null comparison for a fixed single IV. */
function run() {
  const keys = originalKeys();
  const bodies = originalBodies();
  assert.equal(keys.length, 8);
  assert.deepEqual(bodies.map(x => x.length), Array(8).fill(300));
  const iv = deriveIv();
  const ivs = Array.from({ length: 8 }, () => Buffer.from(iv));
  const language = train(read("resources/control/shakespeare_first300k.txt").slice(0, 200000));
  const planted = plant(keys, ivs, language);
  const observed = search(keys, bodies, ivs, language);
  const randomizedGridNull = nulls(keys, bodies, ivs, language, observed, 20);
  const output = {
    status: "Source-selected finite AES/ChaCha key hypothesis, not an authenticated solution",
    sourcePrimeTriangle: { pages: [40, 15, 53], quotients: [15, 22, 78], base: 53, modulus: 79, period: 78, initialExponent: 15 },
    construction: "128 consecutive least-significant modular power bits, MSB-first bytes, one IV for all eight sections",
    ivHex: iv.toString("hex"),
    sourceCiphertextRuneCount: 8 * 300,
    modeFamilies: 16,
    planted,
    original: observed,
    randomizedGridNull,
    classification: "Requires readable actual plaintext plus complete exact encryption replay for a positive claim"
  };
  process.stdout.write(JSON.stringify(output, null, 2) + "\n");
  return output;
}
if (require.main === module) run();
module.exports = { deriveIv, run };
