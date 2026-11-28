"use strict";

/**
 * Origin-invariant overlap of the p50 numeric rank interval 17..24.
 * SFT: node sims/lp2_p50_origin_invariant_maproad_overlap_sft.cjs
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const signed = fs.readFileSync(
  path.join(ROOT, "resources/historical/cicada2016-4gq25-outguess.asc"),
  "utf8"
).replace(/\r\n/g, "\n");

const clear = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .replace(/^-----BEGIN PGP SIGNED MESSAGE-----\nHash: [^\n]+\n\n/u, "");

const words = clear.split(/[^A-Za-z0-9]+/u)
  .filter((x) => /^[A-Za-z]+$/u.test(x))
  .map((x) => x.toUpperCase());

assert.equal(words.length, 43);

const zeroOrigin = words.slice(17, 25);
const oneBased = words.slice(16, 24);

assert.deepEqual(zeroOrigin,
  ["THE","MAP","THEIR","MEANING","IS","THE","ROAD","AND"]);
assert.deepEqual(oneBased,
  ["ARE","THE","MAP","THEIR","MEANING","IS","THE","ROAD"]);

function longestCommonContiguous(a, b) {
  let best = [];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      const run = [];
      for (let k = 0; i + k < a.length && j + k < b.length
        && a[i + k] === b[j + k]; k++) {
        run.push(a[i + k]);
      }
      if (run.length > best.length) best = run;
    }
  }
  return best;
}

const overlap = longestCommonContiguous(zeroOrigin, oneBased);
assert.deepEqual(overlap,
  ["THE","MAP","THEIR","MEANING","IS","THE","ROAD"]);
assert.equal(overlap.length, 7);

console.log(JSON.stringify({
  interval: [17,24],
  zeroOrigin,
  oneBased,
  commonContiguousWords: overlap.length,
  overlap: overlap.join(" ")
}, null, 2));
