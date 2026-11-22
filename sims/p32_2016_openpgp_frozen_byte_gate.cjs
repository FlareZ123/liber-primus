"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const read = (name) => fs.readFileSync(path.join(ROOT, name), "utf8");

/** @param {number[]} sums @param {number} mod @returns {number[]} */
function walk(sums, mod) {
  let state = 0;
  return sums.map(n => (state = (state + n) % mod));
}

/** @param {string} raw @returns {string[]} */
function firstSevenP32Words(raw) {
  const page = raw.split("%")[32].replace(/\/\s*/g, "");
  return page.split(/[.\-&$§]+/u)
    .map(word => [...word].filter(r => /[\u16A0-\u16FF]/u.test(r)).join(""))
    .filter(Boolean).slice(0, 7);
}

function main() {
  const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
  const words = firstSevenP32Words(read("resources/lp2-transcription.txt"));
  const runePrimes = new Map(corpus.runes.map((r, i) => [r, corpus.prime[i]]));
  const sums = words.map(word => [...word].reduce((a, r) => a + runePrimes.get(r), 0));
  assert.deepEqual(sums, [73, 125, 267, 613, 191, 184, 14]);
  assert.equal(corpus.pages.find(p => p.page === 32).runic_count, 121);

  const raw = read("resources/historical/cicada2016-4gq25-outguess.asc");
  const marker = "-----BEGIN PGP SIGNATURE-----";
  const markerAt = raw.indexOf(marker);
  const bodyStart = raw.indexOf("\n\n") + 2;
  const displayed = raw.slice(bodyStart, markerAt).replace(/\n$/, "");
  // RFC4880 section 7.1: dash unescaping, trailing whitespace trimming, CRLF normalization.
  const canonical = displayed.split("\n").map(s =>
    s.replace(/^- /, "").replace(/[ \t]+$/, "")).join("\r\n");
  const base64 = raw.slice(markerAt + marker.length)
    .split("-----END PGP SIGNATURE-----")[0]
    .split("\n").filter(s => s && !s.startsWith("Version:") && !s.startsWith("="))
    .join("");
  const signature = Buffer.from(base64, "base64");
  // Original 2016 signature: old-format tag-2, two-octet body length.
  assert.equal(signature[0], 0x89);
  assert.equal(signature.readUInt16BE(1), signature.length - 3);
  assert.deepEqual([...signature.subarray(3, 7)], [4, 1, 1, 2]);

  assert.equal(raw.length, 1136);
  assert.equal(markerAt, 317);
  assert.equal(canonical.length, 285);
  assert.equal(signature.length, 543);
  const cases = [
    ["archived LF ASCII armour", raw.length, [73, 198, 465, 1078, 133, 317, 331]],
    ["one trailing LF removed", raw.replace(/\n$/, "").length, [73, 198, 465, 1078, 134, 318, 332]],
    ["CRLF ASCII transport", raw.replace(/\n/g, "\r\n").length, [73, 198, 465, 1078, 95, 279, 293]],
    ["signed canonical cleartext", canonical.length, [73, 198, 180, 223, 129, 28, 42]],
    ["decoded OpenPGP signature packet", signature.length, [73, 198, 465, 535, 183, 367, 381]]
  ];
  for (const [label, mod, expected] of cases) {
    const actual = walk(sums, mod);
    assert.deepEqual(actual, expected, label);
    console.log(label + ": length=" + mod + " path=" + actual.join(","));
  }
  console.log("P32 runic word sums=" + sums.join(","));
  console.log("OpenPGP tag=2 version=4 signature-type=1 RSA/SHA1; marker offset=" + markerAt);
  console.log("PASS: the 133/317/331 marker coincidence depends on unauthenticated armour bytes.");
}

main();
