"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const root = path.join(__dirname, "..");
const pages = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/lp2-corpus.json"), "utf8")).pages;
const grid = JSON.parse(fs.readFileSync(path.join(root, "resources/liber-primus/base60-grid.json"), "utf8"));
const byPage = new Map(pages.map((p) => [p.page, p.indices]));
const p53 = byPage.get(53);
const red = p53.slice(128);
const bytes = Buffer.from(grid.byte_rows.flat());
if (p53.length !== 179 || red.length !== 51 || bytes.length !== 256) throw Error("Input contract mismatch");
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
/** @param {number[]} a @returns {number} */
function ioc(a) {
  const counts = new Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((v, n) => v + n * (n - 1), 0) / (a.length * (a.length - 1));
}
/** @param {number[]} a @returns {Buffer} */
function base29(a) {
  let n = 0n;
  for (const x of a) n = n * 29n + BigInt(x);
  return Buffer.from((n & ((1n << 256n) - 1n)).toString(16).padStart(64, "0"), "hex");
}
const families = {red51: red, red53: p53.slice(-53), red56: p53.slice(-56), black128: p53.slice(0, 128)};
const keys = [];
for (const [name, value] of Object.entries(families)) {
  for (const reversed of [false, true]) {
    const v = reversed ? value.slice().reverse() : value;
    const label = name + "-" + (reversed ? "reverse" : "forward");
    keys.push({name: label + "-base29", key: base29(v)});
    keys.push({name: label + "-sha-digits", key: crypto.createHash("sha256").update(Buffer.from(v)).digest()});
    keys.push({name: label + "-sha-ascii", key: crypto.createHash("sha256").update(v.map((x) => alphabet[x]).join(""), "ascii").digest()});
  }
}
const runePages = [52, 54, 55];
const cipher = runePages.flatMap((p) => byPage.get(p));
const periodic = [];
for (const [name, digits] of Object.entries(families)) {
  if (name === "black128") continue;
  for (const reversed of [false, true]) {
    const pad = reversed ? digits.slice().reverse() : digits;
    for (let offset = 0; offset < pad.length; offset++) {
      for (const sign of [-1, 1]) {
        const clear = cipher.map((x, i) => (x + sign * pad[(offset + i) % pad.length] + 29) % 29);
        periodic.push({ioc: ioc(clear), name, reversed, offset, sign});
      }
    }
  }
}
periodic.sort((a, b) => b.ioc - a.ioc);
/** @param {number} n @param {boolean} le @returns {Buffer} */
function intIV(n, le = false) {
  const b = Buffer.alloc(16);
  if (le) b.writeUInt32LE(n, 0); else b.writeUInt32BE(n, 12);
  return b;
}
/** @param {string} mode @param {number} p @param {number} index @returns {Buffer} */
function iv(mode, p, index) {
  return mode === "pageBE" ? intIV(p) : mode === "pageLE" ? intIV(p, true) :
    mode === "index" ? intIV(index) : mode === "3301" ? intIV(3301) :
    mode === "2014" ? intIV(2014) : Buffer.alloc(16);
}
/** @param {Buffer} stream @param {number} count @param {string} mapping @returns {number[]} */
function toPad(stream, count, mapping) {
  const result = [];
  for (const b of stream) {
    if (mapping === "reject232" && b >= 232) continue;
    result.push(mapping === "scaled" ? Math.floor(29 * b / 256) : b % 29);
    if (result.length === count) break;
  }
  if (result.length !== count) throw Error("Insufficient stream length");
  return result;
}
const aesRune = [];
for (const {name, key} of keys) {
  for (const ivMode of ["zero", "pageBE", "pageLE", "index", "3301", "2014"]) {
    for (const restart of [false, true]) {
      for (const mapping of ["mod29", "reject232", "scaled"]) {
        const draw = (page, index, count) => crypto.createCipheriv("aes-256-ctr", key, iv(ivMode, page, index)).update(Buffer.alloc(3 * count + 128));
        const k = restart ? runePages.flatMap((p, i) => toPad(draw(p, i, byPage.get(p).length), byPage.get(p).length, mapping)) :
          toPad(draw(runePages[0], 0, cipher.length), cipher.length, mapping);
        for (const sign of [-1, 1]) {
          aesRune.push({ioc: ioc(cipher.map((x, i) => (x + sign * k[i] + 29) % 29)), name, ivMode, restart, mapping, sign});
        }
      }
    }
  }
}
aesRune.sort((a, b) => b.ioc - a.ioc);
const rows = Array.from({length: 32}, (_, i) => bytes.subarray(8 * i, 8 * i + 8));
const orders = [
  ["rowmajor", bytes],
  ["rowreverse", Buffer.concat(rows.map((r) => Buffer.from(r).reverse()))],
  ["reverse", Buffer.from(bytes).reverse()],
  ["colmajor", Buffer.from(Array.from({length: 256}, (_, i) => rows[i % 32][Math.floor(i / 32)]))],
  ["serpentine", Buffer.concat(rows.map((r, i) => i % 2 ? Buffer.from(r).reverse() : r))],
];
const aesGrid = [];
for (const {name, key} of keys) {
  for (const [order, data] of orders) {
    for (const [ivName, ivBuf] of [["zero", Buffer.alloc(16)], ["first", bytes.subarray(0, 16)], ["last", bytes.subarray(-16)], ["key", key.subarray(0, 16)], ["3301", intIV(3301)]]) {
      for (const mode of ["ecb", "cbc", "ctr", "ofb", "cfb"]) {
        if (mode === "ecb" && ivName !== "zero") continue;
        const d = crypto.createDecipheriv("aes-256-" + mode, key, mode === "ecb" ? null : ivBuf);
        d.setAutoPadding(false);
        const clear = Buffer.concat([d.update(data), d.final()]);
        aesGrid.push({printable: [...clear].filter((x) => x >= 32 && x <= 126).length,
          gp: [...clear].filter((x) => x < 29).length, name, order, ivName, mode});
      }
    }
  }
}
const sample = Buffer.from("SOME PLAIN TEXT THAT IS ALWAYS READABLE. ".repeat(7).slice(0, 256), "ascii");
const sampleIV = intIV(3301);
const sampleCipher = crypto.createCipheriv("aes-256-ctr", keys[0].key, sampleIV).update(sample);
const sampleRecovered = crypto.createDecipheriv("aes-256-ctr", keys[0].key, sampleIV).update(sampleCipher);
if (!sample.equals(sampleRecovered) || sample.length !== 256) throw Error("AES regression failed");
console.log(JSON.stringify({redLength:red.length, testedKeys:keys.length, sampleRecovered:sampleRecovered.length,
  ciphertextIoc:ioc(cipher), periodic:{models:periodic.length,best:periodic.slice(0, 5)},
  aesRune:{models:aesRune.length,best:aesRune.slice(0, 8)},
  aesGrid:{models:aesGrid.length, topPrintable:aesGrid.slice().sort((a,b)=>b.printable-a.printable).slice(0, 8),
    topGP:aesGrid.slice().sort((a,b)=>b.gp-a.gp).slice(0, 8)}},null,2));
