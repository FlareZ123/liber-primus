#!/usr/bin/env node
"use strict";

// Frozen source-motivated tests of the 2013 OS / 2014 Stage11 number cluster.
// No parameter fitting: each candidate's roles are fixed before looking at p55.

const fs = require("node:fs");
const assert = require("node:assert/strict");

const grid = JSON.parse(fs.readFileSync("resources/liber-primus/base60-grid.json", "utf8"));
const corpus = JSON.parse(fs.readFileSync("resources/liber-primus/lp2-corpus.json", "utf8"));
const html = fs.readFileSync("resources/external/cicada2014-stage11-onion7-original-index.html", "utf8");
const osMessage = fs.readFileSync("resources/historical/cicada2013-os-original-message.txt", "utf8");

assert.match(html, /<title>133<\/title>/i);
assert.match(html, /<div id=["']331["']>/i);
assert.match(osMessage, /1231507051321/);
assert.match(osMessage, /THE KEY IS ALL AROUND YOU/i);
assert.equal(grid.rows.length, 32);
assert.ok(grid.rows.every(row => row.length === 8));
assert.equal(grid.byte_rows.length, 32);
assert.ok(grid.byte_rows.every(row => row.length === 8));

const bytes = grid.byte_rows.flat();
assert.equal(bytes.length, 256);
const page55 = corpus.pages.find(page => page.page === 55);
const page57 = corpus.pages.find(page => page.page === 57);
assert.ok(page55 && page57);
const ciphertext = page55.indices;
assert.equal(ciphertext.length, 76);
const translit = corpus.translit;

function gcd(a, b) {
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}
function render(indices) {
  return indices.map(index => translit[index]).join(" ");
}
function ioc(indices) {
  const counts = Array(29).fill(0);
  for (const index of indices) counts[index]++;
  const n = indices.length;
  return counts.reduce((sum, count) => sum + count * (count - 1), 0) / (n * (n - 1));
}
function testKey(keyBytes) {
  assert.equal(keyBytes.length, 76);
  const key = keyBytes.map(value => ((value % 29) + 29) % 29);
  const subtract = ciphertext.map((value, i) => (value - key[i] + 29) % 29);
  const add = ciphertext.map((value, i) => (value + key[i]) % 29);
  return {
    key_gp29: render(key),
    p55_subtract: render(subtract),
    p55_subtract_ioc: ioc(subtract),
    p55_add_control: render(add),
    p55_add_ioc: ioc(add),
    p55_raw_ioc: ioc(ciphertext)
  };
}
function affineOrder(size, start, step) {
  const order = Array.from({ length: size }, (_, n) => (start + step * n) % size);
  assert.equal(new Set(order).size, size);
  return order;
}
function toBase29(number) {
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
  let n = BigInt(number);
  if (n === 0n) return "0";
  let out = "";
  while (n > 0n) {
    const digit = Number(n % 29n);
    out = alphabet[digit] + out;
    n /= 29n;
  }
  return out;
}
function toGpRunes(words) {
  const sorted = translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of words.split(" ")) {
    for (let i = 0; i < word.length;) {
      const match = sorted.find(({ token }) => word.startsWith(token, i));
      assert.ok(match, "No GP spelling for " + word.slice(i));
      out.push(match.index);
      i += match.token.length;
    }
  }
  return out;
}
function compareKnownTail(tail) {
  const expectedP56 = "AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE";
  const known180 = toGpRunes(expectedP56).concat(page57.indices);
  assert.equal(known180.length, 180);
  assert.equal(tail.length, 180);
  return {
    known_length: known180.length,
    exact_matches: tail.reduce((n, value, i) => n + (value === known180[i] ? 1 : 0), 0),
    reverse_matches: tail.reduce((n, value, i) => n + (value === known180[179 - i] ? 1 : 0), 0),
    tail_first40: render(tail.slice(0, 40))
  };
}

// Original 32x8 table's perimeter, clockwise from top-left.
const perimeter = [];
for (let c = 0; c < 8; c++) perimeter.push(grid.byte_rows[0][c]);
for (let r = 1; r < 31; r++) perimeter.push(grid.byte_rows[r][7]);
for (let c = 7; c >= 0; c--) perimeter.push(grid.byte_rows[31][c]);
for (let r = 30; r >= 1; r--) perimeter.push(grid.byte_rows[r][0]);
assert.equal(perimeter.length, 76);

// Candidate A: title=133 start, div=331 stride on the 76-cell perimeter.
const perimeterStart = 133 % 76;
const perimeterStep = 331 % 76;
assert.equal(gcd(perimeterStep, 76), 1);
const perimeterOrder = affineOrder(76, perimeterStart, perimeterStep);
const perimeterTest = testKey(perimeterOrder.map(position => perimeter[position]));

// Candidate B: title=133 start, div=331 stride over all 256 cells.
const fullStart = 133 % 256;
const fullStep = 331 % 256;
assert.equal(gcd(fullStep, 256), 1);
const fullOrder = affineOrder(256, fullStart, fullStep);
const fullPermutation = fullOrder.map(position => bytes[position]);
const fullTableTest = testKey(fullPermutation.slice(0, 76));
const fullTableTail = compareKnownTail(fullPermutation.slice(76).map(value => value % 29));

// Candidate C: the 2013 OS palindromic-prime handle is a periodic BASE29 key.
const handle = 1231507051321n;
const handleString = handle.toString();
assert.equal(handleString, [...handleString].reverse().join(""));
const handleBase29 = toBase29(handle);
const base29Alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
const handleDigits = [...handleBase29].map(character => base29Alphabet.indexOf(character));
assert.ok(handleDigits.every(digit => digit >= 0 && digit < 29));
const handlePeriodicKey = Array.from({ length: 76 }, (_, i) => handleDigits[i % handleDigits.length]);
const handleTest = testKey(handlePeriodicKey);

// Candidate D: a conventional LCG with handle residue as seed, title as multiplier,
// div ID as increment, and the 256-cell table as modulus.
const seed = Number(handle % 256n);
const multiplier = 133;
const increment = 331 % 256;
assert.equal(seed, 57);
assert.equal(multiplier % 4, 1);
assert.equal(increment % 2, 1);
const lcgStates = [];
let state = seed;
for (let n = 0; n < 256; n++) {
  lcgStates.push(state);
  state = (multiplier * state + increment) % 256;
}
assert.equal(new Set(lcgStates).size, 256);
const lcgPermutation = lcgStates.map(position => bytes[position]);
const lcgTest = testKey(lcgPermutation.slice(0, 76));
const lcgTail = compareKnownTail(lcgPermutation.slice(76).map(value => value % 29));

console.log(JSON.stringify({
  source_values: {
    os_handle: handle.toString(),
    handle_is_palindrome: true,
    handle_base29: handleBase29,
    handle_mod256_seed: seed,
    stage11_title: 133,
    stage11_div_id: 331,
    title_mod76: 133 % 76,
    div_mod76: 331 % 76,
    div_mod256_increment: increment
  },
  perimeter_affine: {
    start: perimeterStart, step: perimeterStep, gcd: gcd(perimeterStep, 76),
    unique_positions: new Set(perimeterOrder).size, ...perimeterTest
  },
  full_table_affine: {
    start: fullStart, step: fullStep, gcd: gcd(fullStep, 256),
    unique_positions: new Set(fullOrder).size, ...fullTableTest, tail180: fullTableTail
  },
  handle_periodic_base29: { key_length: handleDigits.length, ...handleTest },
  handle_seed_title_multiplier_div_increment_lcg: {
    seed, multiplier, increment, modulus: 256, full_period: new Set(lcgStates).size,
    ...lcgTest, tail180: lcgTail
  }
}, null, 2));
