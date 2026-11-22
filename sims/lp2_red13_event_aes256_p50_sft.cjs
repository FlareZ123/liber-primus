"use strict";
/**
 * Bounded source-led hypothesis:
 *   225 red rune events + 31 physical 13-dot events = 256 bits;
 *   the 256-cell p50 base60 table is a 256-byte AES-256-ECB ciphertext.
 *
 * Event order is physical page order, then page-local rune offset. A 13-dot
 * mark at offset i is after rune i-1 and before rune i. Red rune = 0 / 13-dot
 * = 1 is the primary bit convention; inverse polarity and MSB/LSB packing are
 * the only binary alternatives. Also test a prime-valued event tape (red rune
 * -> GP prime weight, 13-dot -> 13) hashed once with SHA-256 to a 32-byte key.
 *
 * This is a fixed finite test, not an authenticated Cicada instruction.
 * Table bytes are conditional on the current base60 transcription.
 *
 * Run: node sims/lp2_red13_event_aes256_p50_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const json = name => JSON.parse(read(name));

const annotations = json("resources/liber-primus/lp2-ink-annotations.json");
const corpus = json("resources/liber-primus/lp2-corpus.json");
const tableDoc = json("resources/liber-primus/base60-grid.json");
assert.equal(tableDoc.rows.length, 32);
assert.ok(tableDoc.rows.every(row => row.length === 8));
const table = Buffer.from(tableDoc.byte_rows.flat());
assert.equal(table.length, 256);
const tableSha256 = crypto.createHash("sha256").update(table).digest("hex");
assert.equal(tableSha256,
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const events = [];
let serial = 0;
for (const page of annotations.pages) {
  for (const span of (page.red_spans || [])) {
    const glyphs = Array.from(span.runes);
    assert.equal(glyphs.length, span.length);
    for (let i = 0; i < glyphs.length; i++) {
      const runeIndex = corpus.runes.indexOf(glyphs[i]);
      assert.ok(runeIndex >= 0);
      events.push({
        page: page.page,
        offset: span.start + i,
        kind: "red",
        bit: 0,
        value: corpus.prime[runeIndex],
        serial: serial++
      });
    }
  }
  for (const [offset, dots, color] of (page.large_punctuation || [])) {
    if (dots === 13) {
      events.push({
        page: page.page, offset, kind: "dot13", color,
        bit: 1, value: 13, serial: serial++
      });
    }
  }
}
events.sort((a, b) =>
  a.page - b.page ||
  a.offset - b.offset ||
  (a.kind === "dot13" ? 0 : 1) - (b.kind === "dot13" ? 0 : 1) ||
  a.serial - b.serial
);
const redCount = events.filter(e => e.kind === "red").length;
const dotCount = events.filter(e => e.kind === "dot13").length;
assert.equal(redCount, 225);
assert.equal(dotCount, 31);
assert.equal(events.length, 256);
assert.equal(annotations.counts.red, 225);
assert.equal(annotations.counts.red13 + annotations.counts.black13, 31);

function packBits(bits, msbFirst) {
  assert.equal(bits.length, 256);
  const bytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j++) {
      value |= bits[i + j] << (msbFirst ? 7 - j : j);
    }
    bytes.push(value);
  }
  return Buffer.from(bytes);
}
const bits = events.map(e => e.bit);
const variants = [
  { name: "dot1-red0-msb", key: packBits(bits, true) },
  { name: "dot1-red0-lsb", key: packBits(bits, false) },
  { name: "red1-dot0-msb", key: packBits(bits.map(x => 1 - x), true) },
  { name: "red1-dot0-lsb", key: packBits(bits.map(x => 1 - x), false) }
];
const primeValueTape = Buffer.from(events.map(e => e.value));
assert.equal(primeValueTape.length, 256);
variants.push({
  name: "sha256-prime-value-event-tape",
  key: crypto.createHash("sha256").update(primeValueTape).digest()
});
for (const v of variants) assert.equal(v.key.length, 32);

function aesEcb(input, key, decrypt) {
  const transform = decrypt
    ? crypto.createDecipheriv("aes-256-ecb", key, null)
    : crypto.createCipheriv("aes-256-ecb", key, null);
  transform.setAutoPadding(false);
  return Buffer.concat([transform.update(input), transform.final()]);
}
function entropy(bytes) {
  const counts = new Array(256).fill(0);
  for (const b of bytes) counts[b]++;
  let h = 0;
  for (const n of counts) if (n) {
    const p = n / bytes.length;
    h -= p * Math.log2(p);
  }
  return h;
}
function mod29Ioc(bytes) {
  const counts = new Array(29).fill(0);
  for (const b of bytes) counts[b % 29]++;
  let numerator = 0;
  for (const n of counts) numerator += n * (n - 1);
  return numerator / (bytes.length * (bytes.length - 1));
}
function printableFraction(bytes) {
  let n = 0;
  for (const b of bytes) {
    if ((b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13) n++;
  }
  return n / bytes.length;
}
const magic = {
  PNG: "89504e470d0a1a0a",
  JPEG: "ffd8ff",
  ZIP: "504b0304",
  GZIP: "1f8b08",
  PDF: "25504446",
  ELF: "7f454c46",
  GIF: "47494638",
  SEVEN_Z: "377abcaf271c"
};
const expected = {
  "dot1-red0-msb": "6a4578fe0cf4f6bb648c6718df88bc417fd592891efb656f9ecc66752013924f",
  "dot1-red0-lsb": "937241ed43518845f92d99d2cf37c757fe2929b2e0e372b549da062de256de15",
  "red1-dot0-msb": "e501139cd6e9da70cbfec6609456de20934e3db0405db51f7f8e9b589d9ac20b",
  "red1-dot0-lsb": "07d0d13191b9c47d7f2f5a1af7d1c18858acdf24d02f6ea7bb59ffceade4b6ed",
  "sha256-prime-value-event-tape": "cc9ae57d7893c36aa36478d9dcd66ec47fbb0495d3ebb3ac67fd2c89bdd86897"
};

const results = [];
for (const variant of variants) {
  // Validate this exact key with a full 256-byte AES round trip.
  const plant = Buffer.from(Array.from({ length: 256 }, (_, i) => (i * 73 + 19) & 255));
  assert.deepEqual(aesEcb(aesEcb(plant, variant.key, false), variant.key, true), plant);

  const plaintext = aesEcb(table, variant.key, true);
  const sha256 = crypto.createHash("sha256").update(plaintext).digest("hex");
  assert.equal(sha256, expected[variant.name]);
  const signatures = Object.entries(magic)
    .filter(([, hex]) => plaintext.subarray(0, Buffer.from(hex, "hex").length)
      .equals(Buffer.from(hex, "hex")))
    .map(([name]) => name);
  results.push({
    name: variant.name,
    key_sha256: crypto.createHash("sha256").update(variant.key).digest("hex"),
    key_hamming_weight: Array.from(variant.key).reduce((s, b) => s + b.toString(2).replace(/0/g, "").length, 0),
    plaintext_sha256: sha256,
    prefix_hex: plaintext.subarray(0, 16).toString("hex"),
    printable_fraction: printableFraction(plaintext),
    byte_entropy_bits: entropy(plaintext),
    zero_bytes: plaintext.filter(b => b === 0).length,
    mod29_ioc: mod29Ioc(plaintext),
    recognized_file_signatures: signatures
  });
}
console.log(JSON.stringify({
  source: "225 original red-rune events plus 31 original 13-dot events, page/offset order",
  event_counts: { red_runes: redCount, thirteen_dot_marks: dotCount, total_bits: events.length },
  table: {
    shape: "32x8",
    bytes: table.length,
    sha256: tableSha256,
    interpretation: "base60 token values in physical row-major order"
  },
  cipher: "AES-256-ECB, no IV, no padding",
  scope: "four fixed binary polarity/bit-order variants plus one SHA-256-derived GP-prime event key",
  positive_controls: "5/5 full-length 256-byte AES encrypt/decrypt plants passed",
  results,
  conclusion: "No tested exact source-derived key mapping yields a typed plaintext or common file signature. This retires only these five direct AES-256-ECB transfers; AES itself, other key schedules, other table interpretations and non-AES consumers are not universally excluded."
}, null, 2));
