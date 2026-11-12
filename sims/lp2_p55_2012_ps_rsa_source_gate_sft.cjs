"use strict";

/**
 * Frozen authentic 2012 P.S. RSA-modulus -> LP2 p55 BASE29 original-input gate.
 * Source: Cicada's signed 2012 Valēte! P.S. decimal modulus, with its
 * previously published 216-bit prime factors. No evidence that Cicada used
 * this RSA key on p55; this tests one specific natural historical transfer.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, "..",
  "resources/liber-primus/lp2-corpus.json"), "utf8"));

const psNumber = BigInt(
  "1041279065891998535982789873959431895640" +
  "442510695567564373922695237268242385295908173" +
  "9834390370374475764863415203423499357108713631"
);
const p = 99554414790940424414351515490472769096534141749790794321708050837n;
const q = 104593961812606247801193807142122161186583731774511103180935025763n;
const e = 65537n;
assert.equal(p * q, psNumber);

/** @param {bigint} a @param {bigint} b @returns {[bigint,bigint,bigint]} */
function extendedGcd(a, b) {
  if (b === 0n) return [a, 1n, 0n];
  const [g, x, y] = extendedGcd(b, a % b);
  return [g, y, x - (a / b) * y];
}
const phi = (p - 1n) * (q - 1n);
const [g, inverse] = extendedGcd(e, phi);
assert.equal(g, 1n);
const d = (inverse % phi + phi) % phi;
assert.equal(e * d % phi, 1n);

/** @param {bigint} value @param {bigint} exponent @param {bigint} mod @returns {bigint} */
function modPow(value, exponent, mod) {
  let result = 1n;
  while (exponent > 0n) {
    if (exponent & 1n) result = result * value % mod;
    value = value * value % mod;
    exponent >>= 1n;
  }
  return result;
}

/** @param {number[]} digits @returns {bigint} */
function base29(digits) {
  return digits.reduce((value, digit) => value * 29n + BigInt(digit), 0n);
}

/** @param {bigint} n @returns {number[]} */
function de29(n) {
  const digits = [];
  while (n > 0n) {
    digits.push(Number(n % 29n));
    n /= 29n;
  }
  return digits.reverse();
}

/** @param {bigint} n @returns {Buffer} */
function block54(n) {
  return Buffer.from(n.toString(16).padStart(108, "0"), "hex");
}

const p55 = corpus.pages.find(page => page.page === 55).indices;
const p56 = corpus.pages.find(page => page.page === 56).indices;
assert.equal(p55.length, 76);
assert.equal(p56.length, 85);

// Source-original GP order, first rune most significant, per the 2013
// authenticated BASE29 numeral convention. e=65537 is conventional, but
// neither e nor an RSA-to-p55 instruction is signed by Cicada.
const ciphertext = base29(p55);
assert.ok(ciphertext < psNumber);
const plaintext = modPow(ciphertext, d, psNumber);
assert.equal(modPow(plaintext, e, psNumber), ciphertext);

const decodedBytes = block54(plaintext);
const decodedGP = de29(plaintext);
assert.equal(decodedBytes.length, 54);
assert.equal(decodedGP.length, 88);
assert.equal(decodedBytes.subarray(0, 8).toString("hex"), "02da37be27f7d1a5");
// RFC 8017 RSAES-OAEP requires the first encoded-message byte Y=0x00.
assert.notEqual(decodedBytes[0], 0, "original p55 cannot be OAEP under this key");
const printable = [...decodedBytes].filter(v => v >= 32 && v <= 126).length;
assert.equal(printable, 17);
const nativeP56 = modPow(base29(p56), d, psNumber);
assert.equal(block54(nativeP56).subarray(0, 8).toString("hex"), "4a83c6002f51cb61");

// Independent RSA planted round-trip demonstrates the inverse, without
// treating any original unknown rune as an authentic plaintext known in advance.
const plantedMessage = 3301n;
assert.equal(modPow(modPow(plantedMessage, e, psNumber), d, psNumber), plantedMessage);
console.log(JSON.stringify({
  assessment: "No direct p55 GP29 or ASCII plaintext from signed-2012 RSA key",
  qualification: "2012 factors are real; their use on p55 and exponent 65537 are conjectural",
  sourcePSBits: psNumber.toString(2).length,
  p55CiphertextBits: ciphertext.toString(2).length,
  p55DecodedGP: decodedGP.length,
  p55DecodedBytes: decodedBytes.length,
  p55Printables: printable,
  p55HexPrefix: decodedBytes.subarray(0, 16).toString("hex"),
  rsaPositivePlant: true,
}, null, 2));
