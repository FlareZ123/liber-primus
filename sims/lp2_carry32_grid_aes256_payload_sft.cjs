"use strict";

/**
 * Source-selected 32 cross-page words pick one cell from each row of the
 * original 32x8 sexagesimal table. Test the resulting 32-byte AES key
 * against the remaining 224 bytes as a self-contained encrypted payload.
 *
 * AES, selecting sum(primes) mod 8, and binary serialization are hypotheses,
 * not authenticated Liber Primus instructions.
 *
 * SFT: node sims/lp2_carry32_grid_aes256_payload_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {createHash, createCipheriv, createDecipheriv} = require("node:crypto");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-corpus.json"), "utf8"));
const grid = JSON.parse(fs.readFileSync(path.join(root,
  "resources/liber-primus/base60-grid.json"), "utf8"));
const transcript = fs.readFileSync(path.join(root,
  "resources/liber-primus/lp2-transcription.txt"), "utf8");

const runePrime = new Map(corpus.runes.map((rune, i) =>
  [rune, corpus.prime[i]]));
assert.equal(runePrime.size, 29);

/**
 * Word parsing is continuous across soft line wraps and physical pages.
 * Only the first 55 rune-bearing transcript sections are unknown LP2.
 * @param {string} raw
 * @returns {{words:number,runes:number,carries:Array<{runes:string,primeSum:number,startPage:number,endPage:number}>}}
 */
function parseCrossPageWords(raw) {
  const unknown = raw.split("%").slice(0, 55).join("%");
  const carries = [];
  let page = 0, startPage = 0, endPage = 0;
  let word = [], primeSum = 0, words = 0, runes = 0;

  function finishWord() {
    if (!word.length) return;
    words++;
    if (startPage !== endPage) {
      carries.push({
        runes: word.join(""), primeSum,
        startPage, endPage
      });
    }
    word = [];
    primeSum = 0;
  }

  for (const rune of unknown) {
    if (runePrime.has(rune)) {
      if (!word.length) startPage = page;
      endPage = page;
      word.push(rune);
      primeSum += runePrime.get(rune);
      runes++;
    } else if (rune === "%") {
      page++;
    } else if (rune === "/" || /\s/u.test(rune)) {
      // Image line wraps and spaces are not word boundaries.
    } else {
      // Visible punctuation, '.', '-' and section marks delimit words.
      finishWord();
    }
  }
  finishWord();
  return {words, runes, carries};
}

/** @param {Buffer} data @returns {string} */
function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

const parsed = parseCrossPageWords(transcript);
assert.equal(parsed.runes, 12956);
assert.equal(parsed.words, 2896);
assert.equal(parsed.carries.length, 32);
assert.deepEqual(grid.page_row_counts, [10, 13, 9]);
assert.equal(grid.alphabet.length, 60);
assert.equal(grid.byte_rows.length, 32);

const table = [];
for (let row = 0; row < 32; row++) {
  assert.equal(grid.rows[row].length, 8);
  assert.equal(grid.byte_rows[row].length, 8);
  for (let col = 0; col < 8; col++) {
    const token = grid.rows[row][col];
    const byte = 60 * grid.alphabet.indexOf(token[0]) +
      grid.alphabet.indexOf(token[1]);
    assert.equal(byte, grid.byte_rows[row][col]);
    assert.ok(byte >= 0 && byte <= 255);
    table.push(byte);
  }
}
assert.equal(sha256(Buffer.from(table)),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

const selectedColumns = parsed.carries.map((word) => word.primeSum % 8);
const key = Buffer.from(selectedColumns.map((col, row) =>
  grid.byte_rows[row][col]));
const unselectedRows = grid.byte_rows.map((values, row) =>
  values.filter((_, col) => col !== selectedColumns[row]));
const payloadRowMajor = Buffer.from(unselectedRows.flat());
const payloadColumnMajor = Buffer.from(
  Array.from({length: 7}, (_, col) =>
    unselectedRows.map((row) => row[col])).flat()
);
const entireTable = Buffer.from(table);

assert.equal(selectedColumns.join(""), "41733365273004427417340057065101");
assert.equal(key.toString("hex"),
  "61f9571927499cc41952c1d3de0e3656abf5d2f85294eb807315393300ea909e");
assert.equal(payloadRowMajor.length, 224);
assert.equal(payloadColumnMajor.length, 224);
assert.equal(sha256(payloadRowMajor),
  "ba31bfb8fb5ac631b34208e741552f2659f7e206a664b8c78d4dbf1e24974106");
assert.equal(sha256(payloadColumnMajor),
  "7b77462eb0597b4c0c918a70b4453531805a1c973bfec66efd935ced53e74233");

/**
 * @param {Buffer} input
 * @param {"ecb"|"cbc"|"ctr"} mode
 * @param {"encrypt"|"decrypt"} operation
 * @returns {Buffer}
 */
function aes256(input, mode, operation) {
  const algorithm = "aes-256-" + mode;
  const iv = mode === "ecb" ? null : Buffer.alloc(16);
  const cipher = operation === "encrypt"
    ? createCipheriv(algorithm, key, iv)
    : createDecipheriv(algorithm, key, iv);
  cipher.setAutoPadding(false);
  return Buffer.concat([cipher.update(input), cipher.final()]);
}

/**
 * @param {Buffer} data
 * @returns {{printable:number,longestPrintableRun:number,zeroBytes:number,strings:string[]}}
 */
function inspect(data) {
  let printable = 0, currentRun = 0, longestPrintableRun = 0;
  const strings = [];
  for (const byte of data) {
    if (byte >= 32 && byte <= 126) {
      printable++;
      currentRun++;
      longestPrintableRun = Math.max(longestPrintableRun, currentRun);
    } else {
      currentRun = 0;
    }
  }
  const matches = data.toString("latin1").match(/[\x20-\x7e]{5,}/g);
  if (matches) strings.push(...matches);
  return {printable, longestPrintableRun, zeroBytes: data.filter(b => b === 0).length,
    strings};
}

const payloads = [
  {name: "unselected-row-major", bytes: payloadRowMajor},
  {name: "unselected-column-major", bytes: payloadColumnMajor},
  {name: "entire-original-row-major", bytes: entireTable}
];
const expected = {
  "unselected-row-major": [
    "541907d04fb2213641dc3c20ac1da9b67348a3287384089e80e6dbe419d163c3",
    "8929c3301086983eb4710359f21a4143eb0749e366c00e840cc28885d10c8595",
    "187fddfc334799ae99b2dd546c9c638652b9a7fd549e0c629cfed2207f2b632c"
  ],
  "unselected-column-major": [
    "489bb18b0ab1c9bdbe8889d7c9ba8691aee53ab0f2a183ece77677c4d5c97748",
    "d8b4cda87c3ffa6a3d8fe1872f74e30a6c44daff2aa4711f987151e1f62d33b5",
    "62025f7e09bbc1fb2e803ef9360604b45c1816a411172f6201acfc5b90856be6"
  ],
  "entire-original-row-major": [
    "aa3020da40f67829a29a334323ed490d6d08faae6a5ecb60a04a5f42a6a40a67",
    "01c3dbcdff2f54083426900e8d3086e7a7e0638e843d8a7afd160a20610347fe",
    "5c5c7eb9ec67786943fbf50a27c8061c07633e1e836ea284ed6e8764f639ec70"
  ]
};

const results = [];
for (const entry of payloads) {
  for (const [index, mode] of ["ecb", "cbc", "ctr"].entries()) {
    const decoded = aes256(entry.bytes, mode, "decrypt");
    const digest = sha256(decoded);
    assert.equal(digest, expected[entry.name][index]);

    // Native-text plant validates reversibility for every format/mode.
    const plant = Buffer.alloc(entry.bytes.length, 65);
    Buffer.from("LIBER PRIMUS POSITIVE CONTROL.").copy(plant);
    const recovered = aes256(aes256(plant, mode, "encrypt"),
      mode, "decrypt");
    assert.deepEqual(recovered, plant);
    const output = inspect(decoded);
    results.push({
      source: entry.name, mode: "aes-256-" + mode,
      sourceBytes: entry.bytes.length, sha256: digest,
      ...output, plantRecovered: recovered.length
    });
  }
}

console.log(JSON.stringify({
  source: "Original 55 unknown physical pages; 32 cross-page words; pp49-51 printed 32x8 table",
  runes: parsed.runes, words: parsed.words, carries: parsed.carries.length,
  carryColumns: selectedColumns.join(""), keyHex: key.toString("hex"),
  results, conclusion: "No ASCII text or recognizable opening signature among the tested exact AES256 key/payload formats; no unknown LP2 plaintext recovered."
}, null, 2));
