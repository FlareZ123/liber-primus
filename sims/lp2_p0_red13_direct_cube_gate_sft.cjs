"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const corpus = JSON.parse(
  fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8")
);

/** @param {number} value */
function mod29(value) {
  return ((value % 29) + 29) % 29;
}

/** @param {number} base @param {number} exponent */
function modPow(base, exponent) {
  let result = 1;
  let x = mod29(base);
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * x) % 29;
    x = (x * x) % 29;
    e = Math.floor(e / 2);
  }
  return result;
}

const cipher = corpus.pages.find((page) => page.page === 0).indices.slice(0, 13);
assert.deepEqual(cipher, [15,8,18,3,6,19,27,0,15,26,18,21,5]);

const cube = cipher.map((value) => modPow(value, 3));
const inverseCube = cipher.map((value) => modPow(value, 19));
assert.deepEqual(cube, [11,19,3,27,13,15,21,0,11,2,3,10,9]);
assert.deepEqual(inverseCube, [19,2,14,18,4,8,3,0,19,11,14,27,22]);

console.log("PASS p0 red13 direct cube negative");
console.log(JSON.stringify({ cipher, cube, inverseCube }, null, 2));
