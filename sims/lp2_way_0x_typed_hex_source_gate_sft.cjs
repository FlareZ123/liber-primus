"use strict";

/**
 * SFT: node sims/lp2_way_0x_typed_hex_source_gate_sft.cjs
 * Source-only gate for the signed WAY -> original table `0x` -> MAP/NORTH/HERE
 * hypothesis. No unknown plaintext or cipher selector is asserted.
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = path.join(__dirname, "..");
/** @param {string} p */
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/base60-grid.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const table = grid.rows.flat();
assert.equal(table.length, 256);
assert.equal(grid.alphabet.length, 60);

const gpTokens = corpus.translit.map((s, i) => ({ token: s.toLowerCase(), i }))
  .sort((a, b) => b.token.length - a.token.length);

/** Canonical greedy GP29 spelling, preserving the solved-page NG token. 
 * @param {string} raw
 * @returns {number[]}
 */
function gpEncode(raw) {
  const s = raw.toLowerCase().replace(/v/g, "u")
    .replace(/k/g, "c").replace(/z/g, "s");
  const output = [];
  for (let offset = 0; offset < s.length;) {
    const match = gpTokens.find((x) => s.startsWith(x.token, offset));
    assert(match, "Unencodable GP word: " + raw);
    output.push(match.i);
    offset += match.token.length;
  }
  return output;
}

/** @param {string} s */
function numbers(s) {
  const indices = gpEncode(s);
  return {
    GP0: indices.reduce((n, x) => n + x, 0),
    prime: indices.reduce((n, x) => n + corpus.prime[x], 0)
  };
}
const start = signed.indexOf("Hello.");
const stop = signed.indexOf("-----BEGIN PGP SIGNATURE-----");
assert(start >= 0 && stop > start);
const signedWords = signed.slice(start, stop)
  .match(/(?<![A-Za-z0-9])[A-Za-z]+(?![A-Za-z0-9])/g);
assert(signedWords);
assert.equal(signedWords.length, 43);
assert.deepEqual(numbers("WAY"), {GP0:57, prime:219});
assert.deepEqual(numbers("MAP"), {GP0:56, prime:211});
assert.deepEqual(numbers("HERE"), {GP0:48, prime:168});

const markers = table.flatMap((v, i) => v === "0x" ? [i] : []);
assert.deepEqual(markers, [22, 51, 219]);
const validHexToken = (v) => /^[0-9A-F]{2}$/.test(v);
const hexTokens = table.filter(validHexToken);
assert.equal(hexTokens.length, 73);
assert(markers.every((i) => i % 8 < 7 && !validHexToken(table[i+1])));
assert.deepEqual(markers.map(i => table[i+1]), ["1R", "1Q", "0w"]);

const hitWords = signedWords.map((word, index) => ({
  index, word, ...numbers(word)
})).filter(({GP0, prime}) => table[GP0] === "0x"
  || (prime < table.length && table[prime] === "0x"));
assert.deepEqual(hitWords.map(({index, word}) => [index, word.toLowerCase()]),
  [[13, "way"]]);

const page = (i) => ({row:Math.floor(i/8), column:i%8});
assert.equal(table[219], "0x");
assert.equal(table[57], "1w");
assert.equal(table[56], "4E");
assert.equal(table[48], "4D");
assert.equal(table[65], "4F");
assert.equal(table[170], "4E");
assert.deepEqual([page(57),page(56),page(48)], [
  {row:7,column:1},{row:7,column:0},{row:6,column:0}
]);
assert.equal(57-56, 1); // WEST relative to WAY, a proposed operation.
assert.equal(56-48, 8); // NORTH relative to MAP, proposed by hex "4E" = "N".

const radix60 = (token) => grid.alphabet.indexOf(token[0])*60
  + grid.alphabet.indexOf(token[1]);
const radix59Alphabet = grid.alphabet.replace("f", "");
assert.equal(radix59Alphabet.length, 59);
const radix59 = (token) => radix59Alphabet.indexOf(token[0])*59
  + radix59Alphabet.indexOf(token[1]);
const alternativeSemantics = ["0x","4E","4D"].map(token => ({
  token,radix60:radix60(token),radix59:radix59(token),
  hexadecimal:validHexToken(token) ? parseInt(token, 16) : null
}));
assert.deepEqual(alternativeSemantics, [
  {token:"0x",radix60:59,radix59:58,hexadecimal:null},
  {token:"4E",radix60:254,radix59:250,hexadecimal:78},
  {token:"4D",radix60:253,radix59:249,hexadecimal:77}
]);

// A literal hexadecimal stream from the 256 printed cells is undefined at 183 cells.
// A contiguous 0x-prefixed two-cell hexadecimal word exists at no printed "0x".
assert.equal(256 - hexTokens.length, 183);
console.log(JSON.stringify({
  verdict:"literal adjacent-hex decoder cannot consume the original full table",
  signed_word_count:signedWords.length,
  unique_signed_0x_address:hitWords,
  0x_positions:markers,
  same_row_right_neighbors:markers.map(i => table[i+1]),
  valid_plain_hex_cells:hexTokens.length,
  invalid_plain_hex_cells:256-hexTokens.length,
  source_way_map_here_cells:[57,56,48].map(i=>({i,...page(i),token:table[i]})),
  ambiguous_radices:alternativeSemantics,
  source_selected_unknown_plaintext:false
},null,2));