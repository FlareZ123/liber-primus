"use strict";

/**
 * 2014 LP1 p05 "Wisdom" word-grid -> historical 1033 square -> Stage10 form
 * exact-source overlap, with no inferred POST acceptance or LP2 decryption.
 *
 * Node.js >=18, repository-root command:
 * node sims/lp1_wisdom_stage10_1033_square_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @param {string} file @returns {string} */
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const gp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const digitToPrime = new Map(gp.runes.map((rune, i) => [rune, gp.prime[i]]));
assert.equal(gp.runes.length, 29);
assert.equal(gp.prime.length, 29);

/** @param {string} token @returns {number} */
function sumWord(token) {
  let total = 0;
  for (const glyph of token) {
    const weight = digitToPrime.get(glyph);
    assert.ok(weight !== undefined, "non-GP symbol in historical printed word");
    total += weight;
  }
  return total;
}

/** @param {number[][]} square @returns {object} */
function checkSquare(square) {
  const order = square.length;
  assert.equal(order, 5);
  assert(square.every(row => row.length === order));
  const rows = square.map(row => row.reduce((a, b) => a + b, 0));
  const columns = Array.from({length: order}, (_, c) =>
    square.reduce((sum, row) => sum + row[c], 0));
  const diagonals = [
    square.reduce((sum, row, r) => sum + row[r], 0),
    square.reduce((sum, row, r) => sum + row[order - r - 1], 0),
  ];
  const valid = [...rows, ...columns, ...diagonals].every(value => value === 1033);
  return {order, rows, columns, diagonals, valid};
}

const wisdomText = read("resources/external/2013-0-wisdom.txt");
const printed = wisdomText.split(/\r?\n/);
const marker = printed.findIndex(line => line.includes("ᚳᚾᚩᚹ•ᚦᛁᛋ"));
assert.ok(marker >= 0, "original Wisdom table heading");
const table = printed.slice(marker + 1).filter(line => line.trim()).slice(0, 5)
  .map(line => line.trim().split(/\s{2,}/).map(token =>
    token.replace(/[⁘⁜]/gu, "").trim()));
assert.equal(table.length, 5);
assert(table.every(row => row.length === 5));
const printedNumbers = table.flat().filter(token => /^\d+$/.test(token));
const printedWords = table.flat().filter(token => !/^\d+$/.test(token));
assert.equal(printedNumbers.length, 12);
assert.equal(printedWords.length, 13);
const wisdomNumbers = table.map(row => row.map(token =>
  /^\d+$/.test(token) ? Number(token) : sumWord(token)));
const property = checkSquare(wisdomNumbers);
assert.equal(property.valid, true);

const squareSource = read("resources/cicada2014-openpuff-magic-squares.txt");
const archivedSquares = squareSource.trim().split(/\r?\n\s*\r?\n/)
  .map(block => block.trim().split(/\r?\n/)
    .map(line => line.trim().split(/\s+/).map(Number)));
assert.deepEqual(archivedSquares.map(matrix => matrix.length), [5, 7, 5]);
for (const matrix of archivedSquares) assert(matrix.every(row => row.length === matrix.length));
const stage10Matrix = archivedSquares[2];
assert.deepEqual(wisdomNumbers, stage10Matrix,
  "all 25 numeric cells equal archived 2014 OpenPuff third square");
assert.equal(checkSquare(stage10Matrix).valid, true);

const form = JSON.parse(read("resources/external/cicada2014-onion6-magic-form-and-response.json"));
assert.equal(form.client_form_semantics.method, "POST");
assert.equal(form.client_form_semantics.action, "/cgi-bin/squares");
const fields = form.client_form_semantics.named_successful_controls_in_document_order;
assert.deepEqual(fields.map(field => field.name), ["53301", "71033", "51033", "onion"]);
assert.equal(fields[2].label, "Order 5 Square, 1033");
assert(form.files[0].raw_html.includes('name="51033"'));
assert.equal(form.client_form_semantics.exact_historical_post_body_preserved, false);
assert.equal(form.client_form_semantics.custom_client_side_transform, false);

console.log(JSON.stringify({
  classification: "same historical source 5×5 square in two original LP1/2014 artifacts; candidate Stage10 field value",
  original_lp1_p5: {
    physical_original_scan: "resources/liber-primus/05.jpg",
    original_printed_cells: {numbers: printedNumbers.length, runeWords: printedWords.length},
    wordSums: printedWords.map(word => ({runes: word, primeSum: sumWord(word)})),
    numbers: wisdomNumbers,
    invariants: property,
  },
  archived_openpuff_third_square: {
    source: "resources/cicada2014-openpuff-magic-squares.txt",
    ordinal: 3,
    values_equal: 25,
    matrix: stage10Matrix,
  },
  historical_stage10_form: {
    source: "resources/external/cicada2014-onion6-magic-form-and-response.json",
    field: "51033",
    request_method: form.client_form_semantics.method,
    backend: form.client_form_semantics.action,
    exact_post_and_validation_unavailable: true,
  },
  result: "Exact original-byte/source-reconstructed 25-cell identity; mathematically valid 1033 answer candidate. No recorded accepted submission; no LP2 key or plaintext.",
}, null, 2));
