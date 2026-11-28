"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8").replace(/\r/g, "");

const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const p27 = read("im-results/lp2-p27-red13-dh-radix-transducer.md");

const body = signed.split("Hash: SHA1\n\n")[1].split("\n\n-----BEGIN PGP SIGNATURE-----")[0];
const words = body.match(/[A-Za-z]+/g).map((w) => w.toUpperCase());
assert.equal(words.length, 43);
assert.equal(words[23], "ROAD"); // zero-origin index23 == one-based word24
assert.equal(words[29], "DIRECTION");

const tokens = grid.pages.flatMap((p) => p.tokens);
assert.equal(tokens.length, 256);
const a60 = grid.alphabet;
const a59 = a60.replace("f", "");
assert.equal(a60.length, 60);
assert.equal(a59.length, 59);

function decode(token, alphabet) {
  const hi = alphabet.indexOf(token[0]);
  const lo = alphabet.indexOf(token[1]);
  assert.ok(hi >= 0 && lo >= 0, `token ${token} outside alphabet`);
  return hi * alphabet.length + lo;
}

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
}

const primes = [];
for (let n = 2; primes.length < 256; n += 1) if (isPrime(n)) primes.push(n);
const primeRank = new Map(primes.map((p, i) => [p, i + 1]));

function anchor(cell, rank) {
  const v59 = decode(tokens[cell], a59);
  const v60 = decode(tokens[cell], a60);
  return {
    cell, rank, token: tokens[cell], v59, v60,
    rank59: primeRank.get(v59) || null,
    rank60: primeRank.get(v60) || null,
  };
}

const zeroRoad = anchor(41, 23);
const oneRoad = anchor(195, 24);
assert.deepEqual(
  { token: zeroRoad.token, v59: zeroRoad.v59, rank59: zeroRoad.rank59, v60: zeroRoad.v60, rank60: zeroRoad.rank60 },
  { token: "1O", v59: 83, rank59: 23, v60: 84, rank60: null }
);
assert.deepEqual(
  { token: oneRoad.token, v59: oneRoad.v59, rank59: oneRoad.rank59, v60: oneRoad.v60, rank60: oneRoad.rank60 },
  { token: "1T", v59: 88, rank59: null, v60: 89, rank60: 24 }
);

// Preserve the known local duality rather than using it as the origin selector.
assert.equal(tokens[23], "1R");
assert.equal(tokens[24], "1n");

function walk(radix, start, steps) {
  const alphabet = radix === 59 ? a59 : a60;
  const out = [start];
  let cur = start;
  for (let i = 0; i < steps; i += 1) {
    cur = decode(tokens[cur], alphabet);
    assert.ok(cur >= 0 && cur < 256);
    out.push(cur);
  }
  return out;
}

const path59 = walk(59, 186, 8);
const path60 = walk(60, 186, 8);
assert.deepEqual(path59, [186,19,33,112,72,161,214,247,189]);
assert.deepEqual(path60, [186,19,33,114,197,115,247,192,0]);
assert.equal(decode(tokens[189], a59), 189); // independent p27 endpoint is a base59 fixed point
assert.equal(tokens[186], "0J");
assert.equal(decode(tokens[186], a59), 19);
assert.equal(decode(tokens[186], a60), 19);
assert.equal(tokens[254], "39");
assert.equal(decode(tokens[254], a59), 186);
assert.equal(decode(tokens[254], a60), 189);

// The independent p27 report predates this signed-origin comparison and charged the larger pointer family.
assert.match(p27, /exactly one original-table hit:\s*base59 forward at8/i);
assert.match(p27, /base59 pointer walk connects those same addresses in the signed server-public count8/i);

console.log(JSON.stringify({
  schema: "lp2-p50-signed-origin-road-radix-v1",
  signedRoad: { zeroOriginRank: 23, oneBasedRank: 24 },
  anchors: { zeroOrigin: zeroRoad, oneBased: oneRoad },
  fixedStart: 186,
  fixedSteps: 8,
  zeroOriginRoadRadix: 59,
  zeroOriginPath: path59,
  zeroOriginEndpoint: path59.at(-1),
  oneBasedRoadRadix: 60,
  oneBasedPath: path60,
  oneBasedEndpoint: path60.at(-1),
  independentlySelectedEndpoint: 189,
  decision: "Under the inferred ROAD->pointer-radix semantic, zero origin reaches the independent p27 endpoint; one-based does not. DIRECTION29 remains conditional."
}, null, 2));
