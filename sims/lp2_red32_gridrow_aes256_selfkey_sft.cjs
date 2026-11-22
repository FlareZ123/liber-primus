"use strict";

/**
 * Source-selected 32 red-run lengths -> 32 printed grid rows -> one AES-256 key.
 * All source positions derive from the canonical annotated original LP2 pages.
 * This is an exploratory original-input test, not an authenticated cipher.
 * Node.js 22, CommonJS, standalone SFT.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
/** @param {string} filename */
const load = filename => JSON.parse(fs.readFileSync(path.join(ROOT, filename), "utf8"));

const source = load("resources/liber-primus/lp2-ink-annotations.json");
const grid = load("resources/liber-primus/lp2-grid-256.json");
const GRID_SHA = "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290";
const FIBONACCI_SPIRAL = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];

/** Count original red runes between every consecutive 13-dot mark. */
function redIntervals() {
  /** @type {number[]} */
  const lengths = [];
  let red = 0, markers = 0, redRuneCount = 0;
  for (let number = 0; number <= 57; number++) {
    const page = source.pages.find(p => p.page === number);
    if (!page) continue;
    const flags = new Uint8Array(page.rune_count);
    for (const span of page.red_spans || []) {
      for (let i = span.start; i < span.start + span.length; i++) flags[i] = 1;
    }
    for (let i = 0; i <= page.rune_count; i++) {
      for (const mark of page.large_punctuation || []) {
        if (mark[0] === i && mark[1] === 13) {
          lengths.push(red);
          red = 0;
          markers++;
        }
      }
      if (i < page.rune_count && flags[i]) {
        red++;
        redRuneCount++;
      }
    }
  }
  lengths.push(red);
  assert.equal(markers, 31);
  assert.equal(lengths.length, 32);
  assert.equal(redRuneCount, 225);
  assert.equal(lengths.reduce((s, x) => s + x, 0), 225);
  assert.deepEqual(lengths, [
    13, 0, 16, 0, 3, 0, 11, 0, 0, 14, 12, 0, 9, 11, 0, 16,
    0, 19, 0, 10, 0, 8, 0, 3, 0, 59, 9, 0, 5, 0, 7, 0
  ]);
  return lengths;
}

/** @param {Buffer} key @param {Buffer} iv @param {Buffer} data */
function aesCtr(key, iv, data) {
  const stream = crypto.createDecipheriv("aes-256-ctr", key, iv);
  return Buffer.concat([stream.update(data), stream.final()]);
}

/**
 * Authenticating the original bytes treats the final 16 bytes as an AES-GCM
 * tag. This one frozen packet convention is a hypothesis, not source evidence.
 * @param {Buffer} key @param {Buffer} iv @param {Buffer} data
 */
function gcmValid(key, iv, data) {
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv.subarray(0, 12));
  decipher.setAuthTag(data.subarray(-16));
  decipher.update(data.subarray(0, -16));
  try {
    decipher.final();
    return true;
  } catch {
    return false;
  }
}

function main() {
  const lengths = redIntervals();
  const cells = grid.pages.flatMap(page => page.bytes);
  const ciphertext = Buffer.from(cells);
  assert.equal(ciphertext.length, 256);
  assert.equal(crypto.createHash("sha256").update(ciphertext).digest("hex"), GRID_SHA);
  const key = Buffer.from(lengths.map((len, row) => ciphertext[8 * row + (len % 8)]));
  const iv = Buffer.from(FIBONACCI_SPIRAL.map(value => value & 255));
  assert.equal(key.length, 32);
  assert.equal(iv.length, 16);
  assert.equal(key.toString("hex"), "ed5c796d27503bfe7a2eadd396da492ac90d7d0ee9f0eb510044af8e006ac071");
  const decoded = aesCtr(key, iv, ciphertext);
  assert.equal(decoded.length, 256);
  assert.equal(decoded.subarray(0, 16).toString("hex"), "e9c7dea26e9fbaf97c7574eb488e6669");
  const printable = [...decoded].filter(value => value >= 32 && value <= 126).length;
  assert.equal(printable, 81);
  assert.deepEqual(aesCtr(key, iv, decoded), ciphertext);
  const authenticated = gcmValid(key, iv, ciphertext);
  assert.equal(authenticated, false);

  // Independent source-native positive, using the exact derived key and IV.
  const plantedText = Buffer.from("LIBER PRIMUS SELFKEY AES-256 SOURCE-DEFINED CONTROL", "ascii");
  const plantCipher = aesCtr(key, iv, plantedText);
  assert.deepEqual(aesCtr(key, iv, plantCipher), plantedText);
  const encryptor = crypto.createCipheriv("aes-256-gcm", key, iv.subarray(0, 12));
  const encrypted = Buffer.concat([encryptor.update(plantedText), encryptor.final()]);
  const plantedPacket = Buffer.concat([encrypted, encryptor.getAuthTag()]);
  assert.equal(gcmValid(key, iv, plantedPacket), true);

  console.log(JSON.stringify({
    input: "original LP2 annotations, base60 table, p15 red-seeded spiral",
    source: { redRuneCount: 225, markerCount: 31, intervalCount: 32,
      gridRows: 32, gridColumns: 8, gridSha256: GRID_SHA },
    selector: "one cell per printed row, column = interval length mod 8",
    lengths,
    keyHex: key.toString("hex"),
    ivHex: iv.toString("hex"),
    aes256Ctr: { printableAscii: printable, totalBytes: 256,
      prefixHex: decoded.subarray(0, 32).toString("hex"),
      exactReverse: true, plaintextRecovered: false },
    aes256Gcm: { nonce: "first 12 bytes of the 16-byte p15 IV",
      last16BytesAsTagAuthenticated: authenticated },
    plant: { ctrRecovered: true, gcmAuthenticated: true },
    decision: "The derived row-selected key is concrete, but neither frozen cipher readout authenticates the printed table as plaintext."
  }, null, 2));
}

if (require.main === module) main();
module.exports = { redIntervals, aesCtr, gcmValid, main };
