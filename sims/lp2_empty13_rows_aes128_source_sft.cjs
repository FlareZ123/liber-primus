"use strict";

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

/** @param {string} relativePath */
function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

/**
 * Recover physically printed 13-dot intervals including distinct coincident
 * marks and the two genuinely solved pages, without inventing gap data.
 * @returns {number[]}
 */
function emptyFragmentIndices() {
  const corpus = readJson("resources/liber-primus/lp2-corpus.json");
  const annotations = readJson("resources/liber-primus/lp2-ink-annotations.json");
  const pageStart = new Map();
  let runeTotal = 0;
  for (const page of corpus.pages) {
    pageStart.set(page.page, runeTotal);
    runeTotal += page.runic_count;
  }
  assert.equal(runeTotal, 13136);
  const marks = annotations.pages.flatMap((page) =>
    (page.large_punctuation || [])
      .filter((mark) => mark[1] === 13)
      .map((mark) => ({
        page: page.page,
        absolute: pageStart.get(page.page) + mark[0],
      }))
  ).sort((a, b) => a.absolute - b.absolute || a.page - b.page);
  assert.equal(marks.length, 31);
  const cuts = [0, ...marks.map((m) => m.absolute), runeTotal];
  const lengths = cuts.slice(1).map((cut, i) => cut - cuts[i]);
  assert.equal(lengths.length, 32);
  const empty = lengths.flatMap((length, i) => length === 0 ? [i] : []);
  assert.deepEqual(empty, [8, 11]);
  assert.equal(marks[8].absolute, 1860);
  assert.equal(marks[11].absolute, 3603);
  return empty;
}

/**
 * Convert the exact two-character table tokens under a specified source
 * numeral alphabet. The radix-59 hypothesis simply removes unused f.
 * @param {string[]} tokens
 * @param {string} alphabet
 */
function decodeCells(tokens, alphabet) {
  const radix = alphabet.length;
  const values = tokens.map((token) => {
    assert.equal(token.length, 2);
    const high = alphabet.indexOf(token[0]);
    const low = alphabet.indexOf(token[1]);
    assert(high >= 0 && low >= 0);
    return high * radix + low;
  });
  assert(values.every((value) => value >= 0 && value < 256));
  return Buffer.from(values);
}

/**
 * The two empty 13-dot intervals select two original printed eight-byte rows.
 * Remove those rows from a 32x8 table to obtain exactly 15 AES blocks.
 * @param {Buffer} tableBytes
 * @param {number[]} empty
 * @param {boolean} reverseKey
 */
function getKeyAndCiphertext(tableBytes, empty, reverseKey) {
  assert.equal(tableBytes.length, 256);
  const rows = Array.from({length: 32}, (_, i) =>
    tableBytes.subarray(8 * i, 8 * (i + 1)));
  const ordered = reverseKey ? [...empty].reverse() : empty;
  const key = Buffer.concat(ordered.map((i) => rows[i]));
  const ciphertext = Buffer.concat(rows.filter((_, i) => !empty.includes(i)));
  assert.equal(key.length, 16);
  assert.equal(ciphertext.length, 240);
  return {key, ciphertext};
}

/**
 * Read-only exact AES-128 decryption, with padding disabled because the
 * source supplies an integral number of full blocks.
 * @param {Buffer} input
 * @param {Buffer} key
 * @param {"aes-128-ecb"|"aes-128-cbc"} algorithm
 * @param {Buffer|null} iv
 */
function decrypt(input, key, algorithm, iv) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAutoPadding(false);
  return Buffer.concat([decipher.update(input), decipher.final()]);
}

/** @param {Buffer} bytes */
function printable(bytes) {
  return [...bytes].filter((b) => (b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13).length;
}

/** @param {Buffer} bytes */
function letters(bytes) {
  return [...bytes].filter((b) => (b >= 65 && b <= 90) || (b >= 97 && b <= 122)).length;
}

function main() {
  const empty = emptyFragmentIndices();
  const grid = readJson("resources/liber-primus/lp2-grid-256.json");
  const tokens = grid.pages.flatMap((page) => page.tokens);
  assert.equal(tokens.length, 256);
  assert.equal(grid.alphabet, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx");
  const alternateAlphabet = grid.alphabet.replace("f", "");
  assert.equal(alternateAlphabet.length, 59);

  // Positive: the identical primitive recovers a known 240-byte original-format
  // independent payload under both key orders and both block modes.
  const plant = Buffer.from("Source-driven AES plant, exact 15 blocks. ".repeat(8).slice(0, 240), "ascii");
  assert.equal(plant.length, 240);
  const positiveKey = Buffer.from("00112233445566778899aabbccddeeff", "hex");
  for (const algorithm of ["aes-128-ecb", "aes-128-cbc"]) {
    const iv = algorithm === "aes-128-ecb" ? null : Buffer.alloc(16);
    const cipher = crypto.createCipheriv(algorithm, positiveKey, iv);
    cipher.setAutoPadding(false);
    const encrypted = Buffer.concat([cipher.update(plant), cipher.final()]);
    assert.deepEqual(decrypt(encrypted, positiveKey, algorithm, iv), plant);
  }

  const originalOutputs = [];
  for (const [radix, alphabet] of [[60, grid.alphabet], [59, alternateAlphabet]]) {
    const tableBytes = decodeCells(tokens, alphabet);
    assert.equal(new Set(tableBytes).size, 161);
    if (radix === 60) assert.deepEqual([...tableBytes], grid.bytes);
    for (const reverse of [false, true]) {
      const {key, ciphertext} = getKeyAndCiphertext(tableBytes, empty, reverse);
      const tests = [
        {mode: "ecb", algo: "aes-128-ecb", iv: null, source: ciphertext},
        {mode: "cbc-zero-iv", algo: "aes-128-cbc", iv: Buffer.alloc(16), source: ciphertext},
        {mode: "cbc-first-block-iv", algo: "aes-128-cbc",
          iv: ciphertext.subarray(0, 16), source: ciphertext.subarray(16)},
      ];
      for (const test of tests) {
        const output = decrypt(test.source, key, test.algo, test.iv);
        const record = {
          radix, reverse, mode: test.mode, key: key.toString("hex"),
          bytes: output.length, printable: printable(output),
          asciiLetters: letters(output), head16: output.subarray(0, 16).toString("hex"),
        };
        originalOutputs.push(record);
      }
    }
  }
  assert.equal(originalOutputs.length, 12);
  // Lock two independently executed Python/cryptography reference results.
  assert.deepEqual(originalOutputs
    .filter((o) => !o.reverse && o.mode === "ecb")
    .map((o) => [o.radix, o.key, o.printable, o.asciiLetters, o.head16]), [
      [60, "7aff19c0c749a96cd3dcc631ec543823", 88, 47,
        "3dc886bf4bd04d790a59ed932772a267"],
      [59, "78fb19bdc448a66ad0d9c330e8533723", 93, 58,
        "59b9317e6dc2c7bf3abf5dfebe8db502"],
    ]);
  console.log(JSON.stringify({
    source: "original LP2 p0-p57 13-dot marks and printed p49-p51 32x8 table",
    totalMarks: 31, emptyIntervalIndices: empty, keyRows: empty,
    cipherBytesAfterKeyRows: 240, originalOutputs,
    verdict: "No directly legible ASCII, text or recognized file header; no source-selected AES opcode.",
  }, null, 2));
}
main();
