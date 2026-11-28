"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8").replace(/\r/g, "");
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const tokens = grid.pages.flatMap(page => page.tokens);
const alpha60 = grid.alphabet;
const alpha59 = alpha60.replace("f", "");

const clear = signed
  .split("-----BEGIN PGP SIGNATURE-----")[0]
  .split(/\n\n/u).slice(1).join("\n");
const words = clear
  .split(/[^A-Za-z0-9]+/u)
  .filter(token => /^[A-Za-z]+$/u.test(token))
  .map(word => word.toUpperCase());

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}
const rankOf = new Map();
for (let n = 2, rank = 0; rank < 80; n += 1) if (isPrime(n)) rankOf.set(n, ++rank);

function decode(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0);
  return hi * alphabet.length + lo;
}
const rank = (cell, alphabet) => rankOf.get(decode(tokens[cell], alphabet)) || null;
const at = (row, col) => row * 8 + col;

// Reproduce the already-established zero-origin working scaffold anchors.
const rank17 = at(27, 3);
const rank18 = at(26, 3);
const rank19 = at(25, 3);
assert.deepEqual([rank(rank17, alpha60), rank(rank18, alpha60), rank(rank19, alpha59)], [17,18,19]);
assert.deepEqual(words.slice(17,20), ["THE","MAP","THEIR"]);

// Strict literal compass hypothesis:
//   source index modulo 8 is an eight-way direction code;
//   one global bijection maps residues 0..7 to the eight compass directions;
//   consecutive source ranks on the fixed scaffold must move by that code.
//
// The first two transitions already contradict any such bijection:
// 17->18 is north and 18->19 is also north, but 17 mod8 != 18 mod8.
function step(from, to) {
  const fr = Math.floor(from / 8), fc = from % 8;
  const tr = Math.floor(to / 8), tc = to % 8;
  return [tr - fr, tc - fc];
}
const first = step(rank17, rank18);
const second = step(rank18, rank19);
assert.deepEqual(first, [-1,0]);
assert.deepEqual(second, [-1,0]);
assert.notEqual(17 % 8, 18 % 8);

// Exhaust every possible one-to-one assignment of the two observed residues.
// Since both require NORTH, no injective mapping can satisfy both.
const observed = [
  {sourceIndex:17, residue:17%8, move:first, from:rank17, to:rank18},
  {sourceIndex:18, residue:18%8, move:second, from:rank18, to:rank19},
];
const moveKey = move => move.join(",");
const required = new Map();
for (const item of observed) {
  const key = moveKey(item.move);
  if (required.has(item.residue)) assert.equal(required.get(item.residue), key);
  required.set(item.residue, key);
}
assert.equal(new Set(required.values()).size, 1);
assert.equal(required.size, 2);
assert.ok(required.size > new Set(required.values()).size);

console.log(JSON.stringify({
  status:"PASS",
  hypothesis:"source index mod8 -> one global bijective eight-way compass direction on the 8-column p50 MAP scaffold",
  anchors:[
    {index:17,word:words[17],cell:rank17,row:27,col:3,radix:60},
    {index:18,word:words[18],cell:rank18,row:26,col:3,radix:60},
    {index:19,word:words[19],cell:rank19,row:25,col:3,radix:59},
  ],
  transitions:observed,
  decision:"REJECT: residues 1 and 2 would both have to mean NORTH, contradicting a one-to-one eight-direction code before rank20 is considered."
}, null, 2));
