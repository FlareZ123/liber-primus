"use strict";

/**
 * Original-source RSA factor decision for the LP2 32x8 numeric table.
 *
 * Input: the canonical printed p50 tokens and first-party Cicada 3301
 * RSA primary/subkey public key packet. Each 256-cell interpretation
 * is exactly 2048 bits at most, the size of one factor of a 4096-bit
 * RSA modulus. Test both candidate digit alphabets and four natural
 * table read directions without attempting key recovery.
 *
 * Windows 11 / Node.js 22: node sims/lp2_p50_rsa_cicada_factor_original_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const table = JSON.parse(fs.readFileSync(path.join(
  root, "resources", "liber-primus", "base60-grid.json"), "utf8"));
const armor = fs.readFileSync(path.join(
  root, "resources", "external", "cicada3301-rsa-public-4096.asc"), "utf8");

/**
 * @param {bigint} x
 * @param {bigint} y
 * @returns {bigint}
 */
function gcd(x, y) {
  while (y !== 0n) [x, y] = [y, x % y];
  return x;
}

/**
 * @param {Buffer} bytes
 * @param {number} start
 * @returns {{value: bigint, bits: number, next: number}}
 */
function mpi(bytes, start) {
  const bits = bytes.readUInt16BE(start);
  const size = Math.ceil(bits / 8);
  const body = bytes.subarray(start + 2, start + 2 + size);
  assert.equal(body.length, size);
  return {
    value: BigInt("0x" + body.toString("hex")),
    bits,
    next: start + 2 + size,
  };
}

/**
 * Parse OpenPGP packets without accepting a guessed key modulus.
 * The archived 2012 Cicada public key contains two RSA 4096-bit packets.
 *
 * @param {string} asciiArmor
 * @returns {{kind: string, modulus: bigint, exponent: bigint, bits: number}[]}
 */
function rsaModuli(asciiArmor) {
  const b64 = asciiArmor.split(/\r?\n/)
    .filter(line => line && !line.startsWith("-") && !line.startsWith("="))
    .join("");
  const packetBytes = Buffer.from(b64, "base64");
  const keys = [];
  let i = 0;
  while (i < packetBytes.length) {
    const header = packetBytes[i++];
    assert.ok(header & 0x80, "OpenPGP packet tag");
    let tag, length;
    if (header & 0x40) {
      tag = header & 63;
      const leading = packetBytes[i++];
      if (leading < 192) length = leading;
      else if (leading < 224) length = (leading - 192) * 256 + packetBytes[i++] + 192;
      else if (leading === 255) {
        length = packetBytes.readUInt32BE(i);
        i += 4;
      } else throw new Error("unexpected partial packet");
    } else {
      tag = (header >> 2) & 15;
      const mode = header & 3;
      if (mode === 0) length = packetBytes[i++];
      else if (mode === 1) {
        length = packetBytes.readUInt16BE(i);
        i += 2;
      } else if (mode === 2) {
        length = packetBytes.readUInt32BE(i);
        i += 4;
      } else throw new Error("unexpected indeterminate packet");
    }
    const body = packetBytes.subarray(i, i + length);
    assert.equal(body.length, length);
    if (tag === 6 || tag === 14) {
      assert.equal(body[0], 4, "OpenPGP v4 key");
      assert.equal(body[5], 1, "RSA public key");
      const n = mpi(body, 6);
      const e = mpi(body, n.next);
      assert.equal(e.next, body.length);
      keys.push({kind: tag === 6 ? "primary" : "subkey",
        modulus: n.value, exponent: e.value, bits: n.bits});
    }
    i += length;
  }
  assert.deepEqual(keys.map(k => [k.kind, k.bits, k.exponent.toString()]),
    [["primary", 4096, "65537"], ["subkey", 4096, "65537"]]);
  return keys;
}

/**
 * @param {string[][]} rows
 * @param {"printed"|"printed-reverse"|"columns"|"columns-reverse"} direction
 * @returns {string[]}
 */
function readTokens(rows, direction) {
  const printed = rows.flat();
  const columns = Array.from({length: 256},
    (_, index) => rows[index % 32][Math.floor(index / 32)]);
  if (direction === "printed") return printed;
  if (direction === "printed-reverse") return [...printed].reverse();
  if (direction === "columns") return columns;
  return columns.reverse();
}

/**
 * @param {string[]} symbols
 * @param {string} alphabet
 * @returns {bigint}
 */
function toInteger(symbols, alphabet) {
  const base = alphabet.length;
  const bytes = symbols.map(token => {
    assert.equal(token.length, 2);
    const hi = alphabet.indexOf(token[0]);
    const lo = alphabet.indexOf(token[1]);
    assert.ok(hi >= 0 && lo >= 0, "source token is valid");
    const value = hi * base + lo;
    assert.ok(value >= 0 && value <= 255);
    return value;
  });
  return BigInt("0x" + Buffer.from(bytes).toString("hex"));
}

function main() {
  assert.equal(table.rows.length, 32);
  assert.ok(table.rows.every(row => row.length === 8));
  const base60 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx";
  const base59 = base60.replace("f", "");
  assert.equal(base60.length, 60);
  assert.equal(base59.length, 59);
  const original = table.rows.flat();
  assert.deepEqual(original.map(t => base60.indexOf(t[0]) * 60 +
    base60.indexOf(t[1])), table.byte_rows.flat(),
    "printed token transcription and derived bytes agree");
  const keys = rsaModuli(armor);

  const results = [];
  const directions = ["printed", "printed-reverse", "columns", "columns-reverse"];
  for (const [radix, alphabet] of [[60, base60], [59, base59]]) {
    for (const direction of directions) {
      const factor = toInteger(readTokens(table.rows, direction), alphabet);
      const sizes = keys.map(key => gcd(factor, key.modulus));
      results.push({
        radix, direction, factorBits: factor.toString(2).length,
        lastByteParity: Number(factor & 1n),
        primaryGcd: sizes[0].toString(),
        subkeyGcd: sizes[1].toString(),
      });
      assert.ok(sizes.every(value => value === 1n));
    }
  }
  assert.equal(results.length, 8);
  const plantedFactor = (1n << 2047n) + 123n;
  const plantedModulus = plantedFactor * ((1n << 2048n) + 555n);
  assert.equal(gcd(plantedFactor, plantedModulus), plantedFactor);

  console.log(JSON.stringify({
    result: "NO ORIGINAL DIRECT RSA FACTOR",
    source: "LP2 p50 256 tokens + signed/public Cicada 2012 primary and subkey",
    publicKeys: keys.map(key => ({kind:key.kind, bits:key.bits,
      exponent:key.exponent.toString()})),
    tested: results,
    positiveControl: "2048-bit planted factor recovered exactly",
    scope: "Eight natural byte interpretations of the canonical numeric table only",
  }, null, 2));
}
if (require.main === module) main();
module.exports = {main, gcd, rsaModuli, toInteger, readTokens};
