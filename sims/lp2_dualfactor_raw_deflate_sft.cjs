"use strict";

/**
 * Source-selected LP2 causal-polynomial inverse followed by literal raw
 * DEFLATE transport. This extends the prior H/G/HG compressed-file test,
 * which checked headed gzip/zlib formats but did not decode raw DEFLATE.
 *
 * Input: original 55 rune-bearing LP2 physical pages and nine source
 * visual chapters. H = 2013 signed BASE29 example; G = p39 red rune triad.
 * Output: exact original results plus authentic compressed-text plants.
 *
 * SFT: node sims/lp2_dualfactor_raw_deflate_sft.cjs
 * Node.js 22 built-ins only. Read-only and deterministic.
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, "..", "resources", "liber-primus", "lp2-corpus.json"),
  "utf8"
));
const pages = corpus.pages.filter(p => p.page < 56 && p.indices.length);
const all = pages.flatMap(p => p.indices);
assert.equal(pages.length, 55);
assert.equal(all.length, 12956);
const cuts = [0, 729, 1874, 3603, 5506, 6527, 7960, 9640, 12648, 12956];
const units = [{label: "all", symbols: all}];
for (let i = 0; i < cuts.length - 1; i++) {
  units.push({label: "chapter" + i, symbols: all.slice(cuts[i], cuts[i + 1])});
}
for (const p of pages) units.push({label: "p" + p.page, symbols: p.indices});
assert.equal(units.length, 65);

/** @param {number} n */
const mod = n => ((n % 29) + 29) % 29;

/** @param {number} n */
function inverse(n) {
  for (let i = 1; i < 29; i++) if (mod(n * i) === 1) return i;
  throw new Error("Noninvertible GF29 source coefficient");
}

/** @param {number[]} data @param {number[]} taps */
function decode(data, taps) {
  const out = new Array(data.length);
  const inv = inverse(taps[0]);
  for (let i = 0; i < data.length; i++) {
    let x = data[i];
    for (let j = 1; j < taps.length && j <= i; j++) x -= taps[j] * out[i - j];
    out[i] = mod(x * inv);
  }
  return out;
}

/** @param {number[]} plain @param {number[]} taps */
function encode(plain, taps) {
  return plain.map((_, i) => {
    let v = 0;
    for (let j = 0; j < taps.length && j <= i; j++) v += taps[j] * plain[i - j];
    return mod(v);
  });
}

/** @param {number[]} symbols */
function toBytes(symbols) {
  let value = 0n;
  for (const rune of symbols) {
    assert(Number.isInteger(rune) && rune >= 0 && rune < 29);
    value = value * 29n + BigInt(rune);
  }
  if (value === 0n) return Buffer.alloc(0);
  let hex = value.toString(16);
  if (hex.length % 2) hex = "0" + hex;
  return Buffer.from(hex, "hex");
}

/** @param {Buffer} bytes */
function fromBytes(bytes) {
  let value = BigInt("0x" + bytes.toString("hex"));
  const out = [];
  while (value) {
    out.unshift(Number(value % 29n));
    value /= 29n;
  }
  return out;
}

/** @param {Buffer} bytes */
function proseQuality(bytes) {
  if (bytes.length < 64) return false;
  let readable = 0;
  for (const b of bytes) {
    if ((b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13) readable++;
  }
  if (readable / bytes.length < 0.85) return false;
  const text = bytes.toString("latin1").toUpperCase();
  return /\\b(THE|AND|YOU|OUR|WITH|THIS|FROM)\\b/.test(text);
}

const directions = [
  ["H", [3, 26, 24]],
  ["Hr", [24, 26, 3]],
  ["G", [27, 5, 15]],
  ["Gr", [15, 5, 27]],
  ["HG", [23, 21, 11, 17, 12]],
  ["HGr", [12, 17, 11, 21, 23]]
];
const digestTarget = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4";
const summary = {models: 0, rawInflates: [], pgpZipInflates: [], actualProse: [],
  digestMatches: [], positiveRawPlants: 0, positivePgpZipPlants: 0};
for (const [name, taps] of directions) {
  for (const unit of units) {
    const candidate = decode(unit.symbols, taps);
    assert.deepEqual(encode(candidate, taps), unit.symbols);
    const bytes = toBytes(candidate);
    summary.models++;
    const kinds = [["raw", bytes]];
    // RFC 4880 ZIP compressed packet body: algorithm octet 1, then
    // raw DEFLATE. No discretionary skip offsets.
    if (bytes[0] === 1) kinds.push(["pgp-zip-body", bytes.subarray(1)]);
    for (const [kind, input] of kinds) {
      try {
        const out = zlib.inflateRawSync(input, {maxOutputLength: 1048576});
        const item = {key: name, unit: unit.label, bytesIn: input.length,
          bytesOut: out.length, prefix: out.subarray(0, 70).toString("hex")};
        if (kind === "raw") summary.rawInflates.push(item);
        else summary.pgpZipInflates.push(item);
        if (proseQuality(out)) summary.actualProse.push({
          ...item, textPrefix: out.subarray(0, 180).toString("latin1")
        });
        for (const algorithm of ["sha512", "sha3-512", "blake2b512"]) {
          if (crypto.createHash(algorithm).update(out).digest("hex") === digestTarget)
            summary.digestMatches.push({key: name, unit: unit.label, kind, algorithm});
        }
      } catch (err) {
        assert(err instanceof Error);
      }
    }
  }

  // Actual solved p57 vocabulary, compressed as true RFC1951 DEFLATE.
  const prose = Buffer.from(
    "LIKE THE INSTAR TUNNELING TO THE SURFACE. " +
    "WE MUST SHED OUR OWN CIRCUMFERENCES. " +
    "FIND THE DIVINITY WITHIN AND EMERGE.",
    "utf8"
  );
  const compressed = zlib.deflateRawSync(prose);
  const digitSource = fromBytes(compressed);
  assert(digitSource.length < 200);
  const plant = Array(200 - digitSource.length).fill(0).concat(digitSource);
  const recovered = toBytes(decode(encode(plant, taps), taps));
  assert.deepEqual(zlib.inflateRawSync(recovered), prose);
  summary.positiveRawPlants++;
  const pgpZipBody = Buffer.concat([Buffer.from([1]), compressed]);
  const pgpDigits = fromBytes(pgpZipBody);
  assert(pgpDigits.length < 200);
  const pgpPlant = Array(200 - pgpDigits.length).fill(0).concat(pgpDigits);
  const recoveredPgp = toBytes(decode(encode(pgpPlant, taps), taps));
  assert.equal(recoveredPgp[0], 1);
  assert.deepEqual(zlib.inflateRawSync(recoveredPgp.subarray(1)), prose);
  summary.positivePgpZipPlants++;
}
assert.equal(summary.models, 390);
assert.equal(summary.positiveRawPlants, 6);
assert.equal(summary.positivePgpZipPlants, 6);
console.log(JSON.stringify({
  model: "source causal H/G/HG -> GP29 integer -> RFC1951 raw DEFLATE",
  status: summary.actualProse.length ? "PLAINTEXT CANDIDATE REQUIRES VERIFICATION" : "no qualifying original plaintext",
  ...summary
}, null, 2));
if (summary.actualProse.length) process.exitCode = 2;
