"use strict";
/**
 * Source-selected candidate: source p32 HOME -> BUDS (+5,+5) direct 4-rune delta.
 * Full candidate is unfitted; tests two original intervals, not a decryption.
 * Run: node sims/lp2_p32_home_buds_delta_key_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const src = JSON.parse(fs.readFileSync(path.join(__dirname,
  "../resources/liber-primus/lp2-corpus.json"), "utf8"));
const page = (p) => src.pages.find(v => v.page === p).indices;
const g = page(32);
const home = g.slice(33, 37);
const buds = g.slice(93, 97);
assert.deepEqual(home.map(x => src.translit[x]), ["H", "O", "M", "E"]);
assert.deepEqual(buds.map(x => src.translit[x]), ["B", "U", "D", "S"]);
const key = home.map((x, i) => (buds[i] - x + 29) % 29);
assert.deepEqual(key, [9, 27, 4, 26]);
const decode = (arr, sign) => arr.map((x, i) => (x + sign * key[i % 4] + 29) % 29);
const encode = (arr, sign) => decode(arr, -sign);
const ioc = (a) => {
  const ct = new Array(29).fill(0);
  for (const x of a) ct[x]++;
  return ct.reduce((s, v) => s + v * (v - 1), 0) / (a.length * (a.length - 1));
};
const suffix = g.slice(37);
const heldout = page(55);
const candidates = [];
for (const [interval, original] of [["p32_post_HOME", suffix], ["p55_full", heldout]]) {
  for (const sign of [1, -1]) {
    const output = decode(original, sign);
    assert.deepEqual(encode(output, sign), original);
    candidates.push({
      interval, sign, len: original.length,
      rawIoC: ioc(original), decodedIoC: ioc(output),
      fullOutput: output.map(v => src.translit[v]).join("-")
    });
  }
}
/* The chosen HOME and BUDS cribs make this guaranteed, not validation:
 * subtracting the key from BUDS at same phase reproduces HOME. */
assert.deepEqual(decode(buds, -1), home);
assert.ok(candidates.find(r => r.interval === "p55_full" && r.sign === -1).decodedIoC < 0.04);
assert.ok(candidates.find(r => r.interval === "p32_post_HOME" && r.sign === 1).decodedIoC < 0.05);
console.log(JSON.stringify({
  source: "original p32 tree-linked 11x11 grid; HOME at (3,0), BUDS at (8,5)",
  page32Displacement: 60,
  deltaGP29Key: key,
  deltaKeyTranslit: key.map(v => src.translit[v]).join("-"),
  endpointSelfFitIsTautological: true,
  originalCandidates: candidates,
  conclusion: "No independent native-GP text or source-selected cipher mode"
}, null, 2));
