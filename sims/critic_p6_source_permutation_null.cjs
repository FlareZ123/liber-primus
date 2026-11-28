"use strict";

/**
 * Critic calibration for the post-discovery p6 / 2016 signed-tail selector.
 * Reuses exactly the two finite role families from
 * sims/lp2_p6_source_tail_corridor_selector_sft.cjs.
 *
 * Two conditional nulls:
 *  A. uniformly shuffle the 43 authenticated source-word tokens;
 *  B. keep positions 0..29 fixed, shuffle only the DIRECTION-fold tail 30..42.
 *
 * These tests preserve the original word multiset and each word's paired
 * (GP spelling length, GP0 checksum). They are NOT discovery-wide p-values.
 *
 * node sims/critic_p6_source_permutation_null.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8").replace(/\r/g, "");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const signed = read("resources/historical/cicada2016-4gq25-outguess.asc");
const source = signed.split("-----BEGIN PGP SIGNATURE-----")[0]
  .slice(signed.indexOf("Hello."))
  .split(/[^A-Za-z0-9]+/u)
  .filter(w => /^[A-Za-z]+$/u.test(w))
  .map(w => w.toUpperCase());
assert.equal(source.length, 43);

const tokens = corpus.translit.map((symbol, value) => ({symbol, value}))
  .sort((a, b) => b.symbol.length - a.symbol.length);
function gp(word) {
  const s = word.replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/[KQ]/g, "C").replace(/Z/g, "S").replace(/[^A-Z]/g, "");
  const out = [];
  for (let i = 0; i < s.length;) {
    if (s.startsWith("ING", i)) { out.push(21); i += 3; continue; }
    if (s.startsWith("IO", i)) { out.push(27); i += 2; continue; }
    const found = tokens.find(t => s.startsWith(t.symbol, i));
    assert.ok(found, "unmapped spelling " + s.slice(i));
    out.push(found.value);
    i += found.symbol.length;
  }
  return out;
}
const pairs = source.map(word => {
  const g = gp(word);
  return [g.length, g.reduce((a, b) => a + b, 0) % 29];
});
const mod = n => ((n % 29) + 29) % 29;
const H4 = v => [mod(v[0] - v[3]), mod(v[1] - v[2]),
  mod(v[1] + v[2]), mod(v[0] + v[3])];
const titleLengths = [4, 1, 4, 2];
const W1 = [24, 16, 14, 17], W2 = 19, q = 4;
const lengthRoles = new Set(), gp0Roles = new Set();
for (let i = 0; i < 4; i++)
  for (const si of [-1, 1])
    for (let j = 0; j < 4; j++)
      if (j !== i) for (const sj of [-1, 1]) {
        lengthRoles.add([mod(W1[i] * si), q, W2, mod(W1[j] * sj)].join(","));
        for (let k = 0; k < 4; k++)
          for (const sk of [-1, 1]) {
            const x = mod(W1[i] * si);
            gp0Roles.add([x, mod(W1[j] * sj), x,
              mod(H4(titleLengths)[k] * sk)].join(","));
          }
      }
assert.equal(lengthRoles.size, 48);
assert.equal(gp0Roles.size, 384);

const perms = new Map();
function perm(pre, rest) {
  if (!rest.length) { perms.set(pre.join(","), pre); return; }
  for (let i = 0; i < rest.length; i++)
    perm(pre.concat(rest[i]), rest.slice(0, i).concat(rest.slice(i + 1)));
}
perm([], titleLengths);
const layouts = [...perms.values()].map(a => ({
  name: a.join(","),
  cuts: [0, a[0], a[0] + a[1], a[0] + a[1] + a[2], 11]
}));
assert.equal(layouts.length, 12);

function scan(data) {
  const lengths = new Int32Array(44), gp0s = new Int32Array(44);
  for (let i = 0; i < 43; i++) {
    lengths[i + 1] = lengths[i] + data[i][0];
    gp0s[i + 1] = gp0s[i] + data[i][1];
  }
  let lengthHits = 0, gp0Hits = 0, jointHits = 0, exactHits = 0;
  const lengthStarts = new Uint8Array(33), gp0Starts = new Uint8Array(33);
  for (const {name, cuts} of layouts) for (let start = 0; start < 33; start++) {
    const v = [], w = [];
    for (let k = 0; k < 4; k++) {
      v.push(mod(lengths[start + cuts[k + 1]] - lengths[start + cuts[k]]));
      w.push(mod(gp0s[start + cuts[k + 1]] - gp0s[start + cuts[k]]));
    }
    const l = lengthRoles.has(v.join(","));
    const g = gp0Roles.has(H4(w).join(","));
    if (l) { lengthHits++; lengthStarts[start] = 1; }
    if (g) { gp0Hits++; gp0Starts[start] = 1; }
    if (l && g) {
      jointHits++;
      if (start === 32 && name === "4,1,4,2") exactHits++;
    }
  }
  return {
    lengthHits, gp0Hits, jointHits, exactHits,
    sameStart: lengthStarts.some((x, i) => x && gp0Starts[i])
  };
}

// Deterministic xorshift32, Fisher-Yates shuffles of word-indexed PAIRS.
let state = 0xC1CA3301;
function randomIndex(n) {
  state ^= state << 13;
  state ^= state >>> 17;
  state ^= state << 5;
  return (state >>> 0) % n;
}
function simulate(first, samples) {
  const data = pairs.slice();
  const count = {
    lengthAny: 0, gp0Any: 0, bothAny: 0, sameStart: 0,
    sameLayout: 0, exact: 0, bothUnique: 0, maxJoint: 0
  };
  for (let trial = 0; trial < samples; trial++) {
    for (let i = 42; i > first; i--) {
      const j = first + randomIndex(i - first + 1);
      [data[i], data[j]] = [data[j], data[i]];
    }
    const s = scan(data);
    if (s.lengthHits) count.lengthAny++;
    if (s.gp0Hits) count.gp0Any++;
    if (s.lengthHits && s.gp0Hits) count.bothAny++;
    if (s.sameStart) count.sameStart++;
    if (s.jointHits) count.sameLayout++;
    if (s.exactHits) count.exact++;
    if (s.lengthHits === 1 && s.gp0Hits === 1 && s.jointHits === 1)
      count.bothUnique++;
    count.maxJoint = Math.max(count.maxJoint, s.jointHits);
  }
  return count;
}
assert.deepEqual(scan(pairs), {
  lengthHits: 1, gp0Hits: 1, jointHits: 1, exactHits: 1, sameStart: true
});
const samples = 30000;
const result = {
  status: "PASS", seed: "0xC1CA3301", samplesEach: samples,
  original: scan(pairs), full43: simulate(0, samples), tail13: simulate(30, samples),
  warning: "Conditional word-permutation calibration only; postselection and alternative source/packet/role families uncharged."
};
assert.deepEqual(result.full43, {
  lengthAny: 3918, gp0Any: 5859, bothAny: 779, sameStart: 29,
  sameLayout: 4, exact: 0, bothUnique: 2, maxJoint: 1
});
assert.deepEqual(result.tail13, {
  lengthAny: 1010, gp0Any: 1344, bothAny: 38, sameStart: 7,
  sameLayout: 2, exact: 0, bothUnique: 1, maxJoint: 1
});
console.log(JSON.stringify(result, null, 2));
